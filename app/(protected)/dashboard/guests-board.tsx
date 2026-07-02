"use client";

import {
  useMemo,
  useOptimistic,
  useState,
  useTransition,
  type DragEvent,
} from "react";
import { ChevronDown, Search, Sparkle } from "lucide-react";
import type { Label as LabelRow } from "@/db/schema";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CardCornerFrame,
  ColumnVineBottomLeft,
  ColumnVineFull,
  ColumnVineTopRight,
  type Corner,
} from "@/components/dashboard-florals";
import { moveGuestStatus } from "./guests/actions";
import { GuestDialog } from "./guests/guest-dialog";
import { DeleteGuestButton } from "./guests/delete-guest-button";
import { CopyLinkButton } from "./guests/copy-link-button";

// Per-column vine layer (design): Awaiting gets a bottom-left sprig, Declined a
// top-right sprig, and Attending the full four-corner garland.
function ColumnVine({ status }: { status: GuestStatus }) {
  if (status === "going") return <ColumnVineFull />;
  if (status === "pending") return <ColumnVineBottomLeft />;
  return <ColumnVineTopRight />;
}

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
  guestNote: string | null;
  respondedAt: string | null;
  labels: { id: string; name: string }[];
};

/**
 * Kanban palette from the hi-fi design ("Wedding RSVP - Kanban.dc.html").
 * The tints are hardcoded (like the floral art) — they are the design's warm
 * column washes, not theme tokens.
 */
const COLUMNS: {
  key: GuestStatus;
  label: string;
  short: string;
  dot: string;
  bg: string;
  hoverBg: string;
  border: string;
  activeText: string;
}[] = [
  {
    key: "pending",
    label: "Awaiting reply",
    short: "Awaiting",
    dot: "#c29b4a",
    bg: "#faf4e6",
    hoverBg: "#f6ecd4",
    border: "#e6d6b0",
    activeText: "#8f6f2b",
  },
  {
    key: "going",
    label: "Attending",
    short: "Attending",
    dot: "#7d9163",
    bg: "#eef1e6",
    hoverBg: "#e6ecd8",
    border: "#cdd8ba",
    activeText: "#4f6339",
  },
  {
    key: "not_going",
    label: "Declined",
    short: "Declined",
    dot: "#b8798d",
    bg: "#f6ebee",
    hoverBg: "#efe0e4",
    border: "#e2c4cd",
    activeText: "#96566b",
  },
];

// Mobile tab order leads with Attending (per the mobile design).
const MOBILE_ORDER: GuestStatus[] = ["going", "pending", "not_going"];

// Corner cycled per mobile card so each item's vine alternates around the stack.
const CARD_VINE_CYCLE: Corner[] = ["tl", "tr", "br", "bl"];

// Warm card inks from the design — used inside the tinted columns.
const INK = "#3d332b";
const MUT = "#a2937f";
const FAINT = "#b3a58e";
const CARD_BORDER = "#e7ddca";
const CHIP_BORDER = "#e4d9c0";
const CHIP_TEXT = "#87796a";
const RULE = "#f1eadb";

// Soft tints cycled per guest so avatars read as distinct people (design detail).
const AV = [
  { bg: "#ece6f3", fg: "#6f5b95" },
  { bg: "#f6e6ec", fg: "#b07d8c" },
  { bg: "#e9f0e2", fg: "#5f7a48" },
  { bg: "#f7efda", fg: "#a9832f" },
  { bg: "#e6eef0", fg: "#5b8390" },
];
function tint(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return AV[h % AV.length];
}
function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts.length >= 2 ? parts[0][0] + parts[1][0] : name.slice(0, 2)).toUpperCase();
}

/** Seats a card occupies: the reply head-count once answered, else the allotment. */
function partySize(row: GuestRow): number {
  if (row.adults == null && row.kids == null) return row.maxGuests;
  return (row.adults ?? 0) + (row.kids ?? 0);
}

const PAGE = 20;

/**
 * Multi-select filter selection. `null` means "all checked" (the default and
 * the state we snap back to when the user unchecks the last item), so newly
 * created labels are included without any state bookkeeping.
 */
type Selection = Set<string> | null;

function toggleSelection(sel: Selection, allIds: string[], id: string): Selection {
  const next = new Set(sel ?? allIds);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  if (next.size === 0 || next.size === allIds.length) return null;
  return next;
}

function guestDialogData(row: GuestRow) {
  return {
    id: row.id,
    name: row.name,
    maxGuests: row.maxGuests,
    email: row.email,
    phone: row.phone,
    adminNote: row.adminNote,
    adults: row.adults,
    kids: row.kids,
    status: row.status,
    labelIds: row.labels.map((l) => l.id),
  };
}

