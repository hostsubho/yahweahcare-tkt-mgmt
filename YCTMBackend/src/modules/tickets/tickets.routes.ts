// ============================================================
// Tickets routes — full CRUD + comments + activity
// ============================================================

import { Router, Request } from 'express';
import { pool } from '../../db/pool';
import { requireAuth, optionalAuth } from '../../middleware/auth.middleware';
import { logAudit } from '../audit/audit.service';
import { notify } from '../notifications/notifications.service';
import {
  notifyTicketCreated,
  notifyResolutionSubmitted,
  notifyTicketApproved,
  notifyTicketRejected,
  notifyTicketClosed,
  notifyTicketReopened,
  notifyTicketEscalated,
  notifyCommentAdded,
  notifyAttachmentAdded,
  notifyExtensionRequested,
  notifyExtensionApproved,
  notifyExtensionRejected,
} from '../../services/email/notification.service';

// Helper: extract portal from X-Portal request header ('YPC' | 'YC')
function getPortal(req: Request): 'YPC' | 'YC' | undefined {
  const p = req.headers['x-portal'];
  if (p === 'YPC' || p === 'YC') return p as 'YPC' | 'YC';
  return undefined;
}

// Helper: get actor name + ticket dept from DB
async function getActorName(userId: number | null): Promise<string | undefined> {
  if (!userId) return undefined;
  try {
    const { rows } = await pool.query(`SELECT name FROM yc_tkt_mgmt.users WHERE id=$1`, [userId]);
    return rows[0]?.name;
  } catch { return undefined; }
}
async function getTicketDept(creatorId: number | null, assigneeId: number | null): Promise<number | undefined> {
  const id = creatorId || assigneeId;
  if (!id) return undefined;
  try {
    const { rows } = await pool.query(`SELECT department_id FROM yc_tkt_mgmt.users WHERE id=$1`, [id]);
    return rows[0]?.department_id ?? undefined;
  } catch { return undefined; }
}

const router = Router();

// ── Auto-migrate: ensure ticket_approvers table exists ─────
let approverTableMigrated = false;
async function ensureApproversTable() {
  if (approverTableMigrated) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS yc_tkt_mgmt.ticket_approvers (
        id                SERIAL PRIMARY KEY,
        ticket_id         INTEGER NOT NULL REFERENCES yc_tkt_mgmt.tickets(id) ON DELETE CASCADE,
        approver_user_id  INTEGER NOT NULL REFERENCES yc_tkt_mgmt.users(id),
        approval_status   TEXT NOT NULL DEFAULT 'Pending',
        comments          TEXT,
        approval_date     TIMESTAMPTZ,
        created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(ticket_id, approver_user_id)
      )
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_ticket_approvers_ticket ON yc_tkt_mgmt.ticket_approvers(ticket_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_ticket_approvers_approver ON yc_tkt_mgmt.ticket_approvers(approver_user_id)`);
    await pool.query(`ALTER TABLE yc_tkt_mgmt.ticket_approvers ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`);
    approverTableMigrated = true;
  } catch (err) {
    console.warn('[tickets] ticket_approvers migration skipped:', err);
  }
}
ensureApproversTable();

// ── Auto-migrate: approval history table ────────────────────
let approvalHistoryMigrated = false;
async function ensureApprovalHistoryTable() {
  if (approvalHistoryMigrated) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS yc_tkt_mgmt.ticket_approval_history (
        id                SERIAL PRIMARY KEY,
        ticket_id         INTEGER NOT NULL REFERENCES yc_tkt_mgmt.tickets(id) ON DELETE CASCADE,
        approver_user_id  INTEGER NOT NULL REFERENCES yc_tkt_mgmt.users(id),
        approver_name     TEXT,
        action            TEXT NOT NULL,          -- 'Approved' | 'Rejected'
        comments          TEXT,                   -- acceptance note or rejection reason
        resolution_note   TEXT,                   -- snapshot of the resolution being acted on
        round             INTEGER NOT NULL DEFAULT 1,  -- increments each time ticket is resubmitted
        acted_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_tah_ticket ON yc_tkt_mgmt.ticket_approval_history(ticket_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_tah_approver ON yc_tkt_mgmt.ticket_approval_history(approver_user_id)`);
    // Track resubmission round on tickets table
    await pool.query(`ALTER TABLE yc_tkt_mgmt.tickets ADD COLUMN IF NOT EXISTS approval_round INTEGER NOT NULL DEFAULT 1`);
    approvalHistoryMigrated = true;
  } catch (err) {
    console.warn('[tickets] approval_history migration skipped:', err);
  }
}
ensureApprovalHistoryTable();

// ── Auto-migrate: add attachments + extension columns ──────
let attachmentsMigrated = false;
async function ensureAttachmentsColumn() {
  if (attachmentsMigrated) return;
  try {
    await pool.query(`
      ALTER TABLE yc_tkt_mgmt.tickets
        ADD COLUMN IF NOT EXISTS attachments JSONB NOT NULL DEFAULT '[]'::jsonb
    `);
    await pool.query(`
      ALTER TABLE yc_tkt_mgmt.tickets
        ADD COLUMN IF NOT EXISTS extension_requested_due DATE,
        ADD COLUMN IF NOT EXISTS extension_request_status TEXT,
        ADD COLUMN IF NOT EXISTS extension_requested_at TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS extension_request_note TEXT
    `);
    await pool.query(`
      ALTER TABLE yc_tkt_mgmt.tickets
        ADD COLUMN IF NOT EXISTS resolution_note TEXT
    `);
    await pool.query(`
      ALTER TABLE yc_tkt_mgmt.tickets
        ADD COLUMN IF NOT EXISTS title_type TEXT,
        ADD COLUMN IF NOT EXISTS subtitle TEXT,
        ADD COLUMN IF NOT EXISTS subcategory TEXT
    `);
    attachmentsMigrated = true;
  } catch (err) {
    console.warn('[tickets] migration skipped:', err);
  }
}
ensureAttachmentsColumn();

// ── Mapper: DB row → frontend shape ────────────────────────
// Actual table columns (schema yc_tkt_mgmt.tickets):
//   status (not status_id), assigned_to (not assignee_id),
//   created_by (not requester_id), due_date (not due_at),
//   closed_date (not resolved_at/closed_at), no ticket_number/site/source/sla_breached/is_closed
function dbTicket(row: Record<string, unknown>) {
  const dueDate    = row.due_date    ? new Date(row.due_date    as string) : null;
  const closedDate = row.closed_date ? new Date(row.closed_date as string) : null;
  const status     = (row.status || '') as string;
  const isClosed   = status === 'resolved' || status === 'closed' || !!closedDate;
  const slaBreached = !!(closedDate && dueDate && closedDate > dueDate);
  return {
    id: row.id,
    ticketNumber: `TKT-${String(row.id).padStart(6, '0')}`,
    title: row.title,
    description: row.description || '',
    category: row.category_id,
    priority: row.priority_id,
    status,
    requesterId: row.created_by,
    assigneeId: row.assigned_to || null,
    site: '',
    source: 'web',
    dueAt: row.due_date,
    expectedCompletion: row.expected_completion || null,
    pendingApprovalAt: row.pending_approval_at || null,
    resolvedAt: row.closed_date || null,
    closedAt: row.closed_date || null,
    slaBreached,
    isClosed,
    ndisRelated: !!row.ndis_related,
    isEscalated: !!row.is_escalated,
    escalatedTo: row.escalated_to || null,
    escalatedBy: row.escalated_by || null,
    escalatedAt: row.escalated_at || null,
    escalationReason: row.escalation_reason || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    // enriched label fields (present when queried via v_open_tickets)
    categoryLabel:  row.category_label  || null,
    categoryIcon:   row.category_icon   || null,
    priorityLabel:  row.priority_label  || null,
    slaHours:       row.priority_sla_hours || row.sla_hours || null,
    statusLabel:    row.status_label    || null,
    requesterName:  row.requester_name  || null,
    requesterEmail: row.requester_email || null,
    // Defaults to true (active) when the column wasn't joined for this query
    // (e.g. some code paths select tickets without the users JOIN) — only
    // ever false when we positively know the account was deactivated.
    requesterActive: row.requester_active !== false,
    assigneeName:   row.assignee_name   || null,
    assigneeEmail:  row.assignee_email  || null,
    assigneeActive: row.assignee_active !== false,
    departmentName: row.department_name || null,
    // resolution note (set when assignee marks complete)
    resolutionNote: row.resolution_note || null,
    // ticket type fields stored separately for display
    titleType: row.title_type || null,
    subtitle: row.subtitle || null,
    subcategory: row.subcategory || null,
    // extension request fields
    extensionRequestedDue: row.extension_requested_due || null,
    extensionRequestStatus: row.extension_request_status || null,
    extensionRequestedAt: row.extension_requested_at || null,
    extensionRequestNote: row.extension_request_note || null,
    // activity + comments + approvers fetched separately
    activity: row.activity || [],
    comments: row.comments || [],
    approvers: row.approvers || [],
    attachments: Array.isArray(row.attachments) ? row.attachments : [],
    // Flat list of user IDs who still have a Pending decision — used for
    // the "Pending My Approval" tab filter on the frontend
    pendingApproverIds: Array.isArray(row.pending_approver_ids) ? row.pending_approver_ids : [],
  };
}

function dbApprover(row: Record<string, unknown>) {
  return {
    id: row.id,
    ticketId: row.ticket_id,
    userId: row.approver_user_id,
    userName: row.user_name || null,
    userEmail: row.user_email || null,
    status: row.approval_status || 'Pending',
    justification: row.comments || null,
    respondedAt: row.approval_date || null,
    // support both created_date and created_at column names
    createdAt: row.created_date || row.created_at || null,
  };
}

function dbComment(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    ticketId: row.ticket_id,
    userId: row.user_id ?? row.author_id,
    authorName: row.author_name || null,
    text: (row.content ?? row.body) as string || '',
    isInternal: !!row.is_internal,
    at: row.created_at,
  };
}

