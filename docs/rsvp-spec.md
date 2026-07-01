# Wedding RSVP Site — Project Spec (Option A)

> **Status:** Admin auth + dashboard **built**. **Guest management built** — invitees, per-person invite tokens, editable labels, and admin CRUD at `/dashboard/guests`. The guest-facing RSVP form (the page a `?id=<token>` link opens) is still **pending**. This is the source of truth for the RSVP feature.
> **For Claude / agents:** Read this file before designing or writing any RSVP-related code.
> When code and this spec disagree, treat it as a bug — fix one of them, don't silently diverge.
> Update this spec in the same change whenever a decision here changes.

---

## 1. Overview

An **invite-only** wedding RSVP website. The couple pre-registers each invitee (a party/household)
in a Google-authenticated admin dashboard (`/dashboard`), which mints a per-person link
(`?id=<token>`). Each invitee later opens their personalized link and submits attendance. The
couple manages invitees + tags and (once the guest form is built) reviews responses in the dashboard.

- **Repo:** `github.com/tt-vince/prj-ww`
- **Hosting:** Vercel
- **Database:** Neon Postgres (connected via Vercel Marketplace integration — not a Claude MCP)
- **No separate backend service.** The only server logic is a Next.js Server Action co-located
  in the app.

### Non-goals (explicitly out of scope for v1)

- **Guest** accounts / guest login. The per-person `token` is a **capability link**, not a credential — anyone holding the URL can fill that invitee's RSVP. Admins **do** authenticate — via Google sign-in (§7).
- Editing or deleting an existing RSVP from the guest side.
- Email confirmations / notifications.
- Multi-event or plus-one-**by-name** management (a numeric `max_guests` allotment + `party_size` reply covers party size).
- Internationalization.

---

## 2. Tech stack (actual, as scaffolded)

| Concern | Choice | Version in repo |
|---|---|---|
| Framework | Next.js App Router | `next@16.2.9` |
| UI runtime | React | `react@19.2.4` |
| Styling | Tailwind CSS | `tailwindcss@^4` |
| Language | TypeScript | `^5` |
| Package manager | pnpm | `pnpm@10.12.4` |
| ORM | Drizzle ORM + Drizzle Kit | `drizzle-orm@^0.45`, `drizzle-kit@^0.31` |
| DB driver | `@neondatabase/serverless` (`drizzle-orm/neon-http`) | `^1.1.0` |
| Validation | zod | `zod@^4` |
| Auth / sessions | Custom Google OAuth 2.0 + `jose` JWT cookie | `jose@^6`, `server-only` |
| Components | shadcn/ui (base-ui, `nova` preset) | initialized — `button`, `card`, `table`, `badge`, `alert`, `separator`, `empty` |

> ⚠️ **Next.js 16 caveat (see `AGENTS.md`):** APIs and conventions differ from older training
> data. Read the relevant guide in `node_modules/next/dist/docs/` before writing framework code.
> This repo uses the **root `app/`** directory (no `src/`). The original plan's `src/...` paths
> are corrected throughout this spec to match the actual layout.

### Dependencies to add

```bash
pnpm add drizzle-orm @neondatabase/serverless zod jose server-only
pnpm add -D drizzle-kit
# shadcn components added via the shadcn skill/MCP (form, input, button, radio-group, textarea, label, card, table, badge)
```

---

## 3. Architecture

Greenfield feature — nothing to replace.

```
Browser (guest)
   │  fills RSVP form  (client component, shadcn/ui + react-hook-form + zod)
   ▼
Next.js App Router  /              (Server Component shell)
   │  form submits to ↓
Server Action  submitRsvp()         (runs on Vercel — no separate service)
   │  validate (zod)  →  insert via Drizzle
   ▼
Neon Postgres  (DATABASE_URL injected by Vercel Marketplace)
   ▲
   │  read-only
Admin dashboard  /dashboard  (Google-authenticated)  →  lists RSVPs + manages admin users

Admin auth:  /login → Google OAuth (PKCE+state+nonce) → /api/auth/callback/google → jose session cookie
   proxy.ts  = optimistic redirect for /dashboard/*    ·    lib/dal.ts = authoritative status/role check
```

