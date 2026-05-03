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
import { Input } from "@/components/ui/input"
import { CheckCircle2, Info, Loader2 } from "lucide-react"
import PaymentMethodDialog, { type PaymentMethod } from "@/components/pages/user/shared/PaymentMethodDialog"

interface CancelReasonOption {
  value: string
  label: string
}

interface OrderDetailDialogsProps {
  showPaymentDialog: boolean
  setShowPaymentDialog: (open: boolean) => void
  totalPayment: number
  walletBalance?: number
  formatPrice: (price: number) => string
  handlePayment: (method: PaymentMethod) => void
  showRejectDialog: boolean
  setShowRejectDialog: (open: boolean) => void
  isService: boolean
  onConfirmRejectPrice: () => void
  showCancelDialog: boolean
  setShowCancelDialog: (open: boolean) => void
  isSellerView: boolean
  handleDirectCancel: () => void
  showCancelRequestDialog: boolean
  setShowCancelRequestDialog: (open: boolean) => void
  cancelReason: string
  setCancelReason: (value: string) => void
  cancelDescription: string
  setCancelDescription: (value: string) => void
  cancelReasons: CancelReasonOption[]
  handleCancelRequest: () => void
  // New: buyer confirm complete
  showCompleteConfirmDialog: boolean
  setShowCompleteConfirmDialog: (open: boolean) => void
  handleBuyerConfirmComplete: () => void
  actionLoading: boolean
  otherReasonText: string
  setOtherReasonText: (text: string) => void
}

export default function OrderDetailDialogs({
  showPaymentDialog,
  setShowPaymentDialog,
  totalPayment,
  walletBalance,
  formatPrice,
  handlePayment,
  showRejectDialog,
  setShowRejectDialog,
  isService,
  onConfirmRejectPrice,
  showCancelDialog,
  setShowCancelDialog,
  isSellerView,
  handleDirectCancel,
  showCancelRequestDialog,
  setShowCancelRequestDialog,
  cancelReason,
  setCancelReason,
  cancelDescription,
  setCancelDescription,
  cancelReasons,
  handleCancelRequest,
  showCompleteConfirmDialog,
  setShowCompleteConfirmDialog,
  handleBuyerConfirmComplete,
  actionLoading,
  otherReasonText,
  setOtherReasonText,
}: OrderDetailDialogsProps) {
  return (
    <>
      <PaymentMethodDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        totalPayment={totalPayment}
        walletBalance={walletBalance}
        formatPrice={formatPrice}
        title="Pilih Metode Pembayaran"
        description="Pilih dompet jika ingin bayar langsung dari saldo akun, atau Midtrans jika ingin memakai popup pembayaran bawaan."
        summaryLabel="Total pembayaran pesanan"
        onPayWithWallet={() => handlePayment("wallet")}
        onPayWithMidtrans={() => handlePayment("midtrans")}
      />

      {/* Reject Price Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tolak Penawaran Harga?</AlertDialogTitle>
            <AlertDialogDescription>
              Jika kamu menolak, {isService ? "booking" : "pesanan"} ini akan dibatalkan. Kamu bisa membuat {isService ? "booking" : "pesanan"} baru atau nego langsung via chat.
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

      {/* Direct Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Batalkan Pesanan?</DialogTitle>
            <DialogDescription>
              {isSellerView ? (
                <>
                  {isService ? "Booking" : "Pesanan"} ini belum dibayar. Pembatalan akan langsung diproses tanpa perlu persetujuan admin.
                </>
              ) : (
                <>
                  {isService ? "Booking" : "Pesanan"} ini belum dikonfirmasi/dibayar. Pembatalan akan langsung diproses.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="directCancelReason">Alasan Pembatalan *</Label>
              <select
                id="directCancelReason"
                className="w-full p-2 border rounded-lg bg-background"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              >
                <option value="">Pilih alasan...</option>
                {cancelReasons.map((reason) => (
                  <option key={reason.value} value={reason.value}>{reason.label}</option>
                ))}
              </select>
            </div>

            {cancelReason === "other" && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                <Label htmlFor="otherReason">Sebutkan Alasan Lainnya *</Label>
                <Input
                  id="otherReason"
                  placeholder="Contoh: Lokasi pembeli terlalu jauh"
                  value={otherReasonText}
                  onChange={(e) => setOtherReasonText(e.target.value)}
                  className="border-amber-300 focus:ring-amber-500"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="directCancelDescription">Penjelasan Detail (Opsional)</Label>
              <Textarea
                id="directCancelDescription"
                placeholder="Berikan penjelasan tambahan jika diperlukan..."
                value={cancelDescription}
                onChange={(e) => setCancelDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Tidak Jadi
            </Button>
            <Button 
              className="bg-red-600 hover:bg-red-700" 
              onClick={handleDirectCancel}
              disabled={!cancelReason || (cancelReason === "other" && !otherReasonText) || actionLoading}
            >
              {actionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Ya, Batalkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Request Dialog (post-payment, needs admin) */}
      <Dialog open={showCancelRequestDialog} onOpenChange={setShowCancelRequestDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ajukan Pembatalan</DialogTitle>
            <DialogDescription>
              {isSellerView ? (
                <>
                  <strong className="text-red-600">Pembeli sudah melakukan pembayaran.</strong>
                  <br />
                  Pembatalan memerlukan persetujuan admin. Jika disetujui, dana akan dikembalikan ke pembeli. Proses akan memakan waktu 1x24 jam.
                </>
              ) : (
                <>
                  {isService ? "Booking" : "Pesanan"} ini sudah dibayar. Pembatalan memerlukan persetujuan admin dan akan diproses dalam 1x24 jam.
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
                  <option key={reason.value} value={reason.value}>{reason.label}</option>
                ))}
              </select>
            </div>

            {cancelReason === "other" && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                <Label htmlFor="otherReasonReq">Sebutkan Alasan Lainnya *</Label>
                <Input
                  id="otherReasonReq"
                  placeholder="Sebutkan alasan pembatalan..."
                  value={otherReasonText}
                  onChange={(e) => setOtherReasonText(e.target.value)}
                  className="border-amber-300 focus:ring-amber-500"
                />
              </div>
            )}

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
              disabled={!cancelReason || !cancelDescription || (cancelReason === "other" && !otherReasonText) || actionLoading}
              onClick={handleCancelRequest}
            >
              Kirim Permintaan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── NEW: Buyer Confirm Complete Dialog ── */}
      <AlertDialog open={showCompleteConfirmDialog} onOpenChange={setShowCompleteConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Konfirmasi Pesanan Selesai?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Dengan mengkonfirmasi, kamu menyatakan bahwa:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-sm">
                <li>{isService ? "Layanan sudah diterima dan selesai dengan baik" : "Barang sudah diterima dalam kondisi baik"}</li>
                <li>Dana pembayaran akan diteruskan ke {isService ? "penyedia jasa" : "penjual"}</li>
                <li>Tindakan ini <strong>tidak dapat dibatalkan</strong></li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Belum, Cek Lagi</AlertDialogCancel>
            <AlertDialogAction
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={handleBuyerConfirmComplete}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              Ya, Konfirmasi Selesai
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
