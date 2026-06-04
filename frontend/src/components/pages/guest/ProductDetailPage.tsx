"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { getProductDetail } from "@/lib/api/products";
import apiClient from "@/lib/api/client";
import ImageGallery from "@/components/common/ImageGallery";
import ProductDetailLoginDialog from "@/components/pages/guest/product-detail/ProductDetailLoginDialog";
import ProductDetailReportDialog from "@/components/pages/guest/product-detail/ProductDetailReportDialog";
import ProductDetailSidebar from "@/components/pages/guest/product-detail/ProductDetailSidebar";
import ProductDetailTabsPanel from "@/components/pages/guest/product-detail/ProductDetailTabsPanel";
import DetailPageShell from "@/components/pages/guest/shared/DetailPageShell";
import { ProductDetailPageSkeleton } from "@/components/skeleton";
import { useAppToast } from "@/hooks/use-app-toast";

interface ProductDetailPageProps {
  onNavigate: (
    page: string,
    data?: string | { productId?: string; chatAction?: "chat" | "nego" },
  ) => void;
  isLoggedIn: boolean;
  onLogin: (role?: "user" | "admin") => void;
  currentUser?: any;
}

const REPORT_REASONS = [
  { id: "illegal_product", label: "Produk terlarang / melanggar hukum" },
  { id: "counterfeit", label: "Produk palsu / bajakan" },
  { id: "fraud", label: "Indikasi penipuan (Scam)" },
  { id: "wrong_category_spam", label: "Kategori salah / Spam" },
  { id: "price_manipulation", label: "Harga tidak masuk akal / manipulasi" },
  { id: "inappropriate", label: "Mengandung konten vulgar/tidak pantas" },
  { id: "other", label: "Lainnya" },
];

export default function ProductDetailPage({
  onNavigate,
  isLoggedIn,
  onLogin: _onLogin,
  currentUser,
}: ProductDetailPageProps) {
  const { success, error: toastError } = useAppToast();
  const params = useParams();
  const productId = params.id as string | undefined;
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportOtherReason, setReportOtherReason] = useState("");
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedIdRef = useRef<string | null>(null);

  // Fetch product detail
  useEffect(() => {
    if (!productId || fetchedIdRef.current === productId) {
      return;
    }
    fetchedIdRef.current = productId;

    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getProductDetail(productId);
        if (data.type !== "barang") {
          setError(
            "URL tidak valid untuk halaman ini. Silakan periksa kembali.",
          );
          return;
        }
        setProduct(data);
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setError("Gagal memuat detail produk. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

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
        : REPORT_REASONS.find((r) => r.id === reportReason)?.label;

    if (!finalReason) {
      toastError("Laporan belum lengkap", "Alasan laporan tidak boleh kosong");
      return;
    }

    try {
      await apiClient.post("/reports", {
        reportedUserId: product.seller?.id,
        productId: product.id,
        reason: finalReason,
        description: reportDescription,
        type: "product",
      });

      success("Laporan berhasil dikirim", "Laporan produk sudah masuk ke admin untuk ditinjau");
      setShowReportModal(false);
    } catch (error: any) {
      toastError("Gagal mengirim laporan", error?.response?.data?.message || error?.message || "Terjadi kesalahan");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Loading state
  if (loading) {
    return <ProductDetailPageSkeleton />;
  }

  // Error or not found
  if (error || !product) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-red-500">
                {error || "Produk tidak ditemukan"}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const mainContent = (
    <>
      <ImageGallery
        images={product.images || []}
        imagesDetail={product.imagesDetail}
        condition={product.condition}
        price={product.price}
        originalPrice={product.originalPrice}
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
        type="barang"
      />
      <ProductDetailTabsPanel
        productId={productId}
        description={product.description}
        shippingOptions={product.shippingOptions || []}
      />
    </>
  );

  const sidebarContent = (
    <ProductDetailSidebar
      product={product}
      quantity={quantity}
      setQuantity={setQuantity}
      formatPrice={formatPrice}
      onAction={handleAction}
      onNavigate={onNavigate}
      onOpenReport={handleReportOpen}
      currentUser={currentUser}
    />
  );

  const breadcrumbs = [
    { label: "Beranda", onClick: () => onNavigate("landing") },
    { label: "Katalog", onClick: () => onNavigate("catalog") },
    { label: product.title },
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
      reportReasons={REPORT_REASONS}
      onSubmit={handleReportSubmit}
      title="Laporkan Produk"
      description="Bantu kami menjaga kualitas produk di KampusMarket"
      placeholder="Jelaskan secara detail mengapa Anda ingin melaporkan produk ini..."
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
