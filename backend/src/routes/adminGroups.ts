import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { groups } from '../mockData/groups';
import { mentors } from '../mockData/mentors';
import { topicsByGroup } from '../mockData/topics';
import { githubByGroup } from '../mockData/github';
import { preferencesByGroup } from '../mockData/preferences';

const router = Router();

// All routes require admin (BR-17)
router.use(requireAuth, requireRole('admin'));

function toAdminGroup(g: typeof groups[0]) {
  const mentorRecord = g.mentorId ? mentors.find(m => m.id === g.mentorId) : null;
  const topicData = topicsByGroup[g.id];
  const githubData = githubByGroup[g.id];

  // Derive AdminPipelineStage from PipelineStage
  let stage: 'awaiting_allocation' | 'mentor_assigned' | 'topic_review' | 'building';
  if (g.stage === 'registered')       stage = 'awaiting_allocation';
  else if (g.stage === 'mentor_assigned') stage = 'mentor_assigned';
  else if (g.stage === 'topic_approved') stage = 'topic_review';
  else stage = 'building';

  // Collect all shortlist entries (from any round)
  const preferences = [
    ...(preferencesByGroup[`${g.id}-1`]?.entries ?? []),
    ...(preferencesByGroup[`${g.id}-2`]?.entries ?? []),
  ];

  return {
    id:             g.id,
    projectId:      g.projectId,
    name:           g.name,
    memberCount:    g.members.length,
    elective:       g.electiveTwo,
    mentorId:       g.mentorId,
    mentorName:     mentorRecord?.name ?? null,
    topicStatus:    topicData?.currentStatus ?? 'none',
    githubConnected: githubData?.connected ?? false,
    stage,
    preferences,
  };
}

// GET /api/admin/groups
router.get('/', (req, res) => {
  const { search, stage, topicStatus, elective } = req.query;
  const page  = parseInt(req.query.page as string)  || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  let result = groups.map(toAdminGroup);

  if (search)      result = result.filter(g => g.name.toLowerCase().includes((search as string).toLowerCase()) || g.projectId.toLowerCase().includes((search as string).toLowerCase()));
  if (stage)       result = result.filter(g => g.stage === stage);
  if (topicStatus) result = result.filter(g => g.topicStatus === topicStatus);
  if (elective)    result = result.filter(g => g.elective.toLowerCase().includes((elective as string).toLowerCase()));

  const total = result.length;
  const paged = result.slice((page - 1) * limit, page * limit);
  res.json({ groups: paged, total });
});

// GET /api/admin/groups/export.csv
router.get('/export.csv', (req, res) => {
  const rows = groups.map(toAdminGroup);
  const headers = ['projectId', 'name', 'memberCount', 'elective', 'mentorName', 'topicStatus', 'githubConnected', 'stage'];
  const csv = [
    headers.join(','),
    ...rows.map(r => headers.map(h => JSON.stringify((r as any)[h] ?? '')).join(',')),
  ].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="groups.csv"');
  res.send(csv);
});

export default router;

