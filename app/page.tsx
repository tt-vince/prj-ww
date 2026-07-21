import { EnvelopeReveal } from '@/components/envelope-reveal';
import { WeddingLetter } from '@/components/wedding-letter';

/**
 * Landing page — the wedding letter inside the envelope reveal.
 *
 * The `searchParams` promise (carrying the `?id=<token>` invite link) is
 * forwarded, unawaited, into the letter's closing RSVP section, which awaits
 * it under its own <Suspense>. The page itself reads nothing request-time, so
 * the envelope + letter shell stays statically prerendered (Cache Components /
 * PPR) and only the RSVP body streams in. See docs/rsvp-spec.md.
 */
export default function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <main>
      {/* Vinyl intro hidden for now — components/vinyl-player.tsx kept for reuse. */}
      <EnvelopeReveal>
        <WeddingLetter searchParams={searchParams} />
      </EnvelopeReveal>
    </main>
  );
}
