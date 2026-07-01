import type { ReactNode } from "react";
import { getCurrentUser } from "@/lib/dal";
import { AccountMenu } from "@/components/account-menu";

/**
 * Sidebar-less admin shell (per the imported single-page design): a full-width,
 * centered container on the wisteria background. Navigation/logout live in a
 * compact account menu in the top-right so the RSVP page reads as one clean page.
 */
export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="flex-1 bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        {user ? (
          <div className="mb-4 flex items-center justify-end">
            <AccountMenu
              user={{
                name: user.name,
                email: user.email,
                role: user.role,
                picture: user.picture,
              }}
            />
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}
