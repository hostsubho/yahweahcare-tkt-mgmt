#!/bin/bash
cd "$(dirname "$0")"

export DATABASE_URL="postgresql://neondb_owner:npg_yGDK7rPbU1St@ep-hidden-hat-a78c5hgh-pooler.ap-southeast-2.aws.neon.tech/yc_tms?sslmode=require&channel_binding=require"

echo "============================================"
echo " Full setup: yc_tms database"
echo "============================================"
echo ""

node - <<'EOF'
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function runSQL(label, sql) {
  // Remove SQL comments, split on semicolons
  const statements = sql
    .split(';')
    .map(s => s.split('\n').filter(l => !l.trim().startsWith('--')).join('\n').trim())
    .filter(s => s.length > 0);

  let ok = 0, skip = 0, fail = 0;
  for (const stmt of statements) {
    try {
      await pool.query(stmt);
      ok++;
    } catch(e) {
      if (e.message?.includes('already exists') || e.code === '42710' || e.code === '42P07') {
        skip++;
      } else if (e.message?.includes('does not exist') && stmt.trim().toUpperCase().startsWith('ALTER')) {
        // skip ALTER on missing tables/columns silently
        skip++;
      } else {
        console.log(`  ⚠ ${e.message.split('\n')[0].substring(0,80)}`);
        fail++;
      }
    }
  }
  console.log(`✓ ${label}: ${ok} ok, ${skip} skipped, ${fail} failed`);
}

