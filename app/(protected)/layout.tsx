import type { ReactNode } from 'react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/dal';
import { Button } from '@/components/ui/button';

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between gap-4 border-b px-6 py-3">
        <nav className="flex items-center gap-1">
          <Button variant="ghost" size="sm" render={<Link href="/dashboard" />}>
            Dashboard
          </Button>
          <Button variant="ghost" size="sm" render={<Link href="/dashboard/rsvps" />}>
            RSVPs
          </Button>
          {user?.role === 'superadmin' && (
            <Button variant="ghost" size="sm" render={<Link href="/dashboard/users" />}>
              Users
            </Button>
          )}
        </nav>
        <div className="flex items-center gap-3">
          {user && <span className="text-sm text-muted-foreground">{user.email}</span>}
          <form action="/api/auth/logout" method="post">
            <Button type="submit" variant="outline" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
