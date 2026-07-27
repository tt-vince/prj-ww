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
 * The kicker is deliberately the smallest thing in the pair, and it sits tight
 * under the headline. Both matter. A script face carries very little ink for its
 * nominal size, and the kicker is usually the LONGER line — mass reads louder
 * than height — so a kicker set anywhere near reading size stops being a
 * subtitle and becomes the headline. It is the `label` role for that reason,
 * the same voice as the event times and polaroid dates elsewhere in the letter.
 *
 * The kicker takes a node, not just a string, so a section can keep a longer
 * lead-in sentence (Hotels) — use `kickerClassName` to cap its measure.
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
          'font-script text-title',
          TONES[tone].title,
        )}
      >
        {title}
      </h2>
      {kicker != null && (
        <p
          className={cn(
            'mt-2 font-sans text-label tracking-[0.04em]',
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
