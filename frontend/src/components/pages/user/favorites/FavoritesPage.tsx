"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart } from "lucide-react";
import type { NavigationData } from "@/app/navigation/types";
import FavoriteProductCard from "@/components/pages/user/favorites/FavoriteProductCard";
import FavoritesFilterBar from "@/components/pages/user/favorites/FavoritesFilterBar";
import FavoritesHeader from "@/components/pages/user/favorites/FavoritesHeader";
import { getSavings } from "@/components/pages/user/favorites/favorites.helpers";
import type { Product } from "@/components/pages/user/favorites/favorites.types";
import { getFavorites, removeFavorite } from "@/lib/api/products";
import { useFavoritesStore } from "@/lib/favorites-store";

interface FavoritesPageProps {
  onNavigate: (page: string, data?: string | NavigationData) => void;
}

export default function FavoritesPage({ onNavigate }: FavoritesPageProps) {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "barang" | "jasa">("all");
  const [sortBy, setSortBy] = useState<"terbaru" | "termurah" | "termahal" | "rating" | "terpopuler">("terbaru");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFavorites = async () => {
      setLoading(true);
      setError(null);
      try {
        const favoritesData = await getFavorites();
        setFavorites(favoritesData);
        void useFavoritesStore.getState().fetchCount();
      } catch (err: any) {
        console.error("[FavoritesPage] Failed to load favorites", err);
        setError(err?.message || "Gagal memuat favorit dari server.");
      } finally {
        setLoading(false);
      }
    };

    void loadFavorites();
  }, []);

  const products = useMemo(() => favorites, [favorites]);

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

  const handleRemove = async (productUuid: string) => {
    try {
      await removeFavorite(productUuid);
      setFavorites((prev) => prev.filter((product) => (product.uuid || product.id) !== productUuid));
      void useFavoritesStore.getState().fetchCount();
    } catch (err: any) {
      console.error("[FavoritesPage] Failed to remove favorite", err);
    }
  };

  const handleReset = () => {
    setSearchQuery("");
    setTypeFilter("all");
    setSortBy("terbaru");
  };

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-slate-50 dark:bg-slate-950/50">
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

        {loading ? (
          <Card className="border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-950/60">
            <CardContent className="flex flex-col items-center px-6 py-16 text-center">
              <p className="text-sm text-muted-foreground">Memuat favorit...</p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
            <CardContent className="px-6 py-16 text-center">
              <p className="text-sm font-semibold text-red-700 dark:text-red-300">Gagal memuat favorit</p>
              <p className="mt-2 text-sm text-red-600 dark:text-red-200">{error}</p>
              <div className="mt-5 flex justify-center">
                <Button size="sm" className="bg-primary-600 hover:bg-primary-700" onClick={() => void getFavorites().then(setFavorites).catch((err) => setError(err?.message || "Gagal memuat favorit")).finally(() => setLoading(false))}>
                  Coba lagi
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : filtered.length > 0 ? (
          <div className={viewMode === "grid" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-4" : "space-y-4"}>
            {filtered.map((product, index) => (
              <FavoriteProductCard
                key={product.uuid || index}
                product={product}
                viewMode={viewMode}
                onRemove={handleRemove}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <Card className="border-dashed border-slate-300 bg-white/80 dark:border-slate-700 dark:bg-slate-950/60">
            <CardContent className="flex flex-col items-center px-6 py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-900/50 dark:text-slate-500">
                <Heart className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Belum ada favorit</h2>
              <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
                Anda belum menambahkan produk atau jasa apa pun ke daftar favorit. Yuk mulai jelajahi katalog kami!
              </p>
              <div className="mt-5">
                <Button size="sm" className="bg-primary-600 hover:bg-primary-700" onClick={() => onNavigate("/")}>
                  Mulai Belanja
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed border-slate-300 bg-white/80 dark:border-slate-700 dark:bg-slate-950/60">
            <CardContent className="flex flex-col items-center px-6 py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-500">
                <Heart className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Pencarian Tidak Ditemukan</h2>
              <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
                Tidak ada favorit yang cocok dengan pencarian atau filter Anda. Coba kata kunci lain atau reset filter.
              </p>
              <div className="mt-5">
                <Button variant="outline" size="sm" onClick={handleReset}>Reset Filter</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
