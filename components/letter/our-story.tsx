'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';
import { MORPH, PhotoLightbox, photoLayoutId } from '@/components/letter/photo-lightbox';
import { COUPLE_NAMES } from '@/lib/wedding';
import { SectionHeading } from '@/components/letter/section-heading';

// Scroll reveals (row fade-up, vine draw-on, closing rings) were removed for
// now — the section renders fully drawn. Re-add via motion's whileInView if it
// comes back; the surrounding sections still animate.

const [NAME_A, NAME_B] = COUPLE_NAMES;

/**
 * Our story — the last of the three sections drawn on the shared opening
 * backdrop (components/letter/opening-backdrop.tsx), which renders it and paints
 * behind it. It has NO background and no dome of its own:
 *
 * The dome is gone deliberately. It existed to soften the join between this
 * section's ink and the paper sections on either side of it; with the backdrop's
 * photo showing through and greening away to ink across this section, there is
 * no colour edge left for a curve to disguise — the dome only cut a visible arc
 * out of a continuous field. Its `-mt` overlaps went with it (and Prenup's
 * matching `-mt-48`/`pt-dome`, which existed to slide under the bottom dome).
 *
 * The timeline itself is a SCRAPBOOK (imported design "Wedding Timeline" 4a/5a),
 * recoloured into the letter's palette — paper type and paper thread on the
 * backdrop's ink:
 *
 *   • a hand-drawn camera charm hangs over the top of a centre thread;
 *   • each memory is a tilted white polaroid with a handwritten caption;
 *   • desktop (sm+): a serpentine VINE replaces the old straight centre spine.
 *     It weaves right→left→right down the section, and each memory sits on ONE
 *     side only (polaroid + text together), alternating with the vine's bulge —
 *     so the eye follows the curve from memory to memory instead of ping-ponging
 *     across a rigid two-column grid;
 *   • mobile = design 5a: a single centred column, camera on top, polaroids
 *     strung straight down the thread (the vine is desktop-only — at phone
 *     width a curve wide enough to read leaves no room for the polaroid).
 *
 * The vine is a stretched SVG: its viewBox is `0 0 100 (N*100+70)` in abstract
 * units and it is drawn with `preserveAspectRatio="none"`, so one vertical unit
 * per row-hundred maps onto whatever height the rows actually take. Row `i`'s
 * lobe therefore always lands beside row `i`, at any viewport width or text
 * length. Keep VINE_SIDE and the row's `imageLeft` in sync if either changes.
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
    <section className="relative z-10">
      <div className="px-gutter pt-section pb-section text-center">
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


            {/* No mobile `space-y`: each item opens with its own thread
                segment, and a list gap ABOVE that segment made the thread sit
                40px below the previous memory but only 12px above the next
                polaroid — one continuous line with visibly unequal ends. The
                segment's own `my-6` is the whole gap now, so it is symmetric by
                construction. */}
            {/* The vine is absolutely positioned over this wrapper, so the
                wrapper must bound exactly the rows it threads — hence the ol
                sits in its own relative box rather than the section's.
                `--row-h` is the fixed sm+ row height the vine's 100-unit lobes
                are mapped onto. It must clear the tallest memory (polaroid
                16rem + date + title + body ≈ 36rem) DIVIDED BY `VINE_DWELL` —
                anything taller than the held run pokes out into the crossings
                and the vine is drawn over the text. */}
            <div className="relative sm:[--row-h:44rem]">
              <Vine rows={MEMORIES.length} />
              {/* Pixel counterpart of VINE_LEAD (sm+ only — on a phone the
                  charm sits on its own thread segment already). */}
              <div aria-hidden className="hidden sm:block sm:h-[calc(var(--row-h)*0.2)]" />
              <ol className="relative sm:space-y-0">
              {MEMORIES.map((m, i) => {
                // One-sided rows: the whole memory (polaroid + text) sits on
                // the side the vine bulges toward for this row.
                const onRight = VINE_SIDE(i) === 'right';
                return (
                  <li
                    key={m.date}
                    className={cn(
                      'relative flex flex-col items-center sm:h-[var(--row-h)] sm:justify-center sm:items-start'
                    )}
                  >
                    {/* Mobile-only thread segment joining items into one thread.
                        `my-6` is the only vertical gap between memories on a
                        phone (see the note on the <ol>), so it reads the same
                        above and below the line. */}
                    <span
                      aria-hidden
                      className="my-6 h-16 w-[2px] rounded-full bg-paper sm:hidden"
                    />

                    {/* One-sided memory: polaroid and text stacked together in
                        a single half-width block. There is no connector rule
                        any more — the vine itself curves into the block, so a
                        straight tick off it would only fight the curve.
                        `sm:w-[46%]` leaves the middle of the section clear for
                        the vine's swing between the two sides. */}
                    <div
                      className={cn(
                        'flex flex-col items-center sm:w-[42%]',
                        // Nest the memory INSIDE the bay: right rows span
                        // 58-100%, left rows 0-42%, while this row's vine is
                        // held at the opposite 28 / 72. The sweep only reaches
                        // this far across close to the row boundaries, above
                        // and below the block — so the memory keeps its bay
                        // without the vine having to run dead straight beside
                        // it. Pulling it in to the centre line instead is what
                        // forced the squared-off dwell.
                        onRight ? 'sm:ml-[58%] sm:items-start' : 'sm:mr-[58%] sm:items-end'
                      )}
                    >
                      <Polaroid memory={m} reduce={reduce} onOpen={() => setActive(m)} />

                      {/* `mt-6`: at `mt-2` the date sat close enough to the
                          polaroid's own bottom border to read as part of the
                          print rather than as the memory's text. */}
                      <div
                        className={cn(
                          // Flush edge faces the vine, ragged edge faces the
                          // empty outer margin — so the text reads as sitting
                          // against the curve.
                          'mt-6 max-w-sm px-2 text-center',
                          onRight ? 'sm:text-left' : 'sm:text-right'
                        )}
                      >
                        <p className="font-sans text-label font-medium uppercase tracking-[0.16em] text-paper">
                          {m.date}
                        </p>
                        <h3 className="mt-1 font-script text-entry text-paper">{m.title}</h3>
                        <p className="mt-2 text-body text-paper">{m.body}</p>
                      </div>
                    </div>
                  </li>
                );
              })}
              </ol>
              {/* Pixel counterpart of the vine's VINE_TAIL units (0.2 of a
                  row). Without it the wrapper is `rows` rows tall while the
                  viewBox is taller, so every lobe is squeezed short of its row
                  and the crossings drift up into the memories. */}
              <div aria-hidden className="hidden sm:block sm:h-[calc(var(--row-h)*0.2)]" />
            </div>

            {/* The thread ends at a pair of hand-drawn wedding rings — same
                idea as the getaway car closing the rail in `DayItself`. On
                mobile a thread segment carries down to it (the sm+ spine stops
                just above the drawing). */}
            <div className="relative flex flex-col items-center">
              <span
                aria-hidden
                className="my-6 h-16 w-[2px] rounded-full bg-paper sm:hidden"
              />
              <InkCharm
                src="/icons/hand_drawn/illustrations/wedding-rings-linework.svg"
                className="aspect-[211.1815/126.2234] w-44 sm:mt-8 sm:w-52"
              />
            </div>
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

