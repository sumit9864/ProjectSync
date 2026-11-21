/**
 * routes/mentorGroups.ts
 * All /api/mentor/* routes for ProjectGuide (Mentor) role.
 * Uses persistent db — all data survives hot-reloads.
 */

import { Router }     from 'express';
import { requireAuth }  from '../middleware/auth';
import { requireRole }  from '../middleware/requireRole';
import { db, saveDb }   from '../lib/db';
import type { DbLogBookEntry, DbDiscussionMessage, DbTopicData } from '../lib/db';
import { writeAudit }   from '../lib/audit';

const router = Router();

// All mentor routes require mentor role (BR-18)
router.use(requireAuth, requireRole('mentor'));

// ── Helper: map userId → mentor record (via email in db) ──────────────────────
function getMentorRecordId(userId: string): string | null {
  const user   = db.users.find(u => u.id === userId);
  if (!user) return null;
  const mentor = db.mentors.find(m => m.email === user.email);
  return mentor?.id ?? null;
}

function getGroupsByMentor(mentorId: string) {
  return db.groups.filter(g => g.mentorId === mentorId);
}

function getOrCreateTopic(groupId: string): DbTopicData {
  if (!db.topics[groupId]) {
    db.topics[groupId] = { draft: null as any, versions: [], currentStatus: null, discussion: [] };
    saveDb();
  }
  return db.topics[groupId];
}

// ─── F.11 — Mentor Groups ─────────────────────────────────────────────────────

// GET /api/mentor/groups
router.get('/groups', (req, res) => {
  const mentorId = getMentorRecordId(req.user!.userId);
  if (!mentorId) { res.json({ groups: [] }); return; }

  const myGroups = getGroupsByMentor(mentorId).map(g => ({
    id:            g.id,
    projectId:     g.projectId,
    name:          g.name,
    status:        g.stage,
    members:       g.members,
    milestones:    db.milestones[g.id] ?? [],
    topicVersions: db.topics[g.id]?.versions ?? [],
    discussion:    db.topics[g.id]?.discussion ?? [],
    topicDraft:    db.topics[g.id]?.draft ?? null,
  }));

  res.json({ groups: myGroups });
});

// GET /api/mentor/groups/:groupId/topic
router.get('/groups/:groupId/topic', (req, res) => {
  const group = db.groups.find(g => g.id === req.params.groupId);
  if (!group) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Group not found.' } }); return; }
  const data = db.topics[group.id] ?? { draft: null, versions: [], currentStatus: null, discussion: [] };
  res.json({ versions: data.versions, currentStatus: data.currentStatus, draft: data.draft ?? null, discussion: data.discussion });
});

// ─── F.12 — Mentor Topic Decisions ────────────────────────────────────────────

// POST /api/mentor/groups/:groupId/topic/decision
router.post('/groups/:groupId/topic/decision', (req, res) => {
  const group = db.groups.find(g => g.id === req.params.groupId);
  if (!group) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Group not found.' } }); return; }

  // BR-15: Only the group's assigned mentor can make topic decisions
  const mentorId = getMentorRecordId(req.user!.userId);
  if (group.mentorId !== mentorId) {
    res.status(403).json({ error: { code: 'FORBIDDEN', message: 'BR-15: You are not the assigned mentor for this group.' } });
    return;
  }

  const { decision, feedback } = req.body as { decision: 'approved' | 'changes_requested'; feedback?: string };
  const data = db.topics[group.id];

  if (!data || data.versions.length === 0) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'No topic submission found for this group.' } });
    return;
  }

  const latestVersion    = data.versions[data.versions.length - 1];
  latestVersion.status   = decision;
  if (feedback) latestVersion.feedback = feedback;
  data.currentStatus     = decision;

  // Update group pipeline stage if approved
  if (decision === 'approved') {
    const idx = db.groups.findIndex(g => g.id === group.id);
    if (idx !== -1 && db.groups[idx].stage === 'mentor_assigned') {
      db.groups[idx].stage = 'topic_approved';
    }
  }

  saveDb();

  const auditDesc = decision === 'approved'
    ? `Mentor ${req.user!.name} approved topic for ${group.name}`
    : `Mentor ${req.user!.name} requested changes on ${group.name}'s topic`;
  writeAudit({ actor: req.user!.name, group: group.name, description: auditDesc });

  res.json({ version: latestVersion });
});

