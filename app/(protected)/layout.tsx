import type { ReactNode } from "react";
import { getCurrentUser } from "@/lib/dal";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <SidebarProvider>
      {user ? (
        <AppSidebar
          user={{
            name: user.name,
            email: user.email,
            role: user.role,
            picture: user.picture,
          }}
        />
      ) : null}
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur-sm">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-1 h-5 self-center" />
          <span className="font-serif text-sm font-medium tracking-tight">
            Wedding RSVP
          </span>
        </header>
        <div className="flex flex-1 flex-col p-4 sm:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
