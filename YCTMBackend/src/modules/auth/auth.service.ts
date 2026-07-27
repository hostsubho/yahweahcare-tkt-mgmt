// ============================================================
// Auth service â user lookup, provisioning, session management
// ============================================================

import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { pool } from '../../db/pool';
import { validateEmail } from '../../utils/emailDomain';
import { signAccessToken, signRefreshToken, generateSessionToken } from '../../utils/tokens';
import { env } from '../../config/env';
import { logAudit } from '../audit/audit.service';
import type { Request } from 'express';
import type { GraphUser } from './microsoft.service';

export interface UserRecord {
  id: number;
  email: string;
  name: string;
  role: string;
  role_id: number;
  department: string | null;
  designation: string | null;
  microsoft_id: string | null;
  tenant_id: string | null;
  profile_photo_url: string | null;
  is_admin: boolean;
  bootstrap_admin: boolean;
  active: boolean;
}

/**
 * Look up a user from a Microsoft Graph profile after SSO.
 *
 * STRICT ALLOWLIST: the user MUST already exist in the staff database.
 * - If the email domain isn't approved â 403 disallowed_domain
 * - If no DB record matches the email or microsoftId â 403 not_authorized
 * - If the record exists but `active = false` â 403 account_inactive
 * - Otherwise the user is synced (name/photo/dept/etc.) and returned.
 *
 * Auto-provisioning is intentionally disabled. New staff must be added
 * by an admin via /users before they can sign in.
 */
export async function provisionFromGraph(
  graphUser: GraphUser,
  profilePhoto: string | null,
  tenantId: string,
  req: Request,
): Promise<UserRecord> {
  const email = (graphUser.mail || graphUser.userPrincipalName || '').toLowerCase();

  // 1. Org domain check
  const check = validateEmail(email);
  if (!check.valid) {
    await logAudit({ action: 'login.bad_domain', module: 'auth', actorEmail: email, success: false, metadata: { reason: check.reason, microsoftId: graphUser.id }, req });
    throw Object.assign(new Error(check.reason), { statusCode: 403, code: 'disallowed_domain' });
  }

  // 2. DB-allowlist check â must already exist
  // Column mapping: production DB uses azure_oid (not microsoft_id), is_active, is_bootstrap_admin
  const { rows } = await pool.query<UserRecord>(
    `SELECT u.id, u.email, u.name,
            COALESCE(u.role, 'staff')::text AS role,
            NULL::integer            AS role_id,
            NULL::text               AS department,
            NULL::text               AS designation,
            u.azure_oid              AS microsoft_id,
            NULL::text               AS tenant_id,
            u.profile_photo_url,
            u.is_bootstrap_admin     AS bootstrap_admin,
            u.is_active              AS active
     FROM yc_tkt_mgmt.users u
     WHERE u.azure_oid = $1 OR LOWER(u.email) = $2
     LIMIT 1`,
    [graphUser.id, email]
  );
  const user = rows[0];

  if (!user) {
    await logAudit({
      action: 'login.failed', module: 'auth', actorEmail: email, success: false,
      metadata: { reason: 'not_in_staff_directory', microsoftId: graphUser.id, displayName: graphUser.displayName }, req,
    });
    throw Object.assign(
      new Error('You are not authorized to access this system. Please contact administrator.'),
      { statusCode: 403, code: 'not_authorized' },
    );
  }

  // 3. Account-active check
  if (!user.active) {
    await logAudit({ userId: user.id, actorEmail: email, action: 'login.failed', module: 'auth', success: false, metadata: { reason: 'account_inactive' }, req });
    throw Object.assign(
      new Error('Your account is inactive. Please contact administrator.'),
      { statusCode: 403, code: 'account_inactive' },
    );
  }

  // 4. Sync â update only columns confirmed to exist in production DB
  await pool.query(
    `UPDATE yc_tkt_mgmt.users SET
       name       = COALESCE($1, name),
       azure_oid  = COALESCE(azure_oid, $2),
       updated_at = NOW()
     WHERE id = $3`,
    [graphUser.displayName, graphUser.id, user.id]
  );
  // Reflect the synced name in the returned object so the caller has the up-to-date value
  // (the SELECT above captured the pre-update name; if Microsoft provides a displayName, prefer it)
  if (graphUser.displayName) user.name = graphUser.displayName;
  return user;
}

