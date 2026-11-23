/**
 * routes/auth.ts
 * ──────────────
 * POST /api/auth/register  — Student self-registration (saves to JSON db)
 * POST /api/auth/login     — Any role sign-in (returns JWT cookie + user data)
 * POST /api/auth/logout    — Clears JWT cookie
 * GET  /api/auth/me        — Returns current user from cookie
 */

import { Router }      from 'express';
import { db, saveDb }  from '../lib/db';
import { signToken }   from '../lib/jwt';
import { requireAuth } from '../middleware/auth';
import type { DbUser } from '../lib/db';
import { writeAudit }  from '../lib/audit';

const router = Router();

// ── Helpers ────────────────────────────────────────────────────────────────────
function publicUser(u: DbUser) {
  const { password: _, ...rest } = u;
  return rest;
}

// ── POST /api/auth/register ────────────────────────────────────────────────────
// Team Leader (Student) self-registration. Admin & Mentor accounts are
// pre-seeded and cannot be created through this endpoint.
router.post('/register', (req, res) => {
  const { name, email, password } = req.body as {
    name:     string;
    email:    string;
    password: string;
  };

  // Basic validation
  if (!name?.trim() || !email?.trim() || !password?.trim()) {
    res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'name, email, and password are required.' },
    });
    return;
  }

  // Domain restriction — only @kkwagh.edu.in emails allowed for student registration
  const kkwaghRx = /^[^\s@]+@kkwagh\.edu\.in$/i;
  if (!kkwaghRx.test(email)) {
    res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Registration is restricted to @kkwagh.edu.in email addresses.' },
    });
    return;
  }

  // Duplicate check
  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    res.status(409).json({
      error: { code: 'CONFLICT', message: 'An account with this email already exists.' },
    });
    return;
  }

  // Block attempts to register with pre-seeded admin / mentor emails
  // (They are system-provisioned and sign-in only)
  const systemEmails = [
    'admin@kkwagh.edu.in',
    'emathews@kkwagh.edu.in',
    'adesai@kkwagh.edu.in',
    'smirza@kkwagh.edu.in',
    'knair@kkwagh.edu.in',
  ];
  if (systemEmails.includes(email.toLowerCase())) {
    res.status(409).json({
      error: { code: 'CONFLICT', message: 'This email address is reserved for a system account.' },
    });
    return;
  }

  // Create student user
  const newUser: DbUser = {
    id:       `user-student-${Date.now()}`,
    name:     name.trim(),
    email:    email.toLowerCase().trim(),
    password,
    role:     'student',
  };

  db.users.push(newUser);
  saveDb();

  writeAudit({
    actor:       newUser.name,
    group:       'System',
    description: `New student account registered: ${newUser.email}`,
  });

  // Auto sign-in after registration
  const payload = { userId: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role };
  const token   = signToken(payload);

  res.cookie('ps_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure:   false,
    maxAge:   86400000,
  });

  res.status(201).json({ user: publicUser(newUser) });
});

// ── POST /api/auth/login ───────────────────────────────────────────────────────
router.post('/login', (req, res) => {
  const { email, password } = req.body as { email: string; password: string };

  const user = db.users.find(
    u => u.email.toLowerCase() === email?.toLowerCase() && u.password === password,
  );

  if (!user) {
    res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Invalid email or password.' },
    });
    return;
  }

  const payload = { userId: user.id, email: user.email, name: user.name, role: user.role };
  const token   = signToken(payload);

  res.cookie('ps_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure:   false,
    maxAge:   86400000,
  });

  res.json({ user: publicUser(user) });
});

// ── POST /api/auth/logout ──────────────────────────────────────────────────────
router.post('/logout', requireAuth, (req, res) => {
  res.clearCookie('ps_token');
  res.json({ success: true });
});

// ── GET /api/auth/me ───────────────────────────────────────────────────────────
router.get('/me', requireAuth, (req, res) => {
  const { userId, email, name, role } = req.user!;
  res.json({ user: { id: userId, name, email, role } });
});

export default router;