// POST /api/mentor/groups/:groupId/discussion
router.post('/groups/:groupId/discussion', (req, res) => {
  const group = db.groups.find(g => g.id === req.params.groupId);
  if (!group) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Group not found.' } }); return; }

  const data    = getOrCreateTopic(group.id);
  const message: DbDiscussionMessage = {
    id:          `msg-${Date.now()}`,
    author:      req.user!.name,
    role:        'Mentor',
    avatarColor: 'bg-indigo-500',
    body:        req.body.body,
    time:        new Date().toISOString(),
  };
  data.discussion.push(message);
  saveDb();
  res.status(201).json({ message });
});

// POST /api/mentor/bulk-decision
router.post('/bulk-decision', (req, res) => {
  const { groupIds, decision, feedback } = req.body as {
    groupIds: string[];
    decision: 'approved' | 'changes_requested';
    feedback?: string;
  };

  let updated = 0;
  for (const gid of groupIds) {
    const data = db.topics[gid];
    if (data && data.versions.length > 0) {
      const latest   = data.versions[data.versions.length - 1];
      latest.status  = decision;
      if (feedback) latest.feedback = feedback;
      data.currentStatus = decision;
      updated++;
      const g = db.groups.find(g => g.id === gid);
      if (g) {
        const auditDesc = decision === 'approved'
          ? `Mentor ${req.user!.name} approved topic for ${g.name}`
          : `Mentor ${req.user!.name} requested changes on ${g.name}'s topic`;
        writeAudit({ actor: req.user!.name, group: g.name, description: auditDesc });
      }
    }
  }
  saveDb();
  res.json({ updated });
});

// ─── F.13 — Mentor Log Book ───────────────────────────────────────────────────

// GET /api/mentor/groups/:groupId/logbook
router.get('/groups/:groupId/logbook', (req, res) => {
  const group = db.groups.find(g => g.id === req.params.groupId);
  if (!group) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Group not found.' } }); return; }
  res.json({ entries: db.logbook[group.id] ?? [] });
});

// POST /api/mentor/groups/:groupId/logbook
router.post('/groups/:groupId/logbook', (req, res) => {
  const group = db.groups.find(g => g.id === req.params.groupId);
  if (!group) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Group not found.' } }); return; }

  // BR-14: Only the group's assigned mentor can write logbook entries
  const mentorId = getMentorRecordId(req.user!.userId);
  if (group.mentorId !== mentorId) {
    res.status(403).json({ error: { code: 'FORBIDDEN', message: 'BR-14: You are not the assigned mentor for this group.' } });
    return;
  }

  if (!db.logbook[group.id]) db.logbook[group.id] = [];
  const entries     = db.logbook[group.id];
  const entryNumber = entries.length + 1;

  const { date, attendance, pointsDiscussed, mentorSuggestions, remarks } = req.body;
  const newEntry: DbLogBookEntry = {
    id:                `lb-${Date.now()}`,
    entryNumber,
    date,
    lastEditedAt:      new Date().toISOString(),
    attendance:        attendance.map((a: { memberId: string; present: boolean }) => {
      const member = group.members.find(m => m.id === a.memberId);
      return { name: member?.name ?? a.memberId, present: a.present };
    }),
    pointsDiscussed,
    mentorSuggestions,
    remarks,
  };

  entries.push(newEntry);
  saveDb();

  writeAudit({
    actor:       req.user!.name,
    group:       group.name,
    description: `Mentor ${req.user!.name} created log entry #${entryNumber} for ${group.name}`,
  });

  res.status(201).json({ entry: newEntry });
});

