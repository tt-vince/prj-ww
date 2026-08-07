'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';
import { MORPH, PhotoLightbox, photoLayoutId } from '@/components/letter/photo-lightbox';
import { COUPLE_NAMES } from '@/lib/wedding';
import { SectionHeading } from '@/components/letter/section-heading';
import { Dome } from '@/components/letter/dome';

// Scroll reveals: the memories fade up ONCE and stay (re-fading a memory the
// reader has already read makes scrolling back up feel broken), while the vine
// florals fade both ways every time they cross the viewport, so the stem reads
// as coming into leaf as you travel down it. The vine stroke itself and the
// charms are still drawn statically — a draw-on over a curve several viewports
// tall only ever shows as half-finished.

const [NAME_A, NAME_B] = COUPLE_NAMES;

/**
 * Our story — the last of the three sections drawn on the shared opening
 * backdrop (components/letter/opening-backdrop.tsx), which renders it and paints
 * behind it. It paints no background of its own — but it does draw a dome at
 * the TOP.
 *
 * The top dome is back because the countdown band above is paper again, so
 * there IS a colour edge here to disguise: paper meeting the backdrop's ink in
 * a hard horizontal line. The dome is that edge as a curve, filled with the
 * countdown's own paper (see the markup below). Only the TOP dome returns — the
 * bottom of the section still fades into flat ink and hands over to Prenup with
 * no curve, so Prenup keeps its plain `pt-section` and no `-mt-48`.
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
      {/* The dome opening the section: the backdrop's ink rises as an arch into
          the countdown band's paper. Shared `Dome` (components/letter/dome.tsx)
          so this seam and the one opening RSVP are the same curve; `up` because
          this arch points INTO the paper above, where RSVP's hangs down.

          NO `-mt` bite here, unlike the RSVP arch. The countdown's bottom
          padding is paper and so is this band, so pulling the section up into
          it hid the whole dome inside a ground of its own colour — at `sm` the
          arch is 4rem and the bite was a full `section` (4.5–7rem), so nothing
          was drawn at all. The arch has to START where the paper ends.

          Clearance below is `pt-section` on mobile, only rising to `pt-dome` on
          `sm`+. `pt-dome` reserves the arch's full depth, which is what RSVP's
          SOLID arch needs — but this one is a hole, so the heading sits under
          open ink at the crown and 12rem of mobile clearance was reserving room
          against a curve that is not there. */}
      <Dome direction="up" className="bg-paper" />
      <div className="relative px-gutter pt-section pb-section text-center sm:pt-dome">
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
              <VineFlorals rows={MEMORIES.length} />
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
                    <motion.div
                      initial={reduce ? undefined : { opacity: 0, y: 24 }}
                      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.7, ease: 'easeOut' }}
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
                    </motion.div>
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

/** Total height of the vine's viewBox, in abstract units. */
const vineHeight = (rows: number) => VINE_LEAD + rows * VINE_ROW + VINE_TAIL;

/**
 * The vine's nodes, in viewBox units. Start centred under the camera charm;
 * each row contributes a held lobe (two nodes at the same x, coincident at
 * dwell 0), then the path returns to centre for the rings.
 *
 * Shared by the drawn path and by VineFlorals, so the drawings sit on the same
 * curve the stroke follows.
 */
function vineNodes(rows: number): Array<[number, number]> {
  const pad = (VINE_ROW * (1 - VINE_DWELL)) / 2;
  return [
    [50, 0],
    ...Array.from({ length: rows }, (_, i) => {
      const x = VINE_X[VINE_OPPOSITE[VINE_SIDE(i)]];
      const y0 = VINE_LEAD + i * VINE_ROW;
      return [
        [x, y0 + pad],
        [x, y0 + VINE_ROW - pad],
      ] as Array<[number, number]>;
    }).flat(),
    [50, vineHeight(rows)],
  ];
}

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
  const height = vineHeight(rows);
  const nodes = vineNodes(rows);

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

/**
 * A drawing that grows off the vine.
 *
 * Two per-asset facts decide how it sits on the curve, and both are measured
 * off the artwork rather than guessed:
 *
 *  • `stem` — the point where the plant is cut, as a FRACTION of the asset's
 *    own box: `{x: 0, y: 0}` is its top-left corner, `{x: 1, y: 1}` the
 *    bottom-right. That point is what gets pinned to the vine. Pick it with
 *    `tools/stem-picker.html`: open the file, click the stem end on each
 *    drawing, and it prints the pair to paste in here.
 *  • `bearing` — which way the drawing grows in its own artwork, in degrees
 *    clockwise from straight up. The rose stands upright (0); the leaves point
 *    left out of their stalk (-90).
 *
 * Getting these wrong is what made the first passes look impaled or
 * upside-down: a centred drawing puts the vine through the middle of the
 * flower, and a wrong bearing aims it back into the line.
 */
