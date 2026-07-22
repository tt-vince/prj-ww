'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/** Smooth acceleration/deceleration so the open feels natural, not linear. */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/* Motion tuning. All scroll distances are raw pixels. */
/** Scroll segment that folds the flap open: one full viewport, 480–1000px. */
const FLAP_VH = 1.0;
const FLAP_MIN_PX = 480;
const FLAP_MAX_PX = 1000;
/** Envelope descent segment — deliberately longer than the flap fold so the
    envelope sinks gently, still settling while the letter starts to rise. */
const DROP_VH = 3.5;
const DROP_MIN_PX = 1680;
const DROP_MAX_PX = 3500;
/** The letter starts rising when the flap is this far through its segment. */
const RISE_START_FRAC = 0.6;
/** Floor on the rise segment so short letters keep an unhurried, eased rise. */
const MIN_RISE_VH = 1.1;
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
/** CSS approximation of easeInOutCubic, for the compositor-driven path. */
const EASE_IN_OUT_CUBIC_CSS = 'cubic-bezier(0.65, 0, 0.35, 1)';

/**
 * Browsers with CSS scroll-driven animations run the reveal on the compositor
 * (keyframes in globals.css bound to the scroll offset) — the letter tracks
 * the finger even when the main thread is busy. Everything else falls back to
 * the per-frame JS below.
 */
const supportsScrollTimeline = () =>
  typeof CSS !== 'undefined' && CSS.supports('animation-timeline', 'scroll()');

