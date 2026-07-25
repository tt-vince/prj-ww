'use client';

import { Fragment } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Countdown } from '@/components/countdown';
import { WEDDING_DAY_LABEL, WEDDING_WEEK } from '@/lib/wedding';

/**
 * Countdown band — plain white section between Hero and Our Story (Hero's
 * lily photo ends flush above it, no overlap). Its `pb-72` gives Our Story
 * room to rise into: Our Story keeps its own `-mt-48` (12rem), so the green
 * dome overlaps only this white bottom padding, never the countdown text.
 * `pb-72` (18rem) = top `pt-28` (7rem) + the 12rem dome bite, so visible
 * white above and below the countdown reads roughly equal.
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
    <section className="relative z-10 bg-white px-5 pt-28 pb-72 text-center sm:px-9">
      <motion.div
        className="flex flex-col items-center"
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Quiet intro line — deliberately smaller than the count, so the
            section has one loud thing in it and not three. */}
        <h2 className="font-script text-xl leading-tight text-ink sm:text-2xl">
          Counting down to the day
        </h2>

        {/* The row and the script line are one sentence: `Countdown` renders
            the four-unit serif line, then this script label completes it.
            Three faces, three jobs — one loud. */}
        <Countdown
          align="center"
          size="lg"
          className="mt-8 text-ink"
          srSuffix="until we say I do"
          labelClassName="font-script text-[1.75rem] leading-tight text-ink sm:text-[2.125rem]"
          tickClassName="text-ink"
          label="until we say I do"
        />

        {/* The date to write down: full weekday-and-year line over the
            calendar week strip, with the wedding day circled. */}
        <p className="mt-14 font-heading text-base leading-none text-ink sm:text-lg">
          {WEDDING_DAY_LABEL}
        </p>
        <div className="mt-5 flex items-center justify-center">
          {WEDDING_WEEK.map((d, i) => (
            <Fragment key={d.label}>
              {i > 0 ? (
                <span
                  aria-hidden
                  className="mx-2 size-[3px] shrink-0 rounded-full bg-ink sm:mx-4"
                />
              ) : null}
              <span className="relative flex w-7 flex-col items-center gap-1 py-0.5 sm:w-8">
                {d.isWeddingDay ? (
                  <svg
                    viewBox="0 0 64 64"
                    preserveAspectRatio="none"
                    aria-hidden
                    className="pointer-events-none absolute -inset-x-2 -inset-y-2 text-ink h-[calc(100%+1rem)] w-[calc(100%+1rem)]"
                  >
                    {/* Fine closed ellipse — a calm, calligraphic ring
                        around the day rather than a scribbled circle. */}
                    <ellipse
                      cx="32"
                      cy="32"
                      rx="29.5"
                      ry="29.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      opacity="0.85"
                    />
                  </svg>
                ) : null}
                <span className="font-sans text-[9px] leading-none tracking-[0.14em] text-ink sm:text-[10px]">
                  {d.label}
                </span>
                <span
                  className={`font-heading text-sm leading-none text-ink sm:text-base ${
                    d.isWeddingDay ? 'font-medium' : ''
                  }`}
                >
                  {d.date}
                </span>
              </span>
            </Fragment>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
