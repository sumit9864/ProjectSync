/**
 * routes/reset.ts
 * ───────────────
 * Developer-only reset endpoint.
 * POST /api/dev/reset  — Wipes the JSON database back to factory defaults.
 *
 * This is intentionally NOT behind requireAuth so it can be called from
 * a dev tool or browser button even when logged out.
 * It should be disabled / removed before any real deployment.
 */

import { Router }   from 'express';
import { resetDb }  from '../lib/db';

const router = Router();

router.post('/reset', (req, res) => {
  resetDb();
  // Clear the session cookie too so the browser reflects the clean state
  res.clearCookie('ps_token');
  res.json({
    success: true,
    message: 'Database reset to factory defaults. All student accounts and session data wiped.',
  });
});

export default router;
