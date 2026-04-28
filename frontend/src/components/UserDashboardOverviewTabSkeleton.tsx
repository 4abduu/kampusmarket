import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function UserDashboardOverviewTabSkeleton() {
  return (
    <>
      {/* 1. Wallet Balance Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-48 mt-1" />
              <Skeleton className="h-3 w-40 mt-2" />
            </div>
            <Skeleton className="h-14 w-14 rounded-full flex-shrink-0" />
          </div>
        </CardContent>
      </Card>

      {/* 2. 4 Stat Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-8 w-8 rounded-lg flex-shrink-0" />
              </div>
              <Skeleton className="h-8 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 3. Net Income Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-9 w-44 mt-1" />
              <Skeleton className="h-3 w-52 mt-1" />
            </div>
            <div className="flex-shrink-0 ml-6">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-24 mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Quick Actions Card */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-28" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 5. Recent Products & Services Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle>
            <Skeleton className="h-6 w-44" />
          </CardTitle>
          <Skeleton className="h-8 w-24 rounded-md flex-shrink-0" />
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-lg border overflow-hidden">
                <Skeleton className="h-32 w-full rounded-t-lg" />
                <div className="p-3 space-y-1">
                  <Skeleton className="h-5 w-12 rounded-full" />
                  <Skeleton className="h-4 w-32 mt-1" />
                  <Skeleton className="h-4 w-20 mt-1" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
