import { EnvelopeReveal } from '@/components/envelope-reveal';
import { WeddingLetter } from '@/components/wedding-letter';

/**
 * Landing page — the wedding letter inside the envelope reveal.
 *
 * NOTE: the token-dependent RSVP section (`?id=<token>` → greeting / form /
 * already-answered states, per docs/rsvp-spec.md) was removed together with
 * the letter's RSVP section. components/rsvp-form.tsx and lib/data.ts are
 * untouched; see git history of this file to restore the wiring.
 */
export default function Home() {
  return (
    <main>
      {/* Vinyl intro hidden for now — components/vinyl-player.tsx kept for reuse. */}
      <EnvelopeReveal>
        <WeddingLetter />
      </EnvelopeReveal>
    </main>
  );
}
