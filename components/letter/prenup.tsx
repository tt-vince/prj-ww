import { SectionHeading } from '@/components/letter/section-heading';
import { PrenupMosaic, type Shot } from '@/components/letter/prenup-gallery';

/**
 * Prenup gallery — EDGE-TO-EDGE white section between Our Story and
 * DayItself. It carries the overlap that DayItself used to: `-mt-48` pulls it
 * up BEHIND Our Story's bottom dome (z-0 under its z-10) and `pt-76` clears
 * the dome again before any content. DayItself follows as a plain white
 * section, so the seam between them is invisible.
 *
 * `pt-76` (19rem) is the mirror of `countdown-band`'s `pb-72`: 7rem of visible
 * gap plus the 12rem the dome bites out of it. Keep the two in step — the
 * countdown sits above the dome with the same 7rem showing, so if that gap is
 * retuned, retune this padding by the same amount.
 *
 * Layout: a photo mosaic — bare images, no frame, no rounding, no shadow, no
 * caption, and no horizontal padding, so it runs to both screen edges. Every
 * tile is the SAME HEIGHT (a fixed `grid-auto-rows`); tiles differ only in
 * WIDTH, and landscape shots take two columns. 2 columns on phones, 4 from `sm`
 * up, 6px gutter. Because heights are uniform there is no masonry packing and
 * nothing needs measuring. This file stays a server component that does the
 * slot-budget math; the grid itself lives in `prenup-gallery.tsx` (client),
 * because tiles are clickable — a tap morphs the photo into a centered
 * lightbox via motion's shared `layoutId`.
 *
 * The mosaic is capped at 2 rows on desktop and 3 on mobile, so it stays a band
 * in the letter rather than an endless wall. The cap is a budget of column
 * slots (cols x rows) that each shot spends 1 of, or 2 if it's landscape — see
 * `fittingCount`. A shot beyond the budget is NOT rendered, so adding a seventh
 * shot below does nothing until the row cap goes up. `grid-flow-row-dense`
 * keeps a 2-column tile from leaving a hole in the column beside it.
 *
 * Photos are placeholders: seeded picsum stand-ins (same approach as
 * `our-story.tsx`) so each slot keeps its image between loads. Drop real files
 * in `/public/prenup/`, point `image` at them, and set `w`/`h` to the file's
 * real pixel size — that is what decides whether it takes one column or two.
 * Unset `image` falls back to the striped placeholder. Once the files are local,
 * `next/image` becomes usable here; remote picsum URLs cannot go through it
 * because `next.config.ts` declares no `images.remotePatterns`.
 */

// Slot costs run [1, 2, 1, 1, 1, 2]: the first five spend the mobile budget of
// 6 exactly, and all six spend the desktop budget of 8 exactly — so both
// breakpoints come out as full rectangles with no gaps.
const SHOTS: Shot[] = [
  { alt: 'the first look', w: 900, h: 1100, image: 'https://picsum.photos/seed/ww-prenup-1/900/1100' },
  { alt: 'rain again', w: 1400, h: 900, image: 'https://picsum.photos/seed/ww-prenup-2/1400/900' },
  { alt: 'the long walk', w: 900, h: 1100, image: 'https://picsum.photos/seed/ww-prenup-3/900/1100' },
  { alt: 'golden hour', w: 900, h: 1350, image: 'https://picsum.photos/seed/ww-prenup-4/900/1350' },
  { alt: 'borrowed bicycle', w: 900, h: 1100, image: 'https://picsum.photos/seed/ww-prenup-5/900/1100' },
  { alt: 'one more, promise', w: 1500, h: 1000, image: 'https://picsum.photos/seed/ww-prenup-6/1500/1000' },
];

/** Column count and row cap per breakpoint. Must match the grid's Tailwind classes. */
const MOBILE = { cols: 2, rows: 3 };
const DESKTOP = { cols: 4, rows: 2 };

/** A landscape shot occupies two columns, so it costs two slots of the budget. */
function slotCost(shot: Shot) {
  return shot.w > shot.h ? 2 : 1;
}

/** How many leading shots fit in `cols * rows` column slots. */
function fittingCount({ cols, rows }: { cols: number; rows: number }) {
  const budget = cols * rows;
  let spent = 0;
  let count = 0;
  for (const shot of SHOTS) {
    const cost = slotCost(shot);
    if (spent + cost > budget) break;
    spent += cost;
    count += 1;
  }
  return count;
}

const MOBILE_COUNT = fittingCount(MOBILE);
const DESKTOP_COUNT = fittingCount(DESKTOP);

// Rendered once and trimmed per breakpoint in CSS (`max-sm:hidden`), so the
// count never depends on JS and nothing shifts on load.
const VISIBLE = SHOTS.slice(0, Math.max(MOBILE_COUNT, DESKTOP_COUNT));

export function Prenup() {
  return (
    <section id="prenup" className="relative z-0 -mt-48 bg-white pt-76">
      <Heading />

      <PrenupMosaic shots={VISIBLE} mobileCount={MOBILE_COUNT} />

      {/* Full-bleed, no bottom padding: the border closes the section and the
          drawing's baseline meets DayItself's white. Same treatment as the
          band-under-string-lights that closes `Hotels` into the RSVP band. */}
      <FloralBorderPeonies />
    </section>
  );
}

/**
 * Peony border that closes the section, edge to edge. The asset ships as one
 * flat colour (#145b9f), so it is painted through a CSS mask — here in the
 * letter's ink. Aspect ratio is the viewBox's (1032.1908 x 270.9679).
 */
function FloralBorderPeonies() {
  const mask = "url('/icons/hand_drawn/illustrations/floral-border-peonies.svg')";
  return (
    <span
      aria-hidden
      className="block aspect-[1032.1908/270.9679] w-full bg-ink"
      style={{
        maskImage: mask,
        WebkitMaskImage: mask,
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        // 20px wider than the box (scaled, so taller too) and centred: the
        // SVG's own transparent margin gets cropped off instead of holding the
        // drawing back from the screen edges.
        maskSize: 'calc(100% + 20px) auto',
        WebkitMaskSize: 'calc(100% + 20px) auto',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
      }}
    />
  );
}

function Heading() {
  return (
    <SectionHeading
      className="px-5 sm:px-9"
      title="Before the day"
      kicker="Our prenup shoot — photos coming soon"
    />
  );
}

