'use client';

import { motion, useReducedMotion } from 'motion/react';
import { AddToCalendar } from '@/components/letter/add-to-calendar';
import { Countdown } from '@/components/countdown';

/**
 * Countdown band — white section between Hero and Our Story. Its top is a
 * REVERSED DOME: the Hero's dark field extends down INTO this white section as
 * a shallow black arch, the mirror of Our Story's white-into-ink dome below.
 * The arch is edge-to-edge, deepest at centre, tapering to the seam at both
 * sides, so the dark photo above reads as spilling over the top. Black (not
 * ink) so the overlay carries no green cast.
 * Its bottom is still a DOME too: Our Story's ink dome rises into the bottom
 * padding.
 *
 * Top: `pt-44 sm:pt-28` seats the first line clear of the arch's deepest point.
 * The arch is shallower on wider screens — a 7.5rem ellipse dome on mobile, a
 * low 4rem soft curve from `sm` up — so the desktop padding is the smaller.
 *
 * Bottom: `pb-dome` gives Our Story room to rise into. Our Story keeps its own
 * `-mt-48` (12rem), so the ink dome overlaps only this white bottom padding,
 * never the countdown text. `pb-dome` (app/globals.css) is that 12rem plus one
 * `section` of breathing room, so what stays visible below the count is exactly
 * one section's worth — the same gap Prenup and RSVP leave on their domes.
 *
 * The section speaks one sentence, and the number is a word in it: the day
 * count is the display element and the script line finishes the thought. There
 * is deliberately no separate "Counting down to the day" heading above it — a
 * title plus a number plus a label was three things saying one thing, which is
 * what made the block read as a stat readout rather than a letter.
 *
 * Colour is the letter's two-colour system: white paper and ink #1E2A18, both
 * at full strength. Nothing here is tinted — the count reads loudest because it
 * is the largest, not because everything around it was faded. Rank is carried by
 * size, face and weight only.
 */
export function CountdownBand() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative z-10 bg-paper px-gutter pt-44 pb-dome text-center sm:pt-28">
      {/* Reversed dome: a black arch hanging from the very top of the band so
          the Hero's dark field reads as spilling down into this section.
          `top-0` + `-mt-px` overlaps the seam 1px so no hairline shows; z-10
          (with the section's relative) keeps it over the white paper but under
          the countdown text (which clears it via the section's `pt`).

          - Mobile: a CSS ellipse arch (bottom corners rounded full-height), the
            deep dome that already reads well on a narrow screen.
          - sm+: a soft, low continuous curve. Horizontal radius stays 50% so
            the two bottom corners meet at the centre (one unbroken curve, no
            flat middle), but the vertical radius (3rem) is LESS than the height
            (4rem) so the edges keep ~1rem of body and round off instead of
            tapering to a sharp point the way a full-height ellipse does when
            stretched wide. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -mt-px z-10 h-[7.5rem] rounded-[0_0_50%_50%_/_0_0_7.5rem_7.5rem] bg-black sm:hidden"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -mt-px z-10 hidden h-[4rem] rounded-[0_0_50%_50%_/_0_0_3rem_3rem] bg-black sm:block"
      />
      <motion.div
        className="flex flex-col items-center"
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Quiet intro line — deliberately smaller than the count, so the
            section has one loud thing in it and not three. */}
        <h2 className="font-sans text-subhead text-ink">
          counting down to the day
        </h2>

        {/* The row and the script line are one sentence: `Countdown` renders
            the four-unit serif line, then this script label completes it. The
            intro above and the date below are both serif, like the count — the
            script is kept for the two lines that speak (the ring on the record
            and "until we say I do"), so rank comes from size, not face. */}
        <Countdown
          align="center"
          size="lg"
          className="mt-8 text-ink"
          srSuffix="until we say I do"
          labelClassName="font-script text-title text-ink"
          tickClassName="text-ink"
          label="until we say I do"
        />

        {/* The one action in the band: put the date somewhere it won't be
            forgotten. Outlined rather than filled so the day count stays the
            loudest thing on the section. */}
        <AddToCalendar className="mt-12" />
      </motion.div>
    </section>
  );
}
