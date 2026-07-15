'use client';

import { useRef, useState } from 'react';

/** Placeholder loop synthesized locally (public/music/placeholder.wav). */
const TRACK_SRC = '/music/placeholder.wav';

/**
 * The homepage intro: a black vinyl record centred in its own full-height
 * section, above the envelope section. It spins continuously (faster while
 * playing) and toggles a looping placeholder track on click.
 *
 * Browsers block autoplay-with-sound, so playback is click-to-toggle. Styling
 * lives in app/globals.css (`.vinyl-section` / `.vinyl`): black grooved wax, an
 * ivory label echoing the envelope, and the same drop shadow as `.env-back`.
 */
export function VinylPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

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

  return (
    <section className="vinyl-section">
      <button
        type="button"
        className={`vinyl${playing ? ' is-spinning' : ''}`}
        onClick={toggle}
        aria-pressed={playing}
        aria-label={playing ? 'Pause background music' : 'Play background music'}
        title={playing ? 'Pause music' : 'Play music'}
      >
        <span className="vinyl-label" aria-hidden />
        <span className="vinyl-hole" aria-hidden />
      </button>
      <p className="vinyl-hint">
        {playing ? 'Now playing — scroll down' : 'Tap the record to play'}
      </p>
      <audio ref={audioRef} src={TRACK_SRC} loop preload="none" />
    </section>
  );
}
