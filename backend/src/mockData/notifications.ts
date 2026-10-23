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
export const notificationsByUser: Record<string, Notification[]> = {
  'user-student-1': [
    {
      id:    'notif-1',
      title: 'Mentor assigned',
      body:  'Dr. Eliza Mathews has been assigned as your project mentor.',
      time:  '2026-09-13T08:05:00.000Z',
      read:  true,
      type:  'success',
    },
    {
      id:    'notif-2',
      title: 'Topic approved',
      body:  'Your project topic has been approved. You can now begin milestone check-ins.',
      time:  '2026-09-28T11:50:00.000Z',
      read:  false,
      type:  'success',
    },
  ],
  'user-mentor-1': [
    {
      id:    'notif-3',
      title: 'New group assigned',
      body:  'Neural Knights has been assigned to you for mentorship.',
      time:  '2026-09-13T08:05:00.000Z',
      read:  true,
      type:  'info',
    },
  ],
  'user-admin-1': [],
};
