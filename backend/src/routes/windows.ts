import { Router } from 'express';
import { windows, WindowKey } from '../mockData/windows';

const router = Router();

const VALID_KEYS: WindowKey[] = ['registration', 'round1', 'round2'];

// GET /api/windows/:key — public
router.get('/:key', (req, res) => {
  const key = req.params.key as WindowKey;
  if (!VALID_KEYS.includes(key)) {
    res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: `Invalid window key. Must be one of: ${VALID_KEYS.join(', ')}` } });
    return;
  }
  res.json({ window: windows[key] });
});

export default router;
