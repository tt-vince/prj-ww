import 'server-only';
import { sql } from 'drizzle-orm';
import { db } from '@/db';
import { users, type User } from '@/db/schema';
import type { GoogleProfile } from '@/lib/oauth';

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === '23505'
  );
}

/**
 * Upsert the Google-identified user on login.
 *
 * The FIRST user ever to sign in becomes an `active` `superadmin`; everyone
 * else is created as a `pending` `admin` (blocked until the superadmin
 * activates them). Returning users keep their existing role/status; only their
 * profile fields and `lastLoginAt` are refreshed.
 *
 * Concurrency: the role/status decision is made inside a single INSERT via a
 * CASE on `count(*)`. If two brand-new users race for superadmin, the partial
 * unique index `one_superadmin_idx` rejects the loser (Postgres 23505); we
 * catch that and retry the insert as a pending admin.
 */
export async function upsertUserOnLogin(profile: GoogleProfile): Promise<User> {
  const conflictUpdate = {
    target: users.googleSub,
    set: {
      email: profile.email,
      name: profile.name ?? null,
      picture: profile.picture ?? null,
      lastLoginAt: sql`now()`,
    },
  } as const;

  try {
    const [row] = await db
      .insert(users)
      .values({
        googleSub: profile.sub,
        email: profile.email,
        name: profile.name ?? null,
        picture: profile.picture ?? null,
        role: sql`(CASE WHEN (SELECT count(*) FROM ${users}) = 0 THEN 'superadmin' ELSE 'admin' END)::user_role`,
        status: sql`(CASE WHEN (SELECT count(*) FROM ${users}) = 0 THEN 'active' ELSE 'pending' END)::user_status`,
      })
      .onConflictDoUpdate(conflictUpdate)
      .returning();
    return row;
  } catch (error) {
    if (!isUniqueViolation(error)) throw error;
    // Lost the superadmin race — create as a pending admin instead.
    const [row] = await db
      .insert(users)
      .values({
        googleSub: profile.sub,
        email: profile.email,
        name: profile.name ?? null,
        picture: profile.picture ?? null,
        role: 'admin',
        status: 'pending',
      })
      .onConflictDoUpdate(conflictUpdate)
      .returning();
    return row;
  }
}
