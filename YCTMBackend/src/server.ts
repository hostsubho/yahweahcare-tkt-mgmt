// ============================================================
// Yahwehcare HRMS — Express server entry point
// ============================================================

import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import { env } from './config/env';
import { pool } from './db/pool';
import { apiLimiter } from './middleware/rateLimit.middleware';
import { errorHandler, notFound } from './middleware/error.middleware';

import authRoutes          from './modules/auth/auth.routes';
import userRoutes          from './modules/users/users.routes';
import roleRoutes          from './modules/roles/roles.routes';
import auditRoutes         from './modules/audit/audit.routes';
import scheduleRoutes      from './modules/schedules/schedules.routes';
import ticketRoutes        from './modules/tickets/tickets.routes';
import notificationRoutes  from './modules/notifications/notifications.routes';
import pushRoutes          from './modules/notifications/push.routes';
import lookupRoutes        from './modules/lookup/lookup.routes';
import orgRoutes           from './modules/org/org.routes';
import vehicleRoutes       from './modules/vehicles/vehicles.routes';
import { ensurePushTable } from './modules/notifications/notifications.service';

const app = express();

// ─── Trust proxy headers (Azure App Service, nginx, etc.) ──
app.set('trust proxy', 1);

// ─── Security headers ──────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: env.isProduction ? undefined : false,
  crossOriginEmbedderPolicy: false,
}));

// ─── CORS — only the configured frontend may call us ──────
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,                          // allow auth cookies
  methods: ['GET','POST','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
}));

// ─── Parsers ───────────────────────────────────────────────
app.use(express.json({ limit: '12mb' })); // increased for file attachments (base64)
app.use(cookieParser(env.SESSION_SECRET));

// ─── Request logging ───────────────────────────────────────
app.use(morgan(env.isProduction ? 'combined' : 'dev'));

// ─── Health probe (unauthenticated) ────────────────────────
app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, time: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ ok: false, error: 'database_unavailable' });
  }
});

// ─── Rate limiting on every API call ───────────────────────
app.use('/auth',           apiLimiter);
app.use('/users',          apiLimiter);
app.use('/roles',          apiLimiter);
app.use('/audit-logs',     apiLimiter);
app.use('/schedules',      apiLimiter);
app.use('/tickets',        apiLimiter);
app.use('/notifications',  apiLimiter);
app.use('/push',           apiLimiter);
app.use('/lookup',         apiLimiter);
app.use('/org',            apiLimiter);
app.use('/vehicles',       apiLimiter);

// ─── Routes ────────────────────────────────────────────────
app.use('/auth',           authRoutes);
app.use('/users',          userRoutes);
app.use('/roles',          roleRoutes);
app.use('/audit-logs',     auditRoutes);
app.use('/schedules',      scheduleRoutes);
app.use('/tickets',        ticketRoutes);
app.use('/notifications',  notificationRoutes);
app.use('/push',           pushRoutes);
app.use('/lookup',         lookupRoutes);
app.use('/org',            orgRoutes);
app.use('/vehicles',       vehicleRoutes);

// ─── 404 + error handler ───────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start ─────────────────────────────────────────────────
app.listen(env.PORT, async () => {
  console.log(`✓ HRMS auth service listening on ${env.BACKEND_URL} (port ${env.PORT})`);
  console.log(`  Frontend allowed origin: ${env.FRONTEND_URL}`);
  console.log(`  Microsoft Entra tenant:  ${env.AZURE_TENANT_ID}`);
  console.log(`  Allowed org domains:     ${env.ALLOWED_DOMAINS.join(', ')}`);
  // Run DB migration for push_subscriptions table
  await ensurePushTable();
  console.log('  Push subscriptions table: ready');
});

// ─── Background: clean expired sessions every 5 min ────────
setInterval(async () => {
  try {
    const { rowCount } = await pool.query(
      `UPDATE yc_tkt_mgmt.sessions
         SET is_revoked = TRUE, revoked_at = NOW(), revoked_reason = 'expired'
       WHERE is_revoked = FALSE AND expires_at < NOW()`
    );
    if (rowCount) console.log(`[sweeper] revoked ${rowCount} expired sessions`);
  } catch (err) {
    console.error('[sweeper] error', err);
  }
}, 5 * 60_000);

// ─── Graceful shutdown ─────────────────────────────────────
for (const sig of ['SIGINT', 'SIGTERM'] as const) {
  process.on(sig, async () => {
    console.log(`\nReceived ${sig}, closing pool...`);
    await pool.end();
    process.exit(0);
  });
}
