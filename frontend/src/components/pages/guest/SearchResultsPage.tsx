"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Briefcase,
  Grid,
  List,
  Package,
  Users,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { mockProducts, mockUsers } from "@/lib/mock-data";
import {
  SearchEmptyState,
  SearchProductCard,
  SearchUserCard,
} from "@/components/pages/guest/search-results/SearchResultCards";
import SearchResultsOverviewTab from "@/components/pages/guest/search-results/SearchResultsOverviewTab";
import SearchResultsPrompts from "@/components/pages/guest/search-results/SearchResultsPrompts";
import type {
  SearchNavigateFn,
  SearchResultsPayload,
  SearchTab,
  SearchViewMode,
} from "@/components/pages/guest/search-results/searchResults.types";

interface SearchResultsPageProps {
  onNavigate: SearchNavigateFn;
}

export default function SearchResultsPage({ onNavigate }: SearchResultsPageProps) {
  const [searchParams] = useSearchParams();
  const query = (searchParams.get("q") || "").trim();
  const [activeTab, setActiveTab] = useState<SearchTab>("all");
  const [viewMode, setViewMode] = useState<SearchViewMode>("grid");

  useEffect(() => {
    setActiveTab("all");
  }, [query]);

  const results = useMemo<SearchResultsPayload>(() => {
    const searchTerm = query.toLowerCase().trim();
    if (!searchTerm) {
      return { products: [], services: [], users: [], userProducts: [] };
    }

    const matchedProducts = mockProducts.filter(
      (p) =>
        p.type === "barang" &&
        (p.title.toLowerCase().includes(searchTerm) ||
          p.description.toLowerCase().includes(searchTerm) ||
          p.category.toLowerCase().includes(searchTerm) ||
          p.location.toLowerCase().includes(searchTerm)),
    );

    const matchedServices = mockProducts.filter(
      (p) =>
        p.type === "jasa" &&
        (p.title.toLowerCase().includes(searchTerm) ||
          p.description.toLowerCase().includes(searchTerm) ||
          p.category.toLowerCase().includes(searchTerm) ||
          p.location.toLowerCase().includes(searchTerm)),
    );

    const matchedUsers = mockUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(searchTerm) ||
        u.email.toLowerCase().includes(searchTerm) ||
        (u.faculty && u.faculty.toLowerCase().includes(searchTerm)),
    );

    const userIds = matchedUsers.map((u) => u.id);
    const userProducts = mockProducts.filter(
      (p) => userIds.includes(p.seller.id) && p.seller.name.toLowerCase().includes(searchTerm),
    );

    return {
      products: matchedProducts,
      services: matchedServices,
      users: matchedUsers,
      userProducts,
    };
  }, [query]);

  const totalResults = results.products.length + results.services.length + results.users.length;

  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 rounded-xl border bg-background p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Pencarian KampusMarket</p>
              <h1 className="text-xl sm:text-2xl font-bold">
                {query ? (
                  <>
                    Hasil untuk <span className="text-primary-600">"{query}"</span>
                  </>
                ) : (
                  "Cari Produk, Jasa, dan Pengguna"
                )}
              </h1>
            </div>
            <Button variant="outline" onClick={() => onNavigate("landing")}>Kembali ke Beranda</Button>
          </div>
        </div>

        {query && (
          <div className="mb-6">
            <p className="text-muted-foreground">
              Ditemukan {totalResults} hasil
              {results.products.length > 0 && ` (${results.products.length} produk)`}
              {results.services.length > 0 && ` (${results.services.length} jasa)`}
              {results.users.length > 0 && ` (${results.users.length} pengguna)`}
            </p>
          </div>
        )}

        {query && totalResults === 0 ? (
          <SearchResultsPrompts mode="empty" onSelectPrompt={(prompt) => onNavigate("search", { searchQuery: prompt })} />
        ) : query ? (
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as SearchTab)}>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <TabsList>
                <TabsTrigger value="all" className="gap-2">
                  <Grid className="h-4 w-4" />
                  Semua ({totalResults})
                </TabsTrigger>
                <TabsTrigger value="products" className="gap-2">
                  <Package className="h-4 w-4" />
                  Barang ({results.products.length})
                </TabsTrigger>
                <TabsTrigger value="services" className="gap-2">
                  <Briefcase className="h-4 w-4" />
                  Jasa ({results.services.length})
                </TabsTrigger>
                <TabsTrigger value="users" className="gap-2">
                  <Users className="h-4 w-4" />
                  Pengguna ({results.users.length})
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <Button variant={viewMode === "grid" ? "default" : "outline"} size="icon" onClick={() => setViewMode("grid")}>
                  <Grid className="h-4 w-4" />
                </Button>
                <Button variant={viewMode === "list" ? "default" : "outline"} size="icon" onClick={() => setViewMode("list")}>
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <TabsContent value="all">
              <SearchResultsOverviewTab
                results={results}
                viewMode={viewMode}
                onNavigate={onNavigate}
                setActiveTab={setActiveTab}
              />
            </TabsContent>

            <TabsContent value="products">
              {results.products.length > 0 ? (
                <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" : "space-y-4"}>
                  {results.products.map((product) => (
                    <SearchProductCard key={product.id} product={product} viewMode={viewMode} onNavigate={onNavigate} />
                  ))}
                </div>
              ) : (
                <SearchEmptyState type="barang" />
              )}
            </TabsContent>

            <TabsContent value="services">
              {results.services.length > 0 ? (
                <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" : "space-y-4"}>
                  {results.services.map((service) => (
                    <SearchProductCard key={service.id} product={service} viewMode={viewMode} onNavigate={onNavigate} />
                  ))}
                </div>
              ) : (
                <SearchEmptyState type="jasa" />
              )}
            </TabsContent>

            <TabsContent value="users">
              {results.users.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.users.map((user) => (
                    <SearchUserCard key={user.id} user={user} onNavigate={onNavigate} />
                  ))}
                </div>
              ) : (
                <SearchEmptyState type="pengguna" />
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <SearchResultsPrompts mode="initial" onSelectPrompt={(prompt) => onNavigate("search", { searchQuery: prompt })} />
        )}
      </div>
    </div>
  );
}
