"use client";

import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getProductDetail } from "@/lib/api/products";

import ServiceDetailSidebar from "@/components/pages/guest/service-detail/ServiceDetailSidebar";
import ServiceDetailTabsPanel from "@/components/pages/guest/service-detail/ServiceDetailTabsPanel";
import DetailPageShell from "@/components/pages/guest/shared/DetailPageShell";
import { ServiceDetailPageSkeleton } from "@/components/skeleton";
import ProductDetailLoginDialog from "@/components/pages/guest/product-detail/ProductDetailLoginDialog";
import ImageGallery from "@/components/common/ImageGallery";

interface ServiceDetailPageProps {
  onNavigate: (
    page: string,
    data?: string | { productId?: string; chatAction?: "chat" | "nego" },
  ) => void;
  serviceId: string;
  isLoggedIn: boolean;
}

export default function ServiceDetailPage({
  onNavigate,
  serviceId,
  isLoggedIn,
}: ServiceDetailPageProps) {
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
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
          setError(
            "URL tidak valid untuk halaman ini. Silakan periksa kembali.",
          );
          return;
        }
        setService(data);
      } catch (err) {
        console.error("[ServiceDetailPage] Failed to fetch service:", err);
        setError("Gagal memuat detail layanan. Silakan coba lagi.");
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
              <p className="text-red-500">
                {error || "Layanan tidak ditemukan"}
              </p>
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
      <ImageGallery
        images={service.images || []}
        imagesDetail={service.imagesDetail}
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
        customBadge={
          <Badge className="bg-primary-500">
            {service.category?.name || "Jasa"}
          </Badge>
        }
      />

      <ServiceDetailTabsPanel description={service.description} service={service} productId={serviceId} />
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
      <ProductDetailLoginDialog
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
        onNavigate={onNavigate}
      />
      <DetailPageShell
        breadcrumbs={breadcrumbs}
        mainContent={mainContent}
        sidebarContent={sidebarContent}
      />
    </>
  );
}
