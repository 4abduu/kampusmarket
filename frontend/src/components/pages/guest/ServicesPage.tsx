"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Search,
  SlidersHorizontal,
  Star,
  Briefcase,
  Grid,
  List,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  MapPin,
} from "lucide-react";
import { getCategories } from "@/lib/api/categories";
import { getProducts } from "@/lib/api/products";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ServicesFilterSidebar from "@/components/pages/guest/services/ServicesFilterSidebar";
import ProductImage from "@/components/common/ProductImage";
import { Skeleton } from "@/components/ui/skeleton";
import ServicesPageSkeleton from "@/components/skeleton/ServicesPageSkeleton";
import EmptyState from "@/components/shared/EmptyState";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ITEMS_PER_PAGE = 8;

interface ServicesPageProps {
  onNavigate: (page: string, serviceId?: string) => void;
  initialCategory?: string | null;
}

export default function ServicesPage({
  onNavigate,
  initialCategory,
}: ServicesPageProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    initialCategory ?? null,
  );
  const [priceRange, setPriceRange] = useState([0, 20000000]);
  const [sortBy, setSortBy] = useState("terbaru");
  const [currentPage, setCurrentPage] = useState(1);
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch services and categories from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("[ServicesPage] Fetching services and categories...");
        setLoading(true);
        setError(null);

        // Fetch categories
        const catsResponse = await getCategories({ type: "jasa" });
        if (catsResponse?.length) {
          setCategories(
            catsResponse.map((cat: any) => ({
              id: cat.id,
              name: cat.name,
              label: cat.name,
            })),
          );
        }

        // Fetch services (map sort option to backend params)
        const productParams: any = { type: "jasa", per_page: 100 };
        if (sortBy === "termurah") {
          productParams.sort_by = "price";
          productParams.sort_order = "asc";
        } else if (sortBy === "termahal") {
          productParams.sort_by = "price";
          productParams.sort_order = "desc";
        } else if (sortBy === "terpopuler") {
          productParams.sort_by = "popular";
          productParams.sort_order = "desc";
        } else {
          productParams.sort_by = "created_at";
          productParams.sort_order = "desc";
        }

        const response = await getProducts(productParams);
        console.log("[ServicesPage] API Response:", {
          response,
          dataStructure: Object.keys(response || {}),
        });
        if (response?.data?.length) {
          setServices(response.data);
          console.log("[ServicesPage] Services loaded:", response.data.length, {
            services: response.data,
          });
        } else {
          console.warn("[ServicesPage] No services data in response:", {
            response,
          });
          setServices([]);
        }
      } catch (err: any) {
        console.error("[ServicesPage] Error fetching data:", err);
        setError("Gagal memuat layanan jasa. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredServices = services.filter((service) => {
    if (selectedCategory) {
      const svcCat =
        // prefer common shapes returned from API
        service.category_id ??
        service.categoryId ??
        service.category?.id ??
        service.category;
      if (String(svcCat) !== String(selectedCategory)) return false;
    }

    const priceVal =
      service.price ?? service.price_min ?? service.priceMin ?? 0;
    if (priceVal > priceRange[1] || priceVal < priceRange[0]) return false;

    if (
      searchQuery &&
      !service.title?.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;

    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredServices.length / ITEMS_PER_PAGE);
  const paginatedServices = filteredServices.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // Ensure currentPage stays within valid bounds when filters or results change
  useEffect(() => {
    if (totalPages === 0) {
      if (currentPage !== 1) setCurrentPage(1);
      return;
    }

    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages]);

  const filterSidebarProps = {
    selectedCategory,
    setSelectedCategory: (cat: string | null) => {
      setSelectedCategory(cat);
      setCurrentPage(1);
    },
    priceRange,
    setPriceRange: (range: number[]) => {
      setPriceRange(range);
      setCurrentPage(1);
    },
    onResetFilters: () => {
      setSelectedCategory(null);
      setPriceRange([0, 20000000]);
      setSearchQuery("");
      setCurrentPage(1);
    },
    categories,
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Katalog Jasa</h1>
          <p className="text-muted-foreground">
            Temukan jasa profesional dari mahasiswa terdekat
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-72 shrink-0">
            <Card className="p-4 sticky top-20">
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-10 w-full mt-4" />
                </div>
              ) : (
                <ServicesFilterSidebar {...filterSidebarProps} />
              )}
            </Card>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Search & Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Cari jasa..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              <div className="flex gap-2">
                {/* Mobile Filter */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Filter</SheetTitle>
                      <SheetDescription>
                        Filter jasa sesuai kebutuhanmu
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6">
                      <ServicesFilterSidebar {...filterSidebarProps} />
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Sort */}
                <Select
                  value={sortBy}
                  onValueChange={(val) => {
                    setSortBy(val);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Urutkan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="terbaru">Terbaru</SelectItem>
                    <SelectItem value="terpopuler">Terpopuler</SelectItem>
                    <SelectItem value="termurah">Harga Terendah</SelectItem>
                    <SelectItem value="termahal">Harga Tertinggi</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode */}
                <div className="hidden sm:flex border rounded-lg">
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {selectedCategory && (
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary" className="gap-1">
                  {categories.find((c: any) => c.id === selectedCategory)?.name}
                  <button
                    onClick={() => setSelectedCategory(null)}
                    title="Hapus filter kategori jasa"
                    aria-label="Hapus filter kategori jasa"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              </div>
            )}

            {/* Results Count */}
            {!loading && !error && (
              <p className="text-sm text-muted-foreground mb-4">
                Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
                {Math.min(
                  currentPage * ITEMS_PER_PAGE,
                  filteredServices.length,
                )}{" "}
                dari {filteredServices.length} jasa
              </p>
            )}

            {/* Services Loading/Error/Empty */}
            {loading ? (
              <ServicesPageSkeleton
                itemCount={ITEMS_PER_PAGE}
                hideSidebar={true}
              />
            ) : error ? (
              <div className="space-y-3">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  Coba Lagi
                </Button>
              </div>
            ) : filteredServices.length === 0 ? (
              <EmptyState
                icon="package"
                title="Tidak ada layanan jasa"
                description="Tidak ada jasa yang sesuai dengan filter Anda. Coba ubah filter atau lihat semua layanan."
              />
            ) : (
              <>
                {/* Service Grid */}
                {viewMode === "grid" ? (
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {paginatedServices.map((service) => (
                      <Card
                        key={service.id}
                        className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group"
                        onClick={() => onNavigate("service", service.id)}
                      >
                        <div className="relative bg-muted h-40 flex items-center justify-center overflow-hidden">
                          <ProductImage
                            src={
                              service.images?.[0]?.url || service.images?.[0]
                            }
                            alt={service.title}
                            className="w-full h-full bg-muted flex items-center justify-center"
                            imageClassName="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            fallbackImageUrl="https://placehold.net/default.svg"
                          />
                        </div>
                        <CardContent className="p-4">
                          <Badge variant="outline" className="mb-2">
                            {service.category?.name || "Jasa"}
                          </Badge>
                          <p className="font-medium line-clamp-2 mb-2 group-hover:text-primary-600 transition-colors">
                            {service.title}
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {service.description}
                          </p>
                          <div className="flex items-center gap-1 mb-3">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">
                              {service.rating || 0}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-primary-600">
                              Rp{" "}
                              {(
                                service.price ||
                                service.price_min ||
                                0
                              ).toLocaleString("id-ID")}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-3">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs bg-primary-100 text-primary-700">
                                {service.seller?.name
                                  ?.split(" ")
                                  .map((n: string) => n[0])
                                  .join("") || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">
                              {service.seller?.name || "Unknown"}
                            </span>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                              <MapPin className="h-3 w-3" />
                              {service.location || "-"}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  // List View
                  <div className="space-y-4">
                    {paginatedServices.map((service) => (
                      <Card
                        key={service.id}
                        className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group"
                        onClick={() => onNavigate("service", service.id)}
                      >
                        <div className="flex">
                          <div className="relative bg-muted w-48 shrink-0 flex items-center justify-center overflow-hidden">
                            <ProductImage
                              src={
                                service.images?.[0]?.url || service.images?.[0]
                              }
                              alt={service.title}
                              className="w-full h-full bg-muted flex items-center justify-center"
                              imageClassName="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              fallbackImageUrl="https://placehold.net/default.svg"
                            />
                          </div>
                          <CardContent className="flex-1 p-4">
                            <div className="flex justify-between">
                              <div>
                                <Badge variant="outline" className="mb-1">
                                  {service.category?.name || "Jasa"}
                                </Badge>
                                <p className="font-medium mb-1 group-hover:text-primary-600 transition-colors">
                                  {service.title}
                                </p>
                                <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                                  {service.description}
                                </p>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    <span>{service.rating || 0}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    {service.location || "-"}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xl font-bold text-primary-600">
                                  Rp{" "}
                                  {(
                                    service.price ||
                                    service.price_min ||
                                    0
                                  ).toLocaleString("id-ID")}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="icon"
                          onClick={() => setCurrentPage(page)}
                          className={
                            currentPage === page
                              ? "bg-primary-600 hover:bg-primary-700"
                              : ""
                          }
                        >
                          {page}
                        </Button>
                      ),
                    )}

                    <Button
                      variant="outline"
                      size="icon"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
