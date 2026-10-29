import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { mentors, Mentor } from '../mockData/mentors';

const router = Router();

// All routes require admin (BR-17)
router.use(requireAuth, requireRole('admin'));

// GET /api/admin/mentors
router.get('/', (req, res) => {
  res.json({ mentors }); // includes email (admin view)
});

// POST /api/admin/mentors
router.post('/', (req, res) => {
  const { name, domain, email, capacity } = req.body as { name: string; domain: string; email: string; capacity: number };

  if (mentors.find(m => m.email === email)) {
    res.status(409).json({ error: { code: 'CONFLICT', message: 'A mentor with this email already exists.' } });
    return;
  }

  const newMentor: Mentor = {
    id:          `mentor-${Date.now()}`,
    name,
    domain,
    focus:       '',
    capacity,
    currentLoad: 0,
    bio:         '',
    pastProjects: [],
    avatarColor:  'bg-slate-500',
    email,
  };

  mentors.push(newMentor);
  res.status(201).json({ mentor: newMentor });
});

// PUT /api/admin/mentors/:mentorId
router.put('/:mentorId', (req, res) => {
  const idx = mentors.findIndex(m => m.id === req.params.mentorId);
  if (idx === -1) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Mentor not found.' } });
    return;
  }
  const { name, domain, email, capacity } = req.body;
  if (name    !== undefined) mentors[idx].name     = name;
  if (domain  !== undefined) mentors[idx].domain   = domain;
  if (email   !== undefined) mentors[idx].email    = email;
  if (capacity !== undefined) mentors[idx].capacity = capacity;
  res.json({ mentor: mentors[idx] });
});

// DELETE /api/admin/mentors/:mentorId
router.delete('/:mentorId', (req, res) => {
  const idx = mentors.findIndex(m => m.id === req.params.mentorId);
  if (idx === -1) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Mentor not found.' } });
    return;
  }
  // BR-12: Cannot delete if mentor still has groups assigned
  if (mentors[idx].currentLoad > 0) {
    res.status(422).json({ error: { code: 'BUSINESS_RULE', message: 'BR-12: Mentor still has groups assigned. Reassign them before deleting.' } });
    return;
  }
  mentors.splice(idx, 1);
  res.json({ success: true });
});

export default router;

