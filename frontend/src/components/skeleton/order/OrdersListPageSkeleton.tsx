"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function OrdersListPageSkeleton() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Skeleton className="h-8 w-40 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>

        {/* Filters/Tabs */}
        <div className="flex gap-4 mb-6 border-b overflow-x-auto pb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-24 rounded shrink-0" />
          ))}
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Image */}
                  <Skeleton className="h-20 w-20 rounded-lg shrink-0" />

                  {/* Order Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-20 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-64" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-6 rounded-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>

                  {/* Price & Actions */}
                  <div className="text-right space-y-3">
                    <Skeleton className="h-6 w-32 ml-auto" />
                    <div className="flex gap-2 justify-end">
                      <Skeleton className="h-8 w-24 rounded" />
                      <Skeleton className="h-8 w-24 rounded" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center gap-2 mt-8">
          <Skeleton className="h-8 w-8 rounded" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-8 rounded" />
          ))}
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>
    </div>
  );
}
