import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const COLUMNS = ['Name', 'Email', 'Status', 'Guests', 'Note', 'Submitted'];
const CELL_WIDTHS = ['w-28', 'w-40', 'w-16', 'w-8', 'w-32', 'w-20'];

export default function RsvpsLoading() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-8 w-28" />
      <Table>
        <TableHeader>
          <TableRow>
            {COLUMNS.map((column) => (
              <TableHead key={column}>{column}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 6 }).map((_, row) => (
            <TableRow key={row}>
              {CELL_WIDTHS.map((width, col) => (
                <TableCell key={col}>
                  {col === 2 ? (
                    <Skeleton className="h-5 w-16 rounded-md" />
                  ) : (
                    <Skeleton className={`h-4 ${width}`} />
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
