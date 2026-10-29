import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { githubByGroup, GitHubData } from '../mockData/github';
import { getGroupByOwner, groups } from '../mockData/groups';
import { writeAudit } from '../lib/audit';

const router = Router();

// GET /api/github/mine
router.get('/mine', requireAuth, requireRole('student'), (req, res) => {
  const group = getGroupByOwner(req.user!.userId);
  if (!group) {
    res.json({ url: null, lastUpdated: null, connected: false });
    return;
  }
  const data = githubByGroup[group.id] ?? { url: null, lastUpdated: null, connected: false };
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

  const group = getGroupByOwner(req.user!.userId);
  if (!group) {
    res.status(422).json({ error: { code: 'BUSINESS_RULE', message: 'You must be in a group to connect a GitHub repository.' } });
    return;
  }

  const now = new Date();
  const lastUpdated = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    + ' · ' + now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  const data: GitHubData = { url, lastUpdated, connected: true };
  githubByGroup[group.id] = data;

  // Update group stage if not already past this stage
  if (group.stage === 'topic_approved') {
    const idx = groups.findIndex(g => g.id === group.id);
    if (idx !== -1) groups[idx].stage = 'github_connected';
  }

  writeAudit({
    actor: req.user!.name,
    group: group.name,
    description: `Group ${group.name} connected GitHub repository`,
  });

  res.json(data);
});

export default router;

