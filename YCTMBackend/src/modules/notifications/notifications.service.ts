// ============================================================
// Notifications Service — in-app + web push
//
// Recipient logic is event-specific (not role-broadcast):
//   ticket.created          → assignee + approvers
//   ticket.assigned         → new assignee only
//   ticket.completed        → approvers only
//   ticket.approved         → assignee + creator
//   ticket.rejected         → assignee + creator
//   ticket.reopened         → assignee
//   ticket.closed           → creator + assignee
//   ticket.escalated        → escalated user + dept manager
//   ticket.comment_added    → creator + assignee + approvers (minus actor)
//   ticket.attachment_added → creator + assignee + approvers (minus actor)
//   ticket.extension_requested → dept manager + approvers
//   ticket.extension_approved  → assignee
//   ticket.extension_denied    → assignee
//   ticket.critical         → assignee + dept manager + director
//   ticket.assignee_deactivated → creator (reassign prompt — also emailed directly,
//                                 unlike other ticket events, since there is no
//                                 equivalent in the queue-based email pipeline)
//   ticket.status_changed   → creator + assignee (legacy fallback)
//
// UserEvents (user.created/user.position_changed/user.deleted) → the
// affected staff member (targetUserId) + bootstrap admins + directors.
// The affected staff member gets their own personally-addressed subject/
// body (in-app, push, AND email — email includes them even if user.deleted
// just set is_active=FALSE, since they're exactly who needs to know);
// admins/directors get an observer-facing summary instead. See
// buildUserEventMessageForTarget() / email.service.ts's sendUserEventEmailToRole().
// ============================================================

import webpush from 'web-push';
import { pool } from '../../db/pool';
import { sendTicketEventEmailToRole, sendTicketEventEmail, sendUserEventEmailToRole, type RecipientRole } from './email.service';

// ── VAPID setup ───────────────────────────────────────────
const VAPID_PUBLIC  = process.env.VAPID_PUBLIC_KEY  || '';
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT     || 'mailto:admin@yahwehcare.com.au';

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
}

// ── DB migration ──────────────────────────────────────────
let migrationDone = false;
export async function ensurePushTable() {
  if (migrationDone) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS yc_tkt_mgmt.push_subscriptions (
        id         SERIAL PRIMARY KEY,
        user_id    INTEGER NOT NULL,
        endpoint   TEXT    NOT NULL,
        p256dh     TEXT    NOT NULL,
        auth       TEXT    NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, endpoint)
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS yc_tkt_mgmt.notifications (
        id             SERIAL PRIMARY KEY,
        recipient_id   INTEGER,
        recipient_email TEXT,
        ticket_id      INTEGER,
        channel        TEXT    NOT NULL DEFAULT 'push',
        subject        TEXT    NOT NULL,
        body           TEXT    NOT NULL,
        status         TEXT    NOT NULL DEFAULT 'pending',
        read_at        TIMESTAMPTZ,
        created_at     TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await pool.query(`
      ALTER TABLE yc_tkt_mgmt.tickets
        ADD COLUMN IF NOT EXISTS ndis_related BOOLEAN NOT NULL DEFAULT FALSE
    `);
    migrationDone = true;
  } catch (err) {
    console.error('[push] migration error', err);
  }
}

// ── Event types ───────────────────────────────────────────
export interface TicketEvent {
  type:
    | 'ticket.created'
    | 'ticket.assigned'
    | 'ticket.completed'
    | 'ticket.approved'
    | 'ticket.rejected'
    | 'ticket.reopened'
    | 'ticket.closed'
    | 'ticket.escalated'
    | 'ticket.comment_added'
    | 'ticket.attachment_added'
    | 'ticket.extension_requested'
    | 'ticket.extension_approved'
    | 'ticket.extension_denied'
    | 'ticket.critical'
    | 'ticket.assignee_deactivated' // assignee was deactivated — creator must reassign
    | 'ticket.status_changed'; // legacy
  ticketId:    number;
  ticketTitle: string;
  actorId:     number;
  actorName?:  string;
  creatorId?:  number;
  assigneeId?: number;
  approverIds?: number[];
  deptId?:     number;
  escalatedToId?: number; // for ticket.escalated — the user being escalated to
  extra?:      string;
  portal?:     'YPC' | 'YC'; // originating portal — used to select the correct from address
}

