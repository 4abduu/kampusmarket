"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function UserDashboardWalletSkeleton() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <Skeleton className="h-20 w-20 rounded-full mx-auto mb-3" />
                    <Skeleton className="h-6 w-36 mx-auto mt-1" />
                    <Skeleton className="h-4 w-48 mx-auto mt-1" />
                    <Skeleton className="h-5 w-28 mx-auto mt-2 rounded-full" />
                    <Skeleton className="h-5 w-20 mx-auto mt-2 rounded-full" />
                  </div>

                  <div className="border-t my-6" />

                  <div className="space-y-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 px-3 py-2"
                      >
                        <Skeleton className="h-4 w-4 rounded" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <Skeleton className="h-4 w-28" />
                    <div className="flex items-center gap-2 mt-1">
                      <Skeleton className="h-9 w-52" />
                      <Skeleton className="h-7 w-7 rounded" />
                    </div>
                  </div>
                  <Skeleton className="h-12 w-12 rounded-full" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="rounded-lg p-3 border">
                      <Skeleton className="h-4 w-20 mb-1" />
                      <Skeleton className="h-6 w-28" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-20 w-full rounded-md" />
              <Skeleton className="h-20 w-full rounded-md" />
            </div>

            <Card>
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-6 w-44" />
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-8 w-40 mt-1" />
                  </div>
                  <div className="p-4 rounded-lg border">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-8 w-40 mt-1" />
                    <Skeleton className="h-3 w-44 mt-1" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex-1 min-w-[200px] max-w-md">
                      <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                    <Skeleton className="h-10 w-[140px] rounded-md" />
                    <Skeleton className="h-9 w-24 rounded-md" />
                  </div>
                </div>

                <div className="space-y-1 pr-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-3 rounded-lg border"
                    >
                      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                      <div className="flex-1 min-w-0 space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-4 w-64" />
                        <Skeleton className="h-3 w-28" />
                      </div>
                      <div className="text-right shrink-0 space-y-1">
                        <Skeleton className="h-5 w-28 ml-auto" />
                        <Skeleton className="h-3 w-24 ml-auto" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-2 pt-2">
                  <Skeleton className="h-8 w-24 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-24 rounded-md" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
