"use client";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Briefcase } from "lucide-react";
import { mockServices } from "@/lib/mock-data";
import ServiceDetailSidebar from "@/components/pages/guest/service-detail/ServiceDetailSidebar";
import ServiceDetailTabsPanel from "@/components/pages/guest/service-detail/ServiceDetailTabsPanel";

interface ServiceDetailPageProps {
  onNavigate: (page: string, data?: string | { productId?: string; chatAction?: "chat" | "nego" }) => void;
  serviceId: string;
}

export default function ServiceDetailPage({ onNavigate, serviceId }: ServiceDetailPageProps) {
  const service = mockServices.find((s) => s.id === serviceId) || mockServices[0];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getEstimasiPengerjaan = (category: string) => {
    switch (category) {
      case "Fotografi":
        return "1-3 hari";
      case "Pendidikan":
        return "1-2 jam/sesi";
      case "Desain":
        return "3-7 hari";
      case "Teknisi":
        return "1-2 hari";
      case "Kecantikan":
        return "1-3 jam";
      default:
        return "Sesuai kesepakatan";
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4 py-8">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <button onClick={() => onNavigate("landing")} className="hover:text-primary-600">Beranda</button>
          <span>/</span>
          <button onClick={() => onNavigate("services")} className="hover:text-primary-600">Layanan Jasa</button>
          <span>/</span>
          <span className="text-foreground">{service.title}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Card className="overflow-hidden">
              <div className="relative bg-emerald-50 dark:bg-emerald-900/20 h-96 flex items-center justify-center">
                <Briefcase className="h-36 w-36 text-emerald-600/60" />
                <Badge className="absolute top-4 left-4 bg-primary-500">{service.category}</Badge>
              </div>
            </Card>

            {service.portfolio && service.portfolio.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {service.portfolio.map((_, index) => (
                  <button
                    key={index}
                    className="shrink-0 w-20 h-20 rounded-lg border-2 border-transparent hover:border-primary-300 overflow-hidden transition-colors"
                  >
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 w-full h-full flex items-center justify-center">
                      <Briefcase className="h-8 w-8 text-emerald-600/70" />
                    </div>
                  </button>
                ))}
              </div>
            )}

            <ServiceDetailTabsPanel description={service.description} />
          </div>

          <ServiceDetailSidebar
            service={service}
            serviceId={serviceId}
            formatPrice={formatPrice}
            getEstimasiPengerjaan={getEstimasiPengerjaan}
            onNavigate={onNavigate}
          />
        </div>
      </div>
    </div>
  );
}
