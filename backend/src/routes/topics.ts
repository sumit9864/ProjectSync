import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { topicsByGroup, TopicData, TopicVersion, DiscussionMessage } from '../mockData/topics';
import { getGroupByOwner } from '../mockData/groups';
import { writeAudit } from '../lib/audit';

const router = Router();

function getOrCreateTopicData(groupId: string): TopicData {
  if (!topicsByGroup[groupId]) {
    topicsByGroup[groupId] = {
      draft: null as any,
      versions: [],
      currentStatus: null,
      discussion: [],
    };
  }
  return topicsByGroup[groupId];
}

// GET /api/topics/mine
router.get('/mine', requireAuth, requireRole('student'), (req, res) => {
  const group = getGroupByOwner(req.user!.userId);
  if (!group) {
    res.json({ draft: null, versions: [], currentStatus: null, discussion: [] });
    return;
  }
  const data = topicsByGroup[group.id] ?? { draft: null, versions: [], currentStatus: null, discussion: [] };
  res.json({
    draft: data.draft,
    versions: data.versions,
    currentStatus: data.currentStatus,
    discussion: data.discussion,
  });
});

// PUT /api/topics/draft
router.put('/draft', requireAuth, requireRole('student'), (req, res) => {
  const group = getGroupByOwner(req.user!.userId);
  if (!group) {
    res.status(422).json({ error: { code: 'BUSINESS_RULE', message: 'You must be in a group to save a draft.' } });
    return;
  }
  const data = getOrCreateTopicData(group.id);
  data.draft = req.body.draft;
  const savedAt = new Date().toISOString();
  res.json({ savedAt });
});

// POST /api/topics/submit
router.post('/submit', requireAuth, requireRole('student'), (req, res) => {
  const group = getGroupByOwner(req.user!.userId);
  if (!group) {
    res.status(422).json({ error: { code: 'BUSINESS_RULE', message: 'You must be in a group to submit a topic.' } });
    return;
  }

  const data = getOrCreateTopicData(group.id);

  // BR-09: Cannot re-submit if already approved
  if (data.currentStatus === 'approved') {
    res.status(422).json({ error: { code: 'BUSINESS_RULE', message: 'BR-09: Topic has already been approved. No further submissions allowed.' } });
    return;
  }

  // BR-10: Cannot submit if no mentor assigned
  if (!group.mentorId) {
    res.status(422).json({ error: { code: 'BUSINESS_RULE', message: 'BR-10: A mentor must be assigned to your group before submitting a topic.' } });
    return;
  }

  data.draft = req.body.draft;
  const versionNumber = data.versions.length + 1;
  const newVersion: TopicVersion = {
    version: versionNumber,
    submittedAt: new Date().toISOString(),
    status: 'pending',
  };
  data.versions.push(newVersion);
  data.currentStatus = 'pending';

  writeAudit({
    actor: req.user!.name,
    group: group.name,
    description: `Group ${group.name} submitted topic v${versionNumber}: ${req.body.draft?.workingTitle ?? '(untitled)'}`,
  });

  res.status(201).json({ version: newVersion });
});

// POST /api/topics/discussion
router.post('/discussion', requireAuth, requireRole('student'), (req, res) => {
  const group = getGroupByOwner(req.user!.userId);
  if (!group) {
    res.status(422).json({ error: { code: 'BUSINESS_RULE', message: 'You must be in a group to post a message.' } });
    return;
  }

  const data = getOrCreateTopicData(group.id);
  const message: DiscussionMessage = {
    id: `msg-${Date.now()}`,
    author: req.user!.name,
    role: 'Student',
    avatarColor: 'bg-brand-600',
    body: req.body.body,
    time: new Date().toISOString(),
  };
  data.discussion.push(message);
  res.status(201).json({ message });
});

export default router;

