import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { auditEvents } from '../mockData/audit';

const router = Router();

// All routes require admin (BR-17)
router.use(requireAuth, requireRole('admin'));

// GET /api/admin/audit
router.get('/', (req, res) => {
  const { search, actor, group } = req.query;
  const page  = parseInt(req.query.page  as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;

  let result = [...auditEvents];
  if (search) result = result.filter(e => e.description.toLowerCase().includes((search as string).toLowerCase()));
  if (actor)  result = result.filter(e => e.actor.toLowerCase().includes((actor as string).toLowerCase()));
  if (group)  result = result.filter(e => e.group.toLowerCase().includes((group as string).toLowerCase()));

  const total = result.length;
  const paged = result.slice((page - 1) * limit, page * limit);
  res.json({ events: paged, total });
});

// GET /api/admin/audit/export.csv
router.get('/export.csv', (req, res) => {
  const headers = ['id', 'timestamp', 'description', 'actor', 'group'];
  const csv = [
    headers.join(','),
    ...auditEvents.map(e => headers.map(h => JSON.stringify((e as any)[h] ?? '')).join(',')),
  ].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="audit.csv"');
  res.send(csv);
});

export default router;

