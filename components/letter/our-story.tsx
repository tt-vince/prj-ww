'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';
import { MORPH, PhotoLightbox, photoLayoutId } from '@/components/letter/photo-lightbox';
import { COUPLE_NAMES } from '@/lib/wedding';
import { SectionHeading } from '@/components/letter/section-heading';

// Both slots (photo + text) share this variant so a row reveals as one unit.
const rowItem = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};
const rowTransition = { duration: 1.1, ease: 'easeOut' } as const;

const [NAME_A, NAME_B] = COUPLE_NAMES;

/**
 * Our story — EDGE-TO-EDGE green dome. Its top dome rises into the section
 * above and its bottom dome into the one below via a matching `-mt` overlap:
 * a deep 12rem (`-mt-48`, `180px` radius) on mobile, and the shallow ~4rem
 * hero curve on `sm`+ (`sm:-mt-16`, `sm:rounded` 3rem). DayItself slides up
 * behind it at z-0. Inside the
 * dome the timeline is a SCRAPBOOK (imported design "Wedding Timeline" 4a/5a),
 * recoloured into the letter's two-colour system — an `--ink` dome with
 * white paper and white thread on it:
 *
 *   • a hand-drawn camera charm hangs over the top of a centre thread;
 *   • each memory is a tilted white polaroid with a handwritten caption;
 *   • desktop (sm+) = design 4a: continuous centre spine, rows alternate
 *     left/right, text hugs the spine;
 *   • mobile = design 5a: a single centred column, camera on top, polaroids
 *     strung straight down the thread.
 *
 * Photos are real-image slots (`image`): drop a file in and it replaces the
 * striped placeholder; until then the placeholder shows.
 */

type Memory = {
  date: string;
  title: string;
  body: string;
  /** Handwritten note on the polaroid's bottom border. */
  caption: string;
  /**
   * Photo for the polaroid. Currently stand-in shots from picsum.photos
   * (seeded, so each memory keeps the same image between loads) — swap these
   * for real files under `/public/story/` when we have them. Falls back to the
   * striped placeholder when unset.
   */
  image?: string;
  /** Polaroid tilt, in degrees (from the source design). */
  tilt: number;
};

const MEMORIES: Memory[] = [
  {
    date: 'April 2019',
    title: 'A broken umbrella',
    body: `${NAME_B} and ${NAME_A} shelter under the same café awning in Nakameguro. The offered umbrella turns out to be broken — the argument about whether it still counts as chivalry lasts two hours.`,
    caption: 'the café awning ♡',
    image: 'https://picsum.photos/seed/ww-umbrella/600/600',
    tilt: -2.4,
  },
  {
    date: 'September 2020',
    title: 'First apartment',
    body: 'Two suitcases, one very small kitchen, and a shared conviction that a rice cooker counts as furniture.',
    caption: 'moving day',
    image: 'https://picsum.photos/seed/ww-apartment/600/600',
    tilt: 2,
  },
  {
    date: 'June 2022',
    title: 'Enter Mochi',
    body: 'A very opinionated cat adopts us. Sunday-morning pancake experiments begin in earnest (success rate: improving).',
    caption: 'Mochi arrives ♡',
    image: 'https://picsum.photos/seed/ww-mochi/600/600',
    tilt: 1.6,
  },
  {
    date: 'October 2025',
    title: 'The proposal',
    body: 'Back on the same street corner where it began — with a working umbrella this time, and a ring hidden in its handle.',
    caption: 'same corner ♡',
    image: 'https://picsum.photos/seed/ww-proposal/600/600',
    tilt: -1.8,
  },
  {
    date: 'Next summer',
    title: 'The next chapter',
    body: 'Gathering everyone we love in one garden, under one hopefully unnecessary canopy of umbrellas.',
    caption: 'the garden',
    image: 'https://picsum.photos/seed/ww-garden/600/600',
    tilt: 2.2,
  },
];

