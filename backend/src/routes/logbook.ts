import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { logbookByGroup } from '../mockData/logbook';
import { getGroupByOwner } from '../mockData/groups';

const router = Router();

// GET /api/logbook/mine — student read-only
router.get('/mine', requireAuth, requireRole('student'), (req, res) => {
  const group = getGroupByOwner(req.user!.userId);
  if (!group) {
    res.json({ entries: [] });
    return;
  }
  res.json({ entries: logbookByGroup[group.id] ?? [] });
});

export default router;

