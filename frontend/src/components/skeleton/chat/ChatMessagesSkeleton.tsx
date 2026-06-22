"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface ChatMessagesSkeletonProps {
  count?: number;
}

export default function ChatMessagesSkeleton({ count = 4 }: ChatMessagesSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
        >
          <Skeleton
            className={`h-8 rounded-2xl ${i % 2 === 0 ? "w-40" : "w-52"}`}
          />
        </div>
      ))}
    </div>
  );
}
