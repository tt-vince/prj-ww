'use client';

import { Fragment, useRef } from 'react';
import { motion, useScroll, useTransform, useMotionTemplate } from 'motion/react';
import {
  COUPLE_NAMES,
  WEDDING_MONTH_LABEL,
  WEDDING_WEEK,
} from '@/lib/wedding';

const [NAME_A, NAME_B] = COUPLE_NAMES;

/**
 * Hero + lily backdrop. The backdrop's `pb-48` is load-bearing: Our Story
 * (next section) pulls itself up with `-mt-48` so its green dome overlaps
 * into the photo. Keep the two values in sync.
 *
 * Scroll-zoom: the lily photo lives in its own `motion.div` layer so it can
 * scale up, blur, and fade as the hero scrolls out of view (Motion example
 * `react-scroll-zoom-hero`). The overlay + text sit above it, unscaled.
 */
export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  // 0 while hero pinned at top -> 1 once fully scrolled past.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
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
    <div ref={ref} className="relative overflow-hidden pb-48">
      {/* Full-bleed lily photo, zoom/blur/fade on scroll. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          scale,
          filter,
          transformOrigin: '50% 30%',
          backgroundImage: 'url(/hero-lily.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: '50% top',
        }}
      />
      {/* Dark overlay for text legibility (static). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-black/50"
      />
      <header className="relative flex min-h-svh flex-col items-center justify-center px-5 py-16 text-center sm:px-9">
        <motion.div
          className="flex flex-col items-center"
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
            className="relative mt-6 aspect-square w-[min(86vw,26rem)] -rotate-6 md:w-[min(86vw,33.8rem)]"
          >
            {/* Frosted glass filling the lace's open window. */}
            <div
              aria-hidden
              className="absolute inset-[23%] rounded-sm bg-white/[0.07] backdrop-blur-[3px]"
            />
            {/* The lace frame. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 drop-shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
              style={{
                backgroundImage: 'url(/lace.png)',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
              }}
            />
            {/* Names centered in the window, stacked to fit the square. */}
            <h1 className="absolute inset-[22%] font-weight-bold flex flex-col items-center justify-center gap-0.5 font-script leading-none text-[#f3e3e7] drop-shadow-[0_2px_14px_rgba(0,0,0,0.7)]">
              <span className="text-6xl md:text-[4.875rem]">{NAME_A}</span>
              <span className="text-2xl opacity-75 md:text-[1.95rem]">&amp;</span>
              <span className="text-6xl md:text-[4.875rem]">{NAME_B}</span>
            </h1>
          </motion.div>
          <motion.p
            variants={heroItem}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="font-script text-5xl tracking-[0.3em] text-white/70"
          >
            are getting married!
          </motion.p>
          <motion.p
            variants={heroItem}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="mt-10 font-countdown text-sm tracking-[0.1em] text-white sm:text-lg"
          >
            {WEDDING_MONTH_LABEL}
          </motion.p>
          {/* Calendar strip: the wedding week, weekday over date number,
              columns separated by small dots, the day itself circled as if
              by hand on a paper calendar. */}
          <motion.div
            variants={heroItem}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="mt-4 flex items-center justify-center"
          >
            {WEDDING_WEEK.map((d, i) => (
              <Fragment key={d.label}>
                {i > 0 ? (
                  <span
                    aria-hidden
                    className="mx-2 size-[3px] shrink-0 rounded-full bg-white/45 sm:mx-4"
                  />
                ) : null}
                <span className="relative flex w-7 flex-col items-center gap-1 py-0.5 sm:w-8">
                  {d.isWeddingDay ? (
                    <svg
                      viewBox="0 0 64 64"
                      preserveAspectRatio="none"
                      aria-hidden
                      className="pointer-events-none absolute -inset-x-2 -inset-y-2 text-[#f3e3e7] h-[calc(100%+1rem)] w-[calc(100%+1rem)]"
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
                  <span className="font-countdown text-[9px] leading-none tracking-[0.1em] text-white/65 sm:text-[10px]">
                    {d.label}
                  </span>
                  <span
                    className={`font-countdown text-sm leading-none sm:text-base ${
                      d.isWeddingDay ? 'text-white' : 'text-white/75'
                    }`}
                  >
                    {d.date}
                  </span>
                </span>
              </Fragment>
            ))}
          </motion.div>
          {/* <Countdown
            align="center"
            className="mt-10 text-[#f3e3e7] drop-shadow-[0_1px_10px_rgba(0,0,0,0.6)]"
          /> */}
        </motion.div>
      </header>
    </div>
  );
}