/**
 * Create a session: store opaque session token + hashed refresh token,
 * return access + refresh JWTs.
 */
export async function createSession(opts: {
  user: UserRecord;
  rememberMe: boolean;
  req: Request;
  positionType?: string;
}): Promise<{ accessToken: string; refreshToken: string; sessionToken: string; sessionId: number }> {
  const { user, rememberMe, req, positionType } = opts;

  // Lookup permissions for the JWT payload
  // DB uses role TEXT (not role_id FK) â look up via roles.name join if available,
  // otherwise return empty array so login still succeeds.
  let permissions: string[] = [];
  try {
    const { rows: perms } = await pool.query<{ name: string }>(
      `SELECT p.name FROM yc_tkt_mgmt.permissions p
       JOIN yc_tkt_mgmt.role_permissions rp ON rp.permission_id = p.id
       JOIN yc_tkt_mgmt.roles r              ON r.id = rp.role_id
       WHERE LOWER(r.name) = LOWER($1)`,
      [user.role]
    );
    permissions = perms.map(p => p.name);
  } catch {
    // roles/permissions tables not yet migrated â proceed with empty permissions
    permissions = [];
  }

  const sessionToken = generateSessionToken();
  const refreshLife = rememberMe ? 90 : 30; // days

  // Create row first to get the id (needed in JWT sid)
  const ins = await pool.query<{ id: number }>(
    `INSERT INTO yc_tkt_mgmt.sessions
       (user_id, session_token, refresh_token_hash, refresh_token_jti,
        device_info, ip_address, user_agent, remember_me, expires_at, last_activity_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW() + ($9 || ' days')::interval, NOW())
     RETURNING id`,
    [user.id, sessionToken, 'pending', 'pending',
     JSON.stringify({ userAgent: req.headers['user-agent'] }),
     req.ip, req.headers['user-agent'], rememberMe, String(refreshLife)]
  );
  const sessionId = ins.rows[0].id;

  // Now mint the JWTs (their jti goes back into the row)
  const refresh = signRefreshToken({ sub: String(user.id), sid: String(sessionId) });
  const refreshHash = await bcrypt.hash(refresh.token, 10);
  const access = signAccessToken({
    sub: String(user.id),
    email: user.email,
    role: user.role,
    ...(positionType ? { positionType } : {}),
    permissions,
    sid: String(sessionId),
  });

  await pool.query(
    `UPDATE yc_tkt_mgmt.sessions
       SET refresh_token_hash = $1, refresh_token_jti = $2, access_token_jti = $3
     WHERE id = $4`,
    [refreshHash, refresh.jti, access.jti, sessionId]
  );

  await logAudit({ userId: user.id, actorEmail: user.email, action: 'login.success', module: 'auth', metadata: { rememberMe, sessionId }, req });
  return { accessToken: access.token, refreshToken: refresh.token, sessionToken, sessionId };
}

/**
 * Rotate the refresh token â issue a new one, blacklist the old one.
 */
interface RotateSessionRow {
  id: number;
  user_id: number;
  refresh_token_hash: string;
  is_revoked: boolean;
  expires_at: string;
  email: string;
  role: string;
  role_id: number | null;
}