export interface UserEvent {
  type:
    | 'user.created'
    | 'user.position_changed'
    | 'user.deleted';
  targetUserId:   number;
  targetUserName: string;
  actorId:        number;
  actorName?:     string;
  deptId?:        number;
  extra?:         string;
}

export type NotifyEvent = TicketEvent | UserEvent;

// ── DB lookup helpers ─────────────────────────────────────
async function getDirectorIds(): Promise<number[]> {
  const { rows } = await pool.query(
    `SELECT DISTINCT u.id
       FROM yc_tkt_mgmt.users u
       JOIN yc_tkt_mgmt.staff_positions sp ON sp.user_id = u.id AND sp.is_primary = TRUE
       JOIN yc_tkt_mgmt.positions p ON p.id = sp.position_id
      WHERE LOWER(COALESCE(p.position_type,'')) = 'director' AND u.is_active = TRUE`
  );
  return rows.map(r => r.id);
}

async function getDeptManagerIds(deptId: number): Promise<number[]> {
  const { rows } = await pool.query(
    `SELECT DISTINCT u.id
       FROM yc_tkt_mgmt.users u
       JOIN yc_tkt_mgmt.staff_positions sp ON sp.user_id = u.id AND sp.is_primary = TRUE
       JOIN yc_tkt_mgmt.positions p ON p.id = sp.position_id
      WHERE LOWER(COALESCE(p.position_type,'')) = 'manager'
        AND u.department_id = $1 AND u.is_active = TRUE`,
    [deptId]
  );
  return rows.map(r => r.id);
}

// ── Event-specific recipient resolution ───────────────────
async function resolveRecipients(ev: NotifyEvent): Promise<number[]> {
  const set = new Set<number>();

  if (!('ticketId' in ev)) {
    // UserEvent — send to bootstrap admins + directors
    const { rows: admins } = await pool.query(
      `SELECT id FROM yc_tkt_mgmt.users WHERE is_bootstrap_admin = TRUE AND is_active = TRUE`
    );
    admins.forEach(r => set.add(r.id));
    (await getDirectorIds()).forEach(id => set.add(id));
    set.add(ev.targetUserId);
    return Array.from(set);
  }

  const te = ev as TicketEvent;

  switch (te.type) {
    case 'ticket.created':
      // → assignee + approvers
      if (te.assigneeId) set.add(te.assigneeId);
      (te.approverIds || []).forEach(id => { if (id) set.add(id); });
      break;

    case 'ticket.assigned':
      // → new assignee only
      if (te.assigneeId) set.add(te.assigneeId);
      break;

    case 'ticket.completed':
      // → approvers only (they need to review)
      (te.approverIds || []).forEach(id => { if (id) set.add(id); });
      break;

    case 'ticket.approved':
    case 'ticket.rejected':
      // → assignee + creator
      if (te.assigneeId) set.add(te.assigneeId);
      if (te.creatorId)  set.add(te.creatorId);
      break;

    case 'ticket.reopened':
      // → assignee
      if (te.assigneeId) set.add(te.assigneeId);
      break;

    case 'ticket.closed':
      // → creator + assignee
      if (te.creatorId)  set.add(te.creatorId);
      if (te.assigneeId) set.add(te.assigneeId);
      break;

    case 'ticket.escalated': {
      // → escalated-to user + dept manager
      const escalatedTo = te.escalatedToId || te.assigneeId;
      if (escalatedTo) set.add(escalatedTo);
      if (te.deptId) (await getDeptManagerIds(te.deptId)).forEach(id => set.add(id));
      break;
    }

    case 'ticket.comment_added':
    case 'ticket.attachment_added':
      // → creator + assignee + approvers (minus actor)
      if (te.creatorId)  set.add(te.creatorId);
      if (te.assigneeId) set.add(te.assigneeId);
      (te.approverIds || []).forEach(id => { if (id) set.add(id); });
      set.delete(te.actorId); // don't notify the person who acted
      break;

    case 'ticket.extension_requested':
      // → dept manager + approvers
      if (te.deptId) (await getDeptManagerIds(te.deptId)).forEach(id => set.add(id));
      (te.approverIds || []).forEach(id => { if (id) set.add(id); });
      break;

    case 'ticket.extension_approved':
    case 'ticket.extension_denied':
      // → assignee
      if (te.assigneeId) set.add(te.assigneeId);
      break;

    case 'ticket.critical': {
      // → assignee + dept manager + director
      if (te.assigneeId) set.add(te.assigneeId);
      if (te.deptId) (await getDeptManagerIds(te.deptId)).forEach(id => set.add(id));
      (await getDirectorIds()).forEach(id => set.add(id));
      break;
    }

    case 'ticket.assignee_deactivated':
      // → creator only (they need to reassign the ticket to someone active)
      if (te.creatorId) set.add(te.creatorId);
      break;

    case 'ticket.status_changed':
    default:
      // legacy fallback → creator + assignee
      if (te.creatorId)  set.add(te.creatorId);
      if (te.assigneeId) set.add(te.assigneeId);
      break;
  }

  return Array.from(set).filter(Boolean);
}

