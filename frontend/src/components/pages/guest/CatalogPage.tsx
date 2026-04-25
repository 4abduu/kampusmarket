"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categoriesApi } from "@/lib/api/categories";
import { getProducts } from "@/lib/api/products";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  SlidersHorizontal,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Star,
  X,
  AlertCircle,
} from "lucide-react";
import CatalogPageSkeleton from "@/components/skeleton/CatalogPageSkeleton";
import CatalogFilterSidebar from "@/components/pages/guest/catalog/CatalogFilterSidebar";
import ProductImage from "@/components/common/ProductImage";
import EmptyState from "@/components/shared/EmptyState";

interface Product {
  uuid: string;
  id?: string;
  title: string;
  description?: string;
  price: number;
  originalPrice?: number;
  images?: { url: string }[] | string[];
  condition?: string;
  canNego: boolean;
  rating: number;
  reviewCount: number;
  location: string;
  seller: { name: string };
  category?: string;
  categoryId?: string;
  type?: string;
}

interface Category {
  id: string;
  label: string;
  slug?: string;
}

const ITEMS_PER_PAGE = 12;

export default function CatalogPage({
  onNavigate,
  initialCategory,
}: {
  onNavigate: (action: string, id?: string) => void;
  isLoggedIn?: boolean;
  initialCategory?: string;
}) {
  console.log("CATALOG PAGE LOADED");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    initialCategory || null,
  );
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number[]>([0, 20000000]);
  const [tempPrice, setTempPrice] = useState<number[]>([0, 20000000]);
  const [sortBy, setSortBy] = useState("terbaru");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);

  // Fetch products (real API)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params: any = { page: currentPage, per_page: ITEMS_PER_PAGE, type: "barang" };
        console.log("PARAMS:", params);
        const res = await getProducts(params);
        console.log("RESPONSE:", res);
        const items = (res as any)?.data ?? (res as any) ?? [];
        setProducts(items as Product[]);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat produk. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage]);

  // Fetch categories from API (use same endpoint as LandingPage - "barang" type only)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoriesApi.getCategoriesByType("barang");
        if (res?.length) {
          // Filter to ensure only barang type + map to local format
          const mappedCategories = res
            .filter((cat: any) => cat.type === "barang")
            .map((cat: any) => ({
              id: cat.id,
              label: cat.name,
              slug: cat.slug,
            }));

          // Ensure "kecantikan" category exists (add if missing)
          const hasKecantikan = mappedCategories.some(
            (cat) => cat.slug === "kecantikan"
          );

          if (!hasKecantikan) {
            mappedCategories.push({
              id: "kecantikan",
              label: "Kecantikan",
              slug: "kecantikan",
            });
          }

          // Sort categories by consistent order
          const order = [
            "elektronik",
            "buku",
            "fashion",
            "furniture",
            "olahraga",
            "kecantikan",
            "kendaraan",
            "lainnya",
          ];

          mappedCategories.sort((a, b) => {
            const indexA = order.indexOf(a.slug);
            const indexB = order.indexOf(b.slug);
            return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
          });

          setCategories(mappedCategories);
        }
      } catch (err) {
        console.error("[CatalogPage] Error fetching categories:", err);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    console.log("CATEGORIES:", categories);
  }, [categories]);

  // Note: keep `products` as the source of truth from API.
  // Filtering/sorting is applied in `filteredProducts` below (do not overwrite `products`).

  console.log("PRODUCTS STATE:", products);

  // Filter only barang (products), exclude jasa (services)
  const onlyBarang = products.filter((p) => p.type === "barang");

  const filteredProducts = onlyBarang
    .filter((p) =>
      !selectedCategory
        ? true
        : p.categoryId === selectedCategory || p.category === selectedCategory
    )
    .filter((product) => {
      const matchesSearch = product.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCondition =
        !product.condition || selectedConditions.length === 0 ||
        selectedConditions.includes(product.condition);
      const matchesPrice =
        product.price >= priceRange[0] && product.price <= priceRange[1];

      return matchesSearch && matchesCondition && matchesPrice;
    });

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages]);

  const handleConditionChange = (condition: string, checked: boolean) => {
    if (checked) {
      setSelectedConditions([...selectedConditions, condition]);
    } else {
      setSelectedConditions(selectedConditions.filter((c) => c !== condition));
    }
    setCurrentPage(1);
  };

  const filterSidebarProps = {
    selectedCategory,
    setSelectedCategory: (cat: string | null) => {
      setSelectedCategory(cat);
      setCurrentPage(1);
    },
    selectedConditions,
    handleConditionChange,
    tempPrice,
    setTempPrice: (range: number[]) => {
      setTempPrice(range);
      // NOTE: do NOT trigger fetch here; only update visual temp value
    },
    priceRange,
    setPriceRange: (range: number[]) => {
      setPriceRange(range);
      setCurrentPage(1);
    },
    onResetFilters: () => {
      setSelectedCategory(null);
      setSelectedConditions([]);
      setPriceRange([0, 20000000]);
      setTempPrice([0, 20000000]);
      setSearchQuery("");
      setCurrentPage(1);
    },
    categories,
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getProductImageUrl = (image: any): string | undefined => {
    if (!image) return undefined;
    if (typeof image === "string") return image;
    if (typeof image === "object" && image.url) return image.url;
    return undefined;
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Katalog Barang</h1>
          <p className="text-muted-foreground">
            Temukan barang bekas berkualitas dari mahasiswa terdekat
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
                <CatalogFilterSidebar {...filterSidebarProps} />
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
                  placeholder="Cari barang..."
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
                        Filter produk sesuai kebutuhanmu
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6">
                      <CatalogFilterSidebar {...filterSidebarProps} />
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
            {(selectedCategory || selectedConditions.length > 0) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedCategory && (
                  <Badge variant="secondary" className="gap-1">
                    {categories.find((c) => c.id === selectedCategory)?.label}
                    <button
                      onClick={() => setSelectedCategory(null)}
                      aria-label="Hapus filter kategori"
                      title="Hapus filter kategori"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {selectedConditions.map((condition) => (
                  <Badge key={condition} variant="secondary" className="gap-1">
                    {condition === "baru" ? "Baru" : "Bekas"}
                    <button
                      onClick={() => handleConditionChange(condition, false)}
                      aria-label={`Hapus filter kondisi ${condition}`}
                      title={`Hapus filter kondisi ${condition}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Products Loading/Error/Empty */}
            {loading && paginatedProducts.length === 0 ? (
              <CatalogPageSkeleton
                itemCount={ITEMS_PER_PAGE}
                hideSidebar={true}
              />
            ) : error ? (
              <div className="space-y-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
                <div>
                  <Button onClick={() => window.location.reload()}>
                    Coba Lagi
                  </Button>
                </div>
              </div>
            ) : paginatedProducts.length === 0 ? (
              <EmptyState
                icon="search"
                title="Tidak ada barang ditemukan"
                description="Coba ubah filter atau kata kunci pencarian"
                actionLabel="Reset Filter"
                onAction={() => {
                  setSelectedCategory(null);
                  setSelectedConditions([]);
                  setPriceRange([0, 20000000]);
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
              />
            ) : (
              <>
                <div className="relative">
                  {loading && paginatedProducts.length > 0 && (
                    <div className="absolute right-4 top-4 z-10 pointer-events-none">
                      <span className="inline-flex items-center gap-2 rounded bg-black/50 text-white text-xs px-2 py-1">
                        Memuat...
                      </span>
                    </div>
                  )}
                  {/* Product Grid */}
                  {viewMode === "grid" ? (
                    <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                      {paginatedProducts.map((product) => (
                        <Card
                          key={product.uuid}
                          className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group"
                          onClick={() => onNavigate("product", product.uuid)}
                        >
                          <div className="relative bg-muted h-48 flex items-center justify-center overflow-hidden">
                            <ProductImage
                              src={getProductImageUrl(product.images?.[0])}
                              alt={product.title}
                              className="w-full h-full bg-muted flex items-center justify-center"
                              imageClassName="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              fallbackImageUrl="https://placehold.net/default.svg"
                            />
                            {product.originalPrice && (
                              <Badge className="absolute top-2 left-2 bg-red-500">
                                -
                                {Math.round(
                                  (1 - product.price / product.originalPrice) *
                                    100,
                                )}
                                %
                              </Badge>
                            )}
                            {product.condition === "baru" && (
                              <Badge className="absolute top-2 right-2 bg-primary-500">
                                Baru
                              </Badge>
                            )}
                          </div>
                          <CardContent className="p-4">
                            <p className="font-medium line-clamp-2 mb-2 group-hover:text-primary-600 transition-colors">
                              {product.title}
                            </p>
                            <div className="flex items-center gap-1 mb-2">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium">
                                {product.rating}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                ({product.reviewCount || 0} ulasan)
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg font-bold text-primary">
                                {formatPrice(product.price)}
                              </span>
                              {product.originalPrice && (
                                <span className="text-sm text-muted-foreground line-through">
                                  {formatPrice(product.originalPrice)}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-5 w-5">
                                  <AvatarFallback className="text-xs">
                                    {product.seller.name
                                      .substring(0, 2)
                                      .toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs font-medium truncate">
                                  {product.seller.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                {product.location}
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
                  ) : (
                    // List View
                    <div className="space-y-4">
                      {paginatedProducts.map((product) => (
                        <Card
                          key={product.uuid}
                          className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group"
                          onClick={() => onNavigate("product", product.uuid)}
                        >
                          <div className="flex">
                            <div className="relative bg-muted w-48 shrink-0 flex items-center justify-center overflow-hidden">
                              <ProductImage
                                src={getProductImageUrl(product.images?.[0])}
                                alt={product.title}
                                className="w-full h-full bg-muted flex items-center justify-center"
                                imageClassName="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                fallbackImageUrl="https://placehold.net/default.svg"
                              />
                              {product.condition === "baru" && (
                                <Badge className="absolute top-2 left-2 bg-primary">
                                  Baru
                                </Badge>
                              )}
                            </div>
                            <CardContent className="flex-1 p-4">
                              <div className="flex justify-between">
                                <div className="flex-1">
                                  <p className="font-medium mb-1 group-hover:text-primary transition-colors">
                                    {product.title}
                                  </p>
                                  <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                                    {product.description ||
                                      `${product.type === "jasa" ? "Layanan" : "Produk"} dari ${product.seller?.name || "Penjual"}`}
                                  </p>
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                      <span>{product.rating}</span>
                                    </div>
                                    <span>
                                      ({product.reviewCount || 0} ulasan)
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      {product.location}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right ml-4">
                                  <p className="text-xl font-bold text-primary">
                                    {formatPrice(product.price)}
                                  </p>
                                  {product.originalPrice && (
                                    <p className="text-sm text-muted-foreground line-through">
                                      {formatPrice(product.originalPrice)}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
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
