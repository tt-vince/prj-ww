import { desc } from 'drizzle-orm';
import { requireUser } from '@/lib/dal';
import { db } from '@/db';
import { rsvps } from '@/db/schema';
import { Badge } from '@/components/ui/badge';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive'> = {
  attending: 'default',
  maybe: 'secondary',
  not_attending: 'destructive',
};

export default async function RsvpsPage() {
  await requireUser();
  const rows = await db.select().from(rsvps).orderBy(desc(rsvps.createdAt));

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">RSVPs</h1>
      {rows.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No responses yet</EmptyTitle>
            <EmptyDescription>Guest RSVPs will appear here once submitted.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Guests</TableHead>
              <TableHead>Note</TableHead>
              <TableHead>Submitted</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.name}</TableCell>
                <TableCell>{r.email}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[r.status]}>{r.status.replace('_', ' ')}</Badge>
                </TableCell>
                <TableCell>{r.guestCount}</TableCell>
                <TableCell className="max-w-xs truncate">{r.note}</TableCell>
                <TableCell>{r.createdAt.toISOString().slice(0, 10)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
