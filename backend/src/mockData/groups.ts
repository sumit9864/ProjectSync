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
export const groups: Group[] = [];

/** Look up the group that belongs to a given student user ID */
export function getGroupByOwner(userId: string): Group | null {
  return groups.find(g => g.ownerUserId === userId) ?? null;
}

/** Look up groups assigned to a given mentor ID */
export function getGroupsByMentor(mentorId: string): Group[] {
  return groups.filter(g => g.mentorId === mentorId);
}
