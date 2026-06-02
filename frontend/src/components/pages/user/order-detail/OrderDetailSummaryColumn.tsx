import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, DollarSign, Info, MessageCircle, Phone, Star, Truck, Briefcase, XCircle } from "lucide-react"
import { openWhatsApp } from "@/lib/whatsapp"

type ShippingMethodConfig = {
  label: string
  desc: string
}

interface Props {
  isService: boolean
  isSellerView: boolean
  shippingMethodConfig: ShippingMethodConfig
  shippingAddress?: string
  onNavigate: (page: string, data?: any) => void
  basePrice: number
  shippingFee: number
  orderStatus: string
  totalPayment: number
  netIncome: number
  adminFeeDeducted: number
  formatPrice: (price: number) => string
  adminFeePercentage: number
  canCancelDirectly: boolean
  needsCancelRequest: boolean
  sellerCanCancelDirectly: boolean
  sellerNeedsCancelRequest: boolean
  handleCancelClick: () => void
  openSellerCancelDialog: () => void
  orderNumber: string
  createdAt: string
  orderCompleted?: boolean
  onRating?: () => void
  isRated?: boolean
  productId?: string
  buyerId?: string
  sellerId?: string
  partnerName?: string
  partnerPhone?: string
  productTitle?: string
  shippingNotesStr?: string
}

