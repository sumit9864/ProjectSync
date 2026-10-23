/**
 * mockData/preferences.ts
 * ────────────────────────
 * Hardcoded mentor preference submissions per group.
 * Keyed by `${groupId}-${round}`. Mutable in-memory.
 * In Phase 3 this file is deleted; data comes from PostgreSQL.
 */

export interface ShortlistEntry { mentorId: string; rank: number; }

export interface ShortlistSubmission {
  round:       1 | 2;
  entries:     ShortlistEntry[];
  submittedAt: string;
}

// Key: `${groupId}-${round}` → submission
export const preferencesByGroup: Record<string, ShortlistSubmission> = {
  'group-1-1': {
    round: 1,
    entries: [
      { mentorId: 'mentor-1', rank: 1 },
      { mentorId: 'mentor-3', rank: 2 },
    ],
    submittedAt: '2026-09-10T08:00:00.000Z',
  },
};
