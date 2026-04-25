"use client";

import { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Briefcase,
  ChevronLeft,
  Eye,
  Image as ImageIcon,
  ShoppingBag,
  Upload,
} from "lucide-react";
import ProductImage from "@/components/common/ProductImage";
import { mockOrders, mockReviews, type Order } from "@/lib/mock-data";
import RatingImagePreview from "@/components/pages/user/rating/RatingImagePreview";
import RatingOrderCard from "@/components/pages/user/rating/RatingOrderCard";
import RatingPreviewModal from "@/components/pages/user/rating/RatingPreviewModal";
import RatingStarPicker from "@/components/pages/user/rating/RatingStarPicker";
import RatingSuccessState from "@/components/pages/user/rating/RatingSuccessState";

interface RatingPageProps {
  onNavigate: (page: string) => void;
}

const MAX_COMMENT_LENGTH = 500;
const MAX_IMAGES = 5;

export default function RatingPage({ onNavigate }: RatingPageProps) {
  const completedOrders = mockOrders.filter(
    (order) => order.status === "completed",
  );
  const reviewedOrderIds = mockReviews.map((review) => review.orderId);
  const ordersToReview = completedOrders.filter(
    (order) => !reviewedOrderIds.includes(order.id),
  );

  const [step, setStep] = useState<"select" | "form" | "success">("select");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const resetForm = () => {
    setSelectedOrder(null);
    setRating(0);
    setComment("");
    setImages([]);
    setShowPreview(false);
  };

  const handleOrderSelect = (order: Order) => {
    setSelectedOrder(order);
    setStep("form");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = MAX_IMAGES - images.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    console.log({
      orderId: selectedOrder?.id,
      rating,
      comment,
      images,
    });
    setStep("success");
  };

  const handleBack = () => {
    if (step === "form") {
      setStep("select");
      resetForm();
      return;
    }

    onNavigate("orders");
  };

  const isFormValid = rating > 0;

  if (step === "success") {
    return <RatingSuccessState onNavigate={onNavigate} />;
  }

  if (step === "select") {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onNavigate("orders")}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Beri Rating</h1>
              <p className="text-muted-foreground">
                Pilih pesanan yang ingin di-review
              </p>
            </div>
          </div>

          {ordersToReview.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-4">
                {ordersToReview.length} pesanan selesai menunggu review
              </p>
              <ScrollArea className="max-h-[calc(100vh-250px)]">
                <div className="space-y-3 pr-4">
                  {ordersToReview.map((order) => (
                    <RatingOrderCard
                      key={order.id}
                      order={order}
                      isSelected={selectedOrder?.id === order.id}
                      onSelect={() => handleOrderSelect(order)}
                      formatPrice={formatPrice}
                    />
                  ))}
                </div>
              </ScrollArea>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-2">
                  Tidak Ada Pesanan untuk Di-review
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Semua pesanan yang sudah selesai sudah kamu review.
                </p>
                <Button variant="outline" onClick={() => onNavigate("catalog")}>
                  Belanja Sekarang
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Beri Rating</h1>
            <p className="text-muted-foreground">
              Bagikan pengalaman belanjamu
            </p>
          </div>
        </div>

        {selectedOrder && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div
                  className={`w-16 h-16 rounded-lg flex items-center justify-center shrink-0 overflow-hidden ${selectedOrder.productType === "jasa" ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-slate-100 dark:bg-slate-800"}`}
                >
                  {selectedOrder.productType === "jasa" ? (
                    <Briefcase className="h-8 w-8 text-emerald-600/70" />
                  ) : (
                    <ProductImage
                      src={selectedOrder.product.images?.[0]}
                      alt={selectedOrder.productTitle}
                      className="w-full h-full"
                      imageClassName="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div>
                  <p className="font-medium">{selectedOrder.productTitle}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(selectedOrder.finalPrice)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    dari {selectedOrder.seller.name}
                  </p>
                  <Badge variant="secondary" className="mt-2 text-xs">
                    {selectedOrder.productType === "barang" ? "Barang" : "Jasa"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">Rating Produk</CardTitle>
            <CardDescription>
              Bagaimana kualitas produk/jasa ini?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center py-4">
              <RatingStarPicker value={rating} onChange={setRating} />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">Ulasan</CardTitle>
            <CardDescription>
              Ceritakan pengalamanmu dengan produk/jasa ini
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Contoh: Barang sesuai deskripsi, pengiriman cepat, recommended seller!"
              rows={4}
              value={comment}
              onChange={(e) => {
                if (e.target.value.length <= MAX_COMMENT_LENGTH) {
                  setComment(e.target.value);
                }
              }}
              className="resize-none"
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-muted-foreground">
                {comment.length > 0 && comment.length < 20 && (
                  <span className="text-amber-500">
                    Minimal 20 karakter untuk ulasan yang bermanfaat
                  </span>
                )}
              </p>
              <p
                className={`text-xs ${comment.length >= MAX_COMMENT_LENGTH * 0.9 ? "text-amber-500" : "text-muted-foreground"}`}
              >
                {comment.length}/{MAX_COMMENT_LENGTH}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Foto (Opsional)</CardTitle>
            <CardDescription>
              Tambahkan foto untuk ulasan yang lebih informatif (maks.{" "}
              {MAX_IMAGES} foto)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RatingImagePreview images={images} onRemove={handleRemoveImage} />

            {images.length < MAX_IMAGES && (
              <div
                className={`mt-3 ${images.length > 0 ? "" : "border-2 border-dashed border-slate-200 dark:border-slate-700"} rounded-lg`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className={`flex flex-col items-center justify-center cursor-pointer transition-colors ${
                    images.length > 0
                      ? "bg-slate-50 dark:bg-slate-900 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                      : "py-8 hover:bg-slate-50 dark:hover:bg-slate-900"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2">
                    {images.length > 0 ? (
                      <Upload className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-sm font-medium">
                    {images.length > 0 ? "Tambah Foto" : "Upload Foto"}
                  </p>
                  {images.length === 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Klik atau drag & drop gambar di sini
                    </p>
                  )}
                </label>
              </div>
            )}

            {images.length > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                {images.length}/{MAX_IMAGES} foto terupload
              </p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Button
            className="w-full bg-primary-600 hover:bg-primary-700"
            size="lg"
            disabled={!isFormValid}
            onClick={() => setShowPreview(true)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Lihat Preview
          </Button>

          {!isFormValid && (
            <p className="text-center text-sm text-muted-foreground">
              Beri rating untuk melanjutkan
            </p>
          )}
        </div>

        <RatingPreviewModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          onSubmit={handleSubmit}
          selectedOrder={selectedOrder}
          rating={rating}
          comment={comment}
          images={images}
          formatPrice={formatPrice}
        />
      </div>
    </div>
  );
}
