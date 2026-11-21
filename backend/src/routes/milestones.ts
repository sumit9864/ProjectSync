/**
 * routes/milestones.ts
 * GET  /api/milestones/mine              — Team Leader's milestone list
 * POST /api/milestones/:id/checkin       — Check in a milestone
 *
 * Milestones are auto-created (4 per group) when the group first reads them.
 */

import { Router }     from 'express';
import { requireAuth }  from '../middleware/auth';
import { requireRole }  from '../middleware/requireRole';
import { db, saveDb }   from '../lib/db';
import type { DbMilestone } from '../lib/db';
import { writeAudit }   from '../lib/audit';

const router = Router();

const DEFAULT_MILESTONES: Omit<DbMilestone, 'id'>[] = [
  { number: 1, title: 'Problem Definition & Literature Review',  dueDate: '2026-10-15', status: 'incomplete' },
  { number: 2, title: 'System Design & Architecture',            dueDate: '2026-11-15', status: 'incomplete' },
  { number: 3, title: 'Implementation & Unit Testing',           dueDate: '2026-12-15', status: 'incomplete' },
  { number: 4, title: 'Final Demo & Documentation',              dueDate: '2027-01-15', status: 'incomplete' },
];

function getOrCreateMilestones(groupId: string): DbMilestone[] {
  if (!db.milestones[groupId]) {
    db.milestones[groupId] = DEFAULT_MILESTONES.map((m, i) => ({
      ...m,
      id: `ms-${groupId}-${i + 1}`,
    }));
    saveDb();
  }
  return db.milestones[groupId];
}

// GET /api/milestones/mine
router.get('/mine', requireAuth, requireRole('student'), (req, res) => {
  const group = db.groups.find(g => g.ownerUserId === req.user!.userId);
  if (!group) { res.json({ milestones: [] }); return; }
  res.json({ milestones: getOrCreateMilestones(group.id) });
});

// POST /api/milestones/:milestoneId/checkin
router.post('/:milestoneId/checkin', requireAuth, requireRole('student'), (req, res) => {
  const group = db.groups.find(g => g.ownerUserId === req.user!.userId);
  if (!group) {
    res.status(422).json({ error: { code: 'BUSINESS_RULE', message: 'You must be in a group to check in a milestone.' } });
    return;
  }

  const milestones = getOrCreateMilestones(group.id);
  const idx        = milestones.findIndex(m => m.id === req.params.milestoneId);

  if (idx === -1) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Milestone not found.' } });
    return;
  }

  // BR-11: Sequential check-in
  if (idx > 0 && milestones[idx - 1].status !== 'complete') {
    res.status(422).json({ error: { code: 'BUSINESS_RULE', message: `BR-11: You must complete milestone #${milestones[idx - 1].number} before checking in this one.` } });
    return;
  }

  const milestone         = milestones[idx];
  milestone.status        = 'complete';
  milestone.checkInNote   = req.body.note;
  milestone.checkedInAt   = new Date().toISOString();
  saveDb();

  writeAudit({
    actor:       req.user!.name,
    group:       group.name,
    description: `Group ${group.name} checked in milestone #${milestone.number}: ${milestone.title}`,
  });

  res.json({ milestone });
});

export default router;
