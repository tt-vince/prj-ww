"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, ChevronsUpDown, Search } from "lucide-react";
import type { Label as LabelRow } from "@/db/schema";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GuestDialog } from "./guests/guest-dialog";
import { DeleteGuestButton } from "./guests/delete-guest-button";
import { CopyLinkButton } from "./guests/copy-link-button";

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

const STATUS: Record<GuestStatus, { label: string; className: string }> = {
  going: { label: "Attending", className: "bg-(--pill-going-bg) text-(--pill-going-fg)" },
  pending: {
    label: "Awaiting",
    className: "bg-(--pill-pending-bg) text-(--pill-pending-fg)",
  },
  not_going: {
    label: "Declined",
    className: "bg-(--pill-declined-bg) text-(--pill-declined-fg)",
  },
};

const STATUS_OPTIONS: { id: GuestStatus; name: string }[] = [
  { id: "going", name: "Attending" },
  { id: "pending", name: "Awaiting" },
  { id: "not_going", name: "Declined" },
];

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

const TH = "text-[10.5px] font-semibold tracking-wider text-muted-foreground uppercase";

type SortKey = "name" | "replied";
type SortState = { key: SortKey; dir: "asc" | "desc" } | null;

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
  // Empty → auto re-check everything; full → same as "all".
  if (next.size === 0 || next.size === allIds.length) return null;
  return next;
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

