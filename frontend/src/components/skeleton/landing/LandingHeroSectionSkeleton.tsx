"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function LandingHeroSectionSkeleton() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-4/5" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <div className="flex flex-wrap gap-4 pt-4">
              <Skeleton className="h-12 w-32" />
              <Skeleton className="h-12 w-32" />
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 pt-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded" />
                  <div>
                    <Skeleton className="h-5 w-16 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Featured Products */}
          <div className="relative hidden lg:block">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-3xl blur-3xl" />
            <div className="relative grid grid-cols-2 gap-4">
              {/* First card - col-span-2 */}
              <Card className="overflow-hidden col-span-2">
                <div className="h-48 bg-muted">
                  <Skeleton className="w-full h-full" />
                </div>
                <div className="p-3 space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-5 w-1/2" />
                </div>
              </Card>

              {/* Second card */}
              <Card className="overflow-hidden">
                <div className="h-32 bg-muted">
                  <Skeleton className="w-full h-full" />
                </div>
                <div className="p-3 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-5 w-2/3" />
                </div>
              </Card>

              {/* Third card */}
              <Card className="overflow-hidden">
                <div className="h-32 bg-muted">
                  <Skeleton className="w-full h-full" />
                </div>
                <div className="p-3 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-5 w-2/3" />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
