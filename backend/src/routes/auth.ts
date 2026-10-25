import { Router } from 'express';
import { demoUsers } from '../mockData/auth';
import { signToken } from '../lib/jwt';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = demoUsers.find(u => u.email === email && u.password === password);

  if (!user) {
    res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid email or password' } });
    return;
  }

  const payload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  };

  const token = signToken(payload);

  res.cookie('ps_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false, // dev only
    maxAge: 86400000 // 24 hours in ms
  });

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

router.post('/logout', requireAuth, (req, res) => {
  res.clearCookie('ps_token');
  res.json({ success: true });
});

router.get('/me', requireAuth, (req, res) => {
  const user = req.user!;
  res.json({
    user: {
      id: user.userId,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

export default router;
