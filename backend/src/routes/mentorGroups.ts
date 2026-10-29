import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { groups, getGroupsByMentor } from '../mockData/groups';
import { topicsByGroup, TopicVersion, DiscussionMessage, TopicData } from '../mockData/topics';
import { logbookByGroup, LogBookEntry } from '../mockData/logbook';
import { milestonesByGroup } from '../mockData/milestones';
import { mentors } from '../mockData/mentors';
import { auditEvents } from '../mockData/audit';
import { writeAudit } from '../lib/audit';
import { demoUsers } from '../mockData/auth';

const router = Router();

// All mentor routes require mentor role (BR-18)
router.use(requireAuth, requireRole('mentor'));

// ─── Helper: find mentor's ID from demoUsers ──────────────────────────────────
// The mock mentor user id maps to mentor record id via email
function getMentorRecordId(userId: string): string | null {
  const user = demoUsers.find(u => u.id === userId);
  if (!user) return null;
  const mentor = mentors.find(m => m.email === user.email);
  return mentor?.id ?? null;
}

// ─── F.11 — Mentor Groups ─────────────────────────────────────────────────────

// GET /api/mentor/groups
router.get('/groups', (req, res) => {
  const mentorId = getMentorRecordId(req.user!.userId);
  if (!mentorId) {
    res.json({ groups: [] });
    return;
  }

  const myGroups = getGroupsByMentor(mentorId);
  const mentorGroups = myGroups.map(g => {
    const topicData = topicsByGroup[g.id] ?? { draft: null, versions: [], currentStatus: null, discussion: [] };
    const milestones = milestonesByGroup[g.id] ?? [];
    return {
      id:            g.id,
      projectId:     g.projectId,
      name:          g.name,
      status:        g.stage,
      members:       g.members,
      milestones,
      topicVersions: topicData.versions,
      discussion:    topicData.discussion,
      topicDraft:    topicData.draft ?? null,
    };
  });

  res.json({ groups: mentorGroups });
});

// GET /api/mentor/groups/:groupId/topic
router.get('/groups/:groupId/topic', (req, res) => {
  const group = groups.find(g => g.id === req.params.groupId);
  if (!group) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Group not found.' } });
    return;
  }

  const mentorId = getMentorRecordId(req.user!.userId);
  const data = topicsByGroup[group.id] ?? { draft: null, versions: [], currentStatus: null, discussion: [] };
  res.json({
    versions:      data.versions,
    currentStatus: data.currentStatus,
    draft:         data.draft ?? null,
    discussion:    data.discussion,
  });
});

// ─── F.12 — Mentor Topic Decisions ────────────────────────────────────────────

// POST /api/mentor/groups/:groupId/topic/decision
router.post('/groups/:groupId/topic/decision', (req, res) => {
  const group = groups.find(g => g.id === req.params.groupId);
  if (!group) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Group not found.' } });
    return;
  }

  // BR-15: Only the group's assigned mentor can make topic decisions
  const mentorId = getMentorRecordId(req.user!.userId);
  if (group.mentorId !== mentorId) {
    res.status(403).json({ error: { code: 'FORBIDDEN', message: 'BR-15: You are not the assigned mentor for this group.' } });
    return;
  }

  const { decision, feedback } = req.body as { decision: 'approved' | 'changes_requested'; feedback?: string };
  const data = topicsByGroup[group.id];

  if (!data || data.versions.length === 0) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'No topic submission found for this group.' } });
    return;
  }

  // Update the latest version status
  const latestVersion = data.versions[data.versions.length - 1];
  latestVersion.status = decision;
  if (feedback) latestVersion.feedback = feedback;
  data.currentStatus = decision;

  // Update group pipeline stage if approved
  if (decision === 'approved') {
    const idx = groups.findIndex(g => g.id === group.id);
    if (idx !== -1 && groups[idx].stage === 'mentor_assigned') {
      groups[idx].stage = 'topic_approved';
    }
  }

  const auditDesc = decision === 'approved'
    ? `Mentor ${req.user!.name} approved topic for ${group.name}`
    : `Mentor ${req.user!.name} requested changes on ${group.name}'s topic`;

  writeAudit({ actor: req.user!.name, group: group.name, description: auditDesc });

  res.json({ version: latestVersion });
});

// POST /api/mentor/groups/:groupId/discussion
router.post('/groups/:groupId/discussion', (req, res) => {
  const group = groups.find(g => g.id === req.params.groupId);
  if (!group) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Group not found.' } });
    return;
  }

  if (!topicsByGroup[group.id]) {
    topicsByGroup[group.id] = { draft: null as any, versions: [], currentStatus: null, discussion: [] };
  }

  const message: DiscussionMessage = {
    id:          `msg-${Date.now()}`,
    author:      req.user!.name,
    role:        'Mentor',
    avatarColor: 'bg-indigo-500',
    body:        req.body.body,
    time:        new Date().toISOString(),
  };
  topicsByGroup[group.id].discussion.push(message);
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
    const data = topicsByGroup[gid];
    if (data && data.versions.length > 0) {
      const latest = data.versions[data.versions.length - 1];
      latest.status = decision;
      if (feedback) latest.feedback = feedback;
      data.currentStatus = decision;
      updated++;
      const g = groups.find(g => g.id === gid);
      if (g) {
        const auditDesc = decision === 'approved'
          ? `Mentor ${req.user!.name} approved topic for ${g.name}`
          : `Mentor ${req.user!.name} requested changes on ${g.name}'s topic`;
        writeAudit({ actor: req.user!.name, group: g.name, description: auditDesc });
      }
    }
  }

  res.json({ updated });
});

