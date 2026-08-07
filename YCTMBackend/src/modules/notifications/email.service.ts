// ============================================================
// Email Service — role-aware ticket email templates
// Each recipient gets an email that clearly states:
//   1. WHY they are receiving it (their role: assignee / approver / creator / admin)
//   2. WHAT happened (the event reason)
//   3. WHAT to do next (CTA)
// ============================================================

import { Resend } from 'resend';
import { env } from '../../config/env';
import type { TicketEvent, UserEvent } from './notifications.service';

// ── Resend client (lazy init) ─────────────────────────────
let _resend: Resend | null = null;
function getResend(): Resend | null {
  if (!env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(env.RESEND_API_KEY);
  return _resend;
}

// ── Design tokens ─────────────────────────────────────────
const BRAND   = '#4F46E5';
const LIGHT   = '#EEF2FF';
const TEXT    = '#1E1B4B';
const MUTED   = '#6B7280';
const SUCCESS = '#10B981';
const WARN    = '#F97316';
const DANGER  = '#EF4444';
const PURPLE  = '#7C3AED';

// ── Base layout ───────────────────────────────────────────
function baseLayout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#F9FAFB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9FAFB;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="background:${BRAND};border-radius:12px 12px 0 0;padding:22px 32px;">
            <span style="color:#fff;font-size:21px;font-weight:700;letter-spacing:-0.4px;">Yahwehcare</span>
            <span style="color:rgba(255,255,255,0.55);font-size:12px;margin-left:8px;font-weight:500;">Ticket Management</span>
          </td>
        </tr>
        <tr>
          <td style="background:#fff;padding:32px;border-left:1px solid #E5E7EB;border-right:1px solid #E5E7EB;">
            ${body}
          </td>
        </tr>
        <tr>
          <td style="background:#F3F4F6;border:1px solid #E5E7EB;border-top:0;border-radius:0 0 12px 12px;padding:16px 32px;text-align:center;">
            <p style="margin:0;font-size:12px;color:${MUTED};">
              This is an automated notification from Yahwehcare Ticket Management.<br/>
              Please do not reply to this email.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Helpers ───────────────────────────────────────────────
function esc(s: string | undefined | null): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function badge(label: string, color: string, bg: string): string {
  return `<span style="display:inline-block;padding:3px 12px;border-radius:20px;background:${bg};color:${color};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;">${label}</span>`;
}

function rolePill(role: RecipientRole): string {
  const map: Record<RecipientRole, { label: string; color: string; bg: string }> = {
    assignee: { label: 'You are the Assignee',  color: '#1D4ED8', bg: '#DBEAFE' },
    approver: { label: 'You are the Approver',  color: PURPLE,    bg: '#EDE9FE' },
    creator:  { label: 'You are the Requester', color: '#065F46', bg: '#D1FAE5' },
    admin:    { label: 'Admin Notification',     color: '#92400E', bg: '#FEF3C7' },
  };
  const { label, color, bg } = map[role] ?? map.admin;
  return `<span style="display:inline-block;padding:3px 12px;border-radius:20px;background:${bg};color:${color};font-size:11px;font-weight:700;letter-spacing:0.04em;margin-left:6px;">${label}</span>`;
}

function keyValue(rows: Array<[string, string]>): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E5E7EB;border-radius:8px;overflow:hidden;margin:16px 0;">
    ${rows.map(([k, v], i) => `
    <tr style="background:${i % 2 === 0 ? '#F9FAFB' : '#fff'};">
      <td style="padding:10px 16px;font-size:12px;font-weight:600;color:${MUTED};width:35%;border-right:1px solid #E5E7EB;">${k}</td>
      <td style="padding:10px 16px;font-size:13px;color:${TEXT};">${v}</td>
    </tr>`).join('')}
  </table>`;
}

function ctaButton(text: string, url: string, color = BRAND): string {
  return `<div style="text-align:center;margin:24px 0;">
    <a href="${url}" style="display:inline-block;padding:12px 28px;background:${color};color:#fff;font-size:14px;font-weight:600;text-decoration:none;border-radius:8px;">${text}</a>
  </div>`;
}

function infoBox(text: string, color: string, bg: string, border: string): string {
  return `<div style="background:${bg};border:1px solid ${border};border-radius:8px;padding:14px 18px;margin:16px 0;font-size:13px;color:${color};line-height:1.6;">${text}</div>`;
}

// ── Recipient role type ───────────────────────────────────
export type RecipientRole = 'assignee' | 'approver' | 'creator' | 'admin';

// ── Role-aware subject builder ────────────────────────────
function buildSubject(ev: TicketEvent, role: RecipientRole): string {
  const tid   = `[TMS-${ev.ticketId}]`;
  const title = ev.ticketTitle;

  // Event-specific, role-specific subjects
  const subjects: Partial<Record<TicketEvent['type'], Partial<Record<RecipientRole, string>>>> = {
    'ticket.created': {
      assignee: `${tid} Action Required — You have been assigned a new ticket: "${title}"`,
      approver: `${tid} New Ticket for Your Review: "${title}"`,
      admin:    `${tid} New Ticket Created: "${title}"`,
    },
    'ticket.assigned': {
      assignee: `${tid} Ticket Assigned to You — Action Required: "${title}"`,
      admin:    `${tid} Ticket Assigned: "${title}"`,
    },
    'ticket.completed': {
      approver: `${tid} Your Approval Required — Ticket Completed: "${title}"`,
      admin:    `${tid} Ticket Ready for Approval: "${title}"`,
    },
    'ticket.approved': {
      assignee: `${tid} Great News — Your Ticket Resolution Has Been Approved: "${title}"`,
      creator:  `${tid} Your Ticket Has Been Resolved & Approved: "${title}"`,
      admin:    `${tid} Ticket Approved: "${title}"`,
    },
    'ticket.rejected': {
      assignee: `${tid} Action Required — Your Resolution Was Rejected: "${title}"`,
      creator:  `${tid} Ticket Resolution Rejected — Rework in Progress: "${title}"`,
      admin:    `${tid} Resolution Rejected: "${title}"`,
    },
    'ticket.escalated': {
      assignee: `${tid} Urgent: Your Ticket Has Been Escalated: "${title}"`,
      approver: `${tid} Urgent Escalation Requires Your Attention: "${title}"`,
      admin:    `${tid} Ticket Escalated: "${title}"`,
    },
    'ticket.status_changed': {
      assignee: `${tid} Status Update on Your Assigned Ticket: "${title}"`,
      creator:  `${tid} Status Update on Your Ticket: "${title}"`,
      admin:    `${tid} Ticket Status Changed: "${title}"`,
    },
    'ticket.comment_added': {
      assignee: `${tid} New Comment on Your Assigned Ticket: "${title}"`,
      approver: `${tid} New Comment on a Ticket Pending Your Approval: "${title}"`,
      creator:  `${tid} New Comment on Your Ticket: "${title}"`,
    },
    'ticket.attachment_added': {
      assignee: `${tid} New Attachment on Your Assigned Ticket: "${title}"`,
      approver: `${tid} New Attachment on a Ticket Pending Your Approval: "${title}"`,
      creator:  `${tid} New Attachment on Your Ticket: "${title}"`,
    },
    'ticket.extension_requested': {
      approver: `${tid} Extension Request Needs Your Approval: "${title}"`,
      admin:    `${tid} Deadline Extension Requested: "${title}"`,
    },
    'ticket.extension_approved': {
      assignee: `${tid} Your Extension Request Has Been Approved: "${title}"`,
    },
    'ticket.extension_denied': {
      assignee: `${tid} Your Extension Request Was Denied: "${title}"`,
    },
    'ticket.critical': {
      assignee: `${tid} CRITICAL — Urgent Ticket Assigned to You: "${title}"`,
      approver: `${tid} CRITICAL — Urgent Ticket Requires Your Attention: "${title}"`,
      admin:    `${tid} CRITICAL Ticket Alert: "${title}"`,
    },
    'ticket.assignee_deactivated': {
      creator: `${tid} Action Needed — Reassign This Ticket: "${title}"`,
      admin:   `${tid} Assignee Deactivated — Reassignment Needed: "${title}"`,
    },
  };

  return subjects[ev.type]?.[role] ?? subjects[ev.type]?.['admin'] ?? `${tid} Ticket Update: "${title}"`;
}

// ── Role-aware body builder ───────────────────────────────
function buildBody(ev: TicketEvent, role: RecipientRole, frontendUrl: string): string {
  const actor  = esc(ev.actorName || `User #${ev.actorId}`);
  const title  = esc(ev.ticketTitle);
  const tid    = ev.ticketId;
  const url    = `${frontendUrl}#tickets&id=${tid}`;
  const time   = new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney', dateStyle: 'medium', timeStyle: 'short' });

  // ── Event config ──
  type EventCfg = { badgeLabel: string; badgeColor: string; badgeBg: string; headline: string; reason: string; action: string; cta: string; ctaColor?: string };

  const roleName: Record<RecipientRole, string> = {
    assignee: 'the Assignee',
    approver: 'an Approver',
    creator:  'the Requester',
    admin:    'an Administrator',
  };

  const eventMap: Partial<Record<TicketEvent['type'], Partial<Record<RecipientRole, EventCfg>>>> = {
    'ticket.created': {
      assignee: {
        badgeLabel: 'New Ticket — Assigned to You', badgeColor: BRAND, badgeBg: LIGHT,
        headline:   title,
        reason:     `You are receiving this email because you have been assigned this ticket as <strong>the Assignee</strong>. It is your responsibility to action and resolve this ticket.`,
        action:     `<strong>${actor}</strong> submitted a new support request and it has been assigned to you.`,
        cta:        'Start Working on This Ticket →',
      },
      approver: {
        badgeLabel: 'New Ticket — You are an Approver', badgeColor: PURPLE, badgeBg: '#EDE9FE',
        headline:   title,
        reason:     `You are receiving this email because you are listed as <strong>an Approver</strong> for this ticket. You will be asked to review and approve the resolution when it is submitted.`,
        action:     `<strong>${actor}</strong> submitted a new support request that you will need to approve.`,
        cta:        'View Ticket →',
      },
      admin: {
        badgeLabel: 'New Ticket Created', badgeColor: BRAND, badgeBg: LIGHT,
        headline:   title,
        reason:     `You are receiving this email as an administrator notification of a new ticket.`,
        action:     `<strong>${actor}</strong> submitted a new support request.`,
        cta:        'View Ticket →',
      },
    },
    'ticket.assigned': {
      assignee: {
        badgeLabel: 'Ticket Assigned to You', badgeColor: '#1D4ED8', badgeBg: '#DBEAFE',
        headline:   title,
        reason:     `You are receiving this email because this ticket has been <strong>assigned to you as the Assignee</strong>. You are responsible for resolving this ticket.`,
        action:     `<strong>${actor}</strong> assigned this ticket to you. Please review and begin work.`,
        cta:        'View My Assigned Ticket →', ctaColor: '#1D4ED8',
      },
      admin: {
        badgeLabel: 'Ticket Assigned', badgeColor: '#1D4ED8', badgeBg: '#DBEAFE',
        headline:   title,
        reason:     `This ticket has been assigned to a new staff member.`,
        action:     `<strong>${actor}</strong> reassigned this ticket.`,
        cta:        'View Ticket →',
      },
    },
    'ticket.completed': {
      approver: {
        badgeLabel: 'Your Approval Required', badgeColor: PURPLE, badgeBg: '#EDE9FE',
        headline:   title,
        reason:     `You are receiving this email because you are listed as <strong>an Approver</strong> for this ticket. The assignee has marked it as complete and is waiting for your approval before it can be closed.`,
        action:     `<strong>${actor}</strong> has marked this ticket as complete and submitted it for your approval. Please review the work and approve or reject the resolution.`,
        cta:        'Review & Approve Resolution →', ctaColor: PURPLE,
      },
      admin: {
        badgeLabel: 'Pending Approval', badgeColor: PURPLE, badgeBg: '#EDE9FE',
        headline:   title,
        reason:     `A ticket has been completed and is awaiting approval.`,
        action:     `<strong>${actor}</strong> marked this ticket as complete. Approval is required.`,
        cta:        'Review Ticket →',
      },
    },
    'ticket.approved': {
      assignee: {
        badgeLabel: 'Your Resolution Has Been Approved', badgeColor: SUCCESS, badgeBg: '#ECFDF5',
        headline:   title,
        reason:     `You are receiving this email because you are <strong>the Assignee</strong> of this ticket. Your submitted resolution has been reviewed and approved.`,
        action:     `<strong>${actor}</strong> has approved your resolution. The ticket will now be closed. Well done!`,
        cta:        'View Closed Ticket →', ctaColor: SUCCESS,
      },
      creator: {
        badgeLabel: 'Your Ticket Has Been Resolved', badgeColor: SUCCESS, badgeBg: '#ECFDF5',
        headline:   title,
        reason:     `You are receiving this email because you are <strong>the Requester</strong> of this ticket. It has been resolved and approved.`,
        action:     `<strong>${actor}</strong> approved the resolution for your ticket. It is now closed.`,
        cta:        'View Resolved Ticket →', ctaColor: SUCCESS,
      },
      admin: {
        badgeLabel: 'Ticket Approved & Closed', badgeColor: SUCCESS, badgeBg: '#ECFDF5',
        headline:   title,
        reason:     `A ticket resolution has been approved and the ticket is now closed.`,
        action:     `<strong>${actor}</strong> approved the resolution.`,
        cta:        'View Ticket →', ctaColor: SUCCESS,
      },
    },
    'ticket.rejected': {
      assignee: {
        badgeLabel: 'Action Required — Resolution Rejected', badgeColor: DANGER, badgeBg: '#FEF2F2',
        headline:   title,
        reason:     `You are receiving this email because you are <strong>the Assignee</strong> of this ticket. Your submitted resolution has been reviewed and rejected. You must rework and resubmit.`,
        action:     `<strong>${actor}</strong> has rejected your resolution. Please review the feedback below, address the issues, and resubmit.${ev.extra ? `<br/><br/><strong>Rejection Reason:</strong> <em>"${esc(ev.extra)}"</em>` : ''}`,
        cta:        'Rework & Resubmit →', ctaColor: DANGER,
      },
      creator: {
        badgeLabel: 'Ticket Resolution Rejected', badgeColor: WARN, badgeBg: '#FFF7ED',
        headline:   title,
        reason:     `You are receiving this email because you are <strong>the Requester</strong> of this ticket. The resolution submitted by the assignee was rejected and is being reworked.`,
        action:     `<strong>${actor}</strong> rejected the resolution for your ticket. The assignee will need to rework and resubmit.`,
        cta:        'View Ticket Status →', ctaColor: WARN,
      },
      admin: {
        badgeLabel: 'Resolution Rejected', badgeColor: DANGER, badgeBg: '#FEF2F2',
        headline:   title,
        reason:     `A resolution has been rejected.`,
        action:     `<strong>${actor}</strong> rejected the resolution.${ev.extra ? ` Reason: "${esc(ev.extra)}"` : ''}`,
        cta:        'View Ticket →', ctaColor: DANGER,
      },
    },
    'ticket.escalated': {
      assignee: {
        badgeLabel: 'URGENT — Your Ticket Has Been Escalated', badgeColor: DANGER, badgeBg: '#FEF2F2',
        headline:   title,
        reason:     `You are receiving this email because you are <strong>the Assignee</strong> of this ticket and it has been escalated. Escalated tickets require immediate attention.`,
        action:     `<strong>${actor}</strong> escalated this ticket. Immediate action is required from you as the assignee.${ev.extra ? `<br/><br/><strong>Reason:</strong> <em>"${esc(ev.extra)}"</em>` : ''}`,
        cta:        'Respond to Escalation Now →', ctaColor: DANGER,
      },
      approver: {
        badgeLabel: 'URGENT — Escalation Requires Your Attention', badgeColor: DANGER, badgeBg: '#FEF2F2',
        headline:   title,
        reason:     `You are receiving this email because you are listed as <strong>an Approver</strong> and this ticket has been escalated. Please review and provide guidance.`,
        action:     `<strong>${actor}</strong> escalated this ticket for urgent attention.${ev.extra ? `<br/><br/><strong>Reason:</strong> <em>"${esc(ev.extra)}"</em>` : ''}`,
        cta:        'Review Escalated Ticket →', ctaColor: DANGER,
      },
      admin: {
        badgeLabel: 'Ticket Escalated', badgeColor: DANGER, badgeBg: '#FEF2F2',
        headline:   title,
        reason:     `A ticket has been escalated and requires attention.`,
        action:     `<strong>${actor}</strong> escalated this ticket.${ev.extra ? ` Reason: "${esc(ev.extra)}"` : ''}`,
        cta:        'Review Escalation →', ctaColor: DANGER,
      },
    },
    'ticket.status_changed': {
      assignee: {
        badgeLabel: 'Status Update on Your Assigned Ticket', badgeColor: '#0369A1', badgeBg: '#E0F2FE',
        headline:   title,
        reason:     `You are receiving this email because you are <strong>the Assignee</strong> of this ticket and its status has been updated.`,
        action:     `<strong>${actor}</strong> changed the status to <strong>${esc(ev.extra || 'updated')}</strong>.`,
        cta:        'View Ticket →',
      },
      creator: {
        badgeLabel: 'Status Update on Your Ticket', badgeColor: '#0369A1', badgeBg: '#E0F2FE',
        headline:   title,
        reason:     `You are receiving this email because you are <strong>the Requester</strong> of this ticket and its status has been updated.`,
        action:     `<strong>${actor}</strong> changed the status of your ticket to <strong>${esc(ev.extra || 'updated')}</strong>.`,
        cta:        'View Ticket →',
      },
      admin: {
        badgeLabel: 'Ticket Status Updated', badgeColor: '#0369A1', badgeBg: '#E0F2FE',
        headline:   title,
        reason:     `A ticket status has been updated.`,
        action:     `<strong>${actor}</strong> changed the status to <strong>${esc(ev.extra || 'updated')}</strong>.`,
        cta:        'View Ticket →',
      },
    },
    'ticket.comment_added': {
      assignee: {
        badgeLabel: 'New Comment on Your Assigned Ticket', badgeColor: '#0369A1', badgeBg: '#E0F2FE',
        headline:   title,
        reason:     `You are receiving this email because you are <strong>the Assignee</strong> and a comment was added to this ticket.`,
        action:     `<strong>${actor}</strong> added a comment.`,
        cta:        'View Comment →',
      },
      approver: {
        badgeLabel: 'New Comment on a Ticket Pending Your Approval', badgeColor: PURPLE, badgeBg: '#EDE9FE',
        headline:   title,
        reason:     `You are receiving this email because you are <strong>an Approver</strong> and a comment was added to a ticket pending your approval.`,
        action:     `<strong>${actor}</strong> added a comment.`,
        cta:        'View Comment →',
      },
      creator: {
        badgeLabel: 'New Comment on Your Ticket', badgeColor: '#065F46', badgeBg: '#D1FAE5',
        headline:   title,
        reason:     `You are receiving this email because you are <strong>the Requester</strong> and a comment was added to your ticket.`,
        action:     `<strong>${actor}</strong> added a comment.`,
        cta:        'View Comment →',
      },
      admin: {
        badgeLabel: 'New Comment', badgeColor: '#0369A1', badgeBg: '#E0F2FE',
        headline:   title,
        reason:     `A comment was added to a ticket.`,
        action:     `<strong>${actor}</strong> added a comment.`,
        cta:        'View Comment →',
      },
    },
    'ticket.critical': {
      assignee: {
        badgeLabel: 'CRITICAL — Assigned to You', badgeColor: DANGER, badgeBg: '#FEF2F2',
        headline:   title,
        reason:     `You are receiving this email because you are <strong>the Assignee</strong> of a CRITICAL priority ticket. This requires your immediate attention.`,
        action:     `<strong>${actor}</strong> flagged this ticket as critical priority. As the assignee, you must address this immediately.`,
        cta:        'Action Critical Ticket Now →', ctaColor: DANGER,
      },
      approver: {
        badgeLabel: 'CRITICAL — Requires Your Oversight', badgeColor: DANGER, badgeBg: '#FEF2F2',
        headline:   title,
        reason:     `You are receiving this email because you are <strong>an Approver / Manager</strong> and a critical ticket requires your oversight.`,
        action:     `<strong>${actor}</strong> flagged this ticket as critical priority.`,
        cta:        'Review Critical Ticket →', ctaColor: DANGER,
      },
      admin: {
        badgeLabel: 'CRITICAL Ticket Alert', badgeColor: DANGER, badgeBg: '#FEF2F2',
        headline:   title,
        reason:     `A critical ticket has been raised.`,
        action:     `<strong>${actor}</strong> flagged this ticket as critical priority.`,
        cta:        'View Critical Ticket →', ctaColor: DANGER,
      },
    },
    'ticket.assignee_deactivated': {
      creator: {
        badgeLabel: 'Action Needed — Reassign This Ticket', badgeColor: WARN, badgeBg: '#FFF7ED',
        headline:   title,
        reason:     `You are receiving this email because you are <strong>the Requester</strong> of this ticket. The staff member it was assigned to is no longer with Yahwehcare, so it needs a new assignee.`,
        action:     `${ev.extra || 'The assignee'} has been deactivated and can no longer work on tickets. Please open this ticket and reassign it to another staff member as soon as possible.`,
        cta:        'Reassign This Ticket →', ctaColor: WARN,
      },
      admin: {
        badgeLabel: 'Assignee Deactivated', badgeColor: WARN, badgeBg: '#FFF7ED',
        headline:   title,
        reason:     `A ticket's assignee has been deactivated and the ticket needs reassigning.`,
        action:     `${ev.extra || 'The assignee'} has been deactivated. This ticket needs a new assignee.`,
        cta:        'View Ticket →', ctaColor: WARN,
      },
    },
  };

  const cfg: EventCfg = eventMap[ev.type]?.[role] ?? eventMap[ev.type]?.['admin'] ?? {
    badgeLabel: 'Ticket Update', badgeColor: BRAND, badgeBg: LIGHT,
    headline:   title,
    reason:     `You are receiving this notification as ${roleName[role]}.`,
    action:     `<strong>${actor}</strong> updated ticket #${tid}.`,
    cta:        'View Ticket →',
  };

  return `
    <div style="margin-bottom:16px;">
      ${badge(cfg.badgeLabel, cfg.badgeColor, cfg.badgeBg)}
      ${rolePill(role)}
    </div>
    <h2 style="margin:0 0 16px;font-size:20px;color:${TEXT};font-weight:700;">${cfg.headline}</h2>

    <!-- Why you're receiving this -->
    ${infoBox(`📌 <strong>Why you received this email:</strong> ${cfg.reason}`, '#374151', '#F9FAFB', '#E5E7EB')}

    <!-- What happened -->
    <p style="margin:16px 0;font-size:14px;color:${MUTED};line-height:1.6;"><strong>What happened:</strong><br/>${cfg.action}</p>

    ${keyValue([
      ['Ticket',  `#${tid} — ${title}`],
      ['Event',   cfg.badgeLabel],
      ['By',      actor],
      ['Time',    time],
    ])}

    ${ctaButton(cfg.cta, url, cfg.ctaColor ?? BRAND)}
  `;
}

// ── Main build functions ──────────────────────────────────
export function buildTicketEventHtml(ev: TicketEvent, frontendUrl: string, role: RecipientRole = 'admin'): string {
  const body = buildBody(ev, role, frontendUrl);
  const subj = buildSubject(ev, role);
  return baseLayout(subj, body);
}

export function buildTicketEventSubject(ev: TicketEvent, role: RecipientRole = 'admin'): string {
  return buildSubject(ev, role);
}

// ── Scheduled report email ────────────────────────────────
export interface ReportData {
  total: number;
  open: number;
  resolved: number;
  escalated: number;
  slaBreached: number;
  slaRate: number;
  topCategory: string;
  generatedAt: string;
  reportType: string;
  rows: Array<{ label: string; value: number; pct?: number }>;
}

export function buildScheduledReportHtml(
  scheduleName: string,
  frequency: string,
  data: ReportData,
): string {
  const statBox = (label: string, value: string | number, color: string) =>
    `<td style="text-align:center;padding:16px;background:#F9FAFB;border-radius:8px;border:1px solid #E5E7EB;">
      <div style="font-size:28px;font-weight:800;color:${color};">${value}</div>
      <div style="font-size:11px;color:${MUTED};margin-top:4px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">${label}</div>
    </td>`;

  const tableRows = data.rows.slice(0, 10).map((r, i) => `
    <tr style="background:${i % 2 === 0 ? '#F9FAFB' : '#fff'};">
      <td style="padding:10px 16px;font-size:13px;color:${TEXT};">${r.label}</td>
      <td style="padding:10px 16px;font-size:13px;color:${TEXT};text-align:right;font-weight:600;">${r.value}</td>
      ${r.pct !== undefined ? `<td style="padding:10px 16px;font-size:12px;color:${MUTED};text-align:right;">${r.pct}%</td>` : ''}
    </tr>`).join('');

  const body = `
    <h2 style="margin:0 0 4px;font-size:20px;font-weight:700;color:${TEXT};">${esc(scheduleName)}</h2>
    <p style="margin:0 0 24px;font-size:13px;color:${MUTED};">
      ${frequency.charAt(0).toUpperCase() + frequency.slice(1)} report · Generated ${data.generatedAt}
    </p>
    <table width="100%" cellpadding="8" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        ${statBox('Total Tickets', data.total, BRAND)}
        <td width="8"></td>
        ${statBox('Open', data.open, WARN)}
        <td width="8"></td>
        ${statBox('Resolved', data.resolved, SUCCESS)}
        <td width="8"></td>
        ${statBox('SLA Rate', `${data.slaRate}%`, data.slaRate >= 80 ? SUCCESS : data.slaRate >= 60 ? WARN : DANGER)}
      </tr>
    </table>
    ${data.escalated > 0 ? `<div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:8px;padding:12px 16px;margin-bottom:16px;"><p style="margin:0;font-size:13px;color:#DC2626;"><strong>${data.escalated} escalated ticket${data.escalated !== 1 ? 's' : ''}</strong> require attention.</p></div>` : ''}
    ${data.rows.length > 0 ? `
    <h3 style="margin:0 0 8px;font-size:14px;font-weight:700;color:${TEXT};">Breakdown</h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E5E7EB;border-radius:8px;overflow:hidden;">
      <tr style="background:${BRAND};">
        <td style="padding:10px 16px;font-size:12px;font-weight:700;color:#fff;">Label</td>
        <td style="padding:10px 16px;font-size:12px;font-weight:700;color:#fff;text-align:right;">Count</td>
        ${data.rows[0]?.pct !== undefined ? '<td style="padding:10px 16px;font-size:12px;font-weight:700;color:#fff;text-align:right;">Share</td>' : ''}
      </tr>
      ${tableRows}
    </table>` : ''}
    ${ctaButton('Open Analytics Dashboard →', `${env.FRONTEND_URL}?page=analytics`)}
  `;

  return baseLayout(`${scheduleName} — ${frequency} report`, body);
}

// ── SLA breach alert ──────────────────────────────────────
export interface SlaBreachTicket {
  id: number;
  title: string;
  assigneeName: string;
  daysOverdue: number;
  priority: string;
  category: string;
}

export function buildSlaBreachHtml(tickets: SlaBreachTicket[]): string {
  const rows = tickets.slice(0, 20).map((t, i) => {
    const urgency = t.daysOverdue >= 7 ? DANGER : t.daysOverdue >= 3 ? WARN : '#EAB308';
    return `<tr style="background:${i % 2 === 0 ? '#F9FAFB' : '#fff'};">
      <td style="padding:10px 16px;font-size:13px;color:${TEXT};">#${t.id} — ${esc(t.title)}</td>
      <td style="padding:10px 16px;font-size:12px;color:${MUTED};">${esc(t.assigneeName || 'Unassigned')}</td>
      <td style="padding:10px 16px;font-size:12px;color:${MUTED};">${esc(t.category)}</td>
      <td style="padding:10px 16px;font-size:13px;font-weight:700;color:${urgency};text-align:right;">${t.daysOverdue}d</td>
    </tr>`;
  }).join('');

  const body = `
    <div style="margin-bottom:20px;">${badge('SLA Breach Alert', DANGER, '#FEF2F2')}</div>
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:${TEXT};">${tickets.length} Ticket${tickets.length !== 1 ? 's' : ''} Past SLA Due Date</h2>
    <p style="margin:0 0 24px;font-size:14px;color:${MUTED};line-height:1.6;">The following tickets have exceeded their SLA due dates and require immediate attention.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E5E7EB;border-radius:8px;overflow:hidden;margin-bottom:24px;">
      <tr style="background:${DANGER};">
        <td style="padding:10px 16px;font-size:12px;font-weight:700;color:#fff;">Ticket</td>
        <td style="padding:10px 16px;font-size:12px;font-weight:700;color:#fff;">Assignee</td>
        <td style="padding:10px 16px;font-size:12px;font-weight:700;color:#fff;">Category</td>
        <td style="padding:10px 16px;font-size:12px;font-weight:700;color:#fff;text-align:right;">Overdue</td>
      </tr>
      ${rows}
    </table>
    ${tickets.length > 20 ? `<p style="font-size:12px;color:${MUTED};text-align:center;">+ ${tickets.length - 20} more tickets.</p>` : ''}
    ${ctaButton('Review Overdue Tickets →', `${env.FRONTEND_URL}?page=tickets&filter=overdue`, DANGER)}
  `;

  return baseLayout('SLA Breach Alert', body);
}

// ── Portal → from address resolver ───────────────────────
function resolveFromAddress(portal?: 'YPC' | 'YC'): string {
  if (portal === 'YPC') return env.EMAIL_FROM_YPC;
  if (portal === 'YC')  return env.EMAIL_FROM_YC;
  return env.EMAIL_FROM; // fallback when portal is unknown
}

// ── Core send ─────────────────────────────────────────────
export async function sendEmail(
  to: string | string[],
  subject: string,
  html: string,
  portal?: 'YPC' | 'YC',
): Promise<void> {
  const client = getResend();
  if (!client) { console.warn('[email] RESEND_API_KEY not configured — email skipped'); return; }
  const recipients = (Array.isArray(to) ? to : [to]).filter(Boolean);
  if (!recipients.length) return;
  const from = resolveFromAddress(portal);
  try {
    const { error } = await client.emails.send({ from, to: recipients, subject, html });
    if (error) console.error('[email] Resend error:', error);
  } catch (err) {
    console.error('[email] send failed:', err);
  }
}

// ── Role-aware ticket event email ─────────────────────────
export async function sendTicketEventEmailToRole(
  ev: TicketEvent,
  recipientEmails: string[],
  role: RecipientRole,
): Promise<void> {
  if (!recipientEmails.length) return;
  const subject = buildSubject(ev, role);
  const html    = buildTicketEventHtml(ev, env.FRONTEND_URL, role);
  await sendEmail(recipientEmails, subject, html, ev.portal);
}

// ── Legacy: send same email to all recipients (used as fallback) ──
export async function sendTicketEventEmail(ev: TicketEvent, recipientEmails: string[]): Promise<void> {
  if (!recipientEmails.length) return;
  const subject = buildSubject(ev, 'admin');
  const html    = buildTicketEventHtml(ev, env.FRONTEND_URL, 'admin');
  await sendEmail(recipientEmails, subject, html, ev.portal);
}

// ── User event email — role-aware (target vs admin) ──────
// Mirrors the ticket-event pattern above: the person the event is ABOUT
// (the "target" — e.g. the staff member being deactivated) gets a message
// addressed to them directly, while bootstrap admins/directors get an
// observer-facing summary. Both share the same visual design system.
export type UserRecipientRole = 'target' | 'admin';

function buildUserEventSubject(ev: UserEvent, role: UserRecipientRole): string {
  const name = ev.targetUserName;
  switch (ev.type) {
    case 'user.created':
      return role === 'target'
        ? `Welcome to Yahwehcare — Your Account Is Ready`
        : `[TMS] New Team Member Added: ${name}`;
    case 'user.position_changed':
      return role === 'target'
        ? `Your Position Has Been Updated`
        : `[TMS] Position Changed: ${name}`;
    case 'user.deleted':
      return role === 'target'
        ? `Your Yahwehcare Account Has Been Deactivated`
        : `[TMS] Staff Deactivated: ${name}`;
    default:
      return `[TMS] Team Update: ${name}`;
  }
}

function buildUserEventBody(ev: UserEvent, role: UserRecipientRole, frontendUrl: string): string {
  const actor = esc(ev.actorName || `User #${ev.actorId}`);
  const name  = esc(ev.targetUserName);
  const position = esc(ev.extra || 'a new role');

  type Cfg = { badgeLabel: string; badgeColor: string; badgeBg: string; headline: string; reason: string; action: string; cta?: string; ctaUrl?: string; ctaColor?: string };

  const cfgMap: Record<UserEvent['type'], Partial<Record<UserRecipientRole, Cfg>>> = {
    'user.created': {
      target: {
        badgeLabel: 'Account Created', badgeColor: SUCCESS, badgeBg: '#ECFDF5',
        headline:   'Welcome to Yahwehcare!',
        reason:     `You are receiving this email because a Yahwehcare account was created for you by <strong>${actor}</strong>.`,
        action:     `You can now sign in with your Microsoft (Azure AD) account to access Yahwehcare Ticket Management.`,
        cta: 'Sign In →', ctaUrl: frontendUrl, ctaColor: SUCCESS,
      },
      admin: {
        badgeLabel: 'New Team Member', badgeColor: BRAND, badgeBg: LIGHT,
        headline:   `${name} joined the team`,
        reason:     `You are receiving this email as a Bootstrap Admin / Director.`,
        action:     `<strong>${actor}</strong> added <strong>${name}</strong> to the team.`,
        cta: 'Open Staff Management →', ctaUrl: `${frontendUrl}#staff-management`,
      },
    },
    'user.position_changed': {
      target: {
        badgeLabel: 'Position Updated', badgeColor: BRAND, badgeBg: LIGHT,
        headline:   'Your position has been updated',
        reason:     `You are receiving this email because your position at Yahwehcare was changed by <strong>${actor}</strong>.`,
        action:     `Your position is now <strong>${position}</strong>.`,
        cta: 'View My Profile →', ctaUrl: `${frontendUrl}#settings`,
      },
      admin: {
        badgeLabel: 'Position Changed', badgeColor: BRAND, badgeBg: LIGHT,
        headline:   `${name}'s position changed`,
        reason:     `You are receiving this email as a Bootstrap Admin / Director.`,
        action:     `<strong>${actor}</strong> changed <strong>${name}</strong>'s position to <strong>${position}</strong>.`,
        cta: 'Open Staff Management →', ctaUrl: `${frontendUrl}#staff-management`,
      },
    },
    'user.deleted': {
      target: {
        badgeLabel: 'Account Deactivated', badgeColor: DANGER, badgeBg: '#FEF2F2',
        headline:   'Your account has been deactivated',
        reason:     `You are receiving this email because your Yahwehcare account was deactivated by <strong>${actor}</strong>.`,
        action:     `You will no longer be able to sign in to Yahwehcare Ticket Management, and any open tickets assigned to you have been flagged for reassignment. If you believe this is a mistake, please contact your manager or the Yahwehcare admin team directly.`,
        // No CTA — a deactivated account has nowhere to sign back in to.
      },
      admin: {
        badgeLabel: 'Staff Deactivated', badgeColor: WARN, badgeBg: '#FFF7ED',
        headline:   `${name} has been deactivated`,
        reason:     `You are receiving this email as a Bootstrap Admin / Director.`,
        action:     `<strong>${actor}</strong> deactivated <strong>${name}</strong>'s account. Their org chart position(s) are now vacant, and any tickets they were assigned to have been flagged for the ticket creator to reassign.`,
        cta: 'Open Staff Management →', ctaUrl: `${frontendUrl}#staff-management`,
      },
    },
  };

  const cfg: Cfg = cfgMap[ev.type]?.[role] ?? {
    badgeLabel: 'Team Update', badgeColor: BRAND, badgeBg: LIGHT,
    headline:   `${name} was updated`,
    reason:     `You are receiving this email as ${role === 'target' ? 'the affected team member' : 'a Bootstrap Admin / Director'}.`,
    action:     `<strong>${actor}</strong> updated ${name}'s account.`,
  };

  return `
    <div style="margin-bottom:16px;">${badge(cfg.badgeLabel, cfg.badgeColor, cfg.badgeBg)}</div>
    <h2 style="margin:0 0 16px;font-size:20px;color:${TEXT};font-weight:700;">${cfg.headline}</h2>
    ${infoBox(`📌 <strong>Why you received this email:</strong> ${cfg.reason}`, '#374151', '#F9FAFB', '#E5E7EB')}
    <p style="margin:16px 0;font-size:14px;color:${MUTED};line-height:1.6;">${cfg.action}</p>
    ${cfg.cta && cfg.ctaUrl ? ctaButton(cfg.cta, cfg.ctaUrl, cfg.ctaColor ?? BRAND) : ''}
  `;
}

/** Send a role-aware user-lifecycle email — target (the affected staff member)
 *  or admin (bootstrap admins / directors observing the change) get distinct
 *  subject lines and body copy, matching the ticket-event email pattern. */
export async function sendUserEventEmailToRole(
  ev: UserEvent,
  recipientEmails: string[],
  role: UserRecipientRole,
): Promise<void> {
  if (!recipientEmails.length) return;
  const subject = buildUserEventSubject(ev, role);
  const html    = baseLayout(subject, buildUserEventBody(ev, role, env.FRONTEND_URL));
  await sendEmail(recipientEmails, subject, html);
}
