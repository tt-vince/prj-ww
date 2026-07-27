/**
 * The one required mark in the form. The asterisk is decoration — "(required)" is
 * what a screen reader reads, alongside the control's own `required` attribute —
 * so the red never carries the meaning by itself. Sized in `em` so it scales to
 * whatever it marks, from a section heading down to a field label.
 */
export function RequiredMark() {
  return (
    <>
      {/* Full inherited size, and no `align-super`: the asterisk already sits
          high in both faces, so superscripting a shrunken one left a speck the
          eye skipped.

          The gap is one `em` value, so it holds the same proportion whatever it
          marks — a section heading or an 11px field label. It only works if the
          mark is INLINE with its text: shadcn's `Label` is a flex row with
          `gap-2`, so a mark placed as a direct element child of a Label gets 8px
          injected between them and ignores this margin, which is exactly why the
          heading and the field label used to disagree. Wrap text + mark in one
          inline span inside a Label. */}
      <span
        aria-hidden
        className="ml-[0.2em] text-[1.15em] leading-none tracking-normal text-[color:var(--mark-required)]"
      >
        &#42;
      </span>
      <span className="sr-only"> (required)</span>
    </>
  );
}
