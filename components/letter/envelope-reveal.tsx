import type { ReactNode } from 'react';

/**
 * Envelope reveal for the homepage — a ONE-SHOT intro, with no scroll coupling.
 *
 * On load a wax-sealed envelope sits centred; its top flap folds open, then the
 * whole envelope zooms and dissolves away while the letter (`children` — the
 * RSVP form / greeting) fades up into place. After that the letter is ordinary
 * document flow and scrolls natively.
 *
 * This deliberately avoids the previous scroll-scrubbed / pinned design: there
 * is no sticky pin, no scroll-driven (`scroll()`) animation, no measured scroll
 * runway and no dependence on the mobile URL-bar / viewport height — those were
 * the source of every scroll-jitter bug (throttle, envelope bob, right-shift).
 * The whole reveal is CSS (app/globals.css · "Envelope reveal"): the intro is a
 * position:fixed, pointer-events:none overlay that plays once and fades to
 * nothing, so the letter beneath is interactive and scrollable throughout.
 * prefers-reduced-motion skips the intro and shows the letter immediately.
 */
export function EnvelopeReveal({ children }: { children: ReactNode }) {
  return (
    <div className="reveal-c2">
      {/* One-shot envelope intro overlay — decorative, plays once then fades. */}
      <div className="reveal-intro" aria-hidden>
        <div className="env-wrap">
          <div className="env-back" />
          <div className="env-face env-face-left" />
          <div className="env-face env-face-right" />
          <div className="env-flap" />
          <div className="env-front" />
        </div>
      </div>

      {/* The real content — plain document flow, native scroll. */}
      <div className="reveal-letter">{children}</div>
    </div>
  );
}
