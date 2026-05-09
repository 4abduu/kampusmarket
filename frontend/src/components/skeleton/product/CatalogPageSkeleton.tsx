"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

interface CatalogPageSkeletonProps {
  itemCount?: number;
  hideSidebar?: boolean;
}

export default function CatalogPageSkeleton({ itemCount = 8, hideSidebar = false }: CatalogPageSkeletonProps) {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4 py-8">

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Sidebar */}
          {!hideSidebar && (
            <aside className="hidden lg:block w-72 shrink-0">
              <div className="space-y-4">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-10 w-full mt-4" />
              </div>
            </aside>
          )}

          {/* Main Content */}
          <main className="flex-1">

            {/* Products Grid */}
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
              {Array.from({ length: itemCount }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="relative bg-muted h-48 flex items-center justify-center overflow-hidden">
                    <Skeleton className="w-full h-full" />
                  </div>
                  <CardContent className="p-4">
                    <Skeleton className="h-5 w-full mb-2" />
                    <div className="flex items-center gap-1 mb-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-5 rounded-full" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <div className="flex items-center gap-1">
                        <Skeleton className="h-3 w-3" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 mt-8">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-10 w-10" />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
