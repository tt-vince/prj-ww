"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GuestRow } from "./guests-board";

const STATUS_TEXT: Record<GuestRow["status"], string> = {
  going: "Going",
  pending: "Awaiting",
  not_going: "Not going",
};

/** Wrap a CSV cell: quote and escape embedded quotes. */
function cell(value: string | number | null): string {
  const s = value == null ? "" : String(value);
  return `"${s.replace(/"/g, '""')}"`;
}

/** Client-side CSV export of the full guest list (no extra route needed). */
export function ExportGuestsButton({
  rows,
  baseUrl,
}: {
  rows: GuestRow[];
  baseUrl: string;
}) {
  function exportCsv() {
    const header = [
      "Name",
      "Email",
      "Phone",
      "Status",
      "Adults",
      "Kids",
      "Max guests",
      "Labels",
      "Guest note",
      "Admin note",
      "Responded at",
      "Invite link",
    ];
    const base = baseUrl || (typeof window !== "undefined" ? window.location.origin : "");
    const lines = rows.map((r) =>
      [
        r.name,
        r.email,
        r.phone,
        STATUS_TEXT[r.status],
        r.adults,
        r.kids,
        r.maxGuests,
        r.labels.map((l) => l.name).join("; "),
        r.guestNote,
        r.adminNote,
        r.respondedAt ? r.respondedAt.slice(0, 10) : "",
        `${base}/?id=${r.token}`,
      ]
        .map(cell)
        .join(","),
    );
    const csv = [header.map(cell).join(","), ...lines].join("\r\n");
    const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wedding-rsvps.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button variant="outline" onClick={exportCsv} disabled={rows.length === 0}>
      <Download /> Export CSV
    </Button>
  );
}
