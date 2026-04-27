"use client";

import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase } from "lucide-react";
import { getProductDetail } from "@/lib/api/products";
import ServiceDetailSidebar from "@/components/pages/guest/service-detail/ServiceDetailSidebar";
import ServiceDetailTabsPanel from "@/components/pages/guest/service-detail/ServiceDetailTabsPanel";
import DetailPageShell from "@/components/pages/guest/shared/DetailPageShell";
import ServiceDetailPageSkeleton from "@/components/skeleton/ServiceDetailPageSkeleton";
import ProductDetailLoginDialog from "@/components/pages/guest/product-detail/ProductDetailLoginDialog";

interface ServiceDetailPageProps {
  onNavigate: (page: string, data?: string | { productId?: string; chatAction?: "chat" | "nego" }) => void;
  serviceId: string;
  isLoggedIn: boolean;
}

export default function ServiceDetailPage({ onNavigate, serviceId, isLoggedIn }: ServiceDetailPageProps) {
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const fetchedIdRef = useRef<string | null>(null);

  const handleAction = (action: () => void) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    action();
  };

  // Fetch service detail from API
  useEffect(() => {
    if (!serviceId || fetchedIdRef.current === serviceId) {
      return;
    }
    fetchedIdRef.current = serviceId;

    const fetchService = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getProductDetail(serviceId);
        if (data.type !== "jasa") {
          setError('URL tidak valid untuk halaman ini. Silakan periksa kembali.');
          return;
        }
        setService(data);
      } catch (err) {
        console.error('[ServiceDetailPage] Failed to fetch service:', err);
        setError('Gagal memuat detail layanan. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [serviceId]);

  if (loading) {
    return <ServiceDetailPageSkeleton />;
  }

  if (error || !service) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-red-500">{error || 'Layanan tidak ditemukan'}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const mainContent = (
    <>
      <Card className="overflow-hidden">
        <div className="relative flex h-96 items-center justify-center bg-muted overflow-hidden">
          {service.images && service.images.length > 0 ? (
            <img
              src={service.images[0].url || service.images[0]}
              alt={service.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <Briefcase className="h-36 w-36 text-muted-foreground/50" />
          )}
          <Badge className="absolute top-4 left-4 bg-primary-500">
            {service.category?.name || "Jasa"}
          </Badge>
        </div>
      </Card>

      {service.images && service.images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {service.images.map((image: any, index: number) => (
            <button
              key={index}
              className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 border-transparent transition-colors hover:border-primary-300"
              title={`Foto ${index + 1}`}
              aria-label={`Foto ${index + 1}`}
            >
              <div className="flex h-full w-full items-center justify-center bg-muted overflow-hidden">
                <img
                  src={image.url || image}
                  alt={`Foto ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </button>
          ))}
        </div>
      )}

      <ServiceDetailTabsPanel description={service.description} service={service} />
    </>
  );

  const sidebarContent = (
    <ServiceDetailSidebar
      service={service}
      serviceId={serviceId}
      formatPrice={formatPrice}
      onNavigate={onNavigate}
      onAction={handleAction}
    />
  );

  const breadcrumbs = [
    { label: "Beranda", onClick: () => onNavigate("landing") },
    { label: "Layanan Jasa", onClick: () => onNavigate("services") },
    { label: service.title },
  ];

  return (
    <>
      <ProductDetailLoginDialog open={showLoginModal} onOpenChange={setShowLoginModal} onNavigate={onNavigate} />
      <DetailPageShell
        breadcrumbs={breadcrumbs}
        mainContent={mainContent}
        sidebarContent={sidebarContent}
      />
    </>
  );
}
