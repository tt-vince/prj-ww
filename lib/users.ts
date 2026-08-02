import 'server-only';
import { eq, sql } from 'drizzle-orm';
import { db } from '@/db';
import { users, type User } from '@/db/schema';
import type { GoogleProfile } from '@/lib/oauth';

/**
 * Refresh an existing admin's profile on login, or bootstrap the first user.
 *
 * Admins are **not** self-provisioned once the system is seeded. Sign-in only
 * authenticates a user that already exists in `users`, matched by their stable
 * Google `sub`; an unknown account returns `null` and is denied by the callback.
 *
 * **Bootstrap exception:** while `users` is completely empty, the first Google
 * account to sign in is provisioned as the `superadmin` (active). This is the
 * one self-provisioning path and it closes permanently the instant any row
 * exists — every later unknown account is denied as before. The insert runs in
 * a transaction and the partial unique index `one_superadmin_idx` guarantees a
 * concurrent second login cannot create a second superadmin.
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
  if (row) return row;

  // Bootstrap: first-ever sign-in becomes the superadmin. Serialized in a
  // transaction; `one_superadmin_idx` is the hard backstop against a race.
  return db.transaction(async (tx) => {
    const [{ count }] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(users);
    if (count > 0) return null;

    const [created] = await tx
      .insert(users)
      .values({
        googleSub: profile.sub,
        email: profile.email,
        name: profile.name ?? null,
        picture: profile.picture ?? null,
        role: 'superadmin',
        status: 'active',
        lastLoginAt: sql`now()`,
      })
      .returning();
    return created ?? null;
  });
}
