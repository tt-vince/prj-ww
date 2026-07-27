/** Errors carry no hue in this document — wording and italics do the work. */
export const errorText = "block text-xs italic text-destructive";

/**
 * One disabled treatment for every button in the form: unfilled, with the
 * hairline turning dashed. There is no third colour to grey a control out with
 * and no thinned ink allowed, so "not available yet" is carried by the stroke.
 * The submit button therefore inks in the moment the reply can be sent.
 */
export const disabledControl =
  "disabled:cursor-not-allowed disabled:border-dashed disabled:bg-transparent disabled:text-ink disabled:hover:bg-transparent disabled:hover:text-ink";
