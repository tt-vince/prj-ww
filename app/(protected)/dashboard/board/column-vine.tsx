import {
  ColumnVineBottomLeft,
  ColumnVineTopRight,
} from "@/components/dashboard/florals";
import type { GuestStatus } from "@/app/(protected)/dashboard/board/types";

// Per-column vine layer: Awaiting gets the bottom-left frame, Declined the
// top-right frame — stems on the column outline. Attending has NO vine
// (explicit decision after the full-outline attempts failed review).
export function ColumnVine({ status }: { status: GuestStatus }) {
  if (status === "pending") return <ColumnVineBottomLeft />;
  if (status === "not_going") return <ColumnVineTopRight />;
  return null;
}
