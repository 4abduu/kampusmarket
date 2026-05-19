import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Star,
} from "lucide-react";

export interface ReviewInfo {
  reviewerName: string;
  reviewerAvatar?: string;
  rating: number;
  comment?: string;
  createdAt: string;
  productName?: string;
}

export interface ImageLightboxProps {
  src: string;
  alt: string;
  onClose: () => void;
  onPrev?: (() => void) | null;
  onNext?: (() => void) | null;
  currentIndex?: number;
  totalCount?: number;
  reviewInfo?: ReviewInfo;
}

export default function ImageLightbox({
  src,
  alt,
  onClose,
  onPrev,
  onNext,
  currentIndex = 0,
  totalCount = 1,
  reviewInfo,
}: ImageLightboxProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const MIN_SCALE = 1;
  const MAX_SCALE = 4;
  const SCALE_STEP = 0.5;

  const zoomIn = useCallback(() => {
    setScale((s) => Math.min(MAX_SCALE, s + SCALE_STEP));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((s) => {
      const next = Math.max(MIN_SCALE, s - SCALE_STEP);
      if (next <= 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const resetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Lock body scroll while lightbox is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          if (onPrev) {
            onPrev();
            resetZoom();
          }
          break;
        case "ArrowRight":
          if (onNext) {
            onNext();
            resetZoom();
          }
          break;
        case "+":
        case "=":
          zoomIn();
          break;
        case "-":
          zoomOut();
          break;
        case "0":
          resetZoom();
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, onPrev, onNext, zoomIn, zoomOut, resetZoom]);

  // Mouse wheel zoom — must use native listener with { passive: false }
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY < 0) zoomIn();
      else zoomOut();
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [zoomIn, zoomOut]);

  // Drag to pan (when zoomed in)
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (scale <= 1) return;
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    },
    [scale, position],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    },
    [isDragging, dragStart],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Double-click to toggle zoom
  const handleDoubleClick = useCallback(() => {
    if (scale > 1) {
      resetZoom();
    } else {
      setScale(2.5);
    }
  }, [scale, resetZoom]);

  return (
    <div
      className="fixed top-0 left-0 w-screen h-screen z-[100] bg-black/95 flex flex-col md:flex-row"
      style={{ margin: 0 }}
    >
      {/* Left Area: Main Image Viewer */}
      <div className="flex-1 flex flex-col relative h-[65vh] md:h-screen bg-black">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-black/60 backdrop-blur-sm z-10">
          <span className="text-white/70 text-sm font-medium">
            {totalCount > 1 ? `${currentIndex + 1} / ${totalCount}` : ""}
          </span>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="text-white/70 hover:text-white hover:bg-white/10 h-9 w-9"
              onClick={zoomOut}
              disabled={scale <= MIN_SCALE}
              title="Zoom out (−)"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-white/60 text-xs min-w-[3rem] text-center tabular-nums">
              {Math.round(scale * 100)}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="text-white/70 hover:text-white hover:bg-white/10 h-9 w-9"
              onClick={zoomIn}
              disabled={scale >= MAX_SCALE}
              title="Zoom in (+)"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white/70 hover:text-white hover:bg-white/10 h-9 w-9"
              onClick={resetZoom}
              title="Reset (0)"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <div className="w-px h-5 bg-white/20 mx-1" />
            <Button
              variant="ghost"
              size="icon"
              className="text-white/70 hover:text-white hover:bg-white/10 h-9 w-9"
              onClick={onClose}
              title="Tutup (Esc)"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Main image area */}
        <div
          ref={containerRef}
          className="flex-1 flex items-center justify-center overflow-hidden relative select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDoubleClick={handleDoubleClick}
          style={{
            cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in",
          }}
        >
          <img
            src={src}
            alt={alt}
            className="max-h-full max-w-full object-contain transition-transform duration-200 ease-out"
            style={{
              transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
            }}
            draggable={false}
          />

          {/* Left/Right navigation arrows */}
          {onPrev && (
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors z-10"
              onClick={(e) => {
                e.stopPropagation();
                resetZoom();
                onPrev();
              }}
              aria-label="Gambar sebelumnya"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}
          {onNext && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors z-10"
              onClick={(e) => {
                e.stopPropagation();
                resetZoom();
                onNext();
              }}
              aria-label="Gambar berikutnya"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* Help text */}
        <div className="text-center py-2 text-white/40 text-xs bg-black/60 backdrop-blur-sm z-10">
          Scroll atau +/− untuk zoom • Double-click untuk toggle • Drag untuk
          geser • ←→ untuk navigasi
        </div>
      </div>

      {/* Right Area: Shopee-like Review Details Panel */}
      {reviewInfo && (
        <div className="w-full md:w-96 bg-zinc-950 border-t md:border-t-0 md:border-l border-white/10 flex flex-col h-[35vh] md:h-screen text-white select-text shrink-0">
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-start gap-3">
            {reviewInfo.reviewerAvatar ? (
              <div className="h-10 w-10 rounded-full overflow-hidden bg-slate-800 shrink-0">
                <img src={reviewInfo.reviewerAvatar} alt={reviewInfo.reviewerName} className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="h-10 w-10 rounded-full shrink-0 flex items-center justify-center text-sm font-bold bg-primary-100 text-primary-700">
                {reviewInfo.reviewerName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm truncate">{reviewInfo.reviewerName}</h4>
              <div className="flex items-center gap-0.5 mt-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-3 w-3 ${
                      star <= reviewInfo.rating ? "fill-yellow-400 text-yellow-400" : "text-zinc-700"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 flex-1 overflow-y-auto space-y-4">
            <div>
              <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-1">Ulasan</p>
              <p className="text-sm text-zinc-100 whitespace-pre-line leading-relaxed">
                {reviewInfo.comment || <em className="text-zinc-500">Tidak ada komentar ulasan.</em>}
              </p>
            </div>

            {reviewInfo.productName && (
              <div>
                <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-1">Produk</p>
                <p className="text-sm text-primary-400 font-medium">
                  {reviewInfo.productName}
                </p>
              </div>
            )}

            <div>
              <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-1">Waktu</p>
              <p className="text-xs text-zinc-400">
                {new Date(reviewInfo.createdAt).toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