The "backend" is `submitRsvp()`, the admin read/manage queries, and the Google OAuth route handlers. No separate service, no second deploy.

---

## 4. Data model

Three feature tables (`guests`, `labels`, `guest_labels`) plus the `users` admin table, defined in
Drizzle. A Postgres enum `rsvp_status` backs `guests.status`. **This build ships the admin
management side only** — the reply columns (`status`/`party_size`/`guest_note`/`responded_at`)
exist but nothing writes them yet (the guest-facing form is deferred, §13).

### Table: `guests` (invitees / "people")

Admin-managed. Each row is a party/household with a stable, unguessable `token` used in the
wedding-site link (`?id=<token>`) and a `max_guests` seat allotment.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` | |
| `token` | `text` | **not null, unique** | Short URL-safe token → `?id=<token>` (capability link) |
| `name` | `text` | **not null** | Party / household name |
| `max_guests` | `integer` | not null, default `1` | Seat allotment (1–20) |
| `email` | `text` | nullable | Admin-only contact |
| `phone` | `text` | nullable | Admin-only contact |
| `admin_note` | `text` | nullable | Private, dashboard-only |
| `status` | `rsvp_status` enum | not null, default `pending` | Guest reply — set later by the form |
| `party_size` | `integer` | nullable | # attending, ≤ `max_guests` — set later |
| `guest_note` | `text` | nullable | Guest's message — set later |
| `responded_at` | `timestamptz` | nullable | Set later |
| `created_at` | `timestamptz` | not null, default `now()` | |
| `updated_at` | `timestamptz` | not null, default `now()` | Set on write |

### Enum: `rsvp_status`

```
'pending' | 'going' | 'not_going'
```

`pending` = awaiting reply. **Fixed set — not runtime-editable.** Dashboard head-count counts rows
where `status = 'going'` (`party_size` summed for "expected guests").

### Table: `labels` (editable tags)

Admin-managed tags (e.g. "Bride's family", "College friends"), attached to guests many-to-many.
Add / rename / delete at runtime from the dashboard.

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `name` | `text` | **not null, unique** |
| `created_at` | `timestamptz` | not null, default `now()` |

### Table: `guest_labels` (join, many-to-many)

| Column | Type | Constraints |
|---|---|---|
| `guest_id` | `uuid` | FK → `guests.id`, **on delete cascade** |
| `label_id` | `uuid` | FK → `labels.id`, **on delete cascade** |
| — | — | composite PK (`guest_id`, `label_id`) |

> No unique constraint on guest `email` — the invite `token` is the identity, and one guest = one
> editable row (future upsert). Deleting a guest or a label cascades the join rows automatically.

### Table: `users` (admin identities)

Authenticated admin users only — guests never appear here. Populated on Google sign-in.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` | |
| `google_sub` | `text` | **not null**, unique | Google `sub` claim — stable identity |
| `email` | `text` | **not null**, unique | From verified Google email |
| `name` | `text` | nullable | Google profile name |
| `picture` | `text` | nullable | Google avatar URL |
| `role` | `user_role` enum | not null, default `admin` | `superadmin` \| `admin` |
| `status` | `user_status` enum | not null, default `pending` | `pending` \| `active` \| `disabled` |
| `created_at` | `timestamptz` | not null, default `now()` | |
| `last_login_at` | `timestamptz` | nullable | Updated each login |

### Enums (auth)

```
user_role   = 'superadmin' | 'admin'
user_status = 'pending' | 'active' | 'disabled'
```

> **Exactly one superadmin.** A partial unique index `one_superadmin_idx ON users(role) WHERE role='superadmin'` guarantees at most one superadmin row can ever exist. The first user to sign in becomes that superadmin (auto `active`); everyone else is `admin`/`pending` until activated. No in-app recovery if that account is lost — recovery is a manual DB update.

> The `comments` table (proof-of-concept) remains in the DB but is **not** managed by Drizzle — left as-is.

---

## 5. Validation / DTOs