export default function OrderDetailSummaryColumn({
  isService,
  isSellerView,
  shippingMethodConfig,
  shippingAddress,
  onNavigate,
  basePrice,
  shippingFee,
  orderStatus,
  totalPayment,
  netIncome,
  adminFeeDeducted,
  formatPrice,
  adminFeePercentage,
  canCancelDirectly,
  needsCancelRequest,
  sellerCanCancelDirectly,
  sellerNeedsCancelRequest,
  handleCancelClick,
  openSellerCancelDialog,
  orderNumber,
  createdAt,
  orderCompleted,
  onRating,
  isRated,
  productId,
  buyerId,
  sellerId,
  partnerName,
  partnerPhone,
  productTitle,
  shippingNotesStr,
}: Props) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{isService ? "Info Layanan" : "Info Pengiriman"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Metode</p>
            <div className="flex items-center gap-2">
              {isService ? (
                <Briefcase className="h-4 w-4 text-secondary-600" />
              ) : (
                <Truck className="h-4 w-4 text-primary-600" />
              )}
              <span className="font-medium">{shippingMethodConfig.label}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{shippingMethodConfig.desc}</p>
            {shippingNotesStr && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">Catatan Penjual (Ongkir)</p>
                <p className="text-sm text-blue-800 dark:text-blue-200">{shippingNotesStr}</p>
              </div>
            )}
          </div>

          {shippingAddress && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">{isService ? "Lokasi" : "Alamat"}</p>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="font-medium">{shippingAddress}</p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => {
              if (!isSellerView && productId) {
                onNavigate("chat", { productId, sellerId, chatAction: "chat" });
              } else if (isSellerView && productId) {
                onNavigate("chat", { productId, buyerId, sellerId, chatAction: "chat" });
              }
            }}>
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat {isSellerView ? (isService ? "Pemesan" : "Pembeli") : (isService ? "Penyedia" : "Penjual")}
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => openWhatsApp(partnerPhone, partnerName || (isSellerView ? 'Pembeli' : 'Penjual'), productTitle || 'Pesanan', isService)}>
              <Phone className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Rincian Pembayaran</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{isService ? "Harga Jasa" : "Harga Barang"}</span>
              <span>{formatPrice(basePrice)}</span>
            </div>

            {!isService && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ongkos Kirim</span>
                {["pending", "waiting_confirmation", "waiting_shipping_fee"].includes(orderStatus) ? (
                  <span className="text-blue-600 text-sm italic">Menunggu ongkir</span>
                ) : (
                  <span>{formatPrice(shippingFee)}</span>
                )}
              </div>
            )}
          </div>

          <Separator />

          <div className="flex justify-between font-bold text-lg">
            <span>Total Pembayaran</span>
            {(orderStatus === "waiting_shipping_fee" || orderStatus === "waiting_price") ? (
              <div className="text-right">
                <span className="text-sm font-normal text-muted-foreground">Belum final</span>
                <p className="text-primary-600">{formatPrice(basePrice)}</p>
              </div>
            ) : (
              <span className="text-primary-600">{formatPrice(totalPayment)}</span>
            )}
          </div>

          {!isSellerView && (
            <div className="p-2 rounded bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 text-xs">
              <p className="flex items-center gap-1 font-medium text-primary-700 dark:text-primary-300">
                <CheckCircle2 className="h-3 w-3" />
                Tanpa Biaya Admin untuk Pembeli
              </p>
              <p className="text-primary-600 dark:text-primary-400 mt-1">
                Kamu hanya membayar harga {isService ? "jasa" : "barang"}{!isService && " + ongkir"}. Biaya layanan {adminFeePercentage * 100}% ditanggung {isService ? "penyedia" : "penjual"}.
              </p>
            </div>
          )}

          {isSellerView && (orderStatus === "waiting_confirmation" || orderStatus === "waiting_payment" || orderStatus === "processing" || orderStatus === "completed") && (
            <div className="p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
              <div className="flex items-center gap-2 text-primary-800 dark:text-primary-200">
                <DollarSign className="h-4 w-4" />
                <span className="font-medium text-sm">Pendapatan Bersih (Setelah Potongan)</span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-xl font-bold text-primary-600">{formatPrice(netIncome)}</p>
                <span className="text-xs text-muted-foreground">dari {formatPrice(basePrice + shippingFee)}</span>
              </div>
              <p className="text-xs text-primary-700 dark:text-primary-300 mt-1">
                Sudah dipotong biaya admin {adminFeePercentage * 100}% ({formatPrice(adminFeeDeducted)})
              </p>
            </div>
          )}

          <div className="p-2 rounded bg-slate-50 dark:bg-slate-800 text-xs text-muted-foreground">
            <p className="flex items-center gap-1">
              <Info className="h-3 w-3" />
              Biaya admin {adminFeePercentage * 100}% dipotong dari pendapatan {isService ? "penyedia" : "penjual"}, bukan ditambah ke pembeli
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
          {!isSellerView && (
          <>
            {orderCompleted && onRating && (
              <Button 
                variant={isRated ? "outline" : "default"}
                className={isRated ? "w-full" : "w-full bg-primary-600 hover:bg-primary-700"} 
                size="lg" 
                onClick={onRating}
              >
                <Star className="h-4 w-4 mr-2" />
                {isRated ? "Lihat Rating" : "Beri Rating & Ulasan"}
              </Button>
            )}

            {(canCancelDirectly || needsCancelRequest) && orderStatus !== "cancelled" && orderStatus !== "completed" && (
              <Button variant="outline" className="w-full text-red-600 border-red-300 hover:bg-red-50" onClick={handleCancelClick}>
                <XCircle className="h-4 w-4 mr-2" />
                {canCancelDirectly ? "Batalkan Pesanan" : "Ajukan Pembatalan"}
              </Button>
            )}
          </>
        )}

        {isSellerView && (
          <>
            {(orderStatus === "waiting_confirmation" || orderStatus === "waiting_payment") && (
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Menunggu {isService ? "pemesan" : "pembeli"} {isService ? "mengkonfirmasi penawaran" : "melakukan pembayaran"}
                </p>
                <p className="font-bold text-blue-600 mt-1">Total: {formatPrice(totalPayment)}</p>
                <p className="text-xs text-blue-600 mt-1">Pendapatan bersih: {formatPrice(netIncome)}</p>
              </div>
            )}

            {(sellerCanCancelDirectly || sellerNeedsCancelRequest) && orderStatus !== "cancelled" && (
              <Button variant="outline" className="w-full text-red-600 border-red-300 hover:bg-red-50" onClick={openSellerCancelDialog}>
                <XCircle className="h-4 w-4 mr-2" />
                {sellerCanCancelDirectly ? "Batalkan Pesanan" : "Ajukan Pembatalan"}
              </Button>
            )}
          </>
        )}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">No. {isService ? "Booking" : "Pesanan"}</p>
              <p className="font-medium font-mono">{orderNumber}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Tanggal</p>
              <p className="font-medium">{createdAt}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
