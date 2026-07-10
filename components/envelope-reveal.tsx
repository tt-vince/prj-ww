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
 * Motion is two scroll-progress values written onto the stage each frame:
 * `--pf` (flap fold, eased, completes in the first ~half viewport of scroll)
 * and `--pl` (letter rise). For letters taller than the viewport `--pl` is
 * linear over a runway sized 1:1 to the letter's measured height, so the whole
 * letter scrolls out like a normal document — no inner scrollbar. The runway
 * (`--runway`) and clip headroom (`--letter-h`) are measured via
 * ResizeObserver; all transforms live in CSS (app/globals.css · "Envelope
 * reveal"), so it scrubs with the scrollbar for no React re-renders.
 * `prefers-reduced-motion` drops the envelope and shows the letter statically.
 */
export function EnvelopeReveal({ children }: { children: ReactNode }) {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      stage.style.setProperty('--pf', '1');
      stage.style.setProperty('--pl', '1');
      return;
    }

    const flap = stage.querySelector<HTMLElement>('.env-flap');
    const letter = stage.querySelector<HTMLElement>('.env-letter');

    // Phase boundaries in raw scroll px; recomputed by measure() on resize and
    // whenever the letter's content height changes (e.g. conditional fields).
    let flapPx = 1;
    let riseStart = 0;
    let riseLen = 1;
    let minRise = 1;

    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const pf = easeInOutCubic(Math.min(1, Math.max(0, y / flapPx)));
      const raw = Math.min(1, Math.max(0, (y - riseStart) / riseLen));
      // Short letters keep the eased, cinematic rise; letters taller than the
      // floor rise linearly so one px of scroll ≈ one px of letter, which reads
      // like normal document scrolling through a long form.
      const pl = riseLen <= minRise ? easeInOutCubic(raw) : raw;
      stage.style.setProperty('--pf', pf.toFixed(4));
      stage.style.setProperty('--pl', pl.toFixed(4));
      // Flap on top while sealed; behind the letter once it starts opening so it
      // stays visible (standing open) without covering the letter's content.
      if (flap) flap.style.zIndex = pf < 0.08 ? '14' : '8';
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    const measure = () => {
      const vh = window.innerHeight;
      flapPx = Math.min(560, Math.max(280, vh * 0.55));
      // The letter starts rising while the flap finishes opening.
      riseStart = flapPx * 0.6;
      minRise = vh * 0.6;
      const letterH = letter?.offsetHeight ?? 0;
      // translateY spans 116% of the letter's own height, so a linear scroll
      // segment of 1.16·H px maps scroll to rise exactly 1:1.
      riseLen = Math.max(1.16 * letterH, minRise);
      stage.style.setProperty('--letter-h', `${Math.round(letterH)}px`);
      // Runway = rise distance + a settled beat before the pin releases.
      stage.style.setProperty(
        '--runway',
        `${Math.round(riseStart + riseLen + vh * 0.25)}px`
      );
      schedule();
    };

    const ro = letter ? new ResizeObserver(measure) : null;
    if (letter) ro?.observe(letter);

    measure();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro?.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', measure);
    };
  }, []);

  return (
    <div ref={stageRef}>
      <div className="reveal-track">
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
