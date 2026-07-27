// ============================================================
// User management routes (admin / HR)
// ============================================================

import { Router } from 'express';
import { pool } from '../../db/pool';
import { requireAuth, optionalAuth } from '../../middleware/auth.middleware';
import { validateEmail } from '../../utils/emailDomain';
import { logAudit } from '../audit/audit.service';
import { notify } from '../notifications/notifications.service';

const router = Router();

const isSuperAdmin = (role: string) => role === 'super_admin';
const isAdminOrAbove = (role: string) => ['super_admin', 'admin'].includes(role);
const isManagerOrAbove = (role: string) => ['super_admin', 'admin', 'manager', 'hr'].includes(role);

// ── Auto-migrate: ensure users.address exists ───────────────
// (phone already exists on the live schema; address does not — added here rather
//  than in a migration file since the live DB has drifted from the repo's migrations)
let addressMigrated = false;
async function ensureAddressColumn() {
  if (addressMigrated) return;
  try {
    await pool.query(`ALTER TABLE yc_tkt_mgmt.users ADD COLUMN IF NOT EXISTS address text`);
    addressMigrated = true;
  } catch (err) {
    console.warn('[users] address column migration skipped:', err);
  }
}

// GET /users — returns all users with their department and position via correlated subquery
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const limit  = Math.min(Number(req.query.limit) || 100, 200);
    const offset = Number(req.query.offset) || 0;
    const q      = (req.query.q as string || '').trim().toLowerCase();
    const status = (req.query.status as string || '').trim();
    const deptId = req.query.dept_id ? Number(req.query.dept_id) : null;
    const where: string[] = ['1=1'];
    const params: unknown[] = [];
    let pi = 1;
    if (q) {
      where.push('(LOWER(u.name) LIKE $' + pi + ' OR LOWER(u.email) LIKE $' + pi + ')');
      params.push('%' + q + '%');
      pi++;
    }
    if (status === 'active')   where.push('u.is_active = TRUE');
    else if (status === 'inactive') where.push('u.is_active = FALSE');
    if (deptId) { where.push('u.department_id = $' + pi); params.push(deptId); pi++; }

    await ensureAddressColumn();
    const { rows } = await pool.query(
      // Only select columns that exist in the live DB schema (legacy 000_reset_schema).
      // is_bootstrap_admin is added by migration 008. phone/address are real live columns
      // (address auto-migrated above) — surfaced here so Staff Management stays in sync
      // with the self-service My Profile page. Other non-existent columns like auth_provider,
      // employment_type, manager_id, start_date, profile_notes are still intentionally excluded.
      'SELECT u.id, u.email, u.name, u.is_active, u.department_id, u.position_id, u.created_at,' +
      ' u.phone, u.address, u.profile_photo_url, u.avatar_initials,' +
      ' COALESCE(u.is_bootstrap_admin, FALSE) AS is_bootstrap_admin,' +
      ' COALESCE(u.vehicle_access, FALSE) AS vehicle_access,' +
      ' d.name AS department_name,' +
      ' (SELECT COALESCE(json_agg(' +
      "   json_build_object('id',p2.id,'title',p2.title,'type',COALESCE(p2.position_type,'ops'),'is_primary',sp2.is_primary)" +
      '   ORDER BY sp2.is_primary DESC NULLS LAST, p2.title' +
      ' ),' +
      " '[]'::json)" +
      '  FROM yc_tkt_mgmt.staff_positions sp2' +
      '  JOIN yc_tkt_mgmt.positions p2 ON p2.id = sp2.position_id' +
      '  WHERE sp2.user_id = u.id' +
      ' ) AS positions' +
      ' FROM yc_tkt_mgmt.users u' +
      ' LEFT JOIN yc_tkt_mgmt.departments d ON d.id = u.department_id' +
      ' WHERE ' + where.join(' AND ') +
      ' ORDER BY u.name' +
      ' LIMIT $' + pi + ' OFFSET $' + (pi + 1),
      [...params, limit, offset]
    );
    const users = rows.map(r => ({ ...r, active: r.is_active, positions: Array.isArray(r.positions) ? r.positions : [] }));
    res.json({ users, total: users.length });
  } catch (err) { next(err); }
});

