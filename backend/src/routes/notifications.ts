import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { notificationsByUser } from '../mockData/notifications';

const router = Router();

// GET /api/notifications
router.get('/', requireAuth, (req, res) => {
  const notifications = notificationsByUser[req.user!.userId] ?? [];
  res.json({ notifications });
});

// POST /api/notifications/:id/read
router.post('/:id/read', requireAuth, (req, res) => {
  const notifications = notificationsByUser[req.user!.userId] ?? [];
  const notif = notifications.find(n => n.id === req.params.id);
  if (!notif) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Notification not found.' } });
    return;
  }
  notif.read = true;
  res.json({ notification: notif });
});

export default router;

