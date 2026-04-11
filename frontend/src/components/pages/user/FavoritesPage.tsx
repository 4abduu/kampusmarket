"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart } from "lucide-react";
import type { NavigationData } from "@/app/navigation/types";
import FavoriteProductCard from "@/components/pages/user/favorites/FavoriteProductCard";
import FavoritesFilterBar from "@/components/pages/user/favorites/FavoritesFilterBar";
import FavoritesHeader from "@/components/pages/user/favorites/FavoritesHeader";
import { getSavings } from "@/components/pages/user/favorites/favorites.helpers";
import { INITIAL_FAVORITES } from "@/components/pages/user/favorites/favorites.mock";
import type { Favorite, Product } from "@/components/pages/user/favorites/favorites.types";

interface FavoritesPageProps {
  onNavigate: (page: string, data?: string | NavigationData) => void;
}

export default function FavoritesPage({ onNavigate }: FavoritesPageProps) {
  const [favorites, setFavorites] = useState<Favorite[]>(INITIAL_FAVORITES);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "barang" | "jasa">("all");
  const [sortBy, setSortBy] = useState<"terbaru" | "termurah" | "termahal" | "rating" | "terpopuler">("terbaru");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const products = useMemo(
    () => favorites.map((favorite) => favorite.product).filter(Boolean) as Product[],
    [favorites],
  );

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const items = products.filter((product) => {
      const matchType = typeFilter === "all" || product.type === typeFilter;
      const matchQuery =
        query === "" ||
        product.title.toLowerCase().includes(query) ||
        product.category?.name.toLowerCase().includes(query) ||
        product.seller?.name.toLowerCase().includes(query);
      return matchType && matchQuery;
    });

    items.sort((a, b) => {
      switch (sortBy) {
        case "termurah":
          return a.price - b.price;
        case "termahal":
          return b.price - a.price;
        case "rating":
          return b.rating - a.rating;
        case "terpopuler":
          return b.views - a.views;
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return items;
  }, [products, searchQuery, sortBy, typeFilter]);

  const stats = useMemo(() => {
    const totalItems = products.length;
    const totalValue = products.reduce((sum, product) => sum + product.price, 0);
    const totalSavings = products.reduce((sum, product) => sum + getSavings(product), 0);
    const avgRating = totalItems > 0
      ? products.reduce((sum, product) => sum + product.rating, 0) / totalItems
      : 0;

    return { totalItems, totalValue, totalSavings, avgRating };
  }, [products]);

  const handleRemove = (productUuid: string) => {
    setFavorites((prev) => prev.filter((favorite) => favorite.product?.uuid !== productUuid));
  };

  const handleRestore = () => setFavorites(INITIAL_FAVORITES);

  const handleReset = () => {
    setSearchQuery("");
    setTypeFilter("all");
    setSortBy("terbaru");
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-950/50">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <FavoritesHeader stats={stats} />

        <FavoritesFilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        {filtered.length > 0 ? (
          <div className={viewMode === "grid" ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-3" : "space-y-4"}>
            {filtered.map((product) => (
              <FavoriteProductCard
                key={product.uuid}
                product={product}
                viewMode={viewMode}
                onRemove={handleRemove}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-slate-300 bg-white/80 dark:border-slate-700 dark:bg-slate-950/60">
            <CardContent className="flex flex-col items-center px-6 py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                <Heart className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Belum ada item yang cocok</h2>
              <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
                Coba ubah kata kunci atau filter. Kalau favorit sudah kosong, mulai lagi dari katalog.
              </p>
              <div className="mt-5 flex gap-2">
                <Button variant="outline" size="sm" onClick={handleReset}>Reset Filter</Button>
                <Button size="sm" className="bg-primary-600 hover:bg-primary-700" onClick={handleRestore}>Pulihkan Contoh</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
