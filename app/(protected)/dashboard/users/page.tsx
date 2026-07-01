import { asc } from 'drizzle-orm';
import { requireSuperadmin } from '@/lib/dal';
import { db } from '@/db';
import { users } from '@/db/schema';
import { activateUser, deactivateUser } from './actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive'> = {
  active: 'default',
  pending: 'secondary',
  disabled: 'destructive',
};
const ROLE_VARIANT: Record<string, 'default' | 'outline'> = {
  superadmin: 'default',
  admin: 'outline',
};

export default async function UsersPage() {
  const current = await requireSuperadmin();
  const rows = await db.select().from(users).orderBy(asc(users.createdAt));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="font-serif text-2xl font-semibold tracking-tight">Users</h1>
        <p className="text-sm text-muted-foreground">
          Approve pending admins so they can sign in. You cannot change your own account.
        </p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((u) => {
            const locked = u.id === current.id || u.role === 'superadmin';
            return (
              <TableRow key={u.id}>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.name ?? '—'}</TableCell>
                <TableCell>
                  <Badge variant={ROLE_VARIANT[u.role]}>{u.role}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[u.status]}>{u.status}</Badge>
                </TableCell>
                <TableCell>
                  {locked ? (
                    <span className="text-sm text-muted-foreground">—</span>
                  ) : u.status === 'active' ? (
                    <form action={deactivateUser}>
                      <input type="hidden" name="userId" value={u.id} />
                      <Button type="submit" variant="outline" size="sm">
                        Deactivate
                      </Button>
                    </form>
                  ) : (
                    <form action={activateUser}>
                      <input type="hidden" name="userId" value={u.id} />
                      <Button type="submit" size="sm">
                        Activate
                      </Button>
                    </form>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