zod schemas live in `lib/validation.ts` and are the **single source of type truth** — the admin
forms and the Server Actions both infer from them, so types are declared once.

### `guestInputSchema` (admin create/edit)

| Field | Rule |
|---|---|
| `name` | string, trimmed, non-empty, max 120 |
| `maxGuests` | integer, 1–20 (coerced; blank → 1) |
| `email` | optional, valid email, max 200 (blank → omitted) |
| `phone` | optional, trimmed, max 30 |
| `adminNote` | optional, trimmed, max 1000 |
| `status` | enum `pending` \| `going` \| `not_going`, default `pending` |
| `labelIds` | array of uuid, default `[]` |

- Type: `type GuestInput = z.infer<typeof guestInputSchema>`. `rsvpStatusValues` mirrors the pg enum.

### `labelInputSchema` (add/rename tag)

| Field | Rule |
|---|---|
| `name` | string, trimmed, non-empty, max 40 |

### id schemas

`guestIdSchema` / `labelIdSchema` / `userIdSchema` = `z.string().uuid()`.

### Read model

Drizzle-inferred types (`Guest`, `Label`, `GuestLabel` = `typeof …$inferSelect`) power the dashboard
list, which uses the relations query (`db.query.guests.findMany` with `guestLabels.label`). The
guest **response** DTO (attendance-form input) is deferred with the form.

---

## 6. File plan (paths match the real root `app/` layout)

### New files

| File | Purpose |
|---|---|
| `docs/rsvp-spec.md` | **This document** — the reference spec (create first). |
| `.env.example` | Documents required env vars (see §8). |
| `drizzle.config.ts` | Drizzle Kit config pointing at `DATABASE_URL`. |
| `db/schema.ts` | `users` + `rsvps` tables, enums, partial superadmin index (`comments` left unmanaged). |
| `db/index.ts` | Neon + Drizzle client (singleton). |
| `lib/validation.ts` | zod schemas / DTOs (§5). |
| `app/actions/submit-rsvp.ts` | The `submitRsvp` Server Action. |
| `app/page.tsx` | Landing / wedding page shell (exists as CNA default — replace). |
| `components/rsvp-form.tsx` | Client RSVP form (shadcn/ui). |
| `lib/session.ts` | Pure `jose` encrypt/decrypt + cookie name/age (safe to import in `proxy.ts`). |
| `lib/oauth.ts` | Google OAuth: PKCE/state/nonce, token exchange, id_token verify (JWKS). |
| `lib/users.ts` | `upsertUserOnLogin` — first-user→superadmin, race-safe. |
| `lib/dal.ts` | `getCurrentUser` / `requireUser` / `requireSuperadmin` (React `cache()`). |
| `proxy.ts` | Optimistic redirect for `/dashboard/*` (replaces `middleware.ts`). |
| `app/api/auth/google/route.ts` | Initiate OAuth (GET → redirect to Google). |
| `app/api/auth/callback/google/route.ts` | OAuth callback: verify, upsert, gate, session. |
| `app/api/auth/logout/route.ts` | POST → clear session cookie. |
| `app/login/page.tsx` | "Continue with Google" + pending/error messaging. |
| `app/(protected)/layout.tsx` | Dashboard shell (nav + sign out). |
| `app/(protected)/dashboard/page.tsx` | Dashboard home. |
| `app/(protected)/dashboard/guests/page.tsx` | Guest list + CRUD entry (replaces the old read-only RSVP list). |
| `app/(protected)/dashboard/guests/actions.ts` | Guest + label Server Actions (create/update/delete). |
| `app/(protected)/dashboard/guests/{guest-dialog,labels-manager,delete-guest-button,copy-link-button}.tsx` | Client CRUD UI (shadcn dialog/select/checkbox/alert-dialog). |
| `lib/guest-token.ts` | Short unguessable invite-token generator (crypto). |
| `app/(protected)/dashboard/users/page.tsx` | User management (superadmin only). |
| `app/(protected)/dashboard/users/actions.ts` | activate/deactivate Server Actions. |
| `components/ui/*` | shadcn components pulled via skill/MCP. |
| `drizzle/` | Generated migration output (Drizzle Kit). |