async function main() {
  const base = __dirname;

  console.log('Step 1: Create schema + core auth tables (YCTMBackend/src/db/schema.sql)');
  await pool.query('DROP TABLE IF EXISTS yc_tkt_mgmt.users CASCADE').catch(()=>{});
  await runSQL('schema.sql', fs.readFileSync(path.join(base, 'src/db/schema.sql'), 'utf8'));

  console.log('\nStep 2: Create ticket/category/status/notification tables (api/schema.sql)');
  let apiSchema = fs.readFileSync(path.join(base, '../api/schema.sql'), 'utf8');
  // Strip DROP SCHEMA CASCADE (would wipe auth tables created in Step 1)
  apiSchema = apiSchema.replace(/DROP SCHEMA IF EXISTS yc_tkt_mgmt CASCADE\s*;/gi, '-- (skipped DROP SCHEMA)');
  // Make CREATE SCHEMA idempotent
  apiSchema = apiSchema.replace(/CREATE SCHEMA yc_tkt_mgmt\s*;/gi, 'CREATE SCHEMA IF NOT EXISTS yc_tkt_mgmt;');
  // Make CREATE TABLE idempotent
  const idempotentApi = apiSchema.replace(/CREATE TABLE (?!IF NOT EXISTS)/g, 'CREATE TABLE IF NOT EXISTS ');
  await runSQL('api/schema.sql', idempotentApi);

  console.log('\nStep 3: Create departments + positions (src/db/full_rebuild.sql partial)');
  const deptSQL = `
    CREATE SCHEMA IF NOT EXISTS yc_tkt_mgmt;
    SET search_path TO yc_tkt_mgmt, public;
    CREATE TABLE IF NOT EXISTS departments (
      id             SERIAL PRIMARY KEY,
      name           TEXT NOT NULL UNIQUE,
      parent_dept_id INT  REFERENCES departments(id) ON DELETE SET NULL,
      sort_order     INT  NOT NULL DEFAULT 0,
      created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS positions (
      id                 SERIAL PRIMARY KEY,
      title              TEXT NOT NULL,
      department_id      INT  REFERENCES departments(id) ON DELETE SET NULL,
      parent_position_id INT  REFERENCES positions(id)  ON DELETE SET NULL,
      is_vacant          BOOLEAN NOT NULL DEFAULT TRUE,
      sort_order         INT  NOT NULL DEFAULT 0,
      created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS yc_tkt_mgmt.user_roles (
      user_id    INT NOT NULL REFERENCES yc_tkt_mgmt.users(id) ON DELETE CASCADE,
      role_id    INT NOT NULL REFERENCES yc_tkt_mgmt.roles(id) ON DELETE CASCADE,
      assigned_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (user_id, role_id)
    );
    CREATE TABLE IF NOT EXISTS yc_tkt_mgmt.user_positions (
      user_id     INT NOT NULL REFERENCES yc_tkt_mgmt.users(id) ON DELETE CASCADE,
      position_id INT NOT NULL,
      assigned_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (user_id, position_id)
    );
    CREATE TABLE IF NOT EXISTS yc_tkt_mgmt.staff_positions (
      id          SERIAL PRIMARY KEY,
      user_id     INT NOT NULL REFERENCES yc_tkt_mgmt.users(id) ON DELETE CASCADE,
      position_id INT NOT NULL,
      assigned_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS yc_tkt_mgmt.ticket_approvers (
      id              SERIAL PRIMARY KEY,
      ticket_id       INT NOT NULL,
      approver_user_id INT NOT NULL REFERENCES yc_tkt_mgmt.users(id),
      status          TEXT NOT NULL DEFAULT 'pending',
      decided_at      TIMESTAMPTZ,
      comments        TEXT,
      created_at      TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS yc_tkt_mgmt.ticket_approval_history (
      id              SERIAL PRIMARY KEY,
      ticket_id       INT NOT NULL,
      approver_user_id INT REFERENCES yc_tkt_mgmt.users(id),
      action          TEXT NOT NULL,
      comments        TEXT,
      created_at      TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS yc_tkt_mgmt.ticket_escalations (
      id              SERIAL PRIMARY KEY,
      ticket_id       INT NOT NULL,
      escalated_by    INT REFERENCES yc_tkt_mgmt.users(id),
      escalated_to    INT REFERENCES yc_tkt_mgmt.users(id),
      reason          TEXT,
      created_at      TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS yc_tkt_mgmt.ticket_reopen_requests (
      id              SERIAL PRIMARY KEY,
      ticket_id       INT NOT NULL,
      requested_by    INT REFERENCES yc_tkt_mgmt.users(id),
      reason          TEXT,
      status          TEXT DEFAULT 'pending',
      created_at      TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS yc_tkt_mgmt.ticket_audit_log (
      id          BIGSERIAL PRIMARY KEY,
      ticket_id   INT NOT NULL,
      user_id     INT REFERENCES yc_tkt_mgmt.users(id) ON DELETE SET NULL,
      action      TEXT NOT NULL,
      metadata    JSONB DEFAULT '{}'::jsonb,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS yc_tkt_mgmt.push_subscriptions (
      id          SERIAL PRIMARY KEY,
      user_id     INT NOT NULL REFERENCES yc_tkt_mgmt.users(id) ON DELETE CASCADE,
      subscription JSONB NOT NULL,
      created_at  TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id)
    );
    CREATE TABLE IF NOT EXISTS yc_tkt_mgmt.notification_queue (
      id          BIGSERIAL PRIMARY KEY,
      user_id     INT REFERENCES yc_tkt_mgmt.users(id) ON DELETE SET NULL,
      type        TEXT NOT NULL,
      payload     JSONB DEFAULT '{}'::jsonb,
      status      TEXT DEFAULT 'pending',
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS yc_tkt_mgmt.email_logs (
      id          BIGSERIAL PRIMARY KEY,
      to_email    TEXT NOT NULL,
      subject     TEXT,
      template    TEXT,
      status      TEXT DEFAULT 'sent',
      error       TEXT,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS yc_tkt_mgmt.email_queue (
      id          BIGSERIAL PRIMARY KEY,
      to_email    TEXT NOT NULL,
      subject     TEXT,
      body        TEXT,
      status      TEXT DEFAULT 'pending',
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS yc_tkt_mgmt.activity_log_archives (
      id          BIGSERIAL PRIMARY KEY,
      original_id BIGINT,
      ticket_id   INT,
      user_id     INT,
      action      TEXT,
      metadata    JSONB,
      created_at  TIMESTAMPTZ
    );
  `;
  await runSQL('extra tables', deptSQL);

  console.log('\nStep 4: Seed roles, permissions, role_permissions');
  await runSQL('seed_permissions.sql', fs.readFileSync(path.join(base, 'src/db/seed_permissions.sql'), 'utf8'));

  console.log('\nStep 5: Seed categories, priorities, statuses');
  // Use fully-qualified names
  const lookupSQL = fs.readFileSync(path.join(base, 'src/db/seed_lookup_tables.sql'), 'utf8')
    .replace(/INSERT INTO categories/g, 'INSERT INTO yc_tkt_mgmt.categories')
    .replace(/INSERT INTO priorities/g, 'INSERT INTO yc_tkt_mgmt.priorities')
    .replace(/INSERT INTO statuses/g, 'INSERT INTO yc_tkt_mgmt.statuses')
    .replace(/SET search_path.*\n/g, '');
  await runSQL('seed_lookup_tables.sql', lookupSQL);

  // Final verification
  const { rows } = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM yc_tkt_mgmt.roles)       AS roles,
      (SELECT COUNT(*) FROM yc_tkt_mgmt.permissions)  AS permissions,
      (SELECT COUNT(*) FROM yc_tkt_mgmt.categories)   AS categories,
      (SELECT COUNT(*) FROM yc_tkt_mgmt.priorities)   AS priorities,
      (SELECT COUNT(*) FROM yc_tkt_mgmt.statuses)     AS statuses
  `);
  const r = rows[0];
  console.log('\n============================================');
  console.log('✅ yc_tms is ready!');
  console.log(`   roles: ${r.roles} | permissions: ${r.permissions}`);
  console.log(`   categories: ${r.categories} | priorities: ${r.priorities} | statuses: ${r.statuses}`);
  console.log('============================================');

  await pool.end();
}

main().catch(e => { console.error('✗ Failed:', e.message); process.exit(1); });
EOF

echo ""
echo "Press any key to close..."
read -n 1
