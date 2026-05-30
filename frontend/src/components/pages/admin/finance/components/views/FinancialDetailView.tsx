import React from "react";
import { useFinancialModal } from "../FinancialActionModal";
import { FinancialUserCard, FinancialAmountCard, FinancialStatusBadge } from "../shared";
import { Button } from "@/components/ui/button";
import { Calendar, CreditCard, Landmark, Check, X, AlertCircle } from "lucide-react";

export const FinancialDetailView: React.FC = () => {
  const { withdrawal, setVariant, onProcess, loading, onClose } = useFinancialModal();

  if (!withdrawal) return null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getAccountLabel = () => {
    return withdrawal.accountType === "e_wallet" ? "E-Wallet Provider" : "Nama Bank";
  };

  return (
    <div className="space-y-4 py-1">
      <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800 text-xs">
        <div className="space-y-0.5">
          <span className="text-muted-foreground block">No. Penarikan</span>
          <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
            {withdrawal.withdrawalNumber}
          </span>
        </div>
        <div className="text-right space-y-1">
          <span className="text-muted-foreground block">Status</span>
          <FinancialStatusBadge status={withdrawal.status} />
        </div>
      </div>

      {withdrawal.user && <FinancialUserCard user={withdrawal.user} />}

      <FinancialAmountCard amount={withdrawal.amount} totalDeduction={withdrawal.totalDeduction} />

      {/* Account Info Card */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 rounded-xl space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
          <Landmark className="h-3.5 w-3.5" /> Informasi Rekening / Tujuan
        </h4>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="text-muted-foreground">{getAccountLabel()}</span>
            <p className="font-medium text-slate-800 dark:text-slate-200">
              {withdrawal.bankName || "-"}
            </p>
          </div>
          <div className="space-y-0.5">
            <span className="text-muted-foreground">Nomor Rekening</span>
            <p className="font-medium font-mono text-slate-800 dark:text-slate-200 select-all">
              {withdrawal.accountNumber || "-"}
            </p>
          </div>
          <div className="col-span-2 space-y-0.5">
            <span className="text-muted-foreground">Nama Pemilik Rekening</span>
            <p className="font-medium text-slate-800 dark:text-slate-200 uppercase">
              {withdrawal.accountName || "-"}
            </p>
          </div>
        </div>
      </div>

      {/* Date & Additional Status Info */}
      <div className="flex flex-col gap-1.5 p-3 rounded-lg border border-slate-100 dark:border-slate-800 text-xs">
        <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> Diajukan Pada
          </span>
          <span className="font-medium">{formatDate(withdrawal.createdAt)}</span>
        </div>
        {withdrawal.processedAt && (
          <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> Diproses Pada
            </span>
            <span className="font-medium">{formatDate(withdrawal.processedAt)}</span>
          </div>
        )}
      </div>

      {/* Rejection / Failure Reasons if any */}
      {withdrawal.status === "rejected" && withdrawal.rejectionReason && (
        <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-lg text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <div className="space-y-0.5">
            <span className="font-bold">Alasan Penolakan:</span>
            <p className="italic leading-relaxed">{withdrawal.rejectionReason}</p>
          </div>
        </div>
      )}

      {withdrawal.status === "failed" && withdrawal.failureReason && (
        <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-lg text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <div className="space-y-0.5">
            <span className="font-bold">Alasan Kegagalan:</span>
            <p className="italic leading-relaxed">{withdrawal.failureReason}</p>
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        {withdrawal.status === "pending" && (
          <>
            <Button
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white gap-1.5"
              onClick={onProcess}
              disabled={loading}
            >
              <CreditCard className="h-4 w-4" />
              Proses Transaksi
            </Button>
            <Button
              variant="destructive"
              className="flex-1 gap-1.5"
              onClick={() => setVariant("reject")}
              disabled={loading}
            >
              <X className="h-4 w-4" />
              Tolak Pengajuan
            </Button>
          </>
        )}

        {(withdrawal.status === "approved" || withdrawal.status === "processing") && (
          <>
            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
              onClick={() => setVariant("finish")}
              disabled={loading}
            >
              <Check className="h-4 w-4" />
              Tandai Sukses
            </Button>
            <Button
              variant="destructive"
              className="flex-1 gap-1.5"
              onClick={() => setVariant("failed")}
              disabled={loading}
            >
              <X className="h-4 w-4" />
              Tandai Gagal
            </Button>
          </>
        )}

        {(withdrawal.status === "completed" ||
          withdrawal.status === "rejected" ||
          withdrawal.status === "failed" ||
          withdrawal.status === "cancelled") && (
          <Button variant="outline" className="w-full" onClick={onClose}>
            Tutup Pratinjau
          </Button>
        )}
      </div>
    </div>
  );
};
