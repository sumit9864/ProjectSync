/**
 * routes/logbook.ts
 * GET /api/logbook/mine — Team Leader read-only view of their logbook
 */

import { Router }     from 'express';
import { requireAuth }  from '../middleware/auth';
import { requireRole }  from '../middleware/requireRole';
import { db }           from '../lib/db';

const router = Router();

// GET /api/logbook/mine — student read-only
router.get('/mine', requireAuth, requireRole('student'), (req, res) => {
  const group = db.groups.find(g => g.ownerUserId === req.user!.userId);
  if (!group) { res.json({ entries: [] }); return; }
  res.json({ entries: db.logbook[group.id] ?? [] });
});

export default router;
