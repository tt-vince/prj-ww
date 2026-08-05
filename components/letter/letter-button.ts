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
 * Two variants, both drawn in ink at full strength (see the .letter-theme note
 * in app/globals.css — no tints in this document):
 *   solid   — the default. Filled ink, inverting to white on hover.
 *   outline — for a section that already has a louder element in it, so the
 *             action does not become the loudest thing on the screen.
 */
export const letterButton = cva(
  'inline-flex w-fit items-center gap-2 rounded-full border border-ink px-5 py-2.5 font-sans text-label uppercase tracking-[0.16em] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        solid: 'bg-ink text-paper hover:bg-paper hover:text-ink',
        outline: 'bg-transparent text-ink hover:bg-ink hover:text-paper',
        /* Same outline button, inverted for the sections painted ink (the
           countdown band, which sits on the shared Hero -> Our Story
           background). The border colour has to move with the text: on ink an
           ink border is invisible. */
        outlineOnInk:
          'border-paper bg-transparent text-paper hover:bg-paper hover:text-ink focus-visible:outline-paper',
      },
    },
    defaultVariants: {
      variant: 'solid',
    },
  },
);

export type LetterButtonVariants = VariantProps<typeof letterButton>;
