import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";

export interface ImageLightboxProps {
  src: string;
  alt: string;
  onClose: () => void;
  onPrev?: (() => void) | null;
  onNext?: (() => void) | null;
  currentIndex?: number;
  totalCount?: number;
}

export default function ImageLightbox({
  src,
  alt,
  onClose,
  onPrev,
  onNext,
  currentIndex = 0,
  totalCount = 1,
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
      className="fixed top-0 left-0 w-screen h-screen z-[100] bg-black/95 flex flex-col"
      style={{ margin: 0 }}
    >
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
  );
}
