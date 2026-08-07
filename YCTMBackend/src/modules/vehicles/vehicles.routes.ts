// ============================================================
// Vehicle Management routes — Yahweh Care
//
// Full fleet management: registration, make/model/year/colour,
// company (YC/YPC), assignee, status, registration expiry,
// comprehensive insurance (insurer + expiry), CTP/Green Slip
// (insurer + expiry), next service due, notes.
//
// Alert configuration: 14 configurable alert rules covering
// rego expiry, comp insurance expiry, CTP expiry, service due
// (at 30/14/7-day thresholds) plus event-based alerts.
//
// All routes require manager-level access or individual
// vehicle_access override set in Staff Management.
// ============================================================

import { Router } from 'express';
import { pool } from '../../db/pool';
import { requireAuth } from '../../middleware/auth.middleware';
import { logAudit } from '../audit/audit.service';

const router = Router();

const VALID_STATUSES  = ['active', 'in_service', 'retired'];
const VALID_COMPANIES = ['YC', 'YPC'];

const isManagerOrAbove = (req: any) =>
  !!req.auth?.isBootstrapAdmin || !!req.auth?.hasVehicleAccess ||
  ['super_admin', 'admin', 'manager', 'hr'].includes(req.auth?.role);

function requireManagerOrAbove(req: any, res: any, next: any) {
  if (!isManagerOrAbove(req)) {
    return res.status(403).json({ error: 'forbidden', message: 'Only admins and managers can access vehicle management' });
  }
  next();
}

