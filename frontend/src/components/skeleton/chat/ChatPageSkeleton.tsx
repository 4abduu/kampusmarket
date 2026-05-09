"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function ChatPageSkeleton() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto h-[calc(100vh-64px)] flex">
        {/* Chat List */}
        <div className="w-80 border-r bg-white dark:bg-slate-800">
          {/* Search */}
          <div className="p-4 border-b space-y-3">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>

          {/* Chat Rooms */}
          <div className="divide-y">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-4 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-800">
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            {/* Message from other */}
            <div className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <Skeleton className="h-12 w-48 rounded-lg" />
            </div>

            {/* Message from me */}
            <div className="flex justify-end">
              <Skeleton className="h-12 w-48 rounded-lg" />
            </div>

            {/* Message from other */}
            <div className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <Skeleton className="h-16 w-56 rounded-lg" />
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t flex gap-2">
            <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
            <Skeleton className="h-10 flex-1 rounded-lg" />
            <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
}
