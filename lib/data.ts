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
    with: {
      guestLabels: { with: { label: true } },
      // Everyone a party is bringing, in the order the guest filled them in.
      companions: { orderBy: (c, { asc }) => [asc(c.kind), asc(c.position)] },
    },
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

/**
 * Invitee lookup for the public RSVP landing page (`?id=<token>`).
 *
 * Returns the guest's own reply as well as their invitation, so a guest who has
 * already answered is shown what was recorded instead of an empty form. Deliberately
 * NARROW: no `adminNote`, no admin-set contact, nothing the couple keeps to
 * themselves — only what this guest told us, read back to them.
 */
export async function getGuestByToken(token: string) {
  'use cache';
  cacheTag('guests');
  cacheLife('hours');
  return db.query.guests.findFirst({
    where: eq(guests.token, token),
    columns: {
      name: true,
      maxGuests: true,
      status: true,
      token: true,
      adults: true,
      kids: true,
      dietary: true,
      dietaryOther: true,
      guestNote: true,
      respondedAt: true,
    },
    with: {
      companions: {
        columns: { kind: true, position: true, name: true, dietary: true, dietaryOther: true },
        orderBy: (c, { asc }) => [asc(c.kind), asc(c.position)],
      },
    },
  });
}

/** The reply a guest sees read back to them, and what the letter renders. */
export type GuestReply = NonNullable<Awaited<ReturnType<typeof getGuestByToken>>>;
