"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

interface LandingProductsSectionSkeletonProps {
  itemCount?: number;
}

export default function LandingProductsSectionSkeleton({ itemCount = 8 }: LandingProductsSectionSkeletonProps) {
  return (
    <section className="py-16 bg-slate-50 dark:bg-slate-800/50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Skeleton className="h-9 w-48 mb-2" />
            <Skeleton className="h-5 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: itemCount }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="relative bg-muted h-48 flex items-center justify-center">
                <Skeleton className="w-full h-full" />
              </div>
              <CardContent className="p-4">
                <p className="font-medium line-clamp-2 mb-2">
                  <Skeleton className="h-5 w-full" />
                </p>
                <div className="flex items-center gap-1 mb-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="flex items-center gap-1">
                    <Skeleton className="h-3 w-3" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
                <Skeleton className="h-6 w-20 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
