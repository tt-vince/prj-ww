/**
 * Social handles the admin can store per guest. The admin enters just a
 * username; the full deep link is built from a fixed per-platform template
 * (mobile opens the app when installed, else the web page). Stored as a jsonb
 * object keyed by platform on `guests.sns_accounts`.
 *
 * Adding a platform = one entry here + one brand path in `components/sns-icon.tsx`.
 * Kept icon-free (pure data) so this module is safe to import from server code.
 */
export const SNS_PLATFORMS = ['messenger', 'instagram'] as const;
export type SnsPlatform = (typeof SNS_PLATFORMS)[number];
export type SnsAccounts = Partial<Record<SnsPlatform, string>>;

export const SNS_CONFIG: Record<
  SnsPlatform,
  {
    label: string;
    /** Fixed URL stem shown before the input (admin types only the handle). */
    prefix: string;
    /** Full deep link from a handle. */
    url: (handle: string) => string;
  }
> = {
  messenger: {
    label: 'Messenger',
    prefix: 'm.me/',
    url: (h) => `https://m.me/${encodeURIComponent(h)}`,
  },
  instagram: {
    label: 'Instagram',
    prefix: 'instagram.com/',
    url: (h) => `https://instagram.com/${encodeURIComponent(h)}`,
  },
};
