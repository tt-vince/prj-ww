import 'server-only';
import { cacheLife, cacheTag } from 'next/cache';
import { asc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { guests, labels, users, type User } from '@/db/schema';

/**
 * Cached query layer (`'use cache'`). Each function is tagged so mutations can
 * invalidate precisely via `updateTag`/`revalidateTag` — see the tag table in
 * docs/rsvp-spec.md §8. Never read `cookies()`/`headers()` here; auth belongs
 * to the callers (`lib/dal.ts` and the protected pages).
 */

export async function getGuestsWithLabels() {
  'use cache';
  cacheTag('guests', 'labels');
  cacheLife('days');
  return db.query.guests.findMany({
    with: { guestLabels: { with: { label: true } } },
    orderBy: (g, { desc }) => [desc(g.createdAt)],
  });
}

export async function getAllLabels() {
  'use cache';
  cacheTag('labels');
  cacheLife('days');
  return db.select().from(labels).orderBy(labels.name);
}

export async function getUsers() {
  'use cache';
  cacheTag('users');
  cacheLife('days');
  return db.select().from(users).orderBy(asc(users.createdAt));
}

/**
 * Auth lookup for the DAL. Tag invalidation covers in-app changes
 * (activate/deactivate, login profile refresh); the short TTL is the safety
 * net for out-of-band SQL edits, which bypass tags.
 */
export async function getUserById(userId: string): Promise<User | null> {
  'use cache';
  cacheTag(`user:${userId}`);
  cacheLife('minutes');
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  return user ?? null;
}

/** Invitee lookup for the public RSVP landing page (`?id=<token>`). */
export async function getGuestByToken(token: string) {
  'use cache';
  cacheTag('guests');
  cacheLife('hours');
  const [guest] = await db
    .select({
      name: guests.name,
      maxGuests: guests.maxGuests,
      status: guests.status,
      token: guests.token,
    })
    .from(guests)
    .where(eq(guests.token, token));
  return guest;
}