// ── Message templates ─────────────────────────────────────
// NOTE: for UserEvents, buildMessage() below produces the *admin/observer*
// facing copy (used for bootstrap admins + directors). The affected staff
// member themselves (ev.targetUserId) gets a distinct, personally-addressed
// message from buildUserEventMessageForTarget() instead — see notify()'s
// per-recipient loop, which picks whichever applies.
function buildMessage(ev: NotifyEvent): { subject: string; body: string } {
  const actor = ev.actorName || `User #${ev.actorId}`;

  if (!('ticketId' in ev)) {
    const ue = ev as UserEvent;
    switch (ue.type) {
      case 'user.created':
        return { subject: `New member added: ${ue.targetUserName}`, body: `${actor} added ${ue.targetUserName} to the team` };
      case 'user.position_changed':
        return { subject: `Position changed: ${ue.targetUserName}`, body: `${actor} changed ${ue.targetUserName}'s position to "${ue.extra || 'new role'}"` };
      case 'user.deleted':
        return { subject: `Member removed: ${ue.targetUserName}`, body: `${actor} removed ${ue.targetUserName} from the team` };
      default:
        return { subject: 'Yahwehcare notification', body: 'You have a new notification.' };
    }
  }

  const te = ev as TicketEvent;
  const tid  = `#${te.ticketId}`;
  const title = te.ticketTitle;

  switch (te.type) {
    case 'ticket.created':
      return {
        subject: `New Ticket ${tid}: ${title}`,
        body:    `A new ticket has been created and assigned to you: "${title}"`,
      };
    case 'ticket.assigned':
      return {
        subject: `Ticket ${tid} Assigned to You`,
        body:    `You have been assigned ticket ${tid}: "${title}"`,
      };
    case 'ticket.completed':
      return {
        subject: `Ticket ${tid} Ready for Approval`,
        body:    `${actor} has submitted ticket ${tid} for your approval: "${title}"`,
      };
    case 'ticket.approved':
      return {
        subject: `Ticket ${tid} Approved`,
        body:    `Your ticket ${tid} has been approved by ${actor}: "${title}"`,
      };
    case 'ticket.rejected':
      return {
        subject: `Ticket ${tid} Rejected`,
        body:    `Your ticket ${tid} was rejected by ${actor}: "${title}"`,
      };
    case 'ticket.reopened':
      return {
        subject: `Ticket ${tid} Reopened`,
        body:    `Ticket ${tid} has been reopened and requires your attention: "${title}"`,
      };
    case 'ticket.closed':
      return {
        subject: `Ticket ${tid} Closed`,
        body:    `Ticket ${tid} has been closed: "${title}"`,
      };
    case 'ticket.escalated':
      return {
        subject: `Ticket ${tid} Escalated to You`,
        body:    `Ticket ${tid} has been escalated to you by ${actor}: "${title}"`,
      };
    case 'ticket.comment_added':
      return {
        subject: `New Comment on Ticket ${tid}`,
        body:    `${actor} commented on ticket ${tid}: "${title}"`,
      };
    case 'ticket.attachment_added':
      return {
        subject: `New Attachment on Ticket ${tid}`,
        body:    `${actor} added an attachment to ticket ${tid}: "${title}"`,
      };
    case 'ticket.extension_requested':
      return {
        subject: `Extension Requested: Ticket ${tid}`,
        body:    `${actor} requested a deadline extension for ticket ${tid}: "${title}"${te.extra ? ` — proposed date: ${te.extra}` : ''}`,
      };
    case 'ticket.extension_approved':
      return {
        subject: `Extension Approved: Ticket ${tid}`,
        body:    `Your deadline extension for ticket ${tid} has been approved${te.extra ? ` — new due date: ${te.extra}` : ''}`,
      };
    case 'ticket.extension_denied':
      return {
        subject: `Extension Denied: Ticket ${tid}`,
        body:    `Your deadline extension request for ticket ${tid} was denied: "${title}"`,
      };
    case 'ticket.critical':
      return {
        subject: `Critical Ticket ${tid} Requires Attention`,
        body:    `A critical priority ticket has been assigned: ${tid} — "${title}"`,
      };
    case 'ticket.assignee_deactivated':
      return {
        subject: `Action Needed: Reassign Ticket ${tid}`,
        body:    `${te.extra || 'The assignee'} is no longer with Yahwehcare. Ticket ${tid} ("${title}") needs to be reassigned to someone else.`,
      };
    case 'ticket.status_changed':
      return {
        subject: `Ticket ${tid} Status Updated`,
        body:    `${actor} changed status of ticket ${tid} to "${te.extra || 'unknown'}": "${title}"`,
      };
    default:
      return { subject: 'Yahwehcare notification', body: 'You have a new notification.' };
  }
}

