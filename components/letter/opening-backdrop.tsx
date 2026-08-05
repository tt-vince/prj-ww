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
 * whole opening, and the overlay drives from a dark scrim to solid ink #2A2D1A
 * over the full scroll of it. The countdown text therefore sits on a
 * still-greening photo, and only Our Story is completely green.
 *
 * The overlay reaches solid ink at 0.94 rather than 1: Our Story pulls up into
 * this wrapper's last stretch (`-mt-48`, `sm:-mt-16`), so the field has to be
 * fully green slightly before the wrapper ends or its opaque dome would cover a
 * still-transitioning background and put a visible step at the join.
 *
 * The photo is one layer for the whole opening, so it covers a taller box than
 * the Hero alone: `object-cover` scales it to that height and
 * `object-[50%_top]` keeps the crop anchored at the top, where the lilies are.
 *
 * `overflow-hidden` sits on the backdrop's own wrapper, never on an ancestor of
 * the Hero: an `overflow-hidden` ancestor makes a `sticky` element stick inside
 * a box that never scrolls, which kills the Hero's pin. The backdrop is a
 * SIBLING of the Hero, so its clip cannot reach the sticky header.
 */
export function OpeningBackdrop() {
  const ref = useRef<HTMLDivElement>(null);
  // 0 at the top of the Hero -> 1 when the opening's bottom meets the viewport
  // bottom, i.e. where Our Story takes over.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const blurPx = useTransform(scrollYProgress, [0, 1], [0, 8]);
  const filter = useMotionTemplate`blur(${blurPx}px)`;
  // Scrim -> ink. The middle stop is a green-tinted scrim rather than a straight
  // mix of the two ends, so the photo greens as it darkens instead of going grey
  // on the way through.
  const overlay = useTransform(
    scrollYProgress,
    [0, 0.5, 0.94],
    ['rgba(0, 0, 0, 0.65)', 'rgba(34, 37, 21, 0.86)', 'rgb(42, 45, 26)']
  );

  return (
    <div ref={ref} className="relative bg-ink">
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
        <motion.div className="absolute inset-0" style={{ backgroundColor: overlay }} />
      </div>
      <Hero />
      <CountdownBand />
    </div>
  );
}
