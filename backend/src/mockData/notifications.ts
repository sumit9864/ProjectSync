/**
 * mockData/notifications.ts
 * ──────────────────────────
 * Hardcoded notifications per user. Migrated from src/data/mockData.ts.
 * Keyed by userId. Mutable in-memory.
 * In Phase 3 this file is deleted; data comes from PostgreSQL.
 */

export type NotificationType = 'info' | 'success' | 'warning';

export interface Notification {
  id:    string;
  title: string;
  body:  string;
  time:  string;
  read:  boolean;
  type:  NotificationType;
}

// Keyed by userId
export const notificationsByUser: Record<string, Notification[]> = {};
