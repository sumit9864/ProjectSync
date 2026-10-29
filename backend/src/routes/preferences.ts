import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { preferencesByGroup, ShortlistSubmission } from '../mockData/preferences';
import { mentors } from '../mockData/mentors';
import { getGroupByOwner } from '../mockData/groups';
import { windows } from '../mockData/windows';

const router = Router();

// GET /api/preferences/mine?round=1|2
router.get('/mine', requireAuth, requireRole('student'), (req, res) => {
  const round = Number(req.query.round) as 1 | 2;
  const group = getGroupByOwner(req.user!.userId);
  if (!group) {
    res.json({ submission: null });
    return;
  }
  const key = `${group.id}-${round}`;
  const submission = preferencesByGroup[key] ?? null;
  res.json({ submission });
});

// POST /api/preferences
router.post('/', requireAuth, requireRole('student'), (req, res) => {
  const { round, entries } = req.body as { round: 1 | 2; entries: { mentorId: string; rank: number }[] };

  // BR-05: Preference window must be open
  const windowKey = round === 1 ? 'round1' : 'round2';
  if (!windows[windowKey].open) {
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
  const isSequential = ranks.every((r, i) => r === i + 1);
  const isUnique = new Set(ranks).size === ranks.length;
  if (!isSequential || !isUnique) {
    res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'BR-07: Rank values must be unique and sequential starting from 1.' } });
    return;
  }

  // BR-08: Cannot shortlist a mentor who is at full capacity
  for (const entry of entries) {
    const mentor = mentors.find(m => m.id === entry.mentorId);
    if (mentor && mentor.currentLoad >= mentor.capacity) {
      res.status(422).json({ error: { code: 'BUSINESS_RULE', message: `BR-08: Mentor ${mentor.name} is at full capacity.` } });
      return;
    }
  }

  const group = getGroupByOwner(req.user!.userId);
  if (!group) {
    res.status(422).json({ error: { code: 'BUSINESS_RULE', message: 'You must be in a group to submit preferences.' } });
    return;
  }

  const submission: ShortlistSubmission = {
    round,
    entries,
    submittedAt: new Date().toISOString(),
  };

  preferencesByGroup[`${group.id}-${round}`] = submission;
  res.status(201).json({ submission });
});

export default router;

