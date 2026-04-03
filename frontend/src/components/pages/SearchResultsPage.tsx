"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Search,
  Package,
  Briefcase,
  Users,
  ArrowLeft,
  MapPin,
  Star,
  Clock,
  Filter,
  Grid,
  List,
  ChevronRight,
  User,
  ShoppingBag,
} from "lucide-react";
import { mockProducts, mockUsers, mockServices, Product, User as UserType, Service } from "@/lib/mock-data";

interface SearchResultsPageProps {
  onNavigate: (page: string, data?: string | { category?: string; searchQuery?: string }) => void;
  searchQuery?: string;
}

export default function SearchResultsPage({ onNavigate, searchQuery: propSearchQuery }: SearchResultsPageProps) {
  const [query, setQuery] = useState(propSearchQuery || "");
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Search results
  const results = useMemo(() => {
    const searchTerm = query.toLowerCase().trim();
    if (!searchTerm) {
      return { products: [], services: [], users: [], userProducts: [] };
    }

    // Search products (barang)
    const matchedProducts = mockProducts.filter(
      (p) =>
        p.type === "barang" &&
        (p.title.toLowerCase().includes(searchTerm) ||
          p.description.toLowerCase().includes(searchTerm) ||
          p.category.toLowerCase().includes(searchTerm) ||
          p.location.toLowerCase().includes(searchTerm))
    );

    // Search services (jasa)
    const matchedServices = mockProducts.filter(
      (p) =>
        p.type === "jasa" &&
        (p.title.toLowerCase().includes(searchTerm) ||
          p.description.toLowerCase().includes(searchTerm) ||
          p.category.toLowerCase().includes(searchTerm) ||
          p.location.toLowerCase().includes(searchTerm))
    );

    // Search users
    const matchedUsers = mockUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(searchTerm) ||
        u.email.toLowerCase().includes(searchTerm) ||
        (u.faculty && u.faculty.toLowerCase().includes(searchTerm))
    );

    // Get products from matched users
    const userIds = matchedUsers.map((u) => u.id);
    const userProducts = mockProducts.filter(
      (p) => userIds.includes(p.seller.id) && p.seller.name.toLowerCase().includes(searchTerm)
    );

    return {
      products: matchedProducts,
      services: matchedServices,
      users: matchedUsers,
      userProducts,
    };
  }, [query]);

  const totalResults = results.products.length + results.services.length + results.users.length;

  const handleSearch = () => {
    if (query.trim()) {
      // Trigger re-search
      setQuery(query.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 min-h-screen">
      <div className="container mx-auto px-4 py-6">
        {/* Search Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            className="mb-4 text-muted-foreground hover:text-foreground"
            onClick={() => onNavigate("landing")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Beranda
          </Button>

          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Cari produk, jasa, atau pengguna..."
                className="pl-10 pr-4 h-12 text-lg"
              />
            </div>
            <Button onClick={handleSearch} className="h-12 px-6">
              <Search className="h-4 w-4 mr-2" />
              Cari
            </Button>
          </div>
        </div>

        {/* Results Summary */}
        {query && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">
              Hasil Pencarian: <span className="text-primary-600">"{query}"</span>
            </h1>
            <p className="text-muted-foreground">
              Ditemukan {totalResults} hasil
              {results.products.length > 0 && ` (${results.products.length} produk)`}
              {results.services.length > 0 && ` (${results.services.length} jasa)`}
              {results.users.length > 0 && ` (${results.users.length} pengguna)`}
            </p>
          </div>
        )}

        {query && totalResults === 0 ? (
          // No Results
          <div className="text-center py-16">
            <Search className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Tidak ada hasil ditemukan</h2>
            <p className="text-muted-foreground mb-6">
              Coba kata kunci lain atau periksa ejaan
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="outline" className="cursor-pointer hover:bg-slate-100" onClick={() => setQuery("elektronik")}>
                Elektronik
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-slate-100" onClick={() => setQuery("buku")}>
                Buku
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-slate-100" onClick={() => setQuery("fotografi")}>
                Fotografi
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-slate-100" onClick={() => setQuery("les")}>
                Les
              </Badge>
            </div>
          </div>
        ) : query ? (
          // Results Tabs
          <Tabs value={activeTab} onValueChange={setActiveTab}>
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
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* All Results Tab */}
            <TabsContent value="all" className="space-y-8">
              {/* Users Section */}
              {results.users.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary-600" />
                      Pengguna
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary-600"
                      onClick={() => setActiveTab("users")}
                    >
                      Lihat Semua
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {results.users.slice(0, 3).map((user) => (
                      <UserCard key={user.id} user={user} onNavigate={onNavigate} />
                    ))}
                  </div>
                </section>
              )}

              {/* Products from matched users */}
              {results.userProducts.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <ShoppingBag className="h-5 w-5 text-blue-600" />
                      Dari Pengguna yang Ditemukan
                    </h2>
                  </div>
                  <div className={viewMode === "grid" 
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                    : "space-y-4"
                  }>
                    {results.userProducts.slice(0, 4).map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        viewMode={viewMode}
                        onNavigate={onNavigate}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Products Section */}
              {results.products.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <Package className="h-5 w-5 text-purple-600" />
                      Barang
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary-600"
                      onClick={() => setActiveTab("products")}
                    >
                      Lihat Semua
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                  <div className={viewMode === "grid" 
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                    : "space-y-4"
                  }>
                    {results.products.slice(0, 4).map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        viewMode={viewMode}
                        onNavigate={onNavigate}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Services Section */}
              {results.services.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-amber-600" />
                      Jasa
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary-600"
                      onClick={() => setActiveTab("services")}
                    >
                      Lihat Semua
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                  <div className={viewMode === "grid" 
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                    : "space-y-4"
                  }>
                    {results.services.slice(0, 4).map((service) => (
                      <ProductCard
                        key={service.id}
                        product={service}
                        viewMode={viewMode}
                        onNavigate={onNavigate}
                      />
                    ))}
                  </div>
                </section>
              )}
            </TabsContent>

            {/* Products Tab */}
            <TabsContent value="products">
              {results.products.length > 0 ? (
                <div className={viewMode === "grid" 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                  : "space-y-4"
                }>
                  {results.products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      viewMode={viewMode}
                      onNavigate={onNavigate}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState type="barang" />
              )}
            </TabsContent>

            {/* Services Tab */}
            <TabsContent value="services">
              {results.services.length > 0 ? (
                <div className={viewMode === "grid" 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                  : "space-y-4"
                }>
                  {results.services.map((service) => (
                    <ProductCard
                      key={service.id}
                      product={service}
                      viewMode={viewMode}
                      onNavigate={onNavigate}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState type="jasa" />
              )}
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users">
              {results.users.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.users.map((user) => (
                    <UserCard key={user.id} user={user} onNavigate={onNavigate} />
                  ))}
                </div>
              ) : (
                <EmptyState type="pengguna" />
              )}
            </TabsContent>
          </Tabs>
        ) : (
          // Initial state - no search yet
          <div className="text-center py-16">
            <Search className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Cari sesuatu</h2>
            <p className="text-muted-foreground mb-6">
              Ketik kata kunci untuk mencari produk, jasa, atau pengguna
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="outline" className="cursor-pointer hover:bg-slate-100" onClick={() => setQuery("elektronik")}>
                Elektronik
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-slate-100" onClick={() => setQuery("buku")}>
                Buku
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-slate-100" onClick={() => setQuery("fotografi")}>
                Fotografi
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-slate-100" onClick={() => setQuery("Adit")}>
                Adit
              </Badge>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Product Card Component
function ProductCard({
  product,
  viewMode,
  onNavigate,
}: {
  product: Product;
  viewMode: "grid" | "list";
  onNavigate: (page: string, data?: string) => void;
}) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (viewMode === "list") {
    return (
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => onNavigate(product.type === "jasa" ? "service" : "product", product.id)}
      >
        <CardContent className="p-4 flex gap-4">
          <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0">
            <Package className="h-8 w-8 text-muted-foreground/30" />
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
      <div className="aspect-square bg-slate-100 dark:bg-slate-800 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <Package className="h-12 w-12 text-muted-foreground/30" />
        </div>
        <Badge
          variant={product.type === "jasa" ? "secondary" : "default"}
          className="absolute top-2 left-2"
        >
          {product.type === "jasa" ? "Jasa" : "Barang"}
        </Badge>
        {product.originalPrice && (
          <Badge variant="destructive" className="absolute top-2 right-2">
            Diskon
          </Badge>
        )}
      </div>
      <CardContent className="p-3">
        <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary-600 transition-colors">
          {product.title}
        </h3>
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

// User Card Component
function UserCard({
  user,
  onNavigate,
}: {
  user: UserType;
  onNavigate: (page: string, data?: string) => void;
}) {
  // Get user's products count
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
                <Badge variant="outline" className="text-xs border-primary-500 text-primary-600">
                  Terverifikasi
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
            {user.faculty && (
              <p className="text-xs text-muted-foreground mt-1">{user.faculty}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="text-center">
            <p className="font-bold text-lg">{userProducts.length}</p>
            <p className="text-xs text-muted-foreground">Produk</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-lg">
              {userProducts.reduce((sum, p) => sum + p.soldCount, 0)}
            </p>
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
                  className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg flex-shrink-0 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-primary-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate(product.type === "jasa" ? "service" : "product", product.id);
                  }}
                >
                  <Package className="h-6 w-6 text-muted-foreground/30" />
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

        <Button
          variant="outline"
          className="w-full mt-4"
          onClick={() => onNavigate("chat")}
        >
          <User className="h-4 w-4 mr-2" />
          Lihat Profil
        </Button>
      </CardContent>
    </Card>
  );
}

// Empty State Component
function EmptyState({ type }: { type: string }) {
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
