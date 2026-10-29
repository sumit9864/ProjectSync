import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { allocationHistory, AllocationResult, AllocationHistoryEntry } from '../mockData/allocation';
import { groups } from '../mockData/groups';
import { mentors } from '../mockData/mentors';
import { preferencesByGroup } from '../mockData/preferences';
import { writeAudit } from '../lib/audit';

const router = Router();

// All routes require admin (BR-17)
router.use(requireAuth, requireRole('admin'));

// GET /api/admin/allocation/history
router.get('/history', (req, res) => {
  res.json({ history: allocationHistory });
});

// POST /api/admin/allocation/run
router.post('/run', (req, res) => {
  const { round } = req.body as { round: 1 | 2 };

  // BR-13: Round 2 cannot run until round 1 has been run
  if (round === 2) {
    const round1Ran = allocationHistory.some(h => h.round === 1);
    if (!round1Ran) {
      res.status(422).json({ error: { code: 'BUSINESS_RULE', message: 'BR-13: Round 1 allocation must be run before round 2.' } });
      return;
    }
  }

  const results: AllocationResult[] = [];
  // Simple greedy algorithm: iterate groups without a mentor and match by highest preference rank
  for (const group of groups) {
    if (group.mentorId) {
      // Already assigned
      results.push({ groupId: group.id, groupName: group.name, status: 'assigned', matchedMentorId: group.mentorId });
      continue;
    }
    const key = `${group.id}-${round}`;
    const submission = preferencesByGroup[key];
    if (!submission) {
      results.push({ groupId: group.id, groupName: group.name, status: 'unassigned' });
      continue;
    }

    // Try to assign best available mentor by rank
    const sorted = [...submission.entries].sort((a, b) => a.rank - b.rank);
    let assigned = false;
    for (const entry of sorted) {
      const mentor = mentors.find(m => m.id === entry.mentorId);
      if (mentor && mentor.currentLoad < mentor.capacity) {
        group.mentorId = mentor.id;
        group.stage    = 'mentor_assigned';
        mentor.currentLoad++;
        results.push({ groupId: group.id, groupName: group.name, status: 'assigned', matchedMentorId: mentor.id, matchedRank: entry.rank });
        writeAudit({
          actor:       'System',
          group:       group.name,
          description: `Mentor ${mentor.name} assigned to ${group.name} (Round ${round}, Rank ${entry.rank})`,
        });
        assigned = true;
        break;
      }
    }
    if (!assigned) {
      results.push({ groupId: group.id, groupName: group.name, status: 'unassigned' });
    }
  }

  const historyEntry: AllocationHistoryEntry = {
    id:             `alloc-hist-${Date.now()}`,
    round,
    ranAt:          new Date().toISOString(),
    results,
    assignedCount:   results.filter(r => r.status === 'assigned').length,
    unassignedCount: results.filter(r => r.status === 'unassigned').length,
  };
  allocationHistory.push(historyEntry);

  res.json({ results, historyEntry });
});

// POST /api/admin/allocation/manual
router.post('/manual', (req, res) => {
  const { groupId, mentorId } = req.body as { groupId: string; mentorId: string };

  const group = groups.find(g => g.id === groupId);
  if (!group) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Group not found.' } });
    return;
  }

  const mentor = mentors.find(m => m.id === mentorId);
  if (!mentor) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Mentor not found.' } });
    return;
  }

  if (mentor.currentLoad >= mentor.capacity) {
    res.status(422).json({ error: { code: 'BUSINESS_RULE', message: `Mentor ${mentor.name} is at full capacity.` } });
    return;
  }

  // Release previous mentor if any
  if (group.mentorId) {
    const prev = mentors.find(m => m.id === group.mentorId);
    if (prev) prev.currentLoad = Math.max(0, prev.currentLoad - 1);
  }

  group.mentorId = mentor.id;
  group.stage    = 'mentor_assigned';
  mentor.currentLoad++;

  writeAudit({
    actor:       req.user!.name,
    group:       group.name,
    description: `Admin manually assigned ${mentor.name} to ${group.name}`,
  });

  const result: AllocationResult = {
    groupId:         group.id,
    groupName:       group.name,
    status:          'assigned',
    matchedMentorId: mentor.id,
  };
  res.json({ result });
});

export default router;

