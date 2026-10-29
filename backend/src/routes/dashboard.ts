import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { getGroupByOwner } from '../mockData/groups';
import { mentors } from '../mockData/mentors';
import { milestonesByGroup } from '../mockData/milestones';
import { auditEvents } from '../mockData/audit';

const router = Router();

// GET /api/dashboard/student
router.get('/student', requireAuth, requireRole('student'), (req, res) => {
  const group = getGroupByOwner(req.user!.userId);

  if (!group) {
    res.json({
      projectProgress: 0,
      groupHealth: 'not_registered',
      groupName: null,
      teamMembers: [],
      assignedMentor: null,
      nextDeadline: null,
      completedPipelineStages: [],
      recentActivity: [],
      upcomingDeadlines: [],
    });
    return;
  }

  const milestones = milestonesByGroup[group.id] ?? [];
  const completedMilestones = milestones.filter(m => m.status === 'complete');
  const projectProgress = milestones.length > 0 ? Math.round((completedMilestones.length / milestones.length) * 100) : 0;

  // Next upcoming deadline
  const now = new Date();
  const upcoming = milestones
    .filter(m => m.status !== 'complete')
    .map(m => {
      const due = new Date(m.dueDate);
      const daysLeft = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return { id: m.id, title: m.title, date: m.dueDate, daysLeft, page: '/milestones' };
    })
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const nextDeadline = upcoming[0] ?? null;

  // Assigned mentor
  const mentor = group.mentorId ? mentors.find(m => m.id === group.mentorId) ?? null : null;

  // Pipeline stages completed
  const stageOrder = ['registered', 'mentor_assigned', 'topic_approved', 'github_connected'];
  const currentStageIdx = stageOrder.indexOf(group.stage);
  const completedPipelineStages = stageOrder.slice(0, currentStageIdx + 1);

  // Group health — simple heuristic based on overdue milestones
  const overdue = milestones.filter(m => m.status !== 'complete' && new Date(m.dueDate) < now).length;
  const groupHealth = overdue === 0 ? 'on_track' : overdue === 1 ? 'at_risk' : 'behind';

  // Recent activity from audit log — filter to this group
  const recentActivity = auditEvents
    .filter(e => e.group === group.name)
    .slice(0, 5)
    .map((e, i) => ({ id: e.id, action: e.description, actor: e.actor, time: e.timestamp, icon: 'activity' }));

  res.json({
    projectProgress,
    groupHealth,
    groupName: group.name,
    teamMembers: group.members,
    assignedMentor: mentor ? { name: mentor.name, domain: mentor.domain } : null,
    nextDeadline,
    completedPipelineStages,
    recentActivity,
    upcomingDeadlines: upcoming,
  });
});

export default router;

