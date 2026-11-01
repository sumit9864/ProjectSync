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

export const auditEvents: AuditEvent[] = [];