// Guest card (shared by the desktop columns and the mobile tab list).
function GuestCard({
  row,
  labels,
  baseUrl,
  canEdit,
  dragging,
  draggable,
  vineCorner,
  onDragStart,
  onDragEnd,
}: {
  row: GuestRow;
  labels: LabelRow[];
  baseUrl: string;
  canEdit: boolean;
  dragging?: boolean;
  draggable?: boolean;
  /** When set (mobile list), draw an alternating corner vine on the card. */
  vineCorner?: Corner;
  onDragStart?: (e: DragEvent) => void;
  onDragEnd?: () => void;
}) {
  const av = tint(row.name);
  const answered = row.adults != null || row.kids != null;
  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        "relative overflow-hidden rounded-[13px] border bg-card p-3.5 shadow-[0_1px_3px_rgba(61,51,43,0.06)] transition-opacity",
        draggable && "cursor-grab active:cursor-grabbing",
        dragging && "opacity-40",
      )}
      style={{ borderColor: CARD_BORDER }}
    >
      {vineCorner ? <CardCornerFrame corner={vineCorner} /> : null}
      <div className="relative z-[1]">
      <div className="flex items-center gap-3">
        <Avatar className="size-9.5">
          <AvatarFallback
            style={{ background: av.bg, color: av.fg }}
            className="font-serif text-sm"
          >
            {initials(row.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold" style={{ color: INK }}>
            {row.name}
          </div>
          <div className="truncate text-[11.5px]" style={{ color: MUT }}>
            {row.email ?? "—"}
          </div>
        </div>
        <div
          className="flex-none font-serif text-[15px] text-stat-going"
          title={answered ? "Party size" : "Seat allotment"}
        >
          ×{partySize(row)}
        </div>
      </div>

      {row.labels.length > 0 ? (
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          {row.labels.map((l) => (
            <span
              key={l.id}
              className="rounded-md border px-2 py-0.5 text-[10.5px]"
              style={{ borderColor: CHIP_BORDER, color: CHIP_TEXT }}
            >
              {l.name}
            </span>
          ))}
        </div>
      ) : null}

      {row.respondedAt ? (
        <div className="mt-2 text-[11px]" style={{ color: FAINT }}>
          <span className="font-semibold tracking-wider uppercase">Replied</span>{" "}
          <span className="tabular-nums">{row.respondedAt.slice(0, 10)}</span>
        </div>
      ) : null}

      {row.guestNote || row.adminNote ? (
        <div
          className="mt-2.5 flex flex-col gap-2 rounded-[10px] px-3 py-2.5"
          style={{ background: "#faf6ee", border: `1px solid ${RULE}` }}
        >
          <span
            className="text-[9px] font-semibold tracking-[0.14em] uppercase"
            style={{ color: MUT }}
          >
            Notes
          </span>
          {row.guestNote ? (
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-semibold tracking-wider text-stat-going uppercase">
                Guest
              </span>
              <span className="text-[11.5px] italic" style={{ color: INK }}>
                “{row.guestNote}”
              </span>
            </div>
          ) : null}
          {row.adminNote ? (
            <div className="flex flex-col gap-0.5">
              <span
                className="text-[9px] font-semibold tracking-wider uppercase"
                style={{ color: MUT }}
              >
                Admin
              </span>
              <span className="text-[11.5px]" style={{ color: CHIP_TEXT }}>
                {row.adminNote}
              </span>
            </div>
          ) : null}
        </div>
      ) : null}

      <div
        className="mt-2.5 flex items-center justify-end gap-1 border-t pt-2"
        style={{ borderColor: RULE }}
      >
        <CopyLinkButton token={row.token} baseUrl={baseUrl} />
        {canEdit ? (
          <>
            <GuestDialog mode="edit" labels={labels} guest={guestDialogData(row)} />
            <DeleteGuestButton guestId={row.id} name={row.name} />
          </>
        ) : null}
      </div>
      </div>
    </div>
  );
}

