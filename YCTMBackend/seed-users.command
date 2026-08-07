#!/bin/bash
cd "$(dirname "$0")"

export DATABASE_URL="postgresql://neondb_owner:npg_yGDK7rPbU1St@ep-hidden-hat-a78c5hgh-pooler.ap-southeast-2.aws.neon.tech/yc_tms?sslmode=require&channel_binding=require"

echo "============================================"
echo " Seed users into yc_tms"
echo "============================================"
echo ""

node - <<'EOF'
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function q(sql, params = []) {
  return pool.query(sql, params);
}

async function main() {
  // Get role IDs
  const { rows: roles } = await q(`SELECT id, name FROM yc_tkt_mgmt.roles`);
  const roleId = {};
  roles.forEach(r => roleId[r.name] = r.id);

  if (!roleId.super_admin) {
    console.error('✗ Roles not seeded yet — run full-setup-new-db.command first');
    process.exit(1);
  }
  console.log('Roles found:', Object.keys(roleId).join(', '));

  // Upsert all staff users
  const users = [
    // [email, name, role_name, department, designation, initials, is_bootstrap_admin, assignable]
    ['ron@wmxsolutions.com.au',    'Ron Costa',             'super_admin', 'Management',  'Bootstrap Super Admin',                    'RC', true,  true],
    ['alex@yahwehpc.com.au',       'Alex',                  'super_admin', 'Director Level', 'Director / Client Relationship Manager', 'AL', true,  true],
    ['it@yahwehcare.com.au',       'Ron Costa (IT)',        'super_admin', null,          'Bootstrap Super Admin',                    'RC', true,  true],
    ['suganty@yahwehpc.com.au',    'Suganty P',             'manager',    'Operations',   'Operations Manager',                       'SP', false, true],
    ['sunny@yahwehcare.com.au',    'Sunita Maharjan',       'manager',    'Operations',   'Service Delivery Manager',                 'SM', false, true],
    ['elenor@yahwehcare.com.au',   'Elenor Elia',           'user',       'Operations',   'Roster Coordinator',                       'EE', false, true],
    ['saloni@yahwehcare.com.au',   'Saloni',                'manager',    'Operations',   'Support Coordination Lead',                'SA', false, true],
    ['james@yahwehcare.com.au',    'James Baskaran',        'user',       'Operations',   'Support Coordination Staff',               'JB', false, true],
    ['miejkyla@yahwehcare.com.au', 'Miejkyla',              'hr',         'Operations',   'HR / Admin Officer',                       'MI', false, true],
    ['venujah@yahwehcare.com.au',  'Venujah Arudselvam',   'user',       'Operations',   'Day Centre Officer',                       'VA', false, true],
    ['akila@yahwehcare.com.au',    'Akila Nanayakkara',     'manager',    'Finance',      'Finance Manager / Plan Manager',           'AN', false, true],
  ];

  let inserted = 0, updated = 0;
  for (const [email, name, role, department, designation, initials, isBootstrap, assignable] of users) {
    const rid = roleId[role];
    const { rowCount } = await q(`
      INSERT INTO yc_tkt_mgmt.users
        (email, name, role_id, role, department, designation, avatar_initials,
         auth_provider, active, is_active, bootstrap_admin, is_bootstrap_admin,
         system_created, assignable)
      VALUES ($1,$2,$3,$4,$5,$6,$7,'microsoft',TRUE,TRUE,$8,$8,FALSE,$9)
      ON CONFLICT (email) DO UPDATE SET
        name              = EXCLUDED.name,
        role_id           = EXCLUDED.role_id,
        role              = EXCLUDED.role,
        is_active         = TRUE,
        active            = TRUE,
        is_bootstrap_admin= EXCLUDED.is_bootstrap_admin,
        bootstrap_admin   = EXCLUDED.bootstrap_admin,
        assignable        = EXCLUDED.assignable,
        updated_at        = NOW()
    `, [email, name, rid, role, department, designation, initials, isBootstrap, assignable]);
    console.log(`  ✓ ${email} (${role}${isBootstrap ? ', bootstrap_admin' : ''})`);
  }

  // Final verification
  const { rows: counts } = await q(`
    SELECT COUNT(*) AS total,
           SUM(CASE WHEN is_bootstrap_admin THEN 1 ELSE 0 END) AS bootstrap_admins,
           SUM(CASE WHEN is_active THEN 1 ELSE 0 END) AS active_users
    FROM yc_tkt_mgmt.users
  `);
  const c = counts[0];

  console.log('\n============================================');
  console.log('✅ Users seeded!');
  console.log(`   total: ${c.total} | active: ${c.active_users} | bootstrap_admins: ${c.bootstrap_admins}`);
  console.log('============================================');

  await pool.end();
}

main().catch(e => { console.error('✗ Failed:', e.message); process.exit(1); });
EOF

echo ""
echo "Press any key to close..."
read -n 1