function dbActivity(row: Record<string, unknown>) {
  const details = row.details
    ? (typeof row.details === 'string' ? JSON.parse(row.details) : row.details) as Record<string, unknown>
    : {};
  return {
    id: String(row.id),
    ticketId: row.ticket_id,
    userId: row.user_id,
    action: row.action,
    fromValue: details.from ?? null,
    toValue: details.to ?? null,
    metadata: details,
    at: row.created_at,
  };
}

// ── GET /tickets ─────────────────────────────────────────────────────────────
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const limit    = Math.min(Number(req.query.limit) || 200, 500);
    const offset   = Number(req.query.offset) || 0;
    const status   = (req.query.status   as string || '').trim();
    const priority = (req.query.priority as string || '').trim();
    const category = (req.query.category as string || '').trim();
    const all      = (req.query.all      as string || '').trim(); // ?all=1 → include closed tickets

    // Role-based scope:
    //   scope=all              → Bootstrap Admin / Director   — no extra filter
    //   scope=dept&deptId=N    → Manager                     — tickets in that department
    //   scope=mine&userId=N    → Everyone else               — own + pending-approval tickets
    const scope  = (req.query.scope  as string || '').trim();
    const userId = req.query.userId  ? Number(req.query.userId)  : null;
    const deptId = req.query.deptId  ? Number(req.query.deptId)  : null;

    const where: string[] = ['1=1'];
    const params: unknown[] = [];
    let i = 1;
    if (status)   { where.push(`v.status = $${i++}`); params.push(status); }
    if (priority) { where.push(`v.priority_id = $${i++}`); params.push(priority); }
    if (category) { where.push(`v.category_id = $${i++}`); params.push(category); }

    // Apply role scope
    if (scope === 'dept' && deptId) {
      // Dept managers see all tickets in their department PLUS any ticket they are
      // personally assigned as an approver on (even if from another department).
      const deptI1 = i++; const deptI2 = i++;
      const approverClause = userId
        ? ` OR EXISTS (SELECT 1 FROM yc_tkt_mgmt.ticket_approvers ta WHERE ta.ticket_id = v.id AND ta.approver_user_id = $${i++})`
        : '';
      where.push(
        `(v.assigned_to IN (SELECT id FROM yc_tkt_mgmt.users WHERE department_id = $${deptI1})` +
        ` OR v.created_by IN (SELECT id FROM yc_tkt_mgmt.users WHERE department_id = $${deptI2})` +
        `${approverClause})`
      );
      params.push(deptId, deptId);
      if (userId) params.push(userId);
    } else if (scope === 'mine' && userId) {
      // Own tickets + any tickets this user is an approver on (any status)
      // Removing approval_status='Pending' so resolved tickets remain visible for reopen
      where.push(
        `(v.created_by = $${i} OR v.assigned_to = $${i}` +
        ` OR EXISTS (SELECT 1 FROM yc_tkt_mgmt.ticket_approvers ta` +
        `  WHERE ta.ticket_id = v.id AND ta.approver_user_id = $${i}))`
      );
      params.push(userId); i++;
    } else if (scope === 'assigned_to_me' && userId) {
      // Strictly "assigned to me" — ONLY tickets where assigned_to = userId
      // No creator or approver expansion. Used to enforce the "Assigned to Me" tab
      // so only the actual assignee ever sees a ticket under that scope.
      where.push(`v.assigned_to = $${i}`);
      params.push(userId); i++;
    }
    // scope=all or no scope → no additional filter

    // Both all=1 and open-only use direct JOINs against the raw tickets table.
    // (The v_open_tickets view uses legacy column names and cannot be relied upon.)
    // all=1 → include closed/resolved; default → open tickets only.
    if (!all) {
      where.push(`v.status NOT IN ('resolved', 'closed')`);
    }

    // Use v.* so the query works regardless of which optional columns exist.
    // Departments JOIN removed — users.department_id may not exist on all DB schemas.
    const ticketQuery = `
      SELECT v.*,
             cat.label     AS category_label,
             cat.icon      AS category_icon,
             pri.label     AS priority_label,
             pri.sla_hours AS priority_sla_hours,
             ureq.name     AS requester_name,  ureq.email  AS requester_email,  ureq.is_active  AS requester_active,
             uasgn.name    AS assignee_name,   uasgn.email AS assignee_email,   uasgn.is_active AS assignee_active,
             COUNT(*) OVER() AS total
        FROM yc_tkt_mgmt.tickets v
        LEFT JOIN yc_tkt_mgmt.categories  cat  ON cat.id   = v.category_id
        LEFT JOIN yc_tkt_mgmt.priorities  pri  ON pri.id   = v.priority_id
        LEFT JOIN yc_tkt_mgmt.users       ureq ON ureq.id  = v.created_by
        LEFT JOIN yc_tkt_mgmt.users      uasgn ON uasgn.id = v.assigned_to
       WHERE ${where.join(' AND ')}
       ORDER BY v.created_at DESC
       LIMIT $${i} OFFSET $${i + 1}`;

    let qRes;
    try {
      qRes = await pool.query(ticketQuery, [...params, limit, offset]);
    } catch (qErr) {
      console.error('[GET /tickets] SQL error:', qErr);
      throw qErr;
    }
    const rows: Record<string, unknown>[] = qRes.rows;

    const ticketIds = rows.map(r => r.id);
    let commentRows: Record<string, unknown>[] = [];
    let activityRows: Record<string, unknown>[] = [];
    // approverMap: ticketId → array of pending approver user IDs
    const approverMap: Record<number, number[]> = {};

    if (ticketIds.length > 0) {
      const [cRes, aRes, apRes] = await Promise.all([
        pool.query(`SELECT * FROM yc_tkt_mgmt.comments WHERE ticket_id = ANY($1) ORDER BY created_at ASC`, [ticketIds]),
        pool.query(`SELECT * FROM yc_tkt_mgmt.activity WHERE ticket_id = ANY($1) ORDER BY created_at ASC`, [ticketIds]),
        pool.query(
          `SELECT ticket_id, approver_user_id
             FROM yc_tkt_mgmt.ticket_approvers
            WHERE ticket_id = ANY($1) AND approval_status = 'Pending'`,
          [ticketIds]
        ).catch(() => ({ rows: [] as Record<string, unknown>[] })),
      ]);
      commentRows  = cRes.rows;
      activityRows = aRes.rows;
      for (const r of apRes.rows) {
        const tid = r.ticket_id as number;
        if (!approverMap[tid]) approverMap[tid] = [];
        approverMap[tid].push(r.approver_user_id as number);
      }
    }

    const total = rows.length ? Number(rows[0].total) : 0;
    const tickets = rows.map(r => {
      const rid = r.id as number;
      (r as Record<string, unknown>).pending_approver_ids = approverMap[rid] || [];
      const t = dbTicket(r);
      t.comments = commentRows.filter(c => c.ticket_id === r.id).map(dbComment);
      t.activity  = activityRows.filter(a => a.ticket_id === r.id).map(dbActivity);
      return t;
    });

    res.json({ tickets, total });
  } catch (err) { next(err); }
});

// ── GET /tickets/activity — global activity feed ─────────────────────────────
router.get('/activity', optionalAuth, async (req, res, next) => {
  try {
    const limit  = Math.min(Number(req.query.limit)  || 100, 500);
    const offset = Number(req.query.offset) || 0;
    const search = ((req.query.search as string) || '').trim();
    const action = ((req.query.action as string) || '').trim();
    // Role-based scope (same as /tickets)
    const scope  = ((req.query.scope  as string) || '').trim();
    const userId = req.query.userId ? Number(req.query.userId) : null;
    const deptId = req.query.deptId ? Number(req.query.deptId) : null;

    const where: string[] = ['1=1'];
    const params: unknown[] = [];
    let i = 1;
    if (search) { where.push(`(t.title ILIKE $${i} OR u.name ILIKE $${i})`); params.push(`%${search}%`); i++; }
    if (action) { where.push(`a.action = $${i++}`); params.push(action); }
    if (scope === 'dept' && deptId) {
      where.push(
        `(t.assigned_to IN (SELECT id FROM yc_tkt_mgmt.users WHERE department_id = $${i++})` +
        ` OR t.created_by IN (SELECT id FROM yc_tkt_mgmt.users WHERE department_id = $${i++}))`
      );
      params.push(deptId, deptId);
    } else if (scope === 'mine' && userId) {
      where.push(`(t.created_by = $${i} OR t.assigned_to = $${i})`);
      params.push(userId); i++;
    }

    const { rows } = await pool.query(
      `SELECT
         a.id, a.ticket_id, a.user_id, a.action, a.details, a.created_at,
         t.title   AS ticket_title,
         t.status  AS ticket_status,
         p.label   AS priority_label,
         u.name    AS actor_name,
         COUNT(*) OVER() AS total
       FROM yc_tkt_mgmt.activity a
       JOIN yc_tkt_mgmt.tickets t ON t.id = a.ticket_id
       LEFT JOIN yc_tkt_mgmt.priorities p ON p.id = t.priority_id
       LEFT JOIN yc_tkt_mgmt.users u ON u.id = a.user_id
       WHERE ${where.join(' AND ')}
       ORDER BY a.created_at DESC
       LIMIT $${i++} OFFSET $${i++}`,
      [...params, limit, offset]
    );

    const total = rows.length ? Number(rows[0].total) : 0;
    const activity = rows.map(r => {
      const details = r.details
        ? (typeof r.details === 'string' ? JSON.parse(r.details) : r.details)
        : {};
      return {
        id: r.id,
        ticketId: r.ticket_id,
        ticketNumber: `TKT-${String(r.ticket_id).padStart(6, '0')}`,
        ticketTitle: r.ticket_title,
        ticketStatus: r.ticket_status,
        action: r.action,
        details,
        actorName: r.actor_name || 'System',
        priorityLabel: r.priority_label || '—',
        at: r.created_at,
      };
    });

    res.json({ total, activity });
  } catch (err) { next(err); }
});

