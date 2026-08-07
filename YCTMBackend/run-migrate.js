// Migrates all yc_tkt_mgmt tables+data from SOURCE_DB → TARGET_DB
// Usage: node run-migrate.js
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const BASE = 'postgresql://neondb_owner:npg_yGDK7rPbU1St@ep-hidden-hat-a78c5hgh-pooler.ap-southeast-2.aws.neon.tech';
const OPTS = 'sslmode=require&channel_binding=require';
const SRC  = `${BASE}/neondb?${OPTS}`;
const DST  = `${BASE}/yc_tms?${OPTS}`;

const src = new Pool({ connectionString: SRC });
const dst = new Pool({ connectionString: DST });

// ── Step 1: Apply schema to target ──────────────────────────────────────────
async function applySchema() {
  const schemaPath = path.join(__dirname, 'src/db/schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');
  const statements = sql
    .split(';')
    .map(s => s.split('\n').filter(l => !l.trim().startsWith('--')).join('\n').trim())
    .filter(s => s.length > 0);

  console.log(`\n▶ Applying schema (${statements.length} statements) to yc_tms...`);
  // Drop users first to handle stale schemas
  await dst.query('DROP TABLE IF EXISTS yc_tkt_mgmt.users CASCADE').catch(() => {});

  for (let i = 0; i < statements.length; i++) {
    try {
      await dst.query(statements[i]);
    } catch (e) {
      if (e.code === '42710' || e.code === '42P07' || e.message?.includes('already exists')) {
        // skip
      } else {
        console.warn(`  ⚠ Statement ${i+1}: ${e.message.split('\n')[0]}`);
      }
    }
  }
  console.log('  ✓ Schema applied');
}

// ── Step 2: Copy table data ──────────────────────────────────────────────────
async function copyTable(tableName) {
  const { rows } = await src.query(`SELECT * FROM yc_tkt_mgmt.${tableName}`);
  if (rows.length === 0) {
    console.log(`  ⊘ ${tableName}: empty`);
    return;
  }

  const cols = Object.keys(rows[0]);
  const colList = cols.map(c => `"${c}"`).join(', ');

  // Build batch inserts (500 rows at a time)
  const BATCH = 500;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const values = [];
    const params = [];
    let pi = 1;

    for (const row of batch) {
      const rowParams = cols.map(() => `$${pi++}`);
      values.push(`(${rowParams.join(', ')})`);
      params.push(...cols.map(c => row[c]));
    }

    const sql = `INSERT INTO yc_tkt_mgmt.${tableName} (${colList}) VALUES ${values.join(', ')} ON CONFLICT DO NOTHING`;
    await dst.query(sql, params);
    inserted += batch.length;
  }
  console.log(`  ✓ ${tableName}: ${rows.length} rows`);
}

// ── Step 3: Reset sequences so new inserts don't collide ────────────────────
async function resetSequences() {
  const { rows } = await dst.query(`
    SELECT sequence_name
    FROM information_schema.sequences
    WHERE sequence_schema = 'yc_tkt_mgmt'
  `);

  for (const { sequence_name } of rows) {
    // Derive table name from sequence (e.g. users_id_seq → users, id)
    const match = sequence_name.match(/^(.+)_([^_]+)_seq$/);
    if (!match) continue;
    const [, table, col] = match;
    try {
      await dst.query(`
        SELECT setval(
          'yc_tkt_mgmt.${sequence_name}',
          COALESCE((SELECT MAX("${col}") FROM yc_tkt_mgmt.${table}), 1)
        )
      `);
    } catch (e) { /* ignore if table/col doesn't match */ }
  }
  console.log(`  ✓ ${rows.length} sequences reset`);
}

async function main() {
  // Apply schema first
  await applySchema();

  // Tables in FK-safe insertion order
  const tables = [
    'roles',
    'permissions',
    'departments',
    'positions',
    'categories',
    'priorities',
    'statuses',
    'users',
    'role_permissions',
    'user_roles',
    'user_positions',
    'staff_positions',
    'sessions',
    'audit_logs',
    'failed_logins',
    'tickets',
    'comments',
    'attachments',
    'activity',
    'activity_log_archives',
    'notifications',
    'notification_queue',
    'push_subscriptions',
    'email_queue',
    'email_logs',
    'scheduled_reports',
    'ticket_approvers',
    'ticket_approval_history',
    'ticket_audit_log',
    'ticket_escalations',
    'ticket_reopen_requests',
  ];

  console.log('\n▶ Copying data from neondb → yc_tms...');
  for (const table of tables) {
    try {
      await copyTable(table);
    } catch (e) {
      console.error(`  ✗ ${table}: ${e.message.split('\n')[0]}`);
    }
  }

  console.log('\n▶ Resetting sequences...');
  await resetSequences();

  // Final count
  const { rows: counts } = await dst.query(`
    SELECT table_name,
      (SELECT COUNT(*) FROM yc_tkt_mgmt.users)        AS users,
      (SELECT COUNT(*) FROM yc_tkt_mgmt.roles)        AS roles,
      (SELECT COUNT(*) FROM yc_tkt_mgmt.tickets)      AS tickets,
      (SELECT COUNT(*) FROM yc_tkt_mgmt.categories)   AS categories,
      (SELECT COUNT(*) FROM yc_tkt_mgmt.permissions)  AS permissions
    FROM information_schema.tables
    WHERE table_schema = 'yc_tkt_mgmt' AND table_name = 'users'
    LIMIT 1
  `);

  if (counts.length) {
    const r = counts[0];
    console.log('\n✅ Migration complete. Row counts in yc_tms:');
    console.log(`  users: ${r.users}, roles: ${r.roles}, tickets: ${r.tickets}, categories: ${r.categories}, permissions: ${r.permissions}`);
  }

  await src.end();
  await dst.end();
}

main().catch(e => { console.error('✗ Migration failed:', e.message); process.exit(1); });
