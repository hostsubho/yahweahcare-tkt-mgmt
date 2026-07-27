// ============================================================
// /auth routes
// ============================================================

import { Router, type Request, type Response, type NextFunction } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { getAuthCodeUrl, acquireTokenByCode, getMicrosoftLogoutUrl } from '../../config/msal';
import { generatePkce } from '../../utils/tokens';
import { fetchGraphProfile, fetchGraphPhoto } from './microsoft.service';
import {
  provisionFromGraph,
  createSession,
  rotateTokens,
  revokeSession,
  revokeAllUserSessions,
} from './auth.service';
import { env } from '../../config/env';
import { loginLimiter } from '../../middleware/rateLimit.middleware';
import { requireAuth } from '../../middleware/auth.middleware';
import { validateEmail } from '../../utils/emailDomain';
import { logAudit } from '../audit/audit.service';
import { pool } from '../../db/pool';

const router = Router();

// ─── Cookie helper ─────────────────────────────────────────
function cookieOpts(maxAgeMs: number) {
  return {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAMESITE,
    domain: env.COOKIE_DOMAIN === 'localhost' ? undefined : env.COOKIE_DOMAIN,
    path: '/',
    maxAge: maxAgeMs,
  } as const;
}

// ─── GET /auth/config — frontend bootstrap ─────────────────
router.get('/config', (_req, res) => {
  res.json({
    allowedDomains: env.ALLOWED_DOMAINS,
    loginUrl: '/auth/microsoft',
    sessionInactivityMs: env.SESSION_INACTIVITY_TIMEOUT_MS,
  });
});

// ─── POST /auth/validate-email — for frontend onboarding ───
router.post('/validate-email', (req, res) => {
  const result = validateEmail(req.body?.email);
  if (!result.valid) return res.status(400).json(result);
  res.json(result);
});

// ─── GET /auth/microsoft — start the SSO flow ──────────────
router.get('/microsoft', loginLimiter, async (req, res, next) => {
  try {
    const nonce      = crypto.randomBytes(24).toString('base64url');
    const { verifier, challenge } = generatePkce();
    const rememberMe = req.query.remember === '1';

    // Encode verifier + nonce in a signed JWT passed as OAuth `state`.
    // Stateless — no cookie needed, works reliably in serverless environments.
    const stateJwt = jwt.sign(
      { nonce, verifier, rememberMe },
      env.SESSION_SECRET,
      { expiresIn: '10m', algorithm: 'HS256' },
    );

    const url = await getAuthCodeUrl(stateJwt, challenge);
    res.redirect(url);
  } catch (err) { next(err); }
});

