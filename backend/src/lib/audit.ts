/**
 * audit.ts — Reusable audit event writer
 *
 * In Phase 2 (mock server): pushes events into the in-memory auditEvents array.
 * In Phase 3 (real backend): this will write a row to the AuditEvent DB table.
 *
 * Usage:
 *   import { writeAudit } from '../lib/audit';
 *   writeAudit({ actor: req.user.name, group: group.name, description: '...' });
 */
import { auditEvents } from '../mockData/audit';

interface AuditParams {
  actor:       string;
  group:       string;
  description: string;
}

export function writeAudit(params: AuditParams): void {
  auditEvents.unshift({
    id:          `audit-${Date.now()}`,
    timestamp:   new Date().toISOString(),
    description: params.description,
    actor:       params.actor,
    group:       params.group,
  });
}