// POST /users — create staff
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { email, name, phone, address, employment_type, department_id, manager_id,
      start_date, profile_notes, position_id, auth_provider, is_active, designation } = req.body || {};
    if (!email?.trim()) return res.status(400).json({ error: 'missing_fields', message: 'Email is required' });
    if (!name?.trim())  return res.status(400).json({ error: 'missing_fields', message: 'Name is required' });
    // Enforce org-domain policy — staff must have an allowed email to be able to sign in via Microsoft Entra
    const domainCheck = validateEmail(email.trim());
    if (!domainCheck.valid) return res.status(400).json({ error: 'invalid_email_domain', message: domainCheck.reason });
    const initials = (name.trim().split(/\s+/).map((s: string) => s[0] || '').slice(0, 2).join('') || '?').toUpperCase();
    const active = is_active !== false;
    const posId  = position_id ? Number(position_id) : null;
    await ensureAddressColumn();
    const { rows } = await pool.query(
      `INSERT INTO yc_tkt_mgmt.users
         (email, name, phone, address, employment_type, department_id, manager_id,
          start_date, profile_notes, position_id, auth_provider, is_active,
          avatar_initials, designation, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,NOW(),NOW())
       RETURNING id, email, name, is_active, position_id, department_id, manager_id, employment_type, auth_provider, avatar_initials, phone, address`,
      [email.toLowerCase().trim(), name.trim(), phone || null, address || null, employment_type || 'full_time',
       department_id ? Number(department_id) : null, manager_id ? Number(manager_id) : null,
       start_date || null, profile_notes || null, posId, auth_provider || 'azure_ad',
       active, initials, designation || null]
    );
    if (posId) {
      await pool.query(`UPDATE yc_tkt_mgmt.positions SET is_active=TRUE, is_vacant=FALSE, updated_at=NOW() WHERE id=$1`, [posId]);
      await pool.query(`INSERT INTO yc_tkt_mgmt.staff_positions (user_id, position_id, is_primary) VALUES ($1,$2,TRUE) ON CONFLICT DO NOTHING`, [rows[0].id, posId]);
    }
    if (req.auth) await logAudit({ userId: req.auth.userId, actorEmail: req.auth.email, action: 'user.create', module: 'users', targetType: 'user', targetId: rows[0].id, metadata: { email: rows[0].email }, req });

    // Notify (awaited before responding — Vercel serverless functions can
    // freeze immediately after the response is sent, so fire-and-forget
    // calls placed after res.json() are not guaranteed to run to completion)
    await notify({
      type: 'user.created', targetUserId: rows[0].id, targetUserName: rows[0].name,
      actorId: req.auth?.userId ?? rows[0].id, actorName: req.auth?.email,
      deptId: rows[0].department_id ?? undefined,
    }).catch(() => {});

    res.status(201).json({ user: rows[0] });
  } catch (err: unknown) {
    const e = err as { code?: string };
    if (e.code === '23505') return res.status(409).json({ error: 'duplicate_email', message: 'A user with this email already exists' });
    next(err);
  }
});

// GET /users/me — current user's own profile (self-service, not admin CRUD)
// Registered before PATCH /:id / GET /:id-style routes so Express doesn't treat "me" as an :id param.
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    await ensureAddressColumn();
    const { rows } = await pool.query(
      `SELECT u.id, u.email, u.name, u.phone, u.address, u.employment_type, u.designation,
              u.department_id, u.role, COALESCE(u.is_bootstrap_admin, FALSE) AS is_bootstrap_admin,
              u.avatar_initials, u.profile_photo_url, d.name AS department_name,
              (SELECT COALESCE(json_agg(p.title ORDER BY sp.is_primary DESC NULLS LAST), '[]'::json)
                 FROM yc_tkt_mgmt.staff_positions sp
                 JOIN yc_tkt_mgmt.positions p ON p.id = sp.position_id
                WHERE sp.user_id = u.id) AS positions
         FROM yc_tkt_mgmt.users u
         LEFT JOIN yc_tkt_mgmt.departments d ON d.id = u.department_id
        WHERE u.id = $1`,
      [req.auth!.userId]
    );
    if (!rows[0]) return res.status(404).json({ error: 'not_found' });
    res.json({ user: rows[0] });
  } catch (err) { next(err); }
});

