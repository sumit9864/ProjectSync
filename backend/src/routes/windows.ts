/**
 * routes/windows.ts
 * GET /api/windows/:key — Public read of a window state
 */

import { Router } from 'express';
import { db }     from '../lib/db';

const router = Router();
type WindowKey = 'registration' | 'round1' | 'round2';
const VALID_KEYS: WindowKey[] = ['registration', 'round1', 'round2'];

router.get('/:key', (req, res) => {
  const key = req.params.key as WindowKey;
  if (!VALID_KEYS.includes(key)) {
    res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: `Invalid window key. Must be one of: ${VALID_KEYS.join(', ')}` } });
    return;
  }
  res.json({ window: db.windows[key] });
});

export default router;
