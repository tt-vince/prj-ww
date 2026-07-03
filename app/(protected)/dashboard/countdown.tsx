"use client";

import { useEffect, useState } from "react";

// TODO: exact wedding day not decided yet — using April 1, 2026 as placeholder.
// Update TARGET_DATE once the real date is confirmed.
const TARGET_DATE = new Date("2026-04-01T00:00:00");

function diff(target: Date) {
  const ms = Math.max(0, target.getTime() - Date.now());
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1000);
  return { days, hours, minutes, seconds };
}

export function Countdown() {
  const [t, setT] = useState(() => diff(TARGET_DATE));

  useEffect(() => {
    const id = setInterval(() => setT(diff(TARGET_DATE)), 1000);
    return () => clearInterval(id);
  }, []);

  const units = [
    { label: "days", value: t.days },
    { label: "hrs", value: t.hours },
    { label: "min", value: t.minutes },
    { label: "sec", value: t.seconds },
  ];

  return (
    <div className="mt-2 flex items-baseline gap-3 font-script text-(--script)">
      {units.map((u) => (
        <div key={u.label} className="flex items-baseline gap-1">
          <span className="text-[28px] leading-none tabular-nums sm:text-[34px]">
            {u.value}
          </span>
          <span className="text-[13px] leading-none opacity-80 sm:text-[15px]">
            {u.label}
          </span>
        </div>
      ))}
    </div>
  );
}