// ─── F.13 — Mentor Log Book ───────────────────────────────────────────────────

// GET /api/mentor/groups/:groupId/logbook
router.get('/groups/:groupId/logbook', (req, res) => {
  const group = groups.find(g => g.id === req.params.groupId);
  if (!group) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Group not found.' } });
    return;
  }
  res.json({ entries: logbookByGroup[group.id] ?? [] });
});

// POST /api/mentor/groups/:groupId/logbook
router.post('/groups/:groupId/logbook', (req, res) => {
  const group = groups.find(g => g.id === req.params.groupId);
  if (!group) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Group not found.' } });
    return;
  }

  // BR-14: Only the group's assigned mentor can write logbook entries
  const mentorId = getMentorRecordId(req.user!.userId);
  if (group.mentorId !== mentorId) {
    res.status(403).json({ error: { code: 'FORBIDDEN', message: 'BR-14: You are not the assigned mentor for this group.' } });
    return;
  }

  if (!logbookByGroup[group.id]) logbookByGroup[group.id] = [];
  const entries = logbookByGroup[group.id];
  const entryNumber = entries.length + 1;

  const { date, attendance, pointsDiscussed, mentorSuggestions, remarks } = req.body;
  const newEntry: LogBookEntry = {
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

  writeAudit({
    actor:       req.user!.name,
    group:       group.name,
    description: `Mentor ${req.user!.name} created log entry #${entryNumber} for ${group.name}`,
  });

  res.status(201).json({ entry: newEntry });
});

// PUT /api/mentor/groups/:groupId/logbook/:entryId
router.put('/groups/:groupId/logbook/:entryId', (req, res) => {
  const group = groups.find(g => g.id === req.params.groupId);
  if (!group) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Group not found.' } });
    return;
  }

  // BR-14: Only the group's assigned mentor can write logbook entries
  const mentorId = getMentorRecordId(req.user!.userId);
  if (group.mentorId !== mentorId) {
    res.status(403).json({ error: { code: 'FORBIDDEN', message: 'BR-14: You are not the assigned mentor for this group.' } });
    return;
  }

  const entries = logbookByGroup[group.id] ?? [];
  const idx = entries.findIndex(e => e.id === req.params.entryId);
  if (idx === -1) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Log book entry not found.' } });
    return;
  }

  const old = entries[idx];
  // Archive previous values into editHistory
  if (!old.editHistory) old.editHistory = [];
  old.editHistory.push({
    editedAt:          old.lastEditedAt,
    pointsDiscussed:   old.pointsDiscussed,
    mentorSuggestions: old.mentorSuggestions,
    remarks:           old.remarks,
  });

  const { date, attendance, pointsDiscussed, mentorSuggestions, remarks } = req.body;
  old.date = date;
  old.attendance = attendance.map((a: { memberId: string; present: boolean }) => {
    const member = group.members.find(m => m.id === a.memberId);
    return { name: member?.name ?? a.memberId, present: a.present };
  });
  old.pointsDiscussed   = pointsDiscussed;
  old.mentorSuggestions = mentorSuggestions;
  old.remarks           = remarks;
  old.lastEditedAt      = new Date().toISOString();

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
  const mentorId = getMentorRecordId(req.user!.userId);
  const mentorRecord = mentors.find(m => m.id === mentorId);
  const myGroups = mentorId ? getGroupsByMentor(mentorId) : [];

  // Pending reviews = groups with currentStatus === 'pending'
  const pendingReviews = myGroups.filter(g => {
    const data = topicsByGroup[g.id];
    return data && data.currentStatus === 'pending';
  }).length;

  const mentorGroups = myGroups.map(g => {
    const topicData = topicsByGroup[g.id] ?? { draft: null, versions: [], currentStatus: null, discussion: [] };
    const milestones = milestonesByGroup[g.id] ?? [];
    return {
      id:            g.id,
      projectId:     g.projectId,
      name:          g.name,
      status:        g.stage,
      members:       g.members,
      milestones,
      topicVersions: topicData.versions,
      discussion:    topicData.discussion,
      topicDraft:    topicData.draft ?? null,
    };
  });

  res.json({
    stats: {
      assignedGroups:    myGroups.length,
      pendingReviews,
      avgResponseTime:   '1.2 days',
      capacity:          mentorRecord?.capacity ?? 0,
    },
    weekProgress: { reviewed: myGroups.length - pendingReviews, total: myGroups.length },
    groups:        mentorGroups,
  });
});

// GET /api/mentor/calendar
router.get('/calendar', (req, res) => {
  const mentorId = getMentorRecordId(req.user!.userId);
  const myGroups = mentorId ? getGroupsByMentor(mentorId) : [];

  // Build calendar events from milestones
  const events: { day: number; title: string; type: 'review' | 'session' | 'deadline' }[] = [];
  for (const g of myGroups) {
    const milestones = milestonesByGroup[g.id] ?? [];
    for (const m of milestones) {
      const day = new Date(m.dueDate).getDate();
      events.push({ day, title: `${g.name}: ${m.title}`, type: 'deadline' });
    }
  }

  // Recent activity
  const recentActivity = auditEvents
    .filter(e => myGroups.some(g => g.name === e.group))
    .slice(0, 5)
    .map(e => ({ group: e.group, action: e.description, time: e.timestamp }));

  res.json({ events, recentActivity });
});

export default router;

