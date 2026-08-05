import { OpeningBackdrop } from '@/components/letter/opening-backdrop';
import { OurStory } from '@/components/letter/our-story';
import { Prenup } from '@/components/letter/prenup';
import { DayItself } from '@/components/letter/day-itself';
import { AttireGuide } from '@/components/letter/attire-guide';
import { Location } from '@/components/letter/location';
import { Hotels } from '@/components/letter/hotels';
import { Rsvp } from '@/components/letter/rsvp';
import { Gifts } from '@/components/letter/gifts';
import { Faq } from '@/components/letter/faq';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

/**
 * The long-form wedding site content. Each section lives in
 * components/letter/; this file only composes them. Hero, OurStory and
 * DayItself are full-bleed and overlap each other (see the -mt/z-index notes
 * in those files). It is ordinary document flow and scrolls natively, so
 * sections can be added/reordered freely. `searchParams` is forwarded (not
 * awaited). The former envelope intro (components/letter/envelope-reveal.tsx) no
 * longer wraps this content but is kept for reuse.
 *
 * `letter-theme` (app/globals.css) scopes the home page to its two-colour
 * system — white paper, #1E2A18 ink — by re-pointing the shadcn tokens for this
 * subtree only. The dashboard keeps the wisteria & fig palette.
 */
export function WeddingLetter({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="letter-theme bg-paper text-ink">
      {/* Hero + CountdownBand, on one background that arrives at Our Story's
          green: the lily photo spans both and its overlay drives from a dark
          scrim to solid ink across the whole opening, so the countdown still
          sits on a greening photo and only Our Story is completely green (see
          opening-backdrop.tsx). It stops before Our Story on purpose: Our Story
          keeps its own `bg-ink`, so its rounded BOTTOM dome still curves against
          the paper Prenup section below. */}
      <OpeningBackdrop />
      <OurStory />
      <Prenup />
      <DayItself />
      <AttireGuide />
      <Location />
      <Hotels />
      <Rsvp searchParams={searchParams} />
      <Gifts />
      <Faq />
    </div>
  );
}
