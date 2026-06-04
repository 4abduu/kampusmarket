import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from "lucide-react";
import ProductImage from "@/components/common/ProductImage";
import ImageLightbox from "@/components/common/ImageLightbox";
import { cn } from "@/lib/utils";


interface ImageDetail {
  url: string;
  alt?: string;
  isPrimary?: boolean;
}

interface ImageGalleryProps {
  /** Flat array of image URLs (backward compatible) */
  images: string[];
  /** Detailed image data with variant URLs (preferred) */
  imagesDetail?: ImageDetail[];
  condition?: string;
  price?: number;
  originalPrice?: number;
  selectedImage: number;
  setSelectedImage: (value: number) => void;
  customBadge?: React.ReactNode;
  disableInternalLightbox?: boolean;
  onImageClick?: () => void;
  /** Type of product: 'barang' or 'jasa' */
  type?: "barang" | "jasa" | string;
  /** Custom stroke width for the fallback icon */
  fallbackStrokeWidth?: number;
}

/* ──────────────────────────────────────────────
   Main Gallery Component
   ────────────────────────────────────────────── */

export default function ImageGallery({
  images,
  imagesDetail,
  condition,
  price,
  originalPrice,
  selectedImage,
  setSelectedImage,
  customBadge,
  disableInternalLightbox = false,
  onImageClick,
  type,
  fallbackStrokeWidth,
}: ImageGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Use imagesDetail when available, otherwise fall back to flat URL array
  const hasDetail = imagesDetail && imagesDetail.length > 0;
  const imageCount = hasDetail ? imagesDetail.length : images.length;

  const currentDetail = hasDetail ? imagesDetail[selectedImage] : null;
  const currentUrl = currentDetail?.url ?? images?.[selectedImage];

  // For lightbox: use the url directly
  const lightboxSrc = currentUrl;

  const openLightbox = () => setLightboxOpen(true);

  const lightboxPrev =
    selectedImage > 0
      ? () => setSelectedImage(selectedImage - 1)
      : null;

  const lightboxNext =
    selectedImage < imageCount - 1
      ? () => setSelectedImage(selectedImage + 1)
      : null;

  const [hasError, setHasError] = useState(false);

  // Sync / reset error state when image selection changes
  useEffect(() => {
    setHasError(false);
  }, [selectedImage, currentUrl]);

  const isClickable = !!currentUrl && !hasError;

  return (
    <>
      <div className="space-y-4">
        <Card className="overflow-hidden group relative">
          <div
            className={cn(
              "relative bg-slate-100 dark:bg-slate-800 h-96 flex items-center justify-center overflow-hidden",
              isClickable ? "cursor-pointer" : "cursor-default"
            )}
            onClick={isClickable ? (disableInternalLightbox ? onImageClick : openLightbox) : undefined}
            role={isClickable ? "button" : undefined}
            tabIndex={isClickable ? 0 : -1}
            aria-label={isClickable ? "Klik untuk memperbesar gambar" : undefined}
            onKeyDown={(e) => {
              if (isClickable && (e.key === "Enter" || e.key === " ")) {
                if (disableInternalLightbox) {
                  onImageClick?.();
                } else {
                  openLightbox();
                }
              }
            }}
          >
            <ProductImage
              src={currentUrl}
              alt={
                currentDetail?.alt ?? `Gambar produk ${selectedImage + 1}`
              }
              type={type}
              className="w-full h-full"
              imageClassName="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              showError={true}
              onError={() => setHasError(true)}
              strokeWidth={fallbackStrokeWidth ?? 2.8}
            />

            {/* Zoom hint overlay */}
            {isClickable && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5">
                  <Maximize2 className="h-4 w-4" />
                  Perbesar
                </div>
              </div>
            )}

            {/* Badges */}
            {customBadge ? (
               <div className="absolute top-4 left-4 z-10">{customBadge}</div>
            ) : condition ? (
              condition === "baru" ? (
                <Badge className="absolute top-4 left-4 bg-primary-500 z-10 text-white">
                  Baru
                </Badge>
              ) : (
                <Badge
                  className="absolute top-4 left-4 z-10 text-white"
                  variant="secondary"
                >
                  Bekas
                </Badge>
              )
            ) : null}

            {originalPrice && price && (
              <Badge className="absolute top-4 right-4 bg-red-500 z-10">
                -{Math.round((1 - price / originalPrice) * 100)}%
              </Badge>
            )}
          </div>

          {/* Navigation Buttons (Placed OUTSIDE the clickable image div to avoid click event overlap) */}
          {imageCount > 1 && (
            <>
              <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={`bg-white/80 transition-all touch-manipulation group/btn ${
                    selectedImage === 0
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-white"
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (selectedImage === 0) return;
                    setSelectedImage(Math.max(0, selectedImage - 1));
                  }}
                >
                  <ChevronLeft className="h-5 w-5 pointer-events-none transition-transform group-hover/btn:scale-110 group-active/btn:scale-75" />
                </Button>
              </div>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={`bg-white/80 transition-all touch-manipulation group/btn ${
                    selectedImage === imageCount - 1
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-white"
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (selectedImage === imageCount - 1) return;
                    setSelectedImage(Math.min(imageCount - 1, selectedImage + 1));
                  }}
                >
                  <ChevronRight className="h-5 w-5 pointer-events-none transition-transform group-hover/btn:scale-110 group-active/btn:scale-75" />
                </Button>
              </div>
            </>
          )}
        </Card>

        {/* Thumbnails */}
        {imageCount > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {Array.from({ length: imageCount }).map((_, index) => {
              const detail = hasDetail ? imagesDetail[index] : null;
              const thumbUrl =
                detail?.url ??
                images[index];

              return (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  aria-label={`Pilih gambar ${index + 1}`}
                  title={`Pilih gambar ${index + 1}`}
                  className={`shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden transition-colors ${
                    selectedImage === index
                      ? "border-primary-600"
                      : "border-transparent hover:border-slate-300"
                  }`}
                >
                  <ProductImage
                    src={thumbUrl}
                    alt={`Thumbnail ${index + 1}`}
                    type={type}
                    className="w-full h-full bg-slate-100 dark:bg-slate-800"
                    imageClassName="w-full h-full object-cover"
                    strokeWidth={2.25}
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox */}
      {lightboxOpen && lightboxSrc && (
        <ImageLightbox
          src={lightboxSrc}
          alt={currentDetail?.alt ?? `Gambar produk ${selectedImage + 1}`}
          onClose={() => setLightboxOpen(false)}
          onPrev={lightboxPrev}
          onNext={lightboxNext}
          currentIndex={selectedImage}
          totalCount={imageCount}
        />
      )}
    </>
  );
}
