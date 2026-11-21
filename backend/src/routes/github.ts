/**
 * routes/github.ts
 * GET /api/github/mine  — Team Leader reads their GitHub link
 * PUT /api/github       — Save / update GitHub URL
 */

import { Router }     from 'express';
import { requireAuth }  from '../middleware/auth';
import { requireRole }  from '../middleware/requireRole';
import { db, saveDb }   from '../lib/db';
import { writeAudit }   from '../lib/audit';

const router = Router();

// GET /api/github/mine
router.get('/mine', requireAuth, requireRole('student'), (req, res) => {
  const group = db.groups.find(g => g.ownerUserId === req.user!.userId);
  if (!group) { res.json({ url: null, lastUpdated: null, connected: false }); return; }
  const data = db.github[group.id] ?? { url: null, lastUpdated: null, connected: false };
  res.json(data);
});

// PUT /api/github
router.put('/', requireAuth, requireRole('student'), (req, res) => {
  const { url } = req.body as { url: string };

  // BR-16: URL must match github.com/{owner}/{repo}
  const githubPattern = /^https?:\/\/github\.com\/[\w.-]+\/[\w.-]+(\/)?$/;
  if (!url || !githubPattern.test(url)) {
    res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'BR-16: GitHub URL must match the pattern github.com/{owner}/{repo}.' } });
    return;
  }

  const group = db.groups.find(g => g.ownerUserId === req.user!.userId);
  if (!group) {
    res.status(422).json({ error: { code: 'BUSINESS_RULE', message: 'You must be in a group to connect a GitHub repository.' } });
    return;
  }

  const now         = new Date();
  const lastUpdated = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    + ' · ' + now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  db.github[group.id] = { url, lastUpdated, connected: true };

  // Update group stage if topic is approved
  if (group.stage === 'topic_approved') {
    const idx = db.groups.findIndex(g => g.id === group.id);
    if (idx !== -1) db.groups[idx].stage = 'github_connected';
  }

  saveDb();

  writeAudit({
    actor:       req.user!.name,
    group:       group.name,
    description: `Group ${group.name} connected GitHub repository`,
  });

  res.json(db.github[group.id]);
});

export default router;
