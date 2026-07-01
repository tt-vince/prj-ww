import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-11 w-56" />
          <Skeleton className="h-3 w-44" />
        </div>
        <div className="flex flex-col items-end gap-3.5">
          <Skeleton className="h-11 w-48 rounded-full" />
          <div className="flex gap-2.5">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-28" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="gap-0 rounded-[18px] p-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="size-2.5 rounded-full" />
            </div>
            <Skeleton className="mt-3.5 h-11 w-16" />
            <Skeleton className="mt-2 h-3 w-24" />
            <Skeleton className="mt-4 h-1.5 w-full" />
          </Card>
        ))}
      </div>

      {/* Guest list */}
      <Card className="gap-0 overflow-hidden rounded-[18px] py-0">
        <div className="flex flex-wrap items-center gap-4 px-6 pt-5 pb-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-5 w-14 rounded-full" />
          <div className="flex-1" />
          <Skeleton className="h-9 w-56" />
        </div>
        <div className="flex flex-col gap-3 border-t p-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </Card>
    </div>
  );
}