export function OurStory() {
  // Polaroid tapped open in the shared lightbox (photo-lightbox.tsx): the
  // photo flies out of its polaroid to the centre of the screen. Stand-ins are
  // square 600x600 — revisit w/h if real files with other ratios land.
  const [active, setActive] = useState<Memory | null>(null);
  const reduce = !!useReducedMotion();

  return (
    <section className="relative z-10 -mt-48 sm:-mt-16">
      <div className="rounded-[50%_50%_50%_50%_/_180px_180px_180px_180px] bg-ink px-gutter pt-28 pb-section text-center sm:rounded-[50%_50%_50%_50%_/_3rem_3rem_3rem_3rem] sm:pt-32">
        <div className="mx-auto max-w-[64rem] lg:max-w-[80rem]">
          <SectionHeading tone="white" title="Our Story" kicker="How it began" />

          {/* Scrapbook thread. Camera charm hangs over the top; the spine runs
              down the centre on sm+, and on mobile the per-item connector
              segments join into one continuous centre thread. */}
          {/* The scrapbook is two columns either side of the thread, so the
              text column is only ever half of this minus the gutter. At the
              phone-first 52rem that left ~35 characters a line on a desktop —
              a wrapped, ragged column in the middle of an empty screen. It
              widens twice on the way up so the memories read at a proper
              measure; the polaroid keeps its own fixed width either way. */}
          {/* The gap under the heading is `--spacing-heading` — the same rhythm
              role DayItself uses — PLUS the camera charm's overhang. The charm
              is centred on this wrapper's top edge and pulled up 85% of its own
              height (93px at w-24, 109px at sm:w-28), so a bare `mt-heading`
              here would put the drawing, not the thread, directly under the
              kicker. Adding the overhang back makes the VISIBLE kicker-to-
              content gap match The Day Itself. */}
          <div className="relative mx-auto mt-[calc(var(--spacing-heading)+79px)] max-w-[52rem] sm:mt-[calc(var(--spacing-heading)+93px)] lg:max-w-[64rem] xl:max-w-[72rem]">
            {/* Hand-drawn polaroid-camera charm, centred over the top of the thread. */}
            <CameraCharm className="pointer-events-none absolute left-1/2 top-0 z-20 w-24 -translate-x-1/2 -translate-y-[85%] sm:w-28" />

            {/* Continuous centre spine (sm+ only). On mobile the thread is
                drawn by each item's own connector segment instead. */}
            <span
              aria-hidden
              className="absolute top-0 bottom-[8rem] left-1/2 hidden w-[3px] -translate-x-1/2 rounded-full bg-paper sm:block"
            />

            {/* No mobile `space-y`: each item opens with its own thread
                segment, and a list gap ABOVE that segment made the thread sit
                40px below the previous memory but only 12px above the next
                polaroid — one continuous line with visibly unequal ends. The
                segment's own `my-6` is the whole gap now, so it is symmetric by
                construction. */}
            <ol className="sm:space-y-0">
              {MEMORIES.map((m, i) => {
                const imageLeft = i % 2 === 0;
                return (
                  <motion.li
                    key={m.date}
                    className="relative flex flex-col items-center sm:grid sm:grid-cols-2 sm:items-center sm:gap-x-16 sm:py-12"
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.3 }}
                  >
                    {/* Mobile-only thread segment joining items into one thread.
                        `my-6` is the only vertical gap between memories on a
                        phone (see the note on the <ol>), so it reads the same
                        above and below the line. */}
                    <span
                      aria-hidden
                      className="my-6 h-16 w-[2px] rounded-full bg-paper sm:hidden"
                    />

                    {/* Polaroid. */}
                    <motion.div
                      variants={rowItem}
                      transition={rowTransition}
                      // Centred on mobile (single column); on sm+ the polaroid
                      // hugs the centre spine rather than floating in the
                      // middle of its half — same treatment the illustrations
                      // get against the rail in DayItself. Its inner padding
                      // matches the text column's (`sm:pl-10`/`sm:pr-10`), so
                      // both halves stand off the spine by the same 4.5rem and
                      // the row reads as one balanced pair.
                      className={cn(
                        'flex justify-center',
                        imageLeft
                          ? 'sm:order-1 sm:justify-end sm:pr-10'
                          : 'sm:order-2 sm:justify-start sm:pl-10'
                      )}
                    >
                      <Polaroid memory={m} reduce={reduce} onOpen={() => setActive(m)} />
                    </motion.div>

                    {/* Text, hugging the spine. */}
                    <motion.div
                      variants={rowItem}
                      transition={rowTransition}
                      className={cn(
                        // `mt-6` on a phone: at `mt-2` the caption sat close
                        // enough to the polaroid's own bottom border to read as
                        // part of the print rather than as the memory's text.
                        'mt-6 max-w-sm px-2 text-center sm:mt-0 sm:max-w-none',
                        imageLeft
                          ? 'sm:order-2 sm:pl-10 sm:text-left'
                          : 'sm:order-1 sm:pr-10 sm:text-right'
                      )}
                    >
                      <p className="font-sans text-label font-medium uppercase tracking-[0.16em] text-paper">
                        {m.date}
                      </p>
                      <h3 className="relative mt-1 font-script text-entry text-paper">
                        {/* Connector from the centre spine to the title (sm+).
                            The run from the spine to this text box is 4.5rem —
                            text padding (pl/pr-10 = 40px) plus half the column
                            gap (gap-x-16 = 64px) — so the line is drawn 0.5rem
                            SHORT of it. Full length made the script capital
                            touch the rule; DayItself gets the same breathing
                            room from the `md:pl-2` on its description instead.
                            Offset stays at the full 4.5rem so the line still
                            starts on the spine. */}
                        <span
                          aria-hidden
                          className={cn(
                            'absolute top-[0.55em] hidden h-[3px] w-16 rounded-full bg-paper sm:block',
                            imageLeft ? 'sm:-left-[4.5rem]' : 'sm:-right-[4.5rem]'
                          )}
                        />
                        {m.title}
                      </h3>
                      <p className="mt-2 text-body text-paper">{m.body}</p>
                    </motion.div>
                  </motion.li>
                );
              })}
            </ol>

            {/* The thread ends at a pair of hand-drawn wedding rings — same
                idea as the getaway car closing the rail in `DayItself`. On
                mobile a thread segment carries down to it (the sm+ spine stops
                just above the drawing). */}
            <motion.div
              className="relative flex flex-col items-center"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            >
              <span
                aria-hidden
                className="my-6 h-16 w-[2px] rounded-full bg-paper sm:hidden"
              />
              <InkCharm
                src="/icons/hand_drawn/illustrations/wedding-rings-linework.svg"
                className="aspect-[211.1815/126.2234] w-44 sm:mt-8 sm:w-52"
              />
            </motion.div>
          </div>
        </div>
      </div>

      <PhotoLightbox
        photo={
          active?.image
            ? {
                id: `story-${active.date}`,
                src: active.image,
                alt: active.title,
                w: 600,
                h: 600,
              }
            : null
        }
        reduce={reduce}
        onClose={() => setActive(null)}
      />
    </section>
  );
}

