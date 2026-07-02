import { getGuestByToken } from '@/lib/data';
import { RsvpForm } from '@/components/rsvp-form';

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
