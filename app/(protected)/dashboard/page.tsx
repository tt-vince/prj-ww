import Link from 'next/link';
import { requireUser } from '@/lib/dal';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Signed in as {user.name ?? user.email} · {user.role}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/dashboard/rsvps">
          <Card className="h-full transition-colors hover:bg-muted/50">
            <CardHeader>
              <CardTitle>RSVPs</CardTitle>
              <CardDescription>View guest responses.</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        {user.role === 'superadmin' && (
          <Link href="/dashboard/users">
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardHeader>
                <CardTitle>Users</CardTitle>
                <CardDescription>Approve and manage admin accounts.</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        )}
      </div>
    </div>
  );
}
