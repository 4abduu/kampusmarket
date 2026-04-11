import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { Briefcase, SlidersHorizontal, Star, X } from "lucide-react";

interface CategoryItem {
  id: string;
  label: string;
}

interface ServiceItem {
  id: string;
  title: string;
  category: string;
  price?: number;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  soldCount?: number;
  orderCount?: number;
}

interface ProfileServicesTabProps {
  serviceCategories: CategoryItem[];
  filteredServices: ServiceItem[];
  totalServices: number;
  serviceCategory: string | null;
  setServiceCategory: (value: string | null) => void;
  servicePriceRange: number[];
  setServicePriceRange: (value: number[]) => void;
  serviceSortBy: "terbaru" | "terpopuler" | "termurah" | "termahal";
  setServiceSortBy: (value: "terbaru" | "terpopuler" | "termurah" | "termahal") => void;
  onNavigate: (page: string, data?: string | { userId?: string; productId?: string }) => void;
  formatPrice: (price: number) => string;
}

export default function ProfileServicesTab({
  serviceCategories,
  filteredServices,
  totalServices,
  serviceCategory,
  setServiceCategory,
  servicePriceRange,
  setServicePriceRange,
  serviceSortBy,
  setServiceSortBy,
  onNavigate,
  formatPrice,
}: ProfileServicesTabProps) {
  const resetFilters = () => {
    setServiceCategory(null);
    setServicePriceRange([0, 1000000]);
    setServiceSortBy("terbaru");
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="lg:hidden">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filter Jasa</SheetTitle>
              <SheetDescription>Filter jasa sesuai kebutuhanmu</SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Kategori Jasa</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  <button
                    onClick={() => setServiceCategory(null)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      serviceCategory === null
                        ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    Semua Kategori
                  </button>
                  {serviceCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setServiceCategory(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        serviceCategory === category.id
                          ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Rentang Harga</h3>
                <div className="space-y-4">
                  <Slider value={servicePriceRange} onValueChange={setServicePriceRange} max={1000000} step={10000} className="w-full" />
                  <div className="flex items-center gap-2">
                    <Input type="text" value={`Rp ${servicePriceRange[0].toLocaleString("id-ID")}`} readOnly className="text-xs" />
                    <span>-</span>
                    <Input type="text" value={`Rp ${servicePriceRange[1].toLocaleString("id-ID")}`} readOnly className="text-xs" />
                  </div>
                </div>
              </div>

              <Button variant="outline" className="w-full" onClick={resetFilters}>Reset Filter</Button>
            </div>
          </SheetContent>
        </Sheet>

        <Select value={serviceSortBy} onValueChange={setServiceSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Urutkan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="terbaru">Terbaru</SelectItem>
            <SelectItem value="terpopuler">Terpopuler</SelectItem>
            <SelectItem value="termurah">Harga Terendah</SelectItem>
            <SelectItem value="termahal">Harga Tertinggi</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {serviceCategory && (
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="secondary" className="gap-1">
            {serviceCategories.find((c) => c.id === serviceCategory)?.label}
            <button onClick={() => setServiceCategory(null)} aria-label="Hapus filter kategori jasa" title="Hapus filter kategori jasa">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        </div>
      )}

      <p className="text-sm text-muted-foreground mb-4">Menampilkan {filteredServices.length} dari {totalServices} jasa</p>

      {filteredServices.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              {totalServices === 0 ? "User ini belum upload jasa" : "Tidak ada jasa ditemukan"}
            </p>
            {totalServices > 0 && (
              <Button variant="outline" className="mt-4" onClick={resetFilters}>Reset Filter</Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filteredServices.map((service) => {
            const basePrice = service.price ?? 0;
            const priceMin = service.priceMin ?? basePrice;
            const priceMax = service.priceMax ?? basePrice;
            const soldCount = service.soldCount ?? service.orderCount ?? 0;

            return (
              <Card
                key={service.id}
                className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onNavigate("service", service.id)}
              >
                <div className="aspect-video bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 flex items-center justify-center">
                  <Briefcase className="h-16 w-16 text-primary-600/30" />
                </div>
                <CardContent className="p-4">
                  <Badge variant="outline" className="mb-2 text-xs">{service.category}</Badge>
                  <h3 className="font-medium line-clamp-2 mb-2">{service.title}</h3>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-primary-600 text-sm">
                      {priceMin === priceMax || !priceMax
                        ? formatPrice(priceMin)
                        : `${formatPrice(priceMin)} - ${formatPrice(priceMax)}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {service.rating ?? 0}
                    </div>
                    <span>•</span>
                    <span>{soldCount} pesanan</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
