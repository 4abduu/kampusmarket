import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Briefcase, CalendarIcon, Clock, Package, Shield, Loader2 } from "lucide-react"
import type { Address, CheckoutProduct } from "@/components/pages/user/checkout/checkout.types"

interface Props {
  product: CheckoutProduct
  isService: boolean
  quantity: number
  displayPrice: string
  bookingDate?: Date
  serviceNotes: string
  shippingMethod: string
  basePrice: number
  totalPayment: number
  formatPrice: (price: number) => string
  handleCreateOrder: () => void
  isBookingDateMissing: boolean
  isServiceRequirementsMissing: boolean
  isDeliveryAddressMissing: boolean
  selectedAddressId: string | null
  addresses: Address[]
  isSubmitting?: boolean
}

export default function CheckoutOrderSummaryColumn({
  product,
  isService,
  quantity,
  displayPrice,
  bookingDate,
  serviceNotes,
  shippingMethod,
  basePrice,
  totalPayment,
  formatPrice,
  handleCreateOrder,
  isBookingDateMissing,
  isServiceRequirementsMissing,
  isDeliveryAddressMissing,
  selectedAddressId,
  addresses,
  isSubmitting = false,
}: Props) {
  const sellerName = product.seller?.name || "Tidak diketahui";

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ringkasan Pesanan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
              {isService ? (
                <Briefcase className="h-8 w-8 text-purple-600/60" />
              ) : (
                <Package className="h-8 w-8 text-muted-foreground/30" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium line-clamp-2">{product.title}</p>
                {isService && (
                  <Badge variant="outline" className="text-xs border-purple-500 text-purple-600">
                    Jasa
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{quantity}x</p>
              <p className="font-bold text-primary-600">{displayPrice}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs bg-primary-100 text-primary-700">
                {sellerName.split(" ").map((name) => name[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">{sellerName}</span>
          </div>

          <Separator />

          {isService && (
            <div className="space-y-2">
              {bookingDate && (
                <div className="flex items-center gap-2 text-sm">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Tanggal:</span>
                  <span className="font-medium">{format(bookingDate, "d MMMM yyyy", { locale: id })}</span>
                </div>
              )}
              {product.durationMin && product.durationMax && product.durationUnit && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Durasi:</span>
                  <span className="font-medium">
                    {product.durationMin === product.durationMax
                      ? `${product.durationMin} ${product.durationUnit}`
                      : `${product.durationMin} - ${product.durationMax} ${product.durationUnit}`}
                  </span>
                </div>
              )}
              {serviceNotes && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Catatan: </span>
                  <span className="italic line-clamp-2">{serviceNotes}</span>
                </div>
              )}
            </div>
          )}

          {isService && (bookingDate || serviceNotes) && <Separator />}

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{isService ? "Harga Jasa" : "Harga Barang"}</span>
              <span>{formatPrice(basePrice)}</span>
            </div>
            {!isService && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ongkos Kirim</span>
                {shippingMethod === "delivery" ? (
                  <span className="text-amber-600">Menunggu konfirmasi</span>
                ) : (
                  <span className="text-primary-600">Gratis</span>
                )}
              </div>
            )}
            {isService && shippingMethod === "cod" && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Biaya Transport</span>
                <span className="text-muted-foreground text-xs">(dikonfirmasi nanti)</span>
              </div>
            )}
          </div>

          <Separator />

          <div className="flex justify-between font-bold">
            <span>Total Pembayaran</span>
            {!isService && shippingMethod === "delivery" ? (
              <div className="text-right">
                <span className="text-muted-foreground text-sm">Belum termasuk ongkir</span>
                <p className="text-primary-600 text-lg">{formatPrice(basePrice)}</p>
              </div>
            ) : (
              <span className="text-primary-600 text-lg">{formatPrice(totalPayment)}</span>
            )}
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm">
            <p className="font-medium mb-2">Alur {isService ? "Booking" : "Pesanan"}:</p>
            <ol className="space-y-1 text-muted-foreground list-decimal list-inside">
              <li>Buat {isService ? "booking" : "pesanan"}</li>
              <li>Tunggu konfirmasi {isService ? "penyedia jasa" : "penjual"}</li>
              {!isService && shippingMethod === "delivery" && <li>Penjual input ongkir</li>}
              {shippingMethod !== "cod" && <li>Bayar {isService ? "jasa" : "pesanan"}</li>}
              <li>{isService ? "Layanan selesai" : "Terima barang"}</li>
            </ol>
          </div>

          <Button
            className="w-full bg-primary-600 hover:bg-primary-700"
            size="lg"
            onClick={handleCreateOrder}
            disabled={isBookingDateMissing || isServiceRequirementsMissing || isDeliveryAddressMissing || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Memproses...
              </>
            ) : (
              isService ? "Buat Booking" : "Buat Pesanan"
            )}
          </Button>

          {isService && !bookingDate && (
            <p className="text-xs text-amber-600 text-center">Silakan pilih tanggal booking terlebih dahulu</p>
          )}

          {!isService && shippingMethod === "delivery" && !selectedAddressId && addresses.length === 0 && (
            <p className="text-xs text-amber-600 text-center">Silakan tambahkan alamat pengiriman terlebih dahulu</p>
          )}

          <p className="text-xs text-center text-muted-foreground">
            Dengan membuat pesanan, kamu menyetujui <a href="#" className="text-primary-600 hover:underline">Syarat & Ketentuan</a>
          </p>
        </CardContent>
      </Card>

      <Card className="bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary-600" />
            <div>
              <p className="font-medium text-primary-800 dark:text-primary-200">Transaksi Aman</p>
              <p className="text-sm text-primary-700 dark:text-primary-300">
                Pembayaran ditahan (escrow) sampai transaksi selesai
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
