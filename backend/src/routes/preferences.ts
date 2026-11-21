/**
 * routes/preferences.ts
 * GET  /api/preferences/mine?round=1|2  — Team Leader's current submission
 * POST /api/preferences                  — Submit/update shortlist
 */

import { Router }      from 'express';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { db, saveDb }  from '../lib/db';

const router = Router();

// GET /api/preferences/mine?round=1|2
router.get('/mine', requireAuth, requireRole('student'), (req, res) => {
  const round = Number(req.query.round) as 1 | 2;
  const group = db.groups.find(g => g.ownerUserId === req.user!.userId);
  if (!group) { res.json({ submission: null }); return; }
  const key        = `${group.id}-${round}`;
  const submission = db.preferences[key] ?? null;
  res.json({ submission });
});

// POST /api/preferences
router.post('/', requireAuth, requireRole('student'), (req, res) => {
  const { round, entries } = req.body as { round: 1 | 2; entries: { mentorId: string; rank: number }[] };

  // BR-05: Preference window must be open
  const windowKey = round === 1 ? 'round1' : 'round2';
  if (!db.windows[windowKey].open) {
    res.status(422).json({ error: { code: 'BUSINESS_RULE', message: `BR-05: The round ${round} preference window is not currently open.` } });
    return;
  }

  // BR-06: Min 2, max 3 entries
  if (!entries || entries.length < 2 || entries.length > 3) {
    res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'BR-06: Shortlist must have between 2 and 3 entries.' } });
    return;
  }

  // BR-07: Ranks must be unique and sequential from 1
  const ranks = entries.map(e => e.rank).sort((a, b) => a - b);
  if (!ranks.every((r, i) => r === i + 1) || new Set(ranks).size !== ranks.length) {
    res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'BR-07: Rank values must be unique and sequential starting from 1.' } });
    return;
  }

  // BR-08: Cannot shortlist a mentor who is at full capacity
  for (const entry of entries) {
    const mentor = db.mentors.find(m => m.id === entry.mentorId);
    if (mentor && mentor.currentLoad >= mentor.capacity) {
      res.status(422).json({ error: { code: 'BUSINESS_RULE', message: `BR-08: Mentor ${mentor.name} is at full capacity.` } });
      return;
    }
  }

  const group = db.groups.find(g => g.ownerUserId === req.user!.userId);
  if (!group) {
    res.status(422).json({ error: { code: 'BUSINESS_RULE', message: 'You must be in a group to submit preferences.' } });
    return;
  }

  const submission = { round, entries, submittedAt: new Date().toISOString() };
  db.preferences[`${group.id}-${round}`] = submission;
  saveDb();

  res.status(201).json({ submission });
});

export default router;
