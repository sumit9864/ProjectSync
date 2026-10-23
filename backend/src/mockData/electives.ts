/**
 * mockData/electives.ts
 * ──────────────────────
 * Hardcoded elective options. Migrated from src/data/mockData.ts.
 */

export interface ElectiveOption {
  id:    string;
  label: string;
  code:  string;
}

export const electives: ElectiveOption[] = [
  { id: 'ai', label: 'Artificial Intelligence', code: 'CS701' },
  { id: 'ml', label: 'Machine Learning & Data Science', code: 'CS702' },
  { id: 'web', label: 'Web & Mobile Application Dev', code: 'CS703' },
  { id: 'iot', label: 'Internet of Things & Embedded', code: 'CS704' },
  { id: 'cloud', label: 'Cloud & Distributed Systems', code: 'CS705' },
  { id: 'cyber', label: 'Cybersecurity & Cryptography', code: 'CS706' },
];