// ─── GET /auth/microsoft/callback ──────────────────────────
router.get('/microsoft/callback', async (req, res, next) => {
  try {
    const { code, state, error, error_description } = req.query as Record<string, string>;
    if (error) {
      await logAudit({ action: 'login.failed', module: 'auth', metadata: { error, error_description }, success: false, req });
      return res.redirect(`${env.FRONTEND_URL}?error=${encodeURIComponent(error_description || error)}`);
    }
    if (!code || !state) return res.status(400).json({ error: 'missing_code_or_state' });

    // Decode the stateless JWT — verifier + rememberMe were encoded at login time
    let statePayload: { nonce: string; verifier: string; rememberMe: boolean };
    try {
      statePayload = jwt.verify(state, env.SESSION_SECRET, { algorithms: ['HS256'] }) as typeof statePayload;
    } catch (e) {
      await logAudit({ action: 'login.failed', module: 'auth', metadata: { reason: 'invalid_state_jwt' }, success: false, req });
      return res.redirect(`${env.FRONTEND_URL}?error=invalid_state`);
    }
    const { verifier, rememberMe } = statePayload;

    // Exchange the auth code for tokens via MSAL
    const tokenResponse = await acquireTokenByCode(code, verifier);
    if (!tokenResponse?.accessToken) throw new Error('No access token in MSAL response');

    // Fetch the user's profile + photo from Microsoft Graph
    const profile = await fetchGraphProfile(tokenResponse.accessToken);
    const photo   = await fetchGraphPhoto(tokenResponse.accessToken);
    const tenantId = tokenResponse.tenantId || env.AZURE_TENANT_ID;

    // Provision or sync the user
    const user = await provisionFromGraph(profile, photo, tenantId, req);

    // Fetch department name, dept_id, primary position type, and role BEFORE minting the JWT
    // so positionType can be embedded in the access token for backend authorization checks.
    let deptName = '';
    let deptId: number | null = null;
    let positionType = 'staff';
    let userRole = 'staff';
    try {
      const profileRow = await pool.query(
        `SELECT d.id AS dept_id, d.name AS dept_name,
                COALESCE(p.position_type, 'staff') AS position_type,
                COALESCE(u.role, 'staff') AS user_role
         FROM yc_tkt_mgmt.users u
         LEFT JOIN yc_tkt_mgmt.departments d ON d.id = u.department_id
         LEFT JOIN yc_tkt_mgmt.staff_positions sp ON sp.user_id = u.id AND sp.is_primary = TRUE
         LEFT JOIN yc_tkt_mgmt.positions p ON p.id = sp.position_id
         WHERE u.id = $1 LIMIT 1`, [user.id]
      );
      deptName     = profileRow.rows[0]?.dept_name     || '';
      deptId       = profileRow.rows[0]?.dept_id       || null;
      positionType = profileRow.rows[0]?.position_type || 'staff';
      userRole     = profileRow.rows[0]?.user_role     || 'staff';
    } catch { /* not critical */ }

    // Mint our own session + JWTs (positionType now embedded in access token)
    const { accessToken, refreshToken, sessionToken } = await createSession({ user, rememberMe: rememberMe, req, positionType });

    // Set HTTP-only cookies
    res.cookie('yc_access',  accessToken,  cookieOpts(15 * 60_000));
    res.cookie('yc_refresh', refreshToken, cookieOpts((rememberMe ? 90 : 30) * 86_400_000));
    res.cookie('yc_session', sessionToken, cookieOpts((rememberMe ? 90 : 30) * 86_400_000));

    // Embed user info in redirect so frontend can display correct name/id immediately.
    // NOTE: profile_photo_url is intentionally excluded here — it is a base64 JPEG
    // (30–100KB) which would make the URL too long and get truncated by edge proxies.
    // The frontend fetches it separately via GET /users/me after login.
    const userParam = Buffer.from(JSON.stringify({
      id:              user.id,
      name:            user.name  || '',
      email:           user.email || '',
      dept:            deptName,
      deptId,
      positionType,
      role:            userRole,
      isBootstrapAdmin: !!(user as unknown as Record<string, unknown>).bootstrap_admin,
    })).toString('base64url');

    // Also pass the access token so the frontend can use Authorization: Bearer
    // (cross-origin HTTP-only cookies are blocked by modern browsers)
    const tokenParam = Buffer.from(accessToken).toString('base64url');

    res.redirect(`${env.FRONTEND_URL}?ms_user=${userParam}&_t=${tokenParam}`);
  } catch (err) {
    const e = err as { statusCode?: number; code?: string; message?: string };
    await logAudit({ action: 'login.failed', module: 'auth', metadata: { reason: e.code || 'callback_error', error: String(err) }, success: false, req });
    // Domain / authorization failures → redirect to frontend with a readable error code
    // so the "Unauthorized Entra User" page is shown instead of raw JSON.
    if (e.code === 'disallowed_domain' || e.code === 'not_authorized' || e.code === 'account_inactive') {
      return res.redirect(`${env.FRONTEND_URL}?error=${encodeURIComponent(e.code)}`);
    }
    next(err);
  }
});

