"use client";

import type { ReactNode } from "react";

interface StickyActionBarProps {
  children: ReactNode;
  /**
   * Breakpoint di mana bar ini disembunyikan (karena versi desktop
   * biasanya ditampilkan inline, bukan sticky). Default "lg" karena
   * sebagian besar shell 2-3 kolom (Product/Service Detail, Cart,
   * Checkout) baru pindah ke layout desktop di breakpoint lg.
   */
  hideFrom?: "md" | "lg";
  className?: string;
}

/**
 * Sticky action bar untuk mobile yang duduk DI ATAS bottom navigation,
 * bukan menumpuknya.
 *
 * Sebelumnya 4 halaman (Product Detail, Service Detail, Cart, Checkout)
 * masing-masing menulis sendiri pola `fixed bottom-0 ... z-50`, yang
 * persis bertabrakan dengan bottom nav (`fixed bottom-0 h-[var(--bottom-nav-h)]
 * z-40`) yang tampil di semua halaman tersebut. Akibatnya tombol aksi
 * utama (Beli Sekarang, Lanjut ke Pembayaran, dll) bisa tertutup atau
 * menutupi bottom nav.
 *
 * Komponen ini selalu offset `bottom-[var(--bottom-nav-h)]` sehingga
 * otomatis duduk tepat di atas bottom nav. Jika suatu saat dipakai di
 * halaman yang TIDAK punya bottom nav (misal halaman dari noNavbarPages
 * di App.tsx), cukup pasang prop tambahan di pemanggil — tapi untuk
 * semua pemakaian saat ini (Product/Service Detail, Cart, Checkout)
 * bottom nav selalu tampil sehingga offset ini selalu benar.
 */
export default function StickyActionBar({
  children,
  hideFrom = "lg",
  className = "",
}: StickyActionBarProps) {
  const hideClass = hideFrom === "md" ? "md:hidden" : "lg:hidden";

  return (
    <div
      className={[
        hideClass,
        "fixed left-0 right-0 z-30",
        "bottom-[var(--bottom-nav-h)]",
        "p-3 bg-background border-t border-border",
        "shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
