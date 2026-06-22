"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface ProfileListSkeletonProps {
  count?: number;
}

export default function ProfileListSkeleton({ count = 4 }: ProfileListSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-lg" />
      ))}
    </div>
  );
}