// PATCH /users/me — self-service profile update, phone + address ONLY.
// Deliberately separate from the admin PATCH /:id below (different fieldMap, no
// admin-only checks) so a regular staff member can never touch name/email/role/
// department/position/active-status on their own account through this route.
router.patch('/me', requireAuth, async (req, res, next) => {
  try {
    await ensureAddressColumn();
    // profile_photo_url is a base64 data URL (resized client-side to ~200x200 before
    // upload) — cap at 1MB of text as a sanity guard against abuse, well above what a
    // resized avatar should ever need (~15-40KB in practice).
    if (typeof req.body?.profile_photo_url === 'string' && req.body.profile_photo_url.length > 1_000_000) {
      return res.status(400).json({ error: 'photo_too_large', message: 'Profile photo is too large' });
    }
    const fieldMap: Record<string, string> = { phone: 'phone', address: 'address', profile_photo_url: 'profile_photo_url' };
    const updates: string[] = []; const values: unknown[] = []; let i = 1;
    for (const [key, col] of Object.entries(fieldMap)) {
      if (key in req.body) {
        updates.push(`${col} = $${i++}`);
        const val = req.body[key];
        values.push(val === '' ? null : val);
      }
    }
    if (updates.length) {
      values.push(req.auth!.userId);
      await pool.query(`UPDATE yc_tkt_mgmt.users SET ${updates.join(', ')}, updated_at=NOW() WHERE id=$${i}`, values);
    }
    const { rows } = await pool.query(
      `SELECT id, email, name, phone, address, profile_photo_url FROM yc_tkt_mgmt.users WHERE id=$1`, [req.auth!.userId]
    );
    if (req.auth) await logAudit({ userId: req.auth.userId, actorEmail: req.auth.email, action: 'user.update', module: 'users', targetType: 'user', targetId: req.auth.userId, metadata: { changes: req.body, self: true }, req });
    res.json({ user: rows[0] });
  } catch (err) { next(err); }
});

