/**
 * mockData/milestones.ts
 * ───────────────────────
 * Hardcoded milestones per group. Migrated from src/data/mockData.ts.
 * Keyed by groupId. Mutable in-memory.
 * In Phase 3 this file is deleted; data comes from PostgreSQL.
 */

export type MilestoneStatus = 'complete' | 'incomplete';

export interface Milestone {
  id:           string;
  number:       number;
  title:        string;
  dueDate:      string;   // YYYY-MM-DD
  status:       MilestoneStatus;
  checkInNote?: string;
  checkedInAt?: string;   // ISO 8601
}

// Keyed by groupId
export const milestonesByGroup: Record<string, Milestone[]> = {};
