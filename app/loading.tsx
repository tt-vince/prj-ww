import { COUPLE_NAMES } from '@/lib/wedding';

const [NAME_A, NAME_B] = COUPLE_NAMES;

/**
 * Home loading screen — a quiet preview of the hero: the couple's names in
 * the script face over white paper, breathing softly while a thin ink rule
 * draws itself underneath (keyframes in app/globals.css). CSS-only so it
 * costs nothing to ship and shows instantly.
 */
export default function HomeLoading() {
  return (
    <main className="letter-theme flex min-h-dvh flex-col items-center justify-center bg-white px-6 text-center text-ink">
      <h1 className="letter-loading-names flex flex-col items-center gap-1 font-script leading-none">
        <span className="text-5xl sm:text-6xl">{NAME_A}</span>
        <span className="text-xl opacity-70 sm:text-2xl">&amp;</span>
        <span className="text-5xl sm:text-6xl">{NAME_B}</span>
      </h1>
      <div
        aria-hidden
        className="letter-loading-line mt-8 h-px w-40 bg-[color:var(--ink)]"
      />
      <p className="mt-6 font-sans text-xs uppercase tracking-[0.35em]">
        Opening your invitation
      </p>
    </main>
  );
}
