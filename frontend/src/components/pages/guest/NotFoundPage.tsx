"use client";

import { ArrowRight, Home, Search, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotFoundPageProps {
  onNavigate?: (page: string) => void;
}

export default function NotFoundPage({ onNavigate }: NotFoundPageProps) {
  const handleSearchClick = () => {
    if (onNavigate) {
      onNavigate("search");
    } else {
      window.location.href = "/search";
    }
  };

  const handleHomeClick = () => {
    if (onNavigate) {
      onNavigate("landing");
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-emerald-50 px-4 py-10 sm:px-6 lg:px-10">
      <div className="pointer-events-none absolute -top-24 left-[-4rem] h-72 w-72 rounded-full bg-emerald-200/70 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-5rem] right-[-4rem] h-80 w-80 rounded-full bg-emerald-300/60 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.08),_transparent_36%),radial-gradient(circle_at_80%_20%,_rgba(52,211,153,0.12),_transparent_20%)]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[1.15fr_.85fr]">
          <div className="order-2 lg:order-1">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700 backdrop-blur-sm">
              <AlertCircle className="h-3.5 w-3.5" />
              Page not found
            </div>

            <div className="space-y-5">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-600/80">
                404
              </p>
              <h1 className="max-w-xl text-4xl font-black tracking-tight text-emerald-950 sm:text-6xl lg:text-7xl">
                Halaman yang kamu cari tidak ada.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-emerald-900/75 sm:text-lg">
                Mungkin link-nya salah, atau halaman sudah dihapus. Coba cek URL-nya lagi atau kembali ke beranda untuk jelajahi KampusMarket.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                onClick={handleSearchClick}
                size="lg"
                className="h-12 gap-2 bg-emerald-600 px-6 font-semibold text-white hover:bg-emerald-700"
              >
                <Search className="h-4 w-4" />
                Cari Produk
                <ArrowRight className="h-4 w-4" />
              </Button>

              <Button
                onClick={handleHomeClick}
                size="lg"
                variant="outline"
                className="h-12 gap-2 border-emerald-300 bg-white/50 px-6 font-semibold text-emerald-800 hover:bg-emerald-100"
              >
                <Home className="h-4 w-4" />
                Beranda
              </Button>
            </div>

            <p className="mt-6 max-w-xl text-sm leading-7 text-emerald-900/55">
              Kalau kamu yakin link ini seharusnya bekerja, hubungi support kami atau laporkan masalah ini agar kami bisa memperbaiki.
            </p>
          </div>

          <div className="order-1 flex justify-center lg:order-2 lg:justify-end">
            <div className="relative w-full max-w-md">
              <div className="absolute inset-x-10 top-10 h-56 rounded-full bg-emerald-300/30 blur-3xl" />

              <div className="relative mx-auto aspect-square w-full max-w-[26rem]">
                <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-emerald-300/70 bg-white/35 backdrop-blur-sm" />

                <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-5">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-emerald-300/40 blur-2xl" />
                    <div className="relative flex h-40 w-40 items-center justify-center rounded-full border border-emerald-200 bg-gradient-to-br from-emerald-100 to-emerald-200 shadow-xl shadow-emerald-900/10">
                      <AlertCircle className="h-20 w-20 text-emerald-800" />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-full border border-emerald-200 bg-white/70 px-4 py-2 text-sm font-medium text-emerald-800 shadow-sm backdrop-blur-sm">
                    <div className="h-2.5 w-2.5 rounded-full bg-orange-500/80" />
                    Not found
                  </div>
                </div>

                <div className="absolute left-8 top-14 h-4 w-4 rounded-full bg-emerald-500/80 shadow-[0_0_0_8px_rgba(16,185,129,0.14)]" />
                <div className="absolute right-16 top-20 h-3 w-3 rounded-full bg-emerald-400/80 shadow-[0_0_0_8px_rgba(16,185,129,0.12)]" />
                <div className="absolute bottom-16 left-12 h-3 w-3 rounded-full bg-emerald-500/70 shadow-[0_0_0_8px_rgba(16,185,129,0.10)]" />

                <div className="absolute right-10 bottom-14 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-white/80 px-3 py-2 text-xs font-semibold text-emerald-700 shadow-sm backdrop-blur-sm">
                  <span className="h-2 w-2 rounded-full bg-orange-500" />
                  Missing page
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
