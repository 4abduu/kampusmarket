import { useState, useEffect } from "react";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { debtsApi, type DebtSummary } from "@/lib/api/debts";
import { Button } from "@/components/ui/button";

interface DebtWarningBannerProps {
  onPayClick: () => void;
}

export default function DebtWarningBanner({ onPayClick }: DebtWarningBannerProps) {
  const [summary, setSummary] = useState<DebtSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await debtsApi.getSummary();
        setSummary((res as any).data || res);
      } catch (error) {
        console.error("Failed to fetch debt summary", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading || !summary || summary.total_debt <= 0) {
    return null;
  }

  const isOverdue = summary.has_overdue;

  return (
    <div className={`mb-6 p-4 rounded-lg flex items-start gap-4 ${isOverdue ? 'bg-red-50 border border-red-200 text-red-800' : 'bg-amber-50 border border-amber-200 text-amber-800'}`}>
      <div className={`p-2 rounded-full mt-0.5 ${isOverdue ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
        <AlertTriangle className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-lg mb-1">
          {isOverdue ? 'Akses Terbatas: Tunggakan Komisi Jatuh Tempo' : 'Peringatan: Tunggakan Komisi COD/Cash'}
        </h3>
        <p className="text-sm opacity-90 mb-3">
          Anda memiliki total tunggakan komisi sebesar <span className="font-semibold">Rp {summary.total_debt.toLocaleString("id-ID")}</span>.
          {isOverdue 
            ? ' Akun Anda saat ini dibatasi untuk menerima pesanan baru. Segera lunasi untuk memulihkan akses.'
            : ' Silakan lunasi tunggakan ini sebelum jatuh tempo agar akun Anda tidak dibatasi.'}
        </p>
        <Button 
          variant={isOverdue ? 'destructive' : 'default'} 
          size="sm" 
          onClick={onPayClick}
          className={!isOverdue ? 'bg-amber-600 hover:bg-amber-700 text-white' : ''}
        >
          Bayar Sekarang <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
