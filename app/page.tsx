import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { guests } from '@/db/schema';
import { RsvpForm } from '@/components/rsvp-form';

// Reads the invitee by token on every request; never prerendered at build.
export const dynamic = 'force-dynamic';

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

  const guest = token
    ? (
        await db
          .select({
            name: guests.name,
            maxGuests: guests.maxGuests,
            status: guests.status,
            token: guests.token,
          })
          .from(guests)
          .where(eq(guests.token, token))
      )[0]
    : undefined;

  return (
    <main style={{ maxWidth: 560, margin: '0 auto', padding: '3rem 1.5rem' }}>
      <h1>You&apos;re Invited</h1>

      {!guest ? (
        // Rule 3: no guest detected → hide the form.
        <p>
          Please open the personal RSVP link that was shared with you to respond.
        </p>
      ) : guest.status !== 'pending' ? (
        // Rule 6: already answered.
        <>
          <p>Hi {guest.name},</p>
          <p>You have already responded. Thank you!</p>
        </>
      ) : (
        <>
          {/* Rule 2: personalized greeting. */}
          <p>Hi {guest.name}, we&apos;d love to know if you can make it.</p>
          <RsvpForm token={guest.token} maxGuests={guest.maxGuests} />
        </>
      )}
    </main>
  );
}
