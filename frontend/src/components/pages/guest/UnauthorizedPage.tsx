"use client";

import { ArrowRight, Bot, Home, LogIn, ShieldAlert, ShieldX, UserPlus, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UnauthorizedPageProps {
  onNavigate?: (page: string) => void;
  variant?: "guest" | "forbidden";
}

export default function UnauthorizedPage({ onNavigate, variant = "guest" }: UnauthorizedPageProps) {
  const isForbidden = variant === "forbidden";

  const handleLoginClick = () => {
    if (onNavigate) {
      onNavigate("login");
    } else {
      window.location.href = "/login";
    }
  };

  const handleRegisterClick = () => {
    if (onNavigate) {
      onNavigate("register");
    } else {
      window.location.href = "/register";
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
              {isForbidden ? <ShieldX className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}
              {isForbidden ? "Admin access only" : "Access restricted"}
            </div>

            <div className="space-y-5">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-600/80">
                {isForbidden ? "401 / 403" : "403"}
              </p>
              <h1 className="max-w-xl text-4xl font-black tracking-tight text-emerald-950 sm:text-6xl lg:text-7xl">
                {isForbidden ? "Kamu tidak punya izin untuk membuka halaman ini." : "Kamu perlu masuk dulu untuk lanjut."}
              </h1>
              <p className="max-w-2xl text-base leading-8 text-emerald-900/75 sm:text-lg">
                {isForbidden
                  ? "Halaman ini hanya untuk admin. Kalau kamu bukan admin, akses ke statistik, manajemen pengguna, dan panel kontrol memang diblokir."
                  : "Halaman ini khusus untuk pengguna yang sudah login. Silakan masuk ke akunmu atau daftar baru untuk membuka dashboard, transaksi, dan fitur lainnya."}
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                onClick={handleLoginClick}
                size="lg"
                className="h-12 gap-2 bg-emerald-600 px-6 font-semibold text-white hover:bg-emerald-700"
              >
                <LogIn className="h-4 w-4" />
                {isForbidden ? "Masuk dengan akun admin" : "Masuk"}
                <ArrowRight className="h-4 w-4" />
              </Button>

              {!isForbidden && (
                <Button
                  onClick={handleRegisterClick}
                  size="lg"
                  variant="outline"
                  className="h-12 gap-2 border-emerald-300 bg-white/50 px-6 font-semibold text-emerald-800 hover:bg-emerald-100"
                >
                  <UserPlus className="h-4 w-4" />
                  Daftar
                </Button>
              )}

              <Button
                onClick={handleHomeClick}
                size="lg"
                variant="ghost"
                className="h-12 gap-2 px-5 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-900"
              >
                <Home className="h-4 w-4" />
                Beranda
              </Button>
            </div>

            <p className="mt-6 max-w-xl text-sm leading-7 text-emerald-900/55">
              {isForbidden
                ? "Kalau kamu yakin harusnya punya akses, hubungi admin atau gunakan akun yang benar."
                : "Jika kamu baru saja login dan tetap sampai di sini, refresh halaman atau kembali ke beranda untuk memuat sesi akun terbaru."}
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
                      {isForbidden ? <ShieldX className="h-20 w-20 text-emerald-800" /> : <Bot className="h-20 w-20 text-emerald-800" />}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-full border border-emerald-200 bg-white/70 px-4 py-2 text-sm font-medium text-emerald-800 shadow-sm backdrop-blur-sm">
                    <TriangleAlert className="h-4 w-4 text-emerald-600" />
                    {isForbidden ? "Admin privilege required" : "Session not found"}
                  </div>
                </div>

                <div className="absolute left-8 top-14 h-4 w-4 rounded-full bg-emerald-500/80 shadow-[0_0_0_8px_rgba(16,185,129,0.14)]" />
                <div className="absolute right-16 top-20 h-3 w-3 rounded-full bg-emerald-400/80 shadow-[0_0_0_8px_rgba(16,185,129,0.12)]" />
                <div className="absolute bottom-16 left-12 h-3 w-3 rounded-full bg-emerald-500/70 shadow-[0_0_0_8px_rgba(16,185,129,0.10)]" />

                <div className="absolute right-10 bottom-14 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-white/80 px-3 py-2 text-xs font-semibold text-emerald-700 shadow-sm backdrop-blur-sm">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  {isForbidden ? "Forbidden" : "Unauthorized"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
