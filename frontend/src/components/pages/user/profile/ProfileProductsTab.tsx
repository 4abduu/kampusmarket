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
import { Package, SlidersHorizontal, Star, X } from "lucide-react";

interface CategoryItem {
  id: string;
  label: string;
}

interface ProductItem {
  id: string;
  title: string;
  price: number;
  condition?: string;
  rating?: number;
  soldCount?: number;
}

interface ProfileProductsTabProps {
  categories: CategoryItem[];
  filteredProducts: ProductItem[];
  totalProducts: number;
  productCategory: string | null;
  setProductCategory: (value: string | null) => void;
  productPriceRange: number[];
  setProductPriceRange: (value: number[]) => void;
  productSortBy: "terbaru" | "terpopuler" | "termurah" | "termahal";
  setProductSortBy: (value: "terbaru" | "terpopuler" | "termurah" | "termahal") => void;
  onNavigate: (page: string, data?: string | { userId?: string; productId?: string }) => void;
  formatPrice: (price: number) => string;
}

export default function ProfileProductsTab({
  categories,
  filteredProducts,
  totalProducts,
  productCategory,
  setProductCategory,
  productPriceRange,
  setProductPriceRange,
  productSortBy,
  setProductSortBy,
  onNavigate,
  formatPrice,
}: ProfileProductsTabProps) {
  const resetFilters = () => {
    setProductCategory(null);
    setProductPriceRange([0, 1000000]);
    setProductSortBy("terbaru");
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
              <SheetTitle>Filter Produk</SheetTitle>
              <SheetDescription>Filter produk sesuai kebutuhanmu</SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Kategori</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  <button
                    onClick={() => setProductCategory(null)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      productCategory === null
                        ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    Semua Kategori
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setProductCategory(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        productCategory === category.id
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
                  <Slider value={productPriceRange} onValueChange={setProductPriceRange} max={1000000} step={10000} className="w-full" />
                  <div className="flex items-center gap-2">
                    <Input type="text" value={`Rp ${productPriceRange[0].toLocaleString("id-ID")}`} readOnly className="text-xs" />
                    <span>-</span>
                    <Input type="text" value={`Rp ${productPriceRange[1].toLocaleString("id-ID")}`} readOnly className="text-xs" />
                  </div>
                </div>
              </div>

              <Button variant="outline" className="w-full" onClick={resetFilters}>Reset Filter</Button>
            </div>
          </SheetContent>
        </Sheet>

        <Select value={productSortBy} onValueChange={setProductSortBy}>
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

      {productCategory && (
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="secondary" className="gap-1">
            {categories.find((c) => c.id === productCategory)?.label}
            <button onClick={() => setProductCategory(null)} aria-label="Hapus filter kategori" title="Hapus filter kategori">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        </div>
      )}

      <p className="text-sm text-muted-foreground mb-4">Menampilkan {filteredProducts.length} dari {totalProducts} produk</p>

      {filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              {totalProducts === 0 ? "User ini belum upload barang" : "Tidak ada produk ditemukan"}
            </p>
            {totalProducts > 0 && (
              <Button variant="outline" className="mt-4" onClick={resetFilters}>Reset Filter</Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onNavigate("product", product.id)}
            >
              <div className="aspect-square bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Package className="h-16 w-16 text-muted-foreground/30" />
              </div>
              <CardContent className="p-4">
                <h3 className="font-medium line-clamp-2 mb-2">{product.title}</h3>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-primary-600">{formatPrice(product.price)}</p>
                  {product.condition === "baru" ? (
                    <Badge className="bg-primary-500 text-xs">Baru</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">Bekas</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    {product.rating ?? 0}
                  </div>
                  <span>•</span>
                  <span>{product.soldCount || 0} terjual</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
