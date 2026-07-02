import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users, type User } from '@/db/schema';
import { decrypt, SESSION_COOKIE_NAME } from '@/lib/session';

/**
 * Data Access Layer — the authoritative auth check, run close to the data.
 * `proxy.ts` only does an optimistic cookie check; real authorization lives here.
 * Re-reading the user (and enforcing `status === 'active'`) on every request
 * means a deactivation takes effect immediately, without waiting for the JWT to expire.
 */

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const cookieStore = await cookies();
  const session = await decrypt(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  if (!session?.userId) return null;

  const [user] = await db.select().from(users).where(eq(users.id, session.userId));
  if (!user || user.status !== 'active') return null;
  return user;
});

export const requireUser = cache(async (): Promise<User> => {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return user;
});

export const requireSuperadmin = cache(async (): Promise<User> => {
  const user = await requireUser();
  if (user.role !== 'superadmin') redirect('/dashboard');
  return user;
});

/**
 * Enforce a user who can mutate data (guests, labels): `superadmin` or `admin`.
 * `viewer` is read-only, so it is redirected back to the dashboard. Use this in
 * every guest/label Server Action — hiding a button is UX, this is the real gate.
 */
export const requireEditor = cache(async (): Promise<User> => {
  const user = await requireUser();
  if (user.role === 'viewer') redirect('/dashboard');
  return user;
});

/** UI capability helpers — mirror the server gates so components render the right controls. */
export const canEdit = (role: User['role']): boolean => role !== 'viewer';
export const canManageUsers = (role: User['role']): boolean => role === 'superadmin';
export const canManageLabels = (role: User['role']): boolean => role !== 'viewer';
