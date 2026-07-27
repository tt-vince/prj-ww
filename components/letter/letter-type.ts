/**
 * Type voices shared between the letter's server components and the client RSVP
 * form, so a label reads the same whoever renders it.
 *
 * `fieldLabel` is the letter's tracked micro-caps (cf. the time labels in
 * components/letter/day-itself.tsx): the voice for naming a field or a value,
 * one step below the headings that name a section.
 *
 * It is the `label` role of the scale in app/globals.css — 13px on a phone,
 * 14px on a desktop, where it used to be a flat 11px. Tracked caps at 11px are
 * the hardest thing on the page to read, and this voice names half the RSVP
 * form. `tracking` is the scale's one tracked-caps value, 0.16em, shared with
 * `letterButton` so a label and a control are set the same way.
 */
export const fieldLabel =
  'font-sans text-label font-medium tracking-[0.16em] uppercase';
