/**
 * routes/adminWindows.ts
 * GET  /api/admin/windows         — Project Coordinator reads all window states
 * PUT  /api/admin/windows/:key    — Project Coordinator opens/closes a window
 * GET  /api/admin/extensions      — List deadline extensions
 * POST /api/admin/extensions      — Grant a deadline extension
 */

import { Router }     from 'express';
import { requireAuth }  from '../middleware/auth';
import { requireRole }  from '../middleware/requireRole';
import { db, saveDb }   from '../lib/db';
import type { DbExtension } from '../lib/db';
import { writeAudit }   from '../lib/audit';

const router = Router();

// All routes require admin / Project Coordinator (BR-17)
router.use(requireAuth, requireRole('admin'));

type WindowKey = 'registration' | 'round1' | 'round2';
const VALID_KEYS: WindowKey[] = ['registration', 'round1', 'round2'];

// GET /api/admin/windows
router.get('/windows', (_req, res) => {
  res.json({ windows: db.windows });
});

// PUT /api/admin/windows/:key
router.put('/windows/:key', (req, res) => {
  const key = req.params.key as WindowKey;
  if (!VALID_KEYS.includes(key)) {
    res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid window key.' } });
    return;
  }

  const { opensOn, closesOn, open } = req.body;
  if (opensOn  !== undefined) db.windows[key].opensOn  = opensOn;
  if (closesOn !== undefined) db.windows[key].closesOn = closesOn;
  if (open     !== undefined) db.windows[key].open     = open;
  saveDb();

  const auditDesc = open
    ? `Admin opened ${key} window (closes ${db.windows[key].closesOn})`
    : `Admin closed ${key} window`;
  writeAudit({ actor: req.user!.name, group: 'System', description: auditDesc });

  res.json({ window: db.windows[key] });
});

// GET /api/admin/extensions
router.get('/extensions', (_req, res) => {
  res.json({ extensions: db.extensions });
});

// POST /api/admin/extensions
router.post('/extensions', (req, res) => {
  const { groupId, offsetDays, reason } = req.body as {
    groupId:    string | 'all';
    offsetDays: number;
    reason:     string;
  };

  if (!offsetDays || !reason) {
    res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'offsetDays and reason are required.' } });
    return;
  }

  const groupName = groupId === 'all'
    ? 'All Groups'
    : (db.groups.find(g => g.id === groupId)?.name ?? groupId);

  const ext: DbExtension = {
    id:         `ext-${Date.now()}`,
    groupId,
    groupName,
    offsetDays,
    reason,
    grantedAt:  new Date().toISOString(),
    grantedBy:  req.user!.name,
  };

  db.extensions.push(ext);
  saveDb();

  writeAudit({
    actor:       req.user!.name,
    group:       groupName,
    description: `Admin granted ${offsetDays}-day extension to ${groupName}: ${reason}`,
  });

  res.status(201).json({ extension: ext });
});

export default router;
