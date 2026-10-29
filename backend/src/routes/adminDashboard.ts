import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { groups } from '../mockData/groups';
import { mentors } from '../mockData/mentors';
import { topicsByGroup } from '../mockData/topics';
import { githubByGroup } from '../mockData/github';

const router = Router();

// All routes require admin (BR-17)
router.use(requireAuth, requireRole('admin'));

// GET /api/admin/dashboard
router.get('/dashboard', (req, res) => {
  const totalGroups        = groups.length;
  const awaitingAllocation = groups.filter(g => !g.mentorId).length;
  const pendingTopics      = groups.filter(g => {
    const td = topicsByGroup[g.id];
    return td && td.currentStatus === 'pending';
  }).length;
  const githubConnected    = groups.filter(g => githubByGroup[g.id]?.connected).length;

  // Pipeline stage distribution
  const stageCounts: Record<string, number> = {
    awaiting_allocation: 0,
    mentor_assigned:     0,
    topic_review:        0,
    building:            0,
  };
  for (const g of groups) {
    if (g.stage === 'registered')        stageCounts['awaiting_allocation']++;
    else if (g.stage === 'mentor_assigned') stageCounts['mentor_assigned']++;
    else if (g.stage === 'topic_approved')  stageCounts['topic_review']++;
    else                                    stageCounts['building']++;
  }
  const pipelineDistribution = Object.entries(stageCounts).map(([stage, count]) => ({ stage, count }));

  // Groups needing attention: unassigned OR pending topic review
  const attentionNeeded = groups
    .filter(g => !g.mentorId || (topicsByGroup[g.id]?.currentStatus === 'pending'))
    .slice(0, 5)
    .map(g => {
      const mentorRecord = g.mentorId ? mentors.find(m => m.id === g.mentorId) : null;
      return {
        id: g.id, projectId: g.projectId, name: g.name, memberCount: g.members.length,
        elective: g.electiveTwo, mentorId: g.mentorId, mentorName: mentorRecord?.name ?? null,
        topicStatus: topicsByGroup[g.id]?.currentStatus ?? 'none',
        githubConnected: githubByGroup[g.id]?.connected ?? false,
        stage: !g.mentorId ? 'awaiting_allocation' : 'mentor_assigned',
        preferences: [],
      };
    });

  // Mentor load
  const mentorLoad = mentors.map(m => ({
    mentorId: m.id,
    name:     m.name,
    current:  m.currentLoad,
    capacity: m.capacity,
  }));

  res.json({
    stats: { totalGroups, awaitingAllocation, pendingTopics, githubConnected },
    pipelineDistribution,
    attentionNeeded,
    mentorLoad,
  });
});

export default router;