/**
 * Which side of the section row `i` lives on. Row 0 goes right, matching the
 * imported design; flip the parity here and the vine follows automatically.
 */
const VINE_SIDE = (i: number) => (i % 2 === 0 ? 'right' : 'left');

/**
 * Horizontal reach of a lobe, in the vine's 0–100 viewBox units.
 *
 * The vine bulges AWAY from its row's content: the curve swings out to the
 * empty half and the memory sits in the pocket it leaves behind, the way the
 * reference design nests its text inside each bend. (Bulging toward the content
 * instead puts the line under the text and wastes the open half.)
 */
const VINE_X = { right: 72, left: 28 } as const;
const VINE_OPPOSITE = { right: 'left', left: 'right' } as const;

/**
 * How much of a row the vine spends parked at its lobe, as a fraction of the
 * row — the rest is the sweep across to the next lobe.
 *
 * Zero — a pure sine, one smooth swing per row, which is what the reference
 * design draws. Any real dwell shows up as a dead straight run with rounded
 * ends (0.86 read as a squared-off bracket, 0.5 still left ~350px of straight),
 * so clearance for the memory comes entirely from pushing it outboard rather
 * than from parking the vine beside it. It is kept as a knob because the bay
 * height is sensitive to it, but expect to leave it at 0.
 *
 * Why a sine clears the text: the swing between lobes is symmetric, so the
 * curve reaches the memory's edge (x 58/42) at ~0.32 of the way between two
 * lobes — about 18 units ABOVE the row's top edge and below its bottom, while
 * the memory itself spans only the middle ~82 units of the row. Widen the block
 * past 42%, or grow a memory past `--row-h`, and that margin is what goes.
 */
