/**
 * mockData/groups.ts
 * ──────────────────
 * Hardcoded group data. Migrated from src/data/mockData.ts.
 * Mutable — POST /api/groups pushes into this array in-memory.
 * In Phase 3 this file is deleted; data comes from PostgreSQL.
 */

export interface GroupMember {
  id:         string;
  name:       string;
  rollNumber: string;
  email:      string;
  elective:   string;
}

export interface Group {
  id:            string;
  projectId:     string;
  name:          string;
  leaderCrn:     string;
  electiveTwo:   string;
  electiveThree: string;
  members:       GroupMember[];
  mentorId:      string | null;
  registeredAt:  string;
  stage:         'registered' | 'mentor_assigned' | 'topic_approved' | 'github_connected';
  /** Student user id who owns this group (leader) */
  ownerUserId:   string;
}

// The single demo student group
export const groups: Group[] = [
  {
    id:            'group-1',
    projectId:     'FYP-2026-001',
    name:          'Neural Knights',
    leaderCrn:     'CS21B1042',
    electiveTwo:   'Machine Learning & Data Science',
    electiveThree: 'Artificial Intelligence',
    members: [
      { id: 'm1', name: 'Aarav Sharma',  rollNumber: 'CS21B1042', email: 'aarav.sharma@university.edu',  elective: 'Machine Learning & Data Science' },
      { id: 'm2', name: 'Priya Nair',    rollNumber: 'CS21B1055', email: 'priya.nair@university.edu',    elective: 'Machine Learning & Data Science' },
      { id: 'm3', name: 'Rohan Kapoor',  rollNumber: 'CS21B1067', email: 'rohan.kapoor@university.edu',  elective: 'Machine Learning & Data Science' },
    ],
    mentorId:     'mentor-1',
    registeredAt: '2026-09-15T10:00:00.000Z',
    stage:        'mentor_assigned',
    ownerUserId:  'user-student-1',
  },
];

/** Look up the group that belongs to a given student user ID */
export function getGroupByOwner(userId: string): Group | null {
  return groups.find(g => g.ownerUserId === userId) ?? null;
}

/** Look up groups assigned to a given mentor ID */
export function getGroupsByMentor(mentorId: string): Group[] {
  return groups.filter(g => g.mentorId === mentorId);
}
