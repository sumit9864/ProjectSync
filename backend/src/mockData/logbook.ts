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
export const logbookByGroup: Record<string, LogBookEntry[]> = {
  'group-1': [
    {
      id:          'lb-1',
      entryNumber: 1,
      date:        '2026-09-18',
      lastEditedAt: '2026-09-18T15:30:00.000Z',
      attendance: [
        { name: 'Aarav Sharma',  present: true  },
        { name: 'Priya Nair',    present: true  },
        { name: 'Rohan Kapoor',  present: false },
      ],
      pointsDiscussed:   'Initial project kickoff. Reviewed the problem statement and agreed on the PTB-XL dataset as the primary data source. Discussed weekly meeting schedule.',
      mentorSuggestions: 'Start with a simple CNN baseline before moving to transformers. Read the MobileViT paper carefully — Section 4 on architecture is particularly relevant.',
      remarks:           'Strong start. Team should set up shared GitHub repo before next meeting.',
    },
    {
      id:          'lb-2',
      entryNumber: 2,
      date:        '2026-09-25',
      lastEditedAt: '2026-09-30T09:00:00.000Z',
      attendance: [
        { name: 'Aarav Sharma',  present: true },
        { name: 'Priya Nair',    present: true },
        { name: 'Rohan Kapoor',  present: true },
      ],
      pointsDiscussed:   'Dataset download and preprocessing pipeline discussed. Team demonstrated initial data loading script. Reviewed CNN baseline implementation plan.',
      mentorSuggestions: 'Use stratified k-fold cross-validation from the start. Consider adding data augmentation (noise injection, time-shift) to the ECG preprocessing pipeline.',
      remarks:           'Good progress. Rohan to lead the preprocessing pipeline.',
      editHistory: [
        {
          editedAt:          '2026-09-30T09:00:00.000Z',
          pointsDiscussed:   'Dataset download and preprocessing discussed.',
          mentorSuggestions: 'Use k-fold CV from the start.',
          remarks:           'Good progress.',
        },
      ],
    },
  ],
};
