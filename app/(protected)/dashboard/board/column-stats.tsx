import { cn } from "@/lib/utils";
import { headcount } from "@/app/(protected)/dashboard/board/headcount";
import { CHIP_BORDER, INK, MUT } from "@/app/(protected)/dashboard/board/tokens";
import type { GuestRow } from "@/app/(protected)/dashboard/board/types";

/**
 * Column head-count. `guests` is shown everywhere; the adults/kids totals
 * (from the replies) are only meaningful for the Attending column, so they
 * are opt-in via `showCounts` — Awaiting/Declined show the guest count alone.
 */
export function ColumnStats({
  cards,
  showCounts,
  size,
}: {
  cards: GuestRow[];
  showCounts: boolean;
  size?: "sm";
}) {
  const num = size === "sm" ? "text-[22px]" : "text-[27px]";
  const adults = cards.reduce((sum, r) => sum + (r.adults ?? 0), 0);
  const kids = cards.reduce((sum, r) => sum + (r.kids ?? 0), 0);
  const people = headcount(cards);
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      <div className="flex items-baseline gap-1.5 whitespace-nowrap">
        <span className={cn("font-sans leading-none", num)} style={{ color: INK }}>
          {people}
        </span>
        <span className="text-[10.5px] tracking-[0.08em] uppercase" style={{ color: MUT }}>
          guests
        </span>
      </div>
      {showCounts ? (
        <>
          <div className="h-5 w-px" style={{ background: CHIP_BORDER }} />
          <div className="flex items-baseline gap-1.5 whitespace-nowrap">
            <span className={cn("font-sans leading-none", num)} style={{ color: INK }}>
              {adults}
            </span>
            <span className="text-[10.5px] tracking-[0.08em] uppercase" style={{ color: MUT }}>
              adults
            </span>
          </div>
          <div className="h-5 w-px" style={{ background: CHIP_BORDER }} />
          <div className="flex items-baseline gap-1.5 whitespace-nowrap">
            <span className={cn("font-sans leading-none", num)} style={{ color: INK }}>
              {kids}
            </span>
            <span className="text-[10.5px] tracking-[0.08em] uppercase" style={{ color: MUT }}>
              kids
            </span>
          </div>
        </>
      ) : null}
    </div>
  );
}