// ── GET /tickets/:id ──────────────────────────────────────────────────────────
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    // Run ticket + comments + activity together; isolate approvers query
    // to prevent a schema mismatch (e.g. created_date vs created_at) from
    // silently killing the whole response.
    const [{ rows: tRows }, { rows: aRows }] = await Promise.all([
      pool.query(`SELECT * FROM yc_tkt_mgmt.tickets WHERE id = $1`, [id]),
      pool.query(`SELECT * FROM yc_tkt_mgmt.activity WHERE ticket_id = $1 ORDER BY created_at ASC`, [id]),
    ]);
    // Comments: handle both schema versions (user_id/content vs author_id/body)
    let cRows: Record<string, unknown>[] = [];
    try {
      const cQ = await pool.query(
        `SELECT c.id, c.ticket_id,
                COALESCE(c.user_id, c.author_id) AS author_id,
                COALESCE(c.content, c.body) AS body,
                c.created_at,
                COALESCE(c.is_internal, false) AS is_internal,
                u.name AS author_name
           FROM yc_tkt_mgmt.comments c
           LEFT JOIN yc_tkt_mgmt.users u ON u.id = COALESCE(c.user_id, c.author_id)
          WHERE c.ticket_id = $1
          ORDER BY c.created_at ASC`, [id]
      );
      cRows = cQ.rows;
    } catch (_) { /* comments table schema mismatch — skip */ }
    if (!tRows[0]) return res.status(404).json({ error: 'not_found' });

    // Approvers — ensure table exists then query
    await ensureApproversTable();
    let apRows: Record<string, unknown>[] = [];
    try {
      const apQ = await pool.query(
        `SELECT ta.id, ta.ticket_id, ta.approver_user_id,
                COALESCE(ta.approval_status, 'Pending') AS approval_status,
                ta.comments, ta.approval_date,
                u.name AS user_name, u.email AS user_email
           FROM yc_tkt_mgmt.ticket_approvers ta
           JOIN yc_tkt_mgmt.users u ON u.id = ta.approver_user_id
          WHERE ta.ticket_id = $1
          ORDER BY ta.created_at ASC`,
        [id]
      );
      apRows = apQ.rows;
    } catch (apErr) {
      console.error('[GET /tickets/:id] approvers query failed:', apErr);
    }

    // Approval history (immutable audit log)
    let approvalHistory: Record<string, unknown>[] = [];
    try {
      await ensureApprovalHistoryTable();
      const ahQ = await pool.query(
        `SELECT id, approver_user_id, approver_name, action, comments, resolution_note, round, acted_at
           FROM yc_tkt_mgmt.ticket_approval_history
          WHERE ticket_id = $1
          ORDER BY acted_at ASC`,
        [id]
      );
      approvalHistory = ahQ.rows.map(r => ({
        id: r.id,
        approverId: r.approver_user_id,
        approverName: r.approver_name,
        action: r.action,
        comments: r.comments,
        resolutionNote: r.resolution_note,
        round: r.round,
        actedAt: r.acted_at,
      }));
    } catch (_) {}

    // Enrich ticket row with assignee + requester name/email/active-status
    // (single-ticket query has no JOIN, unlike the list endpoint above)
    if (tRows[0].assigned_to) {
      try {
        const { rows: uRows } = await pool.query(
          `SELECT name, email, is_active FROM yc_tkt_mgmt.users WHERE id = $1`, [tRows[0].assigned_to]
        );
        if (uRows[0]) {
          (tRows[0] as Record<string, unknown>).assignee_name   = uRows[0].name;
          (tRows[0] as Record<string, unknown>).assignee_email  = uRows[0].email;
          (tRows[0] as Record<string, unknown>).assignee_active = uRows[0].is_active;
        }
      } catch (_) {}
    }
    if (tRows[0].created_by) {
      try {
        const { rows: uRows } = await pool.query(
          `SELECT name, email, is_active FROM yc_tkt_mgmt.users WHERE id = $1`, [tRows[0].created_by]
        );
        if (uRows[0]) {
          (tRows[0] as Record<string, unknown>).requester_name   = uRows[0].name;
          (tRows[0] as Record<string, unknown>).requester_email  = uRows[0].email;
          (tRows[0] as Record<string, unknown>).requester_active = uRows[0].is_active;
        }
      } catch (_) {}
    }

    const t = dbTicket(tRows[0]);
    t.comments  = cRows.map(dbComment);
    t.activity  = aRows.map(dbActivity);
    t.approvers = apRows.map(dbApprover);

    // Compute pendingApproverIds from live apRows (not stored on the ticket row itself)
    const pendingApproverUserIds = apRows
      .filter(ap => (ap.approval_status as string) === 'Pending')
      .map(ap => ap.approver_user_id as number);
    (t as Record<string, unknown>).pendingApproverIds = pendingApproverUserIds;
    (t as Record<string, unknown>).approvalHistory = approvalHistory;
    res.json({ ticket: t });
  } catch (err) { next(err); }
});

// ── POST /tickets — create ──────────────────────────────────
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const {
      title, description, category, priority, status, site, assigneeId,
      approverIds, expectedCompletion,
      // frontend field aliases
      title_type, subtitle, subcategory, category_id, priority_id, initial_status, assign_to, approver_ids, expected_completion,
      attachments,
    } = req.body || {};

    // Normalise field names (frontend may use snake_case or camelCase)
    const resolvedTitle    = title    || [title_type, subtitle].filter(Boolean).join(' — ') || null;
    const resolvedCategory = category || category_id || null;
    const resolvedPriority = priority || priority_id || null;
    const resolvedStatus   = (status  || initial_status || 'open').toLowerCase();
    const resolvedAssignee = assigneeId || (assign_to && assign_to !== 'Unassigned' ? assign_to : null);
    const resolvedApprovers: number[] = Array.isArray(approverIds)
      ? approverIds
      : Array.isArray(approver_ids) ? approver_ids : [];
    const resolvedDueDate  = expectedCompletion || expected_completion || null;

    if (!resolvedTitle || !resolvedCategory || !resolvedPriority) {
      return res.status(400).json({ error: 'missing_fields', message: 'title, category and priority are required' });
    }
    // expected_completion is optional — null is accepted
    if (!resolvedAssignee) {
      return res.status(400).json({ error: 'missing_fields', message: 'An assignee is required' });
    }
    if (!resolvedApprovers.length) {
      return res.status(400).json({ error: 'missing_fields', message: 'At least one approver is required' });
    }
    // Prevent assignee == creator
    const creatorId = req.auth?.userId || req.body.created_by || null;
    const assigneeNum = Number(resolvedAssignee);
    if (creatorId && assigneeNum === Number(creatorId)) {
      return res.status(400).json({ error: 'invalid_assignee', message: 'You cannot assign a ticket to yourself' });
    }
    // Prevent the assignee from also being an approver
    if (assigneeNum && resolvedApprovers.map(Number).includes(assigneeNum)) {
      return res.status(400).json({ error: 'invalid_approvers', message: 'The assignee cannot also be an approver' });
    }

    // Use the provided expected_completion as the due date
    const { rows: priRows } = await pool.query(`SELECT sla_hours FROM yc_tkt_mgmt.priorities WHERE id = $1`, [resolvedPriority]);
    const dueDate = resolvedDueDate;

    // Validate status (statuses table may not exist in all envs — fall back gracefully)
    let finalStatus = resolvedStatus;
    try {
      const { rows: statRows } = await pool.query(`SELECT id FROM yc_tkt_mgmt.statuses WHERE id = $1`, [resolvedStatus]);
      finalStatus = statRows[0]?.id || resolvedStatus;
    } catch (_) {
      // statuses table doesn't exist; use the provided status value as-is
    }

    // Validate and sanitise attachments (strip data URIs to keep only metadata + base64 content)
    const resolvedAttachments = Array.isArray(attachments)
      ? attachments.slice(0, 10).map((a: Record<string, unknown>) => ({
          name:    String(a.name    || 'file'),
          type:    String(a.type    || 'application/octet-stream'),
          size:    Number(a.size    || 0),
          content: String(a.content || ''), // base64
        }))
      : [];

    await ensureAttachmentsColumn();
    await ensureApproversTable();
    const { rows } = await pool.query(
      `INSERT INTO yc_tkt_mgmt.tickets
         (title, title_type, subtitle, subcategory, description, category_id, priority_id, status,
          created_by, assigned_to, due_date, expected_completion, attachments)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [resolvedTitle, title_type || null, subtitle || null, subcategory || null,
       description || req.body.issue_details || '', resolvedCategory, resolvedPriority,
       finalStatus, req.auth?.userId || req.body.created_by || null, resolvedAssignee || null, dueDate, resolvedDueDate,
       JSON.stringify(resolvedAttachments)]
    );
    const ticketId = rows[0].id;

    // Insert approvers
    for (const uid of resolvedApprovers) {
      await pool.query(
        `INSERT INTO yc_tkt_mgmt.ticket_approvers (ticket_id, approver_user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
        [ticketId, uid]
      );
    }

    // Activity log
    const actorId = req.auth?.userId || req.body.created_by || null;
    await pool.query(
      `INSERT INTO yc_tkt_mgmt.activity (ticket_id, user_id, action) VALUES ($1,$2,'created')`,
      [ticketId, actorId]
    );
    if (resolvedAssignee) {
      await pool.query(
        `INSERT INTO yc_tkt_mgmt.activity (ticket_id, user_id, action, details) VALUES ($1,$2,'assigned',$3)`,
        [ticketId, actorId, JSON.stringify({ to: String(resolvedAssignee) })]
      );
    }

    if (req.auth) await logAudit({ userId: req.auth.userId, actorEmail: req.auth.email, action: 'ticket.create', module: 'tickets', targetType: 'ticket', targetId: ticketId, metadata: { title: resolvedTitle }, req });

    // Return ticket with approvers
    const { rows: apRows } = await pool.query(
      `SELECT ta.*, u.name AS user_name, u.email AS user_email
       FROM yc_tkt_mgmt.ticket_approvers ta
       JOIN yc_tkt_mgmt.users u ON u.id = ta.approver_user_id
       WHERE ta.ticket_id = $1`, [ticketId]
    );
    const t = dbTicket(rows[0]);
    t.approvers = apRows.map(dbApprover);

    // Fire notifications BEFORE responding — Vercel serverless functions can
    // freeze immediately after the response is sent, so fire-and-forget calls
    // placed after res.json() are not guaranteed to run to completion.
    const actorName = await getActorName(actorId);
    const deptId    = await getTicketDept(actorId, resolvedAssignee ? Number(resolvedAssignee) : null);
    await notify({
      type: 'ticket.created', ticketId, ticketTitle: resolvedTitle,
      actorId: actorId!, actorName, creatorId: actorId ?? undefined,
      assigneeId: resolvedAssignee ? Number(resolvedAssignee) : undefined,
      approverIds: resolvedApprovers, deptId, portal: getPortal(req),
    }).catch(() => {});
    await notifyTicketCreated(ticketId, actorId!).catch(() => {});
    // If critical/urgent priority — fire extra notification to escalation chain
    try {
      const { rows: priLabel } = await pool.query(
        `SELECT label FROM yc_tkt_mgmt.priorities WHERE id = $1`, [resolvedPriority]
      );
      const label = (priLabel[0]?.label || '').toLowerCase();
      if (label === 'critical' || label === 'urgent') {
        await notify({
          type: 'ticket.critical', ticketId, ticketTitle: resolvedTitle,
          actorId: actorId!, actorName, creatorId: actorId ?? undefined,
          assigneeId: resolvedAssignee ? Number(resolvedAssignee) : undefined,
          deptId, portal: getPortal(req),
        }).catch(() => {});
      }
    } catch (_) {}

    res.status(201).json({ ticket: t });
  } catch (err) { next(err); }
});