type Sprig = {
  src: string;
  /** Aspect of the asset's (tightened) viewBox. */
  aspect: string;
  /** Where the stem is cut, as fractions of the asset's box (0–1). */
  stem: { x: number; y: number };
  /** Growth direction in the artwork, degrees clockwise from up. */
  bearing: number;
};

const BLOOM: Sprig = {
  src: '/florals/rose-bloom.svg',
  aspect: 'aspect-[180/210]',
  stem: { x: 0.4, y: 0.65 },
  bearing: 9,
};
const LEAF_L: Sprig = {
  src: '/florals/leaf-large.svg',
  aspect: 'aspect-[117/84]',
  stem: { x: 0.96, y: 0.28 },
  bearing: -113,
};
const LEAF_S: Sprig = {
  src: '/florals/leaf-small.svg',
  aspect: 'aspect-[92/87]',
  stem: { x: 0.21, y: 0.97 },
  bearing: 17,
};

/**
 * What grows where, walking DOWN the vine: bloom, leaf, leaf, bloom, leaf …
 *
 * Two leaves between blooms rather than a strict bloom/leaf alternation — a
 * real stem carries more foliage than flower, and a 1:1 cycle at this spacing
 * read as a string of beads. `w` also steps around so no two neighbours are the
 * same size.
 *
 * `lift` is how far the drawing swings toward the top of the page, measured
 * from the vine's own PERPENDICULAR at that point: 0 sticks straight out of
 * the stem, 90 lies back along it. It is side-agnostic — VineFlorals works out
 * the rotation from the local tangent, the sprig's `bearing`, and which margin
 * the row grows into.
 */
const SPRIG_CYCLE: Array<{ sprig: Sprig; w: string; lift: number }> = [
  { sprig: BLOOM, w: 'w-14 lg:w-[4.5rem]', lift: 38 },
  { sprig: LEAF_L, w: 'w-12 lg:w-16', lift: 22 },
  { sprig: LEAF_S, w: 'w-9 lg:w-11', lift: 8 },
  { sprig: BLOOM, w: 'w-11 lg:w-14', lift: 22 },
  { sprig: LEAF_S, w: 'w-10 lg:w-12', lift: 34 },
  { sprig: LEAF_L, w: 'w-11 lg:w-14', lift: 4 },
];

/** How many drawings grow on the vine, per memory. */
const SPRIGS_PER_ROW = 3;

/**
 * Rough px-per-unit ratio between the vine's two axes, used ONLY to measure
 * arc length for spacing.
 *
 * The viewBox is 100 units wide however wide the section renders, and 100 units
 * tall per row — so a unit of x is worth more pixels than a unit of y (about
 * 11.5px against 7px at the section's full width). Measuring length in raw
 * units would treat the diagonal crossings as shorter than they draw and bunch
 * the sprigs there.
 *
 * A constant rather than the measured box on purpose: spacing must be identical
 * on the server and on first paint, or every sprig jumps once the
 * ResizeObserver reports. The ratio barely moves across breakpoints, and being
 * a few percent out only shifts a sprig along the stem.
 */
const VINE_UNIT_ASPECT = 1.6;

/** Steps per segment when flattening the curve to measure it. */
const VINE_FLATTEN_STEPS = 48;

/** Cubic Bezier component at `t`. */
const bez = (a: number, b: number, c: number, d: number, t: number) => {
  const u = 1 - t;
  return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
};

/**
 * Tangent of one vine segment at `t`, in viewBox units.
 *
 * Closed form rather than sampled, because the vine's control points are
 * always `(px, py + h/2)` and `(nx, ny - h/2)` — substituting those into the
 * derivative of a cubic collapses most of it away. It is zero horizontally at
 * both ends, which is the vertical tangent the lobes are built on.
 */
const vineTangent = (px: number, py: number, nx: number, ny: number, t: number) => {
  const h = ny - py;
  return {
    dx: 6 * (1 - t) * t * (nx - px),
    dy: 1.5 * h * ((1 - t) * (1 - t) + t * t),
  };
};

