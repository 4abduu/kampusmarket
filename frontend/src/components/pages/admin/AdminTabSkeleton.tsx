import { Skeleton } from "@/components/ui/skeleton";

/** Shared wrapper: full-width, consistent vertical spacing */
function SkeletonSection({ children }: { children: React.ReactNode }) {
  return <div className="space-y-4 py-2">{children}</div>;
}

/** 4 stat cards (overview) */
function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border bg-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
}

/** Two wide chart cards (overview) */
function ChartsSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="rounded-xl border bg-card p-5 space-y-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      ))}
    </div>
  );
}

/** Generic table skeleton: toolbar + N rows */
function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 flex-1 max-w-xs rounded-lg" />
        <Skeleton className="h-9 w-24 rounded-lg" />
        <Skeleton className="h-9 w-9 rounded-lg ml-auto" />
      </div>
      {/* Header row */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="border-b px-4 py-3 flex gap-4">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-4" style={{ flex: c === 0 ? 2 : 1 }} />
          ))}
        </div>
        {/* Data rows */}
        {Array.from({ length: rows }).map((_, r) => (
          <div
            key={r}
            className="px-4 py-3 flex gap-4 items-center border-b last:border-0"
          >
            {/* Avatar-like first col */}
            <div className="flex items-center gap-3" style={{ flex: 2 }}>
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3.5 w-full max-w-[140px]" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            {Array.from({ length: cols - 1 }).map((_, c) => (
              <Skeleton key={c} className="h-4 rounded" style={{ flex: 1 }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Category / Faculty card grid skeleton */
function CardGridSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 flex-1 max-w-xs rounded-lg" />
        <Skeleton className="h-9 w-28 rounded-lg" />
        <Skeleton className="h-9 w-28 rounded-lg ml-auto" />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: cards }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-5 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-6 w-14 rounded-full" />
            </div>
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-8 flex-1 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Exported per-tab skeletons
// ---------------------------------------------------------------------------

export function OverviewTabSkeleton() {
  return (
    <SkeletonSection>
      <StatsCardsSkeleton />
      <ChartsSkeleton />
      {/* Recent activity placeholder */}
      <div className="rounded-xl border bg-card p-5 space-y-3">
        <Skeleton className="h-5 w-40" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </SkeletonSection>
  );
}

export function UsersTabSkeleton() {
  return (
    <SkeletonSection>
      <TableSkeleton rows={8} cols={5} />
    </SkeletonSection>
  );
}

export function ProductsTabSkeleton() {
  return (
    <SkeletonSection>
      <TableSkeleton rows={8} cols={6} />
    </SkeletonSection>
  );
}

export function CategoriesTabSkeleton() {
  return (
    <SkeletonSection>
      <CardGridSkeleton cards={6} />
    </SkeletonSection>
  );
}

export function FacultiesTabSkeleton() {
  return (
    <SkeletonSection>
      <CardGridSkeleton cards={6} />
    </SkeletonSection>
  );
}

export function ReportsTabSkeleton() {
  return (
    <SkeletonSection>
      <TableSkeleton rows={7} cols={5} />
    </SkeletonSection>
  );
}

export function FinanceTabSkeleton() {
  return (
    <SkeletonSection>
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-5 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-7 w-32" />
          </div>
        ))}
      </div>
      <TableSkeleton rows={6} cols={5} />
    </SkeletonSection>
  );
}
