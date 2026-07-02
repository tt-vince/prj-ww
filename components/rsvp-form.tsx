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
        <p>
          <label htmlFor="partySize">
            Number attending (max {maxGuests})
          </label>
          <input
            id="partySize"
            name="partySize"
            type="number"
            min={1}
            max={maxGuests}
            defaultValue={1}
            required
          />
          {state.fieldErrors?.partySize && (
            <span role="alert">{state.fieldErrors.partySize}</span>
          )}
        </p>
      )}

      <p>
        <label htmlFor="guestNote">Message for the couple (optional)</label>
        <textarea id="guestNote" name="guestNote" rows={3} maxLength={1000} />
      </p>

      {state.error && <p role="alert">{state.error}</p>}

      <button type="submit" disabled={pending || status === ''}>
        {pending ? 'Sending…' : 'Send RSVP'}
      </button>
    </form>
  );
}
