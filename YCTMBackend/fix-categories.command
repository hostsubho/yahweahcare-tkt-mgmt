#!/bin/bash
cd "$(dirname "$0")"
export DATABASE_URL="postgresql://neondb_owner:npg_yGDK7rPbU1St@ep-hidden-hat-a78c5hgh-pooler.ap-southeast-2.aws.neon.tech/yc_tms?sslmode=require&channel_binding=require"

echo "============================================"
echo " Fix categories to match the UI exactly"
echo "============================================"

node - <<'EOF'
const { Client } = require('pg');
const db = new Client({ connectionString: process.env.DATABASE_URL });

async function main() {
  await db.connect();
  await db.query('SET search_path TO yc_tkt_mgmt, public');

  // Show current categories
  const { rows: before } = await db.query('SELECT id, label FROM categories ORDER BY sort_order, id');
  console.log('\nBefore:', before.map(r => `${r.id}=${r.label}`).join(', '));

  // Delete all existing categories (tickets table is empty so no FK issues)
  await db.query('DELETE FROM categories');

  // Re-insert exactly the 7 categories matching the UI
  await db.query(`
    INSERT INTO categories (id, label, icon, sort_order) VALUES
      ('it',         'IT Support',               '💻', 1),
      ('hr',         'HR & Payroll',             '👥', 2),
      ('facilities', 'Facilities & Maintenance', '🔧', 3),
      ('care',       'Care Coordination',        '🤝', 4),
      ('clinical',   'Clinical / Compliance',    '🩺', 5),
      ('finance',    'Finance',                  '💰', 6),
      ('general',    'General Enquiry',          '💬', 7)
  `);

  const { rows: after } = await db.query('SELECT id, label, sort_order FROM categories ORDER BY sort_order');
  console.log('\n✅ Categories now:');
  after.forEach(r => console.log(`  ${r.sort_order}. [${r.id}] ${r.label}`));

  await db.end();
}

main().catch(e => { console.error('✗', e.message); process.exit(1); });
EOF

echo ""
echo "Press any key to close..."
read -n 1