// Personalised in-app/push copy for the staff member a UserEvent is ABOUT —
// addressed to them directly, distinct from the admin/director wording above.
function buildUserEventMessageForTarget(ue: UserEvent): { subject: string; body: string } {
  const actor = ue.actorName || `User #${ue.actorId}`;
  switch (ue.type) {
    case 'user.created':
      return { subject: 'Welcome to Yahwehcare!', body: `Your account has been created by ${actor}. You can now sign in to Yahwehcare Ticket Management.` };
    case 'user.position_changed':
      return { subject: 'Your Position Has Been Updated', body: `${actor} changed your position to "${ue.extra || 'a new role'}".` };
    case 'user.deleted':
      return { subject: 'Your Account Has Been Deactivated', body: `${actor} has deactivated your Yahwehcare account. You will no longer be able to sign in.` };
    default:
      return { subject: 'Yahwehcare notification', body: 'You have a new notification about your account.' };
  }
}

// ── Web push to one user's subscriptions ──────────────────
async function sendPush(userId: number, payload: object): Promise<void> {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) return;

  const { rows: subs } = await pool.query(
    `SELECT endpoint, p256dh, auth FROM yc_tkt_mgmt.push_subscriptions WHERE user_id = $1`,
    [userId]
  );
  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload),
        { TTL: 60 * 60 }
      );
    } catch (err: unknown) {
      const e = err as { statusCode?: number };
      if (e.statusCode === 410) {
        await pool.query(
          `DELETE FROM yc_tkt_mgmt.push_subscriptions WHERE user_id = $1 AND endpoint = $2`,
          [userId, sub.endpoint]
        );
      } else {
        console.warn(`[push] sendNotification failed for user ${userId}:`, e.statusCode || err);
      }
    }
  }
}

