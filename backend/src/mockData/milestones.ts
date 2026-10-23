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
export const milestonesByGroup: Record<string, Milestone[]> = {
  'group-1': [
    {
      id:          'ms-1',
      number:      1,
      title:       'Literature Review & Problem Scoping',
      dueDate:     '2026-10-01',
      status:      'complete',
      checkInNote: 'Completed thorough review of 40+ papers. Problem scope finalised and approved by mentor.',
      checkedInAt: '2026-09-29T10:00:00.000Z',
    },
    {
      id:      'ms-2',
      number:  2,
      title:   'Dataset Preparation & Baseline Model',
      dueDate: '2026-10-22',
      status:  'incomplete',
    },
    {
      id:      'ms-3',
      number:  3,
      title:   'Core Model Implementation & Initial Results',
      dueDate: '2026-11-12',
      status:  'incomplete',
    },
    {
      id:      'ms-4',
      number:  4,
      title:   'Final Report & Presentation',
      dueDate: '2026-12-05',
      status:  'incomplete',
    },
  ],
};
