"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function ChatConversationPanelSkeleton() {
  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4 border-b flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="flex-1 p-4 space-y-4">
        <div className="flex justify-start">
          <Skeleton className="h-12 w-48 rounded-2xl" />
        </div>
        <div className="flex justify-end">
          <Skeleton className="h-12 w-32 rounded-2xl" />
        </div>
        <div className="flex justify-start">
          <Skeleton className="h-20 w-64 rounded-2xl" />
        </div>
      </div>
      <div className="p-4 border-t flex gap-2">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>
    </div>
  );
}
