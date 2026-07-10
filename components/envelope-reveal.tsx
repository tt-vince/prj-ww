'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/** Smooth acceleration/deceleration so the open feels natural, not linear. */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/* Motion tuning. All scroll distances are raw pixels. */
/** Scroll segment that folds the flap open: 55% of the viewport, 280–560px. */
const FLAP_VH = 0.55;
const FLAP_MIN_PX = 280;
const FLAP_MAX_PX = 560;
/** The letter starts rising when the flap is this far through its segment. */
const RISE_START_FRAC = 0.6;
/** Floor on the rise segment so short letters keep an unhurried, eased rise. */
const MIN_RISE_VH = 0.6;
/** Settled beat at the end of the runway before the pin releases. */
const SETTLE_VH = 0.25;
/**
 * translateY span as a fraction of the letter's own height — the extra 16%
 * tucks the padded base behind the front flaps. Written to CSS as
 * `--letter-travel` so the transform in globals.css shares this one value.
 */
const LETTER_TRAVEL = 1.16;
/** Flap progress past which the flap drops behind the letter (z-index swap). */
const FLAP_Z_SWAP = 0.08;

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
    stage.style.setProperty('--letter-travel', String(LETTER_TRAVEL));

    // Phase boundaries in raw scroll px; recomputed by measure() on resize and
    // whenever the letter's content height changes (e.g. conditional fields).
    let flapPx = 1;
    let riseStart = 0;
    let riseLen = 1;
    // Short letters keep the eased, cinematic rise; letters taller than the
    // floor rise linearly so one px of scroll ≈ one px of letter, which reads
    // like normal document scrolling through a long form.
    let easeRise = false;

    // Last written values — skipping no-op writes avoids per-frame style
    // invalidation on the saturated stretches (pf pinned at 1, pl at 0 or 1).
    let lastPf = '';
    let lastPl = '';
    let lastFlapZ = '';

    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const pfN = easeInOutCubic(clamp01(y / flapPx));
      const rawN = clamp01((y - riseStart) / riseLen);
      const pf = pfN.toFixed(4);
      const pl = (easeRise ? easeInOutCubic(rawN) : rawN).toFixed(4);
      if (pf !== lastPf) {
        lastPf = pf;
        stage.style.setProperty('--pf', pf);
      }
      if (pl !== lastPl) {
        lastPl = pl;
        stage.style.setProperty('--pl', pl);
      }
      // Flap on top while sealed; behind the letter once it starts opening so it
      // stays visible (standing open) without covering the letter's content.
      const flapZ = pfN < FLAP_Z_SWAP ? '14' : '8';
      if (flap && flapZ !== lastFlapZ) {
        lastFlapZ = flapZ;
        flap.style.zIndex = flapZ;
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    const measure = () => {
      const vh = window.innerHeight;
      flapPx = Math.min(FLAP_MAX_PX, Math.max(FLAP_MIN_PX, vh * FLAP_VH));
      riseStart = flapPx * RISE_START_FRAC;
      const minRise = vh * MIN_RISE_VH;
      const letterH = letter?.offsetHeight ?? 0;
      // A linear scroll segment of LETTER_TRAVEL·H px maps scroll to rise 1:1.
      riseLen = Math.max(LETTER_TRAVEL * letterH, minRise);
      easeRise = riseLen <= minRise;
      stage.style.setProperty('--letter-h', `${Math.round(letterH)}px`);
      // Runway = rise distance + a settled beat before the pin releases.
      stage.style.setProperty(
        '--runway',
        `${Math.round(riseStart + riseLen + vh * SETTLE_VH)}px`
      );
      schedule();
    };
    // Coalesce resize bursts to one measure per frame — measure() reads
    // offsetHeight, which forces layout on every call otherwise.
    let measureRaf = 0;
    const scheduleMeasure = () => {
      if (!measureRaf)
        measureRaf = requestAnimationFrame(() => {
          measureRaf = 0;
          measure();
        });
    };

    const ro = letter ? new ResizeObserver(measure) : null;
    if (letter) ro?.observe(letter);

    measure();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', scheduleMeasure);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (measureRaf) cancelAnimationFrame(measureRaf);
      ro?.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', scheduleMeasure);
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