// ── POST /tickets/:id/complete — assignee marks work done ───
// Moves status to pending_approval; all approvers notified
// Uses optionalAuth: falls back to actorId in request body when no session cookie
router.post('/:id/complete', requireAuth, async (req, res, next) => {
  try {
    const id      = Number(req.params.id);
    const actorId = req.auth?.userId ?? (req.body.actorId ? Number(req.body.actorId) : null);
    const resolutionNote = (req.body.resolutionNote || '').trim();

    if (!resolutionNote) {
      return res.status(400).json({ error: 'resolution_required', message: 'A resolution note is required before marking the ticket as complete' });
    }

    const { rows: tRows } = await pool.query(`SELECT * FROM yc_tkt_mgmt.tickets WHERE id = $1`, [id]);
    if (!tRows[0]) return res.status(404).json({ error: 'not_found' });

    const { rows: apRows } = await pool.query(
      `SELECT count(*) FROM yc_tkt_mgmt.ticket_approvers WHERE ticket_id = $1`, [id]
    );
    if (Number(apRows[0].count) === 0) {
      return res.status(400).json({ error: 'no_approvers', message: 'Ticket has no approvers assigned' });
    }

    // Snapshot any existing approval/rejection decisions to history before resetting
    await ensureApprovalHistoryTable();
    await pool.query(`
      INSERT INTO yc_tkt_mgmt.ticket_approval_history
        (ticket_id, approver_user_id, approver_name, action, comments, resolution_note, round, acted_at)
      SELECT
        ta.ticket_id, ta.approver_user_id, u.name,
        ta.approval_status, ta.comments,
        t.resolution_note,
        COALESCE(t.approval_round, 1),
        COALESCE(ta.approval_date, NOW())
      FROM yc_tkt_mgmt.ticket_approvers ta
      JOIN yc_tkt_mgmt.users u ON u.id = ta.approver_user_id
      JOIN yc_tkt_mgmt.tickets t ON t.id = ta.ticket_id
      WHERE ta.ticket_id = $1 AND ta.approval_status != 'Pending'
    `, [id]);

    // Increment the approval round and reset approver decisions
    await pool.query(
      `UPDATE yc_tkt_mgmt.tickets SET approval_round = COALESCE(approval_round,1) + 1 WHERE id=$1`,
      [id]
    );
    await pool.query(
      `UPDATE yc_tkt_mgmt.ticket_approvers SET approval_status='Pending', comments=NULL, approval_date=NULL WHERE ticket_id=$1`,
      [id]
    );

    await ensureAttachmentsColumn();
    const { rows } = await pool.query(
      `UPDATE yc_tkt_mgmt.tickets
       SET status='pending_approval', pending_approval_at=NOW(), resolution_note=$2, updated_at=NOW()
       WHERE id=$1 RETURNING *`,
      [id, resolutionNote]
    );

    await pool.query(
      `INSERT INTO yc_tkt_mgmt.activity (ticket_id, user_id, action, details)
       VALUES ($1,$2,'status_changed',$3)`,
      [id, actorId, JSON.stringify({ to: 'pending_approval', resolutionNote })]
    );

    await logAudit({ userId: actorId ?? undefined, actorEmail: req.auth?.email, action: 'ticket.complete', module: 'tickets', targetType: 'ticket', targetId: id, metadata: {}, req });

    // Notify (awaited before responding — see note above)
    const actorName = await getActorName(actorId);
    const deptId    = await getTicketDept(tRows[0].created_by, tRows[0].assigned_to);
    const { rows: apIdsC } = await pool.query(
      `SELECT approver_user_id FROM yc_tkt_mgmt.ticket_approvers WHERE ticket_id=$1`, [id]
    );
    await notify({
      type: 'ticket.completed', ticketId: id, ticketTitle: tRows[0].title,
      actorId: actorId!, actorName, creatorId: tRows[0].created_by ?? undefined,
      assigneeId: tRows[0].assigned_to ?? undefined,
      approverIds: apIdsC.map(r => r.approver_user_id), deptId, portal: getPortal(req),
    }).catch(() => {});
    await notifyResolutionSubmitted(id, actorId!).catch(() => {});

    res.json({ ticket: dbTicket(rows[0]) });
  } catch (err) { next(err); }
});

// ── POST /tickets/:id/approve — approver approves ──────────
// If ALL approvers have approved → ticket becomes resolved
router.post('/:id/approve', requireAuth, async (req, res, next) => {
  try {
    const id     = Number(req.params.id);
    const userId = req.auth?.userId ?? (req.body.actorId ? Number(req.body.actorId) : null);
    const acceptanceNote = (req.body.acceptanceNote || '').trim() || null;
    if (!userId) return res.status(400).json({ error: 'missing_actor', message: 'actorId is required' });

    const { rows: apRow } = await pool.query(
      `SELECT * FROM yc_tkt_mgmt.ticket_approvers WHERE ticket_id=$1 AND approver_user_id=$2`, [id, userId]
    );
    if (!apRow[0]) return res.status(403).json({ error: 'not_approver', message: 'You are not an approver for this ticket' });

    await pool.query(
      `UPDATE yc_tkt_mgmt.ticket_approvers
       SET approval_status='Approved', approval_date=NOW(), comments=$3
       WHERE ticket_id=$1 AND approver_user_id=$2`,
      [id, userId, acceptanceNote]
    );

    // Log to approval history
    await ensureApprovalHistoryTable();
    const { rows: tSnap } = await pool.query(`SELECT resolution_note, approval_round FROM yc_tkt_mgmt.tickets WHERE id=$1`, [id]);
    const approverName = await getActorName(userId);
    await pool.query(`
      INSERT INTO yc_tkt_mgmt.ticket_approval_history
        (ticket_id, approver_user_id, approver_name, action, comments, resolution_note, round, acted_at)
      VALUES ($1,$2,$3,'Approved',$4,$5,$6,NOW())
    `, [id, userId, approverName, acceptanceNote, tSnap[0]?.resolution_note, tSnap[0]?.approval_round ?? 1]);

    const actorEmail = req.auth?.email ?? apRow[0].user_email ?? String(userId);
    await pool.query(
      `INSERT INTO yc_tkt_mgmt.activity (ticket_id, user_id, action, details)
       VALUES ($1,$2,'approved',$3)`,
      [id, userId, JSON.stringify({ approvedBy: actorEmail, acceptanceNote })]
    );

    // Check if ALL approvers have now approved
    const { rows: pendingRows } = await pool.query(
      `SELECT count(*) FROM yc_tkt_mgmt.ticket_approvers WHERE ticket_id=$1 AND approval_status != 'Approved'`, [id]
    );

    let ticket;
    if (Number(pendingRows[0].count) === 0) {
      // All approved → resolve
      const { rows } = await pool.query(
        `UPDATE yc_tkt_mgmt.tickets
         SET status='resolved', closed_date=NOW(), updated_at=NOW()
         WHERE id=$1 RETURNING *`,
        [id]
      );
      ticket = rows[0];
      await pool.query(
        `INSERT INTO yc_tkt_mgmt.activity (ticket_id, user_id, action, details)
         VALUES ($1,$2,'status_changed',$3)`,
        [id, userId, JSON.stringify({ to: 'resolved' })]
      );
    } else {
      const { rows } = await pool.query(`SELECT * FROM yc_tkt_mgmt.tickets WHERE id=$1`, [id]);
      ticket = rows[0];
    }

    const { rows: allAp } = await pool.query(
      `SELECT ta.*, u.name AS user_name, u.email AS user_email
       FROM yc_tkt_mgmt.ticket_approvers ta
       JOIN yc_tkt_mgmt.users u ON u.id = ta.approver_user_id
       WHERE ta.ticket_id=$1`, [id]
    );
    const t = dbTicket(ticket);
    t.approvers = allAp.map(dbApprover);
    await logAudit({ userId, actorEmail: req.auth?.email, action: 'ticket.approve', module: 'tickets', targetType: 'ticket', targetId: id, metadata: {}, req });

    // Notify (awaited before responding — see note above)
    const actorName2 = await getActorName(userId);
    const { rows: tInfo2 } = await pool.query(`SELECT title, created_by, assigned_to FROM yc_tkt_mgmt.tickets WHERE id=$1`, [id]);
    const deptId2 = await getTicketDept(tInfo2[0]?.created_by, tInfo2[0]?.assigned_to);
    await notify({
      type: 'ticket.approved', ticketId: id, ticketTitle: tInfo2[0]?.title ?? `Ticket #${id}`,
      actorId: userId, actorName: actorName2, creatorId: tInfo2[0]?.created_by ?? undefined,
      assigneeId: tInfo2[0]?.assigned_to ?? undefined, deptId: deptId2, portal: getPortal(req),
    }).catch(() => {});
    await notifyTicketApproved(id, userId, acceptanceNote ?? undefined).catch(() => {});

    res.json({ ticket: t });
  } catch (err) { next(err); }
});

