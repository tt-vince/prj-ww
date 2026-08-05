'use client';

import { motion, useReducedMotion } from 'motion/react';
import { AddToCalendar } from '@/components/letter/add-to-calendar';
import { Countdown } from '@/components/countdown';

/**
 * Countdown band — the middle of ONE continuous ink background that runs Hero →
 * Countdown → Our Story. It paints nothing itself: the wrapper in
 * wedding-letter.tsx is `bg-ink`, the Hero's photo sits on that wrapper and
 * fades into the same ink as it scrolls, and Our Story carries it on. Type is
 * therefore PAPER on ink, the same inversion Our Story uses.
 *
 * Neither the old white dome nor the reversed black arch that replaced it
 * survives: both existed to disguise a hard colour change in the middle of the
 * countdown, and the shared ink field removes the colour change itself. The top
 * is a plain flush seam at the Hero's bottom edge, where the pin releases, and
 * `pt-28 sm:pt-32` seats the first line clear of it.
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
 * Colour is the letter's two-colour system inverted: paper type on ink #0A110E,
 * both at full strength. Nothing here is tinted — the count reads loudest because it
 * is the largest, not because everything around it was faded. Rank is carried by
 * size, face and weight only.
 */
export function CountdownBand() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="letter-on-ink relative z-10 px-gutter pt-28 pb-dome text-center sm:pt-32">
      <motion.div
        className="flex flex-col items-center"
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Quiet intro line — deliberately smaller than the count, so the
            section has one loud thing in it and not three. */}
        <h2 className="font-sans text-subhead text-paper">
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
          className="mt-8 text-paper"
          srSuffix="until we say I do"
          labelClassName="font-script text-title text-paper"
          tickClassName="text-paper"
          label="until we say I do"
        />

        {/* The one action in the band: put the date somewhere it won't be
            forgotten. Outlined rather than filled so the day count stays the
            loudest thing on the section. */}
        <AddToCalendar className="mt-12" variant="outlineOnInk" />
      </motion.div>
    </section>
  );
}
