import type { SnsAccounts } from "@/lib/sns";
import type { CompanionSummary } from "@/lib/companions";

export type GuestStatus = "pending" | "going" | "not_going";

export type GuestRow = {
  id: string;
  token: string;
  name: string;
  maxGuests: number;
  adults: number | null;
  kids: number | null;
  status: GuestStatus;
  email: string | null;
  phone: string | null;
  adminNote: string | null;
  snsAccounts: SnsAccounts;
  guestNote: string | null;
  dietary: string[];
  dietaryOther: string | null;
  respondedAt: string | null;
  labels: { id: string; name: string }[];
  /**
   * Everyone this party is bringing, each with their OWN restrictions. The
   * invitee is not in here — they are adult 1, and `dietary`/`dietaryOther`
   * above are theirs alone (db/schema.ts `companions`).
   */
  companions: CompanionSummary[];
};