// ── Auto-migrate: ensure tables exist ──────────────────────
let vehiclesTableEnsured = false;
async function ensureVehiclesTable() {
  if (vehiclesTableEnsured || process.env.NODE_ENV === 'test') return;
  try {
    // Ensure vehicle_access column on users table
    await pool.query(`ALTER TABLE yc_tkt_mgmt.users ADD COLUMN IF NOT EXISTS vehicle_access BOOLEAN NOT NULL DEFAULT FALSE`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS yc_tkt_mgmt.vehicles (
        id                    SERIAL PRIMARY KEY,
        registration_number   TEXT NOT NULL,
        make                  TEXT NOT NULL,
        model                 TEXT NOT NULL,
        year                  INTEGER,
        color                 TEXT,
        company               TEXT CHECK (company IS NULL OR company IN ('YC', 'YPC')),
        assigned_to           INTEGER REFERENCES yc_tkt_mgmt.users(id) ON DELETE SET NULL,
        assigned_to_external  TEXT,
        status                TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'in_service', 'retired')),
        registration_expiry   DATE,
        comprehensive_insurer TEXT,
        insurance_expiry      DATE,
        ctp_insurer           TEXT,
        ctp_expiry            DATE,
        next_service_due      DATE,
        notes                 TEXT,
        is_deleted            BOOLEAN NOT NULL DEFAULT FALSE,
        created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS yc_tkt_mgmt_vehicles_reg_uq
        ON yc_tkt_mgmt.vehicles (UPPER(registration_number)) WHERE NOT is_deleted
    `);
    vehiclesTableEnsured = true;
  } catch (err) {
    console.warn('[vehicles] table migration skipped:', err);
  }
}

function toDateOrNull(v: unknown): string | null {
  if (v === undefined || v === null || v === '') return null;
  return String(v);
}

// GET /vehicles — list with search/status/company/assigned_to filters
router.get('/', requireAuth, requireManagerOrAbove, async (req, res, next) => {
  try {
    await ensureVehiclesTable();
    const q          = (req.query.q as string || '').trim().toLowerCase();
    const status     = (req.query.status as string || '').trim();
    const assignedTo = req.query.assigned_to ? Number(req.query.assigned_to) : null;
    const company    = (req.query.company as string || '').trim().toUpperCase();

    const where: string[] = ['NOT v.is_deleted'];
    const params: unknown[] = [];
    let pi = 1;

    if (q) {
      where.push(`(LOWER(v.registration_number) LIKE $${pi} OR LOWER(v.make) LIKE $${pi} OR LOWER(v.model) LIKE $${pi})`);
      params.push('%' + q + '%'); pi++;
    }
    if (status && VALID_STATUSES.includes(status))    { where.push(`v.status = $${pi}`);      params.push(status);  pi++; }
    if (assignedTo)                                    { where.push(`v.assigned_to = $${pi}`); params.push(assignedTo); pi++; }
    if (company && VALID_COMPANIES.includes(company))  { where.push(`v.company = $${pi}`);     params.push(company); pi++; }

    const { rows } = await pool.query(
      `SELECT v.id, v.registration_number, v.make, v.model, v.year, v.color, v.company,
              v.assigned_to, v.assigned_to_external,
              v.status, v.registration_expiry, v.comprehensive_insurer, v.insurance_expiry,
              v.ctp_insurer, v.ctp_expiry, v.next_service_due, v.notes, v.created_at, v.updated_at,
              COALESCE(u.name, v.assigned_to_external) AS assigned_to_name,
              u.email AS assigned_to_email
         FROM yc_tkt_mgmt.vehicles v
         LEFT JOIN yc_tkt_mgmt.users u ON u.id = v.assigned_to
        WHERE ${where.join(' AND ')}
        ORDER BY v.registration_number`,
      params
    );
    res.json({ vehicles: rows, total: rows.length });
  } catch (err) { next(err); }
});

// POST /vehicles — create
router.post('/', requireAuth, requireManagerOrAbove, async (req, res, next) => {
  try {
    await ensureVehiclesTable();
    const {
      registration_number, make, model, year, color, company,
      assigned_to, assigned_to_external, status,
      registration_expiry, comprehensive_insurer, insurance_expiry,
      ctp_insurer, ctp_expiry, next_service_due, notes,
    } = req.body || {};

    const resolvedAssignedTo = assigned_to_external?.trim() ? null : (assigned_to ? Number(assigned_to) : null);
    const resolvedExternal   = assigned_to_external?.trim() || null;

    if (!registration_number?.trim()) return res.status(400).json({ error: 'missing_fields', message: 'Registration number is required' });
    if (!make?.trim())                return res.status(400).json({ error: 'missing_fields', message: 'Make is required' });
    if (!model?.trim())               return res.status(400).json({ error: 'missing_fields', message: 'Model is required' });
    const st = status || 'active';
    if (!VALID_STATUSES.includes(st)) return res.status(400).json({ error: 'invalid_status', message: `Status must be one of: ${VALID_STATUSES.join(', ')}` });
    const co = company ? String(company).trim().toUpperCase() : null;
    if (co && !VALID_COMPANIES.includes(co)) return res.status(400).json({ error: 'invalid_company', message: `Company must be one of: ${VALID_COMPANIES.join(', ')}` });

    const { rows } = await pool.query(
      `INSERT INTO yc_tkt_mgmt.vehicles
         (registration_number, make, model, year, color, company, assigned_to, assigned_to_external, status,
          registration_expiry, comprehensive_insurer, insurance_expiry, ctp_insurer, ctp_expiry,
          next_service_due, notes, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,NOW(),NOW())
       RETURNING *`,
      [
        registration_number.trim(), make.trim(), model.trim(), year ? Number(year) : null,
        color || null, co, resolvedAssignedTo, resolvedExternal, st,
        toDateOrNull(registration_expiry), comprehensive_insurer || null, toDateOrNull(insurance_expiry),
        ctp_insurer || null, toDateOrNull(ctp_expiry), toDateOrNull(next_service_due), notes || null,
      ]
    );
    if (req.auth) await logAudit({ userId: req.auth.userId, actorEmail: req.auth.email, action: 'vehicle.create', module: 'vehicles', targetType: 'vehicle', targetId: rows[0].id, metadata: { registration_number: rows[0].registration_number }, req });
    res.status(201).json({ vehicle: rows[0] });
  } catch (err: unknown) {
    const e = err as { code?: string };
    if (e.code === '23505') return res.status(409).json({ error: 'duplicate_registration', message: 'A vehicle with this registration number already exists' });
    next(err);
  }
});

// PATCH /vehicles/:id — update
router.patch('/:id', requireAuth, requireManagerOrAbove, async (req, res, next) => {
  try {
    await ensureVehiclesTable();
    const id = Number(req.params.id);
    const { rows: existing } = await pool.query(`SELECT * FROM yc_tkt_mgmt.vehicles WHERE id=$1 AND NOT is_deleted`, [id]);
    if (!existing[0]) return res.status(404).json({ error: 'not_found' });

    if ('status' in req.body && !VALID_STATUSES.includes(req.body.status))
      return res.status(400).json({ error: 'invalid_status' });
    if ('company' in req.body && req.body.company && !VALID_COMPANIES.includes(String(req.body.company).toUpperCase()))
      return res.status(400).json({ error: 'invalid_company' });

    const fieldMap: Record<string, string> = {
      registration_number: 'registration_number', make: 'make', model: 'model', year: 'year',
      color: 'color', company: 'company', assigned_to: 'assigned_to',
      assigned_to_external: 'assigned_to_external', status: 'status',
      registration_expiry: 'registration_expiry', comprehensive_insurer: 'comprehensive_insurer',
      insurance_expiry: 'insurance_expiry', ctp_insurer: 'ctp_insurer', ctp_expiry: 'ctp_expiry',
      next_service_due: 'next_service_due', notes: 'notes',
    };
    const dateFields    = new Set(['registration_expiry', 'insurance_expiry', 'ctp_expiry', 'next_service_due']);
    const numericFields = new Set(['year', 'assigned_to']);

    const body = { ...req.body };
    if ('assigned_to_external' in body && body.assigned_to_external?.trim()) body.assigned_to = null;
    else if ('assigned_to' in body && body.assigned_to) body.assigned_to_external = null;

    const updates: string[] = []; const values: unknown[] = []; let i = 1;
    for (const [key, col] of Object.entries(fieldMap)) {
      if (key in body) {
        updates.push(`${col} = $${i++}`);
        const val = body[key];
        if (dateFields.has(key))    values.push(toDateOrNull(val));
        else if (numericFields.has(key)) values.push(val === null || val === '' ? null : Number(val));
        else if (key === 'company') values.push(val ? String(val).trim().toUpperCase() : null);
        else values.push(typeof val === 'string' ? (val.trim() || null) : val);
      }
    }
    if (!updates.length) return res.status(400).json({ error: 'no_fields' });
    values.push(id);
    const { rows } = await pool.query(
      `UPDATE yc_tkt_mgmt.vehicles SET ${updates.join(', ')}, updated_at=NOW() WHERE id=$${i} RETURNING *`,
      values
    );
    if (req.auth) await logAudit({ userId: req.auth.userId, actorEmail: req.auth.email, action: 'vehicle.update', module: 'vehicles', targetType: 'vehicle', targetId: id, metadata: { changes: req.body }, req });
    res.json({ vehicle: rows[0] });
  } catch (err: unknown) {
    const e = err as { code?: string };
    if (e.code === '23505') return res.status(409).json({ error: 'duplicate_registration', message: 'A vehicle with this registration number already exists' });
    next(err);
  }
});

// DELETE /vehicles/:id — soft delete
router.delete('/:id', requireAuth, requireManagerOrAbove, async (req, res, next) => {
  try {
    await ensureVehiclesTable();
    const id = Number(req.params.id);
    const { rows } = await pool.query(`SELECT * FROM yc_tkt_mgmt.vehicles WHERE id=$1 AND NOT is_deleted`, [id]);
    if (!rows[0]) return res.status(404).json({ error: 'not_found' });
    await pool.query(`UPDATE yc_tkt_mgmt.vehicles SET is_deleted=TRUE, updated_at=NOW() WHERE id=$1`, [id]);
    if (req.auth) await logAudit({ userId: req.auth.userId, actorEmail: req.auth.email, action: 'vehicle.delete', module: 'vehicles', targetType: 'vehicle', targetId: id, metadata: { registration_number: rows[0].registration_number }, req });
    res.json({ ok: true, message: `${rows[0].registration_number} has been removed from the fleet.` });
  } catch (err) { next(err); }
});

// ── Alert Configuration ───────────────────────────────────

const DEFAULT_ALERT_CONFIGS = [
  { key: 'rego_30d',          type: 'rego_expiry',    label: 'Registration Expiry — 30 days',            desc: "Notify when a vehicle's registration expires in 30 days",                       days_before: 30   },
  { key: 'rego_14d',          type: 'rego_expiry',    label: 'Registration Expiry — 14 days',            desc: "Notify when a vehicle's registration expires in 14 days",                       days_before: 14   },
  { key: 'rego_7d',           type: 'rego_expiry',    label: 'Registration Expiry — 7 days',             desc: "Notify when a vehicle's registration expires in 7 days",                        days_before: 7    },
  { key: 'comp_ins_30d',      type: 'comp_insurance', label: 'Comprehensive Insurance Expiry — 30 days', desc: "Notify when comprehensive insurance expires in 30 days",                        days_before: 30   },
  { key: 'comp_ins_14d',      type: 'comp_insurance', label: 'Comprehensive Insurance Expiry — 14 days', desc: "Notify when comprehensive insurance expires in 14 days",                        days_before: 14   },
  { key: 'comp_ins_7d',       type: 'comp_insurance', label: 'Comprehensive Insurance Expiry — 7 days',  desc: "Notify when comprehensive insurance expires in 7 days",                         days_before: 7    },
  { key: 'ctp_30d',           type: 'ctp_expiry',     label: 'CTP / Green Slip Expiry — 30 days',        desc: "Notify when CTP / Green Slip expires in 30 days",                               days_before: 30   },
  { key: 'ctp_14d',           type: 'ctp_expiry',     label: 'CTP / Green Slip Expiry — 14 days',        desc: "Notify when CTP / Green Slip expires in 14 days",                               days_before: 14   },
  { key: 'ctp_7d',            type: 'ctp_expiry',     label: 'CTP / Green Slip Expiry — 7 days',         desc: "Notify when CTP / Green Slip expires in 7 days",                                days_before: 7    },
  { key: 'service_30d',       type: 'service_due',    label: 'Service Due — 30 days',                    desc: "Notify when a vehicle's next service is due in 30 days",                       days_before: 30   },
  { key: 'service_14d',       type: 'service_due',    label: 'Service Due — 14 days',                    desc: "Notify when a vehicle's next service is due in 14 days",                       days_before: 14   },
  { key: 'service_7d',        type: 'service_due',    label: 'Service Due — 7 days',                     desc: "Notify when a vehicle's next service is due in 7 days",                        days_before: 7    },
  { key: 'status_change',     type: 'event',          label: 'Vehicle Status Change',                    desc: "Notify when a vehicle's status changes (e.g. Active → In Service → Retired)", days_before: null },
  { key: 'assignment_change', type: 'event',          label: 'Vehicle Assignment Change',                desc: "Notify when a vehicle is assigned to or unassigned from a staff member",       days_before: null },
];

let alertTableEnsured = false;
async function ensureAlertConfigsTable() {
  if (alertTableEnsured || process.env.NODE_ENV === 'test') return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS yc_tkt_mgmt.vehicle_alert_configs (
        id                 SERIAL PRIMARY KEY,
        alert_key          TEXT NOT NULL UNIQUE,
        alert_type         TEXT NOT NULL,
        label              TEXT NOT NULL,
        description        TEXT,
        days_before        INTEGER,
        email_enabled      BOOLEAN NOT NULL DEFAULT FALSE,
        push_enabled       BOOLEAN NOT NULL DEFAULT FALSE,
        recipient_user_ids JSONB   NOT NULL DEFAULT '[]',
        is_active          BOOLEAN NOT NULL DEFAULT TRUE,
        created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    const { rows: cnt } = await pool.query(`SELECT COUNT(*) FROM yc_tkt_mgmt.vehicle_alert_configs`);
    if (parseInt(cnt[0].count, 10) === 0) {
      for (const c of DEFAULT_ALERT_CONFIGS) {
        await pool.query(
          `INSERT INTO yc_tkt_mgmt.vehicle_alert_configs (alert_key, alert_type, label, description, days_before)
           VALUES ($1,$2,$3,$4,$5) ON CONFLICT (alert_key) DO NOTHING`,
          [c.key, c.type, c.label, c.desc, c.days_before]
        );
      }
    }
    alertTableEnsured = true;
  } catch (err) {
    console.warn('[vehicles] alert config table migration skipped:', err);
  }
}

// GET /vehicles/alert-settings
router.get('/alert-settings', requireAuth, requireManagerOrAbove, async (req, res, next) => {
  try {
    await ensureAlertConfigsTable();
    const { rows } = await pool.query(
      `SELECT id, alert_key, alert_type, label, description, days_before,
              email_enabled, push_enabled, recipient_user_ids, is_active, updated_at
         FROM yc_tkt_mgmt.vehicle_alert_configs ORDER BY id`
    );
    res.json({ configs: rows });
  } catch (err) { next(err); }
});

// PUT /vehicles/alert-settings/:key
router.put('/alert-settings/:key', requireAuth, requireManagerOrAbove, async (req, res, next) => {
  try {
    await ensureAlertConfigsTable();
    const key = req.params.key;
    const { email_enabled, push_enabled, recipient_user_ids, is_active } = req.body;
    const { rows } = await pool.query(
      `UPDATE yc_tkt_mgmt.vehicle_alert_configs
          SET email_enabled      = COALESCE($1, email_enabled),
              push_enabled       = COALESCE($2, push_enabled),
              recipient_user_ids = COALESCE($3::jsonb, recipient_user_ids),
              is_active          = COALESCE($4, is_active),
              updated_at         = NOW()
        WHERE alert_key = $5 RETURNING *`,
      [
        typeof email_enabled === 'boolean' ? email_enabled : null,
        typeof push_enabled  === 'boolean' ? push_enabled  : null,
        Array.isArray(recipient_user_ids)   ? JSON.stringify(recipient_user_ids) : null,
        typeof is_active     === 'boolean'  ? is_active    : null,
        key,
      ]
    );
    if (!rows[0]) return res.status(404).json({ error: 'not_found' });
    if (req.auth) await logAudit({ userId: req.auth.userId, actorEmail: req.auth.email, action: 'vehicle_alert.update', module: 'vehicles', targetType: 'alert_config', targetId: rows[0].id, metadata: { key, changes: req.body }, req });
    res.json({ config: rows[0] });
  } catch (err) { next(err); }
});

// POST /vehicles/alert-settings/:key/test
router.post('/alert-settings/:key/test', requireAuth, requireManagerOrAbove, async (req, res, next) => {
  try {
    await ensureAlertConfigsTable();
    const { rows } = await pool.query(`SELECT * FROM yc_tkt_mgmt.vehicle_alert_configs WHERE alert_key=$1`, [req.params.key]);
    if (!rows[0]) return res.status(404).json({ error: 'not_found' });
    const cfg = rows[0];
    if (cfg.email_enabled && req.auth?.email) {
      try {
        const { sendEmail } = await import('../notifications/email.service');
        await sendEmail(
          req.auth.email,
          `[YC TMS Test] ${cfg.label}`,
          `<div style="font-family:sans-serif;padding:20px">
            <h2 style="color:#6D2773">Vehicle Alert Test</h2>
            <p>This is a test notification for the alert: <strong>${cfg.label}</strong></p>
            <p style="color:#6B7280;font-size:13px">If you received this, email alerts for this rule are working correctly.</p>
            <hr style="border-color:#E2E8F0;margin:16px 0"/>
            <p style="font-size:12px;color:#94A3B8">Yahweh Care - Vehicle Management System</p>
          </div>`
        );
      } catch (emailErr) {
        console.warn('[alert test] email send failed:', emailErr);
      }
    }
    res.json({ ok: true, message: `Test notification sent for "${cfg.label}"` });
  } catch (err) { next(err); }
});

export default router;
