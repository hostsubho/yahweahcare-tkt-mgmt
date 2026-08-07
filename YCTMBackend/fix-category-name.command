#!/bin/bash
cd "$(dirname "$0")"
export DATABASE_URL="postgresql://neondb_owner:npg_yGDK7rPbU1St@ep-hidden-hat-a78c5hgh-pooler.ap-southeast-2.aws.neon.tech/yc_tms?sslmode=require&channel_binding=require"
node -e "
const { Client } = require('pg');
const db = new Client({ connectionString: process.env.DATABASE_URL });
db.connect().then(async () => {
  await db.query(\"SET search_path TO yc_tkt_mgmt, public\");
  const { rowCount } = await db.query(\"UPDATE categories SET label='Compliance' WHERE id='clinical'\");
  const { rows } = await db.query(\"SELECT id, label FROM categories WHERE id='clinical'\");
  console.log(rowCount ? '✅ Updated: ' + JSON.stringify(rows[0]) : '✗ Not found');
  await db.end();
}).catch(e => { console.error('✗', e.message); process.exit(1); });
"
echo ""; echo "Press any key to close..."; read -n 1
