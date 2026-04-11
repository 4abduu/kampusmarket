import { MapPin, Package, Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Product } from "@/lib/mock-data";

interface LandingProductsSectionProps {
  products: Product[];
  onNavigate: (page: string, data?: string) => void;
}

export default function LandingProductsSection({ products, onNavigate }: LandingProductsSectionProps) {
  return (
    <section className="py-16 bg-slate-50 dark:bg-slate-800/50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Katalog Barang</h2>
            <p className="text-muted-foreground">Temukan barang berkualitas dari mahasiswa</p>
          </div>
          <Button variant="outline" onClick={() => onNavigate("catalog")}>
            Lihat Semua
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.slice(0, 8).map((product) => (
            <Card
              key={product.id}
              className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group"
              onClick={() => onNavigate("product", product.id)}
            >
              <div className="relative bg-muted h-48 flex items-center justify-center">
                <Package className="h-16 w-16 text-muted-foreground/30" />
                {product.originalPrice && (
                  <Badge className="absolute top-2 left-2 bg-red-500">
                    -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                  </Badge>
                )}
                {product.condition === "baru" && <Badge className="absolute top-2 right-2 bg-primary-500">Baru</Badge>}
              </div>
              <CardContent className="p-4">
                <p className="font-medium line-clamp-2 mb-2 group-hover:text-primary-600 transition-colors">{product.title}</p>
                <div className="flex items-center gap-1 mb-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm">{product.rating}</span>
                  <span className="text-sm text-muted-foreground">({product.soldCount} terjual)</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-bold text-primary-600">Rp {product.price.toLocaleString("id-ID")}</span>
                  {product.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">Rp {product.originalPrice.toLocaleString("id-ID")}</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs bg-primary-100 text-primary-700">
                        {product.seller.name.split(" ").map((namePart) => namePart[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">{product.seller.name.split(" ")[0]}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {product.location.split(",")[0]}
                  </div>
                </div>
                {product.canNego && (
                  <Badge variant="outline" className="mt-2 text-xs">
                    Bisa Nego
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
