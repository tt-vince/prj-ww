# Roles & Permissions

> **Status:** Approved. Source of truth for dashboard authorization. Keep in sync with
> `db/schema.ts` (`user_role` enum), `lib/dal.ts` (gates), and the dashboard components.
> **For Claude / agents:** read this before touching any role-gated code.

## 1. Roles

Three roles, defined in the `user_role` pg enum (`db/schema.ts`). Users are provisioned
out-of-band (directly in the DB) — there is no self-sign-up and no UI to assign roles.

| Role | Purpose |
|---|---|
| `superadmin` | Full control. Exactly one can exist (partial unique index `one_superadmin_idx`). |
| `admin` | Manages guests and labels. Cannot manage users. |
| `viewer` | Read-only. Sees the dashboard and guest list; changes nothing. |

## 2. Capability matrix

| Capability | `superadmin` | `admin` | `viewer` |
|---|:--:|:--:|:--:|
| View dashboard & guest list | ✅ | ✅ | ✅ |
| Copy guest RSVP link | ✅ | ✅ | ✅ |
| Add guest | ✅ | ✅ | ❌ |
| Edit guest | ✅ | ✅ | ❌ |
| Delete guest | ✅ | ✅ | ❌ |
| Manage labels (add/rename/delete) | ✅ | ✅ | ❌ |
| Manage users (`/dashboard/users`) | ✅ | ❌ | ❌ |

## 3. Enforcement

Two layers. **UI hiding is UX only; the Server Action / page gate is the real security boundary.**

### Server gates (`lib/dal.ts`)

| Gate | Allows | Denies (redirect `/dashboard` or `/login`) |
|---|---|---|
| `requireUser()` | any active user | unauthenticated → `/login` |
| `requireEditor()` | `superadmin`, `admin` | `viewer` |
| `requireSuperadmin()` | `superadmin` | `admin`, `viewer` |

- All guest & label Server Actions (`app/(protected)/dashboard/guests/actions.ts`) call `requireEditor()`.
- User-management page and actions (`.../dashboard/users/`) call `requireSuperadmin()`.

### UI capability helpers (`lib/dal.ts`)

Pure functions mirroring the gates, used to render the right controls:
`canEdit(role)`, `canManageLabels(role)`, `canManageUsers(role)`.

| Control | Component | Shown when |
|---|---|---|
| "Add guest" button | `app/(protected)/dashboard/page.tsx` | `canEdit(role)` |
| Guest row edit / delete | `.../dashboard/guests-table.tsx` (`canEdit` prop) | `canEdit` |
| "Manage labels" menu item | `components/account-menu.tsx` | `role !== 'viewer'` |
| "Manage users" menu item | `components/account-menu.tsx` | `role === 'superadmin'` |

## 4. Rules of thumb

1. Adding a new mutating action? Gate it with `requireEditor()` (or `requireSuperadmin()` for user mgmt) — never rely on hiding the button alone.
2. Hiding a control? Use the matching `canX(role)` helper so UI and server never drift.
3. `viewer` must never reach a mutation. If a viewer forges a request, the server gate redirects.

## 5. Migration note

`viewer` added to the enum in `drizzle/0003_viewer_role.sql`
(`ALTER TYPE "user_role" ADD VALUE 'viewer'`). The `meta/` snapshot was not regenerated;
if you later run `drizzle-kit generate`, delete this hand-written migration and let the tool
regenerate so the snapshot stays consistent.
