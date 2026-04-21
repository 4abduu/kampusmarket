import { ArrowRight, Package, Users, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Product = {
  id: string;
  title: string;
  price?: number | null;
  type?: "barang" | "jasa";
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
  const handleMulaiBelanja = () => onNavigate("catalog");
  const handleJualBarang = () => {
    if (onAction) {
      onAction(() => onNavigate("register"));
    } else {
      onNavigate("register");
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <Badge className="bg-primary-100 text-primary-700 hover:bg-primary-100">
              Khusus Ekosistem Kampus
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
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
            <div className="flex flex-wrap gap-8 pt-6 border-t border-border/50 w-fit mt-8">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary-600" />
                <div>
                  <p className="font-bold">2,500+</p>
                  <p className="text-sm text-muted-foreground">User Aktif</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary-600" />
                <div>
                  <p className="font-bold">5,000+</p>
                  <p className="text-sm text-muted-foreground">Produk</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary-600" />
                <div>
                  <p className="font-bold">10,000+</p>
                  <p className="text-sm text-muted-foreground">Transaksi</p>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Image/Illustration */}
          <div className="relative hidden lg:block">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-3xl blur-3xl pointer-events-none" />
            <div className="relative grid grid-cols-2 gap-4">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className={`${i === 0 ? "col-span-2" : ""}`}>
                    <div className={`${i === 0 ? "h-48" : "h-32"} bg-muted flex items-center justify-center`}>
                      <Package className="h-12 w-12 text-muted-foreground/30" />
                    </div>
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
                    <div className={`bg-muted ${index === 0 ? "h-48" : "h-32"} flex items-center justify-center`}>
                      <Package className="h-12 w-12 text-muted-foreground/50" />
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
          </div>
        </div>
      </div>
    </section>
  );
}
