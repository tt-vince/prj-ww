# Wedding RSVP site

Next.js 16 (App Router) + Neon Postgres + Drizzle. Guests submit an RSVP; the couple manages
responses and admin accounts on a **Google-authenticated** dashboard at `/dashboard`.

See [docs/rsvp-spec.md](docs/rsvp-spec.md) for the full spec (source of truth).

## Setup

### 1. Environment

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Var | What |
|---|---|
| `DATABASE_URL` | Neon Postgres connection string. |
| `APP_URL` | Base URL. Dev: `http://localhost:3000`. Prod: your Vercel/custom domain. |
| `GOOGLE_CLIENT_ID` | Google OAuth 2.0 Web client id. |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret. |
| `SESSION_SECRET` | 32+ random bytes for signing session JWTs: `openssl rand -base64 32`. |

Secrets live only in `.env` (git-ignored) or Vercel env settings — never commit them.

### 2. Google OAuth client

In the [Google Cloud Console](https://console.cloud.google.com/apis/credentials):

1. Create an **OAuth 2.0 Client ID** → type **Web application**.
2. Add an **Authorized redirect URI**: `<APP_URL>/api/auth/callback/google`
   (dev: `http://localhost:3000/api/auth/callback/google`; add the production URL later).
3. Consent screen scopes: `openid`, `email`, `profile`.
4. Copy the client id + secret into `.env`.

### 3. Database migration

```bash
pnpm db:generate   # regenerate SQL from db/schema.ts (already generated)
pnpm db:migrate    # apply migrations to DATABASE_URL
```

### 4. Run

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in at [/login](http://localhost:3000/login).

## Admin access model

- The **first** person to sign in with Google becomes the **superadmin** (auto-activated).
- Everyone who signs in after that is created as a **pending admin** and **cannot** access the
  dashboard until the superadmin approves them at `/dashboard/users`.
- There is exactly one superadmin (enforced by a database index).

### Superadmin recovery (escape hatch)

There is no in-app way to recover a lost superadmin account. If the superadmin's Google account is
lost, promote another user directly in the database:

```sql
-- Demote the old superadmin first if it still exists (the index allows only one):
UPDATE users SET role = 'admin' WHERE role = 'superadmin';
UPDATE users SET role = 'superadmin', status = 'active' WHERE email = 'new-owner@example.com';
```

## Deploy on Vercel

Set all env vars in the Vercel project settings, add the production redirect URI to the Google
OAuth client, and set `APP_URL` to the production domain.
