"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function UserDashboardOverviewSkeleton() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar kiri */}
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

          {/* Konten kanan */}
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-9 w-48 mt-1" />
                    <Skeleton className="h-3 w-40 mt-2" />
                  </div>
                  <Skeleton className="h-14 w-14 rounded-full" />
                </div>
              </CardContent>
            </Card>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-8 w-8 rounded-lg" />
                    </div>
                    <Skeleton className="h-8 w-20 mt-2" />
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-36" />
                    <Skeleton className="h-9 w-44 mt-1" />
                    <Skeleton className="h-3 w-56 mt-1" />
                  </div>
                  <div className="text-right space-y-1">
                    <Skeleton className="h-4 w-20 ml-auto" />
                    <Skeleton className="h-6 w-28 mt-1 ml-auto" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <div className="p-6 pb-0">
                <Skeleton className="h-6 w-28" />
              </div>
              <CardContent>
                <div className="grid sm:grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full rounded-md" />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <div className="p-6 pb-0 flex items-center justify-between">
                <Skeleton className="h-6 w-44" />
                <Skeleton className="h-8 w-24 rounded-md" />
              </div>
              <CardContent>
                <div className="grid sm:grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="border rounded-lg overflow-hidden">
                      <Skeleton className="h-32 w-full rounded-none" />
                      <div className="p-3">
                        <Skeleton className="h-5 w-12 rounded-full" />
                        <Skeleton className="h-4 w-32 mt-1" />
                        <Skeleton className="h-4 w-20 mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
