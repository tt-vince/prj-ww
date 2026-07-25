'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

/**
 * Sequence of events — EDGE-TO-EDGE white section. It used to be the section
 * that slid up behind Our Story's bottom dome; `Prenup` now sits between them
 * and carries that overlap (`-mt-48 pt-56`), so this just continues the same
 * white flow underneath it.
 *
 * Layout: a single centre rail runs down the middle. Each event alternates
 * sides — a line-icon illustration on one half, the description on the other,
 * with a short horizontal connector from the centre rail to the title. On
 * mobile the rail shifts left, a short connector runs from it to each title,
 * and the illustration sits in the item body AFTER the description. The rail
 * runs from the first event down to the getaway car at the end. Dummy data
 * for now.
 */

/**
 * Hand-drawn illustrations from `public/icons/hand_drawn/wedding_2`. Intrinsic
 * sizes come from each asset's viewBox — they are rendered at a fixed height
 * with `w-auto`, so the differing aspect ratios stay honest.
 */
const ILLOS = {
  arrive: { src: 'church.svg', width: 115, height: 123 },
  ceremony: { src: 'floral-arch.svg', width: 92, height: 92 },
  cocktails: { src: 'cocktails-two-glasses.svg', width: 112, height: 105 },
  dinner: { src: 'wedding-cake-tiered.svg', width: 108, height: 100 },
  dance: { src: 'dancing-couple-bride-groom.svg', width: 101, height: 105 },
  fireworks: { src: 'fireworks.svg', width: 108, height: 104 },
} as const;

type EventIllo = keyof typeof ILLOS;

const EVENTS: {
  time: string;
  what: string;
  detail: string;
  illo: EventIllo;
}[] = [
  { time: '2:00 pm', what: 'Guests arrive', detail: 'Welcome drinks on the terrace.', illo: 'arrive' },
  { time: '2:30 pm', what: 'Ceremony', detail: 'In the garden, weather permitting.', illo: 'ceremony' },
  { time: '3:15 pm', what: 'Cocktails & photos', detail: 'Canapés and a string quartet.', illo: 'cocktails' },
  { time: '5:00 pm', what: 'Dinner', detail: 'Four seasonal courses in the Garden House.', illo: 'dinner' },
  { time: '7:30 pm', what: 'First dance & party', detail: 'The dance floor opens.', illo: 'dance' },
  { time: '10:00 pm', what: 'Fireworks', detail: 'One last hurrah on the lawn.', illo: 'fireworks' },
];

export function DayItself() {
  return (
    <section className="relative z-0 bg-white pr-5 pb-24 sm:px-9">
      <div className="mx-auto max-w-[56rem] text-center">
        <h2 className="font-script text-4xl leading-tight text-[color:var(--script)] sm:text-5xl">
          The day itself
        </h2>
        <p className="mt-2 font-countdown text-sm tracking-wide text-ink">
          What we have planned
        </p>

        <div className="relative mx-auto mt-14 max-w-[46rem]">
          {/* The single centre rail: left on mobile, dead-centre on md+. It
              starts at the first event; on md+ it runs on down to the getaway
              car, on mobile it stops at the last event (car is hidden). */}
          <span
            aria-hidden
            className="absolute bottom-1 left-6 top-1 w-0.5 bg-ink md:bottom-32 md:left-1/2 md:-translate-x-1/2"
          />

          <ol className="relative">
            {EVENTS.map((e, i) => {
            // Even rows: illustration left, description right. Odd: swapped.
            const illoRight = i % 2 === 1;
            return (
              <motion.li
                key={e.time}
                className="relative flex flex-col items-start gap-3 pb-12 pl-16 last:pb-0 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-x-10 md:pl-0"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
              >
                {/* Connector from the LEFT rail to the title (mobile only) —
                    stops short of the title (small gap) and is vertically
                    centred on the title's first line. */}
                <span
                  aria-hidden
                  className="absolute left-6 top-[0.95rem] h-0.5 w-8 bg-ink md:hidden"
                />

                {/* Hand-drawn illustration — a side cell on md+; on mobile it
                    sits in the item body, after the description (order-2). */}
                <div
                  className={cn(
                    // On md+ the illustration hugs the centre rail rather than
                    // sitting in the middle of its half.
                    'order-2 flex shrink-0 justify-center md:order-2 md:shrink',
                    illoRight
                      ? 'md:order-3 md:justify-start'
                      : 'md:order-1 md:justify-end'
                  )}
                >
                  <EventIllustration illo={e.illo} />
                </div>

                {/* Spacer for the centre rail track (md grid middle column). */}
                <span aria-hidden className="hidden md:order-2 md:block md:w-0" />

                {/* Description + connector to the centre rail. */}
                <div
                  className={cn(
                    'order-1 relative pt-1 text-left md:pt-0',
                    illoRight
                      ? 'md:order-1 md:pr-2 md:text-right'
                      : 'md:order-3 md:pl-2 md:text-left'
                  )}
                >
                  {/* Horizontal connector from centre rail to the title (md+). */}
                  <span
                    aria-hidden
                    className={cn(
                      'absolute top-[0.7rem] hidden h-0.5 w-10 bg-ink md:block',
                      illoRight ? 'md:-right-10' : 'md:-left-10'
                    )}
                  />
                  <p className="font-hand text-lg leading-snug text-ink">
                    {e.what}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-ink">
                    {e.detail}
                  </p>
                </div>
              </motion.li>
              );
            })}
          </ol>

          {/* Getaway car — where the rail ends. Hidden on mobile for now; on
              md+ it hangs off the bottom of the centre rail. */}
          <motion.div
            className="relative hidden pt-8 md:flex md:justify-center"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <Image
              src="/icons/hand_drawn/wedding_2/wedding-car-couple.svg"
              alt="Getaway car"
              width={99}
              height={99}
              className="h-20 w-auto opacity-80 md:h-32"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/**
 * Hand-drawn illustration for one event. Same treatment as the getaway car at
 * the end of the rail: the asset's own ink, softened slightly, at a fixed
 * height so every row lines up regardless of the drawing's aspect ratio.
 */
function EventIllustration({ illo }: { illo: EventIllo }) {
  const { src, width, height } = ILLOS[illo];
  return (
    <Image
      src={`/icons/hand_drawn/wedding_2/${src}`}
      alt=""
      aria-hidden
      width={width}
      height={height}
      className="h-30 w-auto opacity-80 md:h-32"
    />
  );
}
