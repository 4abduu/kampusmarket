import { useState } from "react";
import { Package, AlertCircle } from "lucide-react";

interface ProductImageProps {
  src?: string;
  alt?: string;
  className?: string;
  imageClassName?: string;
  showError?: boolean;
  fallbackImageUrl?: string;
}

/**
 * Reusable product image component with error handling.
 * Displays fallback image URL if provided, otherwise shows icon when image fails to load.
 */
export default function ProductImage({
  src,
  alt = "Produk",
  className = "bg-slate-100 dark:bg-slate-800 flex items-center justify-center",
  imageClassName = "w-full h-full object-cover",
  showError = false,
  fallbackImageUrl,
}: ProductImageProps) {
  const [imageError, setImageError] = useState(false);
  const hasImage = src && src.trim().length > 0;

  const handleImageError = () => {
    console.warn(`[ProductImage] Failed to load image: ${src}`);
    setImageError(true);
  };

  // If fallback image is provided and main image failed, show fallback
  if (fallbackImageUrl && imageError) {
    return (
      <img
        src={fallbackImageUrl}
        alt={alt}
        className={imageClassName}
        loading="lazy"
        decoding="async"
      />
    );
  }

  // No image provided or error occurred
  if (!hasImage || imageError) {
    return (
      <div className={className}>
        <div className="flex flex-col items-center justify-center gap-2">
          {showError && imageError ? (
            <>
              <AlertCircle className="h-8 w-8 text-red-500/50" />
              <span className="text-xs text-red-500 text-center">
                Gagal memuat gambar
              </span>
            </>
          ) : (
            <Package className="h-8 w-8 text-muted-foreground/30" />
          )}
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={imageClassName}
      onError={handleImageError}
      loading="lazy"
      decoding="async"
    />
  );
}
