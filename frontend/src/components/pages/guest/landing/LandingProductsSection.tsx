import { MapPin, Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ProductImage from "@/components/common/ProductImage";
import type { Product } from "@/lib/mock-data";
import { LandingProductsSectionSkeleton } from "@/components/skeleton";

interface LandingProductsSectionProps {
  products: Product[];
  onNavigate: (page: string, data?: string) => void;
}

export default function LandingProductsSection({ products, onNavigate }: LandingProductsSectionProps) {
  if (!products || products.length === 0) {
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
    <section className="py-16 bg-slate-50 dark:bg-slate-800/50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Katalog Barang</h2>
            <p className="text-muted-foreground">Temukan barang berkualitas dari mahasiswa</p>
          </div>
          <Button variant="outline" onClick={() => onNavigate("catalog")}>Lihat Semua</Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {availableProducts.slice(0, 8).map((product) => (
            <Card
              key={(product as any).uuid ?? product.id}
              className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group"    
              onClick={() => onNavigate("product", (product as any).uuid ?? product.id)}
              
            >
              <div className="relative bg-muted h-48 flex items-center justify-center overflow-hidden">
                <ProductImage
                  src={(product as any).images?.[0]?.url ?? (product as any).images?.[0]}
                  alt={product.title}
                  type={product.type || "barang"}
                  className="w-full h-full"
                  imageClassName="w-full h-full object-cover"
                  showError={false}
                />

                {product.originalPrice && (
                  <Badge className="absolute top-2 left-2 bg-red-500">
                    -
                    {Math.round(
                      (1 - product.price / product.originalPrice) * 100,
                    )}
                    %
                  </Badge>
                )}
                {(product as Product & { condition?: string }).condition === "baru" && (
                  <Badge className="absolute top-2 right-2 bg-primary-500">Baru</Badge>
                )}
              </div>

              <CardContent className="p-3 md:p-4">
                <p className="font-medium text-sm md:text-base line-clamp-2 mb-2 group-hover:text-primary-600 transition-colors">
                  {product.title}
                </p>

                <div className="flex items-center gap-1 mb-2">
                  <Star className="h-3 w-3 md:h-4 md:w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs md:text-sm">{product.rating ?? 0}</span>
                  <span className="text-[10px] md:text-sm text-muted-foreground truncate">({(product as any).soldCount ?? 0} terjual)</span>
                </div>

                <div className="flex flex-wrap items-center gap-1 md:gap-2 mb-2">
                  <span className="text-sm md:text-lg font-bold text-primary-600">
                    {(() => {
                      const p = Number(product.price);
                      return Number.isFinite(p)
                        ? `Rp ${p.toLocaleString("id-ID")}`
                        : "—";
                    })()}
                  </span>
                  {product.originalPrice && (
                    <span className="text-[10px] md:text-sm text-muted-foreground line-through">
                      Rp {product.originalPrice.toLocaleString("id-ID")}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 md:gap-2 overflow-hidden">
                    <Avatar className="h-5 w-5 md:h-6 md:w-6 shrink-0">
                      <AvatarFallback className="text-[8px] md:text-xs bg-primary-100 text-primary-700">
                        {product.seller.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-[10px] md:text-xs text-muted-foreground truncate">
                      {product.seller.name.split(" ")[0]}
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5 md:gap-1 text-[10px] md:text-xs text-muted-foreground shrink-0">
                    <MapPin className="h-2.5 w-2.5 md:h-3 md:w-3" />
                    <span className="truncate max-w-[60px] md:max-w-none">{product.location.split(",")[0]}</span>
                  </div>
                </div>

                {(product as Product & { canNego?: boolean }).canNego && (
                  <Badge variant="outline" className="mt-2 text-[10px] md:text-xs px-1.5 py-0 md:px-2 md:py-0.5">Bisa Nego</Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
