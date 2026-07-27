// ============================================================
// Vercel serverless function — wraps the Express app
// ============================================================
//
// Vercel routes every request matching the rewrite rule in vercel.json
// through this single function. Express handles routing internally.
//
// Cold start is ~150-300ms after first request; subsequent requests
// reuse the warm function instance for ~5-15 min.

import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import type { VercelRequest, VercelResponse } from '@vercel/node';

import { env } from '../src/config/env';
import { apiLimiter } from '../src/middleware/rateLimit.middleware';
import { errorHandler, notFound } from '../src/middleware/error.middleware';

import authRoutes          from '../src/modules/auth/auth.routes';
import userRoutes          from '../src/modules/users/users.routes';
import roleRoutes          from '../src/modules/roles/roles.routes';
import auditRoutes         from '../src/modules/audit/audit.routes';
import scheduleRoutes      from '../src/modules/schedules/schedules.routes';
import ticketRoutes        from '../src/modules/tickets/tickets.routes';
import notificationRoutes  from '../src/modules/notifications/notifications.routes';
import pushRoutes          from '../src/modules/notifications/push.routes';
import lookupRoutes        from '../src/modules/lookup/lookup.routes';
import orgRoutes           from '../src/modules/org/org.routes';
import vehicleRoutes       from '../src/modules/vehicles/vehicles.routes';
import { pool }            from '../src/db/pool';
import { sendEmail, buildSlaBreachHtml, type SlaBreachTicket } from '../src/modules/notifications/email.service';
import { ensureEmailTables } from '../src/services/email/email.migrate';
import { ensureArchiveTable } from '../src/modules/audit/archive.migrate';
import { processQueue }      from '../src/services/email/email.queue';
import { sendOverdueReminders, sendDueTomorrowReminders } from '../src/services/email/notification.service';
import emailAdminRoutes      from '../src/modules/email/email.routes';
import { sendCronNotification, ensurePushTable } from '../src/modules/notifications/notifications.service';

// ── Crash safety net ────────────────────────────────────────
// In serverless, an uncaught exception or unhandled promise rejection
// anywhere (including inside third-party libs like @azure/msal-node,
// which does some fire-and-forget background work) terminates the whole
// Node process. Vercel then reports FUNCTION_INVOCATION_FAILED with no
// application-level error response and no useful client-facing detail.
// Log loudly instead of letting the process die, so at minimum the
// request that's already in flight can still complete/respond.
process.on('unhandledRejection', (reason) => {
  console.error('[fatal] unhandledRejection — would have crashed the function:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[fatal] uncaughtException — would have crashed the function:', err);
});

// Ensure email tables exist on first cold start (idempotent)
ensureEmailTables().catch((e) => console.error('[startup] ensureEmailTables:', e));

// ── Performance indexes — idempotent, safe on every cold start ─────────────
// Run fire-and-forget so they don't delay the first request.
(async () => {
  const idxStatements = [
    // tickets — primary query filters and sort column
    `CREATE INDEX IF NOT EXISTS idx_tickets_status        ON yc_tkt_mgmt.tickets(status)`,
    `CREATE INDEX IF NOT EXISTS idx_tickets_created_at    ON yc_tkt_mgmt.tickets(created_at DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to   ON yc_tkt_mgmt.tickets(assigned_to)`,
    `CREATE INDEX IF NOT EXISTS idx_tickets_created_by    ON yc_tkt_mgmt.tickets(created_by)`,
    `CREATE INDEX IF NOT EXISTS idx_tickets_category_id   ON yc_tkt_mgmt.tickets(category_id)`,
    `CREATE INDEX IF NOT EXISTS idx_tickets_priority_id   ON yc_tkt_mgmt.tickets(priority_id)`,
    // Composite covering index for the common "open tickets" list query
    `CREATE INDEX IF NOT EXISTS idx_tickets_status_cat ON yc_tkt_mgmt.tickets(status, created_at DESC)`,
    // comments / activity — looked up by ticket_id after the main tickets fetch
    `CREATE INDEX IF NOT EXISTS idx_comments_ticket_id    ON yc_tkt_mgmt.comments(ticket_id)`,
    `CREATE INDEX IF NOT EXISTS idx_activity_ticket_id    ON yc_tkt_mgmt.activity(ticket_id)`,
    `CREATE INDEX IF NOT EXISTS idx_approvers_ticket_id   ON yc_tkt_mgmt.ticket_approvers(ticket_id)`,
    `CREATE INDEX IF NOT EXISTS idx_approvers_user_status ON yc_tkt_mgmt.ticket_approvers(approver_user_id, approval_status)`,
    // notifications
    `CREATE INDEX IF NOT EXISTS idx_notif_recipient ON yc_tkt_mgmt.notifications(recipient_id, status)`,
    // users — frequently joined on id; already has email index
    `CREATE INDEX IF NOT EXISTS idx_users_dept_id ON yc_tkt_mgmt.users(department_id)`,
    `CREATE INDEX IF NOT EXISTS idx_users_azure_oid ON yc_tkt_mgmt.users(azure_oid)`,
  ];
  for (const sql of idxStatements) {
    await pool.query(sql).catch((e: Error) =>
      console.warn('[startup] index skipped (may already exist):', e.message?.split('\n')[0])
    );
  }
  console.log('[startup] performance indexes ensured');
})().catch((e) => console.error('[startup] index creation error:', e));

