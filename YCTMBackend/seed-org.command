#!/bin/bash
cd "$(dirname "$0")"

export DATABASE_URL="postgresql://neondb_owner:npg_yGDK7rPbU1St@ep-hidden-hat-a78c5hgh-pooler.ap-southeast-2.aws.neon.tech/yc_tms?sslmode=require&channel_binding=require"

echo "============================================"
echo " Seed org chart (departments + positions)"
echo "============================================"

node - <<'EOF'
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });

async function main() {
  await client.connect();
  // Use single connection so SET search_path persists
  await client.query(`SET search_path TO yc_tkt_mgmt, public`);

  console.log('\nStep 1: Seed departments');
  await client.query(`
    INSERT INTO departments (name, sort_order) VALUES
      ('Director Level',                                0),
      ('Operations',                                    1),
      ('Finance',                                       2),
      ('Strategic Development & Client Relations',      3)
    ON CONFLICT (name) DO UPDATE SET sort_order = EXCLUDED.sort_order
  `);
  console.log('  ✓ 4 departments');

  console.log('\nStep 2: Clear & re-seed positions');
  await client.query(`UPDATE users SET position_id = NULL`);
  await client.query(`DELETE FROM staff_positions`);
  await client.query(`DELETE FROM positions`);

  const positions = [
    // [title, dept_name, parent_title, is_active, is_vacant, sort_order, position_type, dept_label]
    ['Director',                                              'Director Level',                          null,                                                      true,  false, 0, 'director',   'Director Level'],
    ['Operations Manager',                                   'Operations',                              'Director',                                                true,  false, 1, 'manager',    'Operations Department'],
    ['Finance Manager',                                      'Finance',                                 'Director',                                                true,  false, 2, 'manager',    'Finance Department'],
    ['Strategic Development / Client Relationship Manager',  'Strategic Development & Client Relations','Director',                                                true,  false, 3, 'manager',    'Strategic Dev & Client Relationship'],
    ['Service Delivery Manager',                             'Operations',                              'Operations Manager',                                      true,  false, 1, 'manager',    'Operations Department'],
    ['Support Coordination Lead',                            'Operations',                              'Operations Manager',                                      true,  false, 2, 'manager',    'Operations Department'],
    ['HR / Admin Officer',                                   'Operations',                              'Operations Manager',                                      true,  false, 3, 'hr',         'Operations Department'],
    ['Day Centre Officer',                                   'Operations',                              'Operations Manager',                                      true,  false, 4, 'staff',      'Operations Department'],
    ['Roster Coordinator',                                   'Operations',                              'Service Delivery Manager',                                true,  false, 1, 'staff',      'Operations Department'],
    ['Support Coordination Staff',                           'Operations',                              'Support Coordination Lead',                               true,  false, 1, 'staff',      'Operations Department'],
    ['Plan Manager',                                         'Finance',                                 'Finance Manager',                                         true,  false, 1, 'staff',      'Finance Department'],
    ['Business Development Officer',                         'Strategic Development & Client Relations','Strategic Development / Client Relationship Manager',     true,  false, 1, 'staff',      'Strategic Dev & Client Relationship'],
    ['Client Relationship Officer',                          'Strategic Development & Client Relations','Strategic Development / Client Relationship Manager',     false, true,  2, 'staff',      'Strategic Dev & Client Relationship'],
    ['External Consultant (HR)',                             'Operations',                              'HR / Admin Officer',                                      true,  false, 1, 'consultant', 'Operations Department'],
    ['External Consultant (Finance)',                        'Finance',                                 'Finance Manager',                                         false, true,  2, 'consultant', 'Finance Department'],
    ['External Marketing Consultant',                        'Strategic Development & Client Relations','Business Development Officer',                            false, true,  1, 'consultant', 'Strategic Dev & Client Relationship'],
    ['Support Workers',                                      'Operations',                              'Roster Coordinator',                                      false, true,  1, 'staff',      'Operations Department'],
    ['Staff (Day Centre)',                                   'Operations',                              'Day Centre Officer',                                      false, true,  1, 'staff',      'Operations Department'],
  ];

  for (const [title, dept, parent, isActive, isVacant, sortOrder, posType, deptLabel] of positions) {
    await client.query(`
      INSERT INTO positions (title, department_id, parent_position_id, is_active, is_vacant, sort_order, position_type, dept_label)
      SELECT $1,
        (SELECT id FROM departments WHERE name=$2),
        (SELECT id FROM positions WHERE title=$3 LIMIT 1),
        $4, $5, $6, $7, $8
    `, [title, dept, parent, isActive, isVacant, sortOrder, posType, deptLabel]);
  }
  console.log(`  ✓ ${positions.length} positions`);

  // Ensure staff_positions has a unique constraint so ON CONFLICT works
  await client.query(`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname='staff_positions_user_position_uniq'
      ) THEN
        ALTER TABLE staff_positions
          ADD CONSTRAINT staff_positions_user_position_uniq UNIQUE (user_id, position_id);
      END IF;
    END $$
  `);

  console.log('\nStep 3: Assign users to positions');
  const assignments = [
    // [email, position_title, dept_name, designation, manager_email, is_bootstrap_admin]
    ['alex@yahwehpc.com.au',       'Director',                                             'Director Level',                          'Director / Client Relationship Manager',        null,                         true],
    ['it@yahwehcare.com.au',       null,                                                   null,                                      'Bootstrap Super Admin',                         null,                         true],
    ['ron@wmxsolutions.com.au',    null,                                                   null,                                      'Bootstrap Super Admin',                         null,                         true],
    ['suganty@yahwehpc.com.au',    'Operations Manager',                                   'Operations',                              'Operations Manager',                            'alex@yahwehpc.com.au',       false],
    ['sunny@yahwehcare.com.au',    'Service Delivery Manager',                             'Operations',                              'Service Delivery Manager',                      'suganty@yahwehpc.com.au',    false],
    ['elenor@yahwehcare.com.au',   'Roster Coordinator',                                   'Operations',                              'Roster Coordinator',                            'sunny@yahwehcare.com.au',    false],
    ['saloni@yahwehcare.com.au',   'Support Coordination Lead',                            'Operations',                              'Support Coordination Lead',                     'suganty@yahwehpc.com.au',    false],
    ['james@yahwehcare.com.au',    'Support Coordination Staff',                           'Operations',                              'Support Coordination Staff',                    'saloni@yahwehcare.com.au',   false],
    ['miejkyla@yahwehcare.com.au', 'HR / Admin Officer',                                   'Operations',                              'HR / Admin Officer',                            'suganty@yahwehpc.com.au',    false],
    ['venujah@yahwehcare.com.au',  'Day Centre Officer',                                   'Operations',                              'Day Centre Officer',                            'suganty@yahwehpc.com.au',    false],
    ['akila@yahwehcare.com.au',    'Finance Manager',                                      'Finance',                                 'Finance Manager / Plan Manager',                'alex@yahwehpc.com.au',       false],
    ['info@yahwehcare.com.au',     'External Consultant (HR)',                             'Operations',                              'External Consultant (HR)',                       'miejkyla@yahwehcare.com.au', false],
    ['qms@yahwehpc.com.au',        'Business Development Officer',                         'Strategic Development & Client Relations', 'Business Development Officer',                  'alex@yahwehpc.com.au',       false],
  ];

  for (const [email, posTitle, deptName, designation, managerEmail, isBootstrap] of assignments) {
    await client.query(`
      UPDATE users SET
        position_id        = CASE WHEN $2::text IS NOT NULL THEN (SELECT id FROM positions WHERE title=$2 LIMIT 1) ELSE position_id END,
        department_id      = CASE WHEN $3::text IS NOT NULL THEN (SELECT id FROM departments WHERE name=$3) ELSE department_id END,
        department         = COALESCE($3, department),
        designation        = $4,
        manager_id         = CASE WHEN $5::text IS NOT NULL THEN (SELECT id FROM users WHERE email=$5) ELSE NULL END,
        is_bootstrap_admin = $6,
        bootstrap_admin    = $6,
        is_active          = TRUE,
        active             = TRUE,
        assignable         = TRUE,
        updated_at         = NOW()
      WHERE email = $1
    `, [email, posTitle, deptName, designation, managerEmail, isBootstrap]);

    // Also insert into staff_positions for org chart linking
    if (posTitle) {
      await client.query(`
        INSERT INTO staff_positions (user_id, position_id, is_primary)
        SELECT u.id, p.id, TRUE
        FROM users u, positions p
        WHERE u.email = $1 AND p.title = $2
        ON CONFLICT (user_id, position_id) DO NOTHING
      `, [email, posTitle]);
    }
    console.log(`  ✓ ${email}`);
  }

  // Mark External Consultant (HR) and Business Dev Officer positions as active/not vacant
  await client.query(`
    UPDATE positions SET is_active=TRUE, is_vacant=FALSE
    WHERE title IN ('External Consultant (HR)', 'Business Development Officer')
  `);

  console.log('\nStep 4: Recreate org chart view');
  await client.query(`DROP VIEW IF EXISTS v_org_chart`);
  await client.query(`
    CREATE VIEW v_org_chart AS
    SELECT
      u.id, u.name, u.email, u.is_active AS active, u.department, u.designation,
      u.profile_photo_url, u.avatar_initials, u.role,
      COALESCE(u.is_bootstrap_admin, FALSE) AS is_bootstrap_admin,
      p.id AS position_id, p.title AS position_title,
      p.is_vacant, p.is_active AS position_is_active,
      p.parent_position_id,
      d.id AS department_id, d.name AS department_name,
      m.id AS manager_id, m.name AS manager_name, m.email AS manager_email
    FROM positions p
    LEFT JOIN departments d ON d.id = p.department_id
    LEFT JOIN staff_positions sp ON sp.position_id = p.id
    LEFT JOIN users u ON u.id = sp.user_id AND u.is_active = TRUE
    LEFT JOIN users m ON m.id = u.manager_id
  `);
  console.log('  ✓ v_org_chart view');

  // Verification
  const { rows } = await client.query(`
    SELECT
      (SELECT COUNT(*) FROM departments) AS depts,
      (SELECT COUNT(*) FROM positions)   AS positions,
      (SELECT COUNT(*) FROM users WHERE is_active=TRUE) AS users,
      (SELECT COUNT(*) FROM staff_positions) AS staff_links
  `);
  const r = rows[0];
  console.log('\n============================================');
  console.log('✅ Org chart seeded!');
  console.log(`   departments: ${r.depts} | positions: ${r.positions}`);
  console.log(`   users: ${r.users} | staff links: ${r.staff_links}`);
  console.log('============================================');

  await client.end();
}

main().catch(e => { console.error('✗ Failed:', e.message); process.exit(1); });
EOF

echo ""
echo "Press any key to close..."
read -n 1