### Files to update

| File | Change |
|---|---|
| `README.md` | Setup, env, deploy, and "view responses at `/admin`" section. |
| `package.json` | Add deps (§2) + `db:generate` / `db:migrate` scripts. |
| `app/layout.tsx` | Metadata / fonts for the wedding site (as needed). |

### Files to delete

None.

---

## 7. Server Action & admin auth contracts

### `submitRsvp(input)` — `app/actions/submit-rsvp.ts`

- Directive `"use server"`.
- Input: `RsvpInput` (from FormData or a typed object), re-validated server-side with
  `rsvpInputSchema` — **never trust the client**.
- On success: insert one row via Drizzle, return `{ ok: true }`. Optionally `revalidatePath('/admin')`.
- On validation failure: return `{ ok: false, errors }` (field-level) — do not throw for expected
  user error; the form renders the messages.
- JSDoc the action (per §10 conventions).

### Admin gate — `/dashboard` (Google OAuth)

Admins sign in with Google. There is **no shared password**. Access model:

- The **first** user ever to sign in becomes the **`superadmin`** (auto `active`).
- Every later sign-in creates an **`admin`** with status **`pending`** — they cannot access the
  dashboard until the superadmin **activates** them from `/dashboard/users`.
- Exactly one superadmin, DB-enforced (`one_superadmin_idx`). No role-change UI.

Flow:

1. `/login` shows "Continue with Google" (plain `<a>` to `/api/auth/google`, never prefetched).
2. `app/api/auth/google/route.ts` generates `state` + `nonce` + PKCE `code_verifier`/`code_challenge`,
   stores them in short-lived `httpOnly` cookies, and redirects to Google.
3. `app/api/auth/callback/google/route.ts` verifies `state` (CSRF), exchanges the code (with the
   PKCE verifier + client secret), verifies the `id_token` against Google's JWKS via `jose`
   (`iss`/`aud`/`exp`/`nonce`/`email_verified`), then `upsertUserOnLogin` (first-user race handled
   by the partial unique index).
4. **Gate:** if the user is not `active` → redirect to `/login?pending=1`, **no session issued**.
   If `active` → set an `httpOnly`, `secure` (prod), `sameSite=lax`, 7-day `jose` JWT cookie
   (payload = `{ userId }` only) and redirect to `/dashboard`.
5. `proxy.ts` does an **optimistic** cookie check on `/dashboard/*`; `lib/dal.ts` does the
   **authoritative** check on every page/action (re-reads the user, enforces `status === 'active'`,
   loads `role`) so deactivation takes effect immediately.
6. User-management Server Actions (`activateUser`/`deactivateUser`) require `requireSuperadmin()`
   and forbid self-modification / disabling a superadmin (lockout prevention).
7. Logout: POST `/api/auth/logout` clears the cookie.

> Secrets (`GOOGLE_CLIENT_SECRET`, `SESSION_SECRET`) only via env — never hardcoded, committed,
> logged, or in URLs. `sameSite=lax` is required so the cookie survives the Google redirect.

---

## 8. Environment variables

| Var | Required | Where set | Purpose |
|---|---|---|---|
| `DATABASE_URL` | ✅ | Vercel (Neon Marketplace) + local `.env` | Neon Postgres connection string. |
| `APP_URL` | ✅ | Vercel env + local `.env` | Base URL; builds the OAuth redirect URI. Dev: `http://localhost:3000`. |
| `GOOGLE_CLIENT_ID` | ✅ | Vercel env + local `.env` | Google OAuth 2.0 Web client id. |
| `GOOGLE_CLIENT_SECRET` | ✅ | Vercel env + local `.env` | Google OAuth client secret (user-supplied). |
| `SESSION_SECRET` | ✅ | Vercel env + local `.env` | 32+ random bytes; signs the session JWT (`openssl rand -base64 32`). |

`.env.example` documents these with placeholder values. The real `.env` is git-ignored.
Google Cloud: Web OAuth client, redirect URI `${APP_URL}/api/auth/callback/google`, scopes `openid email profile`.

