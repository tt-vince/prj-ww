# Wedding RSVP Site — Project Spec (Option A)

> **Status:** Approved plan, not yet built. This is the source of truth for the RSVP feature.
> **For Claude / agents:** Read this file before designing or writing any RSVP-related code.
> When code and this spec disagree, treat it as a bug — fix one of them, don't silently diverge.
> Update this spec in the same change whenever a decision here changes.

---

## 1. Overview

A single-purpose wedding RSVP website. Guests open the site, fill one form, and submit
their attendance. The couple views submitted responses on a password-gated admin page.

- **Repo:** `github.com/tt-vince/prj-ww`
- **Hosting:** Vercel
- **Database:** Neon Postgres (connected via Vercel Marketplace integration — not a Claude MCP)
- **No separate backend service.** The only server logic is a Next.js Server Action co-located
  in the app.

### Non-goals (explicitly out of scope for v1)

- User accounts / guest login (email is an identifier, not an auth credential).
- Editing or deleting an existing RSVP from the guest side.
- Email confirmations / notifications.
- Multi-event or plus-one-by-name management (a numeric `guest_count` covers party size).
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
| ORM | Drizzle ORM + Drizzle Kit | _to add_ |
| DB driver | `@neondatabase/serverless` (`drizzle-orm/neon-http`) | _to add_ |
| Validation | zod | _to add_ |
| Components | shadcn/ui (pull via shadcn skill / MCP) | _to add_ |

> ⚠️ **Next.js 16 caveat (see `AGENTS.md`):** APIs and conventions differ from older training
> data. Read the relevant guide in `node_modules/next/dist/docs/` before writing framework code.
> This repo uses the **root `app/`** directory (no `src/`). The original plan's `src/...` paths
> are corrected throughout this spec to match the actual layout.

### Dependencies to add

```bash
pnpm add drizzle-orm @neondatabase/serverless zod
pnpm add -D drizzle-kit
# shadcn components added via the shadcn skill/MCP (form, input, button, radio-group, textarea, label, card)
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
Admin page  /admin  (password-gated Server Component)  →  lists responses
```

The entire "backend" is `submitRsvp()` plus the admin read query. No REST API, no second deploy.

---

## 4. Data model

Single table, defined in Drizzle. A Postgres enum `rsvp_status` backs the `status` column.

### Table: `rsvps`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` | |
| `name` | `text` | **not null** | Guest / party name |
| `email` | `text` | **not null**, format-validated | Required contact + soft identifier |
| `phone` | `text` | nullable | Optional secondary contact |
| `status` | `rsvp_status` enum | **not null** | `attending` \| `not_attending` \| `maybe` |
| `guest_count` | `integer` | not null, default `1` | Party size incl. the guest; ≥ 1 |
| `note` | `text` | nullable | Dietary needs / message to couple |
| `created_at` | `timestamptz` | not null, default `now()` | |
| `updated_at` | `timestamptz` | not null, default `now()` | Set on write |

### Enum: `rsvp_status`

```
'attending' | 'not_attending' | 'maybe'
```

> No unique constraint on `email` in v1 — a guest submitting twice creates two rows.
> De-duplication (if wanted) is an admin-side concern, not enforced by the schema.

---

## 5. Validation / DTOs

zod schemas live in `lib/validation.ts` and are the **single source of type truth** — the form
and the Server Action both infer from them, so types are declared once.

### `rsvpInputSchema` (write DTO — form + action input)

| Field | Rule |
|---|---|
| `name` | string, trimmed, non-empty (min 1), max ~120 |
| `email` | string, **required**, valid email format |
| `phone` | string, optional, sane length cap |
| `status` | enum `attending` \| `not_attending` \| `maybe`, required |
| `guestCount` | integer, ≥ 1, reasonable max (e.g. ≤ 20), default 1 |
| `note` | string, optional, max ~1000 |

- Type: `type RsvpInput = z.infer<typeof rsvpInputSchema>` — this **is** the Server Action's input type.
- The earlier "at least one contact method" rule is **dropped** because email is mandatory.

### `rsvpRecord` (read DTO — admin list)

- Drizzle-inferred select type of the `rsvps` row (`typeof rsvps.$inferSelect`), used by `/admin`.

---

## 6. File plan (paths match the real root `app/` layout)

### New files

| File | Purpose |
|---|---|
| `docs/rsvp-spec.md` | **This document** — the reference spec (create first). |
| `.env.example` | Documents required env vars (see §8). |
| `drizzle.config.ts` | Drizzle Kit config pointing at `DATABASE_URL`. |
| `db/schema.ts` | `rsvps` table + `rsvp_status` enum. |
| `db/index.ts` | Neon + Drizzle client (singleton). |
| `lib/validation.ts` | zod schemas / DTOs (§5). |
| `app/actions/submit-rsvp.ts` | The `submitRsvp` Server Action. |
| `app/page.tsx` | Landing / wedding page shell (exists as CNA default — replace). |
| `components/rsvp-form.tsx` | Client RSVP form (shadcn/ui). |
| `app/admin/page.tsx` | Password-gated response list. |
| `app/admin/actions.ts` | Admin login/logout Server Actions (§7). |
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

### Admin gate — `/admin`

Single shared password, checked **server-side**. Value lives in env var `ADMIN_PASSWORD`
(real value set in Vercel env settings — **never hardcoded, never committed**).

Flow:

1. `app/admin/page.tsx` (Server Component) checks for a valid admin session cookie.
2. No/invalid cookie → render a password form instead of the list.
3. Form posts to an admin login Server Action that compares the submitted password to
   `ADMIN_PASSWORD` using a **timing-safe** comparison, then sets an `httpOnly`, `secure`,
   `sameSite=lax` session cookie.
4. With a valid cookie → query all `rsvps` (ordered by `created_at desc`) and render the table.
5. Provide a logout action that clears the cookie.

> This is intentionally minimal auth appropriate for low-stakes wedding data. Do **not** put the
> password in a URL/query string. Do **not** log it. Do not read responses without the gate.

---

## 8. Environment variables

| Var | Required | Where set | Purpose |
|---|---|---|---|
| `DATABASE_URL` | ✅ | Vercel (Neon Marketplace) + local `.env` | Neon Postgres connection string. |
| `ADMIN_PASSWORD` | ✅ | Vercel env settings + local `.env` | Shared password for `/admin`. |
| `ADMIN_SESSION_SECRET` | recommended | Vercel env settings + local `.env` | Secret for signing the admin session cookie. |

`.env.example` documents these with placeholder values. The real `.env` is git-ignored.

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
6. Add the password-gated `/admin` read page + login/logout actions (§7).
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

- **Fields:** name, email, phone, status, plus `guest_count` and `note`.
- **Contact:** email **required**, phone optional. (Drops the earlier "at-least-one-contact" rule.)
- **Viewing responses:** password-gated `/admin` page only, gated by shared env `ADMIN_PASSWORD`,
  checked server-side. Real value set in Vercel env settings — never hardcoded.

---

## 13. Open questions (resolve before/at build time)

- Spam/abuse protection on the public form (honeypot field or lightweight rate-limit)? — optional, decide at build.
- Should the same email submitting twice be allowed, de-duped, or upserted? — currently allowed (§4).
- Admin cookie lifetime (session vs N days)?