// Ensure the activity log archive table exists on first cold start (idempotent)
ensureArchiveTable().catch((e) => console.error('[startup] ensureArchiveTable:', e));

// Ensure users.role column exists (schema patch — safe to run repeatedly)
pool.query(`ALTER TABLE yc_tkt_mgmt.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'staff'`)
  .then(() =>
    // Bootstrap admins get super_admin role if not already set
    pool.query(
      `UPDATE yc_tkt_mgmt.users
         SET role = 'super_admin'
       WHERE is_bootstrap_admin = TRUE AND (role IS NULL OR role = 'staff')`
    )
  )
  .catch((e) => console.error('[startup] ensure users.role column:', e));

// Build the Express app ONCE per cold start
const app = express();
app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// Allow both the primary frontend and the YPC webapp frontend
const ALLOWED_ORIGINS = new Set([
  env.FRONTEND_URL,
  'https://ypc-tms-webapp.vercel.app',
  'https://ypc-tms.vercel.app',
]);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.has(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET','POST','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
}));

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser(env.SESSION_SECRET));

// Health probe — bypass rate limit
app.get('/health', async (_req, res) => {
  const { pool } = await import('../src/db/pool');
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, time: new Date().toISOString(), runtime: 'vercel' });
  } catch (err) {
    res.status(503).json({ ok: false, error: 'database_unavailable' });
  }
});

app.use('/auth',          apiLimiter);
app.use('/users',         apiLimiter);
app.use('/roles',         apiLimiter);
app.use('/audit-logs',    apiLimiter);
app.use('/tickets',       apiLimiter);
app.use('/schedules',     apiLimiter);
app.use('/notifications', apiLimiter);
app.use('/push',          apiLimiter);
app.use('/lookup',        apiLimiter);

app.use('/auth',          authRoutes);
app.use('/users',         userRoutes);
app.use('/roles',         roleRoutes);
app.use('/audit-logs',    auditRoutes);
app.use('/tickets',       ticketRoutes);
app.use('/schedules',     scheduleRoutes);
app.use('/notifications', notificationRoutes);
app.use('/push',          pushRoutes);
app.use('/lookup',        lookupRoutes);
app.use('/org',           orgRoutes);
app.use('/vehicles',      apiLimiter);
app.use('/vehicles',      vehicleRoutes);

// ── /yc/* prefix aliases — for ypc-tms-webapp compatibility ──────────────
// ypc-tms-webapp calls /yc/<route> for Yahweh Care portal requests;
// this backend serves those same routes at the root level, so we alias them.
app.use('/yc/auth',       apiLimiter); app.use('/yc/auth',       authRoutes);
app.use('/yc/tickets',    apiLimiter); app.use('/yc/tickets',    ticketRoutes);
app.use('/yc/users',      apiLimiter); app.use('/yc/users',      userRoutes);
app.use('/yc/org',        apiLimiter); app.use('/yc/org',        orgRoutes);
app.use('/yc/vehicles',   apiLimiter); app.use('/yc/vehicles',   vehicleRoutes);
app.use('/yc/lookup',     apiLimiter); app.use('/yc/lookup',     lookupRoutes);

app.use('/email',         apiLimiter);
app.use('/email',         emailAdminRoutes);

