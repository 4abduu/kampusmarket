import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/** Wrapper untuk memberikan layout vertikal konsisten setinggi tab asli */
function SkeletonSection({ children }: { children: React.ReactNode }) {
  return <div className="space-y-6 py-2 animate-pulse">{children}</div>;
}

// ===========================================================================
// 1. OVERVIEW TAB SKELETON (Replikasi UI Final 1:1)
// ===========================================================================
export function OverviewTabSkeleton() {
  return (
    <SkeletonSection>
      {/* 4 Stat Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-4 w-24" />
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
                  <Skeleton className="h-4 w-4 rounded-sm" />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <Skeleton className="h-8 w-28 mt-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 2 Chart Cards */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Tren Transaksi Chart */}
        <Card>
          <CardHeader>
            <div className="space-y-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-slate-200 dark:bg-slate-800" />
                <Skeleton className="h-5 w-32" />
              </CardTitle>
              <Skeleton className="h-3.5 w-64" />
            </div>
          </CardHeader>
          <CardContent>
            {/* Visualisasi Line Chart setinggi 280px asli */}
            <div className="h-[280px] w-full flex flex-col justify-between border-b border-l border-slate-200 dark:border-slate-800 pb-2 pl-2">
              <div className="flex-1 w-full flex items-end justify-between px-4 pb-2 gap-2">
                {Array.from({ length: 15 }).map((_, i) => {
                  const heights = ["h-[40%]", "h-[60%]", "h-[45%]", "h-[70%]", "h-[50%]", "h-[80%]", "h-[65%]", "h-[90%]", "h-[55%]", "h-[75%]", "h-[60%]", "h-[85%]", "h-[70%]", "h-[95%]", "h-[80%]"];
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                      <Skeleton className={`w-2.5 rounded-full bg-slate-200 dark:bg-slate-800 ${heights[i]}`} />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between px-2 text-[10px] text-muted-foreground pt-2">
                <Skeleton className="h-3 w-8" />
                <Skeleton className="h-3 w-8" />
                <Skeleton className="h-3 w-8" />
                <Skeleton className="h-3 w-8" />
                <Skeleton className="h-3 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Distribusi Kategori Chart */}
        <Card>
          <CardHeader>
            <div className="space-y-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-slate-200 dark:bg-slate-800" />
                <Skeleton className="h-5 w-40" />
              </CardTitle>
              <Skeleton className="h-3.5 w-48" />
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            {/* Visualisasi Pie Chart setinggi 280px asli */}
            <div className="h-[280px] w-full flex flex-col items-center justify-center gap-6">
              <div className="relative w-44 h-44 rounded-full border-[12px] border-slate-200 dark:border-slate-800 flex items-center justify-center">
                <Skeleton className="h-10 w-16" />
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-800" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4 Quick Alert Cards (Row 3) */}
      <div className="grid sm:grid-cols-4 gap-4">
        {[
          "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20",
          "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20",
          "border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20",
          "border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-900/20",
        ].map((bgClass, index) => (
          <Card key={index} className={bgClass}>
            <CardContent className="p-4 flex items-center gap-4 h-20">
              <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-950 flex items-center justify-center shrink-0">
                <Skeleton className="h-6 w-6 rounded-full" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-6 w-8 font-bold" />
                <Skeleton className="h-3 w-24 text-muted-foreground" />
              </div>
              <Skeleton className="h-8 w-14 rounded-lg ml-auto shrink-0" />
            </CardContent>
          </Card>
        ))}
      </div>


      {/* Aktivitas Mingguan */}
      <Card>
        <CardHeader>
          <CardTitle><Skeleton className="h-5 w-40" /></CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-2 rounded-lg"
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                  <Skeleton className="h-4 w-4 rounded-full" />
                </div>
                <div className="flex-1">
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-4 w-12 shrink-0" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </SkeletonSection>
  );
}

// ===========================================================================
// 2. USERS TAB SKELETON (Replikasi UI Final 1:1)
// ===========================================================================
export function UsersTabSkeleton() {
  return (
    <SkeletonSection>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4">
            {/* Title & Total count header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <CardTitle><Skeleton className="h-6 w-36" /></CardTitle>
                <CardDescription><Skeleton className="h-4 w-56" /></CardDescription>
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Skeleton className="h-9 w-full rounded-lg" />
              </div>
              <Skeleton className="h-9 w-[130px] rounded-lg" />
              <Skeleton className="h-9 w-20 rounded-lg" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30%]">User</TableHead>
                <TableHead className="w-[20%]">Email</TableHead>
                <TableHead className="w-[20%]">Fakultas</TableHead>
                <TableHead className="w-[15%]">Status</TableHead>
                <TableHead className="w-[10%]">Bergabung</TableHead>
                <TableHead className="w-[5%] text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 8 }).map((_, r) => (
                <TableRow key={r}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </div>
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-28 font-medium" />
                        <Skeleton className="h-3 w-20 text-muted-foreground" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Skeleton className="h-8 w-8 rounded-md" />
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {/* Pagination bar */}
          <div className="flex justify-center items-center gap-1 mt-4">
            <Skeleton className="h-8 w-16 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-16 rounded" />
          </div>
        </CardContent>
      </Card>
    </SkeletonSection>
  );
}

// ===========================================================================
// 3. PRODUCTS TAB SKELETON (Replikasi UI Final 1:1)
// ===========================================================================
export function ProductsTabSkeleton() {
  return (
    <SkeletonSection>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <CardTitle><Skeleton className="h-6 w-36" /></CardTitle>
                <CardDescription><Skeleton className="h-4 w-60" /></CardDescription>
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Skeleton className="h-9 w-full rounded-lg" />
              </div>
              <Skeleton className="h-9 w-[100px] rounded-lg" />
              <Skeleton className="h-9 w-20 rounded-lg" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[35%]">Produk</TableHead>
                <TableHead className="w-[10%]">Tipe</TableHead>
                <TableHead className="w-[15%]">Harga</TableHead>
                <TableHead className="w-[20%]">Penjual</TableHead>
                <TableHead className="w-[10%]">Status</TableHead>
                <TableHead className="w-[10%] text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 8 }).map((_, r) => (
                <TableRow key={r}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-10 h-10 rounded shrink-0 bg-slate-100 dark:bg-slate-800" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-48 font-medium" />
                        <Skeleton className="h-3 w-24 text-muted-foreground" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-5 w-14 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20 font-medium" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-14 rounded-full" /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Skeleton className="h-8 w-8 rounded-md" />
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-center items-center gap-1 mt-4">
            <Skeleton className="h-8 w-16 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-16 rounded" />
          </div>
        </CardContent>
      </Card>
    </SkeletonSection>
  );
}

// ===========================================================================
// 4. CATEGORIES TAB SKELETON (Replikasi UI Final 1:1)
// ===========================================================================
export function CategoriesTabSkeleton() {
  return (
    <SkeletonSection>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <CardTitle><Skeleton className="h-6 w-36" /></CardTitle>
                <CardDescription><Skeleton className="h-4 w-56" /></CardDescription>
              </div>
              <Skeleton className="h-9 w-36 rounded-md" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Skeleton className="h-9 w-full rounded-lg" />
              </div>
              <Skeleton className="h-9 w-[120px] rounded-lg" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[25%]">Nama Kategori</TableHead>
                <TableHead className="w-[15%]">Tipe</TableHead>
                <TableHead className="w-[35%]">Deskripsi</TableHead>
                <TableHead className="w-[10%]">Urutan</TableHead>
                <TableHead className="w-[10%]">Status</TableHead>
                <TableHead className="w-[5%] text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 6 }).map((_, r) => (
                <TableRow key={r}>
                  <TableCell><Skeleton className="h-4 w-28 font-medium" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-14 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-48 text-muted-foreground" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                  <TableCell>
                    {/* Status toggle pill replication */}
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-100 bg-slate-50/50 dark:bg-slate-900/10">
                      <span className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-800" />
                      <Skeleton className="h-3.5 w-10" />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Skeleton className="h-8 w-8 rounded-md" />
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </SkeletonSection>
  );
}

// ===========================================================================
// 5. FACULTIES TAB SKELETON (Replikasi UI Final 1:1)
// ===========================================================================
export function FacultiesTabSkeleton() {
  return (
    <SkeletonSection>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <CardTitle><Skeleton className="h-6 w-44" /></CardTitle>
                <CardDescription><Skeleton className="h-4 w-60" /></CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-9 w-36 rounded-md" />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Skeleton className="h-9 w-full rounded-lg" />
              </div>
              <Skeleton className="h-9 w-[130px] rounded-lg" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[25%]">Fakultas</TableHead>
                <TableHead className="w-[10%]">Kode</TableHead>
                <TableHead className="w-[25%]">Deskripsi</TableHead>
                <TableHead className="w-[10%]">Mahasiswa</TableHead>
                <TableHead className="w-[10%]">Urutan</TableHead>
                <TableHead className="w-[10%]">Status</TableHead>
                <TableHead className="w-[10%]">Dibuat</TableHead>
                <TableHead className="w-[5%] text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 6 }).map((_, r) => (
                <TableRow key={r}>
                  <TableCell><Skeleton className="h-4 w-36 font-medium" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-12 rounded bg-slate-100 dark:bg-slate-800" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-44 text-muted-foreground" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                  <TableCell>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-100">
                      <span className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-800" />
                      <Skeleton className="h-3.5 w-10" />
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Skeleton className="h-8 w-8 rounded-md" />
                      <Skeleton className="h-8 w-8 rounded-md text-red-500" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-center items-center gap-1 mt-4">
            <Skeleton className="h-8 w-16 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-16 rounded" />
          </div>
        </CardContent>
      </Card>
    </SkeletonSection>
  );
}

// ===========================================================================
// 6. REPORTS TAB SKELETON (Replikasi UI Final 1:1 List Laporan)
// ===========================================================================
export function ReportsTabSkeleton() {
  return (
    <SkeletonSection>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <CardTitle><Skeleton className="h-6 w-32" /></CardTitle>
                <CardDescription><Skeleton className="h-4 w-52" /></CardDescription>
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Skeleton className="h-9 w-full rounded-lg" />
              </div>
              <Skeleton className="h-9 w-[130px] rounded-lg" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3 w-full">
                    {/* Circle Report type icon placeholder */}
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      <Skeleton className="h-5 w-5 rounded-full" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-40 font-medium" />
                        <Skeleton className="h-4 w-12 rounded" />
                      </div>
                      <Skeleton className="h-4 w-3/4 text-muted-foreground mt-1" />
                      
                      {/* Product reported box visual replication */}
                      {i % 3 === 0 && (
                        <div className="mt-2 text-sm p-2 bg-slate-50 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                          <Skeleton className="h-3 w-32 block mb-1 text-muted-foreground" />
                          <Skeleton className="h-4 w-56" />
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 mt-2">
                        <Skeleton className="h-3 w-28" />
                        <Skeleton className="h-3 w-28" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  </div>
                  {/* Action buttons on right side */}
                  <div className="flex items-center gap-2 sm:flex-col sm:items-end shrink-0">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <div className="flex gap-1 mt-2">
                      <Skeleton className="h-8 w-20 rounded" />
                      <Skeleton className="h-8 w-14 rounded" />
                      <Skeleton className="h-8 w-16 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center items-center gap-1 mt-4">
            <Skeleton className="h-8 w-16 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-16 rounded" />
          </div>
        </CardContent>
      </Card>
    </SkeletonSection>
  );
}

// ===========================================================================
// 7. FINANCE TAB SKELETON (Replikasi UI Final 1:1 Keuangan)
// ===========================================================================
export function FinanceTabSkeleton() {
  return (
    <SkeletonSection>
      {/* 4 Finance Stat Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className={i === 3 ? "border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20" : ""}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-4 w-24" />
                <div className="p-1 rounded-full">
                  <Skeleton className="h-4 w-4 rounded-full" />
                </div>
              </div>
              <Skeleton className="h-8 w-32 font-bold" />
              <Skeleton className="h-3.5 w-36 mt-1 text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Subtab Buttons */}
      <div className="flex gap-2 border-b pb-2">
        <Skeleton className="h-9 w-32 rounded-md" />
        <Skeleton className="h-9 w-36 rounded-md" />
      </div>

      {/* Withdrawals Table Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <CardTitle><Skeleton className="h-6 w-52" /></CardTitle>
                <CardDescription><Skeleton className="h-4 w-72" /></CardDescription>
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Skeleton className="h-9 w-full rounded-lg" />
              </div>
              <Skeleton className="h-9 w-[130px] rounded-lg" />
              <Skeleton className="h-9 w-20 rounded-lg" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[20%]">User</TableHead>
                <TableHead className="w-[15%]">Jumlah</TableHead>
                <TableHead className="w-[10%]">Tipe</TableHead>
                <TableHead className="w-[15%]">Provider</TableHead>
                <TableHead className="w-[15%]">No. Akun</TableHead>
                <TableHead className="w-[10%]">Tanggal</TableHead>
                <TableHead className="w-[10%]">Status</TableHead>
                <TableHead className="w-[5%] text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 6 }).map((_, r) => (
                <TableRow key={r}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </div>
                      <Skeleton className="h-4 w-24 font-medium" />
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-24 font-bold" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16 font-medium" /></TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24 font-mono" />
                      <Skeleton className="h-3 w-20 text-muted-foreground" />
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Skeleton className="h-8 w-16 rounded" />
                      <Skeleton className="h-8 w-20 rounded" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-center items-center gap-1 mt-4">
            <Skeleton className="h-8 w-16 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-16 rounded" />
          </div>
        </CardContent>
      </Card>
    </SkeletonSection>
  );
}