// Mobile guest card (design: "Wedding RSVP Dashboard - Mobile.dc.html") — the
// table collapses into these below `md`.
function GuestCard({
  row,
  labels,
  baseUrl,
}: {
  row: GuestRow;
  labels: LabelRow[];
  baseUrl: string;
}) {
  const status = STATUS[row.status];
  const av = tint(row.name);
  const guestData = {
    id: row.id,
    name: row.name,
    maxGuests: row.maxGuests,
    email: row.email,
    phone: row.phone,
    adminNote: row.adminNote,
    status: row.status,
    labelIds: row.labels.map((l) => l.id),
  };
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-[0_2px_12px_rgba(74,47,58,0.05)]">
      <div className="flex items-start gap-3">
        <Avatar className="size-11">
          <AvatarFallback
            style={{ background: av.bg, color: av.fg }}
            className="text-xs font-semibold"
          >
            {initials(row.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-[15px] font-semibold text-foreground">{row.name}</span>
            <Badge className={cn("shrink-0 border-transparent", status.className)}>
              {status.label}
            </Badge>
          </div>
          <div className="mt-0.5 truncate text-xs text-muted-foreground">{row.email ?? "—"}</div>
          {row.labels.length > 0 ? (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {row.labels.map((l) => (
                <Badge key={l.id} variant="secondary">
                  {l.name}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-4 border-t pt-3 text-[12.5px] text-muted-foreground">
        <span>
          Party{" "}
          <b className="font-semibold text-foreground tabular-nums">
            {row.adults == null && row.kids == null
              ? "—"
              : (row.adults ?? 0) + (row.kids ?? 0)}
            /{row.maxGuests}
          </b>
        </span>
        <span>
          Replied{" "}
          <b className="font-semibold text-foreground tabular-nums">
            {row.respondedAt ? row.respondedAt.slice(0, 10) : "—"}
          </b>
        </span>
        <div className="flex-1" />
        <div className="flex items-center gap-1">
          <CopyLinkButton token={row.token} baseUrl={baseUrl} />
          <GuestDialog mode="edit" labels={labels} guest={guestData} />
          <DeleteGuestButton guestId={row.id} name={row.name} />
        </div>
      </div>
      {row.guestNote || row.adminNote ? (
        <div className="mt-2.5 flex flex-col gap-1.5 rounded-[10px] bg-muted px-3 py-2">
          {row.guestNote ? (
            <div className="flex min-w-0 flex-col">
              <span className="text-[9px] font-semibold tracking-wider text-(--pill-going-fg) uppercase">
                Guest
              </span>
              <span className="text-xs text-foreground/80 italic">“{row.guestNote}”</span>
            </div>
          ) : null}
          {row.adminNote ? (
            <div className="flex min-w-0 flex-col">
              <span className="text-[9px] font-semibold tracking-wider text-muted-foreground uppercase">
                Admin
              </span>
              <span className="text-xs text-muted-foreground italic">{row.adminNote}</span>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function SortHead({
  label,
  k,
  sort,
  onToggle,
}: {
  label: string;
  k: SortKey;
  sort: SortState;
  onToggle: (key: SortKey) => void;
}) {
  const active = sort?.key === k;
  const Icon = !active ? ChevronsUpDown : sort!.dir === "asc" ? ArrowUp : ArrowDown;
  return (
    <button
      type="button"
      onClick={() => onToggle(k)}
      className={cn(
        "inline-flex items-center gap-1 uppercase transition-colors hover:text-foreground",
        active && "text-foreground",
      )}
      aria-label={`Sort by ${label}`}
    >
      {label}
      <Icon className="size-3" />
    </button>
  );
}

export function GuestsTable({
  rows,
  labels,
  baseUrl,
}: {
  rows: GuestRow[];
  labels: LabelRow[];
  baseUrl: string;
}) {
  const [query, setQuery] = useState("");
  const [labelSel, setLabelSel] = useState<Selection>(null);
  const [statusSel, setStatusSel] = useState<Selection>(null);
  const [sort, setSort] = useState<SortState>(null);

  const labelIds = useMemo(() => labels.map((l) => l.id), [labels]);
  const statusIds = STATUS_OPTIONS.map((s) => s.id);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (labelSel && !row.labels.some((l) => labelSel.has(l.id))) return false;
      if (statusSel && !statusSel.has(row.status)) return false;
      if (!q) return true;
      return [row.name, row.email, row.phone, ...row.labels.map((l) => l.name)]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q));
    });
  }, [rows, query, labelSel, statusSel]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sort.key === "name") return a.name.localeCompare(b.name) * dir;
      // Replied: unanswered rows always sink to the bottom.
      if (!a.respondedAt && !b.respondedAt) return 0;
      if (!a.respondedAt) return 1;
      if (!b.respondedAt) return -1;
      return a.respondedAt.localeCompare(b.respondedAt) * dir;
    });
  }, [filtered, sort]);

  function toggleSort(key: SortKey) {
    setSort((s) =>
      s?.key !== key ? { key, dir: "asc" } : s.dir === "asc" ? { key, dir: "desc" } : null,
    );
  }

  return (
    <Card className="gap-0 overflow-hidden rounded-[18px] py-0">
      {/* Card header: title + count + filter dropdowns + search */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 px-5 pt-5 pb-4 sm:px-6">
        <h2 className="font-serif text-[21px] leading-none text-foreground">Guest list</h2>
        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
          {sorted.length} of {rows.length}
        </span>
        <div className="hidden flex-1 lg:block" />
        <div className="flex flex-wrap items-center gap-2">
          {labels.length > 0 ? (
            <FilterDropdown
              prefix="Tags"
              options={labels.map((l) => ({ id: l.id, name: l.name }))}
              selected={labelSel}
              onToggle={(id) => setLabelSel((s) => toggleSelection(s, labelIds, id))}
            />
          ) : null}
          <FilterDropdown
            prefix="Status"
            options={STATUS_OPTIONS}
            selected={statusSel}
            onToggle={(id) => setStatusSel((s) => toggleSelection(s, statusIds, id))}
          />
        </div>
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

      {sorted.length === 0 ? (
        <div className="border-t px-6 py-10">
          <Empty>
            <EmptyHeader>
              <EmptyTitle>{rows.length === 0 ? "No guests yet" : "No matches"}</EmptyTitle>
              <EmptyDescription>
                {rows.length === 0
                  ? "Add your first invitee to generate their RSVP link."
                  : "Try a different search or clear the filter."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      ) : (
        <>
          {/* Mobile: card list */}
          <div className="flex flex-col gap-3 border-t px-4 py-4 md:hidden">
            {sorted.map((row) => (
              <GuestCard key={row.id} row={row} labels={labels} baseUrl={baseUrl} />
            ))}
          </div>

          {/* Tablet & up: table */}
          <div className="hidden overflow-x-auto border-t md:block">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead className={cn(TH, "hidden w-10 sm:table-cell")}>#</TableHead>
                <TableHead className={TH}>
                  <SortHead label="Guest" k="name" sort={sort} onToggle={toggleSort} />
                </TableHead>
                <TableHead className={cn(TH, "hidden xl:table-cell")}>Contact</TableHead>
                <TableHead className={TH}>Party</TableHead>
                <TableHead className={TH}>Status</TableHead>
                <TableHead className={cn(TH, "hidden lg:table-cell")}>Tags</TableHead>
                <TableHead className={cn(TH, "hidden xl:table-cell")}>Note</TableHead>
                <TableHead className={cn(TH, "hidden md:table-cell")}>
                  <SortHead label="Replied" k="replied" sort={sort} onToggle={toggleSort} />
                </TableHead>
                <TableHead className={cn(TH, "text-right")}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((row, i) => {
                const status = STATUS[row.status];
                const av = tint(row.name);
                const guestData = {
                  id: row.id,
                  name: row.name,
                  maxGuests: row.maxGuests,
                  email: row.email,
                  phone: row.phone,
                  adminNote: row.adminNote,
                  status: row.status,
                  labelIds: row.labels.map((l) => l.id),
                };
                return (
                  <TableRow key={row.id}>
                    <TableCell className="hidden text-muted-foreground tabular-nums sm:table-cell">
                      {i + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9">
                          <AvatarFallback
                            style={{ background: av.bg, color: av.fg }}
                            className="text-xs font-semibold"
                          >
                            {initials(row.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-foreground">{row.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground xl:table-cell">
                      <div className="flex flex-col leading-tight">
                        <span>{row.email ?? "—"}</span>
                        {row.phone ? <span className="text-xs">{row.phone}</span> : null}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium tabular-nums">
                      {row.adults == null && row.kids == null
                        ? "—"
                        : `${(row.adults ?? 0) + (row.kids ?? 0)} (${row.adults ?? 0}A · ${row.kids ?? 0}K)`}
                      <span className="text-muted-foreground"> / {row.maxGuests}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("border-transparent", status.className)}>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {row.labels.length === 0 ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          row.labels.map((l) => (
                            <Badge key={l.id} variant="secondary">
                              {l.name}
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden max-w-52 xl:table-cell">
                      {row.guestNote || row.adminNote ? (
                        <div className="flex flex-col gap-1.5">
                          {row.guestNote ? (
                            <div className="flex min-w-0 flex-col">
                              <span className="text-[9px] font-semibold tracking-wider text-(--pill-going-fg) uppercase">
                                Guest
                              </span>
                              <span
                                className="truncate text-xs text-foreground/80 italic"
                                title={row.guestNote}
                              >
                                {row.guestNote}
                              </span>
                            </div>
                          ) : null}
                          {row.adminNote ? (
                            <div className="flex min-w-0 flex-col">
                              <span className="text-[9px] font-semibold tracking-wider text-muted-foreground uppercase">
                                Admin
                              </span>
                              <span
                                className="truncate text-xs text-muted-foreground italic"
                                title={row.adminNote}
                              >
                                {row.adminNote}
                              </span>
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground tabular-nums md:table-cell">
                      {row.respondedAt ? row.respondedAt.slice(0, 10) : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1.5">
                        <CopyLinkButton token={row.token} baseUrl={baseUrl} />
                        <GuestDialog mode="edit" labels={labels} guest={guestData} />
                        <DeleteGuestButton guestId={row.id} name={row.name} />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          </div>
        </>
      )}
    </Card>
  );
}