/**
 * Scroll-driven envelope reveal for the homepage.
 *
 * An olive envelope starts centred in a pinned stage. As you scroll it
 * widens to full-bleed (--spread — the paper ends up edge to edge) and glides
 * straight down until it has cleared the bottom of the screen entirely (no
 * fade — it just exits below the fold), while the top flap folds open and the
 * paper letter (`children` — the RSVP form / greeting) slides UP out of it,
 * so the letter gets the whole screen. The descent is pure CSS: the JS
 * fallback writes --pd and the compositor path runs the env-drop / env-spread
 * keyframes; the distance itself is --env-drop (globals.css), sized to carry
 * the whole envelope past the bottom edge.
 *
 * All four flaps meet at the centre, so the closed envelope reads as one clean,
 * symmetric shape. The letter lives in `.letter-clip` (overflow-hidden, its
 * bottom edge = the mouth) so it is invisible until it clears the mouth; the
 * front flaps (`.env-front` + `.env-face-*`, z-index 12, `pointer-events:none`)
 * tuck its base while never covering the content above the centre.
 *
 * The reveal spans the first `--runway` px of scroll: the flap folds open,
 * then the letter rises out of the mouth. For letters taller than the viewport
 * the rise is linear and 1:1 with scroll (sized from the measured letter
 * height), so the whole letter scrolls out like a normal document — no inner
 * scrollbar. JS measures via ResizeObserver and publishes px ranges as custom
 * properties (`--runway`, `--letter-h`, `--flap-px`, `--rise-start`,
 * `--rise-len`).
 *
 * On browsers with CSS scroll-driven animations the motion itself is
 * compositor-driven keyframes (app/globals.css · "Envelope reveal") — no
 * per-frame JS. Otherwise a scroll listener writes eased progress values
 * `--pf` (flap fold) and `--pl` (letter rise) each frame; either way there are
 * no React re-renders and the motion scrubs with the scrollbar.
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
      stage.style.setProperty('--spread', '1');
      return;
    }

    // The stage IS the scroll container (`.reveal-scroller`, position:fixed): the
    // reveal scrolls inside this fixed-size element, not the document. Because
    // nothing tall lives in the body flow, iOS Safari never collapses its URL
    // bar, so `stage.clientHeight` stays constant and the compositor scroll
    // timeline never re-samples from a viewport change (that was the residual
    // "envelope flashes / scrolls up a bit" bob). All scroll reads use the
    // scroller, not window.
    const flap = stage.querySelector<HTMLElement>('.env-flap');
    const letter = stage.querySelector<HTMLElement>('.env-letter');
    const track = stage.querySelector<HTMLElement>('.reveal-track');
    stage.style.setProperty('--letter-travel', String(LETTER_TRAVEL));
    const compositor = supportsScrollTimeline();

    // Phase boundaries in raw scroll px; recomputed by measure() on resize and
    // whenever the letter's content height changes (e.g. conditional fields).
    let flapPx = 1;
    let dropPx = 1;
    let riseStart = 0;
    let riseLen = 1;
    // Document-offset of the reveal track's top. The reveal is anchored here so
    // it only begins once this section scrolls to the top of the viewport (any
    // intro section above it is scrolled through first). Recomputed in measure().
    let anchorPx = 0;
    // Viewport width at last measure — resize events that keep this width
    // (mobile URL bar show/hide) are ignored, see onResize below.
    let measuredW = 0;
    // Short letters keep the eased, cinematic rise; letters taller than the
    // floor rise linearly so one px of scroll ≈ one px of letter, which reads
    // like normal document scrolling through a long form.
    let easeRise = false;

    // Last written values — skipping no-op writes avoids per-frame style
    // invalidation on the saturated stretches (pf pinned at 1, pl at 0 or 1).
    let lastPf = '';
    let lastPd = '';
    let lastPl = '';
    let lastFlapZ = '';

    let raf = 0;
    const update = () => {
      raf = 0;
      const y = stage.scrollTop - anchorPx;
      const pfN = easeInOutCubic(clamp01(y / flapPx));
      const pdN = easeInOutCubic(clamp01(y / dropPx));
      const rawN = clamp01((y - riseStart) / riseLen);
      const pf = pfN.toFixed(4);
      const pd = pdN.toFixed(4);
      const pl = (easeRise ? easeInOutCubic(rawN) : rawN).toFixed(4);
      if (pf !== lastPf) {
        lastPf = pf;
        stage.style.setProperty('--pf', pf);
        // Same eased value drives the full-bleed widening (globals.css).
        stage.style.setProperty('--spread', pf);
      }
      if (pd !== lastPd) {
        lastPd = pd;
        stage.style.setProperty('--pd', pd);
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
      const vh = stage.clientHeight;
      measuredW = stage.clientWidth;
      // Offset of the track top within the scroller = where the reveal begins
      // (0 in practice; the track is the scroller's first child). Published as
      // --anchor so the compositor ranges start at the track.
      anchorPx = track ? track.offsetTop : 0;
      stage.style.setProperty('--anchor', `${anchorPx}px`);
      flapPx = Math.min(FLAP_MAX_PX, Math.max(FLAP_MIN_PX, vh * FLAP_VH));
      dropPx = Math.min(DROP_MAX_PX, Math.max(DROP_MIN_PX, vh * DROP_VH));
      riseStart = flapPx * RISE_START_FRAC;
      const minRise = vh * MIN_RISE_VH;
      const letterH = letter?.offsetHeight ?? 0;
      // A linear scroll segment of LETTER_TRAVEL·H px maps scroll to rise 1:1.
      riseLen = Math.max(LETTER_TRAVEL * letterH, minRise);
      easeRise = riseLen <= minRise;
      stage.style.setProperty('--letter-h', `${Math.round(letterH)}px`);
      stage.style.setProperty('--flap-px', `${Math.round(flapPx)}px`);
      stage.style.setProperty('--drop-px', `${Math.round(dropPx)}px`);
      stage.style.setProperty('--rise-start', `${Math.round(riseStart)}px`);
      stage.style.setProperty('--rise-len', `${Math.round(riseLen)}px`);
      // Runway = the longest segment (letter rise vs envelope descent) + a
      // settled beat before the pin releases.
      stage.style.setProperty(
        '--runway',
        `${Math.round(Math.max(riseStart + riseLen, dropPx) + vh * SETTLE_VH)}px`
      );
      if (compositor) {
        // The keyframes track the scroll offset by themselves; only the rise
        // feel is per-measure state (eased for short letters, 1:1 for tall).
        if (letter)
          letter.style.animationTimingFunction = easeRise
            ? EASE_IN_OUT_CUBIC_CSS
            : 'linear';
      } else {
        schedule();
      }
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

    // Only a width change (orientation) warrants a re-measure. The scroller's
    // height is now constant (the URL bar can't collapse it), so height-only
    // resizes never fire here; the letter's own height changes are covered by
    // the ResizeObserver.
    const onResize = () => {
      if (stage.clientWidth !== measuredW) scheduleMeasure();
    };

    // The paper widens over the flap segment (--spread), and that width change
    // reflows the letter — so the letter's height changes every frame WHILE the
    // reveal is playing. Remeasuring then rewrites --rise-len / --runway under
    // the user's finger, and the page throttles up and down (and lurches on a
    // long-press that triggers a stray reflow). So ignore ResizeObserver ticks
    // that land mid-spread; only remeasure at rest or once fully open, where a
    // height change is a real content change (e.g. conditional RSVP fields).
    // rAF-coalesced: a raw measure() per tick would force layout each time.
    const onLetterResize = () => {
      const rel = stage.scrollTop - anchorPx;
      // Once the reveal has started (rel > 0) the letter must NOT rewrite
      // --rise-len/--runway. The letter reflows constantly during scroll (the
      // spread animates its width; fonts/images settle) and each rewrite
      // changes the document height mid-scroll, which shifts the compositor
      // scroll(root) ranges and makes the reveal jump ("throttle"/scroll
      // reversal). Only remeasure while still above the reveal, where a rewrite
      // is invisible. Genuine content-size changes at rest still remeasure.
      if (rel > 0) return;
      scheduleMeasure();
    };
    const ro = letter ? new ResizeObserver(onLetterResize) : null;
    if (letter) ro?.observe(letter);

    measure();
    // Web fonts swap in after first paint and reflow the letter (the main
    // reflow on mobile). Capture that once fonts are ready, but only while
    // still at the top so it never rewrites the scroll length mid-reveal.
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (stage.scrollTop - anchorPx <= 0) scheduleMeasure();
      });
    }
    if (!compositor)
      stage.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (measureRaf) cancelAnimationFrame(measureRaf);
      ro?.disconnect();
      if (!compositor) stage.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div ref={stageRef} className="reveal-scroller">
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
                {/* Full paper width — so a full-bleed hero can reach the paper
                    edges. .env-content carries the bottom tuck allowance in
                    CSS (padding-bottom: --env-overshoot, globals.css): the
                    letter's last --env-overshoot px end up below the viewport
                    at terminal scroll, so that stripe must stay empty. */}
                <div className="env-content">{children}</div>
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
