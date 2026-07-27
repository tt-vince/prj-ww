import { cn } from '@/lib/utils';

/**
 * The letter's section voice: a script headline over a small sans kicker.
 * Every section opens this way, so the pair lives here once instead of as
 * nine hand-copies drifting apart.
 *
 * `tone` picks the ink for the ground the heading sits on:
 *   script — sage script headline on white paper (the default)
 *   ink    — headline in full ink, for a section whose imagery brings the
 *            colour instead (Location)
 *   white  — for sections set on the solid ink ground (Our Story, RSVP)
 *
 * The kicker takes a node, not just a string, so a section can keep a longer
 * lead-in sentence (Hotels) — use `kickerClassName` to widen its measure.
 */
const TONES = {
  script: { title: 'text-script', kicker: 'text-ink' },
  ink: { title: 'text-ink', kicker: 'text-ink' },
  white: { title: 'text-white', kicker: 'text-white' },
} as const;

export function SectionHeading({
  title,
  kicker,
  tone = 'script',
  className,
  kickerClassName,
}: {
  title: React.ReactNode;
  kicker?: React.ReactNode;
  tone?: keyof typeof TONES;
  className?: string;
  kickerClassName?: string;
}) {
  return (
    <div className={cn('text-center', className)}>
      <h2
        className={cn(
          'font-script text-4xl leading-tight sm:text-5xl',
          TONES[tone].title,
        )}
      >
        {title}
      </h2>
      {kicker != null && (
        <p
          className={cn(
            'mt-2 font-sans text-sm tracking-wide',
            TONES[tone].kicker,
            kickerClassName,
          )}
        >
          {kicker}
        </p>
      )}
    </div>
  );
}
