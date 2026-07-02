import type { ReactNode } from "react";

import {
  PageFloralBottomRight,
  PageFloralTopLeft,
} from "@/components/dashboard-florals";

/**
 * Sidebar-less admin shell (imported single-page design): a full-width, centered
 * container on the wisteria gradient background. Corner floral sprays bleed off
 * the full-bleed wrapper (clipped by `overflow-hidden`); page-level chrome (the
 * account menu, actions) lives inside each page's header.
 */
export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex-1 overflow-hidden">
      <PageFloralTopLeft />
      <PageFloralBottomRight />
      <div className="relative mx-auto w-full max-w-[1300px] px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
        {children}
      </div>
    </div>
  );
}
