/**
 * routes/notifications.ts
 * GET  /api/notifications         — Current user's notification list
 * POST /api/notifications/:id/read — Mark one as read
 */

import { Router }     from 'express';
import { requireAuth }  from '../middleware/auth';
import { db, saveDb }   from '../lib/db';

const router = Router();

// GET /api/notifications
router.get('/', requireAuth, (req, res) => {
  const notifications = db.notifications[req.user!.userId] ?? [];
  res.json({ notifications });
});

// POST /api/notifications/:id/read
router.post('/:id/read', requireAuth, (req, res) => {
  const notifications = db.notifications[req.user!.userId] ?? [];
  const notif         = notifications.find(n => n.id === req.params.id);
  if (!notif) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Notification not found.' } });
    return;
  }
  notif.read = true;
  saveDb();
  res.json({ notification: notif });
});

export default router;
