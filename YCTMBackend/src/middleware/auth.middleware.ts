// ============================================================
// Authentication middleware
// - Reads access token from HTTP-only cookie or Bearer header
// - Verifies JWT signature + expiry (role/permissions already in token)
// - Checks session record for revocation
// - Does NOT join users table (legacy DB schema has different columns)
// ============================================================

import type { Request, Response, NextFunction } from 'express';
import { pool } from '../db/pool';
import { verifyToken, type AccessTokenPayload } from '../utils/tokens';
import { env } from '../config/env';

declare module 'express-serve-static-core' {
  interface Request {
    auth?: {
      userId: number;
      email: string;
      role: string;
      positionType: string;
      permissions: string[];
      sessionId: number;
      microsoftId?: string | null;
      isAdmin: boolean;
      bootstrapAdmin: boolean;
      /**
       * The REAL bootstrap-admin flag, read from users.is_bootstrap_admin for this
       * specific account (currently only Ron and Alex). Unlike `bootstrapAdmin` above
       * (which is a role-based approximation — true for ANY admin/super_admin user),
       * this is what route handlers must check before allowing bootstrap-admin-only
       * actions such as deleting a position or deactivating a staff member.
       */
      isBootstrapAdmin: boolean;
      hasVehicleAccess: boolean;
    };
  }
}

/** Look up the real is_bootstrap_admin flag for a user. Never throws — defaults to false. */
async function fetchIsBootstrapAdmin(userId: number): Promise<boolean> {
  try {
    const { rows } = await pool.query(
      `SELECT COALESCE(is_bootstrap_admin, FALSE) AS is_bootstrap_admin FROM yc_tkt_mgmt.users WHERE id = $1`,
      [userId]
    );
    return !!rows[0]?.is_bootstrap_admin;
  } catch {
    return false;
  }
}

/** Look up vehicle_access flag for a user. Never throws — defaults to false. */
async function fetchHasVehicleAccess(userId: number): Promise<boolean> {
  try {
    const { rows } = await pool.query(
      `SELECT COALESCE(vehicle_access, FALSE) AS vehicle_access FROM yc_tkt_mgmt.users WHERE id = $1`,
      [userId]
    );
    return !!rows[0]?.vehicle_access;
  } catch {
    return false;
  }
}

/** Query only the sessions table — no user JOIN so legacy DB columns don't matter. */
async function getSession(sid: string) {
  const { rows } = await pool.query(
    `SELECT id, user_id, is_revoked, expires_at, last_activity_at
     FROM yc_tkt_mgmt.sessions
     WHERE id = $1`,
    [Number(sid)]
  );
  return rows[0] as {
    id: number; user_id: number; is_revoked: boolean;
    expires_at: string; last_activity_at: string;
  } | undefined;
}

function buildAuth(payload: AccessTokenPayload, session: { id: number; user_id: number }) {
  const role = payload.role || 'staff';
  const positionType = payload.positionType || 'staff';
  const isAdmin = ['admin', 'super_admin', 'manager'].includes(role.toLowerCase());
  return {
    userId:         session.user_id,
    email:          payload.email,
    role,
    positionType,
    permissions:    Array.isArray(payload.permissions) ? payload.permissions : [],
    sessionId:      session.id,
    microsoftId:    null,
    isAdmin,
    bootstrapAdmin: ['admin', 'super_admin'].includes(role.toLowerCase()),
    isBootstrapAdmin: false, // placeholder — the caller overwrites this with the real DB value
    hasVehicleAccess: false, // placeholder — the caller overwrites this with the real DB value
  };
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    // Allow pre-populated req.auth (e.g. in tests that inject auth directly)
    if ((req as any).auth) return next();

    const token = req.cookies?.['yc_access'] || (req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7) : undefined);
    if (!token) return res.status(401).json({ error: 'unauthenticated', message: 'Missing access token' });

    let payload: AccessTokenPayload;
    try { payload = verifyToken<AccessTokenPayload>(token); }
    catch { return res.status(401).json({ error: 'invalid_token', message: 'Token verification failed' }); }

    const session = await getSession(payload.sid);
    if (!session)           return res.status(401).json({ error: 'no_session' });
    if (session.is_revoked) return res.status(401).json({ error: 'session_revoked' });
    if (new Date(session.expires_at) < new Date()) return res.status(401).json({ error: 'session_expired' });

    const inactiveFor = Date.now() - new Date(session.last_activity_at).getTime();
    if (inactiveFor > env.SESSION_INACTIVITY_TIMEOUT_MS) {
      await pool.query(
        `UPDATE yc_tkt_mgmt.sessions SET is_revoked = TRUE, revoked_reason = 'inactivity' WHERE id = $1`,
        [session.id]
      );
      return res.status(401).json({ error: 'inactivity_timeout' });
    }

    const auth = buildAuth(payload, session);
    auth.isBootstrapAdmin = await fetchIsBootstrapAdmin(session.user_id);
    auth.hasVehicleAccess = await fetchHasVehicleAccess(session.user_id);
    req.auth = auth;
    pool.query(`UPDATE yc_tkt_mgmt.sessions SET last_activity_at = NOW() WHERE id = $1`, [session.id]).catch(() => {});
    next();
  } catch (err) {
    next(err);
  }
}

/** Optional auth — populates req.auth if valid token present, NEVER rejects. */
export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.['yc_access'] || (req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7) : undefined);
  if (!token) return next();

  try {
    let payload: AccessTokenPayload;
    try { payload = verifyToken<AccessTokenPayload>(token); }
    catch { return next(); }

    const session = await getSession(payload.sid);
    if (!session || session.is_revoked || new Date(session.expires_at) < new Date()) return next();

    const inactiveFor = Date.now() - new Date(session.last_activity_at).getTime();
    if (inactiveFor > env.SESSION_INACTIVITY_TIMEOUT_MS) return next();

    const auth = buildAuth(payload, session);
    auth.isBootstrapAdmin = await fetchIsBootstrapAdmin(session.user_id);
    auth.hasVehicleAccess = await fetchHasVehicleAccess(session.user_id);
    req.auth = auth;
    pool.query(`UPDATE yc_tkt_mgmt.sessions SET last_activity_at = NOW() WHERE id = $1`, [session.id]).catch(() => {});
  } catch { /* proceed unauthenticated */ }
  next();
}
