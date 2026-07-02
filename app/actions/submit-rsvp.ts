'use server';

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
 * Input: FormData carrying `token`, `status` (`going`|`not_going`), optional
 * `partySize`, optional `guestNote`. Re-validated server-side — the client is
 * never trusted. The `token` (capability link) identifies the invitee row.
 *
 * Behaviour:
 * - Unknown token → `{ ok: false, error }`.
 * - Already answered (status not `pending`) → `{ ok: false, error }` (no overwrite).
 * - `going`: requires `partySize` in 1..maxGuests.
 * - `not_going`: `partySize` forced to null.
 *
 * On success writes status/partySize/guestNote/respondedAt and returns `{ ok: true }`.
 */
export async function submitRsvp(
  _prev: RsvpState,
  formData: FormData,
): Promise<RsvpState> {
  const parsed = rsvpResponseSchema.safeParse({
    token: formData.get('token'),
    status: formData.get('status'),
    partySize: formData.get('partySize'),
    guestNote: formData.get('guestNote'),
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

  let partySize: number | null = null;
  if (input.status === 'going') {
    if (input.partySize == null) {
      return { ok: false, fieldErrors: { partySize: 'How many are attending?' } };
    }
    if (input.partySize > guest.maxGuests) {
      return {
        ok: false,
        fieldErrors: {
          partySize: `Only ${guest.maxGuests} seat(s) are reserved for you.`,
        },
      };
    }
    partySize = input.partySize;
  }

  await db
    .update(guests)
    .set({
      status: input.status,
      partySize,
      guestNote: input.guestNote ?? null,
      respondedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(guests.id, guest.id));

  return { ok: true };
}
