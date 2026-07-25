'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useMotionTemplate } from 'motion/react';
import { COUPLE_NAMES } from '@/lib/wedding';

const [NAME_A, NAME_B] = COUPLE_NAMES;

/**
 * Hero + lily backdrop. The lily photo ends flush at the white CountdownBand
 * below it (no overlap). Our Story, further down, pulls up `-mt-48` into the
 * band's white bottom padding.
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
    <div ref={ref} className="relative overflow-hidden">
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
        className="pointer-events-none absolute inset-0 bg-ink/55"
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
              className="pointer-events-none absolute inset-0 drop-shadow-[0_8px_30px_rgba(30,42,24,0.55)]"
              style={{
                backgroundImage: 'url(/lace.png)',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
              }}
            />
            {/* Names centered in the window, stacked to fit the square. */}
            <h1 className="absolute inset-[22%] font-weight-bold flex flex-col items-center justify-center gap-0.5 font-script leading-none text-white drop-shadow-[0_2px_14px_rgba(30,42,24,0.75)]">
              <span className="text-6xl md:text-[4.875rem]">{NAME_A}</span>
              <span className="text-2xl opacity-75 md:text-[1.95rem]">&amp;</span>
              <span className="text-6xl md:text-[4.875rem]">{NAME_B}</span>
            </h1>
          </motion.div>
          <motion.p
            variants={heroItem}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="font-script text-5xl tracking-[0.3em] text-white"
          >
            are getting married!
          </motion.p>
          {/* <Countdown
            align="center"
            className="mt-10 text-white drop-shadow-[0_1px_10px_rgba(30,42,24,0.65)]"
          /> */}
        </motion.div>
      </header>
    </div>
  );
}
