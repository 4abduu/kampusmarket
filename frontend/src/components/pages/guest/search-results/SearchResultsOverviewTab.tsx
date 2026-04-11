import { Button } from "@/components/ui/button";
import { Briefcase, ChevronRight, Package, ShoppingBag, Users } from "lucide-react";
import { SearchProductCard, SearchUserCard } from "@/components/pages/guest/search-results/SearchResultCards";
import type { SearchNavigateFn, SearchResultsPayload, SearchViewMode } from "@/components/pages/guest/search-results/searchResults.types";

interface SearchResultsOverviewTabProps {
  results: SearchResultsPayload;
  viewMode: SearchViewMode;
  setActiveTab: (tab: "products" | "services" | "users") => void;
  onNavigate: SearchNavigateFn;
}

export default function SearchResultsOverviewTab({
  results,
  viewMode,
  setActiveTab,
  onNavigate,
}: SearchResultsOverviewTabProps) {
  return (
    <div className="space-y-8">
      {results.users.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary-600" />
              Pengguna
            </h2>
            <Button variant="ghost" size="sm" className="text-primary-600" onClick={() => setActiveTab("users")}>
              Lihat Semua
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.users.slice(0, 3).map((user) => (
              <SearchUserCard key={user.id} user={user} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}

      {results.userProducts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-blue-600" />
              Dari Pengguna yang Ditemukan
            </h2>
          </div>
          <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" : "space-y-4"}>
            {results.userProducts.slice(0, 4).map((product) => (
              <SearchProductCard key={product.id} product={product} viewMode={viewMode} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}

      {results.products.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Package className="h-5 w-5 text-purple-600" />
              Barang
            </h2>
            <Button variant="ghost" size="sm" className="text-primary-600" onClick={() => setActiveTab("products")}>
              Lihat Semua
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" : "space-y-4"}>
            {results.products.slice(0, 4).map((product) => (
              <SearchProductCard key={product.id} product={product} viewMode={viewMode} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}

      {results.services.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-amber-600" />
              Jasa
            </h2>
            <Button variant="ghost" size="sm" className="text-primary-600" onClick={() => setActiveTab("services")}>
              Lihat Semua
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" : "space-y-4"}>
            {results.services.slice(0, 4).map((service) => (
              <SearchProductCard key={service.id} product={service} viewMode={viewMode} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
