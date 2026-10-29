import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { windows, extensions, WindowKey, Extension } from '../mockData/windows';
import { groups } from '../mockData/groups';
import { writeAudit } from '../lib/audit';

const router = Router();

// All routes require admin (BR-17)
router.use(requireAuth, requireRole('admin'));

const VALID_KEYS: WindowKey[] = ['registration', 'round1', 'round2'];

// GET /api/admin/windows
router.get('/windows', (req, res) => {
  res.json({ windows });
});

// PUT /api/admin/windows/:key
router.put('/windows/:key', (req, res) => {
  const key = req.params.key as WindowKey;
  if (!VALID_KEYS.includes(key)) {
    res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: `Invalid window key.` } });
    return;
  }

  const { opensOn, closesOn, open } = req.body;
  if (opensOn  !== undefined) windows[key].opensOn  = opensOn;
  if (closesOn !== undefined) windows[key].closesOn = closesOn;
  if (open     !== undefined) windows[key].open     = open;

  const auditDesc = open
    ? `Admin opened ${key} window (closes ${windows[key].closesOn})`
    : `Admin closed ${key} window`;
  writeAudit({ actor: req.user!.name, group: 'System', description: auditDesc });

  res.json({ window: windows[key] });
});

// GET /api/admin/extensions
router.get('/extensions', (req, res) => {
  res.json({ extensions });
});

// POST /api/admin/extensions
router.post('/extensions', (req, res) => {
  const { groupId, offsetDays, reason } = req.body as { groupId: string | 'all'; offsetDays: number; reason: string };

  if (!offsetDays || !reason) {
    res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'offsetDays and reason are required.' } });
    return;
  }

  const groupName = groupId === 'all'
    ? 'All Groups'
    : (groups.find(g => g.id === groupId)?.name ?? groupId);

  const ext: Extension = {
    id:         `ext-${Date.now()}`,
    groupId,
    groupName,
    offsetDays,
    reason,
    grantedAt:  new Date().toISOString(),
    grantedBy:  req.user!.name,
  };
  extensions.push(ext);

  writeAudit({
    actor:       req.user!.name,
    group:       groupName,
    description: `Admin granted ${offsetDays}-day extension to ${groupName}: ${reason}`,
  });

  res.status(201).json({ extension: ext });
});

export default router;

