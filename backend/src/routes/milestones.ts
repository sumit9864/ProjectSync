import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { milestonesByGroup } from '../mockData/milestones';
import { getGroupByOwner } from '../mockData/groups';
import { writeAudit } from '../lib/audit';

const router = Router();

// GET /api/milestones/mine
router.get('/mine', requireAuth, requireRole('student'), (req, res) => {
  const group = getGroupByOwner(req.user!.userId);
  if (!group) {
    res.json({ milestones: [] });
    return;
  }
  res.json({ milestones: milestonesByGroup[group.id] ?? [] });
});

// POST /api/milestones/:milestoneId/checkin
router.post('/:milestoneId/checkin', requireAuth, requireRole('student'), (req, res) => {
  const group = getGroupByOwner(req.user!.userId);
  if (!group) {
    res.status(422).json({ error: { code: 'BUSINESS_RULE', message: 'You must be in a group to check in a milestone.' } });
    return;
  }

  const milestones = milestonesByGroup[group.id] ?? [];
  const idx = milestones.findIndex(m => m.id === req.params.milestoneId);

  if (idx === -1) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Milestone not found.' } });
    return;
  }

  // BR-11: Milestone check-in must be sequential (N-1 must be complete first)
  if (idx > 0 && milestones[idx - 1].status !== 'complete') {
    res.status(422).json({ error: { code: 'BUSINESS_RULE', message: `BR-11: You must complete milestone #${milestones[idx - 1].number} before checking in this one.` } });
    return;
  }

  const milestone = milestones[idx];
  milestone.status = 'complete';
  milestone.checkInNote = req.body.note;
  milestone.checkedInAt = new Date().toISOString();

  writeAudit({
    actor: req.user!.name,
    group: group.name,
    description: `Group ${group.name} checked in milestone #${milestone.number}: ${milestone.title}`,
  });

  res.json({ milestone });
});

export default router;

