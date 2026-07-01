"use client";

import Link from "next/link";
import { LogOut, ShieldCheck } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type AccountUser = {
  name: string | null;
  email: string;
  role: string;
  picture: string | null;
};

function initials(name: string | null, email: string) {
  const source = name?.trim() || email;
  const parts = source.split(/\s+/).filter(Boolean);
  const letters =
    parts.length >= 2 ? parts[0][0] + parts[1][0] : source.slice(0, 2);
  return letters.toUpperCase();
}

/**
 * Compact account control for the header now that the sidebar is gone — avatar
 * dropdown with the superadmin Users link and sign-out. The logout form lives
 * outside the menu so its submit button (a menu item) can target it by id.
 */
export function AccountMenu({ user }: { user: AccountUser }) {
  return (
    <>
      <form id="logout-form" action="/api/auth/logout" method="post" className="hidden" />
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              className="size-9 rounded-full p-0"
              aria-label="Account menu"
            >
              <Avatar className="size-9">
                {user.picture ? (
                  <AvatarImage src={user.picture} alt={user.name ?? user.email} />
                ) : null}
                <AvatarFallback className="text-xs">
                  {initials(user.name, user.email)}
                </AvatarFallback>
              </Avatar>
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex flex-col gap-0.5">
            <span className="truncate text-sm font-medium text-foreground">
              {user.name ?? "Admin"}
            </span>
            <span className="truncate text-xs font-normal text-muted-foreground">
              {user.email}
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {user.role === "superadmin" ? (
              <DropdownMenuItem render={<Link href="/dashboard/users" />}>
                <ShieldCheck />
                Manage users
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem
              variant="destructive"
              render={<button type="submit" form="logout-form" />}
            >
              <LogOut />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
