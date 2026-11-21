/**
 * routes/archive.ts
 * GET  /api/admin/archive — List past project archives with filters
 * POST /api/admin/archive — Add an archive entry
 */

import { Router }     from 'express';
import { requireAuth }  from '../middleware/auth';
import { requireRole }  from '../middleware/requireRole';
import { db, saveDb }   from '../lib/db';
import type { DbArchiveEntry } from '../lib/db';

const router = Router();

router.use(requireAuth, requireRole('admin'));

// GET /api/admin/archive
router.get('/', (req, res) => {
  const { search, year, elective } = req.query;
  let result = [...db.archiveEntries];
  if (search)   result = result.filter(e => e.title.toLowerCase().includes((search as string).toLowerCase()) || e.group.toLowerCase().includes((search as string).toLowerCase()));
  if (year)     result = result.filter(e => e.year === year);
  if (elective) result = result.filter(e => e.elective.toLowerCase().includes((elective as string).toLowerCase()));
  res.json({ entries: result });
});

// POST /api/admin/archive
router.post('/', (req, res) => {
  const { year, title, group, elective, abstract, mentor, grade } = req.body as Omit<DbArchiveEntry, 'id'>;
  const newEntry: DbArchiveEntry = {
    id: `arc-${Date.now()}`,
    year, title, group, elective, abstract, mentor, grade,
  };
  db.archiveEntries.push(newEntry);
  saveDb();
  res.status(201).json({ entry: newEntry });
});

export default router;
