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
import ProductDetailReportDialog from "@/components/pages/guest/product-detail/ProductDetailReportDialog";
import ImageGallery from "@/components/common/ImageGallery";
import apiClient from "@/lib/api/client";
import { useAppToast } from "@/hooks/use-app-toast";

interface ServiceDetailPageProps {
  onNavigate: (
    page: string,
    data?: string | { productId?: string; chatAction?: "chat" | "nego" },
  ) => void;
  serviceId: string;
  isLoggedIn: boolean;
  currentUser?: any;
}

const REPORT_SERVICE_REASONS = [
  { id: "illegal_service", label: "Layanan terlarang / melanggar aturan" },
  { id: "fraud", label: "Indikasi penipuan (Scam)" },
  { id: "spam", label: "Spam / duplikasi layanan" },
  { id: "price_manipulation", label: "Harga tidak masuk akal / manipulasi" },
  { id: "inappropriate", label: "Mengandung konten vulgar/tidak pantas" },
  { id: "other", label: "Lainnya" },
];

export default function ServiceDetailPage({
  onNavigate,
  serviceId,
  isLoggedIn,
  currentUser,
}: ServiceDetailPageProps) {
  const { success, error: toastError } = useAppToast();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const fetchedIdRef = useRef<string | null>(null);

  // Report states
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportOtherReason, setReportOtherReason] = useState("");

  const handleAction = (action: () => void) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    action();
  };

  const handleReportOpen = () => {
    setReportReason("");
    setReportDescription("");
    setReportOtherReason("");
    setShowReportModal(true);
  };

  const handleReportSubmit = async () => {
    if (!reportReason || !reportDescription) {
      toastError("Laporan belum lengkap", "Pilih alasan dan masukkan deskripsi laporan");
      return;
    }

    const finalReason =
      reportReason === "other"
        ? reportOtherReason
        : REPORT_SERVICE_REASONS.find((r) => r.id === reportReason)?.label;

    if (!finalReason) {
      toastError("Laporan belum lengkap", "Alasan laporan tidak boleh kosong");
      return;
    }

    try {
      await apiClient.post("/reports", {
        reportedUserId: service.seller?.id,
        productId: service.id,
        reason: finalReason,
        description: reportDescription,
        type: "service", // Send type as requested
      });

      success("Laporan berhasil dikirim", "Laporan layanan sudah masuk ke admin untuk ditinjau");
      setShowReportModal(false);
    } catch (error: any) {
      toastError("Gagal mengirim laporan", error?.response?.data?.message || error?.message || "Terjadi kesalahan");
    }
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
        type="jasa"
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
      onOpenReport={handleReportOpen}
      currentUser={currentUser}
    />
  );

  const breadcrumbs = [
    { label: "Beranda", onClick: () => onNavigate("landing") },
    { label: "Layanan Jasa", onClick: () => onNavigate("services") },
    { label: service.title },
  ];

  const bottomContent = (
    <ProductDetailReportDialog
      open={showReportModal}
      onOpenChange={setShowReportModal}
      reportReason={reportReason}
      setReportReason={setReportReason}
      reportDescription={reportDescription}
      setReportDescription={setReportDescription}
      reportOtherReason={reportOtherReason}
      setReportOtherReason={setReportOtherReason}
      reportReasons={REPORT_SERVICE_REASONS}
      onSubmit={handleReportSubmit}
      title="Laporkan Layanan"
      description="Bantu kami menjaga kualitas layanan di KampusMarket"
      placeholder="Jelaskan secara detail mengapa Anda ingin melaporkan layanan ini..."
    />
  );

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
        bottomContent={bottomContent}
      />
    </>
  );
}
