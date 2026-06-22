"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface ReviewsListSkeletonProps {
  count?: number;
  variant?: "inline" | "stacked";
}

export default function ReviewsListSkeleton({
  count = 3,
  variant = "inline",
}: ReviewsListSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border-b pb-4 last:border-0">
          {variant === "stacked" ? (
            <div className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-4 w-3/4" />
            </>
          )}
        </div>
      ))}
    </div>
  );
}
