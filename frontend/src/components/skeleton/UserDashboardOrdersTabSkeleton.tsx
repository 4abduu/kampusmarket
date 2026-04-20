"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface OrdersTabSkeletonProps {
  itemCount?: number;
}

export default function UserDashboardOrdersTabSkeleton({ itemCount = 3 }: OrdersTabSkeletonProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-32" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="selling">
          <TabsList className="mb-4">
            <TabsTrigger value="selling">
              <Skeleton className="h-4 w-24" />
            </TabsTrigger>
            <TabsTrigger value="buying">
              <Skeleton className="h-4 w-24" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="selling">
            <div className="space-y-4">
              {Array.from({ length: itemCount }).map((_, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-16 w-16 rounded" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg mb-3">
                    <div className="grid grid-cols-2 gap-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Skeleton className="h-9 w-20" />
                      <Skeleton className="h-9 w-20" />
                    </div>
                    <Skeleton className="h-9 w-32" />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="buying">
            <div className="space-y-4">
              {Array.from({ length: itemCount }).map((_, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-16 w-16 rounded" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg mb-3">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Skeleton className="h-9 w-20" />
                      <Skeleton className="h-9 w-20" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
