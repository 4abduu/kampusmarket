import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Briefcase, CalendarIcon, Clock, Handshake, Package, Shield, Loader2 } from "lucide-react"
import type { Address, CheckoutProduct } from "@/components/pages/user/checkout/checkout.types"
import StickyActionBar from "@/components/shared/StickyActionBar"

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
  negotiatedPrice?: number | null
  checkoutItems?: { product: any; quantity: number }[]
  isMultipleItems?: boolean
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
  negotiatedPrice,
  checkoutItems = [],
  isMultipleItems = false,
}: Props) {
  const sellerName = product.seller?.name || "Tidak diketahui";
  const totalItemCount = checkoutItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <div className="space-y-4 min-w-0">
        <Card className="hidden lg:block sticky top-24 self-start">
        <CardHeader>
          <CardTitle className="text-lg">Ringkasan Pesanan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isMultipleItems ? (
            <>
              <div className="flex gap-4">
                {product.images && product.images.length > 0 ? (
                  <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
                    <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className={`w-20 h-20 rounded-lg flex items-center justify-center shrink-0 ${isService ? "bg-purple-50 dark:bg-purple-900/20" : "bg-slate-100 dark:bg-slate-800"}`}>
                    {isService ? (
                      <Briefcase className="h-8 w-8 text-purple-600/60" />
                    ) : (
                      <Package className="h-8 w-8 text-muted-foreground/30" />
                    )}
                  </div>
                )}
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
                  {negotiatedPrice ? (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground line-through">{displayPrice}</p>
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-primary-600">{formatPrice(negotiatedPrice)}</p>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-400 text-amber-600 dark:text-amber-400">
                          <Handshake className="h-3 w-3 mr-0.5" />
                          Harga Nego
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <p className={`font-bold ${isService ? "text-purple-600" : "text-primary-600"}`}>{displayPrice}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className={`text-xs ${isService ? "bg-purple-100 text-purple-700" : "bg-primary-100 text-primary-700"}`}>
                    {sellerName.split(" ").map((name) => name[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{sellerName}</span>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              {checkoutItems.map((item, idx) => (
                <div key={item.product.id || idx} className="space-y-3">
                  <div className="flex gap-3">
                    {item.product.images && item.product.images.length > 0 ? (
                      <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                        <img src={item.product.images[0]} alt={item.product.title} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className={`w-16 h-16 rounded-lg flex items-center justify-center shrink-0 ${item.product.type === "jasa" ? "bg-purple-50 dark:bg-purple-900/20" : "bg-slate-100 dark:bg-slate-800"}`}>
                        {item.product.type === "jasa" ? (
                          <Briefcase className="h-6 w-6 text-purple-600/40" />
                        ) : (
                          <Package className="h-6 w-6 text-muted-foreground/30" />
                        )}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-2">{item.product.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.quantity}x</p>
                      <p className={`font-semibold text-sm ${item.product.type === "jasa" ? "text-purple-600" : "text-primary-600"}`}>
                        {formatPrice((item.product.priceMin || item.product.price_min || item.product.price || 0) * item.quantity)}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Avatar className="h-4 w-4">
                          <AvatarFallback className={`text-[8px] ${item.product.type === "jasa" ? "bg-purple-100 text-purple-700" : "bg-primary-100 text-primary-700"}`}>
                            {item.product.seller?.name?.split(" ").map((n: string) => n[0]).join("") || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-[10px] text-muted-foreground truncate">{item.product.seller?.name}</span>
                      </div>
                    </div>
                  </div>
                  {idx < checkoutItems.length - 1 && <Separator className="opacity-50" />}
                </div>
              ))}
            </div>
          )}

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
              <span className="text-muted-foreground">
                {isMultipleItems 
                  ? `Total Harga (${totalItemCount} barang)`
                  : (isService ? "Harga Jasa" : "Harga Barang") + (negotiatedPrice ? " (nego)" : "")}
              </span>
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
                <p className={`text-lg ${isService ? "text-purple-600" : "text-primary-600"}`}>{formatPrice(basePrice)}</p>
              </div>
            ) : (
              <span className={`text-lg ${isService ? "text-purple-600" : "text-primary-600"}`}>{formatPrice(totalPayment)}</span>
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

          <div className="hidden lg:block">
            <Button
              className={`w-full ${isService ? "bg-purple-600 hover:bg-purple-700" : "bg-primary-600 hover:bg-primary-700"}`}
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
          </div>

          <div className="hidden lg:block">
            {isService && !bookingDate && (
              <p className="text-xs text-amber-600 text-center mt-2">Silakan pilih tanggal booking terlebih dahulu</p>
            )}
            {!isService && shippingMethod === "delivery" && !selectedAddressId && addresses.length === 0 && (
              <p className="text-xs text-amber-600 text-center mt-2">Silakan tambahkan alamat pengiriman terlebih dahulu</p>
            )}
          </div>

          <p className="text-xs text-center text-muted-foreground hidden lg:block">
            Dengan membuat pesanan, kamu menyetujui <a href="#" className={`hover:underline ${isService ? "text-purple-600" : "text-primary-600"}`}>Syarat & Ketentuan</a>
          </p>
        </CardContent>
      </Card>
      <Card className={`hidden lg:block ${isService ? "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800" : "bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800"}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Shield className={`h-8 w-8 ${isService ? "text-purple-600" : "text-primary-600"}`} />
            <div>
              <p className={`font-medium ${isService ? "text-purple-800 dark:text-purple-200" : "text-primary-800 dark:text-primary-200"}`}>Transaksi Aman</p>
              <p className={`text-sm ${isService ? "text-purple-700 dark:text-purple-300" : "text-primary-700 dark:text-primary-300"}`}>
                Pembayaran ditahan (escrow) sampai transaksi selesai
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
      
      {/* Mobile Sticky Bar — duduk di atas bottom nav, lihat StickyActionBar */}
      <StickyActionBar className="!p-0">
        {((isService && !bookingDate) || (!isService && shippingMethod === "delivery" && !selectedAddressId && addresses.length === 0)) && (
          <div className="bg-amber-50 dark:bg-amber-900/20 px-4 py-2 border-b border-amber-200 dark:border-amber-800">
            <p className="text-[10px] text-amber-700 dark:text-amber-300 text-center">
              {isService && !bookingDate && "Pilih tanggal booking."}
              {!isService && shippingMethod === "delivery" && !selectedAddressId && addresses.length === 0 && "Tambahkan alamat pengiriman."}
            </p>
          </div>
        )}
        <div className="p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Total Pembayaran</p>
            <p className={`font-bold text-lg leading-none mt-1 ${isService ? "text-purple-600" : "text-primary-600"}`}>
              {!isService && shippingMethod === "delivery" ? formatPrice(basePrice) : formatPrice(totalPayment)}
            </p>
            {!isService && shippingMethod === "delivery" && (
              <p className="text-[10px] text-muted-foreground mt-0.5">Belum ongkir</p>
            )}
          </div>
          <Button
            className={`px-6 rounded-full ${isService ? "bg-purple-600 hover:bg-purple-700" : "bg-primary-600 hover:bg-primary-700"}`}
            onClick={handleCreateOrder}
            disabled={isBookingDateMissing || isServiceRequirementsMissing || isDeliveryAddressMissing || isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              isService ? "Buat Booking" : "Buat Pesanan"
            )}
          </Button>
        </div>
      </StickyActionBar>
    </>
  )
}
