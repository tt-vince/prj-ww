import { Hero } from '@/components/letter/hero';
import { OurStory } from '@/components/letter/our-story';
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
 * awaited). The former envelope intro (components/envelope-reveal.tsx) no
 * longer wraps this content but is kept for reuse.
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
      <Gifts />
      <Faq />
    </div>
  );
}
