"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function CategorySectionSkeleton() {
  return (
    <section className="py-8 bg-white dark:bg-slate-900">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-6 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
        </div>

        {/* Categories with scroll buttons */}
        <div className="relative">
          {/* Scroll buttons */}
          <Skeleton className="absolute left-0 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full" />
          <Skeleton className="absolute right-0 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full" />

          {/* Category pills */}
          <div className="px-10 flex gap-2 overflow-hidden">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-24 rounded-full shrink-0" />
            ))}
            {/* Lihat Semua */}
            <Skeleton className="h-9 w-28 rounded-full shrink-0" />
          </div>
        </div>
      </div>
    </section>
  );
}
