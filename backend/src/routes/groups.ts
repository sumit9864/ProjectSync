import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { groups, getGroupByOwner, Group } from '../mockData/groups';
import { windows } from '../mockData/windows';
import { writeAudit } from '../lib/audit';

const router = Router();

// GET /api/groups/mine
router.get('/mine', requireAuth, requireRole('student'), (req, res) => {
  const group = getGroupByOwner(req.user!.userId);
  if (!group) {
    res.json({ group: null });
    return;
  }
  // Strip internal ownerUserId before sending
  const { ownerUserId: _, ...publicGroup } = group;
  res.json({ group: publicGroup });
});

// POST /api/groups
router.post('/', requireAuth, requireRole('student'), (req, res) => {
  // BR-01: Registration window must be open
  if (!windows.registration.open) {
    res.status(422).json({ error: { code: 'BUSINESS_RULE', message: 'BR-01: Group registration window is not currently open.' } });
    return;
  }

  // BR-02: Student already in a group
  const existing = getGroupByOwner(req.user!.userId);
  if (existing) {
    res.status(409).json({ error: { code: 'CONFLICT', message: 'BR-02: You are already registered in a group.' } });
    return;
  }

  const { leaderCrn, electiveTwo, electiveThree, members } = req.body as {
    leaderCrn: string;
    electiveTwo: string;
    electiveThree: string;
    members: { crn: string; name: string; email: string }[];
  };

  // BR-03: Group must have 3–4 members total (leader + 2 or 3 others)
  if (!members || members.length < 2 || members.length > 3) {
    res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'BR-03: A group must have 3 to 4 members total (leader + 2 or 3 others).' } });
    return;
  }

  const totalMembers = members.length + 1; // +1 for leader
  const year = new Date().getFullYear();
  const seqNum = String(groups.length + 1).padStart(3, '0');
  const projectId = `FYP-${year}-${seqNum}`;

  const newGroup: Group = {
    id:            `group-${Date.now()}`,
    projectId,
    name:          `Group ${projectId}`,
    leaderCrn,
    electiveTwo,
    electiveThree,
    members: [
      { id: `m-leader-${Date.now()}`, name: req.user!.name, rollNumber: leaderCrn, email: req.user!.email, elective: electiveTwo },
      ...members.map((m, i) => ({ id: `m-${Date.now()}-${i}`, name: m.name, rollNumber: m.crn, email: m.email, elective: electiveTwo })),
    ],
    mentorId:     null,
    registeredAt: new Date().toISOString(),
    stage:        'registered',
    ownerUserId:  req.user!.userId,
  };

  groups.push(newGroup);

  writeAudit({
    actor:       req.user!.name,
    group:       newGroup.name,
    description: `Group ${projectId} (${newGroup.name}) registered`,
  });

  const { ownerUserId: _, ...publicGroup } = newGroup;
  res.status(201).json({ group: publicGroup });
});

export default router;

