import { Briefcase, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Service } from "@/lib/mock-data";

interface LandingServicesSectionProps {
  services: Service[];
  onNavigate: (page: string, data?: string) => void;
}

export default function LandingServicesSection({ services, onNavigate }: LandingServicesSectionProps) {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Layanan Jasa</h2>
            <p className="text-muted-foreground">Jasa dari mahasiswa untuk mahasiswa</p>
          </div>
          <Button variant="outline" onClick={() => onNavigate("services")}>
            Lihat Semua
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {services.slice(0, 3).map((service) => (
            <Card
              key={service.id}
              className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group"
              onClick={() => onNavigate("service", service.id)}
            >
              <div className="relative bg-emerald-50 dark:bg-emerald-900/20 h-40 flex items-center justify-center">
                <Briefcase className="h-12 w-12 text-emerald-600/70" />
              </div>
              <CardContent className="p-4">
                <Badge variant="outline" className="mb-2">{service.category}</Badge>
                <p className="font-medium line-clamp-2 mb-2 group-hover:text-primary-600 transition-colors">{service.title}</p>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{service.description}</p>
                <div className="flex items-center gap-1 mb-3">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{service.rating}</span>
                  <span className="text-sm text-muted-foreground">({service.orderCount} pesanan)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary-600">
                    Rp {service.priceMin.toLocaleString("id-ID")} - Rp {service.priceMax.toLocaleString("id-ID")}
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
