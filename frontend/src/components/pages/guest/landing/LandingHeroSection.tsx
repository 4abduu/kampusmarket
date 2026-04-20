import { ArrowRight, Package, Users, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Product = {
  id: string;
  title: string;
  price?: number | null;
};

interface LandingHeroSectionProps {
  featuredProducts: Product[];
  onNavigate: (page: string, data?: string) => void;
  isLoading?: boolean;
}

export default function LandingHeroSection({
  featuredProducts,
  onNavigate,
  isLoading = false,
}: LandingHeroSectionProps) {
  const products = Array.isArray(featuredProducts) ? featuredProducts : [];
  const count = products.length;

  const formatPrice = (v?: number | null) => {
    const n = Number(v);
    return Number.isFinite(n) ? `Rp ${n.toLocaleString("id-ID")}` : "—";
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />

      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* LEFT SIDE - teks & CTA (tidak berubah) */}
          <div className="space-y-6">
            <Badge className="bg-primary-100 text-primary-700 hover:bg-primary-100">Khusus Ekosistem Kampus</Badge>

            <h1 className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
              Jual Beli Mudah di{' '}
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">KampusMarket</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              Marketplace hyperlocal untuk mahasiswa, alumni, dan masyarakat sekitar kampus. Jual beli barang bekas dan
              jasa dengan aman, mudah, dan tanpa ribet logistik.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Button
                size="lg"
                className="bg-primary-600 hover:bg-primary-700 shadow-md shadow-primary-200 transition-all"
                onClick={() => onNavigate('catalog')}
              >
                Mulai Belanja
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <Button size="lg" variant="outline" className="shadow-sm" onClick={() => onNavigate('register')}>
                Jual Barang
              </Button>
            </div>

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

          {/* RIGHT SIDE - produk grid */}
          <div className="relative hidden lg:block">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-3xl blur-3xl pointer-events-none" />

            <div className={`relative grid grid-cols-2 gap-4 ${count === 0 ? 'min-h-[20rem]' : ''}`}>
              {isLoading ? (
                [0, 1, 2].map((i) => (
                  <Card key={i} className={`${i === 0 ? 'col-span-2' : ''}`}>
                    <div className={`${i === 0 ? 'h-48' : 'h-32'} bg-muted flex items-center justify-center`}>
                      <Package className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                    <CardContent className="p-3">
                      <div className="font-medium text-sm truncate"><Skeleton className="h-4 w-3/4" /></div>
                      <div className="text-primary-600 font-bold text-sm mt-2"><Skeleton className="h-5 w-20" /></div>
                    </CardContent>
                  </Card>
                ))
              ) : count === 0 ? (
                <div className="col-span-2 h-full min-h-[350px] rounded-xl border-2 border-dashed border-border/50 bg-muted/30 flex items-center justify-center">
                  <div className="text-center space-y-3 p-6">
                    <Package className="mx-auto h-16 w-16 text-muted-foreground/30" />
                    <p className="text-muted-foreground font-medium">Produk unggulan akan muncul di sini</p>
                    <Button variant="link" onClick={() => window.location.reload()}>Refresh</Button>
                  </div>
                </div>
              ) : count === 1 ? (
                products.map((p) => (
                  <Card key={p.id} className="col-span-2 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow h-80" onClick={() => onNavigate('product', p.id)}>
                    <div className="relative bg-muted overflow-hidden flex items-center justify-center h-80">
                      <Package className="h-16 w-16 text-muted-foreground/30" />
                    </div>
                    <CardContent className="p-4 bg-white">
                      <p className="font-semibold text-sm text-gray-900 truncate mb-1">{p.title}</p>
                      <p className="text-primary-600 font-bold text-base">{formatPrice(p.price)}</p>
                    </CardContent>
                  </Card>
                ))
              ) : count === 2 ? (
                products.map((p) => (
                  <Card key={p.id} className="col-span-2 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow h-40" onClick={() => onNavigate('product', p.id)}>
                    <div className="relative bg-muted overflow-hidden flex items-center justify-center h-40">
                      <Package className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                    <CardContent className="p-4 bg-white">
                      <p className="font-semibold text-sm text-gray-900 truncate mb-1">{p.title}</p>
                      <p className="text-primary-600 font-bold text-base">{formatPrice(p.price)}</p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                products.map((p, idx) => (
                  <Card key={p.id} className={`overflow-hidden cursor-pointer hover:shadow-lg transition-shadow ${idx === 0 ? 'col-span-2 h-48' : 'h-32'}`} onClick={() => onNavigate('product', p.id)}>
                    <div className={`${idx === 0 ? 'h-48' : 'h-32'} bg-muted flex items-center justify-center`}>
                      <Package className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                    <CardContent className="p-3">
                      <p className="font-medium text-sm truncate">{p.title}</p>
                      <p className="text-primary-600 font-bold text-sm">{formatPrice(p.price)}</p>
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
