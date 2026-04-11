import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LandingSellerBannerProps {
  open: boolean;
  isLoggedIn: boolean;
  isCustomerOnly: boolean;
  onClose: () => void;
  onStartSelling?: () => void;
}

export default function LandingSellerBanner({
  open,
  isLoggedIn,
  isCustomerOnly,
  onClose,
  onStartSelling,
}: LandingSellerBannerProps) {
  if (!open || !isLoggedIn || !isCustomerOnly) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 px-4">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 shrink-0" />
          <p className="text-sm sm:text-base">
            <span className="font-semibold">Punya barang yang mau dijual?</span>{" "}
            <span className="hidden sm:inline">Coba jualan sekarang dan dapatkan penghasilan tambahan!</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="bg-white text-amber-700 hover:bg-amber-50 text-xs sm:text-sm"
            onClick={onStartSelling}
          >
            Coba Jualan
          </Button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Tutup banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
