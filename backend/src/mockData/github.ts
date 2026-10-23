/**
 * mockData/github.ts
 * ───────────────────
 * Hardcoded GitHub repo data per group. Mutable in-memory.
 * In Phase 3 this file is deleted; data comes from PostgreSQL.
 */

export interface GitHubData {
  url:         string | null;
  lastUpdated: string | null;
  connected:   boolean;
}

// Keyed by groupId
export const githubByGroup: Record<string, GitHubData> = {
  'group-1': {
    url:         'https://github.com/neural-knights/ecg-transformer',
    lastUpdated: 'Oct 1, 2026 · 2:30 PM',
    connected:   true,
  },
};
