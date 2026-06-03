import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";

export default function RestrictedAccessOverlay() {
  const hasOverdueDebt = useAuthStore((s) => s.hasOverdueDebt);
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  // Jangan tampilkan overlay jika user sudah berada di halaman dashboard debts atau wallet
  const isAllowedPage = location.pathname.includes("/dashboard/debts") || location.pathname.includes("/dashboard/wallet");
  // Jangan tampilkan di landing page / halaman statis lainnya jika diperlukan, 
  // tapi biasanya ini membatasi fungsi seller.
  
  useEffect(() => {
    if (hasOverdueDebt && !isAllowedPage) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [hasOverdueDebt, isAllowedPage]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold mb-2 text-gray-900">Akses Dibatasi</h2>
        <p className="text-gray-600 mb-6 text-sm">
          Akun Anda sedang dibatasi karena memiliki tunggakan komisi COD/Cash yang telah jatuh tempo. 
          Silakan lunasi tunggakan Anda untuk mengembalikan fungsi penuh akun Anda (seperti menerima pesanan atau chat baru).
        </p>
        <div className="flex flex-col gap-3">
          <Button 
            className="w-full bg-red-600 hover:bg-red-700"
            onClick={() => navigate("/dashboard/debts")}
          >
            Lunasi Sekarang <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
