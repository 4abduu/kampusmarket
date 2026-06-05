import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminCategoriesTabSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-40 rounded-md" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-9 flex-1 min-w-[200px] max-w-md rounded-md" />
            <Skeleton className="h-9 w-[120px] rounded-md" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between pb-4 border-b">
            <Skeleton className="h-4 w-[25%]" />
            <Skeleton className="h-4 w-[15%]" />
            <Skeleton className="h-4 w-[35%]" />
            <Skeleton className="h-4 w-[10%]" />
            <Skeleton className="h-4 w-[10%]" />
            <Skeleton className="h-4 w-[5%] text-right" />
          </div>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b last:border-0">
              <div className="w-[25%]"><Skeleton className="h-4 w-32" /></div>
              <div className="w-[15%]"><Skeleton className="h-5 w-16 rounded-full" /></div>
              <div className="w-[35%]"><Skeleton className="h-4 w-48" /></div>
              <div className="w-[10%]"><Skeleton className="h-4 w-8" /></div>
              <div className="w-[10%] flex items-center gap-1.5">
                <Skeleton className="h-2 w-2 rounded-full shrink-0" />
                <Skeleton className="h-3 w-10" />
              </div>
              <div className="w-[5%] flex justify-end gap-1">
                <Skeleton className="h-8 w-8 rounded-md shrink-0" />
                <Skeleton className="h-8 w-8 rounded-md shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
