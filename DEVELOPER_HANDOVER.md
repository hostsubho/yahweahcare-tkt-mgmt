# Yahweh Care — Ticket Management System: Developer Handover

This document is the single source of truth for anyone picking up this project.
It covers architecture, how deploys actually work, environment/config, known
data model quirks, past bugs and fixes, and open issues.

**Keep this file up to date.** Every time you ship a meaningful change (a
feature, a fix, a schema change, an infra change), add an entry to the
[Version History](#version-history) section at the bottom — don't just rely on
git commit messages. Bump the version number (Version 1, Version 2, Version
3, ...) and summarize what changed, why, and anything the next person needs
to know. Treat this file as living documentation, not a one-time snapshot.

---

## 1. What this app is

A ticket management system for Yahweh Property Care (an NDIS/disability
support provider). Staff raise tickets (IT support, HR, facilities, finance,
clinical/compliance, general enquiries), tickets get assigned, worked, marked
complete, routed to approvers, and closed. There's also staff/org-chart
management, SLA/analytics dashboards, scheduled reports, and email/push
notifications.

## 2. High-level architecture

Two independent halves, deployed as **two separate Vercel projects** from the
**same GitHub repo**:

| Piece | What it is | Where it lives | Deployed URL |
|---|---|---|---|
| Frontend | Single-file React app (no build framework — Babel + Terser compile it directly) | `YCTMFrontend/` | `https://yahweahcare-tkt-mgmt.vercel.app` |
| Backend | Express + TypeScript API, runs as Vercel serverless functions | `YCTMBackend/` | `https://yahweahcare-tkt-mgmt-hx48.vercel.app` |
| Database | Neon (serverless Postgres) | schema `yc_tkt_mgmt` | project "neon-byzantium-park" |

GitHub repo: `https://github.com/hostsubho/yahweahcare-tkt-mgmt.git`, branch
`main`. Both Vercel projects are wired to auto-deploy on every push to `main`
via their Git integration — **there is no separate deploy step**, `git push`
is the deploy.

There is also a legacy `api/` folder (an older Express backend) that used to
run on Azure App Service (`yahweahcare-tkt-mmt-prod.azurewebsites.net`). **It
is dead code.** The frontend's API base URL is hardcoded to the
`yahweahcare-tkt-mgmt-hx48` Vercel backend only (see `HRMS_API` /
`API_BASE_URL` near the top of `app-source.jsx`). Two GitHub Actions
workflows (`deploy-frontend.yml`, `deploy-backend.yml`) still target that dead
Azure infra — they're currently being left in place intentionally rather than
deleted, but don't expect them to do anything useful; the live workflows are
`deploy-frontend-staging.yml`, `deploy-backend-staging.yml`, `ci.yml`, and
`codeql.yml`.

## 3. Frontend deep-dive

- **Everything is one file**: `YCTMFrontend/src/app-source.jsx`. All page components
  (`Dashboard`, `TicketsPage`, `StaffManagementPage`, `SettingsPage`,
  `EmailConfigPage`, etc.), the `API` client object, auth helpers, and the
  `App`/`Navigation` shell all live in this one ~750KB JSX file. There is no
  component-per-file structure — search within the file rather than looking
  for separate component files.
- **Build step**: `YCTMFrontend/build.js` compiles `src/app-source.jsx` (Babel JSX →
  JS) and `enterprise-components.js`, then minifies both with Terser into
  `app.js` and `enterprise-components-compiled.js`, and rewrites the
  cache-busting `?v=<hash>` query strings in `index.html`. Run `node
  build.js` from inside `YCTMFrontend/` after any `app-source.jsx` edit — **the
  committed `app.js` is what actually runs in production**, so if you forget
  to rebuild, your source change has no effect on the deployed site. Vercel
  also runs this same build automatically as part of its build step, but
  it's good practice to build and sanity-check locally before pushing.
- **Routing**: hash-based (`#dashboard`, `#tickets`, `#settings`, ...), no
  router library. Adding a new page requires updating **three separate
  places** in `app-source.jsx`, or it will be reachable-but-broken in subtle
  ways:
  1. One of the page-permission arrays (`STAFF_PAGES` / `MANAGER_PAGES` /
     `HR_PAGES` / `DIRECTOR_PAGES` / `BOOTSTRAP_PAGES`, ~line 316) — if the
     new page ID isn't in `allowedPages`, navigating to it silently bounces
     back to Dashboard.
  2. The `pageLabels` map (~line 740) — controls the header/breadcrumb
     title. Missing this makes the title silently fall back to "Dashboard"
     even though the page content is fine (easy to miss in QA).
  3. The `switch (currentPage)` routing block (~line 8880) — the actual
     `case 'your-page': return <YourPageComponent />;`.
  If the page should also show as a sidebar nav link, add it to the `pages`
  array in the `Navigation` component (~line 957) too — but note the
  Settings page deliberately does NOT do this; it's reached only via the
  profile dropdown menus.
- **Service worker caching** (`YCTMFrontend/sw.js`): caches `app.js`,
  `enterprise-components-compiled.js`, and `/` as "shell assets" with a
  stale-while-revalidate strategy. When testing a fresh deploy in a browser
  that's had the app open before, a normal reload can serve a stale cached
  bundle. To force a true fresh load: unregister the service worker and
  clear caches (`navigator.serviceWorker.getRegistrations()` →
  `.unregister()`, `caches.keys()` → `caches.delete()`), then navigate with a
  cache-busting query string (e.g. `/?cb=<timestamp>#page`) — a pure
  hash-only URL change does **not** force a real network reload in a
  browser, since it's a same-document navigation.
- **Auth session storage**: `sessionStorage.getItem('ms_current_user')`
  holds the current user object on the client (`id`, `name`, `email`, `dept`,
  `deptId`, `positionType`, `role`, `isBootstrapAdmin`). Access tokens are
  refreshed silently every ~13 minutes; there's also a 20-minute heartbeat
  ping to `/auth/me` to keep the backend session alive.

## 4. Backend deep-dive

- Express + TypeScript in `YCTMBackend/src/`, organized by module under
  `src/modules/<domain>/<domain>.routes.ts` (e.g. `tickets`, `users`,
  `auth`, `org`, `notifications`).
- Deployed to Vercel as serverless functions — **this has real
  consequences**: any code placed *after* `res.json()`/`res.status().json()`
  is not guaranteed to finish executing once the response is sent. All
  notification/audit-log calls in route handlers must be `await`ed *before*
  the response, wrapped in `.catch(() => {})` so a notification failure
  doesn't fail the whole request.
- **Two independent notification pipelines**, both triggered from the same
  route handlers:
  - Pipeline A: `notify()` in `src/modules/notifications/notifications.service.ts`
    — push notifications (web-push/VAPID) + an in-app `notifications` table
    row. No longer sends ticket-event emails (only user-lifecycle emails),
    to avoid double-sending with Pipeline B.
  - Pipeline B: `notifyTicketXxx()` functions in
    `src/services/email/notification.service.ts` → `enqueue()` in
    `email.queue.ts` → `attemptSend()` → `sendEmail()` in
    `resend.service.ts`. Has retry/backoff via a `/cron/email-retry`
    endpoint. The Email Config admin page's Logs/Queue/Stats tabs read from
    this pipeline.
- **Auth**: Microsoft Entra ID (Azure AD) via PKCE OAuth (`@azure/msal-node`).
  `POST /auth/microsoft` starts the flow, `/auth/microsoft/callback` completes
  it, `GET /auth/me` returns the current session's user, `POST /auth/logout`
  ends it. Sessions are DB-backed (`sessions` table) with a 15-minute access
  token / 30-day refresh token, revoked after 30 minutes of inactivity.
- **Self-healing schema migrations at runtime**: rather than relying solely
  on migration files (which have drifted from the live DB — see §5), several
  routes run an idempotent `ensureXColumn()`/`ensureXTable()` helper on first
  use (e.g. `ensureApproversTable`, `ensureAttachmentsColumn`,
  `ensureAddressColumn` in `users.routes.ts`) using `CREATE TABLE IF NOT
  EXISTS` / `ALTER TABLE ADD COLUMN IF NOT EXISTS`, memoized with a
  module-level boolean so it only actually runs once per cold start. **This
  is the established pattern for adding a new column/table in this
  codebase** — prefer it over hand-writing a new SQL migration file, since
  migration files here are not reliably applied to the live DB.

## 5. Database — important caveats

- Postgres via Neon, schema `yc_tkt_mgmt`. Connection is via `DATABASE_URL`
  (see `YCTMBackend/src/db/pool.ts`).
- **The live schema has drifted from the migration files in the repo.**
  `YCTMBackend/src/db/*.sql` and `api/migrations/*.sql` do not reliably
  describe the current live table shapes — some columns exist live that no
  migration file adds (e.g. `users.phone`, `users.designation`,
  `users.avatar_initials`), and some migration-file columns were never
  actually applied. **Before writing a query against a column, verify it
  exists live** — the most reliable way (from a normal dev machine with
  psql/a Postgres client) is to query `information_schema.columns` directly
  against the Neon database, not to trust the repo's migration files.
- No direct network path to Neon was available from the Claude sandbox this
  work was done in (DNS/proxy blocked). If you're a human developer with a
  real terminal, `psql "$DATABASE_URL"` should just work — you're not
  affected by that sandboxing constraint. If you ever need to fall back to
  the Neon Console SQL Editor (e.g. from a similarly restricted environment),
  its "copy to clipboard" export mechanism was the reliable way to get data
  out — the "Download" button gets silently blocked by the browser after
  the first download of a session.
- Known **live data-integrity quirks** as of 2026-07-04 (not caused by any
  code, just an artifact of an earlier data reset — don't be alarmed by
  them, and don't assume foreign keys are consistently enforced):
  - `users` only has 10 real rows (ids 1, 4–12), but `user_positions`,
    `staff_positions`, `ticket_approval_history`, and `ticket_escalations`
    contain rows referencing now-nonexistent user_ids in the 20s–40s range.
  - `ticket_approval_history` / `ticket_escalations` also reference
    ticket_ids (e.g. 97, 191, 200–208) that don't exist in the current
    `tickets` table (only ids 4–20-ish exist as of this writing).
- Full schema+data backups (excluding `sessions` and `audit_logs` row data)
  live **outside this repo**, under `Application_Backup/Yahwehcare/` on the
  project owner's machine (timestamped folders, each with a `Codebase_Backup/`
  and `Database_Backup/*.sql` + `README.txt`) — not tracked in git, ask the
  project owner if you need a point-in-time reference for the live schema.
- **`YCTMBackend/src/db/POST_RESET_RECOVERY.sql`** consolidates four
  historically-scattered manual patch files (`approval_workflow_migration.sql`,
  `escalation_migration.sql`, `008_fix_column_names.sql`,
  `seed_lookup_tables.sql`) plus correct lookup-table seed data, into one
  idempotent script. It exists because none of those four files were ever
  referenced by any code, script, or CI step — they were applied by hand,
  historically, directly against Neon. **If the schema is ever reset again
  (or you're standing up a fresh environment), run this one file** instead of
  re-discovering which of the scattered `.sql` files under `src/db/` still
  matter.

## 6. Ticket approval workflow (data model)

- Approvers are attached to a ticket via the `ticket_approvers` table
  (`ticket_id`, `approver_user_id`, `approval_status`) **at ticket-creation
  time**, before any work has been done.
- The ticket's own `status` column only becomes `'pending_approval'` when
  the assignee calls `POST /tickets/:id/complete` with a resolution note —
  this resets all approver rows to `'Pending'` and bumps `approval_round`.
- Approvers act via `POST /tickets/:id/approve` / `/reject` / `/reopen`.
- **Gotcha fixed 2026-07-04**: the "Pending My Approval" tab used to list
  any ticket where the user had a pending `ticket_approvers` row,
  regardless of the ticket's actual `status` — so tickets that had an
  approver assigned at creation but hadn't been marked complete yet showed
  up in the tab with no way to act on them (the Approve/Reject panel only
  renders when `status === 'Pending Approval'`). Fixed by aligning the tab's
  filter condition with the button's gate. If you touch this area again,
  keep those two conditions in sync.

## 7. Environment variables — full reference

**Nowhere in this repo or this document are actual secret values stored —
only variable names and purposes.** Real values live in each Vercel
project's Settings → Environment Variables (dashboard), and locally in
`.env.local` files that are gitignored. Never commit a `.env` file or paste
real values into docs/chat.

### 7.1 Backend (`YCTMBackend`, Vercel project `yahweahcare-tkt-mgmt-hx48`)

Validated at boot via Zod in `YCTMBackend/src/config/env.ts` — the app
refuses to start if a required one is missing/invalid, so that file is the
authoritative list. Template: `YCTMBackend/.env.example`.

| Variable | Purpose | Required? |
|---|---|---|
| `NODE_ENV` | `development` \| `production` \| `test` | default `development` |
| `PORT` | Local dev port only (Vercel ignores this in serverless) | default `4001` |
| `BACKEND_URL` | This API's own public URL (used in redirect/callback construction) | yes |
| `FRONTEND_URL` | The frontend's public URL (CORS origin, post-logout redirect) | yes |
| `DATABASE_URL` | Neon Postgres connection string | yes |
| `JWT_SECRET` | Signs this app's own access/refresh tokens — must be ≥32 chars | yes |
| `SESSION_SECRET` | Signs session cookies — must be ≥32 chars | yes |
| `COOKIE_DOMAIN` | Cookie domain scope | default `localhost` |
| `COOKIE_SECURE` | Force `Secure` cookie flag | default `true` in prod |
| `COOKIE_SAMESITE` | `strict`\|`lax`\|`none` | default `none` in prod |
| `AZURE_CLIENT_ID` | Microsoft Entra app registration client ID | yes |
| `AZURE_CLIENT_SECRET` | Microsoft Entra app registration client secret | yes |
| `AZURE_TENANT_ID` | Entra tenant GUID (or `common`/`organizations`) | yes |
| `AZURE_REDIRECT_URI` | Must exactly match the URI registered in Azure Portal | yes |
| `AZURE_POST_LOGOUT_REDIRECT_URI` | Where Entra sends the user after sign-out | yes |
| `AZURE_SCOPES` | Microsoft Graph scopes requested | default `openid profile email User.Read` |
| `ALLOWED_EMAIL_DOMAINS` | Comma-separated domains allowed to be added as staff | default `yahwehcare.com.au,yahwehpc.com.au,wmxsolutions.com.au` — **known gap**: no bootstrap-admin bypass exception yet, see §9 |
| `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX` | General API rate limiting | optional, has defaults |
| `LOGIN_RATE_LIMIT_MAX` | Login-endpoint-specific rate limit | optional, has defaults |
| `ACCOUNT_LOCK_THRESHOLD` / `ACCOUNT_LOCK_DURATION_MS` | Failed-login lockout policy | optional, has defaults |
| `ACCESS_TOKEN_TTL` / `REFRESH_TOKEN_TTL` | Token lifetimes | default `15m` / `30d` |
| `SESSION_INACTIVITY_TIMEOUT_MS` | Auto-logout after inactivity | default 30 min |
| `LOG_LEVEL` | `debug`\|`info`\|`warn`\|`error` | default `info` |
| `RESEND_API_KEY` | Email sending (Resend) — sending is silently skipped, not an error, if unset | optional |
| `EMAIL_FROM` | From-address for outbound email | default `Yahwehcare <noreply@yahwehcare.com.au>` |
| `CRON_SECRET` | Bearer-auth guard on `/cron/*` endpoints (SLA checks, reminders, email retry — see `vercel.json`'s `crons` block) | optional but should be set in prod |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT` | Web Push notifications — generate via `npm run generate-vapid` in `YCTMBackend` | optional (push is wired but barely used in practice, see §9) |

### 7.2 Frontend (`YCTMFrontend`, Vercel project `yahweahcare-tkt-mgmt`)

The frontend is static and has **no build-time env vars in the traditional
sense** — there's nothing in Vercel's dashboard for this project that needs
setting. Instead, the backend URL is hardcoded directly into
`YCTMFrontend/index.html`:

```html
<script>window.__API_URL__ = "https://yahweahcare-tkt-mgmt-hx48.vercel.app";</script>
```

`app-source.jsx` reads `window.__API_URL__` (falling back to
`localhost:4001` when `window.location.hostname === 'localhost'`). **If the
backend's Vercel URL ever changes, this line is what needs editing** — not
an env var change.

### 7.3 CI/CD — GitHub Actions secrets (Settings → Secrets → Actions)

| Secret | Used by | Notes |
|---|---|---|
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | `deploy-frontend.yml` | Dead/disabled workflow — target Azure Static Web App no longer exists. Kept intentionally, see §2/§8. |
| `AZURE_CREDENTIALS` | `deploy-backend.yml` | Dead/disabled workflow — targets the legacy `api/` folder's old Azure App Service. Kept intentionally, see §2/§8. |
| `VERCEL_TOKEN` | `deploy-backend-staging.yml`, `deploy-frontend-staging.yml` | Live — Vercel personal access token used for staging deploys off the `staging` branch. |
| `VERCEL_ORG_ID` | same two staging workflows | Vercel team/org ID. |
| `VERCEL_API_PROJECT_ID` | `deploy-backend-staging.yml` | Vercel project ID for the staging API deploy (targets `api/`, not `YCTMBackend`). |
| `VERCEL_WEB_PROJECT_ID` | `deploy-frontend-staging.yml` | Vercel project ID for the staging frontend deploy. |
| `GITHUB_TOKEN` | `ci.yml`, `codeql.yml`, both `deploy-*` workflows | Auto-provided by GitHub Actions, nothing to configure. |

Note the staging workflows deploy the legacy `api/` folder and `YCTMFrontend`
to *separate* staging Vercel projects — they don't touch the two production
projects (`yahweahcare-tkt-mgmt`, `yahweahcare-tkt-mgmt-hx48`), which
auto-deploy straight from `main` via Vercel's Git integration (see §2).

### 7.4 Where the actual values live

- **Production**: each Vercel project's own Settings → Environment
  Variables (dashboard) — this is the source of truth for what's actually
  live.
- **Local dev**: `.env.local` in `YCTMBackend/` (gitignored). Pull the
  current production values with `vercel env pull .env.local
  --environment=production` from inside `YCTMBackend/` (requires `vercel
  login` and the project linked first).
- Vercel also injects its own automatic system env vars at build/runtime
  (`VERCEL_ENV`, `VERCEL_URL`, `VERCEL_OIDC_TOKEN`, etc.) — these aren't set
  manually and aren't listed above; the OIDC token in particular is
  short-lived (~12h) and rotates automatically.

## 8. Repo hygiene notes

- `.gitignore` covers `node_modules/`, build output, `.env*`, DB dumps,
  editor junk, and (as of 2026-07-04) `*.backup` files in addition to
  `*.bak`.
- The `api/` legacy folder and the two Azure-targeting GitHub Actions
  workflows are being kept in the repo intentionally for now (not deleted)
  even though they're dead — this was a deliberate, conservative scope
  decision, not an oversight. Don't assume they're safe to delete without
  checking with the project owner first.

## 9. Known open issues / things worth fixing next

- **Bootstrap-admin email-domain rule is only partially enforced.** The
  intended policy: only `@yahweahcare.com.au`-domain accounts can be added
  as staff, except the existing bootstrap admin(s); only a bootstrap admin
  can create another bootstrap admin; nobody can delete a bootstrap admin.
  As of 2026-07-04: the "can't delete/deactivate a bootstrap admin" and
  "only bootstrap admin can delete/deactivate staff" rules ARE enforced
  server-side (`users.routes.ts`). The domain restriction is a flat
  allow-list with no bootstrap-admin exception path, and the "only a
  bootstrap admin can create another bootstrap admin" rule doesn't have a
  dedicated check at all (no route currently lets you set
  `is_bootstrap_admin` on create/update in the first place, so it's not
  exploitable today, but if that ever gets exposed, add the check then).
- **Frontend-only email-domain allowlist inconsistency**: `app-source.jsx`
  hardcodes `['yahwehcare.com.au','yahwehpc.com.au']` in a couple of
  places (missing `wmxsolutions.com.au`, which the backend does allow).
  This is purely a client-side UX check (real enforcement is server-side),
  but worth fixing for consistency if you're in that code anyway.
- **`ticket_approvers`/escalation interplay**: escalating a ticket
  reassigns it but does not touch `ticket_approvers` or ticket `status` —
  this is fine for the current workflow, but if escalation logic changes,
  re-check the "Pending My Approval" tab filter (§6) still makes sense.
- Push notifications are correctly wired end-to-end but effectively unused
  in practice — very few real users have ever clicked "Enable push
  notifications" in a real browser session, so don't be surprised if this
  area looks "broken" when it's really just unused.

## 10. Recently touched areas (context for the next person)

If you're picking this up soon after 2026-07-04, the following areas were
just worked on and are freshest in anyone's mind — worth a quick look before
assuming behavior:

- `SettingsPage` (My Profile) — new page, `YCTMFrontend/src/app-source.jsx`. Backend:
  `GET/PATCH /users/me` in `users.routes.ts`.
- `StaffManagementPage`'s phone/address fields — now synced with the same
  columns `SettingsPage` edits.
- SLA Compliance dashboard calculation — `stats` `useMemo` in the main app
  component, watch the `resolvedAt || updatedAt` vs `updatedAt ||
  resolvedAt` precedence if you touch it again (the former is correct).
- Sidebar profile widget and the app's logo (`YCTMFrontend/logo.png`) were both
  restyled/replaced — purely cosmetic, low risk.

---

## Version History

**How to use this section**: every developer who ships a change should add a
new entry here (don't edit or delete previous entries). Increment the
version number. Include the date, a short summary of what changed and why,
and anything the next developer needs to know (breaking changes, follow-ups,
things you deliberately didn't do and why).

### Version 1 — 2026-07-04

Baseline handover snapshot. Session covered:

- Created a database backup (`SQL_BKP/`) and a full codebase+DB backup under
  `Application_Backup/`.
- Verified (and partially found gaps in) the bootstrap-admin/email-domain
  access rules — see §9.
- Repo cleanup: removed orphaned files (`yahweahcare-tkt-mgmt/` stray clone,
  duplicate `.backup` files, an untracked debug script, `.DS_Store`), added
  `*.backup` to `.gitignore`. Left the legacy `api/` folder and its Azure
  GitHub Actions workflows in place intentionally (not a full cleanup, by
  request).
- Fixed: SLA Compliance dashboard showing 0% (timestamp-precedence bug).
- Fixed: "Pending My Approval" tab listing tickets with no way to actually
  approve them (status-filter mismatch vs. the Approve button's gate).
- Built: a real "My Profile" (`Settings`) page — view own profile, edit only
  phone number and address. Previously "Settings" just redirected to the
  Staff Management page.
- Synced phone/address between My Profile and Staff Management (same DB
  columns, previously only reachable from one side).
- Restyled the sidebar profile widget (cleaner card, brand-color avatar,
  refined role badge).
- Replaced the text/icon placeholder logo with the real Yahweh Care brand
  logo image (`YCTMFrontend/logo.png`) across sidebar, login, and sign-out screens.
- Created this handover document.

### Version 2 — 2026-07-04

Follow-up session, same day. Covered a full Activity Log lifecycle feature,
a cosmetic overhaul of Staff Management (then extended app-wide), and a
brand-color rebrand to match the real `yahwehcare.com.au` marketing site.

**Activity Log export / archive / email / truncate / delete** (`YCTMBackend/src/modules/audit/`,
`YCTMFrontend` `ActivityLogPage`):
- New `archive.service.ts` (pure logic, unit tested) + `archive.migrate.ts`
  (lazy `activity_log_archives` table) + rewritten `audit.routes.ts`.
- Manual CSV/JSON/TXT export with a shared `buildAuditFilters()` filter
  builder (date range, user, role, action, module, ticket number, status,
  severity — derived via `SEVERITY_SQL_CASE`, ip, device, success/failure).
- Manual AU-Financial-Quarter archive generation (`Activity_Log_AU_FY{year}_Q{n}.zip`,
  CSV+JSON+TXT bundled via JSZip), manual email distribution to all
  Bootstrap Admins (Resend attachment support added to `resend.service.ts`),
  manual truncation gated on `email_status='sent'`.
- A generic filtered **Delete** button was added, but — important
  guarantee — it can **only** ever delete rows that fall inside an
  already-generated-and-emailed archive period. Both delete paths (`DELETE
  /audit-logs` and `POST /archives/:id/truncate`) AND the archived-period
  restriction into the SQL WHERE clause, never OR — verified by a
  regression test (`audit.routes.test.ts`) proving a filter targeting a
  non-archived period yields 0 deletions even with `confirmAll=true`.
- All steps write to `audit_logs` themselves (export, archive generate,
  download, email, truncate, delete) with actor/timestamp/filters/counts.

**Staff Management redesign → app-wide professional/cosmetic pass**
(`YCTMFrontend/src/app-source.jsx`):
- Removed every emoji and raw text glyph (✅ ✕ × ★ 🔒 📎 🥇 etc.) across
  the **entire** frontend, replacing them with the shared `Icon` SVG
  component. This touched every page, not just Staff Management —
  `getRoleBadgeInfo()` (sidebar role badge, shared by every page) had
  emoji baked into its `label` strings; the two call sites that used to
  `.split(' ').slice(1)` to strip the emoji word now just use `rb.label`
  directly since the label itself is clean — **if you add a new role
  label here, don't prefix it with an emoji or that stripping logic will
  wrongly eat the first real word.**
- Flattened every decorative `linear-gradient` button/card/avatar to a
  flat fill (sidebar avatar, `YCLoader`, Sign-in/Sign-out buttons,
  Dashboard/Calendar/OrgChart/Tickets cards). Deliberately left the
  LoginPage/LogoutPage/SignedOutScreen full-page dark background
  gradients alone (subtle, intentional dark-splash branding, not part of
  the "cartoonish" complaint that motivated this pass).
- Introduced a "duotone tag" badge style (solid-color icon chip + tinted
  label in one pill) for identity/status badges — Bootstrap Admin,
  Director, primary-position star, login-provider (Entra/Local),
  employment type — first on Staff Management, this is now the standard
  badge pattern to reuse for any new status/identity badge.
- `ORG_TYPE_META` (Org Chart's per-position-type color map, module-level
  constant near line ~6162) and `posTypeColor` (Staff Management, local)
  were moved from bright saturated Tailwind-ish colors to a muted
  corporate palette. Avatar initials (`Avatar` components — there are
  two independent copies, one in `StaffManagementPage`, one in
  `ExStaffPage`, not shared — search for `const Avatar = (` if you need
  to touch both) use the same muted 6-color rotation.
- Rank/podium indicators (`StaffPerformancePage`, `TeamComparisonPage`)
  replaced medal emoji with a small solid circular badge + `award` icon,
  colored gold/silver/bronze from the same muted palette (`RANK_COLOR` /
  inline equivalent).

**Brand color rebrand to match `yahwehcare.com.au`**:
- The client supplied their real brand colors: purple `#6d2773`, green
  `#82c342`, blue `#0a6abd`. The app's entire indigo/purple-ish "brand"
  color family (`#4F46E5`, `#4338CA`, `#6366F1`, `#818cf8`, `#a5b4fc`,
  `#7C3AED`, `#8B5CF6`, plus the `rgba(99,102,241,*)` tint family used for
  ~250 translucent borders/hover backgrounds, plus the `#EEF2FF` /
  `#E0E7FF` / `#C7D2FE` light-tint family) was mechanically remapped to a
  purple ramp derived from the client's exact `#6d2773`, across **both**
  `app-source.jsx` and `index.html`'s `<style>` block (CSS custom
  properties like `--brand`, and the hand-rolled Tailwind-ish utility
  classes like `.bg-indigo-600`, `.hover\:text-indigo-600`, `.ring-indigo-500`).
  Mapping used (exact-string, case-insensitive, so re-run similarly if you
  find another indigo shade that was missed):
  | Old (indigo) | New (purple) | Role |
  |---|---|---|
  | `#4F46E5` | `#6D2773` | primary/brand (client-supplied exact value) |
  | `#4338CA` | `#5D2162` | darker/hover/emphasis-text variant |
  | `#6366F1`, `#8B5CF6`, `#7C3AED` | `#833089` | mid/lighter accent (icons, borders, was-gradient-endpoints) |
  | `#818cf8` | `#C77DB8` | light variant, legible on dark-mode backgrounds |
  | `#a5b4fc` | `#DDA8D1` | lightest variant, disabled states |
  | `#EEF2FF` | `#F6ECF4` | palest tint background |
  | `#E0E7FF` | `#EAD6E6` | pale border |
  | `#C7D2FE` | `#E3BFDA` | light border/accent |
  | `rgba(99,102,241,X)` | `rgba(109,39,115,X)` | translucent tint/border (same alpha, new RGB = `#6D2773`) |
  **These derived shades (everything except `#6D2773` itself) were not
  supplied by the client — they're computationally lightened/darkened
  from the one exact hex given.** If the client later provides an actual
  brand style guide with official tints/shades, swap these placeholders
  for the real ones (same find/replace approach will work, since each
  maps from one exact old hex to one exact new hex throughout both
  files). The brand green (`#82c342`) and blue (`#0a6abd`) were **not**
  threaded through the app's semantic colors (success/info states) in
  this pass — the existing muted greens/blues from the Version 2 cosmetic
  pass were left alone. That's a reasonable follow-up if the client wants
  full palette parity, not just the primary purple.
- Sidebar logo (`Navigation` component, `YCTMFrontend/src/app-source.jsx`)
  is now clickable → `setCurrentPage('dashboard')`. Only the sidebar copy
  of the logo does this; the three splash-screen copies (`LoginPage`,
  `LogoutPage`, `SignedOutScreen`) are unauthenticated screens and were
  left as static images.
- `YCLoader` (the shared spinner used by `LoadingScreen` and
  `SectionLoader` — i.e. every loading state in the app) now spins the
  real brand icon mark (`apple-touch-icon.png`, the circular
  purple-ring/blue-figures/green-heart mark) instead of a generic SVG
  glyph inside a solid-color square. Spin duration was slowed slightly
  (0.65s → 0.9s) since spinning a detailed image reads better slower than
  spinning an abstract glyph did.

**Follow-ups worth doing next, not done in this pass**:
- Thread the brand green/blue into semantic success/info colors for full
  palette parity with the marketing site, if the client asks for it.
- If the client provides an official brand style guide (exact hover/tint
  shades, not just the one base hex per color), replace the derived
  purple ramp above with the real values.

### Version 3 — 2026-07-05 / 2026-07-06

Two follow-up sessions. Covered a full org-chart/staff-management brand-color
rollout (extending the Version 2 rebrand), a real rendering bug fix, two full
backups, and a repo-wide production-readiness cleanup.

**Brand-color rollout to Org Chart / Staff Management / Scheduled Reports**
(`YCTMFrontend/src/app-source.jsx`):
- Full palette finalized: purple `#6D2773`, blue `#0A6ABD`, green `#5B892E`
  (deepened from an initial `#82C342`/`#AED884` after feedback), plus derived
  tints — applied consistently across `ORG_TYPE_META` (~line 6157),
  `posTypeColor`, the `Avatar` color rotation (`['#6D2773','#0A6ABD',
  '#689C35','#874E8C','#3685C9','#4E7528']`), the Bootstrap Admin / Director
  duotone badges (both moved to purple, matching each other — `getRoleBadgeInfo()`
  and the two hardcoded copies in `StaffManagementPage`/`SettingsPage` were all
  updated in lockstep, since they're not shared code), the Employment/Local-login
  badges (blue/green), and a new `REPORT_GROUP_COLOR` map for the Scheduled
  Reports report-type picker (~line 7969).
- **If you add a new duotone badge or org-type color anywhere, there is no
  single shared palette constant** — `ORG_TYPE_META`, `posTypeColor`, the
  `Avatar` color arrays (two independent copies, see §3 note on `Avatar`),
  `getRoleBadgeInfo()`, and `REPORT_GROUP_COLOR` are all separate hand-maintained
  objects that happen to use the same hex values. Keep them in sync manually.

**Bug fix — org chart card header artifact**: `OrgCard`'s header used to
extract an "icon" from the first word of `dept_label` and render it inside a
26px circle; this produced a visibly broken stray highlighted circle for
single-word labels and, less obviously, for some multi-word labels too (the
whole first word would overflow a 26px circle). Fixed by removing the
icon-circle concept entirely — `dept_label` is now rendered as a title (first
word) + optional uppercase subtitle (remaining words), no circular container.
The analogous bug in `OrgDetailModal` (an empty-but-still-rendered caption
`<p>` for single-word labels, since `{deptLabel && <p>}` only checks the
original string's truthiness, not the derived caption's) was fixed the same
way — compute the caption explicitly and gate rendering on that instead.

**Repo cleanup / production-readiness pass** (this was a broad "remove
everything not required" audit, not a scoped fix):
- Removed `YCTMBackend/frontend-example/` — unused Next.js integration
  boilerplate, confirmed via `tsconfig.json` (not in `include`) and
  `.vercelignore` (explicitly excluded) to be dead reference material, never
  compiled or deployed.
- Removed nine stale root-level files: `seed-tickets.js` and
  `scripts/seed_demo.js` (**both had a hardcoded live Neon DB password in
  plain text** — removed from the tree, but the password is still visible in
  git history; rotate it if this repo's history is ever exposed), `start.sh`
  and `push-to-github.command` (referenced an old `backend/`/`frontend/`
  folder layout that no longer exists — superseded by `dev.sh`), `demo_seed.sql`
  (stale one-off seed data), root `package.json`/`package-lock.json` (only
  existed to support the removed seed scripts), a stray screenshot, and
  `Yahweahcare_TMS_Application_Overview.docx`.
- Pruned `docs/` from 17 files down to 3 (`APPROVAL_WORKFLOW.md`,
  `DUPLICATE_MERGE_FEATURE.md`, `VERCEL_NEON_DEPLOY.md`) — removed docs
  describing abandoned approaches (Azure hosting, a hosting-options
  comparison that was never acted on, the local-Postgres→Neon migration
  guide for a migration completed long ago, old setup guides referencing the
  pre-rename `backend/`/`frontend/` structure), completed one-off logs (a May
  bugfix writeup, a May user/ticket audit snapshot), superseded planning
  checklists (`BACKEND_FRONTEND_IMPLEMENTATION.md`, `CRITICAL_PATH_INTEGRATION.md`,
  `ENTERPRISE_IMPLEMENTATION_PLAN.md`, `IMPLEMENTATION_COMPLETE.md`), and
  `DATABASE_SCHEMA_SUMMARY.md` (described a UUID-keyed schema design that was
  never actually what got built — the live schema uses integer IDs, see §5 —
  so this doc was actively misleading, not just stale). Fixed two stale
  `frontend/` path references in the kept `VERCEL_NEON_DEPLOY.md` to
  `YCTMFrontend/`.
- Removed three untracked, mounted-folder-only files that had never been
  committed: `FOLDER_RENAME_2026-07-04.md` (a note-to-self about the
  `web/`→`YCTMFrontend`, `backend-hrms/`→`YCTMBackend` rename waiting on a
  Vercel dashboard change — the rename is long since live on `main`, so this
  was stale), `Yahweahcare_E2E_Verification_Report.md` (a one-off incident
  report; its one durable finding — the existence and purpose of
  `POST_RESET_RECOVERY.sql` — was folded into §5 instead of losing it), and
  a redundant local `SQL_BKP/` folder (superseded by the proper timestamped
  backups under `Application_Backup/`, see §5).
- Rewrote root `README.md` — it previously described the original prototype
  (`frontend/`/`backend/` folders, a `start.sh` installer) which no longer
  exists; it now describes the real `YCTMFrontend`/`YCTMBackend`/`api`
  architecture and points to this handover doc as the source of truth.
- **Deliberately left untouched** (per explicit scope decision, not
  oversight): the legacy `api/` folder and both its GitHub Actions workflows
  (`deploy-frontend.yml`, `deploy-backend.yml`) — see §2/§8; all six
  `.github/workflows/*.yml` files; folder names/locations of `YCTMFrontend`,
  `YCTMBackend`, and `api` (renaming any of these requires updating each
  Vercel project's Root Directory setting in the dashboard first, which
  can't be done from here — see the note this section replaces the deleted
  `FOLDER_RENAME_2026-07-04.md` for).

**Also noted, not yet acted on**: `git push` to this repo now returns a
"This repository moved" notice — GitHub has redirected
`hostsubho/yahweahcare-tkt-mgmt` to `rupak-QMS/yahweahcare-tkt-mgmt`. Pushes
still succeed via the redirect, but the remote URL in any local clone should
probably be updated to the new owner at some point; flagged to the project
owner, not changed unilaterally.

_Next entry goes here — Version 4._
