"use client";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Briefcase } from "lucide-react";
import { mockServices } from "@/lib/mock-data";
import ServiceDetailSidebar from "@/components/pages/guest/service-detail/ServiceDetailSidebar";
import ServiceDetailTabsPanel from "@/components/pages/guest/service-detail/ServiceDetailTabsPanel";
import DetailPageShell from "@/components/pages/guest/shared/DetailPageShell";

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

  const mainContent = (
    <>
      <Card className="overflow-hidden">
        <div className="relative flex h-96 items-center justify-center bg-emerald-50 dark:bg-emerald-900/20">
          <Briefcase className="h-36 w-36 text-emerald-600/60" />
          <Badge className="absolute top-4 left-4 bg-primary-500">{service.category}</Badge>
        </div>
      </Card>

      {service.portfolio && service.portfolio.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {service.portfolio.map((_, index) => (
            <button
              key={index}
              className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 border-transparent transition-colors hover:border-primary-300"
              title={`Portfolio ${index + 1}`}
              aria-label={`Portfolio ${index + 1}`}
            >
              <div className="flex h-full w-full items-center justify-center bg-emerald-50 dark:bg-emerald-900/20">
                <Briefcase className="h-8 w-8 text-emerald-600/70" />
              </div>
            </button>
          ))}
        </div>
      )}

      <ServiceDetailTabsPanel description={service.description} />
    </>
  );

  const sidebarContent = (
    <ServiceDetailSidebar
      service={service}
      serviceId={serviceId}
      formatPrice={formatPrice}
      getEstimasiPengerjaan={getEstimasiPengerjaan}
      onNavigate={onNavigate}
    />
  );

  const breadcrumbs = [
    { label: "Beranda", onClick: () => onNavigate("landing") },
    { label: "Layanan Jasa", onClick: () => onNavigate("services") },
    { label: service.title },
  ];

  return (
    <DetailPageShell
      breadcrumbs={breadcrumbs}
      mainContent={mainContent}
      sidebarContent={sidebarContent}
    />
  );
}
