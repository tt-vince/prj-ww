import type { GuestRow } from "@/app/(protected)/dashboard/board/types";

/**
 * Seats a card occupies. A "going" reply counts its party (adults + kids);
 * Awaiting/Declined count the full seat allotment (maxGuests) — a declined
 * family of 4 means 4 people are out, and an awaited one means 4 pending.
 * Mirrors `headcount` so a card's number agrees with its column total.
 */
export function partySize(row: GuestRow): number {
  return row.status === "going" ? (row.adults ?? 0) + (row.kids ?? 0) : row.maxGuests;
}

/**
 * People represented by a set of cards (not the row count). An Attending reply
 * counts its party (adults + kids); Awaiting/Declined count the full seat
 * allotment (maxGuests) — a declined family of 4 means 4 people are out. Used
 * for every guest count in the board (column headers and mobile tab pills).
 */
export function headcount(cards: GuestRow[]): number {
  return cards.reduce(
    (sum, r) => sum + (r.status === "going" ? (r.adults ?? 0) + (r.kids ?? 0) : r.maxGuests),
    0,
  );
}

/** "2 adults · 1 kid" — zero/none parts hidden; empty string when nothing to show. */
export function partyBreakdown(adults: number | null, kids: number | null): string {
  const parts: string[] = [];
  if (adults != null && adults > 0) parts.push(`${adults} adult${adults === 1 ? "" : "s"}`);
  if (kids != null && kids > 0) parts.push(`${kids} kid${kids === 1 ? "" : "s"}`);
  return parts.join(" · ");
}
