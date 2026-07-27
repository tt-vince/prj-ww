import type { ReplySummary } from "@/components/letter/rsvp-reply";
import type { CompanionSummary } from "@/lib/companions";

/** Companion field keys as the form posts them (see lib/validation.ts). */
const COMPANION_NAME_KEY = /^companion\.(adult|kid)-(\d{1,2})\.name$/;

/** Blank or whitespace-only → null, so the read-back omits the row entirely. */
const text = (value: FormDataEntryValue | null): string | null =>
  (typeof value === "string" ? value.trim() : "") || null;

/**
 * The outgoing FormData, read into the shape the read-back renders. Everything
 * comes from the form itself rather than from React state, so the uncontrolled
 * dietary chips and note are included exactly as they were posted.
 */
export function summarizeReply(formData: FormData): ReplySummary {
  const status = formData.get("status") === "not_going" ? "not_going" : "going";
  const going = status === "going";

  const count = (key: string): number | null => {
    const n = Number(formData.get(key));
    return Number.isFinite(n) ? n : null;
  };

  const companions: CompanionSummary[] = [];
  for (const key of new Set(formData.keys())) {
    const match = COMPANION_NAME_KEY.exec(key);
    if (!match) continue;
    const [, kind, position] = match;
    const field = `companion.${kind}-${position}`;
    companions.push({
      kind: kind as "adult" | "kid",
      position: Number(position),
      name: text(formData.get(key)) ?? "",
      dietary: formData.getAll(`${field}.dietary`).map(String),
      dietaryOther: text(formData.get(`${field}.dietaryOther`)),
    });
  }

  return {
    status,
    adults: going ? count("adults") : null,
    kids: going ? count("kids") : null,
    dietary: going ? formData.getAll("dietary").map(String) : [],
    dietaryOther: going ? text(formData.get("dietaryOther")) : null,
    guestNote: text(formData.get("guestNote")),
    companions: going ? companions : [],
  };
}