const VINE_DWELL = 0;
/** Abstract units per row — one lobe per row. */
const VINE_ROW = 100;
/**
 * Straight lead-in above the first lobe (0.2 of a row), so the vine drops out
 * of the camera charm before it starts swinging and the first memory is not
 * crowded up against the drawing. Done in the path rather than as a margin on
 * the charm: the charm is absolutely positioned (a margin moves nothing) and
 * spacing the whole wrapper down would take the charm with it. The row stack
 * carries the matching pixel spacer — keep the two in step.
 */
const VINE_LEAD = 20;
/**
 * Tail below the last lobe, where the vine returns to centre for the rings.
 * The row stack carries a matching spacer (0.2 of a row) so viewBox units and
 * pixels stay 1:1 — keep the two in step if this changes.
 *
 * It stays round on a short tail because the run starts at the last lobe, in
 * the MIDDLE of the final row: the curve gets half a row plus the tail to
 * travel its 22 units back to centre. It also never reaches x 58/42, so it
 * cannot clip the last memory however short it gets.
 */
const VINE_TAIL = 20;

/**
 * The serpentine vine threading the memories (sm+ only).
 *
 * Drawn in abstract units and stretched with `preserveAspectRatio="none"`: the
 * viewBox is 100 wide by `rows * VINE_ROW + VINE_TAIL` tall, and the element is
 * sized to the row stack, so lobe `i` always sits beside row `i` whatever the
 * real pixel height. Non-uniform scaling does distort the curve — that is fine
 * for a free-flowing vine, but it is also why the stroke uses
 * `vector-effect="non-scaling-stroke"`: without it the line would render
 * thinner horizontally than vertically.
 *
 * Control points sit directly above/below their nodes (half the vertical run),
 * giving every node a vertical tangent — that is what makes consecutive lobes
 * join as one continuous S rather than a chain of visible kinks.
 */
function Vine({ rows }: { rows: number }) {
  const height = VINE_LEAD + rows * VINE_ROW + VINE_TAIL;

  // Start centred under the camera charm; each row contributes a held lobe
  // (two nodes at the same x), then the path returns to centre for the rings.
  const pad = (VINE_ROW * (1 - VINE_DWELL)) / 2;
  const nodes: Array<[number, number]> = [
    [50, 0],
    ...Array.from({ length: rows }, (_, i) => {
      const x = VINE_X[VINE_OPPOSITE[VINE_SIDE(i)]];
      const y0 = VINE_LEAD + i * VINE_ROW;
      return [
        [x, y0 + pad],
        [x, y0 + VINE_ROW - pad],
      ] as Array<[number, number]>;
    }).flat(),
    [50, height],
  ];

  const d = nodes
    .map(([x, y], i) => {
      if (i === 0) return `M ${x} ${y}`;
      const [px, py] = nodes[i - 1];
      // Same x = a held lobe (VINE_DWELL > 0): a straight run, no bend. At
      // dwell 0 the two lobe nodes coincide and this contributes nothing.
      if (px === x) return py === y ? '' : `L ${x} ${y}`;
      // Vertical tangents at both ends, so held runs and crossings meet
      // without a kink.
      const bend = (y - py) / 2;
      return `C ${px} ${py + bend} ${x} ${y - bend} ${x} ${y}`;
    })
    .join(' ');

  return (
    <svg
      aria-hidden
      viewBox={`0 0 100 ${height}`}
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 hidden size-full overflow-visible sm:block"
    >
      {/* Drawn statically. A `pathLength` draw-on was tried and removed: the
          vine spans several viewports, so a scroll-triggered draw left the
          curve visibly half-finished above and below the fold. */}
      <path
        d={d}
        fill="none"
        stroke="var(--paper)"
        strokeWidth={3}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
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
