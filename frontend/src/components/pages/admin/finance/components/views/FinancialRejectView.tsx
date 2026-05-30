import React, { useState } from "react";
import { useFinancialModal } from "../FinancialActionModal";
import { FinancialAmountCard } from "../shared";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { XCircle, ChevronLeft, AlertOctagon } from "lucide-react";

export const FinancialRejectView: React.FC = () => {
  const { withdrawal, setVariant, onReject, loading } = useFinancialModal();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!withdrawal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Alasan penolakan wajib diisi");
      return;
    }
    setError(null);
    onReject(reason);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5 py-1 text-center flex flex-col items-center">
      {/* Figma destructive red indicator */}
      <div className="h-14 w-14 bg-red-100 dark:bg-red-950/40 rounded-full flex items-center justify-center border-4 border-red-50 dark:border-red-900/20 mb-0.5">
        <XCircle className="h-7 w-7 text-red-600 dark:text-red-400" />
      </div>

      <div className="space-y-0.5">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
          Tolak Penarikan Dana
        </h3>
        <p className="text-xs text-muted-foreground max-w-[320px] mx-auto leading-relaxed">
          Dana penarikan akan dikembalikan penuh ke saldo akun pengguna.
        </p>
      </div>

      <div className="w-full text-left">
        <FinancialAmountCard amount={withdrawal.amount} totalDeduction={withdrawal.totalDeduction} />
      </div>

      {/* Input Textarea Alasan */}
      <div className="w-full space-y-1 text-left">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
          Alasan Penolakan <span className="text-red-500 font-bold">*</span>
        </label>
        <Textarea
          placeholder="Contoh: Nomor rekening tidak valid atau data pemilik tidak cocok."
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            if (e.target.value.trim()) setError(null);
          }}
          className={`min-h-[75px] text-xs resize-none ${
            error ? "border-red-500 focus-visible:ring-red-500" : ""
          }`}
          disabled={loading}
        />
        {error && (
          <p className="text-[11px] text-red-500 flex items-center gap-1 font-medium mt-1">
            <AlertOctagon className="h-3 w-3 shrink-0" />
            {error}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 w-full">
        <Button
          type="submit"
          variant="destructive"
          className="w-full sm:flex-1 font-semibold order-first sm:order-last"
          disabled={loading}
        >
          {loading ? "Memproses..." : "Tolak Sekarang"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full sm:flex-1 gap-1 order-last sm:order-first"
          onClick={() => setVariant("detail")}
          disabled={loading}
        >
          <ChevronLeft className="h-4 w-4" />
          Kembali
        </Button>
      </div>
    </form>
  );
};
