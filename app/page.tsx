import { getGuestByToken } from '@/lib/data';
import { RsvpForm } from '@/components/rsvp-form';
import { EnvelopeReveal } from '@/components/envelope-reveal';
import { WeddingLetter } from '@/components/wedding-letter';

/**
 * Landing page = the RSVP questionnaire. The invitee is identified by the
 * `?id=<token>` capability link. No token / unknown token → the form is hidden.
 * Already-answered invitees see a confirmation instead of the form.
 */
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id: token } = await searchParams;

  const guest = token ? await getGuestByToken(token) : undefined;

  return (
    <main>
      {/* Vinyl intro hidden for now — components/vinyl-player.tsx kept for reuse. */}
      <EnvelopeReveal>
        {/* Long wedding-website letter; the token-dependent RSVP content below
            renders inside its final “RSVP” section. */}
        <WeddingLetter>
          {!guest ? (
            // Rule 3: no guest / unknown token → greeting instead of the form.
            <div className="text-center">
              <p className="font-script text-4xl leading-tight text-[color:var(--script)]">
                You&apos;re Invited
              </p>
              <p className="mt-4 text-muted-foreground">
                This link is missing your personal code, so we can&apos;t tell
                who you are. Please use the RSVP link from your invitation to
                respond.
              </p>
            </div>
          ) : guest.status !== 'pending' ? (
            // Rule 6: already answered.
            <div className="mt-6 text-center">
              <p className="font-heading text-2xl text-foreground">
                Hi {guest.name},
              </p>
              <p className="mt-2 text-muted-foreground">
                You have already responded. Thank you!
              </p>
            </div>
          ) : (
            <>
              {/* Rule 2: personalized greeting. */}
              <p className="mt-4 text-center font-heading text-2xl leading-snug text-foreground">
                Hi {guest.name}, we&apos;d love to know if you can make it.
              </p>
              <div className="mt-8">
                <RsvpForm token={guest.token} maxGuests={guest.maxGuests} />
              </div>
            </>
          )}
        </WeddingLetter>
      </EnvelopeReveal>
    </main>
  );
}
