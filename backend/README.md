# Anwar Clinic — Backend (`project`)

Node.js + Express + PostgreSQL + Sequelize API with dynamic role-based access control.

## Running it

```bash
createdb anwar_clinic
npm install
cp .env.example .env          # set DATABASE_URL
npm run db:seed               # roles, permission catalog, one admin account
npm run dev                   # http://localhost:5050
```

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `5050` | API port (5000 is taken by AirPlay on macOS) |
| `DATABASE_URL` | — | `postgres://user:pass@host:5432/anwar_clinic` |
| `JWT_SECRET` | dev fallback | **Change in production** |
| `JWT_EXPIRES_IN` | `7d` | Token lifetime |
| `FRONTEND_URL` | `http://localhost:3100` | Allowed CORS origin |
| `PUBLIC_URL` | `http://localhost:5050` | Absolute base URL of this API — uploaded-file URLs are built from it |
| `STORAGE_DRIVER` | `local` | `local` (disk) or `s3` |
| `MAX_UPLOAD_BYTES` | `10485760` | 10MB upload cap |

### Seeded login

```
admin@anwarclinic.com / Admin@123
```

The only account created. Everything else — extra roles, extra staff — is made at
runtime from the admin panel.

## How the RBAC works

Three tables, and grants live entirely in the join table — which is what makes
permissions re-assignable at runtime with no code change:

```
roles ──< role_permissions >── permissions
  │
  └──< users
```

A permission is always `<resource>:<action>` (`patients:read`, `billing:write`).

### Permissions are re-read on every request

`middleware/authenticate.ts` verifies the JWT for *identity only*, then re-derives
role and permissions from the database:

```ts
const account = await User.findByPk(payload.userId, {
  include: [{ model: Role, as: "role", include: [{ model: Permission }] }],
});
```

Tokens live for days, so trusting their frozen `permissions` claim would leave a
revoked user privileged until expiry. Re-reading means **a permission change or a
deactivation takes effect on the very next request** — no re-login, no token
refresh. The claims are still in the token, but only so the frontend proxy can
route `/:role` without a round-trip.

### Guarding a route

```ts
router.post("/", authorize("settings:write"), handler);      // needs ALL listed
router.get("/", authorizeAny("crm:read", "outreach:read"), handler);  // needs ANY
if (hasPermission(req, "billing:write")) { ... }             // imperative check
```

`superadmin` short-circuits all three — its authority is unconditional even if the
catalog drifts or a role is misconfigured.

### The permission catalog

`src/config/permissions.ts` is the single source of truth. `syncPermissionCatalog()`
runs on every boot and is **idempotent and additive**:

- creates catalog entries missing from the DB
- `superadmin` accumulates the full catalog (`addPermissions`, never `set`)
- `DEFAULT_ROLE_GRANTS` apply **only to newly created permissions**

That last rule is the important one: existing permissions are never re-granted, so
revocations made from the Settings UI survive restarts and re-seeds.

To add a permission: add a line to `PERMISSION_CATALOG` and restart.

## API

| Method | Route | Guard |
| --- | --- | --- |
| `POST` | `/auth/login` | public |
| `POST` | `/auth/logout` | public |
| `GET` | `/auth/me` | authenticated — returns live permissions |
| `GET` | `/roles` | authenticated |
| `POST` | `/roles` | `settings:write` |
| `PUT` | `/roles/:id` | `settings:write` |
| `DELETE` | `/roles/:id` | `settings:write` |
| `PUT` | `/roles/:id/permissions` | `settings:write` |
| `GET` | `/permissions` | authenticated |
| `GET` | `/media` | `media:read` |
| `GET` | `/media/config` | `media:read` |
| `POST` | `/media/upload` | `media:write` — multipart, field `file` |
| `PUT` | `/media/:id` | `media:write` — alt text |
| `DELETE` | `/media/:id` | `media:write` — removes row **and** stored object |
| `GET` | `/uploads/:key` | **public** — serves local files, open CORS |
| `GET` | `/services` | `services:read` |
| `GET` | `/services/schema` | `services:read` — drives the admin section forms |
| `GET` | `/services/:id` | `services:read` |
| `POST` | `/services` | `services:write` |
| `PUT` | `/services/:id` | `services:write` |
| `PUT` | `/services/reorder` | `services:write` |
| `DELETE` | `/services/:id` | `services:write` |
| `GET` | `/public/services` | **public** — published only, card data |
| `GET` | `/public/services/:slug` | **public** — published only, full sections |
| `GET` | `/health` | public |