// PATCH /users/:id — update
router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    await ensureAddressColumn();
    const id = Number(req.params.id);
    const { rows: tRows } = await pool.query(`SELECT * FROM yc_tkt_mgmt.users WHERE id = $1`, [id]);
    const target = tRows[0];
    if (!target) return res.status(404).json({ error: 'not_found' });
    if (target.is_bootstrap_admin && 'is_active' in req.body && req.body.is_active === false)
      return res.status(403).json({ error: 'bootstrap_admin_deactivate_blocked', message: 'Bootstrap admins cannot be deactivated' });
    // Deactivating OR reactivating a staff member is a bootstrap-admin-only
    // action (Ron / Alex) — symmetric with the delete/deactivate route below.
    if ('is_active' in req.body && !req.auth?.isBootstrapAdmin)
      return res.status(403).json({ error: 'forbidden', message: 'Only bootstrap admins can activate or deactivate staff members' });
    // If email is being changed, enforce org-domain policy
    if ('email' in req.body && req.body.email) {
      const domainCheck = validateEmail(req.body.email.toString().trim());
      if (!domainCheck.valid) return res.status(400).json({ error: 'invalid_email_domain', message: domainCheck.reason });
    }

    if (typeof req.body?.profile_photo_url === 'string' && req.body.profile_photo_url.length > 1_000_000) {
      return res.status(400).json({ error: 'photo_too_large', message: 'Profile photo is too large' });
    }
    // Only include columns that exist in the live DB schema
    const fieldMap: Record<string, string> = {
      name: 'name', email: 'email',
      department_id: 'department_id', position_id: 'position_id',
      is_active: 'is_active', phone: 'phone', address: 'address',
      profile_photo_url: 'profile_photo_url', vehicle_access: 'vehicle_access',
    };
    const updates: string[] = []; const values: unknown[] = []; let i = 1;
    for (const [key, col] of Object.entries(fieldMap)) {
      if (key in req.body) {
        updates.push(`${col} = $${i++}`);
        const val = req.body[key];
        values.push((col === 'department_id' || col === 'manager_id' || col === 'position_id') && val !== null && val !== '' ? Number(val) : (val === '' ? null : val));
      }
    }
    if (updates.length) {
      values.push(id);
      await pool.query(`UPDATE yc_tkt_mgmt.users SET ${updates.join(', ')}, updated_at=NOW() WHERE id=$${i}`, values);
    }

    // ── Sync staff_positions (multi-position) ────────────────────────────────
    if ('position_ids' in req.body && Array.isArray(req.body.position_ids)) {
      const newIds: number[] = req.body.position_ids.map(Number).filter(Boolean);
      const { rows: oldSp } = await pool.query(`SELECT position_id FROM yc_tkt_mgmt.staff_positions WHERE user_id=$1`, [id]);
      const oldIds: number[] = oldSp.map((r: { position_id: number }) => r.position_id);
      await pool.query(`DELETE FROM yc_tkt_mgmt.staff_positions WHERE user_id=$1`, [id]);
      for (let idx = 0; idx < newIds.length; idx++) {
        await pool.query(
          `INSERT INTO yc_tkt_mgmt.staff_positions (user_id, position_id, is_primary) VALUES ($1,$2,$3) ON CONFLICT (user_id, position_id) DO UPDATE SET is_primary=$3`,
          [id, newIds[idx], idx === 0]
        );
        await pool.query(`UPDATE yc_tkt_mgmt.positions SET is_active=TRUE, is_vacant=FALSE, updated_at=NOW() WHERE id=$1`, [newIds[idx]]);
      }
      for (const oldId of oldIds) {
        if (!newIds.includes(oldId)) {
          await pool.query(
            `UPDATE yc_tkt_mgmt.positions
             SET is_active=EXISTS(SELECT 1 FROM yc_tkt_mgmt.staff_positions sp2 JOIN yc_tkt_mgmt.users u2 ON u2.id=sp2.user_id AND u2.is_active=TRUE WHERE sp2.position_id=$1),
                 is_vacant=NOT EXISTS(SELECT 1 FROM yc_tkt_mgmt.staff_positions sp2 JOIN yc_tkt_mgmt.users u2 ON u2.id=sp2.user_id AND u2.is_active=TRUE WHERE sp2.position_id=$1),
                 updated_at=NOW() WHERE id=$1`, [oldId]
          );
        }
      }
    }

    const { rows: updRows } = await pool.query(
      `SELECT id, email, name, phone, address, is_active, position_id, department_id, COALESCE(is_bootstrap_admin, FALSE) AS is_bootstrap_admin FROM yc_tkt_mgmt.users WHERE id=$1`, [id]
    );
    if (req.auth) await logAudit({ userId: req.auth.userId, actorEmail: req.auth.email, action: 'user.update', module: 'users', targetType: 'user', targetId: id, metadata: { changes: req.body }, req });

    // Notify if position changed (awaited before responding — see note above)
    const positionChanged = 'position_id' in req.body || 'position_ids' in req.body;
    if (positionChanged) {
      // Get new position title
      let posTitle = 'new role';
      try {
        const { rows: pRows } = await pool.query(
          `SELECT p.title FROM yc_tkt_mgmt.staff_positions sp JOIN yc_tkt_mgmt.positions p ON p.id=sp.position_id WHERE sp.user_id=$1 AND sp.is_primary=TRUE LIMIT 1`, [id]
        );
        posTitle = pRows[0]?.title || posTitle;
      } catch { /* ignore */ }
      await notify({
        type: 'user.position_changed', targetUserId: id, targetUserName: target.name,
        actorId: req.auth?.userId ?? id, actorName: req.auth?.email,
        deptId: updRows[0]?.department_id ?? undefined, extra: posTitle,
      }).catch(() => {});
    }

    res.json({ user: updRows[0] });
  } catch (err) { next(err); }
});

