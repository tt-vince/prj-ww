import { Hero } from '@/components/letter/hero';
import { OurStory } from '@/components/letter/our-story';
import { DayItself } from '@/components/letter/day-itself';
import { AttireGuide } from '@/components/letter/attire-guide';
import { Location } from '@/components/letter/location';
import { Rsvp } from '@/components/letter/rsvp';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

/**
 * The long-form wedding letter — the page content that rises out of the
 * envelope. Each section lives in components/letter/; this file only
 * composes them. Hero, OurStory and DayItself are full-bleed and overlap
 * each other (see the -mt/z-index notes in those files).
 *
 * The closing Rsvp section MUST stay inside the letter: the reveal's
 * compositor animations use `scroll(root)` timelines calibrated to the
 * reveal-track being the whole scrollable document, so any content rendered
 * *after* the reveal lengthens the scroll and the reveal never completes (the
 * envelope stalls part-descended). `searchParams` is forwarded (not awaited).
 */
export function WeddingLetter({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div>
      <Hero />
      <OurStory />
      <DayItself />
      <AttireGuide />
      <Location />
      <Rsvp searchParams={searchParams} />
    </div>
  );
}
