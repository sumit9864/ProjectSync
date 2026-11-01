/**
 * mockData/logbook.ts
 * ────────────────────
 * Hardcoded log book entries per group. Migrated from src/data/mockData.ts.
 * Keyed by groupId. Mutable in-memory.
 * In Phase 3 this file is deleted; data comes from PostgreSQL.
 */

export interface LogBookAttendee { name: string; present: boolean; }

export interface LogBookHistoryEntry {
  editedAt:          string;
  pointsDiscussed:   string;
  mentorSuggestions: string;
  remarks:           string;
}

export interface LogBookEntry {
  id:                string;
  entryNumber:       number;
  date:              string;    // YYYY-MM-DD
  lastEditedAt:      string;    // ISO 8601
  attendance:        LogBookAttendee[];
  pointsDiscussed:   string;
  mentorSuggestions: string;
  remarks:           string;
  editHistory?:      LogBookHistoryEntry[];
}

// Keyed by groupId
export const logbookByGroup: Record<string, LogBookEntry[]> = {};
