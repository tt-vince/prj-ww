'use client';

import { useId, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/** Placeholder loop synthesized locally (public/music/placeholder.wav). */
const TRACK_SRC = '/music/placeholder.wav';

/**
 * A vinyl record that spins while a looping track plays and stops when paused.
 * Browsers block autoplay-with-sound, so playback is click-to-toggle.
 *
 * The invitation to press play is set around the record rather than under it:
 * the phrase runs twice round a circle just outside the wax, the way a title
 * runs round a record label. It is a decorative echo of the button's own
 * `aria-label`, so it is hidden from assistive tech, and it stays still while
 * the disc turns underneath it.
 *
 * Styling lives in app/globals.css (`.vinyl-ring` / `.vinyl`): grooved wax, a
 * paper label, and the same drop shadow as `.env-back`. Inside `.letter-theme`
 * the record is re-pressed in ink #1E2A18 to keep the letter's two colours.
 * The component brings no outer spacing of its own — callers place it with
 * `className`, and `size` sets the disc's width (`--vinyl-size`).
 *
 * It opened the retired envelope intro; it now sits over the countdown band.
 */
export function VinylPlayer({
  className,
  size = 'min(64vw, 300px)',
}: {
  className?: string;
  /** Any CSS width — becomes `--vinyl-size` on the record. */
  size?: string;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const pathId = useId();

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    try {
      await audio.play();
      setPlaying(true);
    } catch {
      // Play can reject if the gesture isn't trusted; stay paused.
      setPlaying(false);
    }
  };

  const phrase = playing ? 'now playing our music' : 'click to play our music';

  return (
    <div
      className={cn('vinyl-ring', className)}
      style={{ '--vinyl-size': size } as React.CSSProperties}
    >
      {/* Ring text, in the same script as "until we say I do" below. The path
          is a circle of radius 46 starting at 9 o'clock and running clockwise,
          so `startOffset: 25%` with a middle anchor centres the phrase over the
          top of the record with slack on both sides — nothing runs past the
          path's start, which is what clips curved text. */}
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        className="pointer-events-none absolute inset-0 size-full"
      >
        <path
          id={pathId}
          fill="none"
          d="M 50,50 m -46,0 a 46,46 0 1,1 92,0 a 46,46 0 1,1 -92,0"
        />
        <text
          fill="currentColor"
          fontSize="7"
          letterSpacing="0.2"
          textAnchor="middle"
          className="font-sans"
        >
          <textPath href={`#${pathId}`} startOffset="25%">
            {phrase}
          </textPath>
        </text>
      </svg>

      <button
        type="button"
        className={cn('vinyl', playing && 'is-spinning')}
        onClick={toggle}
        aria-pressed={playing}
        aria-label={playing ? 'Pause background music' : 'Play background music'}
        title={playing ? 'Pause music' : 'Play music'}
      >
        <span className="vinyl-label" aria-hidden />
        <span className="vinyl-hole" aria-hidden />
      </button>
      <audio ref={audioRef} src={TRACK_SRC} loop preload="none" />
    </div>
  );
}
