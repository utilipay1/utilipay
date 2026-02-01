import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-36" />
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Skeleton className="h-8 w-[250px]" />
          <Skeleton className="h-8 w-24" />
        </div>
        
        <div className="rounded-xl border shadow-sm overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between px-6 py-4 border-b">
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <div className="flex gap-2">
                   <Skeleton className="h-4 w-16" />
                   <Skeleton className="h-4 w-16" />
                </div>
              </div>
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
