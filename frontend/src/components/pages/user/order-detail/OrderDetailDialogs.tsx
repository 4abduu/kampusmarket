import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Info } from "lucide-react"
import PaymentMethodDialog, { type PaymentMethod } from "@/components/pages/user/shared/PaymentMethodDialog"

interface CancelReasonOption {
  value: string
  label: string
}

type OrderStatus =
  | "waiting_price"
  | "waiting_confirmation"
  | "waiting_shipping_fee"
  | "waiting_payment"
  | "processing"
  | "completed"
  | "cancelled"

interface OrderDetailDialogsProps {
  showPaymentDialog: boolean
  setShowPaymentDialog: (open: boolean) => void
  totalPayment: number
  formatPrice: (price: number) => string
  handlePayment: (method: PaymentMethod) => void
  showRejectDialog: boolean
  setShowRejectDialog: (open: boolean) => void
  isService: boolean
  onConfirmRejectPrice: () => void
  showCancelDialog: boolean
  setShowCancelDialog: (open: boolean) => void
  isSellerView: boolean
  orderStatus: OrderStatus
  handleDirectCancel: () => void
  showCancelRequestDialog: boolean
  setShowCancelRequestDialog: (open: boolean) => void
  cancelReason: string
  setCancelReason: (value: string) => void
  cancelDescription: string
  setCancelDescription: (value: string) => void
  cancelReasons: CancelReasonOption[]
  handleCancelRequest: () => void
}

export default function OrderDetailDialogs({
  showPaymentDialog,
  setShowPaymentDialog,
  totalPayment,
  formatPrice,
  handlePayment,
  showRejectDialog,
  setShowRejectDialog,
  isService,
  onConfirmRejectPrice,
  showCancelDialog,
  setShowCancelDialog,
  isSellerView,
  orderStatus,
  handleDirectCancel,
  showCancelRequestDialog,
  setShowCancelRequestDialog,
  cancelReason,
  setCancelReason,
  cancelDescription,
  setCancelDescription,
  cancelReasons,
  handleCancelRequest,
}: OrderDetailDialogsProps) {
  return (
    <>
      <PaymentMethodDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        totalPayment={totalPayment}
        formatPrice={formatPrice}
        title="Pilih Metode Pembayaran"
        description="Pilih dompet jika ingin bayar langsung dari saldo akun, atau Midtrans jika ingin memakai popup pembayaran bawaan."
        summaryLabel="Total pembayaran pesanan"
        onPayWithWallet={() => handlePayment("wallet")}
        onPayWithMidtrans={() => handlePayment("midtrans")}
      />

      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tolak Penawaran Harga?</AlertDialogTitle>
            <AlertDialogDescription>
              Jika kamu menolak, {isService ? "booking" : "pesanan"} ini akan dibatalkan. Kamu bisa membuat {isService ? "booking" : "pesanan"} baru atau nego langsung dengan {isService ? "penyedia" : "penjual"} via chat.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={onConfirmRejectPrice}>
              Ya, Tolak
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Batalkan Pesanan?</AlertDialogTitle>
            <AlertDialogDescription>
              {isSellerView ? (
                <>
                  {isService ? "Booking" : "Pesanan"} ini {[
                    "waiting_payment",
                    "waiting_confirmation",
                  ].includes(orderStatus)
                    ? "sudah dikonfirmasi, namun pembeli belum melakukan pembayaran."
                    : "belum dikonfirmasi."}
                  <br />
                  <br />
                  Pembatalan akan langsung diproses tanpa perlu persetujuan admin.
                </>
              ) : (
                <>
                  {isService ? "Booking" : "Pesanan"} ini belum dikonfirmasi oleh {isService ? "penyedia" : "penjual"}.
                  Pembatalan akan langsung diproses tanpa perlu persetujuan.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Tidak Jadi</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDirectCancel}>
              Ya, Batalkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showCancelRequestDialog} onOpenChange={setShowCancelRequestDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ajukan Pembatalan</DialogTitle>
            <DialogDescription>
              {isSellerView ? (
                <>
                  <strong className="text-red-600">Pembeli sudah melakukan pembayaran.</strong>
                  <br />
                  Pembatalan memerlukan persetujuan admin. Jika disetujui, dana akan dikembalikan ke pembeli.
                  Proses akan memakan waktu 1x24 jam.
                </>
              ) : (
                <>
                  {isService ? "Booking" : "Pesanan"} ini sudah dikonfirmasi oleh {isService ? "penyedia" : "penjual"}.
                  Pembatalan memerlukan persetujuan admin dan akan diproses dalam 1x24 jam.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cancelReason">Alasan Pembatalan *</Label>
              <select
                id="cancelReason"
                aria-label="Alasan pembatalan"
                title="Alasan pembatalan"
                className="w-full p-2 border rounded-lg bg-background"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              >
                <option value="">Pilih alasan...</option>
                {cancelReasons.map((reason) => (
                  <option key={reason.value} value={reason.value}>
                    {reason.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cancelDescription">Penjelasan Detail *</Label>
              <Textarea
                id="cancelDescription"
                placeholder="Jelaskan alasan pembatalan Anda secara detail..."
                value={cancelDescription}
                onChange={(e) => setCancelDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-700 dark:text-amber-300 flex items-start gap-2">
                <Info className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  {isSellerView
                    ? "Jika permintaan pembatalan disetujui, dana akan dikembalikan ke pembeli."
                    : "Jika permintaan pembatalan disetujui, dana akan dikembalikan ke saldo kamu dalam 3-5 hari kerja."}
                </span>
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelRequestDialog(false)}>
              Batal
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              disabled={!cancelReason || !cancelDescription}
              onClick={handleCancelRequest}
            >
              Kirim Permintaan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
