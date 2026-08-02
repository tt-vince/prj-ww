'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform, useMotionTemplate } from 'motion/react';
import heroLily from '@/public/hero-lily.jpg';
import lacePng from '@/public/lace.png';
import { WeekStrip } from '@/components/letter/week-strip';
import { COUPLE_NAMES, WEDDING_DAY_LABEL } from '@/lib/wedding';

const [NAME_A, NAME_B] = COUPLE_NAMES;

/**
 * Hero + lily backdrop. The lily photo ends flush at the white CountdownBand
 * below it (no overlap). Our Story, further down, pulls up `-mt-48` into the
 * band's white bottom padding.
 *
 * The section is 150svh tall and the content is `sticky top-0` inside it, one
 * viewport high: the names stay centred on screen while the hero scrolls, then
 * unpin and travel up with the page. The photo fills the whole 150svh, so it
 * keeps going below the pinned content and the CountdownBand's white dome rises
 * into its last 12rem.
 *
 * The sticky track stops 12rem short of the section's bottom — exactly the
 * band's `-mt-48` bite. That hands the pin over the moment the dome's crown
 * reaches the bottom of the screen, so the two never overlap: without it the
 * dome slides up over the still-pinned names.
 *
 * Scroll-zoom: the lily photo lives in its own `motion.div` layer so it can
 * scale up, blur, and fade as the hero scrolls out of view (Motion example
 * `react-scroll-zoom-hero`). The overlay + text sit above it, unscaled. The
 * offset ends at `end end` so the zoom finishes exactly as the pin releases.
 *
 * The photo layer is clipped by its OWN wrapper rather than by the section:
 * `overflow-hidden` on an ancestor of a sticky element makes it stick inside a
 * box that never scrolls, which kills the pin.
 */
export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  // 0 while hero pinned at top -> 1 once fully scrolled past.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const blurPx = useTransform(scrollYProgress, [0, 1], [0, 8]);
  const filter = useMotionTemplate`blur(${blurPx}px)`;

  // Hero content reveals on mount (above the fold), staggered top to bottom.
  const heroItem = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div ref={ref} className="relative h-[150svh]">
      {/* Full-bleed lily photo, zoom/blur/fade on scroll, clipped here. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{ scale, filter, transformOrigin: '50% 30%' }}
        >
          {/* next/image (static import): responsive srcset, preload as the LCP
              image, and an inline blur-up placeholder while it streams in. */}
          <Image
            src={heroLily}
            alt=""
            fill
            priority
            placeholder="blur"
            sizes="100vw"
            className="object-cover object-[50%_top]"
          />
        </motion.div>
        {/* Dark overlay for text legibility (static). */}
        <div className="absolute inset-0 bg-black/65" />
      </div>
      {/* Sticky track: the section minus the dome's 12rem overlap. */}
      <div className="h-[calc(150svh-12rem)]">
        <header className="sticky top-0 flex h-svh flex-col px-gutter text-center">
        {/* Two groups, one screen. The lace + line ride in a `flex-1` row so
            they sit centred in whatever space is left above the date, and the
            date block is a `shrink-0` row pinned to the bottom. Because they are
            separate flex rows they can never overlap: on a short screen the
            centre row is the one that gives up height, and the lace is capped in
            `svh` (below) so it shrinks with it instead of pushing through. */}
        <motion.div
          className="flex min-h-0 flex-1 flex-col items-center justify-center pb-8"
          initial="hidden"
          animate="show"
          transition={{ staggerChildren: 0.18, delayChildren: 0.15 }}
        >
          {/* Names sit inside a square floral lace frame (public/lace.png):
              a frosted-glass window shows through the lace's open center,
              with the couple's names stacked to fit the square. */}
          <motion.div
            variants={heroItem}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative aspect-square w-[min(86vw,26rem,46svh)] -rotate-6 md:w-[min(86vw,33.8rem,46svh)]"
          >
            {/* Frosted glass filling the lace's open window. */}
            <div
              aria-hidden
              className="absolute inset-[23%] rounded-sm bg-white/[0.07] backdrop-blur-[3px]"
            />
            {/* The lace frame. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 drop-shadow-[0_8px_30px_rgba(30,42,24,0.55)]"
            >
              <Image
                src={lacePng}
                alt=""
                fill
                priority
                sizes="(max-width: 768px) 86vw, 541px"
                className="object-contain"
              />
            </div>
            {/* Names centered in the window, stacked to fit the square. */}
            <h1 className="absolute inset-[22%] font-weight-bold flex flex-col items-center justify-center gap-0.5 font-script leading-none text-white drop-shadow-[0_2px_14px_rgba(30,42,24,0.75)]">
              {/* Sized against the lace window rather than the type scale:
                  the names have to fit the frame they sit in, so they track
                  the frame's own breakpoint, not the document's. */}
              <span className="text-6xl md:text-[4.875rem]">{NAME_A}</span>
              <span className="text-2xl opacity-75 md:text-[1.95rem]">&amp;</span>
              <span className="text-6xl md:text-[4.875rem]">{NAME_B}</span>
            </h1>
          </motion.div>
          <motion.p
            variants={heroItem}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            // `-mr-` cancels the trailing letter-space the tracking adds after
            // the final glyph: without it the line is both off-centre and 0.3em
            // wider than its column, which clipped it on a 360px phone.
            className="-mr-[0.3em] font-script text-[clamp(2rem,7svh,3rem)] tracking-[0.3em] text-white"
          >
            are getting married!
          </motion.p>
          {/* <Countdown
            align="center"
            className="mt-10 text-white drop-shadow-[0_1px_10px_rgba(30,42,24,0.65)]"
          /> */}
        </motion.div>

        {/* Bottom group. The hero says who, then what, then when: the
            spelled-out date over the week strip with the day ringed, sitting on
            the bottom edge of the screen. Both are white with the names' shadow
            so they hold up over the photo; `WeekStrip` draws itself in
            `currentColor`. Its stagger picks up where the centre group's left
            off. */}
        <motion.div
          className="flex shrink-0 flex-col items-center pb-[max(2rem,5svh)]"
          initial="hidden"
          animate="show"
          transition={{ staggerChildren: 0.18, delayChildren: 0.51 }}
        >
          <motion.p
            variants={heroItem}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="font-sans text-subhead uppercase leading-none tracking-[0.16em] text-white drop-shadow-[0_2px_14px_rgba(30,42,24,0.75)]"
          >
            {WEDDING_DAY_LABEL}
          </motion.p>
          <motion.div
            variants={heroItem}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <WeekStrip className="mt-5 text-white drop-shadow-[0_2px_14px_rgba(30,42,24,0.75)]" />
          </motion.div>
        </motion.div>
        </header>
      </div>
    </div>
  );
}
