'use client';

import { motion, useReducedMotion } from 'motion/react';
import { AddToCalendar } from '@/components/letter/add-to-calendar';
import { Countdown } from '@/components/countdown';
import { VinylPlayer } from '@/components/letter/vinyl-player';

/**
 * Countdown band — the middle of ONE continuous ink background that runs Hero →
 * Countdown → Our Story. It paints nothing itself: the wrapper in
 * wedding-letter.tsx is `bg-ink`, the Hero's photo sits on that wrapper and
 * fades into the same ink as it scrolls, and Our Story carries it on. There is
 * no white dome here any more — the band used to be a white section between two
 * photos, and a hard colour change in the middle of the countdown is exactly
 * what the shared background exists to remove. Type is therefore WHITE on ink,
 * the same inversion Our Story uses.
 *
 * `-mt-48` (12rem) is kept: the Hero's sticky track is sized against that bite
 * (`h-[calc(150svh-12rem)]`), so it still governs where the pin hands over.
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
 * Colour is the letter's two-colour system inverted: white type on ink #1E2A18,
 * both at full strength. Nothing here is tinted — the count reads loudest because it
 * is the largest, not because everything around it was faded. Rank is carried by
 * size, face and weight only.
 */
export function CountdownBand() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="letter-on-ink relative z-10 -mt-48 px-gutter pt-28 pb-dome text-center sm:pt-32">
      <motion.div
        className="flex flex-col items-center"
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* The record sits in the dome's crown, above the count — the one
            playable thing on the page, and the only round shape in a section
            otherwise made of type. It is quiet until tapped: no autoplay,
            no spin. Sized to stay inside the dome's curve on a phone. */}
        <VinylPlayer className="mb-8" size="min(42vw, 10rem)" />

        {/* Quiet intro line — deliberately smaller than the count, so the
            section has one loud thing in it and not three. */}
        <h2 className="font-sans text-subhead text-white">
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
          className="mt-8 text-white"
          srSuffix="until we say I do"
          labelClassName="font-script text-title text-white"
          tickClassName="text-white"
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
