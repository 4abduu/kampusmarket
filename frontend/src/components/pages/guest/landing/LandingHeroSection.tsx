import { ArrowRight, Package, Users, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ProductImage from "@/components/common/ProductImage";

type Product = {
  id: string;
  title: string;
  price?: number | null;
  type?: "barang" | "jasa";
  images?: string[];
};

interface LandingHeroSectionProps {
  featuredProducts: Product[];
  onNavigate: (page: string, data?: string) => void;
  isLoading?: boolean;
  onAction?: (action: () => void) => void;
}

export default function LandingHeroSection({
  featuredProducts,
  onNavigate,
  isLoading = false,
  onAction = (action: () => void) => action(),
}: LandingHeroSectionProps) {
  const handleMulaiBelanja = () => {
    const el = document.getElementById("categories-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      onNavigate("catalog");
    }
  };
  const handleJualBarang = () => {
    if (onAction) {
      onAction(() => onNavigate("add-product"));
    } else {
      onNavigate("add-product");
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
      <div className="container mx-auto px-4 py-10 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <Badge className="bg-primary-100 text-primary-700 hover:bg-primary-100">
              Khusus Ekosistem Kampus
            </Badge>
            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold leading-tight tracking-tight">
              Jual Beli Mudah di{" "}
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                KampusMarket
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              Marketplace hyperlocal untuk mahasiswa, alumni, dan masyarakat sekitar kampus. 
              Jual beli barang bekas dan jasa dengan aman, mudah, dan tanpa ribet logistik.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Button
                size="lg"
                className="bg-primary-600 hover:bg-primary-700 shadow-md shadow-primary-200 transition-all"
                onClick={handleMulaiBelanja}
              >
                Mulai Belanja
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="shadow-sm" onClick={handleJualBarang}>
                Jual Barang
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-6 border-t border-border/50 mt-8">
              <div className="flex flex-col items-center sm:flex-row sm:items-center sm:gap-2 text-center sm:text-left">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600 mb-1 sm:mb-0" />
                <div>
                  <p className="text-sm sm:text-base font-bold">2,500+</p>
                  <p className="text-[10px] sm:text-sm text-muted-foreground">User Aktif</p>
                </div>
              </div>
              <div className="flex flex-col items-center sm:flex-row sm:items-center sm:gap-2 text-center sm:text-left">
                <Package className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600 mb-1 sm:mb-0" />
                <div>
                  <p className="text-sm sm:text-base font-bold">5,000+</p>
                  <p className="text-[10px] sm:text-sm text-muted-foreground">Produk</p>
                </div>
              </div>
              <div className="flex flex-col items-center sm:flex-row sm:items-center sm:gap-2 text-center sm:text-left">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600 mb-1 sm:mb-0" />
                <div>
                  <p className="text-sm sm:text-base font-bold">10k+</p>
                  <p className="text-[10px] sm:text-sm text-muted-foreground">Transaksi</p>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Image/Illustration */}
          <div className="relative mt-8 lg:mt-0">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-3xl blur-3xl pointer-events-none" />
            
            {/* Desktop Grid View */}
            <div className="relative hidden lg:grid lg:grid-cols-2 gap-4">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className={`${i === 0 ? "col-span-2" : ""}`}>
                    <Skeleton className={`${i === 0 ? "h-48" : "h-32"} w-full rounded-b-none`} />
                    <CardContent className="p-3">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-5 w-20" />
                    </CardContent>
                  </Card>
                ))
              ) : (
                featuredProducts.map((product, index) => (
                  <Card
                    key={product.id}
                    className={`overflow-hidden cursor-pointer hover:shadow-lg transition-shadow ${
                      index === 0 ? "col-span-2" : ""
                    }`}
                    onClick={() => onNavigate(product.type === "jasa" ? "service" : "product", product.id)}
                  >
                    <div className={`${index === 0 ? "h-48" : "h-32"} flex items-center justify-center overflow-hidden shrink-0`}>
                      <ProductImage
                        src={product.images?.[0]}
                        alt={product.title}
                        type={product.type}
                        className="w-full h-full bg-muted flex items-center justify-center"
                        imageClassName="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-3">
                      <p className="font-medium text-sm truncate">{product.title}</p>
                      <p className="text-primary-600 font-bold text-sm">
                        {product.price ? `Rp ${product.price.toLocaleString("id-ID")}` : "—"}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Mobile Horizontal Scroll View */}
            <div className="relative flex lg:hidden overflow-x-auto gap-4 pb-4 -mx-4 px-4 snap-x hide-scrollbar">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="min-w-[160px] snap-center shrink-0">
                    <Skeleton className="h-32 w-full rounded-b-none" />
                    <CardContent className="p-3">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-5 w-20" />
                    </CardContent>
                  </Card>
                ))
              ) : (
                featuredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="min-w-[140px] max-w-[140px] sm:min-w-[180px] sm:max-w-[180px] snap-center shrink-0 overflow-hidden cursor-pointer flex flex-col"
                    onClick={() => onNavigate(product.type === "jasa" ? "service" : "product", product.id)}
                  >
                    <div className="h-28 sm:h-32 flex items-center justify-center overflow-hidden shrink-0">
                      <ProductImage
                        src={product.images?.[0]}
                        alt={product.title}
                        type={product.type}
                        className="w-full h-full bg-muted flex items-center justify-center"
                        imageClassName="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-2 sm:p-3 flex flex-col flex-grow">
                      <p className="font-medium text-xs sm:text-sm line-clamp-2 leading-snug mb-1">{product.title}</p>
                      <p className="text-primary-600 font-bold text-xs sm:text-sm mt-auto">
                        {product.price ? `Rp${product.price.toLocaleString("id-ID")}` : "—"}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
