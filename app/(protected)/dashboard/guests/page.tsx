import { requireUser } from '@/lib/dal';
import { db } from '@/db';
import { labels as labelsTable } from '@/db/schema';
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
import { GuestDialog } from './guest-dialog';
import { LabelsManager } from './labels-manager';
import { DeleteGuestButton } from './delete-guest-button';
import { CopyLinkButton } from './copy-link-button';

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive'> = {
  going: 'default',
  pending: 'secondary',
  not_going: 'destructive',
};
const STATUS_LABEL: Record<string, string> = {
  going: 'Going',
  pending: 'Pending',
  not_going: 'Not going',
};

export default async function GuestsPage() {
  await requireUser();

  const [rows, allLabels] = await Promise.all([
    db.query.guests.findMany({
      with: { guestLabels: { with: { label: true } } },
      orderBy: (g, { desc }) => [desc(g.createdAt)],
    }),
    db.select().from(labelsTable).orderBy(labelsTable.name),
  ]);

  const baseUrl = process.env.APP_URL ?? '';

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="font-serif text-2xl font-semibold tracking-tight">Guests</h1>
          <p className="text-sm text-muted-foreground">
            Add invitees, tag them, and share each one their personal RSVP link.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <LabelsManager labels={allLabels} />
          <GuestDialog mode="create" labels={allLabels} />
        </div>
      </div>

      {rows.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No guests yet</EmptyTitle>
            <EmptyDescription>
              Add your first invitee to generate their RSVP link.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Labels</TableHead>
              <TableHead>Allotment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const guestData = {
                id: row.id,
                name: row.name,
                maxGuests: row.maxGuests,
                email: row.email,
                phone: row.phone,
                adminNote: row.adminNote,
                status: row.status,
                labelIds: row.guestLabels.map((gl) => gl.labelId),
              };
              return (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {row.guestLabels.length === 0 ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        row.guestLabels.map((gl) => (
                          <Badge key={gl.labelId} variant="outline">
                            {gl.label.name}
                          </Badge>
                        ))
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="tabular-nums">{row.maxGuests}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[row.status]}>
                      {STATUS_LABEL[row.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.email ?? row.phone ?? '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <CopyLinkButton token={row.token} baseUrl={baseUrl} />
                      <GuestDialog mode="edit" labels={allLabels} guest={guestData} />
                      <DeleteGuestButton guestId={row.id} name={row.name} />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
