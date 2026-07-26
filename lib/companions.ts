import { dietaryList } from '@/lib/dietary';

/**
 * A companion as every surface needs to read it: the guest letter reading a reply
 * back, the dashboard card, and the CSV export. Structurally the `companions`
 * row (db/schema.ts) minus its ids and timestamps.
 */
export type CompanionSummary = {
  kind: 'adult' | 'kid';
  position: number;
  name: string;
  dietary: string[];
  dietaryOther: string | null;
};

/** "Adult 2" / "Kid 1" — the same label the guest filled the card in under. */
export function companionLabel(kind: 'adult' | 'kid', position: number): string {
  return `${kind === 'kid' ? 'Kid' : 'Adult'} ${position}`;
}

/** Their restrictions as one display string, or '' when they gave none. */
export function companionDietary(c: CompanionSummary): string {
  return dietaryList(c.dietary, c.dietaryOther).join(', ');
}

/**
 * Adults before kids, each in the order the form showed them. The DB query
 * already orders this way; sorting here too keeps any other caller honest.
 */
export function sortCompanions<T extends CompanionSummary>(list: T[]): T[] {
  return [...list].sort((a, b) =>
    a.kind === b.kind
      ? a.position - b.position
      : a.kind === 'adult'
        ? -1
        : 1,
  );
}

/**
 * One-line-per-person text for a flat context (the CSV cell):
 * `Adult 2: Marites Reyes [Vegan; Nut allergy]; Kid 1: Nino`.
 */
export function companionsToText(list: CompanionSummary[]): string {
  return sortCompanions(list)
    .map((c) => {
      const diet = companionDietary(c);
      return `${companionLabel(c.kind, c.position)}: ${c.name}${
        diet ? ` [${diet.replace(/, /g, '; ')}]` : ''
      }`;
    })
    .join('; ');
}
