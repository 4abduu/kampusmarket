import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Plus } from "lucide-react"

interface Props {
  showTopUpDialog: boolean
  setShowTopUpDialog: (open: boolean) => void
  quickAmounts: number[]
  topUpAmount: string
  setTopUpAmount: (amount: string) => void
  formatPrice: (price: number) => string
  handleTopUp: () => void
  isLoadingTopUp?: boolean
}

export function TopUpDialog({
  showTopUpDialog,
  setShowTopUpDialog,
  quickAmounts,
  topUpAmount,
  setTopUpAmount,
  formatPrice,
  handleTopUp,
  isLoadingTopUp = false
}: Props) {
  return (
    <>
      <Dialog open={showTopUpDialog} onOpenChange={setShowTopUpDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Plus className="h-5 w-5 text-primary-600" />Top Up Saldo</DialogTitle>
            <DialogDescription>Pilih nominal top up, pembayaran via Midtrans</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Pilih Nominal</Label>
              <div className="grid grid-cols-3 gap-2">
                {quickAmounts.map((amount) => (
                  <Button key={amount} variant={topUpAmount === amount.toString() ? "default" : "outline"} size="sm" onClick={() => setTopUpAmount(amount.toString())} className={topUpAmount === amount.toString() ? "bg-primary-600 hover:bg-primary-700" : ""}>{formatPrice(amount)}</Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="topUpAmount">Atau masukkan nominal</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Rp</span>
                <Input 
                  id="topUpAmount" 
                  type="text" 
                  placeholder="Minimal Rp 10.000" 
                  value={topUpAmount ? formatPrice(parseInt(topUpAmount)).replace(/^Rp\s/, "") : ""} 
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "")
                    setTopUpAmount(digits)
                  }} 
                  className="pl-10"
                  maxLength={15}
                />
              </div>
              <p className="text-xs text-muted-foreground">Minimal top up Rp 10.000</p>
            </div>
            {topUpAmount && parseInt(topUpAmount) >= 10000 && (
              <div className="p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
                <p className="text-sm text-primary-700 dark:text-primary-300 font-medium mb-2">Total: {formatPrice(parseInt(topUpAmount))}</p>
                <p className="text-sm text-primary-700 dark:text-primary-300 flex items-start gap-2"><AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /><span>Setelah klik "Top Up Sekarang", Anda akan diarahkan ke halaman pembayaran Midtrans untuk memilih metode pembayaran.</span></p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowTopUpDialog(false); setTopUpAmount("") }}>Batal</Button>
            <Button className="bg-primary-600 hover:bg-primary-700" disabled={!topUpAmount || parseInt(topUpAmount) < 10000} onClick={handleTopUp}>Top Up Sekarang</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isLoadingTopUp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-lg p-8 text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary-600"></div>
            </div>
            <div>
              <p className="font-semibold text-foreground">Membuka Payment Gateway</p>
              <p className="text-sm text-muted-foreground">Mohon tunggu sebentar...</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
