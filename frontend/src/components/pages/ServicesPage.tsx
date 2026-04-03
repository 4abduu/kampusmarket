"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
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
import { Slider } from "@/components/ui/slider";
import {
  Search,
  SlidersHorizontal,
  Star,
  MapPin,
  Grid,
  List,
  X,
  ChevronLeft,
  ChevronRight,
  Wallet,
} from "lucide-react";
import { mockServices, serviceCategories } from "@/lib/mock-data";

const ITEMS_PER_PAGE = 8;

interface ServicesPageProps {
  onNavigate: (page: string, serviceId?: string) => void;
  initialCategory?: string | null;
}

interface FilterSidebarProps {
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  priceRange: number[];
  setPriceRange: (range: number[]) => void;
  setSearchQuery: (query: string) => void;
}

function FilterSidebar({
  selectedCategory,
  setSelectedCategory,
  priceRange,
  setPriceRange,
  setSearchQuery,
}: FilterSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-semibold mb-3">Kategori Jasa</h3>
        <div className="space-y-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              selectedCategory === null
                ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                : "hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            Semua Kategori
          </button>
          {serviceCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                selectedCategory === category.id
                  ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold mb-3">Rentang Harga</h3>
        <div className="space-y-4">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={1000000}
            step={10000}
            className="w-full"
          />
          <div className="flex items-center gap-2">
            <Input
              type="text"
              value={`Rp ${priceRange[0].toLocaleString("id-ID")}`}
              readOnly
              className="text-xs"
            />
            <span>-</span>
            <Input
              type="text"
              value={`Rp ${priceRange[1].toLocaleString("id-ID")}`}
              readOnly
              className="text-xs"
            />
          </div>
        </div>
      </div>

      {/* Reset Filters */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          setSelectedCategory(null);
          setPriceRange([0, 1000000]);
          setSearchQuery("");
        }}
      >
        Reset Filter
      </Button>
    </div>
  );
}

export default function ServicesPage({ onNavigate, initialCategory }: ServicesPageProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory ?? null);
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [sortBy, setSortBy] = useState("terbaru");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredServices = mockServices.filter((service) => {
    if (selectedCategory && service.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
    if (service.priceMin > priceRange[1]) return false;
    if (searchQuery && !service.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredServices.length / ITEMS_PER_PAGE);
  const paginatedServices = filteredServices.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Fotografi": return "📸";
      case "Pendidikan": return "🎓";
      case "Desain": return "🎨";
      case "Teknisi": return "🔧";
      case "Kecantikan": return "💄";
      default: return "🛠️";
    }
  };

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
    setSearchQuery,
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
              <FilterSidebar {...filterSidebarProps} />
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
                      <FilterSidebar {...filterSidebarProps} />
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
            {selectedCategory && (
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary" className="gap-1">
                  {serviceCategories.find((c) => c.id === selectedCategory)?.label}
                  <button onClick={() => setSelectedCategory(null)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              </div>
            )}

            {/* Results Count */}
            <p className="text-sm text-muted-foreground mb-4">
              Menampilkan {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredServices.length)} dari {filteredServices.length} jasa
            </p>

            {/* Service Grid */}
            {viewMode === "grid" ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {paginatedServices.map((service) => (
                  <Card
                    key={service.id}
                    className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group"
                    onClick={() => onNavigate("service", service.id)}
                  >
                    <div className="relative bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 h-40 flex items-center justify-center">
                      <span className="text-5xl">{getCategoryIcon(service.category)}</span>
                    </div>
                    <CardContent className="p-4">
                      <Badge variant="outline" className="mb-2">{service.category}</Badge>
                      <p className="font-medium line-clamp-2 mb-2 group-hover:text-primary-600 transition-colors">
                        {service.title}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {service.description}
                      </p>
                      <div className="flex items-center gap-1 mb-3">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{service.rating}</span>
                        <span className="text-sm text-muted-foreground">({service.orderCount} pesanan)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary-600">
                          Rp {service.priceMin.toLocaleString("id-ID")} - {service.priceMax.toLocaleString("id-ID")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs bg-primary-100 text-primary-700">
                            {service.provider.name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          {service.provider.name.split(" ")[0]}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                          <MapPin className="h-3 w-3" />
                          {service.location}
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
                      <div className="relative bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 w-48 shrink-0 flex items-center justify-center">
                        <span className="text-4xl">{getCategoryIcon(service.category)}</span>
                      </div>
                      <CardContent className="flex-1 p-4">
                        <div className="flex justify-between">
                          <div>
                            <Badge variant="outline" className="mb-1">{service.category}</Badge>
                            <p className="font-medium mb-1 group-hover:text-primary-600 transition-colors">
                              {service.title}
                            </p>
                            <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                              {service.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span>{service.rating}</span>
                              </div>
                              <span>{service.orderCount} pesanan</span>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {service.location}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-primary-600">
                              Rp {service.priceMin.toLocaleString("id-ID")}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              s/d Rp {service.priceMax.toLocaleString("id-ID")}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Empty State */}
            {filteredServices.length === 0 && (
              <div className="text-center py-12">
                <Wallet className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Tidak ada jasa ditemukan</h3>
                <p className="text-muted-foreground mb-4">
                  Coba ubah filter atau kata kunci pencarian
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedCategory(null);
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
