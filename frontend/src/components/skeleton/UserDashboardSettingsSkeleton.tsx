"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function UserDashboardSettingsSkeleton() {
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
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-28" />
                  <Skeleton className="h-4 w-56" />
                </div>

                <div className="flex items-center gap-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-10 w-full rounded-lg" />
                      {(i === 1 || i === 3) && (
                        <Skeleton className="h-3 w-52" />
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-20 w-full rounded-lg" />
                </div>

                <Skeleton className="h-10 w-40 rounded-md" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-36 rounded-md" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-4 w-44" />
                  </div>
                  <Skeleton className="h-9 w-24 rounded-md" />
                </div>

                <div className="space-y-3">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-5 w-12 rounded-full" />
                          </div>
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-4 w-28" />
                          <Skeleton className="h-4 w-72" />
                        </div>
                        <div className="flex gap-1">
                          <Skeleton className="h-8 w-8 rounded-md" />
                          <Skeleton className="h-8 w-8 rounded-md" />
                        </div>
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
