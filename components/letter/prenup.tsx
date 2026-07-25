'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';

/**
 * Prenup gallery — EDGE-TO-EDGE white section between Our Story and
 * DayItself. It now carries the overlap that DayItself used to: `-mt-48` pulls
 * it up BEHIND Our Story's bottom dome (z-0 under its z-10) and `pt-56` clears
 * the dome again before any content. DayItself follows as a plain white
 * section, so the seam between them is invisible.
 *
 * Motion: the horizontal-scroll-gallery pattern from
 * https://motion.dev/examples/react-scroll-horizontal — a tall track holds a
 * sticky full-height viewport, and vertical scroll progress through the track
 * drives the photo rail sideways. Two changes from the example:
 *
 *   • the pan distance is MEASURED (ResizeObserver) instead of computed from
 *     hardcoded card width + gap, so responsive card sizes can't desync it;
 *   • the track height is `100vh + distance`, which makes the mapping 1:1 —
 *     one pixel of vertical scroll moves the rail one pixel sideways.
 *
 * Photos are placeholders: seeded picsum stand-ins (same approach as
 * `our-story.tsx`) so each slot keeps its image between loads. Drop real files
 * in `/public/prenup/` and point `image` at them; unset falls back to the
 * striped "photo · …" placeholder.
 */

type Shot = {
  /** Handwritten note under the frame. */
  caption: string;
  image?: string;
};

const SHOTS: Shot[] = [
  { caption: 'the first look', image: 'https://picsum.photos/seed/ww-prenup-1/900/1100' },
  { caption: 'rain again ♡', image: 'https://picsum.photos/seed/ww-prenup-2/900/1100' },
  { caption: 'the long walk', image: 'https://picsum.photos/seed/ww-prenup-3/900/1100' },
  { caption: 'golden hour', image: 'https://picsum.photos/seed/ww-prenup-4/900/1100' },
  { caption: 'borrowed bicycle', image: 'https://picsum.photos/seed/ww-prenup-5/900/1100' },
  { caption: 'one more, promise', image: 'https://picsum.photos/seed/ww-prenup-6/900/1100' },
];

export function Prenup() {
  const trackRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  /** How far the rail must travel for its last card to land at the right edge. */
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    const rail = railRef.current;
    const viewport = viewportRef.current;
    if (!rail || !viewport) return;

    const measure = () => {
      setDistance(Math.max(0, rail.scrollWidth - viewport.clientWidth));
    };
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(rail);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start start', 'end end'],
  });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);
  const progress = useTransform(scrollYProgress, [0, 1], [0, 1]);

  // Reduced motion: no pin, no transform — the rail is an ordinary
  // swipeable/scrollable row (matches the example's media-query fallback).
  if (reduceMotion) {
    return (
      <section id="prenup" className="relative z-0 -mt-48 bg-white pt-56">
        <Heading />
        <div className="mt-12 overflow-x-auto px-5 pb-4 sm:px-9">
          <div className="flex gap-6">
            {SHOTS.map((shot) => (
              <Frame key={shot.caption} shot={shot} />
            ))}
          </div>
        </div>
        <div className="mt-10">
          <FloralBorderPeonies />
        </div>
      </section>
    );
  }

  return (
    // `pt-32` (not the `pt-56` other overlapping sections use): the sticky
    // column centres its content in the viewport, so it already contributes
    // ~half its slack above the heading. 128px - 192px overlap + that slack
    // lands the heading the same ~32px below the dome as DayItself used to.
    <section id="prenup" className="relative z-0 -mt-48 bg-white pt-32">
      <div
        ref={trackRef}
        className="relative"
        // 1:1 mapping — see the note at the top of the file.
        style={{ height: `calc(100dvh + ${distance}px)` }}
      >
        <div className="sticky top-0 flex h-dvh flex-col justify-center overflow-hidden">
          <Heading />

          {/* Progress rail — how far through the gallery we are. No track
              behind it: with only white and ink available, a tinted groove is
              not on the palette, so the ink line simply grows on the paper. */}
          <div className="mx-auto mt-5 h-px w-32 overflow-hidden sm:w-40">
            <motion.span
              aria-hidden
              className="block h-px origin-left bg-ink"
              style={{ scaleX: progress }}
            />
          </div>

          <div ref={viewportRef} className="mt-7 overflow-hidden">
            <motion.div
              ref={railRef}
              className="flex w-max gap-6 px-5 will-change-transform sm:gap-10 sm:px-9"
              style={{ x }}
            >
              {SHOTS.map((shot) => (
                <Frame key={shot.caption} shot={shot} />
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Full-bleed, no bottom padding: the border closes the section and the
          drawing's baseline meets DayItself's white. Same treatment as the
          band-under-string-lights that closes `Hotels` into the RSVP band. */}
      <div className="mt-4">
        <FloralBorderPeonies />
      </div>
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
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
      }}
    />
  );
}

function Heading() {
  return (
    <div className="px-5 text-center sm:px-9">
      <h2 className="font-script text-4xl leading-tight text-[color:var(--script)] sm:text-5xl">
        Before the day
      </h2>
      <p className="mt-2 font-countdown text-sm tracking-wide text-ink">
        Our prenup shoot — photos coming soon
      </p>
    </div>
  );
}

/** One photo: white frame, handwritten caption under it. */
function Frame({ shot }: { shot: Shot }) {
  const { image, caption } = shot;
  return (
    <figure className="shrink-0 rounded-[2px] bg-white p-3 pb-9 shadow-[0_14px_28px_-10px_rgba(30,42,24,0.35),0_2px_5px_rgba(30,42,24,0.18)]">
      {/* Height-driven, not width-driven: the frame is sized off the viewport
          so the pinned column fills its 100dvh predictably (leftover slack top
          and bottom stays close to the 24-unit padding other sections use).
          Width follows from the aspect ratio. */}
      <div className="relative aspect-[4/5] h-[46dvh] overflow-hidden rounded-[1px] bg-white sm:h-[54dvh]">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={caption}
            className="size-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-[repeating-linear-gradient(45deg,#1e2a18,#1e2a18_1px,#ffffff_1px,#ffffff_10px)]">
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink">
              photo · {caption.replace(/\s*♡$/, '')}
            </span>
          </div>
        )}
      </div>
      <figcaption className="mt-3 text-center font-script text-xl text-[color:var(--script)]">
        {caption}
      </figcaption>
    </figure>
  );
}
