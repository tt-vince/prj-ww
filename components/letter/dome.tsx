import { cn } from '@/lib/utils';

/**
 * The dome — the letter's one curved section seam.
 *
 * A full-bleed band flush with a section's TOP edge, painting the colour of the
 * section ABOVE (`className` is the fill, e.g. `bg-paper`). The section it sits
 * in is `relative`; the dome is `absolute` and paints over that section's
 * background. `direction` says which way the arch points:
 *
 *     <Dome direction="down" className="bg-paper" />  // paper hangs into the section
 *     <Dome direction="up"   className="bg-paper" />  // the section rises into the paper
 *
 * The two are the SAME half-ellipse — `50%` of the width across, `--dome-ry`
 * deep — but they are not the same object, and this is the part that is easy to
 * get wrong:
 *
 *   - `down` is the ellipse DRAWN in the fill: a border radius rounds the band's
 *     two bottom corners away, leaving the paper bulging into the section.
 *   - `up` is the ellipse CUT OUT of the fill: the band is a full rectangle of
 *     paper with the arch masked out of its bottom edge, so the section's own
 *     ground shows through the hole and reads as rising into the paper.
 *
 * Flipping `down` with a transform gives an arch of the WRONG colour — a paper
 * dome standing on the section instead of the section standing in the paper.
 * The arch is always the lower section's ground; only the surround is the fill.
 * That matters here because the section below is the opening backdrop's photo,
 * not a flat colour: a hole shows the photo, whereas any painted arch could
 * only ever approximate it.
 *
 * `--dome-ry` is the shared depth, and both the box height and the curve read
 * from it, so one number moves the whole seam: 12rem on mobile, the shallow
 * ~4rem hero curve on `sm`+. It matches `--spacing-dome` in app/globals.css,
 * which is what the `pt-dome` on the receiving section uses to clear the crown
 * — retune one and retune the other.
 */
export function Dome({
  direction = 'down',
  className,
}: {
  /** Which way the arch points. See the note above — these are not mirrors. */
  direction?: 'down' | 'up';
  /** The fill for the band AROUND the arch — a `bg-*` utility, e.g. `bg-paper`. */
  className?: string;
}) {
  // The hard-edged half-ellipse, sat on the bottom edge of the band. The two
  // stops are 0.5% apart rather than coincident: a truly hard stop renders with
  // a visibly jagged edge in Chrome, and this is under half a pixel of feather.
  const arch =
    'radial-gradient(50% var(--dome-ry) at 50% 100%, transparent 99.5%, #000 100%)';

  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-x-0 top-0 h-[var(--dome-ry)] [--dome-ry:12rem] sm:[--dome-ry:4rem]',
        direction === 'down' &&
          'rounded-[0_0_50%_50%_/_0_0_var(--dome-ry)_var(--dome-ry)]',
        className
      )}
      style={
        direction === 'up'
          ? { maskImage: arch, WebkitMaskImage: arch }
          : undefined
      }
    />
  );
}
