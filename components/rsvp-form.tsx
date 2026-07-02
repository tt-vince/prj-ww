'use client';

import { useActionState, useState } from 'react';
import { submitRsvp, type RsvpState } from '@/app/actions/submit-rsvp';

const initial: RsvpState = { ok: false };

/**
 * Public RSVP form for a single invitee. `token` is the capability link id
 * (`?id=<token>`); `maxGuests` bounds the party-size selector. On a successful
 * reply it swaps to a thank-you message.
 */
export function RsvpForm({ token, maxGuests }: { token: string; maxGuests: number }) {
  const [state, action, pending] = useActionState(submitRsvp, initial);
  const [status, setStatus] = useState<'going' | 'not_going' | ''>('');
  const [adults, setAdults] = useState(1);
  const [kids, setKids] = useState(0);
  const partySize = adults + kids;
  const overCapacity = status === 'going' && partySize > maxGuests;

  if (state.ok) {
    return (
      <p role="status">Thanks! Your RSVP has been recorded.</p>
    );
  }

  return (
    <form action={action}>
      <input type="hidden" name="token" value={token} />

      <fieldset>
        <legend>Will you attend?</legend>
        <label>
          <input
            type="radio"
            name="status"
            value="going"
            checked={status === 'going'}
            onChange={() => setStatus('going')}
            required
          />{' '}
          Joyfully accept
        </label>
        <label>
          <input
            type="radio"
            name="status"
            value="not_going"
            checked={status === 'not_going'}
            onChange={() => setStatus('not_going')}
          />{' '}
          Regretfully decline
        </label>
      </fieldset>

      {status === 'going' && (
        <>
          <p>
            <label htmlFor="adults">Adults attending</label>
            <input
              id="adults"
              name="adults"
              type="number"
              min={1}
              max={maxGuests}
              value={adults}
              onChange={(e) => setAdults(Number(e.target.value) || 0)}
              required
            />
            {state.fieldErrors?.adults && (
              <span role="alert">{state.fieldErrors.adults}</span>
            )}
          </p>
          <p>
            <label htmlFor="kids">Kids attending</label>
            <input
              id="kids"
              name="kids"
              type="number"
              min={0}
              max={maxGuests}
              value={kids}
              onChange={(e) => setKids(Number(e.target.value) || 0)}
            />
            {state.fieldErrors?.kids && (
              <span role="alert">{state.fieldErrors.kids}</span>
            )}
          </p>
          <p aria-live="polite">
            Party size: {partySize} of {maxGuests} seat(s) reserved.
            {overCapacity && (
              <span role="alert"> — that exceeds your allotment.</span>
            )}
          </p>
        </>
      )}

      <fieldset>
        <legend>Your contact details (optional)</legend>
        <p>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" maxLength={200} />
          {state.fieldErrors?.email && (
            <span role="alert">{state.fieldErrors.email}</span>
          )}
        </p>
        <p>
          <label htmlFor="phone">Phone</label>
          <input id="phone" name="phone" type="tel" maxLength={30} />
          {state.fieldErrors?.phone && (
            <span role="alert">{state.fieldErrors.phone}</span>
          )}
        </p>
      </fieldset>

      <p>
        <label htmlFor="guestNote">Message for the couple (optional)</label>
        <textarea id="guestNote" name="guestNote" rows={3} maxLength={1000} />
      </p>

      {state.error && <p role="alert">{state.error}</p>}

      <button type="submit" disabled={pending || status === '' || overCapacity}>
        {pending ? 'Sending…' : 'Send RSVP'}
      </button>
    </form>
  );
}
