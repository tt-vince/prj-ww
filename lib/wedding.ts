/**
 * Couple + occasion — the single source for the couple's names and wedding
 * date, shared by the dashboard header, the countdown, and the guest-facing
 * wedding letter (components/wedding-letter.tsx).
 *
 * TODO: exact wedding day not decided yet — April 1, 2027 placeholder (moved
 * here from the countdown's inline constant). The names are the design's
 * placeholder pair from the dashboard header; swap for the real ones here.
 */
export const COUPLE = 'Hyuwu & Empty';

/** Individual names, for prose that speaks about one of the couple. */
export const COUPLE_NAMES = COUPLE.split(' & ') as [string, string];

export const WEDDING_DATE_ISO = '2027-04-01T00:00:00';
export const WEDDING_DATE_LABEL = 'Thursday · April 1 · 2027';
