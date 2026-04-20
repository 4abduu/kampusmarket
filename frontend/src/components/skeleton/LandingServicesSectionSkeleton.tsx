"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

interface LandingServicesSectionSkeletonProps {
  itemCount?: number;
}

export default function LandingServicesSectionSkeleton({ itemCount = 3 }: LandingServicesSectionSkeletonProps) {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Skeleton className="h-9 w-48 mb-2" />
            <Skeleton className="h-5 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {Array.from({ length: itemCount }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="relative bg-emerald-50 dark:bg-emerald-900/20 h-40 flex items-center justify-center">
                <Skeleton className="w-full h-full" />
              </div>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-24 mb-2" />
                <p className="font-medium line-clamp-2 mb-2">
                  <Skeleton className="h-5 w-full" />
                </p>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-3/4" />
                </p>
                <div className="flex items-center gap-1 mb-3">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-6 w-48" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
