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

      {/* Board toolbar */}
      <div className="flex flex-wrap items-center gap-4">
        <Skeleton className="hidden h-4 w-72 md:block" />
        <Skeleton className="h-5 w-28 rounded-full" />
        <div className="flex-1" />
        <Skeleton className="h-9 w-56" />
      </div>

      {/* Mobile status tabs */}
      <div className="grid grid-cols-3 gap-2 md:hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[62px] rounded-xl" />
        ))}
      </div>
      <div className="flex flex-col gap-3 md:hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-[13px]" />
        ))}
      </div>

      {/* Kanban columns */}
      <div className="hidden gap-5 md:grid md:grid-cols-3 lg:gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="gap-0 rounded-2xl border-dashed p-4">
            <div className="flex items-center gap-2.5 px-1">
              <Skeleton className="size-2.5 rounded-full" />
              <Skeleton className="h-5 w-28" />
            </div>
            <Skeleton className="mx-1 mt-2 mb-3 h-0.5 w-full" />
            <Skeleton className="mb-4 h-7 w-36" />
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-28 w-full rounded-[13px]" />
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
