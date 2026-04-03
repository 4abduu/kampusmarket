"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Star,
  Package,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Upload,
  X,
  Image as ImageIcon,
  Eye,
  Edit3,
  Trash2,
  Clock,
  ShoppingBag,
} from "lucide-react";
import { mockOrders, mockReviews, type Order, type Review } from "@/lib/mock-data";

interface RatingPageProps {
  onNavigate: (page: string) => void;
}

// Star Rating Component
function StarRating({
  value,
  onChange,
  size = "lg",
  readOnly = false,
}: {
  value: number;
  onChange?: (value: number) => void;
  size?: "sm" | "lg";
  readOnly?: boolean;
}) {
  const [hoverValue, setHoverValue] = useState(0);

  const ratingLabels: Record<number, string> = {
    0: "Klik untuk memberi rating",
    1: "Sangat Kurang",
    2: "Kurang",
    3: "Cukup Baik",
    4: "Baik",
    5: "Sangat Baik",
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => !readOnly && onChange?.(star)}
            onMouseEnter={() => !readOnly && setHoverValue(star)}
            onMouseLeave={() => !readOnly && setHoverValue(0)}
            className={`focus:outline-none transition-transform ${
              !readOnly ? "hover:scale-110 cursor-pointer" : "cursor-default"
            }`}
            disabled={readOnly}
          >
            <Star
              className={`${size === "lg" ? "h-8 w-8" : "h-6 w-6"} transition-colors ${
                star <= (hoverValue || value)
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700"
              }`}
            />
          </button>
        ))}
      </div>
      {!readOnly && (
        <p className="text-sm text-muted-foreground min-h-[20px]">
          {ratingLabels[hoverValue || value]}
        </p>
      )}
    </div>
  );
}