// PUT /api/mentor/groups/:groupId/logbook/:entryId
router.put('/groups/:groupId/logbook/:entryId', (req, res) => {
  const group = db.groups.find(g => g.id === req.params.groupId);
  if (!group) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Group not found.' } }); return; }

  // BR-14
  const mentorId = getMentorRecordId(req.user!.userId);
  if (group.mentorId !== mentorId) {
    res.status(403).json({ error: { code: 'FORBIDDEN', message: 'BR-14: You are not the assigned mentor for this group.' } });
    return;
  }

  const entries = db.logbook[group.id] ?? [];
  const idx     = entries.findIndex(e => e.id === req.params.entryId);
  if (idx === -1) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Log book entry not found.' } }); return; }

  const old = entries[idx];
  if (!old.editHistory) old.editHistory = [];
  old.editHistory.push({
    editedAt:          old.lastEditedAt,
    pointsDiscussed:   old.pointsDiscussed,
    mentorSuggestions: old.mentorSuggestions,
    remarks:           old.remarks,
  });

  const { date, attendance, pointsDiscussed, mentorSuggestions, remarks } = req.body;
  old.date              = date;
  old.attendance        = attendance.map((a: { memberId: string; present: boolean }) => {
    const member = group.members.find(m => m.id === a.memberId);
    return { name: member?.name ?? a.memberId, present: a.present };
  });
  old.pointsDiscussed   = pointsDiscussed;
  old.mentorSuggestions = mentorSuggestions;
  old.remarks           = remarks;
  old.lastEditedAt      = new Date().toISOString();
  saveDb();

  writeAudit({
    actor:       req.user!.name,
    group:       group.name,
    description: `Mentor ${req.user!.name} edited log entry #${old.entryNumber} for ${group.name}`,
  });

  res.json({ entry: old });
});

// ─── F.14 — Mentor Dashboard & Calendar ──────────────────────────────────────

// GET /api/mentor/dashboard
router.get('/dashboard', (req, res) => {
  const mentorId     = getMentorRecordId(req.user!.userId);
  const mentorRecord = db.mentors.find(m => m.id === mentorId);
  const myGroups     = mentorId ? getGroupsByMentor(mentorId) : [];

  const pendingReviews = myGroups.filter(g => db.topics[g.id]?.currentStatus === 'pending').length;

  const mentorGroups = myGroups.map(g => ({
    id:            g.id,
    projectId:     g.projectId,
    name:          g.name,
    status:        g.stage,
    members:       g.members,
    milestones:    db.milestones[g.id] ?? [],
    topicVersions: db.topics[g.id]?.versions ?? [],
    discussion:    db.topics[g.id]?.discussion ?? [],
    topicDraft:    db.topics[g.id]?.draft ?? null,
  }));

  res.json({
    stats: {
      assignedGroups:  myGroups.length,
      pendingReviews,
      avgResponseTime: '1.2 days',
      capacity:        mentorRecord?.capacity ?? 0,
    },
    weekProgress: { reviewed: myGroups.length - pendingReviews, total: myGroups.length },
    groups:       mentorGroups,
  });
});

// GET /api/mentor/calendar
router.get('/calendar', (req, res) => {
  const mentorId = getMentorRecordId(req.user!.userId);
  const myGroups = mentorId ? getGroupsByMentor(mentorId) : [];

  const events: { day: number; title: string; type: 'review' | 'session' | 'deadline' }[] = [];
  for (const g of myGroups) {
    for (const m of db.milestones[g.id] ?? []) {
      events.push({ day: new Date(m.dueDate).getDate(), title: `${g.name}: ${m.title}`, type: 'deadline' });
    }
  }

  const recentActivity = db.auditEvents
    .filter(e => myGroups.some(g => g.name === e.group))
    .slice(0, 5)
    .map(e => ({ id: e.id, group: e.group, action: e.description, time: e.timestamp }));

  res.json({ events, recentActivity });
});

export default router;