/** A single tilted polaroid: photo (or placeholder), handwritten note. */
function Polaroid({
  memory,
  reduce,
  onOpen,
}: {
  memory: Memory;
  reduce: boolean;
  onOpen: () => void;
}) {
  const { image, caption, title, tilt } = memory;
  return (
    <figure
      className="relative w-[min(74vw,15rem)] rounded-[2px] bg-paper p-3 pb-9 shadow-[0_14px_28px_-6px_color-mix(in_srgb,var(--ink)_50%,transparent),0_2px_5px_color-mix(in_srgb,var(--ink)_30%,transparent)] sm:w-64"
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      <div className="relative aspect-square overflow-hidden rounded-[1px] bg-ink shadow-[inset_0_2px_10px_color-mix(in_srgb,var(--ink)_30%,transparent)]">
        {image ? (
          <button
            type="button"
            onClick={onOpen}
            aria-label={`View photo: ${title}`}
            className="block size-full cursor-zoom-in focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-lichen"
          >
            <motion.img
              layoutId={reduce ? undefined : photoLayoutId(`story-${memory.date}`)}
              transition={MORPH}
              src={image}
              alt={title}
              className="size-full object-cover"
              loading="lazy"
            />
          </button>
        ) : (
          <div className="flex size-full items-center justify-center bg-[repeating-linear-gradient(45deg,var(--paper),var(--paper)_1px,transparent_1px,transparent_10px)]">
            <span className="font-mono text-micro uppercase tracking-[0.14em] text-paper">
              photo · {caption.replace(/\s*♡$/, '')}
            </span>
          </div>
        )}
      </div>

      {/* Handwritten note on the polaroid's white bottom border rather than
          over the photo — on the frame it stays legible whatever the photo. */}
      <figcaption className="absolute inset-x-3 bottom-1 text-center font-script text-subhead leading-tight text-ink">
        {caption}
      </figcaption>
    </figure>
  );
}

/**
 * A hand-drawn asset painted in the light base. These ship as solid dark ink, so they are
 * drawn through a CSS mask to recolour them against the ink dome. The caller
 * supplies the aspect ratio (from the asset's viewBox) and the width.
 */
function InkCharm({ src, className }: { src: string; className?: string }) {
  const mask = `url('${src}')`;
  return (
    <span
      aria-hidden
      className={cn('block bg-paper', className)}
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

/** Polaroid camera charm hanging over the top of the thread. */
function CameraCharm({ className }: { className?: string }) {
  return (
    <InkCharm
      src="/icons/hand_drawn/wedding_2/polaroid-camera.svg"
      className={cn('aspect-[91.8867/89.3203]', className)}
    />
  );
}
