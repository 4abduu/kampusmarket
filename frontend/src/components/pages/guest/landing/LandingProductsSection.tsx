import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ProductImage from "@/components/common/ProductImage";
import { PartialStarRating } from "@/components/common/PartialStarRating";
import type { Product } from "@/lib/mock-data";
import { LandingProductsSectionSkeleton } from "@/components/skeleton";
import { MapPin, Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import FetchErrorCard from "@/components/shared/FetchErrorCard";

interface LandingProductsSectionProps {
  products: Product[];
  onNavigate: (page: string, data?: string) => void;
  hasError?: boolean;
}

export default function LandingProductsSection({ products, onNavigate, hasError = false }: LandingProductsSectionProps) {
  if (!products || (products.length === 0 && !hasError)) {
    return <LandingProductsSectionSkeleton />;
  }

  // FIX #1: Sembunyikan produk stok 0 dari landing — hanya tampil yang ada stoknya
  const availableProducts = products.filter(p => {
    // Jasa tidak punya stok — selalu tampil
    if (p.type === 'jasa') return true;
    // Barang: sembunyikan kalau stok = 0
    const stock = (p as Product & { stock?: number }).stock;
    return stock === undefined || stock > 0;
  });

  return (
    <section className="py-10 sm:py-16 bg-slate-50 dark:bg-slate-800/50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5 sm:mb-8">
          <div>
            <h2 className="text-xl sm:text-3xl font-bold mb-1 sm:mb-2">Katalog Barang</h2>
            <p className="text-xs sm:text-base text-muted-foreground">Temukan barang berkualitas dari mahasiswa</p>
          </div>
          <Button variant="outline" size="sm" className="self-start sm:self-auto" onClick={() => onNavigate("catalog")}>Lihat Semua</Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {hasError && availableProducts.length === 0 ? (
            <div className="col-span-full">
              <FetchErrorCard variant="inline" message="Gagal memuat barang" />
            </div>
          ) : (
            availableProducts.slice(0, 8).map((product) => {
            const soldCount = (product as any).soldCount ?? 0;
            const displaySoldCount = soldCount > 99 ? "99+" : soldCount;
            const rating = product.rating ?? 0;
            
            return (
            <Card
              key={(product as any).uuid ?? product.id}
              className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group flex flex-col"    
              onClick={() => onNavigate("product", (product as any).uuid ?? product.id)}
            >
              <div className="relative bg-muted h-32 md:h-48 flex items-center justify-center overflow-hidden shrink-0">
                <ProductImage
                  src={(product as any).images?.[0]?.url ?? (product as any).images?.[0]}
                  alt={product.title}
                  type={product.type || "barang"}
                  className="w-full h-full"
                  imageClassName="w-full h-full object-cover"
                  showError={false}
                />
                
                {/* Desktop Discount Badge */}
                {product.originalPrice && (
                  <Badge className="absolute top-2 left-2 bg-red-500 hidden md:flex">
                    -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                  </Badge>
                )}
                {/* Desktop Baru Badge */}
                {(product as Product & { condition?: string }).condition === "baru" && (
                  <Badge className="absolute top-2 right-2 bg-primary-500 hidden md:flex">Baru</Badge>
                )}
                
                {/* Mobile Baru Badge */}
                {(product as Product & { condition?: string }).condition === "baru" && (
                  <Badge className="absolute top-1.5 right-1.5 px-1.5 py-0 text-[9px] bg-primary-500 md:hidden">Baru</Badge>
                )}
              </div>

              <CardContent className="p-2 md:p-4 flex flex-col flex-grow">
                <p className="font-medium text-xs md:text-base line-clamp-2 mb-1 md:mb-2 group-hover:text-primary-600 transition-colors leading-snug">
                  {product.title}
                </p>

                {/* DESKTOP LAYOUT */}
                <div className="hidden md:flex flex-col flex-grow">
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{product.rating ?? 0}</span>
                    <span className="text-sm text-muted-foreground truncate">({soldCount} terjual)</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-lg font-bold text-primary-600">
                      Rp {Number(product.price).toLocaleString("id-ID")}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        Rp {product.originalPrice.toLocaleString("id-ID")}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-1 mt-auto">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Avatar className="h-6 w-6 shrink-0">
                        <AvatarFallback className="text-xs bg-primary-100 text-primary-700">
                          {product.seller.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground truncate">
                        {product.seller.name.split(" ")[0]}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate max-w-[60px]">{product.location.split(",")[0]}</span>
                    </div>
                  </div>

                  {(product as Product & { canNego?: boolean }).canNego && (
                    <Badge variant="outline" className="mt-2 text-xs px-2 py-0.5 w-fit">Bisa Nego</Badge>
                  )}
                </div>

                {/* MOBILE LAYOUT */}
                <div className="mt-auto flex flex-col gap-1 pt-1 md:hidden">
                  <span className="text-sm font-bold text-primary-600">
                    Rp{Number(product.price).toLocaleString("id-ID")}
                  </span>

                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <PartialStarRating rating={rating} size={10} />
                    <span>{rating.toFixed(1)}</span>
                    <span className="text-[8px]">•</span>
                    <span>{displaySoldCount} terjual</span>
                  </div>

                  <span className="text-[10px] text-muted-foreground truncate mt-0.5">
                    {product.seller.name}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}))}
        </div>
      </div>
    </section>
  );
}
