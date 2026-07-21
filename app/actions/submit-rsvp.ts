'use server';

import { updateTag } from 'next/cache';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { guests } from '@/db/schema';
import { rsvpResponseSchema } from '@/lib/validation';

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
 * `kids`, optional `email`/`phone`/`guestNote`. Re-validated server-side — the
 * client is never trusted. The `token` (capability link) identifies the row.
 *
 * Behaviour:
 * - Unknown token → `{ ok: false, error }`.
 * - Already answered (status not `pending`) → `{ ok: false, error }` (no overwrite).
 * - `going`: requires `adults` ≥ 1 and `adults + kids` ≤ maxGuests.
 * - `not_going`: `adults`/`kids` forced to null and dietary cleared.
 *
 * On success writes status/adults/kids/guestNote/dietary/dietaryOther/respondedAt
 * and returns `{ ok: true }`.
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

  await db.update(guests).set(updates).where(eq(guests.id, guest.id));

  // Refresh the admin dashboard and this token's own cached lookup.
  updateTag('guests');

  return { ok: true };
}
