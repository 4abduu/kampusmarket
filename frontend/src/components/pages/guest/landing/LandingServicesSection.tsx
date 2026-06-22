import { PartialStarRating } from "@/components/common/PartialStarRating";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

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
    <section className="py-10 sm:py-16">
      <div className="container mx-auto px-4">
        
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5 sm:mb-8">
          <div>
            <h2 className="text-xl sm:text-3xl font-bold mb-1 sm:mb-2">Layanan Jasa</h2>
            <p className="text-xs sm:text-base text-muted-foreground">
              Jasa dari mahasiswa untuk mahasiswa
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="self-start sm:self-auto"
            onClick={() => onNavigate("services")}
          >
            Lihat Semua
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 md:gap-6">
          {services.slice(0, 6).map((service) => {
            const orderCount = (service as any).soldCount ?? service.orderCount ?? 0;
            const displayOrderCount = orderCount > 99 ? "99+" : orderCount;
            const rating = service.rating ?? 0;

            return (
            <Card
              key={service.id}
              className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group flex flex-col"
              onClick={() => onNavigate("service", service.id)}
            >
              <div className="relative bg-muted h-32 md:h-40 flex items-center justify-center overflow-hidden shrink-0">
                <ProductImage
                  src={(service as any).images?.[0]?.url ?? (service as any).images?.[0] ?? (service as any).image}
                  alt={service.title}
                  type="jasa"
                  className="w-full h-full bg-emerald-50 dark:bg-emerald-900/20"
                  imageClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <CardContent className="p-2 md:p-4 flex flex-col flex-grow">
                <p className="font-medium text-xs md:text-base line-clamp-2 mb-1 md:mb-2 group-hover:text-primary-600 transition-colors leading-snug">
                  {service.title}
                </p>

                {/* DESKTOP LAYOUT */}
                <div className="hidden md:flex flex-col flex-grow">
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {service.description}
                  </p>

                  <div className="flex items-center gap-1 mb-3">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">
                      {service.rating ?? 0}
                    </span>
                    <span className="text-sm text-muted-foreground truncate">
                      ({orderCount} pesanan)
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-lg font-bold text-primary-600 line-clamp-1">
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
                </div>

                {/* MOBILE LAYOUT */}
                <div className="mt-auto flex flex-col gap-1 pt-1 md:hidden">
                  <span className="text-xs font-bold text-primary-600 line-clamp-1">
                    {(() => {
                      const min = Number(service.priceMin);
                      const max = Number(service.priceMax);
                      if (Number.isFinite(min) && Number.isFinite(max)) {
                        return `Rp${min.toLocaleString("id-ID")} - Rp${max.toLocaleString("id-ID")}`;
                      }
                      if (Number.isFinite(min)) {
                        return `Rp${min.toLocaleString("id-ID")}`;
                      }
                      if (Number.isFinite(max)) {
                        return `Rp${max.toLocaleString("id-ID")}`;
                      }
                      return "—";
                    })()}
                  </span>

                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <PartialStarRating rating={rating} size={10} />
                    <span>{rating.toFixed(1)}</span>
                    <span className="text-[8px]">•</span>
                    <span>{displayOrderCount} dipesan</span>
                  </div>
                  
                  <span className="text-[10px] text-muted-foreground truncate mt-0.5">
                    {(service as any).seller?.name || "Unknown Seller"}
                  </span>
                </div>
              </CardContent>
            </Card>
          )})}
        </div>

      </div>
    </section>
  );
}
