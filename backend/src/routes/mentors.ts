/**
 * routes/mentors.ts
 * GET /api/mentors — Public list of Project Guide profiles
 */

import { Router }   from 'express';
import { db }       from '../lib/db';

const router = Router();

router.get('/', (_req, res) => {
  // Strip userId (internal linkage) before sending to frontend
  const publicMentors = db.mentors.map(({ userId: _, ...m }) => m);
  res.json({ mentors: publicMentors });
});

export default router;