// ─── POST /auth/refresh — rotate refresh + access ──────────
router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshTokenCookie = req.cookies?.['yc_refresh'];
    if (!refreshTokenCookie) return res.status(401).json({ error: 'no_refresh_token' });

    const { verifyToken } = await import('../../utils/tokens');
    const payload = verifyToken<{ sub: string; sid: string }>(refreshTokenCookie);
    const { accessToken, refreshToken } = await rotateTokens(Number(payload.sid), refreshTokenCookie, req);

    res.cookie('yc_access',  accessToken,  cookieOpts(15 * 60_000));
    res.cookie('yc_refresh', refreshToken, cookieOpts(30 * 86_400_000));
    // Return new access token in body so frontend can update sessionStorage Bearer token
    res.json({ ok: true, accessToken });
  } catch (err) { next(err); }
});

// ─── GET /auth/me — current user ───────────────────────────
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    let rows;
    try {
      ({ rows } = await pool.query(
        `SELECT u.id, u.email, u.name,
                u.is_active          AS active,
                u.is_bootstrap_admin AS bootstrap_admin,
                u.auth_provider,
                u.department_id,
                u.employment_type,
                u.role,
                d.name               AS department_name
           FROM yc_tkt_mgmt.users u
           LEFT JOIN yc_tkt_mgmt.departments d ON d.id = u.department_id
          WHERE u.id = $1`,
        [req.auth!.userId]
      ));
    } catch {
      // role column may not exist yet — fall back without it
      ({ rows } = await pool.query(
        `SELECT u.id, u.email, u.name,
                u.is_active          AS active,
                u.is_bootstrap_admin AS bootstrap_admin,
                u.auth_provider,
                u.department_id,
                u.employment_type,
                'staff'::text        AS role,
                d.name               AS department_name
           FROM yc_tkt_mgmt.users u
           LEFT JOIN yc_tkt_mgmt.departments d ON d.id = u.department_id
          WHERE u.id = $1`,
        [req.auth!.userId]
      ));
    }
    res.json({ user: rows[0], permissions: req.auth!.permissions });
  } catch (err) { next(err); }
});

// ─── POST /auth/logout — current session ───────────────────
router.post('/logout', requireAuth, async (req, res) => {
  await revokeSession(req.auth!.sessionId, 'user_logout', req);
  res.clearCookie('yc_access');
  res.clearCookie('yc_refresh');
  res.clearCookie('yc_session');
  res.json({ ok: true, microsoftLogoutUrl: getMicrosoftLogoutUrl() });
});

// ─── POST /auth/logout-all — every device ──────────────────
router.post('/logout-all', requireAuth, async (req, res) => {
  await revokeAllUserSessions(req.auth!.userId, 'user_logout_all', req);
  res.clearCookie('yc_access');
  res.clearCookie('yc_refresh');
  res.clearCookie('yc_session');
  res.json({ ok: true, microsoftLogoutUrl: getMicrosoftLogoutUrl() });
});

// ─── GET /auth/logged-out — post-Entra logout landing ──────
router.get('/logged-out', (_req, res) => {
  res.redirect(`${env.FRONTEND_URL}/login?logged_out=1`);
});

// ─── GET /auth/sessions — list my active sessions ──────────
router.get('/sessions', requireAuth, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT id, device_info, ip_address, user_agent, remember_me, last_activity_at, created_at, expires_at,
            (id = $1) AS is_current
     FROM yc_tkt_mgmt.sessions
     WHERE user_id = $2 AND is_revoked = FALSE AND expires_at > NOW()
     ORDER BY last_activity_at DESC`,
    [req.auth!.sessionId, req.auth!.userId]
  );
  res.json({ sessions: rows });
});

// ─── DELETE /auth/sessions/:id — kill a specific session ───
router.delete('/sessions/:id', requireAuth, async (req, res) => {
  const sessionId = Number(req.params.id);
  // Make sure it belongs to the caller
  const { rows } = await pool.query(`SELECT user_id FROM yc_tkt_mgmt.sessions WHERE id = $1`, [sessionId]);
  if (!rows[0] || rows[0].user_id !== req.auth!.userId) return res.status(403).json({ error: 'forbidden' });
  await revokeSession(sessionId, 'user_revoked_session', req);
  res.json({ ok: true });
});

export default router;
