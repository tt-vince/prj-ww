'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/** Smooth acceleration/deceleration so the open feels natural, not linear. */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Scroll-driven envelope reveal for the homepage.
 *
 * An ivory paper envelope stays fixed in the lower-centre of a pinned stage and
 * never disappears. As you scroll, the top flap folds open and the paper letter
 * (`children` — the RSVP form / greeting) slides UP out of it, settling with its
 * base tucked behind the front flaps so the whole envelope stays visible.
 *
 * All four flaps meet at the centre, so the closed envelope reads as one clean,
 * symmetric shape. The letter lives in `.letter-clip` (overflow-hidden, its
 * bottom edge = the mouth) so it is invisible until it clears the mouth; the
 * front flaps (`.env-front` + `.env-face-*`, z-index 12, `pointer-events:none`)
 * tuck its base while never covering the content above the centre.
 *
 * Motion is a single eased scroll-progress value `--p` (0→1) written onto the
 * stage each frame; all transforms live in CSS (app/globals.css · "Envelope
 * reveal"), so it scrubs with the scrollbar for no React re-renders.
 * `prefers-reduced-motion` drops the envelope and shows the letter statically.
 */
export function EnvelopeReveal({ children }: { children: ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      stage.style.setProperty('--p', '1');
      return;
    }

    const flap = stage.querySelector<HTMLElement>('.env-flap');
    let raf = 0;
    const update = () => {
      raf = 0;
      // Reach p=1 at ~80% of the pin travel, leaving a settled tail at the end.
      const travel = Math.max(1, track.offsetHeight - window.innerHeight);
      const raw = Math.min(1, Math.max(0, window.scrollY / (travel * 0.8)));
      const p = easeInOutCubic(raw);
      stage.style.setProperty('--p', p.toFixed(4));
      // Flap on top while sealed; behind the letter once it starts opening so it
      // stays visible (standing open) without covering the letter's content.
      if (flap) flap.style.zIndex = p < 0.08 ? '14' : '8';
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div ref={stageRef}>
      <div ref={trackRef} className="reveal-track">
        <div className="reveal-pin">
          <div className="env-wrap">
            <div className="env-back" aria-hidden />

            {/* Side flaps (in front) — flap + sides + bottom meet at the centre. */}
            <div className="env-face env-face-left" aria-hidden />
            <div className="env-face env-face-right" aria-hidden />

            {/* Top flap: rotates fully open on scroll (z-index swapped in JS). */}
            <div className="env-flap" aria-hidden />

            {/* The letter (= page content) rises out through the centre. The
                extra bottom padding is what tucks behind the front flaps. */}
            <div className="letter-clip">
              <div className="env-letter">
                <div className="env-content px-6 pt-9 pb-16 sm:px-9 sm:pt-11 sm:pb-20">
                  {children}
                </div>
              </div>
            </div>

            {/* Bottom flap — in front of the letter's base, tucks it in. */}
            <div className="env-front" aria-hidden />
          </div>

          {/* Discoverability cue — fades out as soon as scrolling starts. */}
          <div className="env-cue" aria-hidden>
            <span className="env-cue-text">Scroll to open</span>
            <svg
              className="env-cue-arrow"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
