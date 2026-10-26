import { Router } from 'express';
import { electives } from '../mockData/electives';

const router = Router();

router.get('/', (req, res) => {
  res.json({ options: electives });
});

export default router;
