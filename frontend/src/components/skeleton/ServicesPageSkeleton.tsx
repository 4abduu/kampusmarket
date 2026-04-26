"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

interface ServicesPageSkeletonProps {
  itemCount?: number;
  hideSidebar?: boolean;
}

export default function ServicesPageSkeleton({
  itemCount = 9,
  hideSidebar = false,
}: ServicesPageSkeletonProps) {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-purple-50 dark:bg-purple-950/20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Sidebar */}
          {!hideSidebar && (
            <aside className="hidden lg:block w-72 shrink-0">
              <div className="space-y-4">
                <Skeleton className="h-8 w-32 bg-purple-100 dark:bg-purple-900/20" />
                <Skeleton className="h-6 w-full bg-purple-100 dark:bg-purple-900/20" />
                <Skeleton className="h-6 w-full bg-purple-100 dark:bg-purple-900/20" />
                <Skeleton className="h-6 w-full bg-purple-100 dark:bg-purple-900/20" />
                <Skeleton className="h-10 w-full mt-4 bg-purple-100 dark:bg-purple-900/20" />
              </div>
            </aside>
          )}

          {/* Main Content */}
          <main className="flex-1">
            {/* Services Grid - 3 columns for services */}
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
              {Array.from({ length: itemCount }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="relative bg-purple-100 dark:bg-purple-900/20 h-40 flex items-center justify-center">
                  </div>
                  <CardContent className="p-4">
                    <Skeleton className="h-5 w-24 mb-2 bg-purple-100 dark:bg-purple-900/20" />
                    <Skeleton className="h-5 w-full mb-2 bg-purple-100 dark:bg-purple-900/20" />
                    <Skeleton className="h-4 w-full mb-1 bg-purple-100 dark:bg-purple-900/20" />
                    <Skeleton className="h-4 w-3/4 mb-3 bg-purple-100 dark:bg-purple-900/20" />
                    <div className="flex items-center gap-1 mb-3">
                      <Skeleton className="h-4 w-4 bg-purple-100 dark:bg-purple-900/20" />
                      <Skeleton className="h-4 w-12 bg-purple-100 dark:bg-purple-900/20" />
                      <Skeleton className="h-4 w-20 bg-purple-100 dark:bg-purple-900/20" />
                    </div>
                    <Skeleton className="h-6 w-48 mb-3 bg-purple-100 dark:bg-purple-900/20" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-6 rounded-full bg-purple-100 dark:bg-purple-900/20" />
                      <Skeleton className="h-4 w-16 bg-purple-100 dark:bg-purple-900/20" />
                      <Skeleton className="h-3 w-3 ml-auto bg-purple-100 dark:bg-purple-900/20" />
                      <Skeleton className="h-4 w-20 bg-purple-100 dark:bg-purple-900/20" />
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
