import 'server-only';
import { eq, sql } from 'drizzle-orm';
import { db } from '@/db';
import { users, type User } from '@/db/schema';
import type { GoogleProfile } from '@/lib/oauth';

/**
 * Refresh an existing admin's profile on login.
 *
 * Admins are **not** self-provisioned. Sign-in only authenticates a user that
 * already exists in `users`, matched by their stable Google `sub`. An unknown
 * Google account returns `null` and is denied by the callback — there is no
 * sign-up path. New admins (including the initial superadmin) are provisioned
 * out-of-band, directly in the database.
 *
 * For a matched user the profile fields and `lastLoginAt` are refreshed; the
 * existing `role` and `status` are left untouched.
 */
export async function updateUserOnLogin(profile: GoogleProfile): Promise<User | null> {
  const [row] = await db
    .update(users)
    .set({
      email: profile.email,
      name: profile.name ?? null,
      picture: profile.picture ?? null,
      lastLoginAt: sql`now()`,
    })
    .where(eq(users.googleSub, profile.sub))
    .returning();
  return row ?? null;
}
