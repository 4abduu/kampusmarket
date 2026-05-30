import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { MapPin, Home, Building, MapPinned, Search, X, RefreshCw, AlertCircle } from "lucide-react";
import type { AdminAddressUser } from "@/lib/api/admin";

interface Props {
  filteredAddresses: AdminAddressUser[];
  addressSearchTerm: string;
  setAddressSearchTerm: (value: string) => void;
  getInitials: (value?: string | null) => string;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export default function AdminAddressesTab({
  filteredAddresses,
  addressSearchTerm,
  setAddressSearchTerm,
  getInitials,
  isLoading = false,
  error = null,
  onRetry,
}: Props) {
  // Hitung total alamat aktif terfilter
  const totalAddressesCount = filteredAddresses.reduce(
    (sum, item) => sum + item.addresses.length,
    0
  );

  // 1. Status Loading (Skeleton loading presisi anti-shift)
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
                <div className="h-4 w-72 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
              </div>
              <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
            </div>
            <div className="h-10 w-full max-w-md bg-slate-200 dark:bg-slate-800 animate-pulse rounded-md" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border border-slate-100 dark:border-slate-800/80 rounded-xl p-3 bg-background shadow-sm space-y-2.5">
              {/* User Section Header Skeleton */}
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/50">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-full" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3 w-28 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
                    <div className="h-2.5 w-40 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
                  </div>
                </div>
                <div className="h-4.5 w-16 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-full" />
              </div>
              
              {/* Card List Row Skeleton */}
              <div className="flex gap-3 overflow-hidden pb-1 flex-nowrap">
                {Array.from({ length: 2 }).map((_, j) => (
                  <div key={j} className="w-[calc(50%-6px)] flex-1 min-w-[520px] max-w-full flex-shrink-0 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3 space-y-2 bg-slate-50/50 dark:bg-slate-800/20 flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <div className="h-6.5 w-6.5 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
                      <div className="h-3.5 w-16 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
                    </div>
                    <div className="space-y-1 mt-1">
                      <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
                      <div className="h-2.5 w-16 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
                    </div>
                    <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-800 animate-pulse rounded mt-1" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // 2. Status Galat (Error State Card dengan Retry)
  if (error) {
    return (
      <Card className="border-red-200 dark:border-red-900/50 bg-red-50/20 dark:bg-red-900/10">
        <CardContent className="p-8 flex flex-col items-center justify-center text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-3 animate-bounce" />
          <p className="text-lg font-bold text-red-700 dark:text-red-400">Gagal memuat data alamat</p>
          <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-1 max-w-md">{error}</p>
          {onRetry && (
            <Button onClick={onRetry} variant="outline" className="mt-5 border-red-300 dark:border-red-800 hover:bg-red-100/50 dark:hover:bg-red-900/20 gap-2">
              <RefreshCw className="h-4 w-4" />
              Coba Lagi
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 8px;
          display: block;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgb(203 213 225);
          border-radius: 4px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgb(71 85 105);
          border-radius: 4px;
        }
      `}</style>
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                <MapPin className="h-5 w-5 text-primary-600" />
                Daftar Alamat User
              </CardTitle>
              <CardDescription>
                Lihat dan kelola seluruh alamat pengiriman user
              </CardDescription>
            </div>
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
              {totalAddressesCount} alamat
            </div>
          </div>
          
          <div className="flex gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari alamat, penerima, label, catatan..."
                value={addressSearchTerm}
                onChange={(e) => setAddressSearchTerm(e.target.value)}
                className="pl-9 bg-slate-50/50 dark:bg-slate-900/50"
              />
            </div>
            {addressSearchTerm && (
              <Button variant="ghost" size="sm" onClick={() => setAddressSearchTerm("")} className="gap-1 text-xs">
                <X className="h-3 w-3" />
                Reset
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredAddresses.length === 0 ? (
          addressSearchTerm ? (
            // 3. Status Hasil Pencarian Kosong (Empty Search State)
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground border border-dashed rounded-xl bg-slate-50/30 dark:bg-slate-900/10">
              <Search className="h-12 w-12 mb-3 text-slate-300 dark:text-slate-700" />
              <p className="text-base font-semibold text-slate-800 dark:text-slate-200">Tidak ditemukan alamat yang sesuai</p>
              <p className="text-sm mt-1">Coba ubah filter atau kata kunci pencarian Anda.</p>
              <Button variant="outline" size="sm" onClick={() => setAddressSearchTerm("")} className="mt-4 gap-1">
                <X className="h-3.5 w-3.5" />
                Reset Pencarian
              </Button>
            </div>
          ) : (
            // 4. Status Data Kosong (Empty Data State)
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground border border-dashed rounded-xl bg-slate-50/30 dark:bg-slate-900/10">
              <MapPin className="h-12 w-12 mb-3 text-slate-300 dark:text-slate-700" />
              <p className="text-base font-semibold text-slate-800 dark:text-slate-200">Belum memiliki alamat tersimpan</p>
              <p className="text-sm mt-1 font-medium">Tidak ada data alamat yang terdaftar di platform saat ini.</p>
            </div>
          )
        ) : (
          // 5. Daftar Alamat Pengguna (Grouped by User)
          <div className="space-y-5">
            {filteredAddresses.map((item) => {
              const { user, addresses } = item;
              return (
                <div key={user.id} className="border border-slate-100 dark:border-slate-800/80 rounded-xl p-3 bg-background shadow-sm space-y-2.5">
                  {/* User Section Header (Compact Spacing) */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/50">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7 ring-2 ring-slate-100 dark:ring-slate-800">
                        {user.avatar && <AvatarImage src={user.avatar} alt={user.name} className="object-cover" />}
                        <AvatarFallback className="bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-400 text-[10px] font-bold">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-xs text-slate-800 dark:text-slate-200 leading-none">{user.name}</p>
                        <p className="text-[10.5px] text-muted-foreground leading-none mt-0.5">{user.email}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-primary-50 text-primary-700 border border-primary-200 dark:bg-primary-950/50 dark:text-primary-400 dark:border-primary-900 text-[10px] px-2 py-0.5">
                      {addresses.length} alamat
                    </Badge>
                  </div>
 
                  {/* Empty Address Handling inside User */}
                  {addresses.length === 0 ? (
                    <div className="border border-dashed rounded-xl p-4 bg-slate-50 dark:bg-slate-800 text-center py-6 text-muted-foreground text-sm font-medium">
                      Belum memiliki alamat tersimpan
                    </div>
                  ) : (
                    /* Consistent Horizontal Scrollable Address Row */
                    <div className="flex gap-3 overflow-x-auto pb-3 custom-scrollbar flex-nowrap scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                      {addresses.map((address) => {
                        // Tentukan Icon berdasarkan Label Alamat
                        const labelLower = address.label.toLowerCase();
                        const AddressIcon = labelLower === "kos" 
                          ? Home 
                          : (labelLower === "rumah" || labelLower === "kantor") 
                            ? Building 
                            : MapPinned;
 
                        return (
                          <div
                            key={address.id}
                            className={`w-[calc(50%-6px)] flex-1 min-w-[520px] max-w-full flex-shrink-0 border rounded-xl p-3 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/50 dark:hover:bg-slate-800/60 transition-colors break-words overflow-hidden flex flex-col gap-1.5 ${
                              address.is_primary 
                                ? "border-primary-500/50 shadow-sm" 
                                : "border-slate-200 dark:border-slate-800/80"
                            }`}
                          >
                            <div className="space-y-1.5">
                              {/* Header Alamat: Label dan Badge Utama (Compact Figma Layout) */}
                              <div className="flex items-center gap-2">
                                <div className={`p-1 rounded ${address.is_primary ? "bg-primary-100 dark:bg-primary-900/50" : "bg-slate-200 dark:bg-slate-700"}`}>
                                  <AddressIcon className={`h-3.5 w-3.5 ${address.is_primary ? "text-primary-600 dark:text-primary-400" : "text-slate-500"}`} />
                                </div>
                                <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{address.label}</span>
                                {address.is_primary && (
                                  <Badge variant="secondary" className="bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/50 dark:text-green-400 dark:border-green-900 text-[10px] font-semibold px-1.5 py-0.5 ml-1">
                                    Utama
                                  </Badge>
                                )}
                              </div>
                              
                              {/* Info Penerima */}
                              <div>
                                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-tight">{address.recipient_name}</p>
                                {address.phone && (
                                  <p className="text-[11px] text-muted-foreground font-mono leading-none mt-0.5">{address.phone}</p>
                                )}
                              </div>
 
                              {/* Alamat Lengkap */}
                              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2" title={address.address}>
                                {address.address}
                              </p>
                            </div>
 
                            {/* Catatan Tambahan (Optional) */}
                            {address.note && (
                              <div className="mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800/40 text-[11px] text-amber-700 dark:text-amber-500/90 italic flex items-start gap-1">
                                <span className="flex-shrink-0">📍</span>
                                <span className="line-clamp-2" title={address.note}>{address.note}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
