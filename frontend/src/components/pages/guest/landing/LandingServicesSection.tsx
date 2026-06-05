import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import type { Service } from "@/lib/mock-data";
import { LandingServicesSectionSkeleton } from "@/components/skeleton";
import ProductImage from "@/components/common/ProductImage";

interface LandingServicesSectionProps {
  services: Service[];
  onNavigate: (page: string, data?: string) => void;
}

export default function LandingServicesSection({
  services,
  onNavigate,
}: LandingServicesSectionProps) {
  if (!services || services.length === 0) {
    return <LandingServicesSectionSkeleton />;
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Layanan Jasa</h2>
            <p className="text-muted-foreground">
              Jasa dari mahasiswa untuk mahasiswa
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => onNavigate("services")}
          >
            Lihat Semua
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {services.slice(0, 6).map((service) => (
            <Card
              key={service.id}
              className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group"
              onClick={() => onNavigate("service", service.id)}
            >
              <div className="relative h-40 flex items-center justify-center overflow-hidden">
                <ProductImage
                  src={(service as any).images?.[0]?.url ?? (service as any).images?.[0] ?? (service as any).image}
                  alt={service.title}
                  type="jasa"
                  className="w-full h-full bg-emerald-50 dark:bg-emerald-900/20"
                  imageClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <CardContent className="p-3 md:p-4">
                <Badge variant="outline" className="mb-2 text-[10px] md:text-xs px-1.5 py-0 md:px-2 md:py-0.5">
                  {service.category}
                </Badge>

                <p className="font-medium text-sm md:text-base line-clamp-2 mb-2 group-hover:text-primary-600 transition-colors">
                  {service.title}
                </p>

                <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mb-2 md:mb-3">
                  {service.description}
                </p>

                <div className="flex items-center gap-1 mb-2 md:mb-3">
                  <Star className="h-3 w-3 md:h-4 md:w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs md:text-sm font-medium">
                    {service.rating ?? 0}
                  </span>
                  <span className="text-[10px] md:text-sm text-muted-foreground truncate">
                    ({(service as any).soldCount ?? service.orderCount ?? 0} pesanan)
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm md:text-lg font-bold text-primary-600 line-clamp-1">
                    {(() => {
                      const min = Number(service.priceMin);
                      const max = Number(service.priceMax);
                      if (Number.isFinite(min) && Number.isFinite(max)) {
                        return `Rp ${min.toLocaleString("id-ID")} - Rp ${max.toLocaleString("id-ID")}`;
                      }
                      if (Number.isFinite(min)) {
                        return `Rp ${min.toLocaleString("id-ID")}`;
                      }
                      if (Number.isFinite(max)) {
                        return `Rp ${max.toLocaleString("id-ID")}`;
                      }
                      return "—";
                    })()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </section>
  );
}
