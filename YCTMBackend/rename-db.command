#!/bin/bash
cd "$(dirname "$0")"

# Connect to neondb (NOT yahweahcare_tkt_mgmt — you can't rename a DB you're connected to)
export ADMIN_URL="postgresql://neondb_owner:npg_yGDK7rPbU1St@ep-hidden-hat-a78c5hgh-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

echo "============================================"
echo " Rename database: yahweahcare_tkt_mgmt → yc_tms"
echo "============================================"
echo ""

node - <<'EOF'
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.ADMIN_URL });

async function main() {
  await client.connect();

  // Check current databases
  const { rows: dbs } = await client.query(`SELECT datname FROM pg_database WHERE datname IN ('yahweahcare_tkt_mgmt','yc_tms')`);
  console.log('Current matching databases:', dbs.map(r => r.datname).join(', ') || '(none)');

  const existing = dbs.find(r => r.datname === 'yahweahcare_tkt_mgmt');
  const alreadyRenamed = dbs.find(r => r.datname === 'yc_tms');

  if (alreadyRenamed) {
    console.log('\n⊘ yc_tms already exists — nothing to do.');
    await client.end();
    return;
  }

  if (!existing) {
    console.error('\n✗ Database yahweahcare_tkt_mgmt not found!');
    await client.end();
    process.exit(1);
  }

  console.log('\nTerminating active connections to yahweahcare_tkt_mgmt...');
  const { rows: killed } = await client.query(`
    SELECT pg_terminate_backend(pid)
    FROM pg_stat_activity
    WHERE datname = 'yahweahcare_tkt_mgmt' AND pid <> pg_backend_pid()
  `);
  console.log(`  Terminated ${killed.length} connection(s)`);

  // Small pause to let connections close
  await new Promise(r => setTimeout(r, 1000));

  console.log('Renaming...');
  await client.query(`ALTER DATABASE yahweahcare_tkt_mgmt RENAME TO yc_tms`);

  // Verify
  const { rows: check } = await client.query(`SELECT datname FROM pg_database WHERE datname = 'yc_tms'`);
  if (check.length) {
    console.log('✅ Database renamed to yc_tms successfully!');
    console.log('\nNext: Vercel DATABASE_URL has already been updated automatically.');
    console.log('New connection string:');
    console.log('  postgresql://neondb_owner:***@ep-hidden-hat-a78c5hgh-pooler.ap-southeast-2.aws.neon.tech/yc_tms?sslmode=require&channel_binding=require');
  } else {
    console.error('✗ Rename failed — yc_tms not found after ALTER DATABASE');
  }

  await client.end();
}

main().catch(e => { console.error('✗ Error:', e.message); process.exit(1); });
EOF

echo ""
echo "Press any key to close..."
read -n 1
