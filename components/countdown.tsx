"use client";

import { useEffect, useState, type ReactNode } from "react";
import { WEDDING_DATE_ISO } from "@/lib/wedding";
import { cn } from "@/lib/utils";

const TARGET_DATE = new Date(WEDDING_DATE_ISO);

function diff(target: Date) {
  const ms = Math.max(0, target.getTime() - Date.now());
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1000);
  return { days, hours, minutes, seconds };
}

/**
 * Live countdown to WEDDING_DATE_ISO.
 *
 * `size="sm"` (default) is the inline four-unit row used in the dashboard
 * header — unchanged. `size="lg"` is the guest letter's countdown band: one
 * serif line of four evenly-weighted units, then `label` finishes the sentence
 * the row starts ("258 days · 1 hr · 42 min · 9 sec" / "until we say I do").
 *
 * The units are deliberately uniform — same size, same colour. Emphasising days
 * by size *and* tone made the line read as four unrelated numbers; hierarchy
 * belongs between the row and the script line, not inside the row.
 *
 * Every number sits in a fixed `ch` slot with tabular figures, so the row does
 * not re-centre itself each second (259 -> 3 -> 12 -> 8 all keep their width).
 * The visual is `aria-hidden` and paired with one sr-only sentence: without a
 * live region a screen reader stays quiet instead of announcing every tick.
 */
export function Countdown({
  className,
  align = "start",
  size = "sm",
  label = "days",
  labelClassName,
  tickClassName,
  srSuffix = "until the wedding",
}: {
  className?: string;
  align?: "start" | "center";
  size?: "sm" | "lg";
  /**
   * Line under the day count (lg only) — the second half of the sentence.
   * Given the current count so the caller can say "day" vs "days"; `undefined`
   * before the first client tick.
   */
  label?: ReactNode | ((days: number | undefined) => ReactNode);
  labelClassName?: string;
  /** Unit names and separators (lg only) — the row's secondary tone. */
  tickClassName?: string;
  /** Read after the day count by screen readers, in place of the visual label. */
  srSuffix?: string;
}) {
  // Start as null so the server-rendered HTML and the first client render
  // both show the placeholder; the live value is only computed after mount.
  const [t, setT] = useState<ReturnType<typeof diff> | null>(null);

  useEffect(() => {
    setT(diff(TARGET_DATE));
    const id = setInterval(() => setT(diff(TARGET_DATE)), 1000);
    return () => clearInterval(id);
  }, []);

  const units = [
    { label: "days", value: t?.days },
    { label: t?.hours === 1 ? "hr" : "hrs", value: t?.hours },
    { label: "min", value: t?.minutes },
    { label: "sec", value: t?.seconds },
  ];

  if (size === "lg") {
    const [days] = units;
    return (
      <div
        className={cn(
          "flex flex-col",
          align === "center" ? "items-center" : "items-start",
          className ?? "text-(--script)",
        )}
      >
        <span className="sr-only">
          {t ? `${t.days} days ${srSuffix}.` : "Counting down."}
        </span>
        {/* One serif line, four units, all the same size and tone. Fixed `ch`
            slots keep the line from re-centring itself every second; only the
            days slot is wider because it carries three digits. */}
        <span
          aria-hidden
          className="flex items-baseline whitespace-nowrap font-sans"
        >
          {units.map((u, i) => (
            <span key={u.label} className="flex items-baseline">
              {i > 0 ? (
                <span
                  className={cn(
                    "mx-2 text-base opacity-50 sm:mx-3",
                    tickClassName,
                  )}
                >
                  ·
                </span>
              ) : null}
              <span
                className={cn(
                  "text-center text-[2rem] leading-none tabular-nums sm:text-[2.75rem]",
                  i === 0 ? "min-w-[3ch]" : "min-w-[2ch]",
                )}
              >
                {u.value ?? "–"}
              </span>
              <span
                className={cn(
                  "ml-1 font-sans text-[14px] tracking-[0.12em] sm:text-xs",
                  tickClassName,
                )}
              >
                {u.label}
              </span>
            </span>
          ))}
        </span>
        <span aria-hidden className={cn("mt-5", labelClassName)}>
          {typeof label === "function" ? label(days.value) : label}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mt-2 flex items-baseline gap-3 font-sans",
        align === "center" && "justify-center",
        className ?? "text-(--script)",
      )}
    >
      {units.map((u) => (
        <div key={u.label} className="flex items-baseline gap-1">
          <span className="font-weight-bold leading-none tabular-nums sm:text-sm">
            {u.value ?? "–"}
          </span>
          <span className="text-xs leading-none opacity-80">{u.label}</span>
        </div>
      ))}
    </div>
  );
}
