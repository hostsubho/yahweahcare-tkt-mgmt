// Standalone schema runner — no env validation, just needs DATABASE_URL
// Usage: DATABASE_URL="..." node run-schema.js
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ Set DATABASE_URL env var');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });

async function main() {
  // Drop users table (schema.sql drops its dependents but not users itself)
  console.log('Dropping existing users table (full reset)...');
  await pool.query('DROP TABLE IF EXISTS yc_tkt_mgmt.users CASCADE');
  console.log('✓ users dropped');

  const schemaPath = path.join(__dirname, 'src/db/schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  const statements = sql
    .split(';')
    .map(s => s.split('\n').filter(l => !l.trim().startsWith('--')).join('\n').trim())
    .filter(s => s.length > 0);

  console.log(`Applying ${statements.length} statements to Neon...`);
  for (let i = 0; i < statements.length; i++) {
    try {
      await pool.query(statements[i]);
      console.log(`✓ ${i + 1}/${statements.length}`);
    } catch (e) {
      if (e.code === '42710' || e.code === '42P07' || e.message?.includes('already exists')) {
        console.log(`⊘ ${i + 1}/${statements.length} (already exists, skipped)`);
      } else {
        console.error(`✗ Statement ${i + 1} failed:`, e.message);
        console.error('  SQL:', statements[i].substring(0, 100));
        throw e;
      }
    }
  }

  const { rows } = await pool.query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'yc_tkt_mgmt' ORDER BY table_name`
  );
  console.log('\n✅ Done. Tables in yc_tkt_mgmt:');
  rows.forEach(r => console.log(`  - ${r.table_name}`));
  await pool.end();
}

main().catch(e => { console.error('✗ Failed:', e.message); process.exit(1); });
