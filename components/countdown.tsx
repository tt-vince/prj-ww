"use client";

import { useEffect, useState } from "react";
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
 * Live countdown to WEDDING_DATE_ISO. Used in the dashboard header (default
 * script-accent styling) and the homepage hero (centered, light `className`
 * override for the dark lily photo).
 */
export function Countdown({
  className,
  align = "start",
}: {
  className?: string;
  align?: "start" | "center";
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
    { label: "hrs", value: t?.hours },
    { label: "min", value: t?.minutes },
    { label: "sec", value: t?.seconds },
  ];

  return (
    <div
      className={cn(
        "mt-2 flex items-baseline gap-3 font-countdown",
        align === "center" && "justify-center",
        className ?? "text-(--script)",
      )}
    >
      {units.map((u) => (
        <div key={u.label} className="flex items-baseline gap-1">
          <span className="font-weight-bold leading-none tabular-nums sm:text-sm">
            {u.value ?? "–"}
          </span>
          <span className="text-xs leading-none opacity-80">
            {u.label}
          </span>
        </div>
      ))}
    </div>
  );
}
