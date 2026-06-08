import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  AlertCircle,
  Briefcase,
  Check,
  CheckCircle2,
  Clock,
  DollarSign,
  Loader2,
  Package,
  Send,
  ShieldCheck,
  Truck,
  Wallet,
  X,
} from "lucide-react"
import { formatCancelReason } from "./constants"

type ServiceData = {
  serviceNotes: string
  notes: string
}

interface Props {
  isService: boolean
  isSellerView: boolean
  orderStatus: string
  serviceData: ServiceData
  servicePriceInput: string
  setServicePriceInput: (value: string) => void
  servicePriceNotes: string
  setServicePriceNotes: (value: string) => void
  handleInputServicePrice: () => void
  formatPrice: (value: number) => string
  basePrice: number
  priceOfferNotes: string
  handleRejectPrice: () => void
  handleAcceptPrice: () => void
  shippingFee: number
  totalPayment: number
  setShowPaymentDialog: (open: boolean) => void
  netIncome: number
  inputShippingFee: string
  setInputShippingFee: (value: string) => void
  shippingNotes: string
  setShippingNotes: (value: string) => void
  handleInputShippingFee: () => void
  handleDeliver: () => void
  handleConfirmOrder: () => void
  handleRejectOrder: () => void
  sellerHasConfirmed: boolean
  cancelReason?: string | null
  handleBuyerConfirmComplete: () => void
  autoConfirmDeadline: string | null
  actionLoading: boolean
  shippingAddress?: string
  cancelledBy?: string | null
}

