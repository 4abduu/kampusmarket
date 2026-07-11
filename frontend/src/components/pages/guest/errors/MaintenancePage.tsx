"use client";

import { useEffect, useState } from "react";
import { Settings, Wrench, Clock, RefreshCw, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * MaintenancePage — ditampilkan ketika backend (Railway) sedang down/expired
 * atau maintenance mode diaktifkan via environment variable.
 * Desain responsif untuk desktop dan mobile.
 */
export default function MaintenancePage() {
  const [dots, setDots] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  // Hide global chrome (navbar/footer) while this page is mounted
  useEffect(() => {
    const prev = document.body.classList.contains("no-chrome");
    document.body.classList.add("no-chrome");
    return () => {
      if (!prev) document.body.classList.remove("no-chrome");
    };
  }, []);

  // Animated dots for "Sedang dalam perbaikan..."
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Live clock
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  const formattedTime = currentTime.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const formattedDate = currentTime.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100">
      {/* ── Animated Background Elements ── */}
      <div className="pointer-events-none absolute inset-0">
        {/* Large blurred circles */}
        <div className="absolute -top-32 -left-32 h-96 w-96 animate-pulse rounded-full bg-emerald-200/50 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-teal-200/40 blur-3xl" style={{ animation: "pulse 4s ease-in-out infinite" }} />
        <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-300/20 blur-3xl" style={{ animation: "pulse 6s ease-in-out infinite" }} />
        
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(5,150,105,1) 1px, transparent 1px), linear-gradient(90deg, rgba(5,150,105,1) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.08),_transparent_70%)]" />
      </div>

      {/* ── Main Content ── */}
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
        <div className="w-full max-w-2xl">
          {/* ── Animated Gear Icon ── */}
          <div className="mb-8 flex justify-center sm:mb-10">
            <div className="relative">
              {/* Outer ring pulse */}
              <div className="absolute inset-0 h-36 w-36 sm:h-44 sm:w-44 rounded-full border-2 border-dashed border-emerald-300/50 opacity-60" style={{ animation: "spin 20s linear infinite" }} />
              <div className="absolute inset-3 h-[120px] w-[120px] sm:inset-4 sm:h-[144px] sm:w-[144px] rounded-full border border-emerald-200/60" style={{ animation: "spin 30s linear infinite reverse" }} />
              
              {/* Main gear container */}
              <div className="relative flex h-36 w-36 sm:h-44 sm:w-44 items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-400/20 blur-xl" />
                <div className="relative flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-full border border-emerald-200/80 bg-gradient-to-br from-white/90 to-emerald-50/90 shadow-2xl shadow-emerald-900/10 backdrop-blur-sm">
                  <Settings className="h-12 w-12 sm:h-14 sm:w-14 text-emerald-600" style={{ animation: "spin 8s linear infinite" }} />
                </div>
              </div>

              {/* Floating particles */}
              <div className="absolute -top-2 right-4 h-3 w-3 rounded-full bg-emerald-400/70 shadow-[0_0_0_6px_rgba(16,185,129,0.15)]" style={{ animation: "bounce 2s ease-in-out infinite" }} />
              <div className="absolute -bottom-1 left-6 h-2.5 w-2.5 rounded-full bg-teal-400/80 shadow-[0_0_0_6px_rgba(13,148,136,0.15)]" style={{ animation: "bounce 2.5s ease-in-out infinite 0.3s" }} />
              <div className="absolute top-8 -right-2 h-2 w-2 rounded-full bg-emerald-500/60 shadow-[0_0_0_5px_rgba(16,185,129,0.12)]" style={{ animation: "bounce 3s ease-in-out infinite 0.6s" }} />
            </div>
          </div>

          {/* ── Status Badge ── */}
          <div className="mb-6 flex justify-center sm:mb-8">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-emerald-200/80 bg-white/70 px-4 py-2 shadow-sm backdrop-blur-md">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Maintenance Mode
              </span>
            </div>
          </div>

          {/* ── Main Text ── */}
          <div className="text-center">
            <h1 className="mb-4 text-3xl font-black tracking-tight text-emerald-950 sm:text-4xl md:text-5xl lg:text-6xl">
              Sedang dalam
              <br />
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Perbaikan{dots}
              </span>
            </h1>
            <p className="mx-auto mb-8 max-w-lg text-base leading-relaxed text-emerald-900/65 sm:text-lg sm:leading-8">
              KampusMarket sedang melakukan pemeliharaan server untuk meningkatkan performa dan pengalaman pengguna. Kami akan segera kembali!
            </p>
          </div>

          {/* ── Info Cards ── */}
          <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            {/* Card 1 - Status */}
            <div className="group rounded-2xl border border-emerald-200/60 bg-white/60 p-4 shadow-sm backdrop-blur-md transition-all duration-300 hover:bg-white/80 hover:shadow-md sm:p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100/80 text-emerald-600 transition-transform duration-300 group-hover:scale-110">
                <Wrench className="h-5 w-5" />
              </div>
              <h3 className="mb-1 text-sm font-bold text-emerald-900">Server Maintenance</h3>
              <p className="text-xs leading-5 text-emerald-700/70">
                Backend server sedang dalam pemeliharaan terjadwal
              </p>
            </div>

            {/* Card 2 - ETA */}
            <div className="group rounded-2xl border border-emerald-200/60 bg-white/60 p-4 shadow-sm backdrop-blur-md transition-all duration-300 hover:bg-white/80 hover:shadow-md sm:p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100/80 text-teal-600 transition-transform duration-300 group-hover:scale-110">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="mb-1 text-sm font-bold text-emerald-900">Estimasi Waktu</h3>
              <p className="text-xs leading-5 text-emerald-700/70">
                Proses maintenance akan selesai dalam waktu dekat
              </p>
            </div>

            {/* Card 3 - Contact */}
            <div className="group rounded-2xl border border-emerald-200/60 bg-white/60 p-4 shadow-sm backdrop-blur-md transition-all duration-300 hover:bg-white/80 hover:shadow-md sm:p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100/80 text-emerald-600 transition-transform duration-300 group-hover:scale-110">
                <Mail className="h-5 w-5" />
              </div>
              <h3 className="mb-1 text-sm font-bold text-emerald-900">Butuh Bantuan?</h3>
              <p className="text-xs leading-5 text-emerald-700/70">
                Hubungi kami jika ada pertanyaan mendesak
              </p>
            </div>
          </div>

          {/* ── Live Clock ── */}
          <div className="mb-8 flex justify-center">
            <div className="inline-flex flex-col items-center gap-1 rounded-2xl border border-emerald-200/50 bg-white/50 px-6 py-4 backdrop-blur-sm sm:flex-row sm:gap-4">
              <div className="flex items-center gap-2 text-sm text-emerald-700/80">
                <Clock className="h-4 w-4" />
                <span className="font-medium">{formattedDate}</span>
              </div>
              <div className="hidden h-4 w-px bg-emerald-300/50 sm:block" />
              <span className="font-mono text-lg font-bold tracking-wider text-emerald-800">
                {formattedTime}
              </span>
            </div>
          </div>

          {/* ── Action Buttons ── */}
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              onClick={handleRefresh}
              size="lg"
              className="h-12 w-full gap-2.5 bg-emerald-600 px-8 font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all duration-300 hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-600/30 sm:w-auto"
            >
              <RefreshCw className="h-4 w-4" />
              Coba Lagi
            </Button>
          </div>

          {/* ── Footer Note ── */}
          <p className="mt-10 text-center text-xs leading-6 text-emerald-800/40 sm:text-sm">
            Terima kasih atas kesabarannya. Tim KampusMarket sedang bekerja keras
            <br className="hidden sm:inline" />
            {" "}untuk memberikan pengalaman terbaik buat kamu! 💚
          </p>
        </div>
      </div>
    </div>
  );
}
