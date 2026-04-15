import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowRight, Wallet, ShieldCheck } from "lucide-react"

export type PaymentMethod = "wallet" | "midtrans"

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
}: PaymentMethodDialogProps) {
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
              className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left transition-colors hover:border-primary-300 hover:bg-primary-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-primary-700 dark:hover:bg-primary-950/20"
              onClick={onPayWithWallet}
            >
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                  <Wallet className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900 dark:text-slate-100">Bayar dengan Dompet</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Saldo dipotong otomatis.</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
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
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
