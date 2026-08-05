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
 * The last leg of the ramp is deliberately almost flat. Our Story is opaque
 * `bg-ink` and pulls up into this wrapper (`-mt-48`, `sm:-mt-16`), so it starts
 * covering the backdrop well before the range ends; if the overlay were still
 * visibly lighter at that moment, the dome's curve would show as a hard tonal
 * edge against the field above it. So the overlay is at ink-minus-nothing (0.97
 * alpha) by 0.85 and merely settles onto solid ink across the rest — a step too
 * small to see at the join, with the visible part of the transition still
 * running the full length of the Hero and the countdown.
 *
 * The photo is one layer for the whole opening, so it covers a taller box than
 * the Hero alone: `object-cover` scales it to that height and the crop is
 * anchored at the photo's BOTTOM edge, so what the crop loses is taken off the
 * top. The zoom's `transformOrigin` matches, otherwise scaling would drift the
 * anchored edge back off-frame.
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
  // Scrim -> ink, by way of the palette's botanical green. A straight mix of the
  // two ends passes through grey; routing the middle stop through #2A4A3B means
  // the photo visibly GREENS as it darkens, which is the point of the effect.
  const overlay = useTransform(
    scrollYProgress,
    [0, 0.45, 0.85, 1],
    [
      'rgba(0, 0, 0, 0.65)',
      'rgba(42, 74, 59, 0.86)',
      'rgba(10, 17, 14, 0.97)',
      'rgb(10, 17, 14)',
    ]
  );

  return (
    <div ref={ref} className="relative bg-ink">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{ scale, filter, transformOrigin: '50% 100%' }}
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
            className="object-cover object-[50%_bottom]"
          />
        </motion.div>
        <motion.div className="absolute inset-0" style={{ backgroundColor: overlay }} />
      </div>
      <Hero />
      <CountdownBand />
    </div>
  );
}
