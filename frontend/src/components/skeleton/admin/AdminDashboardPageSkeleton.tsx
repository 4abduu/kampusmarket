import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";

export default function AdminDashboardPageSkeleton() {
  const tabs = [
    "Overview",
    "Users",
    "Products",
    "Categories",
    "Faculties",
    "Orders",
    "Finance",
    "Addresses",
    "Cancel Requests",
    "Reports",
  ];

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Success Message */}
        <Skeleton className="h-12 w-full rounded-lg" />

        {/* Tabs */}
        <Card>
          <CardContent className="pt-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid grid-cols-5 lg:grid-cols-10 w-full mb-6">
                {tabs.map((tab) => (
                  <Skeleton key={tab} className="h-10 w-full rounded" />
                ))}
              </TabsList>

              {tabs.map((tab) => (
                <TabsContent key={tab} value={tab.toLowerCase().replace(" ", "-")}>
                  {/* Generic Tab Skeleton */}
                  <div className="space-y-4">
                    {/* Filter Bar */}
                    <Card>
                      <CardContent className="pt-4 pb-4">
                        <div className="flex flex-wrap gap-3 items-center">
                          <Skeleton className="h-10 w-64" />
                          <Skeleton className="h-10 w-32" />
                          <Skeleton className="h-10 w-32" />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Content */}
                    <Card>
                      <CardContent className="pt-6 pb-6">
                        <div className="space-y-3">
                          {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-4">
                              <Skeleton className="h-10 w-10 rounded" />
                              <Skeleton className="h-4 flex-1" />
                              <Skeleton className="h-6 w-16" />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Pagination */}
                    <div className="flex justify-center gap-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 w-10 rounded" />
                      ))}
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
