/**
 * routes/adminGroups.ts
 * GET /api/admin/groups          — Paginated group list with filters
 * GET /api/admin/groups/export.csv
 */

import { Router }     from 'express';
import { requireAuth }  from '../middleware/auth';
import { requireRole }  from '../middleware/requireRole';
import { db }           from '../lib/db';
import type { DbGroup } from '../lib/db';

const router = Router();

// All routes require admin / Project Coordinator (BR-17)
router.use(requireAuth, requireRole('admin'));

function toAdminGroup(g: DbGroup) {
  const mentorRecord = g.mentorId ? db.mentors.find(m => m.id === g.mentorId) : null;
  const topicData    = db.topics[g.id];
  const githubData   = db.github[g.id];

  let stage: 'awaiting_allocation' | 'mentor_assigned' | 'topic_review' | 'building';
  if      (g.stage === 'registered')      stage = 'awaiting_allocation';
  else if (g.stage === 'mentor_assigned') stage = 'mentor_assigned';
  else if (g.stage === 'topic_approved')  stage = 'topic_review';
  else                                    stage = 'building';

  const preferences = [
    ...(db.preferences[`${g.id}-1`]?.entries ?? []),
    ...(db.preferences[`${g.id}-2`]?.entries ?? []),
  ];

  return {
    id:              g.id,
    projectId:       g.projectId,
    name:            g.name,
    memberCount:     g.members.length,
    elective:        g.electiveTwo,
    mentorId:        g.mentorId,
    mentorName:      mentorRecord?.name ?? null,
    topicStatus:     topicData?.currentStatus ?? 'none',
    githubConnected: githubData?.connected ?? false,
    stage,
    preferences,
  };
}

// GET /api/admin/groups
router.get('/', (req, res) => {
  const { search, stage, topicStatus, elective } = req.query;
  const page  = parseInt(req.query.page  as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  let result = db.groups.map(toAdminGroup);

  if (search)      result = result.filter(g => g.name.toLowerCase().includes((search as string).toLowerCase()) || g.projectId.toLowerCase().includes((search as string).toLowerCase()));
  if (stage)       result = result.filter(g => g.stage === stage);
  if (topicStatus) result = result.filter(g => g.topicStatus === topicStatus);
  if (elective)    result = result.filter(g => g.elective.toLowerCase().includes((elective as string).toLowerCase()));

  const total = result.length;
  const paged = result.slice((page - 1) * limit, page * limit);
  res.json({ groups: paged, total });
});

// GET /api/admin/groups/export.csv
router.get('/export.csv', (_req, res) => {
  const rows    = db.groups.map(toAdminGroup);
  const headers = ['projectId', 'name', 'memberCount', 'elective', 'mentorName', 'topicStatus', 'githubConnected', 'stage'];
  const csv     = [
    headers.join(','),
    ...rows.map(r => headers.map(h => JSON.stringify((r as Record<string, unknown>)[h] ?? '')).join(',')),
  ].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="groups.csv"');
  res.send(csv);
});

export default router;
