import Link from 'next/link';
import { count, eq, sum } from 'drizzle-orm';
import { ArrowRight, ClipboardList, Clock, Heart, UserCheck, UserPlus, Users } from 'lucide-react';
import { requireUser } from '@/lib/dal';
import { db } from '@/db';
import { guests, users } from '@/db/schema';
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default async function DashboardPage() {
  const user = await requireUser();
  const isSuperadmin = user.role === 'superadmin';

  const [invitedRes, goingRes, expectedRes, awaitingRes] = await Promise.all([
    db.select({ v: count() }).from(guests),
    db.select({ v: count() }).from(guests).where(eq(guests.status, 'going')),
    db.select({ v: sum(guests.partySize) }).from(guests).where(eq(guests.status, 'going')),
    db.select({ v: count() }).from(guests).where(eq(guests.status, 'pending')),
  ]);

  let pendingUsers = 0;
  if (isSuperadmin) {
    const [p] = await db.select({ v: count() }).from(users).where(eq(users.status, 'pending'));
    pendingUsers = Number(p?.v ?? 0);
  }

  const invited = invitedRes[0]?.v ?? 0;
  const going = goingRes[0]?.v ?? 0;
  const expectedGuests = Number(expectedRes[0]?.v ?? 0);
  const awaiting = awaitingRes[0]?.v ?? 0;

  const stats = [
    { label: 'Invited', value: invited, icon: Users },
    { label: 'Going', value: going, icon: Heart },
    { label: 'Expected guests', value: expectedGuests, icon: UserCheck },
    { label: 'Awaiting reply', value: awaiting, icon: Clock },
    ...(isSuperadmin
      ? [{ label: 'Pending approvals', value: pendingUsers, icon: UserPlus }]
      : []),
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back, {user.name ?? user.email} ·{' '}
          <span className="capitalize">{user.role}</span>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader>
                <CardDescription>{stat.label}</CardDescription>
                <CardTitle className="text-3xl tabular-nums">{stat.value}</CardTitle>
                <CardAction>
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                </CardAction>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">Manage</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/dashboard/guests" className="group block">
            <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-primary/30">
              <CardHeader>
                <div className="mb-1 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ClipboardList className="size-5" />
                </div>
                <CardTitle>Guests</CardTitle>
                <CardDescription>Add invitees and share their RSVP links.</CardDescription>
                <CardAction>
                  <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </CardAction>
              </CardHeader>
            </Card>
          </Link>
          {isSuperadmin && (
            <Link href="/dashboard/users" className="group block">
              <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-primary/30">
                <CardHeader>
                  <div className="mb-1 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Users className="size-5" />
                  </div>
                  <CardTitle>Users</CardTitle>
                  <CardDescription>Approve and manage admin accounts.</CardDescription>
                  <CardAction>
                    <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </CardAction>
                </CardHeader>
              </Card>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
