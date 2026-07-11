"use client";

import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FetchErrorCardProps {
  /** Pesan error utama (opsional, ada default) */
  message?: string;
  /** Pesan detail tambahan di bawah judul */
  detail?: string;
  /** Handler untuk tombol "Coba Lagi". Jika tidak diberikan, default reload halaman */
  onRetry?: () => void;
  /** Handler untuk tombol "Kembali ke Beranda". Jika tidak diberikan, tombol tidak ditampilkan */
  onGoHome?: () => void;
  /** Label tombol retry (default: "Coba Lagi") */
  retryLabel?: string;
  /** Variant tampilan: 'inline' untuk di dalam section, 'page' untuk full-page center */
  variant?: "inline" | "page";
}

/**
 * FetchErrorCard — Komponen error state yang cantik dan konsisten
 * untuk dipakai di seluruh halaman saat data gagal dimuat.
 * Responsif untuk desktop dan mobile.
 */
export default function FetchErrorCard({
  message = "Gagal memuat data",
  detail,
  onRetry,
  onGoHome,
  retryLabel = "Coba Lagi",
  variant = "inline",
}: FetchErrorCardProps) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const content = (
    <div className="flex flex-col items-center text-center px-4 py-8 sm:py-12">
      {/* Icon Container */}
      <div className="relative mb-5">
        <div className="absolute inset-0 rounded-full bg-amber-200/30 blur-xl" />
        <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full border border-amber-200/80 bg-gradient-to-br from-amber-50 to-amber-100 shadow-lg shadow-amber-900/5">
          <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10 text-amber-600" />
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200/80 bg-amber-50/80 px-3 py-1.5 backdrop-blur-sm">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
        </span>
        <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.15em] text-amber-700">
          Koneksi Terganggu
        </span>
      </div>

      {/* Message */}
      <h3 className="mb-2 text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
        {message}
      </h3>
      <p className="mb-6 max-w-sm text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        {detail || "Terjadi kesalahan saat memuat data. Periksa koneksi internet kamu dan coba lagi."}
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col items-center gap-2.5 sm:flex-row">
        <Button
          onClick={handleRetry}
          size="sm"
          className="h-9 gap-2 bg-emerald-600 px-5 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 transition-all duration-200 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/25"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          {retryLabel}
        </Button>
        {onGoHome && (
          <Button
            onClick={onGoHome}
            size="sm"
            variant="outline"
            className="h-9 gap-2 border-slate-200 px-5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Home className="h-3.5 w-3.5" />
            Beranda
          </Button>
        )}
      </div>
    </div>
  );

  if (variant === "page") {
    return (
      <div className="min-h-[calc(100dvh-64px)] flex items-center justify-center bg-slate-50 dark:bg-slate-900/50">
        <div className="w-full max-w-md mx-auto">
          <div className="rounded-2xl border border-slate-200/80 bg-white/80 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/80">
            {content}
          </div>
        </div>
      </div>
    );
  }

  // Inline variant — rounded card yang fit di dalam layout halaman
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/80 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/80 overflow-hidden">
      {content}
    </div>
  );
}
