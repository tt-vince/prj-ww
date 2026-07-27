'use client';

import { motion, useReducedMotion } from 'motion/react';
import { AddToCalendar } from '@/components/letter/add-to-calendar';
import { Countdown } from '@/components/countdown';
import { VinylPlayer } from '@/components/vinyl-player';
import { cn } from '@/lib/utils';

/**
 * Countdown band — white section between Hero and Our Story. It is a DOME at
 * both ends: its own white dome rises `-mt-48` (12rem) into the Hero's lily
 * photo (the Hero renders a 12rem strip of continued photo for it to sit in),
 * and Our Story's ink dome rises into its bottom padding.
 *
 * Top: `border-radius: 50% 50% 0 0 / 180px 180px 0 0` — the apex touches the
 * element's top edge at centre and the shoulders fall away, so the lily photo
 * stays visible either side instead of ending on a hard horizontal seam.
 * Padding is `pt-28 sm:pt-32`, the same pair Our Story uses inside its dome, so
 * both domes seat their first line at the same depth under the curve.
 *
 * Bottom: `pb-72` gives Our Story room to rise into. Our Story keeps its own
 * `-mt-48` (12rem), so the ink dome overlaps only this white bottom padding,
 * never the countdown text.
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
    <section className="relative z-10 -mt-48 rounded-[50%_50%_0_0_/_180px_180px_0_0] bg-white px-5 pt-28 pb-72 text-center sm:px-9 sm:pt-32">
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
        <h2 className="font-sans text-xl leading-tight text-ink sm:text-2xl">
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
          labelClassName="font-script text-[2.75rem] leading-tight text-ink sm:text-[3.125rem]"
          tickClassName="text-ink"
          label="until we say I do"
        />

        {/* Hand-drawn rope heart closing the sentence — a full stop after "until
            we say I do", the way the wedding rings close the Our Story thread.
            The asset ships as pure black, and the letter has no black in it, so
            it is painted through a CSS mask in ink #1E2A18. Aspect ratio is the
            viewBox's (91.7109 x 89.9102). */}
        {/* <RopeHeart className="mt-6 w-24 sm:w-24" /> */}

        {/* The one action in the band: put the date somewhere it won't be
            forgotten. Outlined rather than filled so the day count stays the
            loudest thing on the section. */}
        <AddToCalendar className="mt-12" />
      </motion.div>
    </section>
  );
}

/** The rope heart, drawn in ink through a mask (see the note at its usage). */
function RopeHeart({ className }: { className?: string }) {
  const mask = "url('/icons/hand_drawn/wedding_2/rope-heart-frame.svg')";
  return (
    <span
      aria-hidden
      className={cn('block aspect-[91.7109/89.9102] bg-ink', className)}
      style={{
        maskImage: mask,
        WebkitMaskImage: mask,
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
      }}
    />
  );
}
