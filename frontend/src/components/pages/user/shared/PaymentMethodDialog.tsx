import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowRight, Wallet, ShieldCheck, Banknote } from "lucide-react"

export type PaymentMethod = "wallet" | "midtrans" | "cash"

interface PaymentMethodDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  totalPayment: number
  formatPrice: (price: number) => string
  title: string
  description: string
  summaryLabel?: string
  onPayWithWallet: () => void
  onPayWithMidtrans: () => void
  onPayWithCash?: () => void
  walletBalance?: number
  showCashOption?: boolean
}

export default function PaymentMethodDialog({
  open,
  onOpenChange,
  totalPayment,
  formatPrice,
  title,
  description,
  summaryLabel,
  onPayWithWallet,
  onPayWithMidtrans,
  onPayWithCash,
  walletBalance,
  showCashOption = false,
}: PaymentMethodDialogProps) {
  const isWalletInsufficient = walletBalance !== undefined && walletBalance < totalPayment;
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg border-0 bg-slate-100 dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription className="pt-2 text-base text-slate-600 dark:text-slate-300">
              {description || "Pilih metode pembayaran untuk melanjutkan transaksi."}
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
            <p className="text-sm text-muted-foreground">{summaryLabel || "Total pembayaran"}</p>
            <p className="mt-1 text-2xl font-bold text-primary-600">{formatPrice(totalPayment)}</p>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              className={`w-full rounded-2xl border p-4 text-left transition-all duration-200 flex items-center gap-4 ${
                isWalletInsufficient
                  ? "border-red-100 bg-red-50/30 opacity-80 cursor-not-allowed dark:border-red-900/30 dark:bg-red-900/10"
                  : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/20 shadow-sm hover:shadow"
              }`}
              onClick={() => {
                if (isWalletInsufficient) return;
                onPayWithWallet();
              }}
              disabled={isWalletInsufficient}
            >
              <div className={`rounded-xl p-3 shrink-0 ${isWalletInsufficient ? "bg-red-100 text-red-500 dark:bg-red-900/40" : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"}`}>
                <Wallet className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 dark:text-slate-100">Dompet KampusMarket</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className={`text-sm font-medium ${isWalletInsufficient ? "text-red-600" : "text-emerald-600 dark:text-emerald-400"}`}>
                    {walletBalance !== undefined ? formatPrice(walletBalance) : "Memuat saldo..."}
                  </p>
                  {isWalletInsufficient && (
                    <span className="px-1.5 py-0.5 rounded-full bg-red-100 text-[10px] font-bold text-red-600 uppercase tracking-wider">
                      Kurang
                    </span>
                  )}
                </div>
                {isWalletInsufficient ? (
                  <p className="text-xs text-red-500 mt-1 font-medium">Saldo kamu tidak cukup untuk pesanan ini.</p>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Pembayaran instan & aman.</p>
                )}
              </div>
              {!isWalletInsufficient && <ArrowRight className="h-5 w-5 text-emerald-500" />}
            </button>

            <button
              className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left transition-colors hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-blue-700 dark:hover:bg-blue-950/20"
              onClick={onPayWithMidtrans}
            >
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900 dark:text-slate-100">Bayar via Midtrans</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    QRIS, virtual account, e-wallet, kartu, dan retail.
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </button>

            {showCashOption && onPayWithCash && (
              <button
                className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left transition-colors hover:border-amber-300 hover:bg-amber-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-amber-700 dark:hover:bg-amber-950/20"
                onClick={onPayWithCash}
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-amber-50 p-3 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                    <Banknote className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 dark:text-slate-100">Bayar Tunai Saat Ketemuan</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Selesaikan pembayaran saat bertemu dengan penyedia jasa.
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
