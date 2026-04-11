"use client";

import { Button } from "@/components/ui/button";
import type { NavigateFn } from "@/app/navigation/types";

interface SellerWelcomeModalProps {
  open: boolean;
  onClose: () => void;
  onNavigate: NavigateFn;
}

export default function SellerWelcomeModal({ open, onClose, onNavigate }: SellerWelcomeModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md mx-4 p-6 text-center animate-in fade-in-0 zoom-in-95">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center">
          <span className="text-4xl">🎉</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Selamat Bergabung sebagai Seller!
        </h2>
        <p className="text-slate-600 dark:text-slate-300 mb-6">
          Kamu sekarang bisa mulai berjualan di KampusMarket.
          Tambahkan produk pertamamu dan mulai dapatkan penghasilan!
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Nanti Saja
          </Button>
          <Button
            onClick={() => {
              onClose();
              onNavigate("add-product");
            }}
            className="flex-1 bg-primary-600 hover:bg-primary-700"
          >
            Tambah Produk
          </Button>
        </div>
      </div>
    </div>
  );
}
