import type { GuestStatus } from "@/app/(protected)/dashboard/board/types";

/**
 * Kanban palette from the hi-fi design ("Wedding RSVP - Kanban.dc.html").
 * The tints are hardcoded (like the floral art) — they are the design's warm
 * column washes, not theme tokens.
 */
export const COLUMNS: {
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

export type BoardColumn = (typeof COLUMNS)[number];

// Warm card inks from the design — used inside the tinted columns.
export const INK = "#3d332b";
export const MUT = "#a2937f";
export const FAINT = "#b3a58e";
export const CARD_BORDER = "#e7ddca";
export const CHIP_BORDER = "#e4d9c0";
export const CHIP_TEXT = "#87796a";
export const RULE = "#f1eadb";

export const PAGE = 20;