/**
 * Which way a sprig planted on a tangent of `(dx, dy)` should point, in degrees
 * clockwise from straight up — the same convention as `Sprig.bearing`.
 *
 * Take the vine's normal on the `outward` side, then swing it `lift` degrees
 * toward the top of the page. `box` is the layer's rendered size, used to turn
 * the viewBox-unit tangent into a screen-space one; without it (before the
 * first measure) fall back to a flat sideways fan.
 */
function sprigHeading(
  dx: number,
  dy: number,
  outward: number,
  lift: number,
  box: { w: number; h: number } | null,
  heightUnits: number
) {
  if (!box) return outward * (90 - lift);

  // Units are 0–100 across the box and 0–heightUnits down it.
  const tx = dx * (box.w / 100);
  const ty = dy * (box.h / heightUnits);

  // Normal to a tangent running DOWN the page: (-ty, tx) points left,
  // (ty, -tx) points right.
  const nx = outward > 0 ? ty : -ty;
  const ny = outward > 0 ? -tx : tx;

  // Rotate the normal toward the top of the page by `lift`. Screen y grows
  // downward, so lifting is anticlockwise on the right and clockwise on the
  // left — that is the `-outward`.
  const a = (-outward * lift * Math.PI) / 180;
  const vx = nx * Math.cos(a) - ny * Math.sin(a);
  const vy = nx * Math.sin(a) + ny * Math.cos(a);

  return (Math.atan2(vx, -vy) * 180) / Math.PI;
}

/**
 * Brush-ink florals growing off the vine (sm+ only, like the vine itself).
 *
 * Every sprig is planted ON the curve and grows AWAY from it: the point comes
 * from evaluating the same cubics the vine's `d` is built from, and the
 * drawing hangs off that point by its stem edge (see `Sprig`), tilted outward
 * from the line.
 *
 * There are `SPRIGS_PER_ROW` per memory, spread at one fixed interval from the
 * top of the vine to the bottom — the run is measured along the curve, so the
 * gaps stay even through the crossings instead of stretching where the stem
 * rakes sideways. The count scales with MEMORIES, so adding a memory adds
 * foliage rather than thinning what is there.
 *
 * Two things are deliberate:
 *
 *  • They are DOM siblings of the vine, not children of its <svg>. The vine is
 *    stretched with `preserveAspectRatio="none"`, so anything inside it
 *    inherits that non-uniform scale and a bloom would render squashed.
 *    Positioning in percent against the same box keeps them on the curve while
 *    they stay round.
 *  • Growth direction is decided by the ROW a sprig falls in, not by which
 *    side of centre it happens to sit on: every sprig in a row grows toward
 *    that row's empty margin (the side the vine bulges to). Using the local
 *    `x < 50` instead puts the sprigs either side of a crossing in opposite
 *    directions, and the ones on the memory's side grow into the text.
 *  • Each one fans off the vine's PERPENDICULAR where it is planted, not off
 *    a fixed sideways axis. On the near-vertical runs beside a memory that is
 *    much the same thing, but through a crossing the stem is raking across the
 *    section at 45° and a fixed axis leaves the sprigs lying at odd angles to
 *    it — some folded back along the line, some standing off it.
 *
 * The normal has to be computed in RENDERED PIXELS, not viewBox units. The
 * vine is stretched with `preserveAspectRatio="none"` and its rows are far
 * taller than the section is wide, so a slope of 1:1 in units draws as
 * something far steeper on screen; perpendicular-in-units is visibly not
 * perpendicular-on-screen. Hence the ResizeObserver: the box's real size is
 * what converts the tangent before the angle is taken. Until it has measured
 * (first paint, SSR) sprigs fall back to the flat sideways axis.
 *
 * The anchor span is what carries the rotation, with its origin at the curve
 * point (`transform-origin: 0 0`), so tilting swings the drawing about where it
 * joins the vine instead of sliding it off the line.
 */
