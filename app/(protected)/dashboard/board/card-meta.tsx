import type { ReactNode } from "react";

import { MUT, RULE } from "@/app/(protected)/dashboard/board/tokens";

/**
 * Minimal card meta block: a small-caps label above its content, divided by a
 * hairline rule (no filled background) so the card stays elegant and quiet.
 * Shared by Contact and Notes.
 */
export function CardMeta({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-2.5 border-t pt-2" style={{ borderColor: RULE }}>
      <div
        className="mb-1.5 text-[9px] font-semibold tracking-[0.14em] uppercase"
        style={{ color: MUT }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}
