'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform, useMotionTemplate } from 'motion/react';
import heroLily from '@/public/hero-lily.jpg';
import { Hero } from '@/components/letter/hero';
import { CountdownBand } from '@/components/letter/countdown-band';

/**
 * The opening of the letter — Hero and CountdownBand on ONE background that
 * arrives at Our Story's green.
 *
 * The lily photo and its overlay live HERE rather than in the Hero, because the
 * green has to arrive gradually across BOTH sections: with the photo confined to
 * the Hero, the countdown band was already flat ink the moment it appeared, and
 * the transition was over before the reader got to it. So the photo spans the
 * whole opening, and the overlay drives from a dark scrim to solid ink #0A110E
 * over the full scroll of it. The countdown text therefore sits on a
 * still-greening photo, and only Our Story is completely green.
 *
 * The range ends at `['end', '75%']` — the opening's bottom edge a quarter of the
 * way up the screen, i.e. with Our Story a quarter visible. That is where the
 * background is finally, completely green.
 *
 * The ink layer reaches full opacity at 0.94 rather than 1. Our Story is opaque
 * `bg-ink` and pulls up into this wrapper (`-mt-48`, `sm:-mt-16`), so it starts
 * covering the backdrop before the range ends; if the field above were still
 * lighter at that moment, the dome's curve would show as a hard tonal edge. The
 * last 6% is therefore already solid, and the visible part of the transition
 * still runs the full length of the Hero and the countdown.
 *
 * The photo is one layer for the whole opening, so it covers a taller box than
 * the Hero alone: `object-cover` scales it to that height and the crop is
 * CENTRED, losing an equal band off the top and the bottom. The zoom's
 * `transformOrigin` matches it, so scaling pushes outwards evenly from the same
 * point the crop is anchored to.
 *
 * `overflow-hidden` sits on the backdrop's own wrapper, never on an ancestor of
 * the Hero: an `overflow-hidden` ancestor makes a `sticky` element stick inside
 * a box that never scrolls, which kills the Hero's pin. The backdrop is a
 * SIBLING of the Hero, so its clip cannot reach the sticky header.
 */
export function OpeningBackdrop() {
  const ref = useRef<HTMLDivElement>(null);
  // 0 at the top of the Hero -> 1 once the opening's bottom edge has risen to
  // 75% of the viewport, i.e. once Our Story is a quarter visible.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end 75%'],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const blurPx = useTransform(scrollYProgress, [0, 1], [0, 8]);
  const filter = useMotionTemplate`blur(${blurPx}px)`;
  // The colour transition is TWO stacked layers fading in over each other, not
  // one layer interpolating its backgroundColor. Two reasons:
  //
  //  - Smoothness. `opacity` is composited on the GPU, so it can animate without
  //    repainting a full-viewport box on every scroll frame. Interpolating a
  //    `backgroundColor` repaints that box each frame instead, which is what made
  //    the transition stutter.
  //  - Predictability. Interpolating between four rgba() stops moves hue and
  //    alpha at once, so the ramp visibly slowed at the green stop and then
  //    lurched dark. Two overlapping opacity fades ramp monotonically: the green
  //    comes up, the ink takes over it, and nothing reverses direction.
  //
  // The two overlap between 0.45 and 0.6, which is what makes the handover read
  // as one continuous darkening rather than green-then-ink.
  const greenIn = useTransform(scrollYProgress, [0, 0.6], [0, 1]);
  const inkIn = useTransform(scrollYProgress, [0.45, 0.94], [0, 1]);

  return (
    <div ref={ref} className="relative bg-ink">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{ scale, filter, transformOrigin: '50% 50%' }}
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
            className="object-cover object-center"
          />
        </motion.div>
        {/* Constant scrim: the hero's type sits on the photo from the first
            frame, so its legibility cannot depend on the scroll position. */}
        <div className="absolute inset-0 bg-black/55" />
        {/* Botanical, then ink over it. `willChange` keeps both on their own
            compositor layer for the whole scroll instead of being promoted and
            dropped repeatedly. */}
        <motion.div
          className="absolute inset-0 bg-botanical"
          style={{ opacity: greenIn, willChange: 'opacity' }}
        />
        <motion.div
          className="absolute inset-0 bg-ink"
          style={{ opacity: inkIn, willChange: 'opacity' }}
        />
      </div>
      <Hero />
      <CountdownBand />
    </div>
  );
}
