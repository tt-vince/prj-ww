"use client";

import { Search, Sparkle } from "lucide-react";
import type { Label as LabelRow } from "@/db/schema";

import { Input } from "@/components/ui/input";
import {
  FilterDropdown,
  type Selection,
} from "@/app/(protected)/dashboard/board/filter-dropdown";

// Toolbar: drag hint + summary + label filter + search
export function BoardToolbar({
  canEdit,
  filterActive,
  filteredCount,
  totalCount,
  pct,
  labels,
  labelSel,
  onToggleLabel,
  query,
  onQueryChange,
}: {
  canEdit: boolean;
  filterActive: boolean;
  filteredCount: number;
  totalCount: number;
  pct: number;
  labels: LabelRow[];
  labelSel: Selection;
  onToggleLabel: (id: string) => void;
  query: string;
  onQueryChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
      {canEdit ? (
        <div className="hidden items-center gap-2 text-[12.5px] text-muted-foreground md:flex">
          <Sparkle className="size-3.5 text-(--dot-pending)" />
          Drag a guest between columns to update their RSVP
        </div>
      ) : null}
      <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
        {filterActive
          ? `${filteredCount} of ${totalCount}`
          : `${totalCount} invited · ${pct}% replied`}
      </span>
      <div className="flex-1" />
      <div className="flex flex-wrap items-center gap-2">
        {labels.length > 0 ? (
          <FilterDropdown
            prefix="Tags"
            options={labels.map((l) => ({ id: l.id, name: l.name }))}
            selected={labelSel}
            onToggle={onToggleLabel}
          />
        ) : null}
        <div className="relative w-full sm:w-56">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search guests…"
            className="pl-9"
            aria-label="Search guests"
          />
        </div>
      </div>
    </div>
  );
}
