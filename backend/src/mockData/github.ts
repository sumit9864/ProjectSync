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
export const githubByGroup: Record<string, GitHubData> = {};
