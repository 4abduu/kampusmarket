import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminAddressesTabSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48 rounded" />
              <Skeleton className="h-4 w-72 rounded" />
            </div>
            <Skeleton className="h-5 w-24 rounded" />
          </div>
          <Skeleton className="h-10 w-full max-w-md rounded-md" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="border border-gray-100 dark:border-gray-800/80 rounded-xl p-3 bg-background shadow-sm space-y-2.5"
          >
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-gray-100 dark:border-gray-800/50">
              <div className="flex items-center gap-2">
                <Skeleton className="h-7 w-7 rounded-full" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-3 w-28 rounded" />
                  <Skeleton className="h-2.5 w-40 rounded" />
                </div>
              </div>
              <Skeleton className="h-4.5 w-16 rounded-full" />
            </div>

            <div className="flex gap-3 overflow-hidden pb-1 flex-nowrap">
              {Array.from({ length: 2 }).map((_, j) => (
                <div
                  key={j}
                  className="w-[calc(50%-6px)] flex-1 min-w-[520px] max-w-full flex-shrink-0 border border-gray-200 dark:border-gray-800/80 rounded-xl p-3 space-y-2 bg-muted/30 flex flex-col gap-1.5"
                >
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6.5 w-6.5 rounded" />
                    <Skeleton className="h-3.5 w-16 rounded" />
                  </div>
                  <div className="space-y-1 mt-1">
                    <Skeleton className="h-3 w-24 rounded" />
                    <Skeleton className="h-2.5 w-16 rounded" />
                  </div>
                  <Skeleton className="h-2.5 w-full rounded mt-1" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
