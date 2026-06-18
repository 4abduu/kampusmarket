import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Package, Star, User } from "lucide-react";
import ProductImage from "@/components/common/ProductImage";
import { PartialStarRating } from "@/components/common/PartialStarRating";
import type { Product, User as UserType } from "@/lib/mock-data";
import type {
  SearchNavigateFn,
  SearchViewMode,
} from "@/components/pages/guest/search-results/searchResults.types";

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
        onClick={() =>
          onNavigate(
            product.type === "jasa" ? "service" : "product",
            product.id,
          )
        }
      >
        <CardContent className="p-4 flex gap-4">
          <div
            className={`w-24 h-24 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden ${
              product.type === "jasa"
                ? "bg-emerald-50 dark:bg-emerald-900/20"
                : "bg-slate-100 dark:bg-slate-800"
            }`}
          >
            <ProductImage
              src={product.images?.[0]}
              alt={product.title}
              type={product.type}
              className="w-full h-full"
              imageClassName="w-full h-full object-cover"
              fallbackImageUrl="https://placehold.net/default.svg"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <Badge
                  variant={product.type === "jasa" ? "secondary" : "default"}
                  className="mb-1"
                >
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
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {product.description}
            </p>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {product.location}
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                {product.rating ?? 0} ({product.reviewCount ?? 0})
              </span>
              <span>Terjual: {(product as any).soldCount ?? 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const rating = product.rating ?? 0;
  const soldCount = (product as any).soldCount ?? 0;
  const displaySoldCount = soldCount > 99 ? "99+" : soldCount;

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden group flex flex-col"
      onClick={() =>
        onNavigate(product.type === "jasa" ? "service" : "product", product.id)
      }
    >
      <div
        className={`h-32 md:aspect-square md:h-auto shrink-0 relative flex items-center justify-center overflow-hidden ${
          product.type === "jasa"
            ? "bg-emerald-50 dark:bg-emerald-900/20"
            : "bg-muted md:bg-slate-100 md:dark:bg-slate-800"
        }`}
      >
        <ProductImage
          src={product.images?.[0]}
          alt={product.title}
          type={product.type}
          className="w-full h-full"
          imageClassName="w-full h-full object-cover group-hover:scale-105 transition-transform"
          fallbackImageUrl="https://placehold.net/default.svg"
        />
        {/* Desktop Badge */}
        <Badge
          variant={product.type === "jasa" ? "secondary" : "default"}
          className="absolute top-2 left-2 hidden md:inline-flex"
        >
          {product.type === "jasa" ? "Jasa" : "Barang"}
        </Badge>
        {product.originalPrice && (
          <Badge variant="destructive" className="absolute top-2 right-2 hidden md:inline-flex">
            Diskon
          </Badge>
        )}

        {/* Mobile Badge */}
        <Badge
          className={`absolute top-1.5 left-1.5 px-1.5 py-0 text-[9px] border-0 text-white backdrop-blur-sm md:hidden ${
            product.type === "jasa" ? "bg-slate-900/70" : "bg-primary-500/80"
          }`}
        >
          {product.type === "jasa" ? "Jasa" : "Barang"}
        </Badge>
        {product.originalPrice && (
          <Badge className="absolute top-1.5 right-1.5 px-1.5 py-0 text-[9px] bg-red-500 border-0 md:hidden">
            Diskon
          </Badge>
        )}
      </div>
      <CardContent className="p-2 md:p-3 flex flex-col flex-grow">
        <h3 className="font-medium md:font-semibold text-xs md:text-sm line-clamp-2 mb-1 group-hover:text-primary-600 transition-colors leading-snug">
          {product.title}
        </h3>
        
        {/* DESKTOP LAYOUT */}
        <div className="hidden md:flex flex-col flex-grow">
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
          <div className="flex items-center justify-between mt-auto pt-2 text-xs">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {product.rating ?? 0}
            </span>
            <span className="text-muted-foreground">
              Terjual {(product as any).soldCount ?? 0}
            </span>
          </div>
        </div>

        {/* MOBILE LAYOUT */}
        <div className="mt-auto flex flex-col gap-1 pt-1 md:hidden">
          <p className="font-bold text-sm text-primary-600 line-clamp-1">
            {product.priceType === "starting" && "Mulai "}
            {product.priceType === "range" && product.priceMin
              ? `Rp${product.priceMin.toLocaleString("id-ID")} - Rp${(product.priceMax || product.price).toLocaleString("id-ID")}`
              : `Rp${product.price.toLocaleString("id-ID")}`}
          </p>
          
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <PartialStarRating rating={rating} size={10} />
            <span>{rating.toFixed(1)}</span>
            <span className="text-[8px]">•</span>
            <span>{displaySoldCount} {product.type === "jasa" ? "dipesan" : "terjual"}</span>
          </div>

          <span className="text-[10px] text-muted-foreground truncate mt-0.5">
            {product.location.split(",")[0] || product.seller?.name}
          </span>
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
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatar} />
            <AvatarFallback className="bg-primary-100 text-primary-700">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate">{user.name}</h3>
              {user.isVerified && (
                <Badge
                  variant="outline"
                  className="text-xs border-primary-500 text-primary-600"
                >
                  Terverifikasi
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {user.email}
            </p>
            {user.faculty && (
              <p className="text-xs text-muted-foreground mt-1">
                {user.faculty}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="text-center">
            <p className="font-bold text-lg">
              {user.rating ? user.rating.toFixed(1) : "-"}
            </p>
            <p className="text-xs text-muted-foreground">Rating</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-lg">{user.reviewCount || 0}</p>
            <p className="text-xs text-muted-foreground">Ulasan</p>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full mt-4"
          onClick={() => onNavigate("profile", user.id)}
        >
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
      <p className="text-sm text-muted-foreground">
        Coba kata kunci lain untuk menemukan {type}
      </p>
    </div>
  );
}
