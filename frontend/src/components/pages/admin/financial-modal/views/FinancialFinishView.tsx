import React from "react";
import { useFinancialModal } from "../FinancialActionModal";
import { FinancialUserCard, FinancialAmountCard } from "../components/shared";
import { Button } from "@/components/ui/button";
import { CheckCircle, ChevronLeft, Landmark } from "lucide-react";

export const FinancialFinishView: React.FC = () => {
  const { withdrawal, setVariant, onComplete, loading } = useFinancialModal();

  if (!withdrawal) return null;

  return (
    <div className="space-y-3.5 py-1 text-center flex flex-col items-center">
      {/* Visual Success Indicator */}
      <div className="h-14 w-14 bg-emerald-100 dark:bg-emerald-950/40 rounded-full flex items-center justify-center border-4 border-emerald-50 dark:border-emerald-900/20 mb-0.5 animate-pulse">
        <CheckCircle className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
      </div>

      <div className="space-y-0.5">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
          Selesaikan Transaksi Penarikan
        </h3>
        <p className="text-xs text-muted-foreground max-w-[340px] mx-auto leading-relaxed">
          Tindakan ini akan mengubah status penarikan menjadi <strong className="text-emerald-600 font-semibold">Selesai</strong>.
        </p>
      </div>

      {withdrawal.user && (
        <div className="w-full text-left">
          <FinancialUserCard user={withdrawal.user} />
        </div>
      )}

      <div className="w-full text-left">
        <FinancialAmountCard amount={withdrawal.amount} totalDeduction={withdrawal.totalDeduction} />
      </div>

      {/* Account Info Box */}
      <div className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 rounded-lg text-xs w-full text-left">
        <div className="flex gap-2 items-center text-muted-foreground mb-1 font-medium">
          <Landmark className="h-3.5 w-3.5" />
          <span>Tujuan Transfer:</span>
        </div>
        <p className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
          {withdrawal.bankName} — {withdrawal.accountNumber}
        </p>
        <p className="text-muted-foreground uppercase text-[10px] mt-0.5">
          a.n {withdrawal.accountName}
        </p>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 w-full">
        <Button
          className="w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold order-first sm:order-last"
          onClick={onComplete}
          disabled={loading}
        >
          {loading ? "Menyelesaikan..." : "Ya, Selesai"}
        </Button>
        <Button
          variant="outline"
          className="w-full sm:flex-1 gap-1 order-last sm:order-first"
          onClick={() => setVariant("detail")}
          disabled={loading}
        >
          <ChevronLeft className="h-4 w-4" />
          Kembali
        </Button>
      </div>
    </div>
  );
};
