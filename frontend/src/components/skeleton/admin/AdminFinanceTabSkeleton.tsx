import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminFinanceTabSkeleton() {
  return (
    <div className="space-y-6">
      {/* 4 Cards Finance Statistics Row */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
              <Skeleton className="h-8 w-32 mb-1" />
              <Skeleton className="h-3 w-40 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Subtab Selector */}
      <div className="flex gap-2 border-b pb-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-32 rounded-md" />
        ))}
      </div>

      {/* Main Table Content */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <Skeleton className="h-6 w-56 mb-2" />
                <Skeleton className="h-4 w-72" />
              </div>
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-9 flex-1 min-w-[200px] max-w-md" />
              <Skeleton className="h-9 w-[130px]" />
              <Skeleton className="h-9 w-[90px]" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-8 gap-4 pb-4 border-b">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-16" />
              ))}
            </div>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="grid grid-cols-8 gap-4 py-3 border-b last:border-0 items-center">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <div className="flex justify-end"><Skeleton className="h-8 w-16" /></div>
              </div>
            ))}
          </div>
          <div className="flex justify-center items-center gap-2 mt-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-9 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
