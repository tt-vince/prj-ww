"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Label as LabelRow } from "@/db/schema";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
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
  partySize: number | null;
  status: GuestStatus;
  email: string | null;
  phone: string | null;
  adminNote: string | null;
  respondedAt: string | null;
  labels: { id: string; name: string }[];
};

const STATUS: Record<GuestStatus, { label: string; className: string }> = {
  going: { label: "Going", className: "bg-(--pill-going-bg) text-(--pill-going-fg)" },
  pending: {
    label: "Awaiting",
    className: "bg-(--pill-pending-bg) text-(--pill-pending-fg)",
  },
  not_going: {
    label: "Not going",
    className: "bg-(--pill-declined-bg) text-(--pill-declined-fg)",
  },
};

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
  const [activeLabel, setActiveLabel] = useState("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (activeLabel !== "all" && !row.labels.some((l) => l.id === activeLabel)) {
        return false;
      }
      if (!q) return true;
      return [row.name, row.email, row.phone, ...row.labels.map((l) => l.name)]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q));
    });
  }, [rows, query, activeLabel]);

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar: search + label filter pills */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-48 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search guests…"
            className="pl-9"
            aria-label="Search guests"
          />
        </div>
        {labels.length > 0 ? (
          <ToggleGroup
            value={[activeLabel]}
            onValueChange={(value: string[]) => setActiveLabel(value[0] ?? "all")}
            variant="outline"
            size="sm"
            className="flex-wrap"
          >
            <ToggleGroupItem value="all" className={PILL}>
              All
            </ToggleGroupItem>
            {labels.map((l) => (
              <ToggleGroupItem key={l.id} value={l.id} className={PILL}>
                {l.name}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>
              {rows.length === 0 ? "No guests yet" : "No matches"}
            </EmptyTitle>
            <EmptyDescription>
              {rows.length === 0
                ? "Add your first invitee to generate their RSVP link."
                : "Try a different search or clear the filter."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead className="hidden w-10 sm:table-cell">#</TableHead>
                <TableHead>Guest</TableHead>
                <TableHead className="hidden md:table-cell">Contact</TableHead>
                <TableHead>Party</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Tags</TableHead>
                <TableHead className="hidden xl:table-cell">Note</TableHead>
                <TableHead className="hidden lg:table-cell">Replied</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row, i) => {
                const status = STATUS[row.status];
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
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      <div className="flex flex-col leading-tight">
                        <span>{row.email ?? "—"}</span>
                        {row.phone ? (
                          <span className="text-xs">{row.phone}</span>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {row.partySize ?? "—"}
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
                            <Badge key={l.id} variant="outline">
                              {l.name}
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden max-w-48 truncate text-muted-foreground xl:table-cell">
                      {row.adminNote ?? "—"}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground tabular-nums lg:table-cell">
                      {row.respondedAt ? row.respondedAt.slice(0, 10) : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
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
      )}
    </div>
  );
}

// Active filter pill = wisteria (base-ui Toggle marks the on-state via aria-pressed / data-[state=on]).
const PILL =
  "aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground";
