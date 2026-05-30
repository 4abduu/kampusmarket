import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminCancelRequestsTabSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <CardTitle><Skeleton className="h-5 w-48" /></CardTitle>
              <CardDescription><Skeleton className="h-3.5 w-72" /></CardDescription>
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="border border-slate-100 dark:border-slate-800/80 rounded-xl p-5 bg-white dark:bg-slate-900/10"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              
              {/* Left side Metadata & Text representation */}
              <div className="flex items-start gap-4 flex-1 min-w-0">
                {/* Circle Icon Placeholder - Amber themed to match XCircle style */}
                <div className="w-10 h-10 rounded-full bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100/10 shrink-0 flex items-center justify-center">
                  <Skeleton className="h-5 w-5 rounded-full bg-amber-200 dark:bg-amber-800" />
                </div>
                
                <div className="flex-1 min-w-0 space-y-2.5">
                  {/* Title & Badge - themed to match pending status */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Skeleton className="h-4 w-28 font-semibold" />
                    <Skeleton className="h-5 w-16 rounded-full bg-amber-100/60 dark:bg-amber-900/30" />
                  </div>
                  
                  {/* Description Paragraph */}
                  <div className="space-y-1">
                    <Skeleton className="h-3.5 w-3/4" />
                    <Skeleton className="h-3.5 w-1/2" />
                  </div>
                  
                  {/* Spacing & Metadata Info (Pemohon, Order UUID, Tanggal) */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-36" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </div>

              {/* Pricing and Actions layout alignment */}
              <div className="flex items-center gap-2 sm:flex-col sm:items-end justify-between sm:justify-start pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800/80 shrink-0">
                <div className="text-right space-y-1">
                  <Skeleton className="h-2.5 w-20 block sm:ml-auto" />
                  <Skeleton className="h-4 w-24 font-bold block sm:ml-auto" />
                </div>

                <div className="flex gap-1 sm:mt-2">
                  <Skeleton className="h-8 w-16 rounded" /> {/* Tolak Button */}
                  <Skeleton className="h-8 w-20 rounded" /> {/* Setujui Button */}
                </div>
              </div>

            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