// ── POST /tickets/:id/reject — approver rejects (reopens) ──
// Sets status back to in_progress, records justification
router.post('/:id/reject', requireAuth, async (req, res, next) => {
  try {
    const id     = Number(req.params.id);
    const userId = req.auth?.userId ?? (req.body.actorId ? Number(req.body.actorId) : null);
    const { justification } = req.body || {};
    if (!userId) return res.status(400).json({ error: 'missing_actor', message: 'actorId is required' });

    if (!justification?.trim()) {
      return res.status(400).json({ error: 'justification_required', message: 'A justification is required to reject the resolution' });
    }

    const { rows: apRow } = await pool.query(
      `SELECT * FROM yc_tkt_mgmt.ticket_approvers WHERE ticket_id=$1 AND approver_user_id=$2`, [id, userId]
    );
    if (!apRow[0]) return res.status(403).json({ error: 'not_approver', message: 'You are not an approver for this ticket' });

    await pool.query(
      `UPDATE yc_tkt_mgmt.ticket_approvers
       SET approval_status='Rejected', approval_date=NOW(), comments=$3
       WHERE ticket_id=$1 AND approver_user_id=$2`,
      [id, userId, justification.trim()]
    );

    // Log to approval history
    await ensureApprovalHistoryTable();
    const { rows: tSnapR } = await pool.query(`SELECT resolution_note, approval_round FROM yc_tkt_mgmt.tickets WHERE id=$1`, [id]);
    const rejectorName = await getActorName(userId);
    await pool.query(`
      INSERT INTO yc_tkt_mgmt.ticket_approval_history
        (ticket_id, approver_user_id, approver_name, action, comments, resolution_note, round, acted_at)
      VALUES ($1,$2,$3,'Rejected',$4,$5,$6,NOW())
    `, [id, userId, rejectorName, justification.trim(), tSnapR[0]?.resolution_note, tSnapR[0]?.approval_round ?? 1]);

    const actorEmail = req.auth?.email ?? String(userId);
    // Reopen ticket — back to in_progress
    const { rows } = await pool.query(
      `UPDATE yc_tkt_mgmt.tickets
       SET status='in_progress', pending_approval_at=NULL, updated_at=NOW()
       WHERE id=$1 RETURNING *`,
      [id]
    );

    await pool.query(
      `INSERT INTO yc_tkt_mgmt.activity (ticket_id, user_id, action, details)
       VALUES ($1,$2,'rejected',$3)`,
      [id, userId, JSON.stringify({ from: 'pending_approval', to: 'in_progress', justification: justification.trim(), rejectedBy: actorEmail })]
    );

    const { rows: allAp } = await pool.query(
      `SELECT ta.*, u.name AS user_name, u.email AS user_email
       FROM yc_tkt_mgmt.ticket_approvers ta
       JOIN yc_tkt_mgmt.users u ON u.id = ta.approver_user_id
       WHERE ta.ticket_id=$1`, [id]
    );
    const t = dbTicket(rows[0]);
    t.approvers = allAp.map(dbApprover);
    await logAudit({ userId, actorEmail: req.auth?.email, action: 'ticket.reject', module: 'tickets', targetType: 'ticket', targetId: id, metadata: { justification }, req });

    // Notify (awaited before responding — see note above)
    const actorName3 = await getActorName(userId);
    const { rows: tInfo3 } = await pool.query(`SELECT title, created_by, assigned_to FROM yc_tkt_mgmt.tickets WHERE id=$1`, [id]);
    const deptId3 = await getTicketDept(tInfo3[0]?.created_by, tInfo3[0]?.assigned_to);
    await notify({
      type: 'ticket.rejected', ticketId: id, ticketTitle: tInfo3[0]?.title ?? `Ticket #${id}`,
      actorId: userId, actorName: actorName3, creatorId: tInfo3[0]?.created_by ?? undefined,
      assigneeId: tInfo3[0]?.assigned_to ?? undefined, deptId: deptId3, portal: getPortal(req),
    }).catch(() => {});
    await notifyTicketRejected(id, userId, justification).catch(() => {});

    res.json({ ticket: t });
  } catch (err) { next(err); }
});

// ── POST /tickets/:id/reopen — approver reopens a resolved/closed ticket ──
// Any assigned approver can reopen a resolved or closed ticket with a justification.
// Resets all approver decisions to Pending and moves ticket back to in_progress.
router.post('/:id/reopen', requireAuth, async (req, res, next) => {
  try {
    const id     = Number(req.params.id);
    const userId = req.auth?.userId ?? (req.body.actorId ? Number(req.body.actorId) : null);
    const { justification } = req.body || {};
    if (!userId) return res.status(400).json({ error: 'missing_actor', message: 'actorId is required' });
    if (!justification?.trim()) {
      return res.status(400).json({ error: 'justification_required', message: 'A justification is required to reopen the ticket' });
    }

    const { rows: tRows } = await pool.query(`SELECT * FROM yc_tkt_mgmt.tickets WHERE id = $1`, [id]);
    if (!tRows[0]) return res.status(404).json({ error: 'not_found' });
    if (!['resolved', 'closed'].includes(tRows[0].status)) {
      return res.status(400).json({ error: 'invalid_status', message: 'Only resolved or closed tickets can be reopened via this endpoint' });
    }

    // Check the user is an approver on this ticket
    const { rows: apRow } = await pool.query(
      `SELECT * FROM yc_tkt_mgmt.ticket_approvers WHERE ticket_id=$1 AND approver_user_id=$2`, [id, userId]
    );
    if (!apRow[0]) return res.status(403).json({ error: 'not_approver', message: 'You are not an approver for this ticket' });

    // Log to approval history before resetting
    await ensureApprovalHistoryTable();
    const reopenerName = await getActorName(userId);
    await pool.query(`
      INSERT INTO yc_tkt_mgmt.ticket_approval_history
        (ticket_id, approver_user_id, approver_name, action, comments, resolution_note, round, acted_at)
      VALUES ($1,$2,$3,'Reopened',$4,$5,$6,NOW())
    `, [id, userId, reopenerName, justification.trim(), tRows[0].resolution_note, tRows[0].approval_round ?? 1]);

    // Reset all approver decisions to Pending
    await pool.query(
      `UPDATE yc_tkt_mgmt.ticket_approvers SET approval_status='Pending', comments=NULL, approval_date=NULL WHERE ticket_id=$1`,
      [id]
    );

    // Move ticket back to in_progress
    const { rows } = await pool.query(
      `UPDATE yc_tkt_mgmt.tickets
       SET status='in_progress', closed_date=NULL, pending_approval_at=NULL, updated_at=NOW()
       WHERE id=$1 RETURNING *`,
      [id]
    );

    await pool.query(
      `INSERT INTO yc_tkt_mgmt.activity (ticket_id, user_id, action, details)
       VALUES ($1,$2,'reopened',$3)`,
      [id, userId, JSON.stringify({ from: tRows[0].status, to: 'in_progress', justification: justification.trim() })]
    );

    const { rows: allAp } = await pool.query(
      `SELECT ta.*, u.name AS user_name, u.email AS user_email
       FROM yc_tkt_mgmt.ticket_approvers ta
       JOIN yc_tkt_mgmt.users u ON u.id = ta.approver_user_id
       WHERE ta.ticket_id=$1`, [id]
    );
    const t = dbTicket(rows[0]);
    t.approvers = allAp.map(dbApprover);

    await logAudit({ userId, actorEmail: req.auth?.email, action: 'ticket.reopen', module: 'tickets', targetType: 'ticket', targetId: id, metadata: { justification }, req });

    // Notify (awaited before responding — see note above) — ticket is sent back to assignee for rework
    const actorNameR = await getActorName(userId);
    const { rows: tInfoR } = await pool.query(`SELECT title, created_by, assigned_to FROM yc_tkt_mgmt.tickets WHERE id=$1`, [id]);
    const deptIdR = await getTicketDept(tInfoR[0]?.created_by, tInfoR[0]?.assigned_to);
    await notify({
      type: 'ticket.reopened', ticketId: id, ticketTitle: tInfoR[0]?.title ?? `Ticket #${id}`,
      actorId: userId, actorName: actorNameR, creatorId: tInfoR[0]?.created_by ?? undefined,
      assigneeId: tInfoR[0]?.assigned_to ?? undefined, deptId: deptIdR, portal: getPortal(req),
    }).catch(() => {});
    await notifyTicketReopened(id, userId, justification).catch(() => {});

    res.json({ ticket: t });
  } catch (err) { next(err); }
});

// ── POST /tickets/:id/close — requester confirms resolution → Closed ─────────
// Only the ticket creator can close a resolved ticket.
// Once closed, it is terminal: cannot be reopened except by an admin.
router.post('/:id/close', requireAuth, async (req, res, next) => {
  try {
    const id     = Number(req.params.id);
    const userId = req.auth!.userId;
    const isAdmin = req.auth!.bootstrapAdmin || ['super_admin','admin'].includes(req.auth!.role);

    const { rows: tRows } = await pool.query(
      `SELECT id, title, status, created_by, assigned_to FROM yc_tkt_mgmt.tickets WHERE id = $1`, [id]
    );
    if (!tRows[0]) return res.status(404).json({ error: 'not_found' });

    // Only creator (or admin) may close
    if (tRows[0].created_by !== userId && !isAdmin) {
      return res.status(403).json({ error: 'forbidden', message: 'Only the ticket creator can close a resolved ticket' });
    }

    if (tRows[0].status !== 'resolved') {
      return res.status(400).json({ error: 'invalid_status', message: 'Only resolved tickets can be closed' });
    }

    // Move to closed
    const { rows } = await pool.query(
      `UPDATE yc_tkt_mgmt.tickets SET status='closed', updated_at=NOW() WHERE id=$1 RETURNING *`, [id]
    );

    // Activity log
    const closerName = await getActorName(userId);
    await pool.query(
      `INSERT INTO yc_tkt_mgmt.activity (ticket_id, user_id, action, details)
       VALUES ($1,$2,'closed',$3)`,
      [id, userId, JSON.stringify({ note: 'Requester confirmed resolution' })]
    );

    // Re-fetch approvers
    const { rows: allAp } = await pool.query(
      `SELECT ta.*, u.name AS user_name, u.email AS user_email
       FROM yc_tkt_mgmt.ticket_approvers ta
       JOIN yc_tkt_mgmt.users u ON u.id = ta.approver_user_id
       WHERE ta.ticket_id=$1`, [id]
    );
    const t = dbTicket(rows[0]);
    t.approvers = allAp.map(dbApprover);

    await logAudit({ userId, actorEmail: req.auth?.email, action: 'ticket.close', module: 'tickets', targetType: 'ticket', targetId: id, metadata: { title: tRows[0].title }, req });

    // Notify (awaited before responding — see note above)
    const deptIdC = await getTicketDept(tRows[0].created_by, tRows[0].assigned_to);
    await notify({
      type: 'ticket.closed', ticketId: id, ticketTitle: tRows[0].title,
      actorId: userId, actorName: closerName, creatorId: tRows[0].created_by ?? undefined,
      assigneeId: tRows[0].assigned_to ?? undefined, deptId: deptIdC, portal: getPortal(req),
    }).catch(() => {});
    await notifyTicketClosed(id, userId).catch(() => {});

    res.json({ ticket: t });
  } catch (err) { next(err); }
});

