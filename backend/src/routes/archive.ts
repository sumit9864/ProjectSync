import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { archiveEntries, ArchiveEntry } from '../mockData/archive';

const router = Router();

// All routes require admin (BR-17)
router.use(requireAuth, requireRole('admin'));

// GET /api/admin/archive
router.get('/', (req, res) => {
  const { search, year, elective } = req.query;
  let result = [...archiveEntries];
  if (search)   result = result.filter(e => e.title.toLowerCase().includes((search as string).toLowerCase()) || e.group.toLowerCase().includes((search as string).toLowerCase()));
  if (year)     result = result.filter(e => e.year === year);
  if (elective) result = result.filter(e => e.elective.toLowerCase().includes((elective as string).toLowerCase()));
  res.json({ entries: result });
});

// POST /api/admin/archive
router.post('/', (req, res) => {
  const { year, title, group, elective, abstract, mentor, grade } = req.body as ArchiveEntry;
  const newEntry: ArchiveEntry = {
    id: `arc-${Date.now()}`,
    year, title, group, elective, abstract, mentor, grade,
  };
  archiveEntries.push(newEntry);
  res.status(201).json({ entry: newEntry });
});

export default router;

