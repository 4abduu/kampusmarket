import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminOrdersTabSkeleton() {
  return (
    <Card className="border-slate-100 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Skeleton className="h-6 w-56 mb-2" />
              <Skeleton className="h-3 w-72" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-9 flex-1 min-w-[200px] max-w-md rounded-md" />
            <Skeleton className="h-9 w-[120px] rounded-md" />
            <Skeleton className="h-9 w-[80px] rounded-md" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between pb-4 border-b">
            <Skeleton className="h-4 w-[8%]" />
            <Skeleton className="h-4 w-[20%]" />
            <Skeleton className="h-4 w-[10%]" />
            <Skeleton className="h-4 w-[12%]" />
            <Skeleton className="h-4 w-[12%]" />
            <Skeleton className="h-4 w-[10%]" />
            <Skeleton className="h-4 w-[10%]" />
            <Skeleton className="h-4 w-[10%]" />
            <Skeleton className="h-4 w-[8%]" />
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b last:border-0">
              <div className="w-[8%] space-y-1">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-10" />
              </div>
              <div className="w-[20%] flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-md shrink-0" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-12 rounded-full" />
                </div>
              </div>
              <div className="w-[10%]"><Skeleton className="h-4 w-16 rounded-full" /></div>
              <div className="w-[12%] flex items-center gap-2">
                <Skeleton className="h-7 w-7 rounded-full shrink-0" />
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="w-[12%] flex items-center gap-2">
                <Skeleton className="h-7 w-7 rounded-full shrink-0" />
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="w-[10%] space-y-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-2 w-12" />
              </div>
              <div className="w-[10%]"><Skeleton className="h-5 w-20 rounded-full" /></div>
              <div className="w-[10%]"><Skeleton className="h-5 w-16 rounded-full" /></div>
              <div className="w-[8%]"><Skeleton className="h-4 w-16" /></div>
            </div>
          ))}
        </div>
        <div className="flex justify-center items-center gap-2 mt-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-9 rounded-md" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