// ── Role-aware email dispatch for ticket events ───────────
// Resolves each role group separately and sends a role-specific
// email so each recipient knows exactly why they received it.
async function sendRoleAwareTicketEmails(te: TicketEvent): Promise<void> {
  // Helper: fetch emails for a list of user IDs, de-duplicate
  async function emailsFor(ids: number[]): Promise<string[]> {
    const unique = [...new Set(ids.filter(Boolean))];
    if (!unique.length) return [];
    const { rows } = await pool.query(
      `SELECT email FROM yc_tkt_mgmt.users WHERE id = ANY($1) AND is_active = TRUE AND email IS NOT NULL`,
      [unique]
    );
    return rows.map((r: { email: string }) => r.email).filter(Boolean);
  }

  // Build role → user-id groups from the event
  type RoleGroup = { role: RecipientRole; ids: number[] };
  const groups: RoleGroup[] = [];

  switch (te.type) {
    case 'ticket.created':
      if (te.assigneeId) groups.push({ role: 'assignee', ids: [te.assigneeId] });
      if (te.approverIds?.length) groups.push({ role: 'approver', ids: te.approverIds });
      break;

    case 'ticket.assigned':
      if (te.assigneeId) groups.push({ role: 'assignee', ids: [te.assigneeId] });
      break;

    case 'ticket.completed':
      if (te.approverIds?.length) groups.push({ role: 'approver', ids: te.approverIds });
      break;

    case 'ticket.approved':
      if (te.assigneeId) groups.push({ role: 'assignee', ids: [te.assigneeId] });
      if (te.creatorId)  groups.push({ role: 'creator',  ids: [te.creatorId] });
      break;

    case 'ticket.rejected':
      if (te.assigneeId) groups.push({ role: 'assignee', ids: [te.assigneeId] });
      if (te.creatorId)  groups.push({ role: 'creator',  ids: [te.creatorId] });
      break;

    case 'ticket.escalated': {
      const escalatedTo = te.escalatedToId || te.assigneeId;
      if (escalatedTo) groups.push({ role: 'assignee', ids: [escalatedTo] });
      if (te.approverIds?.length) groups.push({ role: 'approver', ids: te.approverIds });
      break;
    }

    case 'ticket.comment_added':
    case 'ticket.attachment_added': {
      const actorId = te.actorId;
      const assigneeIds = te.assigneeId && te.assigneeId !== actorId ? [te.assigneeId] : [];
      const approverIds = (te.approverIds || []).filter(id => id && id !== actorId);
      const creatorIds  = te.creatorId && te.creatorId !== actorId ? [te.creatorId] : [];
      if (assigneeIds.length) groups.push({ role: 'assignee', ids: assigneeIds });
      if (approverIds.length) groups.push({ role: 'approver', ids: approverIds });
      if (creatorIds.length)  groups.push({ role: 'creator',  ids: creatorIds });
      break;
    }

    case 'ticket.extension_requested':
      if (te.approverIds?.length) groups.push({ role: 'approver', ids: te.approverIds });
      break;

    case 'ticket.extension_approved':
    case 'ticket.extension_denied':
    case 'ticket.reopened':
      if (te.assigneeId) groups.push({ role: 'assignee', ids: [te.assigneeId] });
      break;

    case 'ticket.critical': {
      if (te.assigneeId) groups.push({ role: 'assignee', ids: [te.assigneeId] });
      if (te.approverIds?.length) groups.push({ role: 'approver', ids: te.approverIds });
      break;
    }

    case 'ticket.closed':
      if (te.creatorId)  groups.push({ role: 'creator',  ids: [te.creatorId] });
      if (te.assigneeId) groups.push({ role: 'assignee', ids: [te.assigneeId] });
      break;

    default:
      // status_changed and unknown events — send admin-style to both creator + assignee
      if (te.assigneeId) groups.push({ role: 'assignee', ids: [te.assigneeId] });
      if (te.creatorId)  groups.push({ role: 'creator',  ids: [te.creatorId] });
      break;
  }

  // Send one email per role group (parallel)
  await Promise.all(
    groups.map(async ({ role, ids }) => {
      const emails = await emailsFor(ids);
      if (emails.length) {
        await sendTicketEventEmailToRole(te, emails, role);
      }
    })
  );
}

