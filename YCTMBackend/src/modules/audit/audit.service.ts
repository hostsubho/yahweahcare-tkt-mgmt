// ============================================================
// Audit log writer — captures security-relevant events
// ============================================================

import type { Request } from 'express';
import { pool } from '../../db/pool';

export type AuditAction =
  | 'login.success' | 'login.failed' | 'login.account_locked' | 'login.bad_domain'
  | 'logout' | 'logout.global'
  | 'token.refresh' | 'token.revoke'
  | 'session.expired' | 'session.inactivity'
  | 'user.create' | 'user.update' | 'user.delete' | 'user.activate' | 'user.deactivate'
  | 'role.assign' | 'role.change' | 'role.create' | 'role.update' | 'role.delete'
  | 'permission.grant' | 'permission.revoke'
  | 'password.reset.request' | 'password.reset.success'
  | 'audit.export'
  | 'activitylog.export' | 'activitylog.archive_generate' | 'activitylog.archive_download'
  | 'activitylog.archive_email' | 'activitylog.truncate' | 'activitylog.delete'
  | 'system.seed'
  | 'dept.create' | 'dept.update' | 'dept.delete'
  | 'position.create' | 'position.update' | 'position.delete'
  | 'org.move'
  | 'schedule.create' | 'schedule.update' | 'schedule.delete' | 'schedule.send_now'
  | 'ticket.create' | 'ticket.update' | 'ticket.delete' | 'ticket.comment' | 'ticket.assign'
  | 'ticket.complete' | 'ticket.approve' | 'ticket.reject' | 'ticket.escalate' | 'ticket.reopen' | 'ticket.close'
  | 'vehicle.create' | 'vehicle.update' | 'vehicle.delete'
  | 'vehicle_alert.update';

export interface AuditEntry {
  userId?: number | null;
  actorEmail?: string | null;
  action: AuditAction;
  module?: string;
  targetType?: string;
  targetId?: string | number;
  metadata?: Record<string, unknown>;
  success?: boolean;
  req?: Request;
}

export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    const ip = entry.req?.ip || (entry.req?.headers['x-forwarded-for'] as string) || null;
    const ua = entry.req?.headers['user-agent'] || null;
    await pool.query(
      `INSERT INTO yc_tkt_mgmt.audit_logs
         (user_id, actor_email, action, module, target_type, target_id, metadata, ip_address, user_agent, success)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        entry.userId ?? null,
        entry.actorEmail ?? null,
        entry.action,
        entry.module ?? entry.action.split('.')[0],
        entry.targetType ?? null,
        entry.targetId != null ? String(entry.targetId) : null,
        JSON.stringify(entry.metadata ?? {}),
        ip,
        ua,
        entry.success ?? true,
      ]
    );
  } catch (err) {
    // Audit logging must never block primary flow — just log to console
    console.error('[audit] failed to write audit entry', err);
  }
}
