/**
 * audit.ts — Reusable audit event writer
 *
 * Phase 2 (persistent mock): writes events into db.auditEvents and flushes to disk.
 * Phase 3 (real backend): this will write a row to the AuditEvent DB table instead.
 *
 * Usage:
 *   import { writeAudit } from '../lib/audit';
 *   writeAudit({ actor: req.user.name, group: group.name, description: '...' });
 */
import { db, saveDb } from './db';

interface AuditParams {
  actor:       string;
  group:       string;
  description: string;
}

export function writeAudit(params: AuditParams): void {
  db.auditEvents.unshift({
    id:          `audit-${Date.now()}`,
    timestamp:   new Date().toISOString(),
    description: params.description,
    actor:       params.actor,
    group:       params.group,
  });
  saveDb();
}
