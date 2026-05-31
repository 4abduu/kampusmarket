import { useState, useEffect } from "react";
import { Package, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

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
  /** Callback triggered when the image successfully loads */
  onLoad?: () => void;
  /** Callback triggered when the image fails to load */
  onError?: () => void;
  /** Optional custom class for the fallback icon (e.g., to override default sizes) */
  fallbackIconClassName?: string;
  /** Optional custom stroke width for the fallback icon (default: 2) */
  strokeWidth?: number;
}

/**
 * Standardized KampusMarket product & service image component with unified fallbacks.
 */
export default function ProductImage({
  src,
  alt = "Produk",
  className = "w-full h-full flex items-center justify-center bg-muted",
  imageClassName = "w-full h-full object-cover",
  variants,
  preferredSize = "small",
  type = "barang",
  onLoad,
  onError,
  fallbackIconClassName,
  strokeWidth,
}: ProductImageProps) {
  const [imageError, setImageError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Reset loading and error states if src or variants change
  useEffect(() => {
    setImageError(false);
    setLoaded(false);
  }, [src, JSON.stringify(variants)]);

  // Determine the best src to use
  const primarySrc = variants?.[preferredSize] || variants?.small || src;
  const hasImage = primarySrc && typeof primarySrc === "string" && primarySrc.trim().length > 0;

  const handleImageError = () => {
    if (!imageError) {
      console.warn(`[ProductImage] Failed to load image: ${primarySrc}`);
      setImageError(true);
      onError?.();
    }
  };

  const handleImageLoad = () => {
    setLoaded(true);
    onLoad?.();
  };

  // Fallback jika gambar bernilai null, kosong, atau gagal dimuat
  if (!hasImage || imageError) {
    const isService = type === "jasa";
    const FallbackIcon = isService ? Briefcase : Package;
    
    // Icon size scales dynamically relative to the container size:
    // Targets 40% of container size (w-[40%] h-[40%])
    // Clamp limits: min 20px (for small w-12 h-12 rows) and max 80px (for h-96 galleries)
    const iconClass = cn(
      "w-[40%] h-[40%] min-w-[20px] min-h-[20px] max-w-[80px] max-h-[80px]",
      fallbackIconClassName
    );

    const activeStrokeWidth = strokeWidth ?? 2.5;

    return (
      <div className={cn("w-full h-full flex items-center justify-center", className)}>
        {type === "jasa" ? (
          <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-500">
            <FallbackIcon className={iconClass} strokeWidth={activeStrokeWidth} strokeOpacity={0.5} />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
            <FallbackIcon className={iconClass} strokeWidth={activeStrokeWidth} strokeOpacity={0.5} />
          </div>
        )}
      </div>
    );
  }

  const hasVariants = variants && Object.keys(variants).length > 1;

  return (
    <div className={cn("relative overflow-hidden w-full h-full", className)}>
      {hasVariants ? (
        <picture className="w-full h-full">
          {Object.entries(variants).map(([size, url]) => {
            if (!url || size === "original") return null;
            const media =
              size === "thumbnail"
                ? "(max-width: 200px)"
                : size === "small"
                  ? "(max-width: 400px)"
                  : size === "medium"
                    ? "(max-width: 768px)"
                    : "(max-width: 1280px)";
            return (
              <source key={size} srcSet={url} type="image/webp" media={media} />
            );
          })}
          <img
            src={variants.original || variants.large || primarySrc}
            alt={alt}
            className={cn(
              imageClassName,
              "transition-opacity duration-300",
              loaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
            decoding="async"
          />
        </picture>
      ) : (
        <img
          src={primarySrc}
          alt={alt}
          className={cn(
            imageClassName,
            "transition-opacity duration-300",
            loaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
          decoding="async"
        />
      )}

      {/* Pulse placeholder while loading */}
      {!loaded && (
        <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse" />
      )}
    </div>
  );
}