function VineFlorals({ rows }: { rows: number }) {
  const height = vineHeight(rows);
  const nodes = vineNodes(rows);
  const reduce = !!useReducedMotion();

  const boxRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height: h } = entry.contentRect;
      setBox({ w: width, h });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Flatten the whole vine to a polyline, carrying the running length, so the
  // sprigs can be spaced along the CURVE rather than down the page. Spacing by
  // y instead spreads them out through the diagonal crossings, where the stem
  // covers far more ground per unit of height.
  const walk: Array<{ x: number; y: number; dx: number; dy: number; at: number }> = [];
  let run = 0;
  for (let i = 1; i < nodes.length; i++) {
    const [px, py] = nodes[i - 1];
    const [nx, ny] = nodes[i];
    if (px === nx && py === ny) continue; // coincident lobe pair at dwell 0
    // Same control points as the drawn path: vertical tangents at both ends.
    const bend = (ny - py) / 2;
    for (let s = 0; s <= VINE_FLATTEN_STEPS; s++) {
      const t = s / VINE_FLATTEN_STEPS;
      const x = bez(px, px, nx, nx, t);
      const y = bez(py, py + bend, ny - bend, ny, t);
      const last = walk[walk.length - 1];
      if (last) {
        run += Math.hypot((x - last.x) * VINE_UNIT_ASPECT, y - last.y);
      }
      walk.push({ x, y, ...vineTangent(px, py, nx, ny, t), at: run });
    }
  }

  // Keep the ends clear: the camera charm sits over the top of the vine and
  // the wedding rings under its tail, and a sprig there collides with the
  // drawing rather than reading as part of the stem.
  const usable = walk.filter((p) => p.y > VINE_LEAD * 2 && p.y < height - VINE_TAIL * 2);

  // Then step along that clear stretch at a fixed interval. Half an interval of
  // padding at each end keeps the first and last sprig off the boundary
  // instead of sitting right on it.
  const count = rows * SPRIGS_PER_ROW;
  const from = usable[0]?.at ?? 0;
  const span = (usable[usable.length - 1]?.at ?? 0) - from;
  const step = span / count;

  let cursor = 0;
  const planted = Array.from({ length: count }, (_, i) => {
    const target = from + step * (i + 0.5);
    while (cursor < usable.length - 1 && usable[cursor + 1].at < target) cursor++;
    return usable[cursor];
  }).filter(Boolean);

  return (
    <div
      ref={boxRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-10 hidden sm:block"
    >
      {planted.map(({ x, y, dx, dy }, i) => {
        const { sprig, w, lift } = SPRIG_CYCLE[i % SPRIG_CYCLE.length];
        const row = Math.min(rows - 1, Math.max(0, Math.floor((y - VINE_LEAD) / VINE_ROW)));
        const outward = VINE_OPPOSITE[VINE_SIDE(row)] === 'left' ? -1 : 1;
        // Mirror everything that grows right, so a leaf's stalk keeps facing
        // the vine instead of pointing away from it.
        const mirrored = outward > 0;

        // Where we want it to point, in the same degrees-clockwise-from-up as
        // `bearing`, and how far the artwork has to turn to get there.
        // Mirroring negates the artwork's own bearing.
        const heading = sprigHeading(dx, dy, outward, lift, box, height);
        const angle = heading - (mirrored ? -sprig.bearing : sprig.bearing);

        // Put the stem point itself on the anchor. After a horizontal mirror
        // the stem sits at `1 - x` of the box, so the shift flips with it.
        const stemX = mirrored ? 1 - sprig.stem.x : sprig.stem.x;

        return (
          // Unlike the memories these fade BOTH ways (`once: false`), so a
          // sprig scrolled past and come back to lights up again. Only opacity
          // is animated — the transform is placement, and handing it to motion
          // would fight the rotation set here.
          <motion.span
            key={`${x}-${y}`}
            className="absolute"
            initial={reduce ? undefined : { opacity: 0 }}
            whileInView={reduce ? undefined : { opacity: 1 }}
            viewport={{ once: false, margin: '-9% 0px -9% 0px' }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
            style={{
              left: `${x}%`,
              top: `${(y / height) * 100}%`,
              transform: `rotate(${angle}deg)`,
              transformOrigin: '0 0',
            }}
          >
            <InkCharm
              src={sprig.src}
              className={cn('absolute', sprig.aspect, w)}
              style={{
                transform: `translate(${-stemX * 100}%, ${-sprig.stem.y * 100}%)${mirrored ? ' scaleX(-1)' : ''}`,
              }}
            />
          </motion.span>
        );
      })}
    </div>
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
function InkCharm({
  src,
  className,
  style,
}: {
  src: string;
  className?: string;
  /** Merged after the mask properties — for placement (see VineFlorals). */
  style?: CSSProperties;
}) {
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
        ...style,
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