// Order Selection Card Component
function OrderCard({
  order,
  isSelected,
  onSelect,
}: {
  order: Order;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected
          ? "ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-950/20"
          : "hover:border-primary-300"
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
            {order.product.images[0] ? (
              <img
                src={order.product.images[0]}
                alt={order.productTitle}
                className="w-full h-full object-cover"
              />
            ) : (
              <Package className="h-8 w-8 text-muted-foreground/30" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium truncate">{order.productTitle}</p>
              {isSelected && (
                <CheckCircle2 className="h-5 w-5 text-primary-500 shrink-0" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {formatPrice(order.finalPrice)}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {order.productType === "barang" ? "Barang" : "Jasa"}
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDate(order.completedAt || order.createdAt)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              dari <span className="font-medium">{order.seller.name}</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Image Preview Component
function ImagePreview({
  images,
  onRemove,
}: {
  images: string[];
  onRemove: (index: number) => void;
}) {
  if (images.length === 0) return null;

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
      {images.map((img, index) => (
        <div
          key={index}
          className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 group"
        >
          <img
            src={img}
            alt={`Preview ${index + 1}`}
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

// Preview Modal Component
function PreviewModal({
  isOpen,
  onClose,
  onSubmit,
  selectedOrder,
  rating,
  comment,
  images,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  selectedOrder: Order | null;
  rating: number;
  comment: string;
  images: string[];
}) {
  if (!isOpen || !selectedOrder) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Preview Ulasan
          </CardTitle>
          <CardDescription>
            Periksa ulasan kamu sebelum mengirim
          </CardDescription>
        </CardHeader>
        <ScrollArea className="max-h-[60vh]">
          <CardContent className="p-6 space-y-6">
            {/* Order Info */}
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                {selectedOrder.product.images[0] ? (
                  <img
                    src={selectedOrder.product.images[0]}
                    alt={selectedOrder.productTitle}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="h-8 w-8 text-muted-foreground/30" />
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
              </div>
            </div>

            <Separator />

            {/* Rating Preview */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Rating</p>
              <div className="flex justify-center">
                <StarRating value={rating} size="lg" readOnly />
              </div>
              <p className="font-medium mt-2">{rating}/5</p>
            </div>

            <Separator />

            {/* Comment Preview */}
            {comment && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Ulasan</p>
                  <p className="text-sm bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                    {comment}
                  </p>
                </div>
                <Separator />
              </>
            )}

            {/* Images Preview */}
            {images.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Foto ({images.length})
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {images.map((img, index) => (
                    <div
                      key={index}
                      className="aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800"
                    >
                      <img
                        src={img}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </ScrollArea>
        <div className="border-t p-4 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            <Edit3 className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            className="flex-1 bg-primary-600 hover:bg-primary-700"
            onClick={onSubmit}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Kirim Ulasan
          </Button>
        </div>
      </Card>
    </div>
  );
}

// Success State Component
function SuccessState({ onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="p-8">
          <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-10 w-10 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Terima Kasih!</h2>
          <p className="text-muted-foreground mb-6">
            Rating dan ulasan kamu sangat membantu penjual dan pembeli lainnya.
          </p>
          <div className="space-y-3">
            <Button
              className="w-full bg-primary-600 hover:bg-primary-700"
              onClick={() => onNavigate("dashboard")}
            >
              Kembali ke Dashboard
            </Button>
            <Button variant="outline" className="w-full" onClick={() => onNavigate("catalog")}>
              Belanja Lagi
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function RatingPage({ onNavigate }: RatingPageProps) {
  // Get completed orders that haven't been reviewed yet
  const completedOrders = mockOrders.filter((order) => order.status === "completed");
  const reviewedOrderIds = mockReviews.map((r) => r.orderId);
  const ordersToReview = completedOrders.filter(
    (order) => !reviewedOrderIds.includes(order.id)
  );

  // State
  const [step, setStep] = useState<"select" | "form" | "success">("select");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_COMMENT_LENGTH = 500;
  const MAX_IMAGES = 5;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
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

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    // In real app, this would submit to API
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
      setSelectedOrder(null);
      setRating(0);
      setComment("");
      setImages([]);
    } else {
      onNavigate("orders");
    }
  };

  const isFormValid = rating > 0;

  // Success State
  if (step === "success") {
    return <SuccessState onNavigate={onNavigate} />;
  }

  // Order Selection Step
  if (step === "select") {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => onNavigate("orders")}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Beri Rating</h1>
              <p className="text-muted-foreground">
                Pilih pesanan yang ingin di-review
              </p>
            </div>
          </div>

          {/* Orders List */}
          {ordersToReview.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-4">
                {ordersToReview.length} pesanan selesai menunggu review
              </p>
              <ScrollArea className="max-h-[calc(100vh-250px)]">
                <div className="space-y-3 pr-4">
                  {ordersToReview.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      isSelected={selectedOrder?.id === order.id}
                      onSelect={() => handleOrderSelect(order)}
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
                <h3 className="font-medium mb-2">Tidak Ada Pesanan untuk Di-review</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Semua pesanan yang sudah selesai sudah kamu review.
                </p>
                <Button
                  variant="outline"
                  onClick={() => onNavigate("catalog")}
                >
                  Belanja Sekarang
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // Form Step
  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
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

        {/* Order Summary */}
        {selectedOrder && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                  {selectedOrder.product.images[0] ? (
                    <img
                      src={selectedOrder.product.images[0]}
                      alt={selectedOrder.productTitle}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="h-8 w-8 text-muted-foreground/30" />
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
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rating Section */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">Rating Produk</CardTitle>
            <CardDescription>
              Bagaimana kualitas produk/jasa ini?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center py-4">
              <StarRating value={rating} onChange={setRating} />
            </div>
          </CardContent>
        </Card>

        {/* Comment Section */}
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
              <p className={`text-xs ${
                comment.length >= MAX_COMMENT_LENGTH * 0.9
                  ? "text-amber-500"
                  : "text-muted-foreground"
              }`}>
                {comment.length}/{MAX_COMMENT_LENGTH}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Image Upload Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Foto (Opsional)</CardTitle>
            <CardDescription>
              Tambahkan foto untuk ulasan yang lebih informatif (maks. {MAX_IMAGES} foto)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImagePreview images={images} onRemove={handleRemoveImage} />

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

        {/* Action Buttons */}
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

        {/* Preview Modal */}
        <PreviewModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          onSubmit={handleSubmit}
          selectedOrder={selectedOrder}
          rating={rating}
          comment={comment}
          images={images}
        />
      </div>
    </div>
  );
}
