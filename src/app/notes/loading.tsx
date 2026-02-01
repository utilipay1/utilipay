import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Skeleton className="h-12 w-48 mb-2" />
          <Skeleton className="h-6 w-64" />
        </div>
        <div className="h-12 w-32 rounded-2xl bg-muted/20 animate-pulse" />
      </div>

      <Skeleton className="h-12 w-full max-w-md rounded-2xl" />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-[250px] rounded-[2.5rem]" />
        ))}
      </div>
    </div>
  );
}
