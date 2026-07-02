import { Skeleton } from '@/components/ui/skeleton';

export default function LoginLoading() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        <Skeleton className="h-56 w-full rounded-xl" />
        <Skeleton className="h-4 w-48" />
      </div>
    </main>
  );
}
