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
export const preferencesByGroup: Record<string, ShortlistSubmission> = {};
