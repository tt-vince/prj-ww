'use server';

import { updateTag } from 'next/cache';
import { eq, sql } from 'drizzle-orm';
import { db } from '@/db';
import { companions, guests } from '@/db/schema';
import {
  collectCompanions,
  companionsSchema,
  rsvpResponseSchema,
} from '@/lib/validation';

/** Result of the RSVP submission, consumed via `useActionState` on the form. */
export type RsvpState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

/**
 * Records a guest's RSVP reply.
 *
 * Input: FormData carrying `token`, `status` (`going`|`not_going`), `adults`,
 * `kids`, optional `email`/`phone`/`guestNote`, the invitee's own
 * `dietary`/`dietaryOther`, and one group of `companion.<kind>-<n>.*` fields per
 * person they are bringing. Re-validated server-side — the client is never
 * trusted. The `token` (capability link) identifies the row.
 *
 * Behaviour:
 * - Unknown token → `{ ok: false, error }`.
 * - Already answered (status not `pending`) → `{ ok: false, error }` (no overwrite).
 * - `going`: requires `adults` ≥ 1, `adults + kids` ≤ maxGuests, and exactly one
 *   named companion per seat beyond the invitee (`adults - 1` adults + `kids`
 *   kids). A party that does not add up is rejected rather than half-recorded.
 * - `not_going`: `adults`/`kids` forced to null, dietary cleared, no companions.
 *
 * On success writes status/adults/kids/guestNote/dietary/dietaryOther/respondedAt
 * plus the companion rows, and returns `{ ok: true }`.
 *
 * Companions are upserted on `(guest_id, kind, position)` BEFORE the guest row
 * flips off `pending`: the neon-http driver has no interactive transaction, so
 * this order means a failure between the two writes leaves the reply re-sendable
 * and a retry heals itself instead of doubling the party.
 */
export async function submitRsvp(
  _prev: RsvpState,
  formData: FormData,
): Promise<RsvpState> {
  const parsed = rsvpResponseSchema.safeParse({
    token: formData.get('token'),
    status: formData.get('status'),
    adults: formData.get('adults'),
    kids: formData.get('kids'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    guestNote: formData.get('guestNote'),
    dietary: formData.getAll('dietary'),
    dietaryOther: formData.get('dietaryOther'),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? 'form');
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, fieldErrors };
  }
  const input = parsed.data;

  const parsedCompanions = companionsSchema.safeParse(
    collectCompanions(formData),
  );
  if (!parsedCompanions.success) {
    return {
      ok: false,
      error: 'Please check the names of everyone you are bringing.',
    };
  }

  const [guest] = await db
    .select({ id: guests.id, status: guests.status, maxGuests: guests.maxGuests })
    .from(guests)
    .where(eq(guests.token, input.token));

  if (!guest) return { ok: false, error: 'This invite link is not valid.' };
  if (guest.status !== 'pending') {
    return { ok: false, error: 'You have already responded.' };
  }

  let adults: number | null = null;
  let kids: number | null = null;
  if (input.status === 'going') {
    if (input.adults == null) {
      return { ok: false, fieldErrors: { adults: 'How many adults are attending?' } };
    }
    if (input.adults + input.kids > guest.maxGuests) {
      return {
        ok: false,
        fieldErrors: {
          adults: `Only ${guest.maxGuests} seat(s) are reserved for you.`,
        },
      };
    }
    adults = input.adults;
    kids = input.kids;
  }

  // The party has to add up: one named companion for every seat beyond the
  // invitee. A decline carries nobody.
  const party = input.status === 'going' ? parsedCompanions.data : [];
  if (input.status === 'going') {
    const expectedAdults = (adults ?? 1) - 1;
    const expectedKids = kids ?? 0;
    const gotAdults = party.filter((c) => c.kind === 'adult').length;
    const gotKids = party.filter((c) => c.kind === 'kid').length;
    if (gotAdults !== expectedAdults || gotKids !== expectedKids) {
      return {
        ok: false,
        error:
          'Please give us a name for everyone in your party before sending.',
      };
    }
  }

  // Dietary only applies to a `going` reply; a decline clears it.
  const dietary = input.status === 'going' ? input.dietary : [];
  const dietaryOther =
    input.status === 'going' ? (input.dietaryOther ?? null) : null;

  const updates: Partial<typeof guests.$inferInsert> = {
    status: input.status,
    adults,
    kids,
    guestNote: input.guestNote ?? null,
    dietary,
    dietaryOther,
    respondedAt: new Date(),
    updatedAt: new Date(),
    // Only overwrite contact when the guest supplied it — keep admin-set values otherwise.
    ...(input.email ? { email: input.email } : {}),
    ...(input.phone ? { phone: input.phone } : {}),
  };

  if (party.length > 0) {
    await db
      .insert(companions)
      .values(
        party.map((c) => ({
          guestId: guest.id,
          kind: c.kind,
          position: c.position,
          name: c.name,
          dietary: c.dietary,
          dietaryOther: c.dietaryOther ?? null,
        })),
      )
      .onConflictDoUpdate({
        target: [companions.guestId, companions.kind, companions.position],
        set: {
          name: sql`excluded.name`,
          dietary: sql`excluded.dietary`,
          dietaryOther: sql`excluded.dietary_other`,
          updatedAt: new Date(),
        },
      });
  }

  await db.update(guests).set(updates).where(eq(guests.id, guest.id));

  // Refresh the admin dashboard and this token's own cached lookup.
  updateTag('guests');

  return { ok: true };
}
