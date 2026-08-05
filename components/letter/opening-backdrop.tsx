'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform, useMotionTemplate } from 'motion/react';
import heroLily from '@/public/hero-lily.jpg';
import { Hero } from '@/components/letter/hero';
import { CountdownBand } from '@/components/letter/countdown-band';
import { OurStory } from '@/components/letter/our-story';

/**
 * The opening of the letter — Hero, CountdownBand and Our Story on ONE
 * background: the lily photo, greening away to solid ink #0A110E by the time Our
 * Story ends.
 *
 * TWO colours, never three. The ramp is the photo under a fixed dark scrim,
 * with ONE ink layer fading in on top. An earlier version faded a botanical
 * green in first and then covered it with ink, which read as a third colour
 * arriving and leaving mid-scroll. The palette's accents are for controls; a
 * background transition only ever moves between the photo and the ink.
 *
 * The photo runs all the way to the END of Our Story, and the ink layer only
 * reaches full opacity there. Our Story therefore starts on a still-visible
 * photo and finishes on flat green — previously it was opaque `bg-ink` and the
 * photo stopped dead at its top edge, so the transition was over before the
 * section it was transitioning to.
 *
 * The backdrop is `sticky top-0 h-svh`, i.e. viewport-sized and pinned, with
 * `-mb-[100svh]` cancelling the flow height it would otherwise add. That keeps
 * the photo framed to the screen (an `absolute inset-0` layer over three
 * sections would be scaled to a box several viewports tall and cropped to a
 * sliver) and keeps it in place behind all three sections as they scroll over
 * it. Everything after it is `relative`, so it paints above.
 *
 * `overflow-hidden` sits on the backdrop's own box, never on an ancestor of the
 * Hero: an `overflow-hidden` ancestor makes a `sticky` element stick inside a
 * box that never scrolls, which would kill the Hero's own pin. The backdrop is
 * the Hero's SIBLING, so its clip cannot reach the sticky header.
 */
export function OpeningBackdrop() {
  const ref = useRef<HTMLDivElement>(null);
  // 0 at the top of the Hero -> 1 when the bottom of Our Story meets the bottom
  // of the viewport, which is where the background is finally flat green.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const blurPx = useTransform(scrollYProgress, [0, 1], [0, 8]);
  const filter = useMotionTemplate`blur(${blurPx}px)`;
  // One ink layer, fading in. `opacity` is composited on the GPU, so this does
  // not repaint a full-viewport box on every scroll frame the way interpolating
  // a `backgroundColor` did. It lands at 0.96 rather than 1 so the last sliver
  // of the section is unambiguously flat, with no residual photo texture under
  // the closing lines.
  const inkIn = useTransform(scrollYProgress, [0, 0.96], [0, 1]);

  return (
    <div ref={ref} className="relative bg-ink">
      <div
        aria-hidden
        className="pointer-events-none sticky top-0 -mb-[100svh] h-svh overflow-hidden"
      >
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
        {/* The ink, coming up over the photo. `willChange` keeps this on its own
            compositor layer for the whole scroll instead of being promoted and
            dropped repeatedly. */}
        <motion.div
          className="absolute inset-0 bg-ink"
          style={{ opacity: inkIn, willChange: 'opacity' }}
        />
      </div>
      <Hero />
      <CountdownBand />
      <OurStory />
    </div>
  );
}