// ── Main entry point ──────────────────────────────────────
export async function notify(ev: NotifyEvent): Promise<void> {
  try {
    await ensurePushTable();
    const { subject, body } = buildMessage(ev);
    const recipients = await resolveRecipients(ev);
    if (!recipients.length) return;

    const isUserEvent   = !('ticketId' in ev);
    const targetUserId  = isUserEvent ? (ev as UserEvent).targetUserId : undefined;
    // Precompute the target's own personalised copy once — reused for their
    // in-app row, their push notification, and (below) their email.
    const targetMessage = isUserEvent ? buildUserEventMessageForTarget(ev as UserEvent) : null;

    const ticketId = 'ticketId' in ev ? (ev as TicketEvent).ticketId : undefined;

    await Promise.all(
      recipients.map(async (recipientId) => {
        // The staff member a UserEvent is about gets their own addressed
        // message (e.g. "Your Account Has Been Deactivated"); everyone else
        // (bootstrap admins / directors) gets the observer-facing default.
        const isTargetRecipient = isUserEvent && recipientId === targetUserId;
        const msg = isTargetRecipient && targetMessage ? targetMessage : { subject, body };
        const pushPayload = {
          title: msg.subject,
          body:  msg.body,
          icon:  '/icon-512.png',
          badge: '/icon-512.png',
          data:  {
            ticketId,
            type: ev.type,
            url:  ticketId ? `/tickets/${ticketId}` : '/',
          },
        };
        try {
          await pool.query(
            `INSERT INTO yc_tkt_mgmt.notifications
               (recipient_id, ticket_id, channel, subject, body, status)
             VALUES ($1, $2, 'push', $3, $4, 'pending')`,
            [recipientId, ticketId ?? null, msg.subject, msg.body]
          );
        } catch (dbErr) {
          console.warn('[notify] db insert error', dbErr);
        }
        await sendPush(recipientId, pushPayload);
      })
    );

    // Email notifications for ticket events are handled by the separate
    // queue-based pipeline (services/email/notification.service.ts →
    // notifyTicketCreated/notifyTicketApproved/etc, called alongside notify()
    // at each route). That pipeline has retry/backoff and is what the Email
    // Config admin page reads from. Sending here too would duplicate every
    // ticket email, so this function only sends email for user lifecycle
    // events (which have no equivalent in the queue-based pipeline).
    if (isUserEvent) {
      const ue = ev as UserEvent;
      try {
        // The target's own email must be included even though we just
        // deactivated them (is_active is now FALSE for user.deleted) — that
        // is precisely the person who needs to hear about it. Everyone else
        // (admins/directors) must still be active to receive email.
        const { rows: emailRows } = await pool.query(
          `SELECT id, email FROM yc_tkt_mgmt.users
            WHERE id = ANY($1) AND email IS NOT NULL AND (is_active = TRUE OR id = $2)`,
          [recipients, ue.targetUserId]
        );
        const targetEmails = emailRows.filter((r: { id: number }) => r.id === ue.targetUserId).map((r: { email: string }) => r.email).filter(Boolean);
        const adminEmails  = emailRows.filter((r: { id: number }) => r.id !== ue.targetUserId).map((r: { email: string }) => r.email).filter(Boolean);
        await Promise.all([
          targetEmails.length ? sendUserEventEmailToRole(ue, targetEmails, 'target') : Promise.resolve(),
          adminEmails.length  ? sendUserEventEmailToRole(ue, adminEmails,  'admin')  : Promise.resolve(),
        ]);
      } catch (emailErr) {
        console.warn('[notify] email send error', emailErr);
      }
    } else if ((ev as TicketEvent).type === 'ticket.assignee_deactivated') {
      // Unlike other ticket events, this one has no equivalent in the
      // queue-based email pipeline (services/email/notification.service.ts)
      // — it's rare/administrative, not a ticket-lifecycle event those
      // notifyTicketXxx() functions cover — so it's safe to email directly
      // here without risking a duplicate send.
      try {
        const { rows: emailRows } = await pool.query(
          `SELECT email FROM yc_tkt_mgmt.users WHERE id = ANY($1) AND is_active = TRUE AND email IS NOT NULL`,
          [recipients]
        );
        const recipientEmails = emailRows.map((r: { email: string }) => r.email).filter(Boolean);
        if (recipientEmails.length) {
          await sendTicketEventEmailToRole(ev as TicketEvent, recipientEmails, 'creator');
        }
      } catch (emailErr) {
        console.warn('[notify] email send error', emailErr);
      }
    }

  } catch (err) {
    console.error('[notify] unhandled error', err);
  }
}

// ── Cron: send a notification for a single ticket+user ────
// Used by scheduled cron jobs (due tomorrow, overdue, etc.)
export async function sendCronNotification(opts: {
  recipientId: number;
  ticketId:    number;
  ticketTitle: string;
  subject:     string;
  body:        string;
}): Promise<void> {
  try {
    await ensurePushTable();

    const pushPayload = {
      title: opts.subject,
      body:  opts.body,
      icon:  '/icon-512.png',
      badge: '/icon-512.png',
      data:  { ticketId: opts.ticketId, type: 'cron', url: `/tickets/${opts.ticketId}` },
    };

    await pool.query(
      `INSERT INTO yc_tkt_mgmt.notifications
         (recipient_id, ticket_id, channel, subject, body, status)
       VALUES ($1, $2, 'push', $3, $4, 'pending')`,
      [opts.recipientId, opts.ticketId, opts.subject, opts.body]
    );

    await sendPush(opts.recipientId, pushPayload);
  } catch (err) {
    console.error('[cron-notify] error', err);
  }
}
