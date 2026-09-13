# NexGen — Admin Panel

Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 admin panel with a fully
dynamic, role-based access control system.

## Running it

```bash
npm install
cp .env.example .env.local     # points at the backend
npm run dev                    # http://localhost:3100
```

The backend (`../backend`) must be running first — see its README.

| Variable | Default | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:5050` | Base URL of the backend API |

## How the RBAC works

Roles are **data, not code**. A role created at runtime from Settings → Roles gets
working URLs, a correctly filtered nav, and enforced page access with no new routes
and no redeploy. Four pieces make that work:

**1. `app/[role]/` — the dynamic route segment**
Every authenticated page lives under `/:role/...`, so the role slug is a URL
parameter rather than a hardcoded route. `/doctor/patients` and
`/lab-technician/patients` both resolve to the same page.

**2. `proxy.ts` — routing guard (Next 16's middleware)**
Runs before every request. No `authToken` cookie → `/auth/login`. Expired token →
cleared and bounced. A user whose token says `doctor` requesting `/pharmacist/...`
is redirected to their own dashboard. `superadmin` is the exception: it may browse
any role's URL, which drives preview mode below.

It only *decodes* the JWT (never verifies the signature) because it only decides
**where to route**. Every real authorization decision is made by the API.

**3. `context/PermissionsContext.tsx` — the gating source of truth**
On mount it calls `/auth/me`, which returns the user's permissions re-read live
from the database. Use `has(...)` for every check — never read `permissions`
directly, because `has()` also handles:

- **superadmin override** — always returns true
- **preview mode** — while a superadmin browses another role's URL, `has()` answers
  using *that role's* grants, so the panel shows what its holder would really see

The `permissions` cookie is only a fast-path hint so the nav can paint before
`/auth/me` resolves; it is read via `useSyncExternalStore` so the hydrating render
matches the server.

**4. `constants/nav.tsx` — the nav as data**
Each entry declares the permissions that reveal it. `Sidebar` filters the list
through `has()`. Adding a module is one line here.

### Gating a page

```tsx
// Whole page — shows a "no access" panel if the permission is missing
<RequirePermission permissions={["patients:read"]}>
  <PatientsTable />
</RequirePermission>

// Inline — hide a button, column, or card
<Can permissions={["patients:write"]}>
  <button>Add patient</button>
</Can>
```

Both live in `components/UI/Guards.tsx`. **Neither is a security boundary** — they
keep the UI honest. The API enforces the same rules server-side.

### Adding a permission

1. Add it to `PERMISSION_CATALOG` in the backend's `src/config/permissions.ts`
2. Restart the backend — it syncs the catalog additively on boot
3. Optionally add a label to `PERMISSION_LABELS` and a nav entry in `constants/nav.tsx`

It appears in the Settings → Roles matrix automatically, ready to grant.

## Services

`/:role/services` — the list; `/:role/services/:id` — the editor. Gated by
`services:read` / `services:write`.

Every form is generated from the schema the backend serves at
`GET /services/schema`; there is no hardcoded field list here. `SchemaFields.tsx`
renders the five field types (`text`, `textarea`, `image`, `stringList`,
`objectList`) — adding a **field** needs no change in this app at all, and adding
a new *field type* is the only front-end work a schema change can require.

Image fields can pull a URL straight from the Media Library via the picker,
rather than copy-pasting between tabs.

## Media Library

`/:role/media` — upload an image, copy its URL, paste it into the landing page.
Gated by `media:read` (view) and `media:write` (upload/delete). A badge shows
whether the backend is on local disk or S3.

The copy button uses the async Clipboard API, which browsers block on insecure
non-localhost origins; each card also shows the URL in a read-only field that
selects on focus, so it can always be copied by hand.

Previews use a plain `<img>` rather than `next/image` — asset URLs are arbitrary
(any bucket or CDN), and `next/image` would need a `remotePatterns` entry for each.

## Layout

```
app/
  [role]/               every authenticated page, gated by permission
    layout.tsx          PermissionsProvider + LayoutProvider + chrome
    dashboard/          modules the current role can reach
    media/              upload files, copy public URLs
    services/           landing-page service pages (list + section editor)
    settings/roles/     create roles, edit the permission matrix
  auth/login/           the only unauthenticated route
components/
  Auth/                 LoginForm
  Layout/               Sidebar (permission-filtered), Header
  Settings/             RolesManager — the dynamic RBAC UI
  Media/                MediaLibrary — upload, preview, copy URL
  Services/             ServicesList, ServiceEditor, SchemaFields, MediaPicker
  UI/                   Guards (Can, RequirePermission)
context/                PermissionsContext, LayoutContext
lib/                    api (fetch, apiUpload, 401 handling), auth (JWT decode), utils
constants/nav.tsx       nav entries, permission labels, resource grouping
proxy.ts                route guard
```