function FilterDropdown({
  prefix,
  options,
  selected,
  onToggle,
}: {
  prefix: string;
  options: { id: string; name: string }[];
  selected: Selection;
  onToggle: (id: string) => void;
}) {
  const summary =
    selected == null
      ? "All"
      : options
          .filter((o) => selected.has(o.id))
          .map((o) => o.name)
          .join(", ");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="h-7 rounded-full border-input px-3.5 text-[12.5px] font-normal text-muted-foreground"
          >
            <span className="font-medium text-foreground/70">{prefix}:</span>
            <span className="max-w-40 truncate">{summary}</span>
            <ChevronDown className="size-3.5" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="min-w-44">
        {options.map((o) => (
          <DropdownMenuCheckboxItem
            key={o.id}
            checked={selected == null || selected.has(o.id)}
            onCheckedChange={() => onToggle(o.id)}
            closeOnClick={false}
          >
            {o.name}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Column head-count. `guests` is shown everywhere; the `seats` figure (total
 * attending party size) is only meaningful for the Attending column, so it is
 * opt-in via `showSeats` — Awaiting/Declined show the guest count alone.
 */
function ColumnStats({
  count,
  seats,
  showSeats,
  size,
}: {
  count: number;
  seats: number;
  showSeats: boolean;
  size?: "sm";
}) {
  const num = size === "sm" ? "text-[22px]" : "text-[27px]";
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-baseline gap-1.5">
        <span className={cn("font-serif leading-none", num)} style={{ color: INK }}>
          {count}
        </span>
        <span className="text-[10.5px] tracking-[0.08em] uppercase" style={{ color: MUT }}>
          guests
        </span>
      </div>
      {showSeats ? (
        <>
          <div className="h-5 w-px" style={{ background: CHIP_BORDER }} />
          <div className="flex items-baseline gap-1.5">
            <span className={cn("font-serif leading-none", num)} style={{ color: INK }}>
              {seats}
            </span>
            <span className="text-[10.5px] tracking-[0.08em] uppercase" style={{ color: MUT }}>
              seats
            </span>
          </div>
        </>
      ) : null}
    </div>
  );
}

/**
 * Kanban guest board (imported design): desktop/tablet get three drag-and-drop
 * status columns; phones get status tabs over the same card list (no drag).
 * Search and the label filter apply to every column/tab.
 */
export function GuestsBoard({
  rows,
  labels,
  baseUrl,
  canEdit,
}: {
  rows: GuestRow[];
  labels: LabelRow[];
  baseUrl: string;
  /** Viewers get a read-only board — no drag, no edit/delete controls. */
  canEdit: boolean;
}) {
  const [query, setQuery] = useState("");
  const [labelSel, setLabelSel] = useState<Selection>(null);
  const [tab, setTab] = useState<GuestStatus>("going");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overKey, setOverKey] = useState<GuestStatus | null>(null);
  const [limits, setLimits] = useState<Record<GuestStatus, number>>({
    pending: PAGE,
    going: PAGE,
    not_going: PAGE,
  });
  const [, startTransition] = useTransition();

  // Drag moves land instantly; the server action + tag invalidation reconcile.
  const [optimisticRows, applyMove] = useOptimistic(
    rows,
    (state, move: { id: string; status: GuestStatus }) =>
      state.map((r) => (r.id === move.id ? { ...r, status: move.status } : r)),
  );

  const labelIds = useMemo(() => labels.map((l) => l.id), [labels]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return optimisticRows.filter((row) => {
      if (labelSel && !row.labels.some((l) => labelSel.has(l.id))) return false;
      if (!q) return true;
      return [row.name, row.email, row.phone, ...row.labels.map((l) => l.name)]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q));
    });
  }, [optimisticRows, query, labelSel]);

  const byStatus = useMemo(() => {
    const m: Record<GuestStatus, GuestRow[]> = { pending: [], going: [], not_going: [] };
    for (const row of filtered) m[row.status].push(row);
    return m;
  }, [filtered]);

  const filterActive = query.trim() !== "" || labelSel != null;
  const responded = optimisticRows.filter((r) => r.status !== "pending").length;
  const pct = rows.length ? Math.round((responded / rows.length) * 100) : 0;

  function moveTo(id: string, status: GuestStatus) {
    startTransition(async () => {
      applyMove({ id, status });
      await moveGuestStatus(id, status);
    });
  }

  function dropHandlers(key: GuestStatus) {
    if (!canEdit) return {};
    return {
      onDragOver: (e: DragEvent) => {
        e.preventDefault();
        if (overKey !== key) setOverKey(key);
      },
      onDragLeave: (e: DragEvent) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOverKey(null);
      },
      onDrop: (e: DragEvent) => {
        e.preventDefault();
        const id = draggingId;
        setDraggingId(null);
        setOverKey(null);
        if (id && optimisticRows.find((r) => r.id === id)?.status !== key) moveTo(id, key);
      },
    };
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar: drag hint + summary + label filter + search */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        {canEdit ? (
          <div className="hidden items-center gap-2 text-[12.5px] text-muted-foreground md:flex">
            <Sparkle className="size-3.5 text-(--dot-pending)" />
            Drag a guest between columns to update their RSVP
          </div>
        ) : null}
        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
          {filterActive
            ? `${filtered.length} of ${rows.length}`
            : `${rows.length} invited · ${pct}% replied`}
        </span>
        <div className="flex-1" />
        <div className="flex flex-wrap items-center gap-2">
          {labels.length > 0 ? (
            <FilterDropdown
              prefix="Tags"
              options={labels.map((l) => ({ id: l.id, name: l.name }))}
              selected={labelSel}
              onToggle={(id) => setLabelSel((s) => toggleSelection(s, labelIds, id))}
            />
          ) : null}
          <div className="relative w-full sm:w-56">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search guests…"
              className="pl-9"
              aria-label="Search guests"
            />
          </div>
        </div>
      </div>

      {/* Mobile: status tabs */}
      <div className="grid grid-cols-3 gap-2 md:hidden">
        {MOBILE_ORDER.map((key) => {
          const col = COLUMNS.find((c) => c.key === key)!;
          const on = tab === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
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
                className="mt-1 block font-serif text-2xl leading-none"
                style={{ color: on ? INK : "#c4b7a0" }}
              >
                {byStatus[key].length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Mobile: active tab card list */}
      <div className="relative flex flex-col gap-3 md:hidden">
        <ColumnVine status={tab} />
        <div className="relative z-[1] flex flex-col gap-3">
        <ColumnStats
          size="sm"
          count={byStatus[tab].length}
          seats={byStatus[tab].reduce((sum, r) => sum + partySize(r), 0)}
          showSeats={tab === "going"}
        />
        {byStatus[tab].length === 0 ? (
          <div className="py-8 text-center text-[12.5px] italic" style={{ color: "#c4b7a0" }}>
            {filterActive ? "No matches" : "No guests here yet"}
          </div>
        ) : (
          byStatus[tab]
            .slice(0, limits[tab])
            .map((row, i) => (
              <GuestCard
                key={row.id}
                row={row}
                labels={labels}
                baseUrl={baseUrl}
                canEdit={canEdit}
                vineCorner={CARD_VINE_CYCLE[i % CARD_VINE_CYCLE.length]}
              />
            ))
        )}
        {byStatus[tab].length > limits[tab] ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLimits((l) => ({ ...l, [tab]: l[tab] + PAGE }))}
          >
            Show {Math.min(PAGE, byStatus[tab].length - limits[tab])} more
          </Button>
        ) : null}
        </div>
      </div>

      {/* Desktop / tablet: kanban columns */}
      <div className="hidden gap-5 md:grid md:grid-cols-3 lg:gap-6">
        {COLUMNS.map((col) => {
          const cards = byStatus[col.key];
          const over = overKey === col.key;
          const shown = cards.slice(0, limits[col.key]);
          return (
            <div
              key={col.key}
              {...dropHandlers(col.key)}
              className="relative flex flex-col rounded-2xl border border-dashed px-4 pt-4 pb-5 transition-colors"
              style={{
                background: over ? col.hoverBg : col.bg,
                borderColor: over ? col.dot : col.border,
              }}
            >
              <ColumnVine status={col.key} />
              <div className="relative z-[1] flex flex-1 flex-col">
              <div className="flex items-center gap-2.5 px-1">
                <span
                  className="size-[9px] flex-none rounded-full"
                  style={{ background: col.dot }}
                />
                <h2 className="font-serif text-[19px] leading-none" style={{ color: INK }}>
                  {col.label}
                </h2>
              </div>
              <div
                className="mx-1 mt-2 mb-3 h-0.5 rounded-full opacity-50"
                style={{ background: col.dot }}
              />
              <div className="px-1 pb-4">
                <ColumnStats
                  count={cards.length}
                  seats={cards.reduce((sum, r) => sum + partySize(r), 0)}
                  showSeats={col.key === "going"}
                />
              </div>
              <div className="flex flex-col gap-3">
                {shown.map((row) => (
                  <GuestCard
                    key={row.id}
                    row={row}
                    labels={labels}
                    baseUrl={baseUrl}
                    canEdit={canEdit}
                    draggable={canEdit}
                    dragging={draggingId === row.id}
                    onDragStart={(e) => {
                      if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
                      setDraggingId(row.id);
                    }}
                    onDragEnd={() => {
                      setDraggingId(null);
                      setOverKey(null);
                    }}
                  />
                ))}
              </div>
              {cards.length === 0 ? (
                <div
                  className="py-7 text-center text-[12.5px] italic"
                  style={{ color: "#c4b7a0" }}
                >
                  {filterActive ? "No matches" : canEdit ? "Drop guests here" : "No guests"}
                </div>
              ) : null}
              {cards.length > limits[col.key] ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 bg-card/60"
                  onClick={() => setLimits((l) => ({ ...l, [col.key]: l[col.key] + PAGE }))}
                >
                  Show {Math.min(PAGE, cards.length - limits[col.key])} more
                </Button>
              ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