Protected rules: the `superadmin` role cannot be renamed, deleted, or have its
permissions edited; a role with members cannot be deleted; role slugs must be
URL-safe (`[a-z0-9-]+`) because they become the panel's first URL segment.

## Website services

Each row in `services` is one page at `/services/<slug>` on the landing page.
`src/config/serviceSections.ts` is the **single source of truth** for what is
editable: it lists all 21 sections and their fields, and the admin panel builds
every form from it via `GET /services/schema`.

Per-service content lives in a JSONB `sections` column keyed by section, so
**adding a field is a change to `serviceSections.ts` alone** — no migration, no
admin UI work. Two safeguards on write:

- unknown section keys and unknown field names are **stripped**, so the blob can
  never drift from the schema
- empty strings and empty arrays are **not persisted** — "empty" means "use the
  component default", which is what lets a brand-new service render a complete
  21-section page before anything is filled in

`hiddenSections` holds the section keys switched off for that service.

Drafts are invisible to `/public/*`, so an unfinished page can't leak.

```bash
npm run db:seed:services   # imports the 21 services from the landing page's old data file
```

The importer is idempotent — re-running it leaves existing rows (and your edits)
alone.

## File storage

Uploads go through one `StorageDriver` (`src/services/storage/`), so the backend
is chosen by env rather than by code:

| Driver | When | Where files land | URL shape |
| --- | --- | --- | --- |
| `local` (default) | no S3 creds yet | `backend/uploads/` (gitignored) | `{PUBLIC_URL}/uploads/{key}` |
| `s3` | creds available | your bucket | `https://{bucket}.s3.{region}.amazonaws.com/{key}`, or `S3_PUBLIC_BASE_URL` if set |

### Switching to S3

No code changes — set these in `.env` and restart:

```bash
STORAGE_DRIVER=s3
S3_BUCKET=your-bucket
S3_REGION=ap-south-1
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
# optional
S3_KEY_PREFIX=clinic/media
S3_PUBLIC_BASE_URL=https://cdn.yourdomain.com
```

Leave the keys unset to use the ambient AWS credential chain (an IAM role in
production, `~/.aws/credentials` locally). The boot log prints the active driver,
and the Media Library page shows it as a badge. If `STORAGE_DRIVER=s3` but the
bucket/region are missing, it falls back to local with a warning rather than
failing every upload.

**Already-uploaded files keep their stored `url`** — each `media_assets` row
records the absolute URL and the driver that made it, so a local→S3 switch never
breaks a URL already pasted into a page. Re-upload anything you want moved to the
bucket.

Object keys are always generated server-side (`buildObjectKey`) — a client
filename like `../../etc/passwd.png` is reduced to a safe slug, so it can't
traverse or collide.

## Layout

```
src/
  config/
    database.ts       Sequelize instance
    env.ts            typed env
    permissions.ts    PERMISSION_CATALOG + boot-time sync
    seed.ts           roles + the one admin account
  models/
    Role.ts  Permission.ts  User.ts  MediaAsset.ts
    index.ts          associations, RolePermission join table, syncDatabase()
  middleware/
    authenticate.ts   authenticate, authorize, authorizeAny, hasPermission
  services/storage/
    types.ts          StorageDriver interface + safe key generation
    local.ts          disk driver (default)
    s3.ts             S3 driver — ready, selected by STORAGE_DRIVER=s3
    index.ts          driver selection
  routes/
    auth.ts  roles.ts  permissions.ts  media.ts
  app.ts              express app, CORS, route mounting
  server.ts           boot: connect, sync models, sync catalog, listen
```

> `syncDatabase()` uses `sequelize.sync({ alter: true })`, which is convenient in
> development but not what you want against production data — swap in real
> migrations before deploying.

## Service Content Rephraser (ChatGPT & Gemini Supported)

An automated script to fetch active services from the database and rephrase descriptive narrative content, paragraphs, and bullet points using ChatGPT / OpenAI (`gpt-4o-mini`, `gpt-4o`) or Google Gemini, strictly preserving all titles, headings, questions, images, and pricing.

```bash
# 1. Preview changes using ChatGPT (Dry Run - no DB writes)
npm run services:rephrase -- --dry-run

# 2. Test rephrase on a single service on live RDS
npm run services:rephrase -- --prod --slug=temple-hair-transplant --dry-run

# 3. Apply rephrasing across all active services on live RDS
npm run services:rephrase -- --prod

# 4. Create a JSON backup without updating anything
npm run services:backup -- --prod

# 5. Restore from a previous backup if ever needed
npm run services:restore -- --prod --restore=scripts/backups/services_backup_xxx.json
```