// DELETE /users/:id — soft delete
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    // Deleting/deactivating staff is a bootstrap-admin-only action (Ron / Alex).
    if (!req.auth?.isBootstrapAdmin) return res.status(403).json({ error: 'forbidden', message: 'Only bootstrap admins can delete staff members' });
    const id = Number(req.params.id);
    const { rows } = await pool.query(`SELECT * FROM yc_tkt_mgmt.users WHERE id = $1`, [id]);
    if (!rows[0]) return res.status(404).json({ error: 'not_found' });
    if (rows[0].is_bootstrap_admin) return res.status(403).json({ error: 'bootstrap_admin_delete_blocked', message: 'Bootstrap admin accounts cannot be deleted' });
    await pool.query(`UPDATE yc_tkt_mgmt.users SET is_active=FALSE, updated_at=NOW() WHERE id=$1`, [id]);
    const { rows: spRows } = await pool.query(`SELECT position_id FROM yc_tkt_mgmt.staff_positions WHERE user_id=$1`, [id]);
    await pool.query(`DELETE FROM yc_tkt_mgmt.staff_positions WHERE user_id=$1`, [id]);
    for (const sp of spRows) {
      await pool.query(
        `UPDATE yc_tkt_mgmt.positions
         SET is_active=EXISTS(SELECT 1 FROM yc_tkt_mgmt.staff_positions sp2 JOIN yc_tkt_mgmt.users u2 ON u2.id=sp2.user_id AND u2.is_active=TRUE WHERE sp2.position_id=$1),
             is_vacant=NOT EXISTS(SELECT 1 FROM yc_tkt_mgmt.staff_positions sp2 JOIN yc_tkt_mgmt.users u2 ON u2.id=sp2.user_id AND u2.is_active=TRUE WHERE sp2.position_id=$1),
             updated_at=NOW() WHERE id=$1`, [sp.position_id]
      );
    }
    if (req.auth) await logAudit({ userId: req.auth.userId, actorEmail: req.auth.email, action: 'user.delete', module: 'users', targetType: 'user', targetId: id, req });

    // Notify (awaited before responding — see note above)
    await notify({
      type: 'user.deleted', targetUserId: id, targetUserName: rows[0].name,
      actorId: req.auth?.userId ?? id, actorName: req.auth?.email,
      deptId: rows[0].department_id ?? undefined,
    }).catch(() => {});

    // Find every still-open ticket this person was assigned to, and tell
    // each ticket's creator they need to reassign it — a deactivated staff
    // member can no longer work on anything. Awaited before responding
    // (same Vercel-serverless reason as the notify() calls above).
    let reassignCount = 0;
    try {
      const { rows: openTickets } = await pool.query(
        `SELECT id, title, created_by FROM yc_tkt_mgmt.tickets
          WHERE assigned_to = $1 AND status NOT IN ('resolved', 'closed') AND created_by IS NOT NULL`,
        [id]
      );
      reassignCount = openTickets.length;
      await Promise.all(openTickets.map(t => notify({
        type: 'ticket.assignee_deactivated',
        ticketId: t.id as number,
        ticketTitle: t.title as string,
        actorId: req.auth?.userId ?? id,
        actorName: req.auth?.email,
        creatorId: t.created_by as number,
        assigneeId: id,
        extra: rows[0].name,
      }).catch(() => {})));
    } catch (reassignErr) {
      console.warn('[users] reassign-notify lookup failed:', reassignErr);
    }

    res.json({
      ok: true,
      message: rows[0].name + ' has been deactivated. Their positions are now vacant.' +
        (reassignCount ? ` ${reassignCount} open ticket${reassignCount === 1 ? '' : 's'} need${reassignCount === 1 ? 's' : ''} to be reassigned — the ticket creator${reassignCount === 1 ? '' : 's'} have been notified.` : ''),
    });
  } catch (err) { next(err); }
});

export default router;
