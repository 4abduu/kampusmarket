import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, MapPin, Package, Star, User } from "lucide-react";
import { mockProducts } from "@/lib/mock-data";
import type { Product, User as UserType } from "@/lib/mock-data";
import type { SearchNavigateFn, SearchViewMode } from "@/components/pages/guest/search-results/searchResults.types";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};

export function SearchProductCard({
  product,
  viewMode,
  onNavigate,
}: {
  product: Product;
  viewMode: SearchViewMode;
  onNavigate: SearchNavigateFn;
}) {
  if (viewMode === "list") {
    return (
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => onNavigate(product.type === "jasa" ? "service" : "product", product.id)}
      >
        <CardContent className="p-4 flex gap-4">
          <div
            className={`w-24 h-24 rounded-lg flex items-center justify-center flex-shrink-0 ${
              product.type === "jasa"
                ? "bg-emerald-50 dark:bg-emerald-900/20"
                : "bg-slate-100 dark:bg-slate-800"
            }`}
          >
            {product.type === "jasa" ? (
              <Briefcase className="h-8 w-8 text-emerald-600/70" />
            ) : (
              <Package className="h-8 w-8 text-muted-foreground/30" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <Badge variant={product.type === "jasa" ? "secondary" : "default"} className="mb-1">
                  {product.type === "jasa" ? "Jasa" : "Barang"}
                </Badge>
                <h3 className="font-semibold line-clamp-1">{product.title}</h3>
              </div>
              <p className="font-bold text-primary-600 whitespace-nowrap">
                {product.priceType === "starting" && "Mulai "}
                {product.priceType === "range" && product.priceMin
                  ? `${formatPrice(product.priceMin)} - ${formatPrice(product.priceMax || product.price)}`
                  : formatPrice(product.price)}
              </p>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{product.description}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {product.location}
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                {product.rating} ({product.reviewCount})
              </span>
              <span>Terjual: {product.soldCount}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden group"
      onClick={() => onNavigate(product.type === "jasa" ? "service" : "product", product.id)}
    >
      <div
        className={`aspect-square relative ${
          product.type === "jasa"
            ? "bg-emerald-50 dark:bg-emerald-900/20"
            : "bg-slate-100 dark:bg-slate-800"
        }`}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {product.type === "jasa" ? (
            <Briefcase className="h-12 w-12 text-emerald-600/70" />
          ) : (
            <Package className="h-12 w-12 text-muted-foreground/30" />
          )}
        </div>
        <Badge variant={product.type === "jasa" ? "secondary" : "default"} className="absolute top-2 left-2">
          {product.type === "jasa" ? "Jasa" : "Barang"}
        </Badge>
        {product.originalPrice && <Badge variant="destructive" className="absolute top-2 right-2">Diskon</Badge>}
      </div>
      <CardContent className="p-3">
        <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary-600 transition-colors">{product.title}</h3>
        <p className="font-bold text-primary-600 mt-1">
          {product.priceType === "starting" && "Mulai "}
          {product.priceType === "range" && product.priceMin
            ? `${formatPrice(product.priceMin)} - ${formatPrice(product.priceMax || product.price)}`
            : formatPrice(product.price)}
        </p>
        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span className="truncate">{product.location}</span>
        </div>
        <div className="flex items-center justify-between mt-2 text-xs">
          <span className="flex items-center gap-1 text-muted-foreground">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {product.rating}
          </span>
          <span className="text-muted-foreground">Terjual {product.soldCount}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function SearchUserCard({
  user,
  onNavigate,
}: {
  user: UserType;
  onNavigate: SearchNavigateFn;
}) {
  const userProducts = mockProducts.filter((p) => p.seller.id === user.id);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatar} />
            <AvatarFallback className="bg-primary-100 text-primary-700">
              {user.name.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate">{user.name}</h3>
              {user.isVerified && (
                <Badge variant="outline" className="text-xs border-primary-500 text-primary-600">Terverifikasi</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
            {user.faculty && <p className="text-xs text-muted-foreground mt-1">{user.faculty}</p>}
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="text-center">
            <p className="font-bold text-lg">{userProducts.length}</p>
            <p className="text-xs text-muted-foreground">Produk</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-lg">{userProducts.reduce((sum, p) => sum + p.soldCount, 0)}</p>
            <p className="text-xs text-muted-foreground">Terjual</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-lg">
              {userProducts.length > 0
                ? (userProducts.reduce((sum, p) => sum + p.rating, 0) / userProducts.length).toFixed(1)
                : "-"}
            </p>
            <p className="text-xs text-muted-foreground">Rating</p>
          </div>
        </div>

        {userProducts.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-muted-foreground mb-2">Produk terbaru:</p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {userProducts.slice(0, 3).map((product) => (
                <div
                  key={product.id}
                  className={`w-16 h-16 rounded-lg flex-shrink-0 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-primary-500 ${
                    product.type === "jasa"
                      ? "bg-emerald-50 dark:bg-emerald-900/20"
                      : "bg-slate-100 dark:bg-slate-800"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate(product.type === "jasa" ? "service" : "product", product.id);
                  }}
                >
                  {product.type === "jasa" ? (
                    <Briefcase className="h-6 w-6 text-emerald-600/70" />
                  ) : (
                    <Package className="h-6 w-6 text-muted-foreground/30" />
                  )}
                </div>
              ))}
              {userProducts.length > 3 && (
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg flex-shrink-0 flex items-center justify-center text-xs text-muted-foreground">
                  +{userProducts.length - 3}
                </div>
              )}
            </div>
          </div>
        )}

        <Button variant="outline" className="w-full mt-4" onClick={() => onNavigate("chat")}>
          <User className="h-4 w-4 mr-2" />
          Lihat Profil
        </Button>
      </CardContent>
    </Card>
  );
}

export function SearchEmptyState({ type }: { type: string }) {
  return (
    <div className="text-center py-12">
      <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
      <h3 className="font-semibold mb-1">Tidak ada {type} ditemukan</h3>
      <p className="text-sm text-muted-foreground">Coba kata kunci lain untuk menemukan {type}</p>
    </div>
  );
}
