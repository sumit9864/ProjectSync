/**
 * mockData/windows.ts
 * ────────────────────
 * Hardcoded control window settings. Migrated from src/data/adminData.ts.
 * Mutable in-memory. In Phase 3 this file is deleted.
 */

export type WindowKey = 'registration' | 'round1' | 'round2';

export interface ControlWindow {
  open:     boolean;
  opensOn:  string;  // YYYY-MM-DD
  closesOn: string;  // YYYY-MM-DD
}

export const windows: Record<WindowKey, ControlWindow> = {
  registration: { open: false, opensOn: '2026-09-01', closesOn: '2026-09-14' },
  round1:       { open: false, opensOn: '2026-09-05', closesOn: '2026-09-12' },
  round2:       { open: false, opensOn: '2026-09-13', closesOn: '2026-09-19' },
};

export interface Extension {
  id:         string;
  groupId:    string | 'all';
  groupName:  string;
  offsetDays: number;
  reason:     string;
  grantedAt:  string;
  grantedBy:  string;
}

export const extensions: Extension[] = [];