// ── POST /tickets/:id/approvers — set/replace approvers ──────
// Creator or bootstrap admin can call this to assign/change approvers
// on an existing ticket (e.g. tickets created before approver table existed).
router.post('/:id/approvers', requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const actorId = req.auth?.userId!;
    const { approver_ids } = req.body || {};

    if (!Array.isArray(approver_ids) || approver_ids.length === 0) {
      return res.status(400).json({ error: 'missing_fields', message: 'At least one approver is required' });
    }

    const { rows: tRows } = await pool.query(`SELECT * FROM yc_tkt_mgmt.tickets WHERE id=$1`, [id]);
    if (!tRows[0]) return res.status(404).json({ error: 'not_found' });
    const ticket = tRows[0];

    // Only creator, assignee, or bootstrap admin can update approvers
    const { rows: adminRows } = await pool.query(
      `SELECT is_bootstrap_admin FROM yc_tkt_mgmt.users WHERE id=$1`, [actorId]
    );
    const isAdmin = adminRows[0]?.is_bootstrap_admin;
    if (!isAdmin && ticket.created_by !== actorId && ticket.assigned_to !== actorId) {
      return res.status(403).json({ error: 'forbidden', message: 'Only the ticket creator, assignee, or admin can update approvers' });
    }

    // Prevent assignee being an approver
    if (ticket.assigned_to && approver_ids.map(Number).includes(Number(ticket.assigned_to))) {
      return res.status(400).json({ error: 'invalid_approvers', message: 'The assignee cannot also be an approver' });
    }

    await ensureApproversTable();

    // Replace all approvers for this ticket
    await pool.query(`DELETE FROM yc_tkt_mgmt.ticket_approvers WHERE ticket_id=$1`, [id]);
    for (const uid of approver_ids) {
      await pool.query(
        `INSERT INTO yc_tkt_mgmt.ticket_approvers (ticket_id, approver_user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
        [id, Number(uid)]
      );
    }

    await pool.query(
      `INSERT INTO yc_tkt_mgmt.activity (ticket_id, user_id, action, details) VALUES ($1,$2,'approvers_updated',$3)`,
      [id, actorId, JSON.stringify({ approver_count: approver_ids.length })]
    );

    const { rows: apRows } = await pool.query(
      `SELECT ta.*, u.name AS user_name, u.email AS user_email
       FROM yc_tkt_mgmt.ticket_approvers ta
       JOIN yc_tkt_mgmt.users u ON u.id = ta.approver_user_id
       WHERE ta.ticket_id=$1 ORDER BY ta.created_at ASC`, [id]
    );
    const t = dbTicket(tRows[0]);
    t.approvers = apRows.map(dbApprover);
    res.json({ ticket: t });
  } catch (err) { next(err); }
});

// ── PATCH /tickets/:id — update ─────────────────────────────
router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const id      = Number(req.params.id);
    const actorId = req.auth?.userId ?? (req.body.actorId ? Number(req.body.actorId) : null);
    const { rows: existing } = await pool.query(`SELECT * FROM yc_tkt_mgmt.tickets WHERE id = $1`, [id]);
    if (!existing[0]) return res.status(404).json({ error: 'not_found' });
    const old = existing[0];

    const colMap: Record<string, string> = {
      title: 'title', description: 'description', category: 'category_id',
      priority: 'priority_id', status: 'status', assigneeId: 'assigned_to',
      resolvedAt: 'closed_date', closedAt: 'closed_date',
      dueDate: 'due_date',
    };
    const updates: string[] = []; const values: unknown[] = []; let i = 1;
    const usedDbCols = new Set<string>();
    for (const [fKey, dbCol] of Object.entries(colMap)) {
      if (fKey in req.body && !usedDbCols.has(dbCol)) {
        usedDbCols.add(dbCol);
        updates.push(`${dbCol} = $${i++}`); values.push(req.body[fKey]);
      }
    }
    if (!updates.length) return res.json({ ticket: dbTicket(old) });
    values.push(id);

    const { rows } = await pool.query(
      `UPDATE yc_tkt_mgmt.tickets SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${i} RETURNING *`,
      values
    );

    // Record activity for key field changes
    const activityInserts: Promise<unknown>[] = [];
    if ('status' in req.body && req.body.status !== old.status) {
      activityInserts.push(pool.query(
        `INSERT INTO yc_tkt_mgmt.activity (ticket_id, user_id, action, details) VALUES ($1,$2,'status_changed',$3)`,
        [id, actorId, JSON.stringify({ from: old.status, to: req.body.status })]
      ));
    }
    if ('assigneeId' in req.body && req.body.assigneeId !== old.assigned_to) {
      activityInserts.push(pool.query(
        `INSERT INTO yc_tkt_mgmt.activity (ticket_id, user_id, action, details) VALUES ($1,$2,'assigned',$3)`,
        [id, actorId, JSON.stringify({ from: old.assigned_to ? String(old.assigned_to) : null, to: req.body.assigneeId ? String(req.body.assigneeId) : null })]
      ));
    }
    if ('priority' in req.body && req.body.priority !== old.priority_id) {
      activityInserts.push(pool.query(
        `INSERT INTO yc_tkt_mgmt.activity (ticket_id, user_id, action, details) VALUES ($1,$2,'priority_changed',$3)`,
        [id, actorId, JSON.stringify({ from: old.priority_id, to: req.body.priority })]
      ));
    }
    if ('dueDate' in req.body && req.body.dueDate !== old.due_date) {
      activityInserts.push(pool.query(
        `INSERT INTO yc_tkt_mgmt.activity (ticket_id, user_id, action, details) VALUES ($1,$2,'due_date_changed',$3)`,
        [id, actorId, JSON.stringify({ from: old.due_date, to: req.body.dueDate })]
      ));
    }
    await Promise.all(activityInserts);

    await logAudit({ userId: actorId ?? undefined, actorEmail: req.auth?.email, action: 'ticket.update', module: 'tickets', targetType: 'ticket', targetId: id, metadata: req.body, req });

    // Notify on assignee change (ticket.assigned → new assignee) — awaited before responding
    if ('assigneeId' in req.body && req.body.assigneeId && req.body.assigneeId !== old.assigned_to) {
      const actorNameA = await getActorName(actorId);
      const deptIdA    = await getTicketDept(old.created_by, req.body.assigneeId);
      await notify({
        type: 'ticket.assigned', ticketId: id, ticketTitle: (old.title as string),
        actorId: actorId!, actorName: actorNameA,
        assigneeId: Number(req.body.assigneeId), deptId: deptIdA, portal: getPortal(req),
      }).catch(() => {});
    }

    // Notify on status change only — awaited before responding
    if ('status' in req.body && req.body.status !== old.status) {
      const actorNameU = await getActorName(actorId);
      const deptIdU    = await getTicketDept(old.created_by, old.assigned_to);
      await notify({
        type: 'ticket.status_changed', ticketId: id, ticketTitle: (old.title as string),
        actorId: actorId!, actorName: actorNameU, extra: req.body.status,
        creatorId: old.created_by ?? undefined, assigneeId: old.assigned_to ?? undefined,
        deptId: deptIdU, portal: getPortal(req),
      }).catch(() => {});
    }

    res.json({ ticket: dbTicket(rows[0]) });
  } catch (err) { next(err); }
});

// ── DELETE /tickets/:id — bootstrap admin only ──────────────
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const id      = Number(req.params.id);
    const actorId = req.auth?.userId ?? (req.body?.actorId ? Number(req.body.actorId) : null);
    const justification = (req.body?.justification || '').trim();

    // Check bootstrap admin
    const { rows: adminRows } = await pool.query(
      `SELECT is_bootstrap_admin FROM yc_tkt_mgmt.users WHERE id=$1`, [actorId]
    );
    if (!adminRows[0]?.is_bootstrap_admin) {
      return res.status(403).json({ error: 'forbidden', message: 'Only bootstrap admins can delete tickets' });
    }
    if (!justification) {
      return res.status(400).json({ error: 'justification_required', message: 'A justification is required to delete a ticket' });
    }

    const { rows } = await pool.query(`SELECT id, title FROM yc_tkt_mgmt.tickets WHERE id = $1`, [id]);
    if (!rows[0]) return res.status(404).json({ error: 'not_found' });
    await pool.query(`DELETE FROM yc_tkt_mgmt.tickets WHERE id = $1`, [id]);
    await logAudit({ userId: actorId ?? undefined, actorEmail: req.auth?.email, action: 'ticket.delete', module: 'tickets', targetType: 'ticket', targetId: id, metadata: { title: rows[0].title, justification }, req });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// ── POST /tickets/:id/request-extension — assignee requests new due date ──
router.post('/:id/request-extension', requireAuth, async (req, res, next) => {
  try {
    const id      = Number(req.params.id);
    const actorId = req.auth?.userId ?? (req.body.actorId ? Number(req.body.actorId) : null);
    const { newDueDate, note } = req.body || {};

    if (!newDueDate) {
      return res.status(400).json({ error: 'missing_fields', message: 'newDueDate is required' });
    }

    const { rows: tRows } = await pool.query(`SELECT * FROM yc_tkt_mgmt.tickets WHERE id=$1`, [id]);
    if (!tRows[0]) return res.status(404).json({ error: 'not_found' });

    // Only the assignee may request an extension
    if (tRows[0].assigned_to !== actorId) {
      return res.status(403).json({ error: 'forbidden', message: 'Only the assigned person can request a time extension' });
    }
    if (['resolved','closed'].includes(tRows[0].status)) {
      return res.status(400).json({ error: 'invalid_status', message: 'Cannot request extension on a closed/resolved ticket' });
    }

    await ensureAttachmentsColumn();
    const { rows } = await pool.query(
      `UPDATE yc_tkt_mgmt.tickets
         SET extension_requested_due=$2,
             extension_request_status='pending',
             extension_requested_at=NOW(),
             extension_request_note=$3,
             updated_at=NOW()
       WHERE id=$1 RETURNING *`,
      [id, newDueDate, note?.trim() || null]
    );

    await pool.query(
      `INSERT INTO yc_tkt_mgmt.activity (ticket_id, user_id, action, details)
       VALUES ($1,$2,'extension_requested',$3)`,
      [id, actorId, JSON.stringify({ newDueDate, note: note?.trim() || null })]
    );

    const { rows: allAp } = await pool.query(
      `SELECT ta.*, u.name AS user_name, u.email AS user_email
       FROM yc_tkt_mgmt.ticket_approvers ta JOIN yc_tkt_mgmt.users u ON u.id=ta.approver_user_id
       WHERE ta.ticket_id=$1`, [id]
    );
    const t = dbTicket(rows[0]);
    t.approvers = allAp.map(dbApprover);

    // Notify (awaited before responding — see note above)
    const actorName = await getActorName(actorId);
    const deptId    = await getTicketDept(tRows[0].created_by, tRows[0].assigned_to);
    await notify({
      type: 'ticket.extension_requested', ticketId: id, ticketTitle: tRows[0].title,
      actorId: actorId!, actorName, creatorId: tRows[0].created_by ?? undefined,
      assigneeId: tRows[0].assigned_to ?? undefined,
      approverIds: allAp.map(r => r.approver_user_id), deptId, extra: newDueDate,
      portal: getPortal(req),
    }).catch(() => {});
    await notifyExtensionRequested(id, actorId!, newDueDate, note?.trim()).catch(() => {});

    res.json({ ticket: t });
  } catch (err) { next(err); }
});

// ── POST /tickets/:id/respond-extension — creator approves/denies ──
router.post('/:id/respond-extension', requireAuth, async (req, res, next) => {
  try {
    const id      = Number(req.params.id);
    const actorId = req.auth?.userId ?? (req.body.actorId ? Number(req.body.actorId) : null);
    const { action, note } = req.body || {};

    if (!['approve','deny'].includes(action)) {
      return res.status(400).json({ error: 'invalid_action', message: 'action must be "approve" or "deny"' });
    }

    const { rows: tRows } = await pool.query(`SELECT * FROM yc_tkt_mgmt.tickets WHERE id=$1`, [id]);
    if (!tRows[0]) return res.status(404).json({ error: 'not_found' });

    // Only an approver may respond to extension requests
    const { rows: apCheck } = await pool.query(
      `SELECT 1 FROM yc_tkt_mgmt.ticket_approvers WHERE ticket_id=$1 AND approver_user_id=$2`,
      [id, actorId]
    );
    if (!apCheck[0]) {
      return res.status(403).json({ error: 'forbidden', message: 'Only an approver can respond to extension requests' });
    }
    if (tRows[0].extension_request_status !== 'pending') {
      return res.status(400).json({ error: 'no_pending_request', message: 'No pending extension request on this ticket' });
    }

    let updateSql: string;
    const newStatus = action === 'approve' ? 'approved' : 'denied';

    if (action === 'approve') {
      updateSql = `UPDATE yc_tkt_mgmt.tickets
         SET due_date=extension_requested_due,
             expected_completion=extension_requested_due,
             extension_request_status='approved',
             updated_at=NOW()
       WHERE id=$1 RETURNING *`;
    } else {
      updateSql = `UPDATE yc_tkt_mgmt.tickets
         SET extension_request_status='denied',
             updated_at=NOW()
       WHERE id=$1 RETURNING *`;
    }

    const { rows } = await pool.query(updateSql, [id]);

    await pool.query(
      `INSERT INTO yc_tkt_mgmt.activity (ticket_id, user_id, action, details)
       VALUES ($1,$2,'extension_responded',$3)`,
      [id, actorId, JSON.stringify({ action: newStatus, note: note?.trim() || null })]
    );

    const { rows: allAp } = await pool.query(
      `SELECT ta.*, u.name AS user_name, u.email AS user_email
       FROM yc_tkt_mgmt.ticket_approvers ta JOIN yc_tkt_mgmt.users u ON u.id=ta.approver_user_id
       WHERE ta.ticket_id=$1`, [id]
    );
    const t = dbTicket(rows[0]);
    t.approvers = allAp.map(dbApprover);

    // Notify (awaited before responding — see note above)
    const actorName = await getActorName(actorId);
    const deptId    = await getTicketDept(tRows[0].created_by, tRows[0].assigned_to);
    const evType = action === 'approve' ? 'ticket.extension_approved' : 'ticket.extension_denied';
    await notify({
      type: evType, ticketId: id, ticketTitle: tRows[0].title,
      actorId: actorId!, actorName, creatorId: tRows[0].created_by ?? undefined,
      assigneeId: tRows[0].assigned_to ?? undefined,
      approverIds: allAp.map(r => r.approver_user_id), deptId,
      extra: action === 'approve' ? tRows[0].extension_requested_due : undefined,
      portal: getPortal(req),
    }).catch(() => {});
    if (action === 'approve') {
      await notifyExtensionApproved(id, actorId!, tRows[0].extension_requested_due).catch(() => {});
    } else {
      await notifyExtensionRejected(id, actorId!, note?.trim()).catch(() => {});
    }

    res.json({ ticket: t });
  } catch (err) { next(err); }
});

// ── POST /tickets/:id/escalate — manager escalates to any user ─
// Reassigns ticket + logs full escalation trail
router.post('/:id/escalate', requireAuth, async (req, res, next) => {
  try {
    const id     = Number(req.params.id);
    const userId = req.auth?.userId ?? (req.body.actorId ? Number(req.body.actorId) : null);
    if (!userId) return res.status(400).json({ error: 'missing_actor', message: 'actorId is required' });
    const { escalateToUserId, reason } = req.body || {};

    if (!escalateToUserId) {
      return res.status(400).json({ error: 'missing_fields', message: 'escalateToUserId is required' });
    }
    if (!reason?.trim()) {
      return res.status(400).json({ error: 'missing_fields', message: 'Escalation reason is required' });
    }

    // Verify target user exists
    const { rows: targetRows } = await pool.query(
      `SELECT id, name, email FROM yc_tkt_mgmt.users WHERE id = $1`, [escalateToUserId]
    );
    if (!targetRows[0]) return res.status(404).json({ error: 'user_not_found', message: 'Escalation target user not found' });

    // Get current ticket
    const { rows: tRows } = await pool.query(`SELECT * FROM yc_tkt_mgmt.tickets WHERE id = $1`, [id]);
    if (!tRows[0]) return res.status(404).json({ error: 'not_found' });
    const previousAssignee = tRows[0].assigned_to;

    // Log escalation history
    await pool.query(
      `INSERT INTO yc_tkt_mgmt.ticket_escalations (ticket_id, escalated_by, escalated_to, reason, previous_assignee)
       VALUES ($1,$2,$3,$4,$5)`,
      [id, userId, escalateToUserId, reason.trim(), previousAssignee || null]
    );

    // Reassign + mark escalated
    const { rows } = await pool.query(
      `UPDATE yc_tkt_mgmt.tickets
       SET assigned_to=$1, is_escalated=TRUE, escalated_to=$1,
           escalated_by=$2, escalated_at=NOW(), escalation_reason=$3, updated_at=NOW()
       WHERE id=$4 RETURNING *`,
      [escalateToUserId, userId, reason.trim(), id]
    );

    // Activity log
    await pool.query(
      `INSERT INTO yc_tkt_mgmt.activity (ticket_id, user_id, action, details)
       VALUES ($1,$2,'escalated',$3)`,
      [id, userId,
       JSON.stringify({ from: previousAssignee ? String(previousAssignee) : null, to: String(escalateToUserId), reason: reason.trim(), escalatedTo: targetRows[0].name, escalatedToEmail: targetRows[0].email })]
    );

    await logAudit({ userId, actorEmail: req.auth?.email, action: 'ticket.escalate', module: 'tickets', targetType: 'ticket', targetId: id, metadata: { escalateToUserId, reason: reason.trim() }, req });

    // Fetch approvers for response
    const { rows: apRows } = await pool.query(
      `SELECT ta.*, u.name AS user_name, u.email AS user_email
       FROM yc_tkt_mgmt.ticket_approvers ta
       JOIN yc_tkt_mgmt.users u ON u.id = ta.approver_user_id
       WHERE ta.ticket_id=$1`, [id]
    );

    // Fetch escalation trail
    const { rows: escRows } = await pool.query(
      `SELECT te.*,
              ub.name AS escalated_by_name,
              ut.name AS escalated_to_name
       FROM yc_tkt_mgmt.ticket_escalations te
       JOIN yc_tkt_mgmt.users ub ON ub.id = te.escalated_by
       JOIN yc_tkt_mgmt.users ut ON ut.id = te.escalated_to
       WHERE te.ticket_id=$1 ORDER BY te.created_at ASC`, [id]
    );

    const t = dbTicket(rows[0]) as ReturnType<typeof dbTicket> & { escalations: unknown[] };
    t.approvers = apRows.map(dbApprover);
    t.escalations = escRows;

    // Notify (awaited before responding — see note above)
    const actorNameE = await getActorName(userId);
    const deptIdE    = await getTicketDept(tRows[0].created_by, escalateToUserId);
    await notify({
      type: 'ticket.escalated', ticketId: id, ticketTitle: tRows[0].title,
      actorId: userId, actorName: actorNameE, creatorId: tRows[0].created_by ?? undefined,
      assigneeId: escalateToUserId, deptId: deptIdE, portal: getPortal(req),
    }).catch(() => {});
    await notifyTicketEscalated(id, userId, reason?.trim()).catch(() => {});

    res.json({ ticket: t });
  } catch (err) { next(err); }
});

// ── GET /tickets/:id/escalations — escalation trail ─────────
router.get('/:id/escalations', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { rows } = await pool.query(
      `SELECT te.*,
              ub.name AS escalated_by_name, ub.email AS escalated_by_email,
              ut.name AS escalated_to_name, ut.email AS escalated_to_email
       FROM yc_tkt_mgmt.ticket_escalations te
       JOIN yc_tkt_mgmt.users ub ON ub.id = te.escalated_by
       JOIN yc_tkt_mgmt.users ut ON ut.id = te.escalated_to
       WHERE te.ticket_id=$1 ORDER BY te.created_at ASC`, [id]
    );
    res.json({ escalations: rows });
  } catch (err) { next(err); }
});

// ── POST /tickets/:id/attachments — add file(s) to existing ticket ──
router.post('/:id/attachments', requireAuth, async (req, res, next) => {
  try {
    const ticketId = Number(req.params.id);
    const { attachments: newAtts } = req.body || {};
    if (!Array.isArray(newAtts) || !newAtts.length) {
      return res.status(400).json({ error: 'missing_attachments' });
    }
    const actorId = req.auth?.userId ?? null;

    // Fetch current attachments
    const { rows: tRows } = await pool.query(
      `SELECT attachments FROM yc_tkt_mgmt.tickets WHERE id = $1`, [ticketId]
    );
    if (!tRows[0]) return res.status(404).json({ error: 'not_found' });

    const existing: unknown[] = Array.isArray(tRows[0].attachments) ? tRows[0].attachments : [];
    const sanitised = newAtts.slice(0, 10).map((a: Record<string, unknown>) => ({
      name:    String(a.name    || 'file'),
      type:    String(a.type    || 'application/octet-stream'),
      size:    Number(a.size    || 0),
      content: String(a.content || ''),
    }));
    const merged = [...existing, ...sanitised];

    const { rows } = await pool.query(
      `UPDATE yc_tkt_mgmt.tickets SET attachments = $1::jsonb, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [JSON.stringify(merged), ticketId]
    );

    // Activity log
    await pool.query(
      `INSERT INTO yc_tkt_mgmt.activity (ticket_id, user_id, action, details) VALUES ($1,$2,'attachment_added',$3)`,
      [ticketId, actorId, JSON.stringify({ count: sanitised.length, names: sanitised.map(a => a.name) })]
    );

    const t = dbTicket(rows[0]);
    // Notify (awaited before responding — see note above)
    await notifyAttachmentAdded(ticketId, actorId!, sanitised.map(a => a.name)).catch(() => {});

    res.json({ ticket: t, attachments: t.attachments });
  } catch (err) { next(err); }
});

