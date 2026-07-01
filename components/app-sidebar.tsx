"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  Heart,
  LayoutDashboard,
  LogOut,
  Users,
  type LucideIcon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

type SidebarUser = {
  name: string | null;
  email: string;
  role: string;
  picture: string | null;
};

type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
  superadmin?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { title: "Guests", href: "/dashboard/guests", icon: ClipboardList },
  { title: "Users", href: "/dashboard/users", icon: Users, superadmin: true },
];

function initials(name: string | null, email: string) {
  const source = name?.trim() || email;
  const parts = source.split(/\s+/).filter(Boolean);
  const letters =
    parts.length >= 2 ? parts[0][0] + parts[1][0] : source.slice(0, 2);
  return letters.toUpperCase();
}

export function AppSidebar({ user }: { user: SidebarUser }) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-1 py-1.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Heart className="size-4" />
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="font-serif text-base font-medium">Wedding RSVP</span>
            <span className="text-xs text-muted-foreground">Admin console</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Manage</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.filter(
                (item) => !item.superadmin || user.role === "superadmin",
              ).map((item) => {
                const active = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={active}
                      tooltip={item.title}
                      render={<Link href={item.href} />}
                    >
                      <Icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-2 rounded-md p-1.5 group-data-[collapsible=icon]:p-0">
          <Avatar className="size-8 rounded-lg">
            {user.picture ? (
              <AvatarImage src={user.picture} alt={user.name ?? user.email} />
            ) : null}
            <AvatarFallback className="rounded-lg text-xs">
              {initials(user.name, user.email)}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-medium">
              {user.name ?? "Admin"}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {user.email}
            </span>
          </div>
          <form
            action="/api/auth/logout"
            method="post"
            className="group-data-[collapsible=icon]:hidden"
          >
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground"
              aria-label="Sign out"
            >
              <LogOut />
            </Button>
          </form>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
