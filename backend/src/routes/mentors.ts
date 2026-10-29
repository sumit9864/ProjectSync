import { Router } from 'express';
import { mentors } from '../mockData/mentors';

const router = Router();

// GET /api/mentors — public
router.get('/', (req, res) => {
  // Strip email (admin-only field) before returning to students
  const publicMentors = mentors.map(({ email: _, ...m }) => m);
  res.json({ mentors: publicMentors });
});

export default router;

