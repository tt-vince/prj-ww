import { cva, type VariantProps } from 'class-variance-authority';

/**
 * The guest letter's one button style.
 *
 * Every action in the letter — the two "Open in Maps" links, the calendar
 * pill, the RSVP submit — speaks in the same voice: the sans face in the scale's
 * `label` role, upper case, wide tracking. That treatment is deliberate. At letter sizes the ink
 * text around it is set in serif and script faces, so a button reading as a
 * sentence competes with the prose; a tracked, uppercase label reads as a
 * control instead, which is how the calendar strip's weekday labels in
 * components/letter/countdown-band.tsx already behave.
 *
 * Colour comes from the palette's two ACCENT roles, not from the bases (see the
 * .letter-theme block in app/globals.css): a green here is what marks something
 * as actionable, so buttons never repeat the body-text colour. Each accent is
 * readable on exactly one ground, hence one variant per ground:
 *   solid       — the default, for light sections. Filled botanical, inverting
 *                 to paper on hover.
 *   outline     — same ground, for a section that already has a louder element
 *                 in it, so the action does not become the loudest thing.
 *   outlineOnInk — the ink sections, drawn in lichen: botanical on ink is two
 *                 dark greens and disappears.
 */
export const letterButton = cva(
  'inline-flex w-fit items-center gap-2 rounded-full border px-5 py-2.5 font-sans text-label uppercase tracking-[0.16em] transition focus-visible:outline-2 focus-visible:outline-offset-2 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        solid:
          'border-botanical bg-botanical text-paper hover:bg-paper hover:text-botanical focus-visible:outline-botanical',
        outline:
          'border-botanical bg-transparent text-botanical hover:bg-botanical hover:text-paper focus-visible:outline-botanical',
        /* The ink sections (the countdown band on the shared Hero -> Our Story
           background, and anything else drawn on ink). Lichen throughout: the
           border has to move with the text, or it vanishes into the ground. */
        outlineOnInk:
          'border-lichen bg-transparent text-lichen hover:bg-lichen hover:text-ink focus-visible:outline-lichen',
      },
    },
    defaultVariants: {
      variant: 'solid',
    },
  },
);

export type LetterButtonVariants = VariantProps<typeof letterButton>;