// ── SLA breach cron — called by Vercel Cron daily ─────────
// Secured by CRON_SECRET header to prevent public access.
app.post('/cron/sla-check', async (req, res) => {
  // Verify cron secret
  const secret = env.CRON_SECRET;
  const provided = req.headers['x-cron-secret'] || req.headers['authorization']?.replace('Bearer ', '');
  if (secret && provided !== secret) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  try {
    // Find tickets past their due date that haven't been alerted yet
    const { rows: breached } = await pool.query(`
      SELECT t.id, t.title, t.due_date, t.category_id, t.priority_id,
             c.name AS category_name,
             COALESCE(u.name, 'Unassigned') AS assignee_name,
             EXTRACT(DAY FROM NOW() - t.due_date)::int AS days_overdue
        FROM yc_tkt_mgmt.tickets t
        LEFT JOIN yc_tkt_mgmt.categories c ON c.id = t.category_id
        LEFT JOIN yc_tkt_mgmt.users u ON u.id = t.assignee_id
       WHERE t.due_date < NOW()
         AND t.status NOT IN ('resolved', 'closed')
         AND (t.sla_breach_alerted_at IS NULL OR t.sla_breach_alerted_at < NOW() - INTERVAL '24 hours')
       ORDER BY t.due_date ASC
       LIMIT 100
    `);

    if (!breached.length) {
      return res.json({ ok: true, alerted: 0 });
    }

    // Get admin + director emails
    const { rows: adminRows } = await pool.query(`
      SELECT DISTINCT u.email
        FROM yc_tkt_mgmt.users u
        LEFT JOIN yc_tkt_mgmt.staff_positions sp ON sp.user_id = u.id AND sp.is_primary = TRUE
        LEFT JOIN yc_tkt_mgmt.positions p ON p.id = sp.position_id
       WHERE u.is_active = TRUE
         AND u.email IS NOT NULL
         AND (u.is_bootstrap_admin = TRUE
              OR LOWER(COALESCE(p.position_type,'')) = 'director'
              OR u.role IN ('super_admin', 'admin', 'hr'))
    `);
    const alertEmails: string[] = adminRows.map((r: { email: string }) => r.email).filter(Boolean);

    if (alertEmails.length) {
      const tickets: SlaBreachTicket[] = breached.map((r: Record<string, unknown>) => ({
        id:          r.id as number,
        title:       String(r.title || `Ticket #${r.id}`),
        assigneeName:String(r.assignee_name || 'Unassigned'),
        daysOverdue: Number(r.days_overdue) || 1,
        priority:    String(r.priority_id || 'Normal'),
        category:    String(r.category_name || r.category_id || 'General'),
      }));

      const html = buildSlaBreachHtml(tickets);
      await sendEmail(
        alertEmails,
        `⚠️ SLA Breach Alert — ${tickets.length} ticket${tickets.length !== 1 ? 's' : ''} overdue`,
        html,
      );
    }

    // Mark tickets as alerted (add column if it doesn't exist)
    await pool.query(`
      ALTER TABLE yc_tkt_mgmt.tickets
        ADD COLUMN IF NOT EXISTS sla_breach_alerted_at TIMESTAMPTZ
    `).catch(() => {}); // ignore if already exists

    const breachedIds = breached.map((r: Record<string, unknown>) => r.id);
    await pool.query(
      `UPDATE yc_tkt_mgmt.tickets SET sla_breach_alerted_at = NOW() WHERE id = ANY($1)`,
      [breachedIds]
    );

    res.json({ ok: true, alerted: breached.length, emailsSent: alertEmails.length });
  } catch (err) {
    console.error('[cron/sla-check]', err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// ── Email queue retry cron — every 5 minutes ──────────────
app.post('/cron/email-retry', async (req, res) => {
  const secret   = env.CRON_SECRET;
  const provided = req.headers['x-cron-secret'] || req.headers['authorization']?.replace('Bearer ', '');
  if (secret && provided !== secret) return res.status(401).json({ error: 'unauthorized' });
  try {
    const result = await processQueue();
    res.json({ ok: true, ...result });
  } catch (err) {
    console.error('[cron/email-retry]', err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// ── Due-tomorrow reminders — daily 7am ────────────────────
app.post('/cron/due-tomorrow', async (req, res) => {
  const secret   = env.CRON_SECRET;
  const provided = req.headers['x-cron-secret'] || req.headers['authorization']?.replace('Bearer ', '');
  if (secret && provided !== secret) return res.status(401).json({ error: 'unauthorized' });
  try {
    await sendDueTomorrowReminders();
    res.json({ ok: true });
  } catch (err) {
    console.error('[cron/due-tomorrow]', err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// ── Enhanced SLA overdue cron (replaces old standalone send) ──
// The existing /cron/sla-check still runs the admin digest;
// this new endpoint sends per-assignee overdue reminders via queue.
app.post('/cron/overdue-reminders', async (req, res) => {
  const secret   = env.CRON_SECRET;
  const provided = req.headers['x-cron-secret'] || req.headers['authorization']?.replace('Bearer ', '');
  if (secret && provided !== secret) return res.status(401).json({ error: 'unauthorized' });
  try {
    await sendOverdueReminders();
    res.json({ ok: true });
  } catch (err) {
    console.error('[cron/overdue-reminders]', err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// ── Approval reminder cron — notifies approvers on tickets pending >24h ───────
app.post('/cron/approval-reminders', async (req, res) => {
  const secret   = env.CRON_SECRET;
  const provided = req.headers['x-cron-secret'] || req.headers['authorization']?.replace('Bearer ', '');
  if (secret && provided !== secret) return res.status(401).json({ error: 'unauthorized' });
  try {
    await ensurePushTable();
    // Find tickets in pending_approval for >24h with their pending approvers
    const { rows } = await pool.query(`
      SELECT t.id AS ticket_id, t.title, ta.approver_user_id
        FROM yc_tkt_mgmt.tickets t
        JOIN yc_tkt_mgmt.ticket_approvers ta ON ta.ticket_id = t.id
       WHERE t.status = 'pending_approval'
         AND t.updated_at < NOW() - INTERVAL '24 hours'
         AND ta.approval_status = 'Pending'
    `);
    let sent = 0;
    for (const row of rows) {
      await sendCronNotification({
        recipientId:  row.approver_user_id,
        ticketId:     row.ticket_id,
        ticketTitle:  row.title,
        subject:      `Approval Reminder: Ticket #${row.ticket_id}`,
        body:         `Ticket #${row.ticket_id} "${row.title}" is awaiting your approval for over 24 hours`,
      });
      sent++;
    }
    res.json({ ok: true, sent });
  } catch (err) {
    console.error('[cron/approval-reminders]', err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// ── Daily approvals summary cron — per-approver pending count ─────────────────
app.post('/cron/daily-approvals-summary', async (req, res) => {
  const secret   = env.CRON_SECRET;
  const provided = req.headers['x-cron-secret'] || req.headers['authorization']?.replace('Bearer ', '');
  if (secret && provided !== secret) return res.status(401).json({ error: 'unauthorized' });
  try {
    await ensurePushTable();
    // Count pending approvals per approver
    const { rows } = await pool.query(`
      SELECT ta.approver_user_id,
             COUNT(*) AS pending_count,
             MIN(t.id) AS sample_ticket_id,
             MIN(t.title) AS sample_title
        FROM yc_tkt_mgmt.ticket_approvers ta
        JOIN yc_tkt_mgmt.tickets t ON t.id = ta.ticket_id
       WHERE t.status = 'pending_approval'
         AND ta.approval_status = 'Pending'
       GROUP BY ta.approver_user_id
    `);
    let sent = 0;
    for (const row of rows) {
      const count = Number(row.pending_count);
      if (count === 0) continue;
      // Insert in-app notification (no ticket ID for summary)
      const subject = `Daily Summary: ${count} Ticket${count !== 1 ? 's' : ''} Awaiting Your Approval`;
      const body    = `You have ${count} ticket${count !== 1 ? 's' : ''} pending your approval. Oldest: "${row.sample_title}"`;
      await pool.query(
        `INSERT INTO yc_tkt_mgmt.notifications
           (recipient_id, ticket_id, channel, subject, body, status)
         VALUES ($1, $2, 'push', $3, $4, 'pending')`,
        [row.approver_user_id, row.sample_ticket_id, subject, body]
      );
      // Also send web push via the service
      await sendCronNotification({
        recipientId:  row.approver_user_id,
        ticketId:     Number(row.sample_ticket_id),
        ticketTitle:  row.sample_title,
        subject,
        body,
      });
      sent++;
    }
    res.json({ ok: true, sent });
  } catch (err) {
    console.error('[cron/daily-approvals-summary]', err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

app.use(notFound);
app.use(errorHandler);

// Vercel serverless handler — adapts Express to Vercel's request/response interface
export default function handler(req: VercelRequest, res: VercelResponse) {
  return app(req as unknown as express.Request, res as unknown as express.Response);
}