export async function rotateTokens(sessionId: number, refreshToken: string, req: Request) {
  // Fetch session + user; guard against role column not yet existing in DB
  let rows: RotateSessionRow[];
  try {
    ({ rows } = await pool.query(
      `SELECT s.id, s.user_id, s.refresh_token_hash, s.is_revoked, s.expires_at,
              u.email, u.role, NULL::integer AS role_id
       FROM yc_tkt_mgmt.sessions s
       JOIN yc_tkt_mgmt.users u ON u.id = s.user_id
       WHERE s.id = $1`,
      [sessionId]
    ));
  } catch {
    ({ rows } = await pool.query(
      `SELECT s.id, s.user_id, s.refresh_token_hash, s.is_revoked, s.expires_at,
              u.email, 'staff'::text AS role, NULL::integer AS role_id
       FROM yc_tkt_mgmt.sessions s
       JOIN yc_tkt_mgmt.users u ON u.id = s.user_id
       WHERE s.id = $1`,
      [sessionId]
    ));
  }
  const s = rows[0];
  if (!s)                       throw Object.assign(new Error('Session not found'), { statusCode: 401 });
  if (s.is_revoked)             throw Object.assign(new Error('Session revoked'),    { statusCode: 401 });
  if (new Date(s.expires_at) < new Date()) throw Object.assign(new Error('Session expired'), { statusCode: 401 });

  const matches = await bcrypt.compare(refreshToken, s.refresh_token_hash);
  if (!matches) {
    // Possible token theft â revoke this session
    await pool.query(`UPDATE yc_tkt_mgmt.sessions SET is_revoked = TRUE, revoked_reason = 'refresh_mismatch' WHERE id = $1`, [sessionId]);
    throw Object.assign(new Error('Refresh token mismatch'), { statusCode: 401 });
  }

  let perms: { name: string }[] = [];
  try {
    const { rows } = await pool.query<{ name: string }>(
      `SELECT p.name FROM yc_tkt_mgmt.permissions p
       JOIN yc_tkt_mgmt.role_permissions rp ON rp.permission_id = p.id
       JOIN yc_tkt_mgmt.roles r              ON r.id = rp.role_id
       WHERE LOWER(r.name) = LOWER($1)`,
      [s.role]
    );
    perms = rows;
  } catch { perms = []; }
  const newAccess  = signAccessToken({ sub: String(s.user_id), email: s.email, role: s.role, permissions: perms.map(p => p.name), sid: String(s.id) });
  const newRefresh = signRefreshToken({ sub: String(s.user_id), sid: String(s.id) });
  const newHash    = await bcrypt.hash(newRefresh.token, 10);

  await pool.query(
    `UPDATE yc_tkt_mgmt.sessions
       SET refresh_token_hash = $1, refresh_token_jti = $2, access_token_jti = $3, last_activity_at = NOW()
     WHERE id = $4`,
    [newHash, newRefresh.jti, newAccess.jti, sessionId]
  );
  await logAudit({ userId: s.user_id, actorEmail: s.email, action: 'token.refresh', module: 'auth', metadata: { sessionId }, req });
  return { accessToken: newAccess.token, refreshToken: newRefresh.token };
}

export async function revokeSession(sessionId: number, reason: string, req?: Request) {
  await pool.query(
    `UPDATE yc_tkt_mgmt.sessions SET is_revoked = TRUE, revoked_at = NOW(), revoked_reason = $1 WHERE id = $2`,
    [reason, sessionId]
  );
  await logAudit({ action: 'logout', module: 'auth', metadata: { sessionId, reason }, req });
}

export async function revokeAllUserSessions(userId: number, reason: string, req?: Request) {
  await pool.query(
    `UPDATE yc_tkt_mgmt.sessions
       SET is_revoked = TRUE, revoked_at = NOW(), revoked_reason = $1
     WHERE user_id = $2 AND is_revoked = FALSE`,
    [reason, userId]
  );
  await logAudit({ userId, action: 'logout.global', module: 'auth', metadata: { reason }, req });
}

// ============================================================
// PKCE verifier + state â persisted via signed HTTP-only cookie.
// (In-memory Map was used previously, but serverless cold starts
// would lose it. Cookies work in both server and serverless.)
// ============================================================
const PKCE_TTL_SECONDS = 10 * 60;
const PKCE_COOKIE = 'yc_pkce';

export function pkceCookieValue(state: string, verifier: string, rememberMe: boolean): string {
  return jwt.sign({ state, verifier, rememberMe }, env.SESSION_SECRET, {
    algorithm: 'HS256', expiresIn: PKCE_TTL_SECONDS,
  });
}

export function decodePkceCookie(token: string | undefined): { state: string; verifier: string; rememberMe: boolean } | null {
  if (!token) return null;
  try {
    return jwt.verify(token, env.SESSION_SECRET, { algorithms: ['HS256'] }) as { state: string; verifier: string; rememberMe: boolean };
  } catch { return null; }
}

export const PKCE_COOKIE_NAME = PKCE_COOKIE;
