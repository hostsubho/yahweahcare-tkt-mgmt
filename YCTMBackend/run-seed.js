// Standalone seed runner — no env validation, just needs DATABASE_URL
// Seeds: roles, permissions, role_permissions, lookup tables (categories/priorities/statuses)
// Usage: DATABASE_URL="..." node run-seed.js
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error('❌ Set DATABASE_URL env var'); process.exit(1); }

const pool = new Pool({ connectionString: DATABASE_URL });

async function runSqlFile(filePath) {
  const label = path.basename(filePath);
  const sql = fs.readFileSync(filePath, 'utf8');
  const statements = sql
    .split(';')
    .map(s => s.split('\n').filter(l => !l.trim().startsWith('--')).join('\n').trim())
    .filter(s => s.length > 0);

  console.log(`\n▶ ${label} (${statements.length} statements)`);
  for (let i = 0; i < statements.length; i++) {
    try {
      const res = await pool.query(statements[i]);
      // Print any result row (e.g. "Done — ..." messages)
      if (res.rows?.length) console.log(' ', res.rows.map(r => Object.values(r).join(' | ')).join('\n  '));
      else console.log(`  ✓ ${i + 1}/${statements.length}`);
    } catch (e) {
      if (e.message?.includes('already exists') || e.code === '42710' || e.code === '42P07') {
        console.log(`  ⊘ ${i + 1}/${statements.length} (skipped)`);
      } else {
        console.error(`  ✗ Statement ${i + 1} failed:`, e.message);
        console.error('    SQL:', statements[i].substring(0, 120));
      }
    }
  }
}

async function main() {
  const dbDir = path.join(__dirname, 'src/db');
  await runSqlFile(path.join(dbDir, 'seed_permissions.sql'));
  await runSqlFile(path.join(dbDir, 'seed_lookup_tables.sql'));

  // Summary
  const { rows: tables } = await pool.query(
    `SELECT table_name,
       (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='yc_tkt_mgmt' AND table_name=t.table_name) AS cols
     FROM information_schema.tables t
     WHERE table_schema = 'yc_tkt_mgmt' AND table_type = 'BASE TABLE'
     ORDER BY table_name`
  );
  const { rows: counts } = await pool.query(`
    SELECT 'roles' AS tbl, COUNT(*)::text AS n FROM yc_tkt_mgmt.roles
    UNION ALL SELECT 'permissions', COUNT(*)::text FROM yc_tkt_mgmt.permissions
    UNION ALL SELECT 'role_permissions', COUNT(*)::text FROM yc_tkt_mgmt.role_permissions
    UNION ALL SELECT 'categories', COUNT(*)::text FROM yc_tkt_mgmt.categories
    UNION ALL SELECT 'priorities', COUNT(*)::text FROM yc_tkt_mgmt.priorities
    UNION ALL SELECT 'statuses', COUNT(*)::text FROM yc_tkt_mgmt.statuses
  `);

  console.log('\n✅ Seed complete. Row counts:');
  counts.forEach(r => console.log(`  ${r.tbl}: ${r.n}`));
  await pool.end();
}

main().catch(e => { console.error('✗ Failed:', e.message); process.exit(1); });
