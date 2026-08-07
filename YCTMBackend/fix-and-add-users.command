#!/bin/bash
cd "$(dirname "$0")"

export DATABASE_URL="postgresql://neondb_owner:npg_yGDK7rPbU1St@ep-hidden-hat-a78c5hgh-pooler.ap-southeast-2.aws.neon.tech/yc_tms?sslmode=require&channel_binding=require"

echo "============================================"
echo " Fix positions + add missing users"
echo "============================================"

node - <<'EOF'
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run(label, sql, params=[]) {
  try {
    const r = await pool.query(sql, params);
    console.log(`  ✓ ${label}`);
    return r;
  } catch(e) {
    if (e.code === '42701' || e.message.includes('already exists')) {
      console.log(`  ⊘ ${label} (already exists)`);
    } else {
      console.log(`  ✗ ${label}: ${e.message.split('\n')[0]}`);
    }
  }
}

async function main() {
  console.log('\nStep 1: Add missing columns to positions');
  await run('positions.dept_label',        `ALTER TABLE yc_tkt_mgmt.positions ADD COLUMN IF NOT EXISTS dept_label TEXT`);
  await run('positions.assignable',        `ALTER TABLE yc_tkt_mgmt.positions ADD COLUMN IF NOT EXISTS assignable BOOLEAN NOT NULL DEFAULT TRUE`);

  console.log('\nStep 2: Add missing columns to tickets');
  await run('tickets.category_id',         `ALTER TABLE yc_tkt_mgmt.tickets ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES yc_tkt_mgmt.categories(id)`);
  await run('tickets.priority_id',         `ALTER TABLE yc_tkt_mgmt.tickets ADD COLUMN IF NOT EXISTS priority_id INTEGER REFERENCES yc_tkt_mgmt.priorities(id)`);
  await run('tickets.status_id',           `ALTER TABLE yc_tkt_mgmt.tickets ADD COLUMN IF NOT EXISTS status_id INTEGER REFERENCES yc_tkt_mgmt.statuses(id)`);

  console.log('\nStep 3: Add 2 missing users from org chart');
  const { rows: roles } = await pool.query(`SELECT id, name FROM yc_tkt_mgmt.roles`);
  const roleId = {};
  roles.forEach(r => roleId[r.name] = r.id);

  const missing = [
    ['info@yahwehcare.com.au', 'Yahweh Care',  'user', 'Operations', 'External Consultant (HR)',            'YC', false, true],
    ['qms@yahwehpc.com.au',   'Yahweh QMS',   'user', 'Management', 'Business Development Officer',        'YQ', false, true],
  ];

  for (const [email, name, role, dept, designation, initials, isBootstrap, assignable] of missing) {
    const rid = roleId[role];
    await run(`user: ${email}`, `
      INSERT INTO yc_tkt_mgmt.users
        (email, name, role_id, role, department, designation, avatar_initials,
         auth_provider, active, is_active, bootstrap_admin, is_bootstrap_admin,
         system_created, assignable)
      VALUES ($1,$2,$3,$4,$5,$6,$7,'microsoft',TRUE,TRUE,$8,$8,FALSE,$9)
      ON CONFLICT (email) DO UPDATE SET
        name               = EXCLUDED.name,
        role_id            = EXCLUDED.role_id,
        is_active          = TRUE,
        active             = TRUE,
        assignable         = EXCLUDED.assignable,
        updated_at         = NOW()
    `, [email, name, rid, role, dept, designation, initials, isBootstrap, assignable]);
  }

  console.log('\nStep 4: Verification');
  const { rows: counts } = await pool.query(`
    SELECT
      COUNT(*) AS total_users,
      (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='yc_tkt_mgmt' AND table_name='positions' AND column_name='dept_label') AS has_dept_label,
      (SELECT COUNT(*) FROM yc_tkt_mgmt.positions) AS total_positions,
      (SELECT COUNT(*) FROM yc_tkt_mgmt.departments) AS total_departments
    FROM yc_tkt_mgmt.users
  `);
  const r = counts[0];

  console.log('\n============================================');
  console.log('✅ Done!');
  console.log(`   users: ${r.total_users} | positions: ${r.total_positions} | departments: ${r.total_departments}`);
  console.log(`   dept_label column: ${Number(r.has_dept_label) === 1 ? '✓' : '✗'}`);
  console.log('============================================');

  await pool.end();
}

main().catch(e => { console.error('✗ Failed:', e.message); process.exit(1); });
EOF

echo ""
echo "Press any key to close..."
read -n 1
