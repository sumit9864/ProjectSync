/**
 * mockData/audit.ts
 * ──────────────────
 * In-memory audit event log. writeAudit() in lib/audit.ts pushes here.
 * Pre-seeded with some historical events. Mutable in-memory.
 * In Phase 3 this file is deleted; data comes from PostgreSQL.
 */

export interface AuditEvent {
  id:          string;
  timestamp:   string;
  description: string;
  actor:       string;
  group:       string;
}

export const auditEvents: AuditEvent[] = [
  { id: 'ae-1', timestamp: '2026-09-13T08:00:00.000Z', description: 'Mentor Dr. Eliza Mathews assigned to Neural Knights (Round 1, Rank 1)', actor: 'System',              group: 'Neural Knights' },
  { id: 'ae-2', timestamp: '2026-09-15T10:00:00.000Z', description: 'Group FYP-2026-001 (Neural Knights) registered',                        actor: 'Aarav Sharma',        group: 'Neural Knights' },
  { id: 'ae-3', timestamp: '2026-09-20T14:30:00.000Z', description: 'Group Neural Knights submitted topic v1: ECG-based Cardiovascular...',   actor: 'Aarav Sharma',        group: 'Neural Knights' },
  { id: 'ae-4', timestamp: '2026-09-22T09:00:00.000Z', description: 'Mentor Dr. Eliza Mathews requested changes on Neural Knights topic',     actor: 'Dr. Eliza Mathews',   group: 'Neural Knights' },
  { id: 'ae-5', timestamp: '2026-09-28T09:15:00.000Z', description: 'Group Neural Knights submitted topic v2: ECG-based Cardiovascular...',   actor: 'Aarav Sharma',        group: 'Neural Knights' },
  { id: 'ae-6', timestamp: '2026-09-28T11:45:00.000Z', description: 'Mentor Dr. Eliza Mathews approved topic for Neural Knights',            actor: 'Dr. Eliza Mathews',   group: 'Neural Knights' },
  { id: 'ae-7', timestamp: '2026-09-29T10:00:00.000Z', description: 'Group Neural Knights checked in milestone #1: Literature Review',       actor: 'Aarav Sharma',        group: 'Neural Knights' },
  { id: 'ae-8', timestamp: '2026-10-01T14:00:00.000Z', description: 'Group Neural Knights connected GitHub repository',                       actor: 'Aarav Sharma',        group: 'Neural Knights' },
  { id: 'ae-9', timestamp: '2026-10-01T08:00:00.000Z', description: 'Mentor Dr. Eliza Mathews created log entry #2 for Neural Knights',      actor: 'Dr. Eliza Mathews',   group: 'Neural Knights' },
];
