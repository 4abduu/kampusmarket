"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { getProductDetail } from "@/lib/api/products";
import ProductDetailGallery from "@/components/pages/guest/product-detail/ProductDetailGallery";
import ProductDetailLoginDialog from "@/components/pages/guest/product-detail/ProductDetailLoginDialog";
import ProductDetailReportDialog from "@/components/pages/guest/product-detail/ProductDetailReportDialog";
import ProductDetailSidebar from "@/components/pages/guest/product-detail/ProductDetailSidebar";
import ProductDetailTabsPanel from "@/components/pages/guest/product-detail/ProductDetailTabsPanel";
import DetailPageShell from "@/components/pages/guest/shared/DetailPageShell";
import ProductDetailPageSkeleton from "@/components/skeleton/ProductDetailPageSkeleton";

interface ProductDetailPageProps {
  onNavigate: (
    page: string,
    data?: string | { productId?: string; chatAction?: "chat" | "nego" },
  ) => void;
  isLoggedIn: boolean;
  onLogin: (role?: "user" | "admin") => void;
}

const REPORT_REASONS = [
  { id: "not_as_described", label: "Barang tidak sesuai deskripsi" },
  { id: "seller_unresponsive", label: "Penjual tidak responsif" },
  { id: "fraud", label: "Penipuan / Produk palsu" },
  { id: "damaged", label: "Barang rusak saat dikirim" },
  { id: "misleading_photos", label: "Foto menyesatkan" },
  { id: "price_issue", label: "Harga bermasalah" },
  { id: "other", label: "Lainnya" },
];

export default function ProductDetailPage({
  onNavigate,
  isLoggedIn,
  onLogin: _onLogin,
}: ProductDetailPageProps) {
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

  const handleReportSubmit = () => {
    if (!reportReason || !reportDescription) {
      alert("Pilih alasan dan masukkan deskripsi laporan");
      return;
    }

    const finalReason =
      reportReason === "other"
        ? reportOtherReason
        : REPORT_REASONS.find((r) => r.id === reportReason)?.label;

    if (!finalReason) {
      alert("Deskripsi alasan laporan tidak boleh kosong");
      return;
    }

    alert(
      `Laporan produk berhasil dikirim!\nAlasan: ${finalReason}\nDeskripsi: ${reportDescription}`,
    );
    setShowReportModal(false);
    setReportReason("");
    setReportDescription("");
    setReportOtherReason("");
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
      <ProductDetailGallery
        images={product.images || []}
        condition={product.condition}
        price={product.price}
        originalPrice={product.originalPrice}
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
      />
      <ProductDetailTabsPanel
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
      onOpenReport={() => setShowReportModal(true)}
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
