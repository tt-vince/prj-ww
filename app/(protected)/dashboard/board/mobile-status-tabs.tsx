"use client";

import { headcount } from "@/app/(protected)/dashboard/board/headcount";
import { COLUMNS, INK, MUT } from "@/app/(protected)/dashboard/board/tokens";
import type { GuestRow, GuestStatus } from "@/app/(protected)/dashboard/board/types";

// Mobile tab order leads with Attending (per the mobile design).
const MOBILE_ORDER: GuestStatus[] = ["going", "pending", "not_going"];

// Mobile: status tabs
export function MobileStatusTabs({
  tab,
  onTabChange,
  byStatus,
}: {
  tab: GuestStatus;
  onTabChange: (tab: GuestStatus) => void;
  byStatus: Record<GuestStatus, GuestRow[]>;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 md:hidden">
      {MOBILE_ORDER.map((key) => {
        const col = COLUMNS.find((c) => c.key === key)!;
        const on = tab === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onTabChange(key)}
            aria-pressed={on}
            className="rounded-xl border px-1.5 pt-2.5 pb-2 text-center transition-colors"
            style={{
              background: on ? col.bg : "#fdfaf3",
              borderColor: on ? col.border : "#e6ddcc",
            }}
          >
            <span className="flex items-center justify-center gap-1.5">
              <span
                className="size-[7px] flex-none rounded-full"
                style={{ background: col.dot }}
              />
              <span
                className="text-xs font-semibold"
                style={{ color: on ? col.activeText : MUT }}
              >
                {col.short}
              </span>
            </span>
            <span
              className="mt-1 block font-sans text-2xl leading-none"
              style={{ color: on ? INK : "#c4b7a0" }}
            >
              {headcount(byStatus[key])}
            </span>
          </button>
        );
      })}
    </div>
  );
}
