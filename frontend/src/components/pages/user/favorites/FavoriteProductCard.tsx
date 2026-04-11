import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Clock,
  Handshake,
  MapPin,
  Package,
  Star,
  Store,
  Trash2,
  Truck,
  Wifi,
} from "lucide-react";
import type { ReactNode } from "react";
import {
  availabilityMap,
  centToRupiah,
  getDurationLabel,
  getInitials,
  getPriceLabel,
  getPrimaryImage,
  getSavings,
} from "@/components/pages/user/favorites/favorites.helpers";
import type { Product } from "@/components/pages/user/favorites/favorites.types";
import type { NavigationData } from "@/app/navigation/types";

interface FavoriteProductCardProps {
  product: Product;
  viewMode: "grid" | "list";
  onRemove: (productUuid: string) => void;
  onNavigate: (page: string, data?: string | NavigationData) => void;
}

export default function FavoriteProductCard({ product, viewMode, onRemove, onNavigate }: FavoriteProductCardProps) {
  const savings = getSavings(product);
  const detailPage = product.type === "jasa" ? "service" : "product";

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5 text-amber-500">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3.5 w-3.5 ${
            star <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "text-slate-200 dark:text-slate-700"
          }`}
        />
      ))}
      <span className="ml-1 text-xs font-medium text-slate-500 dark:text-slate-400">{rating.toFixed(1)}</span>
    </div>
  );

  const renderProductBadges = () => {
    const badges: ReactNode[] = [];

    if (product.type === "barang" && product.condition) {
      badges.push(
        <Badge key="cond" variant="outline" className="border-slate-200 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-400">
          {product.condition === "baru" ? "Baru" : "Bekas"}
        </Badge>,
      );
    }

    if (product.type === "barang" && product.stock <= 3 && product.stock > 0) {
      badges.push(
        <Badge key="stock" variant="outline" className="border-amber-200 text-xs text-amber-700 dark:border-amber-800 dark:text-amber-400">
          Sisa {product.stock}
        </Badge>,
      );
    }

    if (product.type === "jasa" && product.availability_status) {
      const availability = availabilityMap[product.availability_status];
      badges.push(
        <Badge key="avail" className={`text-xs ${availability.cls}`}>
          {availability.label}
        </Badge>,
      );
    }

    return badges.length > 0 ? <div className="flex flex-wrap gap-1.5">{badges}</div> : null;
  };

  const renderModeBadges = () => {
    const badges: ReactNode[] = [];

    if (product.can_nego) {
      badges.push(
        <span key="nego" className="inline-flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400">
          <Handshake className="h-3 w-3" />Nego
        </span>,
      );
    }
    if (product.is_cod) {
      badges.push(
        <span key="cod" className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-400">COD</span>,
      );
    }
    if (product.is_pickup) {
      badges.push(
        <span key="pickup" className="inline-flex items-center gap-1 text-xs text-slate-500">
          <Store className="h-3 w-3" />Pickup
        </span>,
      );
    }
    if (product.is_delivery) {
      badges.push(
        <span key="delivery" className="inline-flex items-center gap-1 text-xs text-slate-500">
          <Truck className="h-3 w-3" />Antar
        </span>,
      );
    }
    if (product.is_online) {
      badges.push(
        <span key="online" className="inline-flex items-center gap-1 text-xs text-slate-500">
          <Wifi className="h-3 w-3" />Online
        </span>,
      );
    }
    if (product.is_onsite) {
      badges.push(
        <span key="onsite" className="inline-flex items-center gap-1 text-xs text-slate-500">
          <Store className="h-3 w-3" />On-site
        </span>,
      );
    }
    if (product.is_home_service) {
      badges.push(
        <span key="homesvc" className="inline-flex items-center gap-1 text-xs text-slate-500">
          <Truck className="h-3 w-3" />Home Service
        </span>,
      );
    }

    const durationLabel = getDurationLabel(product);
    if (durationLabel) {
      badges.push(
        <span key="dur" className="inline-flex items-center gap-1 text-xs text-slate-500">
          <Clock className="h-3 w-3" />{durationLabel}
        </span>,
      );
    }

    return badges.length > 0 ? <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">{badges}</div> : null;
  };

  if (viewMode === "list") {
    return (
      <Card className="group overflow-hidden border-slate-200/80 dark:border-slate-800">
        <div className="grid md:grid-cols-[240px_1fr]">
          <div className="relative h-48 bg-slate-100 md:h-auto dark:bg-slate-800">
            {product.type === "jasa" ? (
              <div className="h-full w-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                <Briefcase className="h-14 w-14 text-emerald-600/70" />
              </div>
            ) : (
              <div className="h-full w-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Package className="h-14 w-14 text-muted-foreground/30" />
              </div>
            )}
            <div className="absolute left-3 top-3 flex flex-col gap-1.5">
              <Badge className="w-fit bg-slate-900/80 text-xs text-white hover:bg-slate-900/80">{product.type === "jasa" ? "Jasa" : "Barang"}</Badge>
              {savings > 0 && <Badge className="w-fit bg-emerald-500 text-xs text-white hover:bg-emerald-500">-{centToRupiah(savings)}</Badge>}
            </div>
          </div>

          <CardContent className="flex flex-col justify-between gap-4 p-5">
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">Disimpan</p>
                  <h3 className="mt-0.5 text-lg font-semibold leading-snug text-slate-900 dark:text-slate-50">{product.title}</h3>
                </div>
                <Button variant="ghost" size="icon" onClick={() => onRemove(product.uuid)} className="shrink-0 text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/30">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                {product.category && <span>{product.category.name}</span>}
                <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{product.location}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {renderStars(product.rating)}
                {renderProductBadges()}
              </div>

              {renderModeBadges()}

              <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{product.description}</p>
            </div>

            <div className="flex flex-col gap-4 border-t border-slate-100 pt-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-50">{getPriceLabel(product)}</p>
                {product.original_price && (
                  <p className="mt-0.5 flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="line-through">{centToRupiah(product.original_price)}</span>
                    <span>·</span><span>{product.review_count} ulasan</span>
                    <span>·</span><span>{product.views} dilihat</span>
                    {product.sold_count > 0 && <><span>·</span><span>{product.sold_count} terjual</span></>}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onNavigate(detailPage, product.uuid)} className="gap-1.5">
                  Detail <ArrowRight className="h-3.5 w-3.5" />
                </Button>
                {product.seller && (
                  <Button size="sm" onClick={() => onNavigate("profile", { userId: product.seller!.uuid })} className="bg-primary-600 hover:bg-primary-700">
                    Penjual
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  return (
    <Card className="group overflow-hidden border-slate-200/80 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg dark:border-slate-800">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
        {product.type === "jasa" ? (
          <div className="h-full w-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
            <Briefcase className="h-14 w-14 text-emerald-600/70" />
          </div>
        ) : (
          <div className="h-full w-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Package className="h-14 w-14 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5">
          <Badge className="w-fit bg-slate-900/80 text-[11px] text-white hover:bg-slate-900/80">{product.type === "jasa" ? "Jasa" : "Barang"}</Badge>
          {savings > 0 && <Badge className="w-fit bg-emerald-500 text-[11px] text-white hover:bg-emerald-500">-{centToRupiah(savings)}</Badge>}
        </div>
        <Button variant="ghost" size="icon" onClick={() => onRemove(product.uuid)} className="absolute right-2.5 top-2.5 h-8 w-8 rounded-full bg-white/90 text-slate-400 shadow-sm backdrop-blur-sm hover:bg-white hover:text-rose-500 dark:bg-slate-950/70 dark:hover:bg-slate-950">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      <CardContent className="space-y-2.5 p-4">
        <div className="space-y-1">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900 dark:text-slate-50">{product.title}</h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{product.location}</span>
            {product.category && <><span className="text-slate-300 dark:text-slate-600">·</span><span>{product.category.name}</span></>}
          </div>
        </div>

        {renderStars(product.rating)}
        {renderProductBadges()}
        {renderModeBadges()}

        <div>
          <p className="text-base font-bold text-slate-900 dark:text-slate-50">{getPriceLabel(product)}</p>
          {product.original_price && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              <span className="line-through">{centToRupiah(product.original_price)}</span>
              <span className="ml-1.5">{product.review_count} ulasan</span>
              {product.sold_count > 0 && <><span className="ml-1 text-slate-300 dark:text-slate-600">·</span><span>{product.sold_count} terjual</span></>}
            </p>
          )}
        </div>

        {product.seller && (
          <div className="flex items-center gap-2.5 border-t border-slate-100 pt-2.5 dark:border-slate-800">
            <Avatar className="h-7 w-7">
              {product.seller.avatar && <AvatarImage src={product.seller.avatar} alt={product.seller.name} />}
              <AvatarFallback className="bg-primary-100 text-[10px] font-medium text-primary-700 dark:bg-primary-900/40 dark:text-primary-400">
                {getInitials(product.seller.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-slate-700 dark:text-slate-300">
                {product.seller.name}
                {product.seller.is_verified && <BadgeCheck className="ml-1 inline h-3.5 w-3.5 text-primary-500" />}
              </p>
              {product.seller.faculty && (
                <p className="truncate text-[10px] text-muted-foreground">{product.seller.faculty.icon} {product.seller.faculty.name}</p>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => onNavigate(detailPage, product.uuid)}>Detail</Button>
          {product.seller && (
            <Button size="sm" className="flex-1 bg-primary-600 text-xs hover:bg-primary-700" onClick={() => onNavigate("profile", { userId: product.seller!.uuid })}>Penjual</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
