#!/bin/bash
cd "$(dirname "$0")"

export DATABASE_URL="postgresql://neondb_owner:npg_yGDK7rPbU1St@ep-hidden-hat-a78c5hgh-pooler.ap-southeast-2.aws.neon.tech/yc_tms?sslmode=require&channel_binding=require"

echo "============================================"
echo " YC_TMS — Complete Setup (idempotent)"
echo "============================================"

node - <<'JSEOF'
const { Client } = require('pg');

async function main() {
  const db = new Client({ connectionString: process.env.DATABASE_URL });
  await db.connect();
  process.on('exit', () => db.end().catch(() => {}));

  async function run(label, sql) {
    try { await db.query(sql); console.log('  ✓ ' + label); }
    catch(e) {
      const msg = e.message.split('\n')[0];
      if (/already exists|does not exist.*ALTER/i.test(msg)) {
        console.log('  ⊘ ' + label + ' (already exists)');
      } else {
        console.log('  ✗ ' + label + ': ' + msg.slice(0,100));
      }
    }
  }

  // ── SET search_path ───────────────────────────────────────────
  await db.query('CREATE SCHEMA IF NOT EXISTS yc_tkt_mgmt');
  await db.query('SET search_path TO yc_tkt_mgmt, public');

  // ════════════════════════════════════════════════════════════
  // STEP 1 — AUTH TABLES
  // ════════════════════════════════════════════════════════════
  console.log('\n[1] Auth tables');

  await run('roles', `CREATE TABLE IF NOT EXISTS roles (
    id           SERIAL PRIMARY KEY,
    name         TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description  TEXT,
    rank         INT NOT NULL DEFAULT 99,
    is_system    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);

  await run('permissions', `CREATE TABLE IF NOT EXISTS permissions (
    id          SERIAL PRIMARY KEY,
    name        TEXT NOT NULL UNIQUE,
    module      TEXT NOT NULL,
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);

  await run('users', `CREATE TABLE IF NOT EXISTS users (
    id                  SERIAL PRIMARY KEY,
    email               TEXT NOT NULL UNIQUE,
    name                TEXT NOT NULL,
    role_id             INT REFERENCES roles(id) ON DELETE SET NULL,
    role                TEXT,
    department          TEXT,
    designation         TEXT,
    avatar_initials     TEXT,
    profile_photo_url   TEXT,
    auth_provider       TEXT DEFAULT 'microsoft',
    microsoft_id        TEXT,
    azure_oid           TEXT,
    active              BOOLEAN NOT NULL DEFAULT TRUE,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    bootstrap_admin     BOOLEAN NOT NULL DEFAULT FALSE,
    is_bootstrap_admin  BOOLEAN NOT NULL DEFAULT FALSE,
    assignable          BOOLEAN NOT NULL DEFAULT FALSE,
    system_created      BOOLEAN NOT NULL DEFAULT FALSE,
    position_id         INT,
    department_id       INT,
    manager_id          INT,
    employment_type     TEXT,
    phone               TEXT,
    address             TEXT,
    start_date          DATE,
    profile_notes       TEXT,
    last_login_at       TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);

  await run('role_permissions', `CREATE TABLE IF NOT EXISTS role_permissions (
    role_id       INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
  )`);

  await run('sessions', `CREATE TABLE IF NOT EXISTS sessions (
    id           TEXT PRIMARY KEY,
    user_id      INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at   TIMESTAMPTZ NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address   TEXT,
    user_agent   TEXT
  )`);

  await run('audit_logs', `CREATE TABLE IF NOT EXISTS audit_logs (
    id          BIGSERIAL PRIMARY KEY,
    user_id     INT REFERENCES users(id) ON DELETE SET NULL,
    action      TEXT NOT NULL,
    entity_type TEXT,
    entity_id   INT,
    metadata    JSONB DEFAULT '{}'::jsonb,
    ip_address  TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);

  await run('failed_logins', `CREATE TABLE IF NOT EXISTS failed_logins (
    id         BIGSERIAL PRIMARY KEY,
    email      TEXT,
    ip_address TEXT,
    reason     TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);

  // ════════════════════════════════════════════════════════════
  // STEP 2 — ORG TABLES
  // ════════════════════════════════════════════════════════════
  console.log('\n[2] Org tables');

  await run('departments', `CREATE TABLE IF NOT EXISTS departments (
    id             SERIAL PRIMARY KEY,
    name           TEXT NOT NULL UNIQUE,
    parent_dept_id INT REFERENCES departments(id) ON DELETE SET NULL,
    sort_order     INT NOT NULL DEFAULT 0,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);

  await run('positions', `CREATE TABLE IF NOT EXISTS positions (
    id                 SERIAL PRIMARY KEY,
    title              TEXT NOT NULL,
    department_id      INT REFERENCES departments(id) ON DELETE SET NULL,
    parent_position_id INT REFERENCES positions(id) ON DELETE SET NULL,
    is_active          BOOLEAN NOT NULL DEFAULT TRUE,
    is_vacant          BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order         INT NOT NULL DEFAULT 0,
    position_type      TEXT,
    dept_label         TEXT,
    assignable         BOOLEAN NOT NULL DEFAULT TRUE,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);

  await run('staff_positions', `CREATE TABLE IF NOT EXISTS staff_positions (
    id          SERIAL PRIMARY KEY,
    user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    position_id INT NOT NULL,
    is_primary  BOOLEAN NOT NULL DEFAULT FALSE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT staff_positions_user_position_uniq UNIQUE (user_id, position_id)
  )`);

  // FK columns on users (may already exist)
  await run('users.department_id FK', `ALTER TABLE users ADD COLUMN IF NOT EXISTS department_id INT REFERENCES departments(id) ON DELETE SET NULL`);
  await run('users.position_id FK',   `ALTER TABLE users ADD COLUMN IF NOT EXISTS position_id   INT REFERENCES positions(id)   ON DELETE SET NULL`);
  await run('users.manager_id FK',    `ALTER TABLE users ADD COLUMN IF NOT EXISTS manager_id    INT REFERENCES users(id)        ON DELETE SET NULL`);

  // ════════════════════════════════════════════════════════════
  // STEP 3 — TICKET TABLES
  // ════════════════════════════════════════════════════════════
  console.log('\n[3] Ticket lookup tables');

  await run('categories', `CREATE TABLE IF NOT EXISTS categories (
    id         TEXT PRIMARY KEY,
    label      TEXT NOT NULL,
    icon       TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);

  await run('priorities', `CREATE TABLE IF NOT EXISTS priorities (
    id         TEXT PRIMARY KEY,
    label      TEXT NOT NULL,
    sla_hours  INT NOT NULL DEFAULT 24,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);

  await run('statuses', `CREATE TABLE IF NOT EXISTS statuses (
    id         TEXT PRIMARY KEY,
    label      TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_closed  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);

  console.log('\n[4] Ticket core tables');

  await run('tickets', `CREATE TABLE IF NOT EXISTS tickets (
    id                   SERIAL PRIMARY KEY,
    reference_number     TEXT UNIQUE,
    title                TEXT NOT NULL,
    description          TEXT,
    category_id          TEXT REFERENCES categories(id),
    priority_id          TEXT REFERENCES priorities(id),
    status_id            TEXT REFERENCES statuses(id),
    requester_id         INT REFERENCES users(id) ON DELETE SET NULL,
    assignee_id          INT REFERENCES users(id) ON DELETE SET NULL,
    department_id        INT REFERENCES departments(id) ON DELETE SET NULL,
    due_date             TIMESTAMPTZ,
    expected_completion  DATE,
    sla_due_at           TIMESTAMPTZ,
    first_response_at    TIMESTAMPTZ,
    resolved_at          TIMESTAMPTZ,
    closed_at            TIMESTAMPTZ,
    pending_approval_at  TIMESTAMPTZ,
    escalated_at         TIMESTAMPTZ,
    escalation_reason    TEXT,
    escalated_to         INT REFERENCES users(id) ON DELETE SET NULL,
    escalated_by         INT REFERENCES users(id) ON DELETE SET NULL,
    is_escalated         BOOLEAN DEFAULT FALSE,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);

  await run('comments', `CREATE TABLE IF NOT EXISTS comments (
    id          SERIAL PRIMARY KEY,
    ticket_id   INT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    author_id   INT REFERENCES users(id) ON DELETE SET NULL,
    body        TEXT NOT NULL,
    is_internal BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);

  await run('ticket_attachments', `CREATE TABLE IF NOT EXISTS ticket_attachments (
    id          SERIAL PRIMARY KEY,
    ticket_id   INT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    uploaded_by INT REFERENCES users(id) ON DELETE SET NULL,
    filename    TEXT NOT NULL,
    url         TEXT NOT NULL,
    size_bytes  BIGINT,
    mime_type   TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);

  await run('activity', `CREATE TABLE IF NOT EXISTS activity (
    id          BIGSERIAL PRIMARY KEY,
    ticket_id   INT REFERENCES tickets(id) ON DELETE CASCADE,
    actor_id    INT REFERENCES users(id) ON DELETE SET NULL,
    action      TEXT NOT NULL,
    metadata    JSONB DEFAULT '{}'::jsonb,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);

  await run('notifications', `CREATE TABLE IF NOT EXISTS notifications (
    id          BIGSERIAL PRIMARY KEY,
    user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type        TEXT NOT NULL,
    title       TEXT,
    body        TEXT,
    link        TEXT,
    is_read     BOOLEAN NOT NULL DEFAULT FALSE,
    payload     JSONB DEFAULT '{}'::jsonb,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);

  await run('schedules', `CREATE TABLE IF NOT EXISTS schedules (
    id          SERIAL PRIMARY KEY,
    name        TEXT NOT NULL,
    cron        TEXT,
    last_run_at TIMESTAMPTZ,
    next_run_at TIMESTAMPTZ,
    enabled     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);

  console.log('\n[5] Ticket workflow tables');

  await run('ticket_approvers', `CREATE TABLE IF NOT EXISTS ticket_approvers (
    id               SERIAL PRIMARY KEY,
    ticket_id        INT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    approver_user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status           TEXT NOT NULL DEFAULT 'pending',
    decided_at       TIMESTAMPTZ,
    comments         TEXT,
    created_at       TIMESTAMPTZ DEFAULT NOW()
  )`);

  await run('ticket_approval_history', `CREATE TABLE IF NOT EXISTS ticket_approval_history (
    id               SERIAL PRIMARY KEY,
    ticket_id        INT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    approver_user_id INT REFERENCES users(id) ON DELETE SET NULL,
    action           TEXT NOT NULL,
    comments         TEXT,
    created_at       TIMESTAMPTZ DEFAULT NOW()
  )`);

  await run('ticket_escalations', `CREATE TABLE IF NOT EXISTS ticket_escalations (
    id                SERIAL PRIMARY KEY,
    ticket_id         INT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    escalated_by      INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    escalated_to      INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason            TEXT NOT NULL,
    previous_assignee INT REFERENCES users(id) ON DELETE SET NULL,
    created_at        TIMESTAMPTZ DEFAULT NOW()
  )`);

  await run('ticket_reopen_requests', `CREATE TABLE IF NOT EXISTS ticket_reopen_requests (
    id           SERIAL PRIMARY KEY,
    ticket_id    INT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    requested_by INT REFERENCES users(id) ON DELETE SET NULL,
    reason       TEXT,
    status       TEXT DEFAULT 'pending',
    created_at   TIMESTAMPTZ DEFAULT NOW()
  )`);

  await run('ticket_audit_log', `CREATE TABLE IF NOT EXISTS ticket_audit_log (
    id          BIGSERIAL PRIMARY KEY,
    ticket_id   INT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    user_id     INT REFERENCES users(id) ON DELETE SET NULL,
    action      TEXT NOT NULL,
    metadata    JSONB DEFAULT '{}'::jsonb,
    created_at  TIMESTAMPTZ DEFAULT NOW()
  )`);

  console.log('\n[6] Supporting tables');

  await run('push_subscriptions', `CREATE TABLE IF NOT EXISTS push_subscriptions (
    id           SERIAL PRIMARY KEY,
    user_id      INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription JSONB NOT NULL,
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
  )`);

  await run('notification_queue', `CREATE TABLE IF NOT EXISTS notification_queue (
    id         BIGSERIAL PRIMARY KEY,
    user_id    INT REFERENCES users(id) ON DELETE SET NULL,
    type       TEXT NOT NULL,
    payload    JSONB DEFAULT '{}'::jsonb,
    status     TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`);

  await run('email_logs', `CREATE TABLE IF NOT EXISTS email_logs (
    id         BIGSERIAL PRIMARY KEY,
    to_email   TEXT NOT NULL,
    subject    TEXT,
    template   TEXT,
    status     TEXT DEFAULT 'sent',
    error      TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`);

  await run('email_queue', `CREATE TABLE IF NOT EXISTS email_queue (
    id         BIGSERIAL PRIMARY KEY,
    to_email   TEXT NOT NULL,
    subject    TEXT,
    body       TEXT,
    status     TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`);

  await run('scheduled_reports', `CREATE TABLE IF NOT EXISTS scheduled_reports (
    id             SERIAL PRIMARY KEY,
    name           TEXT NOT NULL,
    description    TEXT,
    frequency      TEXT NOT NULL CHECK (frequency IN ('daily','weekly','monthly')),
    day_of_week    TEXT,
    day_of_month   INT,
    time           TEXT NOT NULL,
    report_types   TEXT[] NOT NULL DEFAULT '{}',
    recipient_ids  INT[] NOT NULL DEFAULT '{}',
    active         BOOLEAN NOT NULL DEFAULT TRUE,
    sent_count     INT NOT NULL DEFAULT 0,
    last_sent_at   TIMESTAMPTZ,
    created_by     INT REFERENCES users(id) ON DELETE SET NULL,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);

  await run('activity_log_archives', `CREATE TABLE IF NOT EXISTS activity_log_archives (
    id          BIGSERIAL PRIMARY KEY,
    original_id BIGINT,
    ticket_id   INT,
    user_id     INT,
    action      TEXT,
    metadata    JSONB,
    created_at  TIMESTAMPTZ
  )`);

  await run('user_roles', `CREATE TABLE IF NOT EXISTS user_roles (
    user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id     INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id)
  )`);

  // ════════════════════════════════════════════════════════════
  // STEP 4 — SEED ROLES + PERMISSIONS
  // ════════════════════════════════════════════════════════════
  console.log('\n[7] Seed roles');
  await db.query(`
    INSERT INTO roles (name, display_name, description, rank, is_system) VALUES
      ('super_admin', 'Super Admin', 'Full system access',                      1, TRUE),
      ('admin',       'Admin',       'Administrative access',                    2, TRUE),
      ('hr',          'HR',          'Human Resources access',                   3, TRUE),
      ('manager',     'Manager',     'Team management access',                   4, TRUE),
      ('user',        'User',        'Standard user — can raise their own tickets', 5, TRUE)
    ON CONFLICT (name) DO UPDATE SET display_name = EXCLUDED.display_name, rank = EXCLUDED.rank
  `);
  console.log('  ✓ 5 roles');

  console.log('\n[8] Seed permissions');
  await db.query(`
    INSERT INTO permissions (name, module, description) VALUES
      ('user.read',           'users',       'View user list and profiles'),
      ('user.create',         'users',       'Create new user accounts'),
      ('user.update',         'users',       'Update user details'),
      ('user.delete',         'users',       'Delete user accounts'),
      ('user.activate',       'users',       'Activate/deactivate users'),
      ('role.read',           'roles',       'View roles and permissions'),
      ('role.assign',         'roles',       'Assign roles to users'),
      ('role.manage',         'roles',       'Create/modify role definitions'),
      ('permission.manage',   'permissions', 'Grant/revoke permissions on roles'),
      ('settings.read',       'settings',    'View HRMS settings'),
      ('settings.update',     'settings',    'Modify HRMS settings'),
      ('authsettings.manage', 'settings',    'Manage authentication settings'),
      ('audit.read',          'audit',       'View audit logs'),
      ('audit.export',        'audit',       'Export audit logs'),
      ('ticket.read.own',     'tickets',     'View own tickets'),
      ('ticket.read.team',    'tickets',     'View team tickets'),
      ('ticket.read.all',     'tickets',     'View all tickets'),
      ('ticket.create',       'tickets',     'Create tickets'),
      ('ticket.update',       'tickets',     'Update tickets'),
      ('ticket.delete',       'tickets',     'Delete tickets'),
      ('ticket.assign',       'tickets',     'Assign tickets'),
      ('employee.read',       'employees',   'Read employee profiles'),
      ('employee.update',     'employees',   'Update employee profiles'),
      ('report.read',         'reports',     'View dashboards and reports'),
      ('report.schedule',     'reports',     'Schedule recurring reports')
    ON CONFLICT (name) DO NOTHING
  `);
  console.log('  ✓ 25 permissions');

  console.log('\n[9] Wire role_permissions');
  // super_admin — everything
  await db.query(`INSERT INTO role_permissions (role_id, permission_id) SELECT r.id, p.id FROM roles r, permissions p WHERE r.name='super_admin' ON CONFLICT DO NOTHING`);
  // admin
  await db.query(`INSERT INTO role_permissions (role_id, permission_id) SELECT r.id, p.id FROM roles r JOIN permissions p ON p.name IN ('user.read','user.create','user.update','user.activate','role.read','role.assign','settings.read','settings.update','audit.read','audit.export','ticket.read.all','ticket.create','ticket.update','ticket.assign','ticket.delete','employee.read','employee.update','report.read','report.schedule') WHERE r.name='admin' ON CONFLICT DO NOTHING`);
  // hr
  await db.query(`INSERT INTO role_permissions (role_id, permission_id) SELECT r.id, p.id FROM roles r JOIN permissions p ON p.name IN ('user.read','user.update','user.activate','employee.read','employee.update','ticket.read.all','ticket.create','ticket.update','ticket.assign','report.read','audit.read') WHERE r.name='hr' ON CONFLICT DO NOTHING`);
  // manager
  await db.query(`INSERT INTO role_permissions (role_id, permission_id) SELECT r.id, p.id FROM roles r JOIN permissions p ON p.name IN ('user.read','employee.read','ticket.read.team','ticket.create','ticket.update','ticket.assign','report.read') WHERE r.name='manager' ON CONFLICT DO NOTHING`);
  // user
  await db.query(`INSERT INTO role_permissions (role_id, permission_id) SELECT r.id, p.id FROM roles r JOIN permissions p ON p.name IN ('ticket.read.own','ticket.create') WHERE r.name='user' ON CONFLICT DO NOTHING`);
  console.log('  ✓ role_permissions wired');

  // ════════════════════════════════════════════════════════════
  // STEP 5 — SEED LOOKUP DATA
  // ════════════════════════════════════════════════════════════
  console.log('\n[10] Seed categories');
  await db.query(`
    INSERT INTO categories (id, label, icon, sort_order) VALUES
      ('it',         'IT Support',               '💻', 1),
      ('hr',         'HR & Payroll',             '👥', 2),
      ('facilities', 'Facilities & Maintenance', '🔧', 3),
      ('care',       'Care Coordination',        '🤝', 4),
      ('clinical',   'Clinical / Compliance',    '🩺', 5),
      ('finance',    'Finance',                  '💰', 6),
      ('general',    'General Enquiry',          '💬', 7)
    ON CONFLICT (id) DO UPDATE SET label=EXCLUDED.label, icon=EXCLUDED.icon, sort_order=EXCLUDED.sort_order
  `);
  console.log('  ✓ 7 categories');

  console.log('\n[11] Seed priorities');
  await db.query(`
    INSERT INTO priorities (id, label, sla_hours, sort_order) VALUES
      ('critical', 'Critical', 2,  1),
      ('high',     'High',     8,  2),
      ('medium',   'Medium',   24, 3),
      ('low',      'Low',      72, 4)
    ON CONFLICT (id) DO UPDATE SET label=EXCLUDED.label, sla_hours=EXCLUDED.sla_hours, sort_order=EXCLUDED.sort_order
  `);
  console.log('  ✓ 4 priorities');

  console.log('\n[12] Seed statuses');
  await db.query(`
    INSERT INTO statuses (id, label, sort_order, is_closed) VALUES
      ('new',              'New',                  1, FALSE),
      ('assigned',         'Assigned',             2, FALSE),
      ('in_progress',      'In Progress',          3, FALSE),
      ('waiting',          'Waiting on Requester', 4, FALSE),
      ('pending_approval', 'Pending Approval',     5, FALSE),
      ('escalated',        'Escalated',            6, FALSE),
      ('resolved',         'Resolved',             7, TRUE),
      ('closed',           'Closed',               8, TRUE)
    ON CONFLICT (id) DO UPDATE SET label=EXCLUDED.label, is_closed=EXCLUDED.is_closed, sort_order=EXCLUDED.sort_order
  `);
  console.log('  ✓ 8 statuses');

  // ════════════════════════════════════════════════════════════
  // STEP 6 — SEED USERS
  // ════════════════════════════════════════════════════════════
  console.log('\n[13] Seed users');

  const users = [
    // [email, name, role, dept, designation, initials, isBootstrap, assignable]
    ['ron@wmxsolutions.com.au',    'Ron Costa',            'super_admin', null,                                      'Bootstrap Super Admin',                        'RC', true,  true],
    ['alex@yahwehpc.com.au',       'Alex Yogarajah',       'super_admin', 'Director Level',                          'Director / Client Relationship Manager',        'AY', true,  true],
    ['it@yahwehcare.com.au',       'Ron Costa (IT)',        'super_admin', null,                                      'Bootstrap Super Admin',                        'RC', true,  true],
    ['suganty@yahwehpc.com.au',    'Suganty P',            'manager',     'Operations',                              'Operations Manager',                           'SP', false, true],
    ['sunny@yahwehcare.com.au',    'Sunita Maharjan',      'manager',     'Operations',                              'Service Delivery Manager',                     'SM', false, true],
    ['elenor@yahwehcare.com.au',   'Elenor Elia',          'user',        'Operations',                              'Roster Coordinator',                           'EE', false, true],
    ['saloni@yahwehcare.com.au',   'Saloni',               'manager',     'Operations',                              'Support Coordination Lead',                    'SA', false, true],
    ['james@yahwehcare.com.au',    'James Baskaran',       'user',        'Operations',                              'Support Coordination Staff',                   'JB', false, true],
    ['miejkyla@yahwehcare.com.au', 'Miejkyla',             'hr',          'Operations',                              'HR / Admin Officer',                           'MI', false, true],
    ['venujah@yahwehcare.com.au',  'Venujah Arudselvam',  'user',        'Operations',                              'Day Centre Officer',                           'VA', false, true],
    ['akila@yahwehcare.com.au',    'Akila Nanayakkara',    'manager',     'Finance',                                 'Finance Manager / Plan Manager',               'AN', false, true],
    ['info@yahwehcare.com.au',     'Yahweh Care',          'user',        'Operations',                              'External Consultant (HR)',                     'YC', false, true],
    ['qms@yahwehpc.com.au',        'Yahweh QMS',           'user',        'Strategic Development & Client Relations', 'Business Development Officer',                 'YQ', false, true],
  ];

  for (const [email, name, role, dept, designation, initials, isBootstrap, assignable] of users) {
    await db.query(`
      INSERT INTO users (email, name, role_id, role, department, designation, avatar_initials,
                         auth_provider, active, is_active, bootstrap_admin, is_bootstrap_admin,
                         system_created, assignable)
      SELECT $1,$2,r.id,$3,$4,$5,$6,'microsoft',TRUE,TRUE,$7,$7,FALSE,$8
      FROM roles r WHERE r.name=$3
      ON CONFLICT (email) DO UPDATE SET
        name               = EXCLUDED.name,
        role_id            = EXCLUDED.role_id,
        role               = EXCLUDED.role,
        designation        = EXCLUDED.designation,
        avatar_initials    = EXCLUDED.avatar_initials,
        is_active          = TRUE, active = TRUE,
        is_bootstrap_admin = EXCLUDED.is_bootstrap_admin,
        bootstrap_admin    = EXCLUDED.bootstrap_admin,
        assignable         = EXCLUDED.assignable,
        updated_at         = NOW()
    `, [email, name, role, dept, designation, initials, isBootstrap, assignable]);
    console.log(`  ✓ ${email}`);
  }

  // Sync role_id for all users
  await db.query(`UPDATE users u SET role_id = r.id FROM roles r WHERE r.name = u.role AND (u.role_id IS NULL OR u.role_id != r.id)`);

  // ════════════════════════════════════════════════════════════
  // STEP 7 — SEED ORG HIERARCHY
  // ════════════════════════════════════════════════════════════
  console.log('\n[14] Seed departments');
  await db.query(`
    INSERT INTO departments (name, sort_order) VALUES
      ('Director Level',                           0),
      ('Operations',                               1),
      ('Finance',                                  2),
      ('Strategic Development & Client Relations', 3)
    ON CONFLICT (name) DO UPDATE SET sort_order = EXCLUDED.sort_order
  `);
  console.log('  ✓ 4 departments');

  console.log('\n[15] Seed positions');
  // Clear & re-seed positions for a clean hierarchy
  await db.query(`UPDATE users SET position_id = NULL`);
  await db.query(`DELETE FROM staff_positions`);
  await db.query(`DELETE FROM positions`);

  const positions = [
    // [title, dept, parent_title, is_active, is_vacant, sort, type, dept_label]
    ['Director',                                             'Director Level',                          null,                                                      true,  false, 0, 'director',   'Director Level'],
    ['Operations Manager',                                  'Operations',                              'Director',                                                true,  false, 1, 'manager',    'Operations Department'],
    ['Finance Manager',                                     'Finance',                                 'Director',                                                true,  false, 2, 'manager',    'Finance Department'],
    ['Strategic Development / Client Relationship Manager', 'Strategic Development & Client Relations','Director',                                                true,  false, 3, 'manager',    'Strategic Dev & Client Relationship'],
    ['Service Delivery Manager',                            'Operations',                              'Operations Manager',                                      true,  false, 1, 'manager',    'Operations Department'],
    ['Support Coordination Lead',                           'Operations',                              'Operations Manager',                                      true,  false, 2, 'manager',    'Operations Department'],
    ['HR / Admin Officer',                                  'Operations',                              'Operations Manager',                                      true,  false, 3, 'hr',         'Operations Department'],
    ['Day Centre Officer',                                  'Operations',                              'Operations Manager',                                      true,  false, 4, 'staff',      'Operations Department'],
    ['Roster Coordinator',                                  'Operations',                              'Service Delivery Manager',                                true,  false, 1, 'staff',      'Operations Department'],
    ['Support Coordination Staff',                          'Operations',                              'Support Coordination Lead',                               true,  false, 1, 'staff',      'Operations Department'],
    ['Plan Manager',                                        'Finance',                                 'Finance Manager',                                         true,  false, 1, 'staff',      'Finance Department'],
    ['Business Development Officer',                        'Strategic Development & Client Relations','Strategic Development / Client Relationship Manager',     true,  false, 1, 'staff',      'Strategic Dev & Client Relationship'],
    ['External Consultant (HR)',                            'Operations',                              'HR / Admin Officer',                                      true,  false, 1, 'consultant', 'Operations Department'],
    ['Client Relationship Officer',                         'Strategic Development & Client Relations','Strategic Development / Client Relationship Manager',     false, true,  2, 'staff',      'Strategic Dev & Client Relationship'],
    ['External Consultant (Finance)',                       'Finance',                                 'Finance Manager',                                         false, true,  2, 'consultant', 'Finance Department'],
    ['External Marketing Consultant',                       'Strategic Development & Client Relations','Business Development Officer',                            false, true,  1, 'consultant', 'Strategic Dev & Client Relationship'],
    ['Support Workers',                                     'Operations',                              'Roster Coordinator',                                      false, true,  1, 'staff',      'Operations Department'],
    ['Staff (Day Centre)',                                  'Operations',                              'Day Centre Officer',                                      false, true,  1, 'staff',      'Operations Department'],
  ];

  for (const [title, dept, parent, isActive, isVacant, sort, type, deptLabel] of positions) {
    await db.query(`
      INSERT INTO positions (title, department_id, parent_position_id, is_active, is_vacant, sort_order, position_type, dept_label)
      SELECT $1,
        (SELECT id FROM departments WHERE name=$2),
        (SELECT id FROM positions  WHERE title=$3 LIMIT 1),
        $4,$5,$6,$7,$8
    `, [title, dept, parent, isActive, isVacant, sort, type, deptLabel]);
  }
  console.log(`  ✓ ${positions.length} positions`);

  console.log('\n[16] Assign users to positions');
  const assignments = [
    // [email, position_title, dept_name, manager_email]
    ['alex@yahwehpc.com.au',       'Director',                                             'Director Level',                          null],
    ['suganty@yahwehpc.com.au',    'Operations Manager',                                   'Operations',                              'alex@yahwehpc.com.au'],
    ['sunny@yahwehcare.com.au',    'Service Delivery Manager',                             'Operations',                              'suganty@yahwehpc.com.au'],
    ['elenor@yahwehcare.com.au',   'Roster Coordinator',                                   'Operations',                              'sunny@yahwehcare.com.au'],
    ['saloni@yahwehcare.com.au',   'Support Coordination Lead',                            'Operations',                              'suganty@yahwehpc.com.au'],
    ['james@yahwehcare.com.au',    'Support Coordination Staff',                           'Operations',                              'saloni@yahwehcare.com.au'],
    ['miejkyla@yahwehcare.com.au', 'HR / Admin Officer',                                   'Operations',                              'suganty@yahwehpc.com.au'],
    ['venujah@yahwehcare.com.au',  'Day Centre Officer',                                   'Operations',                              'suganty@yahwehpc.com.au'],
    ['akila@yahwehcare.com.au',    'Finance Manager',                                      'Finance',                                 'alex@yahwehpc.com.au'],
    ['info@yahwehcare.com.au',     'External Consultant (HR)',                             'Operations',                              'miejkyla@yahwehcare.com.au'],
    ['qms@yahwehpc.com.au',        'Business Development Officer',                         'Strategic Development & Client Relations', 'alex@yahwehpc.com.au'],
  ];

  for (const [email, pos, dept, mgr] of assignments) {
    await db.query(`
      UPDATE users SET
        position_id   = (SELECT id FROM positions   WHERE title=$2 LIMIT 1),
        department_id = (SELECT id FROM departments WHERE name=$3),
        department    = $3,
        manager_id    = CASE WHEN $4::text IS NOT NULL THEN (SELECT id FROM users WHERE email=$4) ELSE NULL END,
        updated_at    = NOW()
      WHERE email=$1
    `, [email, pos, dept, mgr]);
    await db.query(`
      INSERT INTO staff_positions (user_id, position_id, is_primary)
      SELECT u.id, p.id, TRUE
      FROM users u, positions p
      WHERE u.email=$1 AND p.title=$2
      ON CONFLICT (user_id, position_id) DO NOTHING
    `, [email, pos]);
    console.log(`  ✓ ${email} → ${pos}`);
  }

  // Recompute is_vacant
  await db.query(`
    UPDATE positions p SET is_vacant = NOT EXISTS (
      SELECT 1 FROM staff_positions sp
      JOIN users u ON u.id = sp.user_id AND u.is_active = TRUE
      WHERE sp.position_id = p.id
    )
  `);

  // ════════════════════════════════════════════════════════════
  // STEP 8 — INDEXES
  // ════════════════════════════════════════════════════════════
  console.log('\n[17] Indexes');
  const indexes = [
    ['idx_users_email',           `CREATE INDEX IF NOT EXISTS idx_users_email           ON users(email)`],
    ['idx_users_azure_oid',       `CREATE UNIQUE INDEX IF NOT EXISTS idx_users_azure_oid ON users(azure_oid) WHERE azure_oid IS NOT NULL`],
    ['idx_users_is_active',       `CREATE INDEX IF NOT EXISTS idx_users_is_active       ON users(is_active)`],
    ['idx_users_position_id',     `CREATE INDEX IF NOT EXISTS idx_users_position_id     ON users(position_id)`],
    ['idx_users_manager_id',      `CREATE INDEX IF NOT EXISTS idx_users_manager_id      ON users(manager_id)`],
    ['idx_users_dept_id',         `CREATE INDEX IF NOT EXISTS idx_users_dept_id         ON users(department_id)`],
    ['idx_positions_dept',        `CREATE INDEX IF NOT EXISTS idx_positions_dept        ON positions(department_id)`],
    ['idx_positions_parent',      `CREATE INDEX IF NOT EXISTS idx_positions_parent      ON positions(parent_position_id)`],
    ['idx_tickets_requester',     `CREATE INDEX IF NOT EXISTS idx_tickets_requester     ON tickets(requester_id)`],
    ['idx_tickets_assignee',      `CREATE INDEX IF NOT EXISTS idx_tickets_assignee      ON tickets(assignee_id)`],
    ['idx_tickets_status',        `CREATE INDEX IF NOT EXISTS idx_tickets_status        ON tickets(status_id)`],
    ['idx_tickets_category',      `CREATE INDEX IF NOT EXISTS idx_tickets_category      ON tickets(category_id)`],
    ['idx_comments_ticket',       `CREATE INDEX IF NOT EXISTS idx_comments_ticket       ON comments(ticket_id)`],
    ['idx_activity_ticket',       `CREATE INDEX IF NOT EXISTS idx_activity_ticket       ON activity(ticket_id)`],
    ['idx_notifications_user',    `CREATE INDEX IF NOT EXISTS idx_notifications_user    ON notifications(user_id)`],
    ['idx_approvers_ticket',      `CREATE INDEX IF NOT EXISTS idx_approvers_ticket      ON ticket_approvers(ticket_id)`],
    ['idx_escalations_ticket',    `CREATE INDEX IF NOT EXISTS idx_escalations_ticket    ON ticket_escalations(ticket_id)`],
    ['idx_audit_logs_user',       `CREATE INDEX IF NOT EXISTS idx_audit_logs_user       ON audit_logs(user_id)`],
  ];
  for (const [name, sql] of indexes) await run(name, sql);

  // ════════════════════════════════════════════════════════════
  // STEP 9 — v_org_chart VIEW
  // ════════════════════════════════════════════════════════════
  console.log('\n[18] v_org_chart view');
  await db.query(`DROP VIEW IF EXISTS v_org_chart`);
  await db.query(`
    CREATE VIEW v_org_chart AS
    SELECT
      u.id, u.name, u.email, u.is_active AS active,
      u.department, u.designation, u.profile_photo_url, u.avatar_initials, u.role,
      COALESCE(u.is_bootstrap_admin, FALSE) AS is_bootstrap_admin,
      p.id AS position_id, p.title AS position_title,
      p.is_vacant, p.is_active AS position_is_active,
      p.parent_position_id, p.dept_label,
      d.id AS department_id, d.name AS department_name,
      m.id AS manager_id, m.name AS manager_name, m.email AS manager_email
    FROM positions p
    LEFT JOIN departments d  ON d.id = p.department_id
    LEFT JOIN staff_positions sp ON sp.position_id = p.id
    LEFT JOIN users u        ON u.id = sp.user_id AND u.is_active = TRUE
    LEFT JOIN users m        ON m.id = u.manager_id
  `);
  console.log('  ✓ v_org_chart');

  // ════════════════════════════════════════════════════════════
  // VERIFICATION
  // ════════════════════════════════════════════════════════════
  console.log('\n[19] Verification');
  const { rows: tables } = await db.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema='yc_tkt_mgmt' AND table_type='BASE TABLE'
    ORDER BY table_name
  `);

  const counts = {};
  for (const { table_name } of tables) {
    const { rows: [{ n }] } = await db.query(`SELECT count(*)::int AS n FROM yc_tkt_mgmt.${table_name}`);
    counts[table_name] = n;
  }

  console.log('\n============================================');
  console.log('✅ yc_tms fully set up!');
  console.log('');
  console.log('Tables & row counts:');
  for (const [t, n] of Object.entries(counts)) {
    console.log(`  ${t.padEnd(32)} ${n}`);
  }
  console.log('============================================');

  await db.end();
}

main().catch(e => { console.error('\n✗ FAILED:', e.message); process.exit(1); });
JSEOF

echo ""
echo "Press any key to close..."
read -n 1
