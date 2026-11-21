/**
 * routes/groups.ts
 * ─────────────────
 * GET  /api/groups/mine  — Return current student's group
 * POST /api/groups       — Register a new group (Team Leader action)
 *
 * Uses persistent db — all changes survive hot-reloads.
 */

import { Router }     from 'express';
import { requireAuth }  from '../middleware/auth';
import { requireRole }  from '../middleware/requireRole';
import { db, saveDb }   from '../lib/db';
import type { DbGroup } from '../lib/db';
import { writeAudit }   from '../lib/audit';

const router = Router();

function publicGroup(g: DbGroup) {
  const { ownerUserId: _, ...rest } = g;
  return rest;
}

// GET /api/groups/mine
router.get('/mine', requireAuth, requireRole('student'), (req, res) => {
  const group = db.groups.find(g => g.ownerUserId === req.user!.userId) ?? null;
  res.json({ group: group ? publicGroup(group) : null });
});

// POST /api/groups
router.post('/', requireAuth, requireRole('student'), (req, res) => {
  // BR-01: Registration window must be open
  if (!db.windows.registration.open) {
    res.status(422).json({
      error: { code: 'BUSINESS_RULE', message: 'BR-01: Group registration window is not currently open.' },
    });
    return;
  }

  // BR-02: Student already in a group
  const existing = db.groups.find(g => g.ownerUserId === req.user!.userId);
  if (existing) {
    res.status(409).json({
      error: { code: 'CONFLICT', message: 'BR-02: You are already registered in a group.' },
    });
    return;
  }

  const { leaderCrn, electiveTwo, electiveThree, members } = req.body as {
    leaderCrn:     string;
    electiveTwo:   string;
    electiveThree: string;
    members:       { crn: string; name: string; email: string }[];
  };

  // BR-03: Group must have 3–4 members total (leader + 2 or 3 others)
  if (!members || members.length < 2 || members.length > 3) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'BR-03: A group must have 3 to 4 members total (leader + 2 or 3 others).',
      },
    });
    return;
  }

  const seqNum    = String(db.groups.length + 1).padStart(3, '0');
  const projectId = seqNum;
  const ts        = Date.now();

  const newGroup: DbGroup = {
    id:            `group-${ts}`,
    projectId,
    name:          `Group ${projectId}`,
    leaderCrn,
    electiveTwo,
    electiveThree,
    members: [
      { id: `m-leader-${ts}`, name: req.user!.name, rollNumber: leaderCrn, email: req.user!.email, elective: electiveTwo },
      ...members.map((m, i) => ({
        id:         `m-${ts}-${i}`,
        name:       m.name,
        rollNumber: m.crn,
        email:      m.email,
        elective:   electiveTwo,
      })),
    ],
    mentorId:     null,
    registeredAt: new Date().toISOString(),
    stage:        'registered',
    ownerUserId:  req.user!.userId,
  };

  db.groups.push(newGroup);
  saveDb();

  writeAudit({
    actor:       req.user!.name,
    group:       newGroup.name,
    description: `Group ${projectId} (${newGroup.name}) registered`,
  });

  res.status(201).json({ group: publicGroup(newGroup) });
});

export default router;
