import { Suspense } from 'react';
import { getGuestByToken } from '@/lib/data';
import { RsvpForm } from '@/components/rsvp-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

/**
 * RSVP — the closing section (after Location). Solid deep forest green
 * (#2C3F25, matching Our Story) sits behind a single white Card holding the
 * reply form.
 *
 * Token-driven per docs/rsvp-spec.md: the personal invite link is `?id=<token>`.
 * The card shows one of three states — the form (pending reply), a thank-you
 * (already answered), or a note to open the personal link (no / unknown token).
 * Reading `searchParams` is a request-time API, so `RsvpBody` is dynamic and
 * lives under <Suspense> (the striped shell + card frame prerender; only the
 * body streams).
 */
export function Rsvp({ searchParams }: { searchParams: SearchParams }) {
  return (
    <section className="relative bg-[#2C3F25] px-6 py-24 sm:px-9">
      <div className="mx-auto max-w-[min(90%,32rem)]">
        <div className="text-center">
          <h2 className="font-script text-4xl leading-tight text-[#91A17C] sm:text-5xl">
            Will you join us?
          </h2>
          <p className="mt-2 font-countdown text-sm tracking-wide text-[#f5efdd]">
            RSVP
          </p>
        </div>

        <Card className="mt-10 px-2 py-8 shadow-[0_28px_60px_-30px_rgba(85,109,71,0.5)] sm:px-6">
          <Suspense fallback={<RsvpBodyFallback />}>
            <RsvpBody searchParams={searchParams} />
          </Suspense>
        </Card>
      </div>
    </section>
  );
}

/** Skeleton shown while the token-dependent body streams in. */
function RsvpBodyFallback() {
  return (
    <CardContent className="py-10 text-center text-muted-foreground" aria-hidden>
      <p className="font-heading text-lg">Loading your invitation…</p>
    </CardContent>
  );
}

/** Resolves the `?id=<token>` guest and renders the matching state. Dynamic. */
async function RsvpBody({ searchParams }: { searchParams: SearchParams }) {
  const raw = (await searchParams).id;
  const token = Array.isArray(raw) ? raw[0] : raw;
  const guest = token ? await getGuestByToken(token) : undefined;

  // No token, or a token we don't recognise — the reply is by personal link.
  if (!guest) {
    return (
      <CardContent className="py-6 text-center">
        <p className="font-heading text-xl text-foreground">
          Reply by your personal link
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          This RSVP is by invitation. Please open the personal link we sent you
          to let us know if you can make it.
        </p>
      </CardContent>
    );
  }

  // Already answered — don't offer to overwrite (mirrors submitRsvp's guard).
  if (guest.status !== 'pending') {
    return (
      <CardContent className="py-8 text-center">
        <p className="font-script text-4xl text-[color:var(--script)]">
          Thank you
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          We&rsquo;ve already recorded your reply
          {guest.name ? `, ${guest.name}` : ''}. Reach out to us if anything has
          changed.
        </p>
      </CardContent>
    );
  }

  // Pending — show the reply form.
  return (
    <>
      <CardHeader className="text-center">
        <CardTitle className="font-heading text-xl">
          {guest.name ? `Dear ${guest.name},` : 'Kindly reply'}
        </CardTitle>
        <CardDescription>
          We&rsquo;d be honoured to have you celebrate with us.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RsvpForm token={guest.token} maxGuests={guest.maxGuests} />
      </CardContent>
    </>
  );
}