// ── GET /tickets/:id/comments ───────────────────────────────
router.get('/:id/comments', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM yc_tkt_mgmt.comments WHERE ticket_id = $1 ORDER BY created_at ASC`,
      [Number(req.params.id)]
    );
    res.json({ comments: rows.map(dbComment) });
  } catch (err) { next(err); }
});

// ── POST /tickets/:id/comments ──────────────────────────────
router.post('/:id/comments', requireAuth, async (req, res, next) => {
  try {
    const ticketId = Number(req.params.id);
    const { body, isInternal } = req.body || {};
    if (!body?.trim()) return res.status(400).json({ error: 'missing_body' });
    const actorId = req.auth?.userId ?? (req.body.actorId ? Number(req.body.actorId) : null);

    // Try new schema (user_id/content) first, fall back to old (author_id/body)
    let rows: Record<string, unknown>[];
    try {
      ({ rows } = await pool.query(
        `INSERT INTO yc_tkt_mgmt.comments (ticket_id, user_id, content) VALUES ($1,$2,$3) RETURNING *`,
        [ticketId, actorId, body.trim()]
      ));
    } catch (_) {
      ({ rows } = await pool.query(
        `INSERT INTO yc_tkt_mgmt.comments (ticket_id, author_id, body, is_internal) VALUES ($1,$2,$3,$4) RETURNING *`,
        [ticketId, actorId, body.trim(), !!isInternal]
      ));
    }
    // Activity log
    await pool.query(
      `INSERT INTO yc_tkt_mgmt.activity (ticket_id, user_id, action) VALUES ($1,$2,'commented')`,
      [ticketId, actorId]
    );
    // Notify (awaited before responding — see note above)
    await notifyCommentAdded(ticketId, actorId!, body.trim()).catch(() => {});

    res.status(201).json({ comment: dbComment(rows[0]) });
  } catch (err) { next(err); }
});

// ── GET /tickets/:id/log — unified audit timeline ────────────────────────────
router.get('/:id/log', requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    // Ticket metadata with user + category + priority labels
    const { rows: tRows } = await pool.query(
      `SELECT t.*,
         cr.name  AS requester_name,  cr.email AS requester_email,
         as2.name AS assignee_name,   as2.email AS assignee_email,
         cat.label AS category_label,
         p.label   AS priority_label
       FROM yc_tkt_mgmt.tickets t
       LEFT JOIN yc_tkt_mgmt.users cr  ON cr.id  = t.created_by
       LEFT JOIN yc_tkt_mgmt.users as2 ON as2.id = t.assigned_to
       LEFT JOIN yc_tkt_mgmt.categories cat ON cat.id = t.category_id
       LEFT JOIN yc_tkt_mgmt.priorities   p   ON p.id   = t.priority_id
       WHERE t.id = $1`, [id]
    );
    if (!tRows[0]) return res.status(404).json({ error: 'not_found' });

    // Activity with actor names
    const { rows: actRows } = await pool.query(
      `SELECT a.id, a.ticket_id, a.user_id, a.action, a.details, a.created_at,
              u.name AS actor_name
         FROM yc_tkt_mgmt.activity a
         LEFT JOIN yc_tkt_mgmt.users u ON u.id = a.user_id
        WHERE a.ticket_id = $1
        ORDER BY a.created_at ASC`, [id]
    );

    // Approval history (immutable audit log)
    await ensureApprovalHistoryTable();
    const { rows: ahRows } = await pool.query(
      `SELECT id, approver_user_id, approver_name, action, comments, resolution_note, round, acted_at
         FROM yc_tkt_mgmt.ticket_approval_history
        WHERE ticket_id = $1
        ORDER BY acted_at ASC`, [id]
    );

    // Comments with author names
    let cmtRows: Record<string, unknown>[] = [];
    try {
      const { rows } = await pool.query(
        `SELECT c.id, COALESCE(c.user_id, c.author_id) AS user_id,
                COALESCE(c.content, c.body) AS body,
                c.created_at,
                COALESCE(c.is_internal, false) AS is_internal,
                u.name AS actor_name
           FROM yc_tkt_mgmt.comments c
           LEFT JOIN yc_tkt_mgmt.users u ON u.id = COALESCE(c.user_id, c.author_id)
          WHERE c.ticket_id = $1
          ORDER BY c.created_at ASC`, [id]
      );
      cmtRows = rows;
    } catch (_) { /* schema mismatch — skip */ }

    // Resolve user IDs stored in assignment event details → names
    const assignUserIds = new Set<number>();
    for (const row of actRows) {
      if (row.action === 'assigned') {
        const d = row.details
          ? (typeof row.details === 'string' ? JSON.parse(row.details as string) : row.details) as Record<string, unknown>
          : {};
        if (d.to   && !isNaN(Number(d.to)))   assignUserIds.add(Number(d.to));
        if (d.from && !isNaN(Number(d.from))) assignUserIds.add(Number(d.from));
      }
    }
    const userNameMap: Record<number, string> = {};
    if (assignUserIds.size > 0) {
      const ids = [...assignUserIds];
      const { rows: uRows } = await pool.query(
        `SELECT id, name FROM yc_tkt_mgmt.users WHERE id = ANY($1::int[])`, [ids]
      );
      for (const u of uRows) userNameMap[Number(u.id)] = u.name;
    }

    // Build unified timeline
    const timeline: Record<string, unknown>[] = [];

    for (const row of actRows) {
      const details = row.details
        ? (typeof row.details === 'string' ? JSON.parse(row.details as string) : row.details) as Record<string, unknown>
        : {};
      // Enrich assignment events: replace numeric IDs with resolved names
      if (row.action === 'assigned') {
        if (details.to   && userNameMap[Number(details.to)])   details.toName   = userNameMap[Number(details.to)];
        if (details.from && userNameMap[Number(details.from)]) details.fromName = userNameMap[Number(details.from)];
      }
      timeline.push({ type: 'activity', action: row.action, actorId: row.user_id,
        actorName: row.actor_name || 'System', details, at: row.created_at });
    }
    for (const row of ahRows) {
      timeline.push({ type: 'approval', action: row.action,
        actorId: row.approver_user_id, actorName: row.approver_name || 'Approver',
        details: { comments: row.comments, resolutionNote: row.resolution_note, round: row.round },
        at: row.acted_at });
    }
    for (const row of cmtRows) {
      timeline.push({ type: 'comment', action: 'commented', actorId: row.user_id,
        actorName: row.actor_name || 'User',
        details: { text: row.body, isInternal: row.is_internal }, at: row.created_at });
    }

    // Sort ascending by timestamp
    timeline.sort((a, b) =>
      new Date(a.at as string).getTime() - new Date(b.at as string).getTime()
    );

    res.json({ ticket: dbTicket(tRows[0]), timeline });
  } catch (err) { next(err); }
});

// ── GET /tickets/:id/activity ───────────────────────────────
router.get('/:id/activity', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM yc_tkt_mgmt.activity WHERE ticket_id = $1 ORDER BY created_at ASC`,
      [Number(req.params.id)]
    );
    res.json({ activity: rows.map(dbActivity) });
  } catch (err) { next(err); }
});

export default router;
