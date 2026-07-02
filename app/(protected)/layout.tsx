import type { ReactNode } from "react";

import {
  PageFloralBottomRight,
  PageFloralTopLeft,
} from "@/components/dashboard-florals";

/**
 * Sidebar-less admin shell (imported single-page design): a full-width, centered
 * container on the wisteria gradient background. The page-corner floral sprays
 * live in their own `overflow-hidden` layer so their bleed is clipped WITHOUT
 * clipping page chrome — the content wrapper stays overflow-visible so small
 * decorative flourishes (e.g. the account-chip sprigs) aren't cut at the edges.
 * Global horizontal scroll is guarded on `<body>` (see `app/layout.tsx`).
 */
export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex-1">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <PageFloralTopLeft />
        <PageFloralBottomRight />
      </div>
      <div className="relative mx-auto w-full max-w-[1300px] px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
        {children}
      </div>
    </div>
  );
}
