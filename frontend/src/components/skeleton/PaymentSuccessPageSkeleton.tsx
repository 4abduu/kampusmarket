"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function PaymentSuccessPageSkeleton() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-primary-50 to-white dark:from-primary-950/30 dark:to-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <Skeleton className="h-20 w-20 rounded-full mx-auto mb-4" />
          <Skeleton className="h-8 w-80 mx-auto mb-2" />
          <Skeleton className="h-5 w-96 max-w-full mx-auto" />
        </div>

        <Card className="mb-6">
          <CardContent className="p-6 space-y-3">
            <div className="flex justify-between"><Skeleton className="h-4 w-28" /><Skeleton className="h-6 w-48" /></div>
            <Skeleton className="h-4 w-56" />
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-40" />
            <div className="flex gap-4">
              <Skeleton className="h-16 w-16 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
            <Skeleton className="h-px w-full" />
            <div className="space-y-2">
              <div className="flex justify-between"><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-28" /></div>
              <div className="flex justify-between"><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-28" /></div>
            </div>
            <Skeleton className="h-px w-full" />
            <div className="flex justify-between"><Skeleton className="h-6 w-32" /><Skeleton className="h-6 w-32" /></div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="p-6 space-y-3">
            <Skeleton className="h-6 w-44" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
        </div>
      </div>
    </div>
  );
}
