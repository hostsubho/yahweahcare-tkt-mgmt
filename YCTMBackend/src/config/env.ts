// ============================================================
// Strongly-typed, validated environment configuration
// ============================================================

import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4001),
  BACKEND_URL: z.string().url(),
  FRONTEND_URL: z.string().url(),
  DATABASE_URL: z.string(),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters'),
  COOKIE_DOMAIN: z.string().default('localhost'),
  COOKIE_SECURE: z.string()
    .default(process.env.NODE_ENV === 'production' ? 'true' : 'false')
    .transform(v => v === 'true'),
  COOKIE_SAMESITE: z.enum(['strict', 'lax', 'none'])
    .default(process.env.NODE_ENV === 'production' ? 'none' : 'lax'),

  AZURE_CLIENT_ID: z.string().min(1),
  AZURE_CLIENT_SECRET: z.string().min(1),
  AZURE_TENANT_ID: z.string().min(1),
  AZURE_REDIRECT_URI: z.string().url(),
  AZURE_POST_LOGOUT_REDIRECT_URI: z.string().url(),
  AZURE_SCOPES: z.string().default('openid profile email User.Read'),

  ALLOWED_EMAIL_DOMAINS: z.string().default('yahwehcare.com.au,yahwehpc.com.au,wmxsolutions.com.au'),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900_000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  LOGIN_RATE_LIMIT_MAX: z.coerce.number().default(5),
  ACCOUNT_LOCK_THRESHOLD: z.coerce.number().default(5),
  ACCOUNT_LOCK_DURATION_MS: z.coerce.number().default(900_000),

  ACCESS_TOKEN_TTL: z.string().default('15m'),
  REFRESH_TOKEN_TTL: z.string().default('30d'),
  SESSION_INACTIVITY_TIMEOUT_MS: z.coerce.number().default(1_800_000),

  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  // ── Email (Resend) — optional; email silently skipped if not set ──
  RESEND_API_KEY: z.string().optional(),
  // Shared fallback from address (used when portal is unknown)
  EMAIL_FROM: z.string().default('Yahwehcare <noreply@yahwehcare.com.au>'),
  // Portal-specific from addresses — override EMAIL_FROM per portal
  // Named to match the existing Vercel non-sensitive env vars
  EMAIL_FROM_YPC: z.string().default('Yahweh Property Care <noreply@yahwehpc.com.au>'),
  EMAIL_FROM_YC:  z.string().default('Yahweh Care <noreply@yahwehcare.com.au>'),
  CRON_SECRET: z.string().optional(),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  ...parsed.data,
  ALLOWED_DOMAINS: parsed.data.ALLOWED_EMAIL_DOMAINS.split(',').map(d => d.trim().toLowerCase()),
  AZURE_SCOPE_LIST: parsed.data.AZURE_SCOPES.split(/\s+/).filter(Boolean),
  isProduction: parsed.data.NODE_ENV === 'production',
} as const;
