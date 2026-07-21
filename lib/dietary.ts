/**
 * Dietary restriction presets for the RSVP form — the single source shared by
 * the guest form, the `rsvpResponseSchema` DTO, the dashboard card, and the CSV
 * export. Stored on `guests.dietary` (text[] of these keys) with any free-text
 * "Other" in `guests.dietaryOther`.
 */
export const DIETARY_OPTIONS = [
  { key: 'vegetarian', label: 'Vegetarian' },
  { key: 'vegan', label: 'Vegan' },
  { key: 'halal', label: 'Halal' },
  { key: 'gluten_free', label: 'Gluten-free' },
  { key: 'nut_allergy', label: 'Nut allergy' },
  { key: 'dairy_free', label: 'Dairy-free' },
] as const;

export type DietaryKey = (typeof DIETARY_OPTIONS)[number]['key'];

/** Non-empty tuple of keys for `z.enum` in lib/validation.ts. */
export const DIETARY_KEYS = DIETARY_OPTIONS.map((o) => o.key) as [
  DietaryKey,
  ...DietaryKey[],
];

const LABEL_BY_KEY: Record<string, string> = Object.fromEntries(
  DIETARY_OPTIONS.map((o) => [o.key, o.label]),
);

/** Human label for a preset key (falls back to the raw key). */
export function dietaryLabel(key: string): string {
  return LABEL_BY_KEY[key] ?? key;
}

/** Preset labels plus the free-text "other", as display strings. */
export function dietaryList(
  dietary: string[] | null | undefined,
  other: string | null | undefined,
): string[] {
  const out = (dietary ?? []).map(dietaryLabel);
  if (other && other.trim()) out.push(other.trim());
  return out;
}
