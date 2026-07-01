import type { ReactNode } from "react";

/**
 * Sidebar-less admin shell (imported single-page design): a full-width, centered
 * container on the wisteria gradient background. Page-level chrome (the account
 * menu, actions) lives inside each page's header.
 */
export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1">
      <div className="mx-auto w-full max-w-[1300px] px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
        {children}
      </div>
    </div>
  );
}
