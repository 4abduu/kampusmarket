import { createContext, useContext } from "react";

export type FinancialVariant = 'detail' | 'approve' | 'reject' | 'finish' | 'failed';

export interface FinancialModalContextType {
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

export const FinancialModalContext = createContext<FinancialModalContextType | undefined>(undefined);

export const useFinancialModal = () => {
  const context = useContext(FinancialModalContext);
  if (!context) {
    throw new Error("useFinancialModal must be used within a FinancialModalContextProvider");
  }
  return context;
};
