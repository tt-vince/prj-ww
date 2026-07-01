import { Card, CardAction, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-9 w-44" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-1 h-8 w-14" />
              <CardAction>
                <Skeleton className="size-9 rounded-lg" />
              </CardAction>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-16" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="mb-1 size-10 rounded-xl" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-44" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
