"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface ChatListPanelSkeletonProps {
  count?: number;
}

export default function ChatListPanelSkeleton({ count = 3 }: ChatListPanelSkeletonProps) {
  return (
    <div className="p-4 space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="w-11 h-11 rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-2 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
