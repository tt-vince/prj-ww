/**
 * Allergy presets for the RSVP form — the single source shared by the guest
 * form, the `rsvpResponseSchema` DTO, the dashboard card, and the CSV export.
 * Stored on `guests.dietary` (text[] of these keys) with any free-text "Other"
 * in `guests.dietaryOther`.
 *
 * These are ALLERGIES, not diets. The list used to be Vegetarian / Vegan /
 * Halal / Gluten-free / Nut allergy / Dairy-free — a Western restaurant menu.
 * This is a Filipino wedding: guests do not filter themselves by diet, they
 * tell the kitchen what will put them in hospital, and the caterer needs the
 * count of exactly that. Anyone who does keep a diet says so in "Something
 * else", which is the free-text field this list sits above.
 *
 * Ordered by how common the allergy is at a Filipino table — shellfish first,
 * because it is in half the menu.
 *
 * The keys are stored values: existing rows may still hold the old diet keys
 * (`vegan`, `gluten_free`, …). `dietaryLabel()` falls back to the raw key, so
 * those replies keep displaying without a migration.
 */
export const DIETARY_OPTIONS = [
  { key: 'shellfish', label: 'Shellfish' },
  { key: 'shrimp', label: 'Shrimp' },
  { key: 'fish', label: 'Fish' },
  { key: 'chicken', label: 'Chicken' },
  { key: 'peanuts', label: 'Peanuts' },
  { key: 'eggs', label: 'Eggs' },
  { key: 'dairy', label: 'Dairy' },
  // The one entry that is not an allergy. It stays in the same chip set
  // because it answers the same question for the kitchen — what this guest
  // cannot be served — and a Muslim guest should not have to type it into the
  // free-text field when six allergies get a chip.
  { key: 'halal', label: 'Halal' },
] as const;

export type DietaryKey = (typeof DIETARY_OPTIONS)[number]['key'];

/**
 * Diet keys this form no longer offers, kept so a reply saved before the switch
 * to allergies still parses and still displays its real label.
 */
const RETIRED_LABELS: Record<string, string> = {
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  gluten_free: 'Gluten-free',
  nut_allergy: 'Nut allergy',
  dairy_free: 'Dairy-free',
  tree_nuts: 'Tree nuts',
};

/** Non-empty tuple of keys for `z.enum` in lib/validation.ts. */
export const DIETARY_KEYS = DIETARY_OPTIONS.map((o) => o.key) as [
  DietaryKey,
  ...DietaryKey[],
];

const LABEL_BY_KEY: Record<string, string> = Object.fromEntries(
  DIETARY_OPTIONS.map((o) => [o.key, o.label]),
);

/** Human label for a preset key (retired keys, then the raw key). */
export function dietaryLabel(key: string): string {
  return LABEL_BY_KEY[key] ?? RETIRED_LABELS[key] ?? key;
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
