/**
 * mockData/topics.ts
 * ──────────────────
 * Hardcoded topic data per group. Migrated from src/data/mockData.ts.
 * Keyed by groupId. Mutable in-memory.
 * In Phase 3 this file is deleted; data comes from PostgreSQL.
 */

export type TopicStatus = 'pending' | 'approved' | 'changes_requested';

export interface TopicDraft {
  workingTitle:       string;
  existingWork:       string;
  problemIdentified:  string;
  proposedDifference: string;
  innovation:         string;
  feasibility:        string;
}

export interface TopicVersion {
  version:     number;
  submittedAt: string;
  status:      TopicStatus;
  feedback?:   string;
  fields:      TopicDraft;
}

export interface DiscussionMessage {
  id:          string;
  author:      string;
  role:        string;
  avatarColor: string;
  body:        string;
  time:        string;
}

export interface TopicData {
  draft:         TopicDraft;
  versions:      TopicVersion[];
  currentStatus: TopicStatus | null;
  discussion:    DiscussionMessage[];
}

// Keyed by groupId
export const topicsByGroup: Record<string, TopicData> = {};