export default function OrderDetailStatusSection({
  isService,
  isSellerView,
  orderStatus,
  serviceData,
  servicePriceInput,
  setServicePriceInput,
  servicePriceNotes,
  setServicePriceNotes,
  handleInputServicePrice,
  formatPrice,
  basePrice,
  priceOfferNotes,
  handleRejectPrice,
  handleAcceptPrice,
  shippingFee,
  totalPayment,
  setShowPaymentDialog,
  netIncome,
  inputShippingFee,
  setInputShippingFee,
  shippingNotes,
  setShippingNotes,
  handleInputShippingFee,
  handleDeliver,
  handleConfirmOrder,
  handleRejectOrder,
  sellerHasConfirmed,
  cancelReason,
  handleBuyerConfirmComplete,
  autoConfirmDeadline,
  actionLoading,
  shippingAddress,
  cancelledBy,
}: Props) {
  const autoConfirmDate = autoConfirmDeadline
    ? new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(autoConfirmDeadline))
    : null

  return (
    <>
      {/* ── PENDING — Seller: Confirm Order ── */}
      {orderStatus === "pending" && isSellerView && (
        <Card className="mb-6 border-amber-200 bg-amber-50 dark:bg-amber-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-800 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-200">Pesanan Baru Masuk!</p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Konfirmasi pesanan untuk melanjutkan proses.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 text-red-600 border-red-300 hover:bg-red-50" onClick={handleRejectOrder} disabled={actionLoading}>
                <X className="h-4 w-4 mr-2" /> Tolak Pesanan
              </Button>
              <Button className="flex-1 bg-amber-600 hover:bg-amber-700" onClick={handleConfirmOrder} disabled={actionLoading}>
                {actionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                Terima Pesanan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── PENDING — Buyer: Waiting ── */}
      {orderStatus === "pending" && !isSellerView && (
        <Card className="mb-6 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-800 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-200">Menunggu Konfirmasi {isService ? "Penyedia" : "Penjual"}</p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  {isService ? "Penyedia jasa" : "Penjual"} sedang meninjau pesananmu.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── WAITING_PRICE — Buyer: Waiting for price offer ── */}
      {isService && orderStatus === "waiting_price" && !isSellerView && (
        <Card className="mb-6 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-800 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="font-medium text-orange-800 dark:text-orange-200">Menunggu Penawaran Harga</p>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Penyedia jasa sedang meninjau kebutuhanmu dan akan mengirimkan penawaran harga.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── WAITING_PRICE — Seller: Input price ── */}
      {isService && isSellerView && orderStatus === "waiting_price" && (
        <Card className="mb-6 border-amber-200 bg-amber-50 dark:bg-amber-900/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <DollarSign className="h-5 w-5" />
              Kirim Penawaran Harga
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border">
              <p className="text-sm text-muted-foreground">Kebutuhan Pembeli:</p>
              <p className="mt-1">{serviceData.notes || "—"}</p>
            </div>
            {serviceData.serviceNotes && (
              <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border">
                <p className="text-sm text-muted-foreground">Catatan Tambahan:</p>
                <p className="mt-1">{serviceData.serviceNotes}</p>
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="servicePrice">Harga Jasa (Rp) *</Label>
                <Input id="servicePrice" type="number" placeholder="Contoh: 250000" value={servicePriceInput} onChange={(e) => setServicePriceInput(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Catatan (Opsional)</Label>
                <Input placeholder="Contoh: Termasuk editing 10 foto" value={servicePriceNotes} onChange={(e) => setServicePriceNotes(e.target.value)} />
              </div>
            </div>
            <Button className="w-full bg-amber-600 hover:bg-amber-700" onClick={handleInputServicePrice} disabled={!servicePriceInput || actionLoading}>
              {actionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              Kirim Penawaran Harga
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── WAITING_CONFIRMATION — Buyer: Accept/Reject price ── */}
      {isService && orderStatus === "waiting_confirmation" && !isSellerView && (
        <Card className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-blue-800 dark:text-blue-200">Penawaran Harga Diterima!</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">Silakan tinjau dan konfirmasi.</p>
              </div>
            </div>
            <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-sm text-muted-foreground">Penawaran Harga</p>
                  <p className="text-2xl font-bold text-blue-600">{formatPrice(basePrice)}</p>
                </div>
                <Badge className="bg-blue-100 text-blue-700">Menunggu Konfirmasi</Badge>
              </div>
              {priceOfferNotes && (
                <div className="mt-2 p-2 bg-slate-50 dark:bg-slate-700 rounded text-sm">
                  <p className="text-muted-foreground">Catatan Penyedia:</p>
                  <p>{priceOfferNotes}</p>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-4">
              <Button variant="outline" className="flex-1 text-red-600 border-red-300 hover:bg-red-50" onClick={handleRejectPrice} disabled={actionLoading}>
                <X className="h-4 w-4 mr-2" /> Tolak
              </Button>
              <Button className="flex-1 bg-primary-600 hover:bg-primary-700" onClick={handleAcceptPrice} disabled={actionLoading}>
                <Check className="h-4 w-4 mr-2" /> Setuju & Bayar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── WAITING_CONFIRMATION — Seller: Waiting ── */}
      {isService && isSellerView && orderStatus === "waiting_confirmation" && (
        <Card className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-blue-800 dark:text-blue-200">Menunggu Konfirmasi Pembeli</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Penawaran harga {formatPrice(basePrice)} sedang ditinjau.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── WAITING_SHIPPING_FEE — Buyer: Waiting ── */}
      {!isService && orderStatus === "waiting_shipping_fee" && !isSellerView && (
        <Card className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-blue-800 dark:text-blue-200">Menunggu Penjual Input Ongkir</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">Penjual sedang melihat alamatmu.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── WAITING_SHIPPING_FEE — Seller: Input shipping fee ── */}
      {!isService && isSellerView && orderStatus === "waiting_shipping_fee" && (
        <Card className="mb-6 border-amber-200 bg-amber-50 dark:bg-amber-900/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <Truck className="h-5 w-5" /> Input Ongkos Kirim
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {shippingAddress && (
              <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border">
                <p className="text-sm text-muted-foreground">Alamat Pembeli:</p>
                <p className="font-medium">{shippingAddress}</p>
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shippingFee">Ongkos Kirim (Rp)</Label>
                <Input id="shippingFee" type="number" placeholder="Contoh: 10000" value={inputShippingFee} onChange={(e) => setInputShippingFee(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Catatan (Opsional)</Label>
                <Input placeholder="Contoh: Pakai motor, 30 menit" value={shippingNotes} onChange={(e) => setShippingNotes(e.target.value)} />
              </div>
            </div>
            <Button className="w-full bg-amber-600 hover:bg-amber-700" onClick={handleInputShippingFee} disabled={!inputShippingFee || actionLoading}>
              {actionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              Kirim Biaya Ongkir
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── WAITING_PAYMENT — Buyer: Pay now ── */}
      {orderStatus === "waiting_payment" && !isSellerView && (
        <Card className="mb-6 bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="font-medium text-primary-800 dark:text-primary-200">Silakan Lakukan Pembayaran</p>
                <p className="text-sm text-primary-700 dark:text-primary-300">Segera lakukan pembayaran untuk melanjutkan.</p>
              </div>
            </div>
            <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-primary-200 dark:border-primary-700">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">{isService ? "Harga Jasa" : "Harga Barang"}</span>
                <span>{formatPrice(basePrice)}</span>
              </div>
              {shippingFee > 0 && (
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Ongkos Kirim</span>
                  <span>{formatPrice(shippingFee)}</span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Pembayaran</span>
                <span className="text-xl font-bold text-primary-600">{formatPrice(totalPayment)}</span>
              </div>
            </div>
            <Button className="w-full bg-primary-600 hover:bg-primary-700 mt-4" size="lg" onClick={() => setShowPaymentDialog(true)} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Wallet className="h-4 w-4 mr-2" />}
              Bayar Sekarang
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── WAITING_PAYMENT — Seller: Waiting ── */}
      {orderStatus === "waiting_payment" && isSellerView && (
        <Card className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-blue-800 dark:text-blue-200">Menunggu Pembayaran Pembeli</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">Total: {formatPrice(totalPayment)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── PROCESSING / READY_PICKUP / IN_DELIVERY — Seller: Deliver/Complete ── */}
      {isSellerView && ["processing", "ready_pickup"].includes(orderStatus) && !sellerHasConfirmed && (
        <Card className="mb-6 border-primary-200 bg-primary-50 dark:bg-primary-900/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-primary-800 dark:text-primary-200">
              {isService ? <Briefcase className="h-5 w-5" /> : <Package className="h-5 w-5" />}
              {isService ? "Konfirmasi Layanan Selesai" : "Konfirmasi Pengiriman"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-primary-700 dark:text-primary-300">
              Pembeli sudah melakukan pembayaran. {isService ? "Klik tombol di bawah saat layanan selesai." : "Klik tombol di bawah saat barang diserahkan/dikirim."}
            </p>
            <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border">
              <p className="text-sm font-medium">Pendapatan Bersih (setelah potongan 5%):</p>
              <p className="text-2xl font-bold text-primary-600">{formatPrice(netIncome)}</p>
            </div>
            <Button className="w-full bg-primary-600 hover:bg-primary-700" onClick={handleDeliver} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
              {isService ? "Konfirmasi Layanan Selesai" : "Konfirmasi Barang Dikirim"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── Seller confirmed, waiting buyer confirmation ── */}
      {isSellerView && sellerHasConfirmed && orderStatus !== "completed" && orderStatus !== "cancelled" && (
        <Card className="mb-6 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-emerald-800 dark:text-emerald-200">Menunggu Konfirmasi Pembeli</p>
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  {isService ? "Layanan sudah dikonfirmasi selesai." : "Barang sudah dikonfirmasi dikirim."} Menunggu pembeli mengkonfirmasi penerimaan.
                </p>
                {autoConfirmDate && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                    Auto-konfirmasi: {autoConfirmDate}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── PROCESSING/IN_DELIVERY/READY_PICKUP — Buyer: Waiting or Confirm ── */}
      {!isSellerView && ["processing", "ready_pickup", "in_delivery"].includes(orderStatus) && orderStatus !== "completed" && (
        <>
          {sellerHasConfirmed ? (
            <Card className="mb-6 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-medium text-emerald-800 dark:text-emerald-200">
                      {isService ? "Penyedia jasa mengkonfirmasi layanan selesai!" : orderStatus === "in_delivery" ? "Barang sudah dikirim!" : "Barang sudah diserahkan!"}
                    </p>
                    <p className="text-sm text-emerald-700 dark:text-emerald-300">
                      {isService ? "Apakah layanan sudah selesai dengan baik?" : "Apakah barang sudah kamu terima?"}
                    </p>
                    {autoConfirmDate && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                        Otomatis dikonfirmasi: {autoConfirmDate}
                      </p>
                    )}
                  </div>
                </div>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700" size="lg" onClick={handleBuyerConfirmComplete} disabled={actionLoading}>
                  {actionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                  Konfirmasi Pesanan Selesai
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-6 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-800 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 text-purple-600 dark:text-purple-400 animate-spin" />
                  </div>
                  <div>
                    <p className="font-medium text-purple-800 dark:text-purple-200">
                      {isService ? "Layanan Sedang Diproses" : orderStatus === "ready_pickup" ? "Siap Diambil" : "Pesanan Sedang Diproses"}
                    </p>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      {isService ? "Penyedia jasa sedang mengerjakan pesananmu." : orderStatus === "ready_pickup" ? "Barang siap diambil di lokasi penjual." : "Penjual sedang memproses pesananmu."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* ── COMPLETED — Both: Completed banner ── */}
      {orderStatus === "completed" && (
        <Card className="mb-6 bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="font-medium text-primary-800 dark:text-primary-200">
                  {isService ? "Layanan Selesai!" : "Pesanan Selesai!"}
                </p>
                <p className="text-sm text-primary-700 dark:text-primary-300">
                  {isSellerView
                    ? "Dana sudah masuk ke saldo kamu."
                    : "Terima kasih! Jangan lupa beri rating."
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── CANCELLED ── */}
      {orderStatus === "cancelled" && (
        <Card className="mb-6 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-800 flex items-center justify-center shrink-0">
                <X className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <p className="text-lg font-bold text-red-800 dark:text-red-200">
                  {isService ? "Booking" : "Pesanan"} Dibatalkan {cancelledBy ? `oleh ${cancelledBy}` : ""}
                </p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Pesanan ini telah dibatalkan dan tidak dapat dilanjutkan.
                </p>
                {cancelReason && (
                  <div className="mt-3 p-3 bg-white/50 dark:bg-black/20 rounded-lg border border-red-200 dark:border-red-800/50">
                    <p className="text-xs font-bold uppercase tracking-wider text-red-800 dark:text-red-400 mb-1">Alasan Pembatalan:</p>
                    <p className="text-sm text-red-700 dark:text-red-300 italic">"{formatCancelReason(cancelReason)}"</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}
