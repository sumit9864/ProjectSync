/**
 * routes/adminDashboard.ts
 * GET /api/admin/dashboard — Project Coordinator overview stats
 */

import { Router }    from 'express';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { db }          from '../lib/db';

const router = Router();

router.use(requireAuth, requireRole('admin'));

router.get('/dashboard', (_req, res) => {
  const totalGroups        = db.groups.length;
  const awaitingAllocation = db.groups.filter(g => !g.mentorId).length;
  const pendingTopics      = db.groups.filter(g => db.topics[g.id]?.currentStatus === 'pending').length;
  const githubConnected    = db.groups.filter(g => db.github[g.id]?.connected).length;

  const stageCounts: Record<string, number> = {
    awaiting_allocation: 0, mentor_assigned: 0, topic_review: 0, building: 0,
  };
  for (const g of db.groups) {
    if      (g.stage === 'registered')      stageCounts['awaiting_allocation']++;
    else if (g.stage === 'mentor_assigned') stageCounts['mentor_assigned']++;
    else if (g.stage === 'topic_approved')  stageCounts['topic_review']++;
    else                                    stageCounts['building']++;
  }
  const pipelineDistribution = Object.entries(stageCounts).map(([stage, count]) => ({ stage, count }));

  const attentionNeeded = db.groups
    .filter(g => !g.mentorId || db.topics[g.id]?.currentStatus === 'pending')
    .slice(0, 5)
    .map(g => {
      const mentorRecord = g.mentorId ? db.mentors.find(m => m.id === g.mentorId) : null;
      return {
        id: g.id, projectId: g.projectId, name: g.name, memberCount: g.members.length,
        elective: g.electiveTwo, mentorId: g.mentorId, mentorName: mentorRecord?.name ?? null,
        topicStatus: db.topics[g.id]?.currentStatus ?? 'none',
        githubConnected: db.github[g.id]?.connected ?? false,
        stage: !g.mentorId ? 'awaiting_allocation' : 'mentor_assigned',
        preferences: [],
      };
    });

  const mentorLoad = db.mentors.map(m => ({
    mentorId: m.id, name: m.name, current: m.currentLoad, capacity: m.capacity,
  }));

  res.json({ stats: { totalGroups, awaitingAllocation, pendingTopics, githubConnected }, pipelineDistribution, attentionNeeded, mentorLoad });
});

export default router;
