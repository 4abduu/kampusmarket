import React, { createContext, useContext, useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FinancialDetailView } from "./views/FinancialDetailView";
import { FinancialApproveView } from "./views/FinancialApproveView";
import { FinancialRejectView } from "./views/FinancialRejectView";
import { FinancialFinishView } from "./views/FinancialFinishView";
import { FinancialFailedView } from "./views/FinancialFailedView";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export type FinancialVariant = 'detail' | 'approve' | 'reject' | 'finish' | 'failed';

interface FinancialModalContextType {
  withdrawal: any;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onApprove: () => void;
  onReject: (reason: string) => void;
  onComplete: () => void;
  onFail: (reason: string) => void;
  onProcess: () => void;
  setVariant: (variant: FinancialVariant) => void;
}

const FinancialModalContext = createContext<FinancialModalContextType | undefined>(undefined);

export const useFinancialModal = () => {
  const context = useContext(FinancialModalContext);
  if (!context) {
    throw new Error("useFinancialModal must be used within a FinancialModalContextProvider");
  }
  return context;
};

export interface FinancialActionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant: FinancialVariant;
  setVariant: (variant: FinancialVariant) => void;
  withdrawal: any;
  loading: boolean;
  error: string | null;
  onApprove: () => void;
  onReject: (reason: string) => void;
  onComplete: () => void;
  onFail: (reason: string) => void;
  onProcess: () => void;
}

export default function FinancialActionModal({
  open,
  onOpenChange,
  variant,
  setVariant,
  withdrawal,
  loading,
  error,
  onApprove,
  onReject,
  onComplete,
  onFail,
  onProcess,
}: FinancialActionModalProps) {
  
  // Transition Cache: prevents visual flashing/jumping during modal fade exit animation
  const [cachedWithdrawal, setCachedWithdrawal] = useState<any>(null);

  useEffect(() => {
    if (withdrawal) {
      setCachedWithdrawal(withdrawal);
    }
  }, [withdrawal]);

  const activeWithdrawal = withdrawal || cachedWithdrawal;

  const onClose = () => {
    onOpenChange(false);
  };

  const contextValue: FinancialModalContextType = {
    withdrawal: activeWithdrawal,
    loading,
    error,
    onClose,
    onApprove,
    onReject,
    onComplete,
    onFail,
    onProcess,
    setVariant,
  };

  // View Mapping Pattern to avoid conditional statements / switch monsters
  const viewMap: Record<FinancialVariant, React.ReactNode> = {
    detail: <FinancialDetailView />,
    approve: <FinancialApproveView />,
    reject: <FinancialRejectView />,
    finish: <FinancialFinishView />,
    failed: <FinancialFailedView />,
  };

  const titleMap: Record<FinancialVariant, string> = {
    detail: "Pratinjau Detail Penarikan",
    approve: "Setujui Transaksi",
    reject: "Tolak Transaksi",
    finish: "Selesaikan Transaksi",
    failed: "Transfer Dana Gagal",
  };

  const descMap: Record<FinancialVariant, string> = {
    detail: "Informasi lengkap pengajuan dana saldo pengguna.",
    approve: "Konfirmasi persetujuan transaksi penarikan.",
    reject: "Alasan penolakan pengajuan penarikan dana.",
    finish: "Verifikasi penyelesaian transfer dana ke rekening.",
    failed: "Pencatatan kegagalan transfer dana sistem bank.",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] w-full max-h-[85vh] overflow-y-auto p-5 md:p-6 transition-all duration-300 ease-in-out scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 scrollbar-track-transparent">
        <DialogHeader className="text-left">
          <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100 transition-all duration-200">
            {titleMap[variant] || "Tindakan Keuangan"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground transition-all duration-200">
            {descMap[variant] || "Kelola moderasi keuangan dan mutasi transfer dana."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="py-2.5 px-3 text-xs gap-2 items-center flex">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <AlertDescription className="font-medium">{error}</AlertDescription>
          </Alert>
        )}

        <FinancialModalContext.Provider value={contextValue}>
          <div className="transition-all duration-300 ease-in-out opacity-100 mt-1">
            {viewMap[variant] || <FinancialDetailView />}
          </div>
        </FinancialModalContext.Provider>
      </DialogContent>
    </Dialog>
  );
}
