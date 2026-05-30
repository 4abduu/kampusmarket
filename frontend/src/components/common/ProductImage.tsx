import { useState } from "react";
import { Package, AlertCircle, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Variant sizes mapped to max-width media queries.
 * Browser selects the most appropriate source for the viewport.
 */
const VARIANT_MEDIA: Record<string, string> = {
  thumbnail: "(max-width: 200px)",
  small: "(max-width: 400px)",
  medium: "(max-width: 768px)",
  large: "(max-width: 1280px)",
  // original has no media — it's the default fallback
};

/** Order in which variants should appear in <picture> sources (smallest first) */
const VARIANT_ORDER = ["thumbnail", "small", "medium", "large", "original"] as const;

export interface ImageVariants {
  thumbnail?: string;
  small?: string;
  medium?: string;
  large?: string;
  original?: string;
}

interface ProductImageProps {
  /** Primary image URL (will be used as <img> src fallback) */
  src?: string;
  alt?: string;
  className?: string;
  imageClassName?: string;
  showError?: boolean;
  fallbackImageUrl?: string;
  /** Optional variant URLs for responsive <picture> element */
  variants?: ImageVariants;
  /** Preferred size to use as primary src when variants available */
  preferredSize?: keyof ImageVariants;
  /** Type of product: 'barang' (Package/gray) or 'jasa' (Briefcase/green) */
  type?: "barang" | "jasa" | string;
}

/**
 * Industry-standard product image component.
 *
 * Features:
 * - Responsive <picture> element with srcset when variants are provided
 * - Lazy loading with native loading="lazy"
 * - Graceful error handling with fallback icon
 * - Blur-up loading animation
 */
export default function ProductImage({
  src,
  alt = "Produk",
  className = "bg-slate-100 dark:bg-slate-800 flex items-center justify-center",
  imageClassName = "w-full h-full object-cover",
  showError = false,
  fallbackImageUrl,
  variants,
  preferredSize = "small",
  type = "barang",
}: ProductImageProps) {
  const [imageError, setImageError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Determine the best src to use
  const primarySrc = variants?.[preferredSize] || variants?.small || src;
  const hasImage = primarySrc && primarySrc.trim().length > 0;

  const handleImageError = () => {
    if (!imageError) {
      console.warn(`[ProductImage] Failed to load image: ${primarySrc}`);
      setImageError(true);
    }
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
    const isService = type === "jasa";
    const FallbackIcon = isService ? Briefcase : Package;
    
    // Green theme for service (jasa), Grey theme for goods (barang)
    // Background: Level 50 (bg-slate-50 dark:bg-slate-900/50 vs bg-emerald-50 dark:bg-emerald-950/20)
    // Icon: Level 600 with 50% opacity (text-slate-600/50 vs text-emerald-600/50)
    const bgClass = isService 
      ? "bg-emerald-50 dark:bg-emerald-950/20" 
      : "bg-slate-50 dark:bg-slate-900/50";
    
    const iconClass = isService 
      ? "text-emerald-600/50" 
      : "text-slate-600/50";

    return (
      <div className={cn(className, bgClass)}>
        <div className="flex flex-col items-center justify-center gap-2">
          {showError && imageError ? (
            <>
              <AlertCircle className="h-8 w-8 text-red-500/50" />
              <span className="text-xs text-red-500 text-center">
                Gagal memuat gambar
              </span>
            </>
          ) : (
            <FallbackIcon className={cn("h-8 w-8", iconClass)} />
          )}
        </div>
      </div>
    );
  }

  // If we have variant URLs, render <picture> for responsive loading
  const hasVariants = variants && Object.keys(variants).length > 1;

  if (hasVariants) {
    return (
      <picture className={className}>
        {VARIANT_ORDER.map((size) => {
          const url = variants[size];
          const media = VARIANT_MEDIA[size];
          if (!url || !media) return null; // skip original (no media) and missing
          return (
            <source key={size} srcSet={url} type="image/webp" media={media} />
          );
        })}
        <img
          src={variants.original || variants.large || primarySrc}
          alt={alt}
          className={`${imageClassName} transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setLoaded(true)}
          onError={handleImageError}
          loading="lazy"
          decoding="async"
        />
        {/* Pulse placeholder while loading */}
        {!loaded && (
          <div className="absolute inset-0 bg-slate-200 dark:bg-slate-700 animate-pulse rounded" />
        )}
      </picture>
    );
  }

  // Simple <img> fallback (for external URLs, seeded data, etc.)
  return (
    <img
      src={primarySrc}
      alt={alt}
      className={imageClassName}
      onError={handleImageError}
      loading="lazy"
      decoding="async"
    />
  );
}
