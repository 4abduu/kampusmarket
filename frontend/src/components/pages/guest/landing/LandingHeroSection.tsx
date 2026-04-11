import { ArrowRight, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { landingStats } from "@/components/pages/guest/landing/landing.constants";
import type { Product } from "@/lib/mock-data";

interface LandingHeroSectionProps {
  featuredProducts: Product[];
  onNavigate: (page: string, data?: string) => void;
}

export default function LandingHeroSection({ featuredProducts, onNavigate }: LandingHeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <Badge className="bg-primary-100 text-primary-700 hover:bg-primary-100">Khusus Ekosistem Kampus</Badge>
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
              Jual Beli Mudah di{" "}
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">KampusMarket</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              Marketplace hyperlocal untuk mahasiswa, alumni, dan masyarakat sekitar kampus.
              Jual beli barang bekas dan jasa dengan aman, mudah, dan tanpa ribet logistik.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-primary-600 hover:bg-primary-700" onClick={() => onNavigate("catalog")}>
                Mulai Belanja
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => onNavigate("register")}>
                Jual Barang
              </Button>
            </div>

            <div className="flex flex-wrap gap-8 pt-4">
              {landingStats.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <item.icon className="h-5 w-5 text-primary-600" />
                  <div>
                    <p className="font-bold">{item.value}</p>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-3xl blur-3xl" />
            <div className="relative grid grid-cols-2 gap-4">
              {featuredProducts.map((product, index) => (
                <Card
                  key={product.id}
                  className={`overflow-hidden cursor-pointer hover:shadow-lg transition-shadow ${index === 0 ? "col-span-2" : ""}`}
                  onClick={() => onNavigate("product", product.id)}
                >
                  <div className={`bg-muted ${index === 0 ? "h-48" : "h-32"} flex items-center justify-center`}>
                    <Package className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                  <CardContent className="p-3">
                    <p className="font-medium text-sm truncate">{product.title}</p>
                    <p className="text-primary-600 font-bold text-sm">Rp {product.price.toLocaleString("id-ID")}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
