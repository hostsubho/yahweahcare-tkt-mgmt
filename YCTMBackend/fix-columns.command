#!/bin/bash
cd "$(dirname "$0")"

export DATABASE_URL="postgresql://neondb_owner:npg_yGDK7rPbU1St@ep-hidden-hat-a78c5hgh-pooler.ap-southeast-2.aws.neon.tech/yc_tms?sslmode=require&channel_binding=require"

echo "============================================"
echo " Fix column mismatches in yc_tms"
echo "============================================"
echo ""

node - <<'EOF'
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run(label, sql) {
  try {
    await pool.query(sql);
    console.log(`  ✓ ${label}`);
  } catch(e) {
    if (e.message.includes('already exists') || e.code === '42701') {
      console.log(`  ⊘ ${label} (already exists)`);
    } else {
      console.log(`  ✗ ${label}: ${e.message.split('\n')[0]}`);
    }
  }
}

async function main() {
  console.log('Step 1: Add missing columns to yc_tkt_mgmt.users');

  // Identity / auth columns the backend expects
  await run('users.is_active',        `ALTER TABLE yc_tkt_mgmt.users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE`);
  await run('users.azure_oid',        `ALTER TABLE yc_tkt_mgmt.users ADD COLUMN IF NOT EXISTS azure_oid TEXT`);
  await run('users.azure_oid unique', `ALTER TABLE yc_tkt_mgmt.users DROP CONSTRAINT IF EXISTS users_azure_oid_key`);
  await run('users.azure_oid idx',    `CREATE UNIQUE INDEX IF NOT EXISTS users_azure_oid_key ON yc_tkt_mgmt.users(azure_oid) WHERE azure_oid IS NOT NULL`);
  await run('users.is_bootstrap_admin', `ALTER TABLE yc_tkt_mgmt.users ADD COLUMN IF NOT EXISTS is_bootstrap_admin BOOLEAN NOT NULL DEFAULT FALSE`);
  await run('users.assignable',       `ALTER TABLE yc_tkt_mgmt.users ADD COLUMN IF NOT EXISTS assignable BOOLEAN NOT NULL DEFAULT FALSE`);

  // Org / HR columns
  await run('users.department_id',    `ALTER TABLE yc_tkt_mgmt.users ADD COLUMN IF NOT EXISTS department_id INTEGER REFERENCES yc_tkt_mgmt.departments(id) ON DELETE SET NULL`);
  await run('users.position_id',      `ALTER TABLE yc_tkt_mgmt.users ADD COLUMN IF NOT EXISTS position_id INTEGER`);
  await run('users.manager_id',       `ALTER TABLE yc_tkt_mgmt.users ADD COLUMN IF NOT EXISTS manager_id INTEGER REFERENCES yc_tkt_mgmt.users(id) ON DELETE SET NULL`);
  await run('users.employment_type',  `ALTER TABLE yc_tkt_mgmt.users ADD COLUMN IF NOT EXISTS employment_type TEXT`);
  await run('users.phone',            `ALTER TABLE yc_tkt_mgmt.users ADD COLUMN IF NOT EXISTS phone TEXT`);
  await run('users.address',          `ALTER TABLE yc_tkt_mgmt.users ADD COLUMN IF NOT EXISTS address TEXT`);
  await run('users.start_date',       `ALTER TABLE yc_tkt_mgmt.users ADD COLUMN IF NOT EXISTS start_date DATE`);
  await run('users.profile_notes',    `ALTER TABLE yc_tkt_mgmt.users ADD COLUMN IF NOT EXISTS profile_notes TEXT`);

  console.log('\nStep 2: Sync old column values → new column names');
  await run('sync is_active ← active',               `UPDATE yc_tkt_mgmt.users SET is_active = COALESCE(active, TRUE) WHERE is_active IS DISTINCT FROM COALESCE(active, TRUE)`);
  await run('sync azure_oid ← microsoft_id',          `UPDATE yc_tkt_mgmt.users SET azure_oid = microsoft_id WHERE azure_oid IS NULL AND microsoft_id IS NOT NULL`);
  await run('sync is_bootstrap_admin ← bootstrap_admin', `UPDATE yc_tkt_mgmt.users SET is_bootstrap_admin = COALESCE(bootstrap_admin, FALSE) WHERE is_bootstrap_admin IS DISTINCT FROM COALESCE(bootstrap_admin, FALSE)`);

  console.log('\nStep 3: Add missing columns to yc_tkt_mgmt.positions');
  await run('positions.is_active',     `ALTER TABLE yc_tkt_mgmt.positions ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE`);
  await run('positions.position_type', `ALTER TABLE yc_tkt_mgmt.positions ADD COLUMN IF NOT EXISTS position_type TEXT`);
  await run('positions.is_vacant',     `ALTER TABLE yc_tkt_mgmt.positions ADD COLUMN IF NOT EXISTS is_vacant BOOLEAN NOT NULL DEFAULT TRUE`);
  await run('positions.updated_at',    `ALTER TABLE yc_tkt_mgmt.positions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()`);

  console.log('\nStep 4: Add missing columns to yc_tkt_mgmt.staff_positions');
  await run('staff_positions.is_primary', `ALTER TABLE yc_tkt_mgmt.staff_positions ADD COLUMN IF NOT EXISTS is_primary BOOLEAN NOT NULL DEFAULT FALSE`);

  console.log('\nStep 5: Fix tickets table - add expected columns');
  await run('tickets.expected_completion', `ALTER TABLE yc_tkt_mgmt.tickets ADD COLUMN IF NOT EXISTS expected_completion TIMESTAMPTZ`);
  await run('tickets.pending_approval_at', `ALTER TABLE yc_tkt_mgmt.tickets ADD COLUMN IF NOT EXISTS pending_approval_at TIMESTAMPTZ`);
  await run('tickets.escalated_at',        `ALTER TABLE yc_tkt_mgmt.tickets ADD COLUMN IF NOT EXISTS escalated_at TIMESTAMPTZ`);
  await run('tickets.escalation_reason',   `ALTER TABLE yc_tkt_mgmt.tickets ADD COLUMN IF NOT EXISTS escalation_reason TEXT`);
  await run('tickets.escalated_to',        `ALTER TABLE yc_tkt_mgmt.tickets ADD COLUMN IF NOT EXISTS escalated_to INTEGER REFERENCES yc_tkt_mgmt.users(id)`);
  await run('tickets.resolved_at',         `ALTER TABLE yc_tkt_mgmt.tickets ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ`);
  await run('tickets.closed_at',           `ALTER TABLE yc_tkt_mgmt.tickets ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ`);
  await run('tickets.department_id',       `ALTER TABLE yc_tkt_mgmt.tickets ADD COLUMN IF NOT EXISTS department_id INTEGER REFERENCES yc_tkt_mgmt.departments(id) ON DELETE SET NULL`);
  await run('tickets.sla_due_at',          `ALTER TABLE yc_tkt_mgmt.tickets ADD COLUMN IF NOT EXISTS sla_due_at TIMESTAMPTZ`);
  await run('tickets.first_response_at',   `ALTER TABLE yc_tkt_mgmt.tickets ADD COLUMN IF NOT EXISTS first_response_at TIMESTAMPTZ`);

  console.log('\nStep 6: Apply POST_RESET_RECOVERY.sql alterations');
  // Key ALTER TABLE and index additions from POST_RESET_RECOVERY.sql
  await run('idx users email',         `CREATE INDEX IF NOT EXISTS idx_users_email ON yc_tkt_mgmt.users(email)`);
  await run('idx users azure_oid',     `CREATE INDEX IF NOT EXISTS idx_users_azure_oid ON yc_tkt_mgmt.users(azure_oid) WHERE azure_oid IS NOT NULL`);
  await run('idx users is_active',     `CREATE INDEX IF NOT EXISTS idx_users_is_active ON yc_tkt_mgmt.users(is_active)`);
  await run('idx positions parent',    `CREATE INDEX IF NOT EXISTS idx_positions_parent_pos ON yc_tkt_mgmt.positions(parent_position_id)`);
  await run('idx users pos_id',        `CREATE INDEX IF NOT EXISTS idx_users_pos_id ON yc_tkt_mgmt.users(position_id)`);

  console.log('\nStep 7: Verification');
  const { rows } = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='yc_tkt_mgmt' AND table_name='users' AND column_name='is_active')        AS users_is_active,
      (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='yc_tkt_mgmt' AND table_name='users' AND column_name='azure_oid')         AS users_azure_oid,
      (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='yc_tkt_mgmt' AND table_name='users' AND column_name='is_bootstrap_admin') AS users_is_bootstrap_admin,
      (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='yc_tkt_mgmt' AND table_name='users' AND column_name='department_id')      AS users_department_id,
      (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='yc_tkt_mgmt' AND table_name='positions' AND column_name='is_active')      AS positions_is_active,
      (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='yc_tkt_mgmt' AND table_name='positions' AND column_name='position_type')  AS positions_position_type
  `);
  const r = rows[0];
  const ok = Object.values(r).every(v => Number(v) === 1);
  console.log('\n============================================');
  if (ok) {
    console.log('✅ All columns verified!');
  } else {
    console.log('⚠ Some columns missing:');
    Object.entries(r).forEach(([k,v]) => console.log(`  ${Number(v)===1?'✓':'✗'} ${k}`));
  }
  console.log('============================================');

  await pool.end();
}

main().catch(e => { console.error('✗ Failed:', e.message); process.exit(1); });
EOF

echo ""
echo "Press any key to close..."
read -n 1
