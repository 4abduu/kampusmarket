"use client";

import { useState } from "react";
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
  MapPin,
  Package,
  Grid,
  List,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { mockProducts, categories } from "@/lib/mock-data";
import CatalogFilterSidebar from "@/components/pages/guest/catalog/CatalogFilterSidebar";

const ITEMS_PER_PAGE = 8;

interface CatalogPageProps {
  onNavigate: (page: string, productId?: string) => void;
  initialCategory?: string | null;
}

export default function CatalogPage({ onNavigate, initialCategory }: CatalogPageProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory ?? null);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [sortBy, setSortBy] = useState("terbaru");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredProducts = mockProducts.filter((product) => {
    if (selectedCategory && product.category.toLowerCase() !== selectedCategory) return false;
    if (selectedConditions.length > 0 && (!product.condition || !selectedConditions.includes(product.condition))) return false;
    if (product.price < priceRange[0] || product.price > priceRange[1]) return false;
    if (searchQuery && !product.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
    priceRange,
    setPriceRange: (range: number[]) => {
      setPriceRange(range);
      setCurrentPage(1);
    },
    onResetFilters: () => {
      setSelectedCategory(null);
      setSelectedConditions([]);
      setPriceRange([0, 1000000]);
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
          <h1 className="text-3xl font-bold mb-2">Katalog Barang</h1>
          <p className="text-muted-foreground">
            Temukan barang bekas berkualitas dari mahasiswa terdekat
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-72 shrink-0">
            <Card className="p-4 sticky top-20">
              <CatalogFilterSidebar {...filterSidebarProps} />
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
                <Select value={sortBy} onValueChange={setSortBy}>
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

            {/* Results Count */}
            <p className="text-sm text-muted-foreground mb-4">
              Menampilkan {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)} dari {filteredProducts.length} produk
            </p>

            {/* Product Grid */}
            {viewMode === "grid" ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {paginatedProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group"
                    onClick={() => onNavigate("product", product.id)}
                  >
                    <div className="relative bg-muted h-48 flex items-center justify-center">
                      <Package className="h-16 w-16 text-muted-foreground/30" />
                      {product.originalPrice && (
                        <Badge className="absolute top-2 left-2 bg-red-500">
                          -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                        </Badge>
                      )}
                      {product.condition === "baru" && (
                        <Badge className="absolute top-2 right-2 bg-primary-500">Baru</Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <p className="font-medium line-clamp-2 mb-2 group-hover:text-primary-600 transition-colors">
                        {product.title}
                      </p>
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{product.rating}</span>
                        <span className="text-sm text-muted-foreground">({product.soldCount} terjual)</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg font-bold text-primary-600">
                          Rp {product.price.toLocaleString("id-ID")}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            Rp {product.originalPrice.toLocaleString("id-ID")}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs bg-primary-100 text-primary-700">
                              {product.seller.name.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">
                            {product.seller.name.split(" ")[0]}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {product.location.split(",")[0]}
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
                    key={product.id}
                    className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group"
                    onClick={() => onNavigate("product", product.id)}
                  >
                    <div className="flex">
                      <div className="relative bg-muted w-48 shrink-0 flex items-center justify-center">
                        <Package className="h-12 w-12 text-muted-foreground/30" />
                        {product.condition === "baru" && (
                          <Badge className="absolute top-2 left-2 bg-primary-500">Baru</Badge>
                        )}
                      </div>
                      <CardContent className="flex-1 p-4">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium mb-1 group-hover:text-primary-600 transition-colors">
                              {product.title}
                            </p>
                            <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                              {product.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span>{product.rating}</span>
                              </div>
                              <span>{product.soldCount} terjual</span>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {product.location}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-primary-600">
                              Rp {product.price.toLocaleString("id-ID")}
                            </p>
                            {product.originalPrice && (
                              <p className="text-sm text-muted-foreground line-through">
                                Rp {product.originalPrice.toLocaleString("id-ID")}
                              </p>
                            )}
                            {product.canNego && (
                              <Badge variant="outline" className="mt-2">
                                Bisa Nego
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Empty State */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Tidak ada produk ditemukan</h3>
                <p className="text-muted-foreground mb-4">
                  Coba ubah filter atau kata kunci pencarian
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedCategory(null);
                    setSelectedConditions([]);
                    setPriceRange([0, 1000000]);
                    setSearchQuery("");
                  }}
                >
                  Reset Filter
                </Button>
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

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="icon"
                    onClick={() => setCurrentPage(page)}
                    className={currentPage === page ? "bg-primary-600 hover:bg-primary-700" : ""}
                  >
                    {page}
                  </Button>
                ))}

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
          </main>
        </div>
      </div>
    </div>
  );
}