---

## 9. Build sequence

1. **Read context first.** Skim `AGENTS.md` and the relevant `node_modules/next/dist/docs/`
   guides (Server Actions, App Router, forms) — Next 16 differs from older conventions.
2. Add dependencies (§2) and `db:generate` / `db:migrate` scripts.
3. Wire Drizzle + Neon client (`db/index.ts`); define `db/schema.ts`; generate & run the
   initial migration.
4. Write `lib/validation.ts` (DTOs), then `submitRsvp` in `app/actions/submit-rsvp.ts`.
5. Build the RSVP form (`components/rsvp-form.tsx`, shadcn) and the landing `app/page.tsx`;
   connect form → action.
6. Add Google auth: `users` schema + migration, `lib/{session,oauth,users,dal}.ts`, the
   `app/api/auth/*` route handlers, `proxy.ts`, and the `(protected)/dashboard` pages + user-mgmt
   actions (§7). The guest RSVP form (§7 `submitRsvp` + `components/rsvp-form.tsx`) is still pending.
7. Document: JSDoc on the action + schema, README setup/deploy section (§10).
8. **Hand off for review — do not commit.** All changes reviewed before any commit.

---

## 10. Conventions

- **Types are inferred once** from zod (`lib/validation.ts`) and Drizzle (`db/schema.ts`).
  No hand-duplicated shapes.
- **JSDoc** the Server Action and the schema (what it does, input/output, failure modes).
- **Secrets** only via env vars — never hardcoded, never committed, never logged, never in URLs.
- **shadcn first:** pull real component source via the shadcn skill/MCP rather than hand-rolling
  form/input/button/radio-group/textarea.
- Keep the guest form a **client component**; keep pages **Server Components** where possible.
- React 19: no `forwardRef` needed; follow the vercel-composition / react-best-practices skills.

---

## 11. Skills & tools to use

| Skill / tool | Use for |
|---|---|
| `fe-nextjs-developer` (primary) | App Router, Server Actions, Server Components, project structure. |
| `next-best-practices` / `next-cache-components` | Next 16 file conventions, RSC boundaries, caching. |
| `shadcn` skill + Shadcn UI MCP | Pull real component source (form, input, button, radio-group, textarea). |
| `typescript-pro` | Strict typing across DTOs, action I/O, Drizzle inference. |
| `be-nestjs-developer` | **Only** for its Drizzle schema conventions & doc guidelines — no NestJS is used. |
| `vercel-react-best-practices` / `vercel-composition-patterns` | React 19 patterns, performance. |

No MCP connectors (Gmail, Slack, Figma) needed. Neon connects through Vercel's Marketplace
integration, not a Claude MCP. `docx`/`pdf` skills considered and excluded.

---

## 12. Locked-in decisions

- **Invite-only.** The couple pre-registers invitees; each gets an unguessable `token` used as
  `?id=<token>`. No open/anonymous form.
- **Guest fields:** name, `max_guests` allotment, optional email/phone, optional `admin_note`, plus
  editable **labels** (tags, many-to-many). Reply stored as `status` + `party_size` + `guest_note`
  (deferred form writes these).
- **Status:** fixed enum `pending | going | not_going` (default `pending`). Not runtime-editable.
- **Labels:** admin-editable tag set (add / rename / delete), many per guest.
- **One editable reply per guest** (future upsert). No `email` uniqueness.
- **Admin access:** any **active** admin manages guests + labels (`requireUser`); user activation
  stays superadmin-only. Google-authenticated `/dashboard`; first sign-in → superadmin (auto-active);
  later sign-ins → pending admins the superadmin activates. Exactly one superadmin, DB-enforced.
- **Build order:** management side first (this build); the guest-facing RSVP form is deferred (§13).

---

## 13. Open questions (resolve before/at build time)

- Spam/abuse protection on the public form (honeypot field or lightweight rate-limit)? — optional, decide at build.
- Should the same email submitting twice be allowed, de-duped, or upserted? — currently allowed (§4).
- Admin cookie lifetime (session vs N days)?
