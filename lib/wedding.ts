/**
 * Couple + occasion — the single source for the couple's names and wedding
 * date, shared by the dashboard header, the countdown, and the guest-facing
 * wedding letter (components/wedding-letter.tsx).
 *
 * The names are the design's placeholder pair from the dashboard header; swap
 * for the real ones here. The date is the single source of truth for the
 * countdown (hero + dashboard) — change it here and both update.
 */
export const COUPLE = 'Hyuwu & Empty';

/** Individual names, for prose that speaks about one of the couple. */
export const COUPLE_NAMES = COUPLE.split(' & ') as [string, string];

export const WEDDING_DATE_ISO = '2027-04-10T00:00:00';

const WEDDING_DATE = new Date(WEDDING_DATE_ISO);

/** "April 2027" — the hero line under the couple's names. */
export const WEDDING_MONTH_LABEL = WEDDING_DATE.toLocaleDateString('en-US', {
  month: 'long',
  year: 'numeric',
});

/**
 * Seven days centered on the wedding day (±3 days), for the hero's calendar
 * strip. Derived from WEDDING_DATE_ISO so a date change moves the whole strip
 * and the circled day together.
 */
export const WEDDING_WEEK = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(WEDDING_DATE);
  d.setDate(WEDDING_DATE.getDate() - 3 + i);
  return {
    label: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
    date: d.getDate(),
    isWeddingDay: d.getTime() === WEDDING_DATE.getTime(),
  };
});
