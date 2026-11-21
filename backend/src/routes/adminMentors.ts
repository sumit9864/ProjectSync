/**
 * routes/adminMentors.ts
 * GET    /api/admin/mentors       — List all Project Guides
 * POST   /api/admin/mentors       — Add a Project Guide
 * PUT    /api/admin/mentors/:id   — Update a Project Guide
 * DELETE /api/admin/mentors/:id   — Remove a Project Guide (BR-12)
 */

import { Router }     from 'express';
import { requireAuth }  from '../middleware/auth';
import { requireRole }  from '../middleware/requireRole';
import { db, saveDb }   from '../lib/db';
import type { DbMentor } from '../lib/db';

const router = Router();

// All routes require admin / Project Coordinator (BR-17)
router.use(requireAuth, requireRole('admin'));

// GET /api/admin/mentors
router.get('/', (_req, res) => {
  // Admin view includes email
  res.json({ mentors: db.mentors });
});

// POST /api/admin/mentors
router.post('/', (req, res) => {
  const { name, domain, email, capacity } = req.body as {
    name: string; domain: string; email: string; capacity: number;
  };

  if (db.mentors.find(m => m.email === email)) {
    res.status(409).json({ error: { code: 'CONFLICT', message: 'A mentor with this email already exists.' } });
    return;
  }

  const newMentor: DbMentor = {
    id:           `mentor-${Date.now()}`,
    userId:       '',       // No linked user account when admin adds manually
    name,
    email,
    domain,
    focus:        '',
    capacity,
    currentLoad:  0,
    bio:          '',
    pastProjects: [],
    avatarColor:  'bg-slate-500',
  };

  db.mentors.push(newMentor);
  saveDb();
  res.status(201).json({ mentor: newMentor });
});

// PUT /api/admin/mentors/:mentorId
router.put('/:mentorId', (req, res) => {
  const idx = db.mentors.findIndex(m => m.id === req.params.mentorId);
  if (idx === -1) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Mentor not found.' } }); return; }

  const { name, domain, email, capacity } = req.body;
  if (name     !== undefined) db.mentors[idx].name     = name;
  if (domain   !== undefined) db.mentors[idx].domain   = domain;
  if (email    !== undefined) db.mentors[idx].email    = email;
  if (capacity !== undefined) db.mentors[idx].capacity = capacity;
  saveDb();

  res.json({ mentor: db.mentors[idx] });
});

// DELETE /api/admin/mentors/:mentorId
router.delete('/:mentorId', (req, res) => {
  const idx = db.mentors.findIndex(m => m.id === req.params.mentorId);
  if (idx === -1) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Mentor not found.' } }); return; }

  // BR-12: Cannot delete if mentor still has groups assigned
  if (db.mentors[idx].currentLoad > 0) {
    res.status(422).json({ error: { code: 'BUSINESS_RULE', message: 'BR-12: Mentor still has groups assigned. Reassign them before deleting.' } });
    return;
  }

  db.mentors.splice(idx, 1);
  saveDb();
  res.json({ success: true });
});

export default router;
