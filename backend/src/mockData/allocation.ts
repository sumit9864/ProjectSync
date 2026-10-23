/**
 * mockData/allocation.ts
 * ───────────────────────
 * Hardcoded allocation state. Migrated from src/data/adminData.ts.
 * Mutable in-memory. In Phase 3 this file is deleted.
 */

export type AllocationStatus = 'assigned' | 'unassigned';

export interface AllocationResult {
  groupId:          string;
  groupName:        string;
  status:           AllocationStatus;
  matchedMentorId?: string;
  matchedRank?:     number;
}

export interface AllocationHistoryEntry {
  id:              string;
  round:           1 | 2;
  ranAt:           string;
  results:         AllocationResult[];
  assignedCount:   number;
  unassignedCount: number;
}

export const allocationHistory: AllocationHistoryEntry[] = [
  {
    id:    'alloc-hist-1',
    round: 1,
    ranAt: '2026-09-13T08:00:00.000Z',
    results: [
      { groupId: 'group-1', groupName: 'Neural Knights', status: 'assigned', matchedMentorId: 'mentor-1', matchedRank: 1 },
    ],
    assignedCount:   1,
    unassignedCount: 0,
  },
];
