'use client';

import { useActionState, useState } from 'react';
import { submitRsvp, type RsvpState } from '@/app/actions/submit-rsvp';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

const initial: RsvpState = { ok: false };

/**
 * Public RSVP form for a single invitee, styled in the "wisteria & fig" system
 * to sit on the reveal letter. `token` is the capability link id (`?id=<token>`);
 * `maxGuests` bounds the party-size selector. On a successful reply it swaps to
 * a thank-you message.
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
      <div role="status" className="py-6 text-center">
        <p className="font-script text-4xl text-[color:var(--script)]">
          Thank you
        </p>
        <p className="mt-3 text-muted-foreground">
          Your RSVP has been recorded.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-7">
      <input type="hidden" name="token" value={token} />

      {/* Attendance choice — two selectable cards backed by native radios. */}
      <fieldset className="space-y-2">
        <legend className="mb-3 text-center font-heading text-lg text-foreground">
          Will you attend?
        </legend>
        <div className="grid gap-2.5">
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-input px-4 py-3 text-sm transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50">
            <input
              type="radio"
              name="status"
              value="going"
              checked={status === 'going'}
              onChange={() => setStatus('going')}
              required
              className="size-4 accent-[color:var(--primary)]"
            />
            <span className="font-medium">Joyfully accept</span>
          </label>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-input px-4 py-3 text-sm transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50">
            <input
              type="radio"
              name="status"
              value="not_going"
              checked={status === 'not_going'}
              onChange={() => setStatus('not_going')}
              className="size-4 accent-[color:var(--primary)]"
            />
            <span className="font-medium">Regretfully decline</span>
          </label>
        </div>
      </fieldset>

      {status === 'going' && (
        <>
          <Separator />
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="adults">Adults</Label>
                <Input
                  id="adults"
                  name="adults"
                  type="number"
                  min={1}
                  max={maxGuests}
                  value={adults}
                  onChange={(e) => setAdults(Number(e.target.value) || 0)}
                  required
                  aria-invalid={!!state.fieldErrors?.adults}
                />
                {state.fieldErrors?.adults && (
                  <span role="alert" className="text-xs text-destructive">
                    {state.fieldErrors.adults}
                  </span>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="kids">Kids</Label>
                <Input
                  id="kids"
                  name="kids"
                  type="number"
                  min={0}
                  max={maxGuests}
                  value={kids}
                  onChange={(e) => setKids(Number(e.target.value) || 0)}
                  aria-invalid={!!state.fieldErrors?.kids}
                />
                {state.fieldErrors?.kids && (
                  <span role="alert" className="text-xs text-destructive">
                    {state.fieldErrors.kids}
                  </span>
                )}
              </div>
            </div>
            <p
              aria-live="polite"
              className={
                overCapacity
                  ? 'text-sm text-destructive'
                  : 'text-sm text-muted-foreground'
              }
            >
              Party size: {partySize} of {maxGuests} seat(s) reserved.
              {overCapacity && ' — that exceeds your allotment.'}
            </p>
          </div>
        </>
      )}

      <Separator />

      {/* Optional contact details. */}
      <div className="space-y-4">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Contact details (optional)
        </p>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            maxLength={200}
            aria-invalid={!!state.fieldErrors?.email}
          />
          {state.fieldErrors?.email && (
            <span role="alert" className="text-xs text-destructive">
              {state.fieldErrors.email}
            </span>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            maxLength={30}
            aria-invalid={!!state.fieldErrors?.phone}
          />
          {state.fieldErrors?.phone && (
            <span role="alert" className="text-xs text-destructive">
              {state.fieldErrors.phone}
            </span>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="guestNote">Message for the couple (optional)</Label>
          <Textarea id="guestNote" name="guestNote" rows={3} maxLength={1000} />
        </div>
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={pending || status === '' || overCapacity}
        className="h-11 w-full text-base"
      >
        {pending ? 'Sending…' : 'Send RSVP'}
      </Button>
    </form>
  );
}
