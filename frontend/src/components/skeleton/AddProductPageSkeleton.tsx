"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AddProductPageSkeleton() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Product Type */}
            <div className="space-y-2">
              <Skeleton className="h-5 w-24 mb-3" />
              <div className="flex gap-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 flex-1 rounded-lg" />
                ))}
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Skeleton className="h-5 w-24 mb-3" />
              <Skeleton className="h-32 w-full rounded-lg border-2" />
              <div className="flex gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-20 rounded-lg" />
                ))}
              </div>
            </div>

            {/* Form Fields */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ))}

            {/* Text Area */}
            <div className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>

            {/* Checkboxes */}
            <div className="space-y-2">
              <Skeleton className="h-5 w-24 mb-3" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <Skeleton className="h-11 w-full rounded-lg" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
