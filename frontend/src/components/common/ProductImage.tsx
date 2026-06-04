import { useState, useEffect } from "react";
import { Package, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductImageProps {
  /** Primary image URL */
  src?: string;
  alt?: string;
  className?: string;
  imageClassName?: string;
  showError?: boolean;
  fallbackImageUrl?: string;
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
  type = "barang",
  onLoad,
  onError,
  fallbackIconClassName,
  strokeWidth,
}: ProductImageProps) {
  const [imageError, setImageError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Reset loading and error states if src changes
  useEffect(() => {
    setImageError(false);
    setLoaded(false);
  }, [src]);

  // Determine the best src to use
  const hasImage = src && typeof src === "string" && src.trim().length > 0;

  const handleImageError = () => {
    if (!imageError) {
      console.warn(`[ProductImage] Failed to load image: ${src}`);
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
    
    // Icon size scales dynamically relative to the container size
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

  return (
    <div className={cn("relative overflow-hidden w-full h-full", className)}>
      <img
        src={src}
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

      {/* Pulse placeholder while loading */}
      {!loaded && (
        <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse" />
      )}
    </div>
  );
}
