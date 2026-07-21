import { Hero } from '@/components/letter/hero';
import { OurStory } from '@/components/letter/our-story';
import { DayItself } from '@/components/letter/day-itself';
import { AttireGuide } from '@/components/letter/attire-guide';
import { Location } from '@/components/letter/location';

/**
 * The long-form wedding letter — the page content that rises out of the
 * envelope. Each section lives in components/letter/; this file only
 * composes them. Hero, OurStory and DayItself are full-bleed and overlap
 * each other (see the -mt/z-index notes in those files).
 *
 * Sections after AttireGuide (photos, travel, stay, FAQ, registry, RSVP)
 * were removed — see git history to restore.
 */
export function WeddingLetter() {
  return (
    <div>
      <Hero />
      <OurStory />
      <DayItself />
      <AttireGuide />
      <Location />
    </div>
  );
}
