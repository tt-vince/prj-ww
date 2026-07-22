import { Hero } from '@/components/letter/hero';
import { OurStory } from '@/components/letter/our-story';
import { DayItself } from '@/components/letter/day-itself';
import { AttireGuide } from '@/components/letter/attire-guide';
import { Location } from '@/components/letter/location';
import { Hotels } from '@/components/letter/hotels';
import { Rsvp } from '@/components/letter/rsvp';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

/**
 * The long-form wedding letter — the page content revealed by the envelope
 * intro (components/envelope-reveal.tsx). Each section lives in
 * components/letter/; this file only composes them. Hero, OurStory and
 * DayItself are full-bleed and overlap each other (see the -mt/z-index notes
 * in those files). It is ordinary document flow and scrolls natively — the
 * reveal is a one-shot CSS intro with no scroll coupling, so sections can be
 * added/reordered freely. `searchParams` is forwarded (not awaited).
 */
export function WeddingLetter({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div>
      <Hero />
      <OurStory />
      <DayItself />
      <AttireGuide />
      <Location />
      <Hotels />
      <Rsvp searchParams={searchParams} />
    </div>
  );
}
