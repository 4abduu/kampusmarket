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
  Package,
  Send,
  Truck,
  Wallet,
  X,
} from "lucide-react"

type OrderStatus =
  | "waiting_price"
  | "waiting_confirmation"
  | "waiting_shipping_fee"
  | "waiting_payment"
  | "processing"
  | "completed"
  | "cancelled"

type ServiceData = {
  serviceNotes: string
}

interface Props {
  isService: boolean
  isSellerView: boolean
  setIsSellerView: (value: boolean) => void
  orderStatus: OrderStatus
  setOrderStatus: (status: OrderStatus) => void
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
  handleConfirmShipment: () => void
}

export default function OrderDetailStatusSection({
  isService,
  isSellerView,
  setIsSellerView,
  orderStatus,
  setOrderStatus,
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
  handleConfirmShipment,
}: Props) {
  return (
    <>
      <Card className="mb-6 bg-slate-100 dark:bg-slate-800 border-dashed">
        <CardContent className="p-3">
          <p className="text-sm text-muted-foreground mb-2">Demo: Toggle View</p>
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant={!isSellerView ? "default" : "outline"}
              onClick={() => setIsSellerView(false)}
              className="text-xs"
            >
              {isService ? "Customer View" : "Pembeli View"}
            </Button>
            <Button
              size="sm"
              variant={isSellerView ? "default" : "outline"}
              onClick={() => setIsSellerView(true)}
              className="text-xs"
            >
              {isService ? "Penyedia View" : "Penjual View"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (orderStatus === "waiting_price") setOrderStatus("waiting_confirmation")
                else if (orderStatus === "waiting_confirmation") setOrderStatus("processing")
                else if (orderStatus === "waiting_shipping_fee") setOrderStatus("waiting_payment")
                else if (orderStatus === "waiting_payment") setOrderStatus("processing")
                else if (orderStatus === "processing") setOrderStatus("completed")
                else setOrderStatus(isService ? "waiting_price" : "waiting_shipping_fee")
              }}
              className="text-xs"
            >
              Next Status: {orderStatus}
            </Button>
          </div>
        </CardContent>
      </Card>

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
              <p className="mt-1">{serviceData.serviceNotes}</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="servicePrice">Harga Jasa (Rp) *</Label>
                <Input
                  id="servicePrice"
                  type="number"
                  placeholder="Contoh: 250000"
                  value={servicePriceInput}
                  onChange={(e) => setServicePriceInput(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Catatan (Opsional)</Label>
                <Input
                  placeholder="Contoh: Termasuk editing 10 foto"
                  value={servicePriceNotes}
                  onChange={(e) => setServicePriceNotes(e.target.value)}
                />
              </div>
            </div>
            <Button className="w-full bg-amber-600 hover:bg-amber-700" onClick={handleInputServicePrice} disabled={!servicePriceInput}>
              <Send className="h-4 w-4 mr-2" />
              Kirim Penawaran Harga
            </Button>
          </CardContent>
        </Card>
      )}

      {isService && orderStatus === "waiting_confirmation" && !isSellerView && (
        <Card className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-blue-800 dark:text-blue-200">Penawaran Harga Diterima!</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Penyedia jasa telah mengirimkan penawaran harga. Silakan tinjau dan konfirmasi.
                </p>
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
              <Button variant="outline" className="flex-1 text-red-600 border-red-300 hover:bg-red-50" onClick={handleRejectPrice}>
                <X className="h-4 w-4 mr-2" />
                Tolak
              </Button>
              <Button className="flex-1 bg-primary-600 hover:bg-primary-700" onClick={handleAcceptPrice}>
                <Check className="h-4 w-4 mr-2" />
                Setuju & Bayar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
                  Penawaran harga {formatPrice(basePrice)} sedang ditinjau oleh pembeli.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!isService && orderStatus === "waiting_shipping_fee" && !isSellerView && (
        <Card className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-blue-800 dark:text-blue-200">Menunggu Penjual Input Ongkir</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Penjual sedang melihat alamatmu dan akan segera menginput ongkir.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!isService && orderStatus === "waiting_payment" && !isSellerView && (
        <Card className="mb-6 bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="font-medium text-primary-800 dark:text-primary-200">Ongkir Dikonfirmasi - Silakan Bayar</p>
                <p className="text-sm text-primary-700 dark:text-primary-300">
                  Ongkos kirim {formatPrice(shippingFee)} telah diinput. Segera lakukan pembayaran.
                </p>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-primary-200 dark:border-primary-700">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Harga Barang</span>
                <span>{formatPrice(basePrice)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Ongkos Kirim</span>
                <span>{formatPrice(shippingFee)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Pembayaran</span>
                <span className="text-xl font-bold text-primary-600">{formatPrice(totalPayment)}</span>
              </div>
            </div>

            <Button className="w-full bg-primary-600 hover:bg-primary-700 mt-4" size="lg" onClick={() => setShowPaymentDialog(true)}>
              <Wallet className="h-4 w-4 mr-2" />
              Bayar Sekarang
            </Button>
          </CardContent>
        </Card>
      )}

      {!isService && isSellerView && orderStatus === "waiting_payment" && (
        <Card className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-blue-800 dark:text-blue-200">Menunggu Pembayaran Pembeli</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Ongkos kirim {formatPrice(shippingFee)} telah dikirim. Total: {formatPrice(totalPayment)}
                </p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-white dark:bg-slate-800 rounded-lg border">
              <p className="text-sm text-muted-foreground">Pendapatan bersih (setelah potongan 5%):</p>
              <p className="text-xl font-bold text-primary-600">{formatPrice(netIncome)}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {!isService && isSellerView && orderStatus === "waiting_shipping_fee" && (
        <Card className="mb-6 border-amber-200 bg-amber-50 dark:bg-amber-900/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <Truck className="h-5 w-5" />
              Input Ongkos Kirim
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border">
              <p className="text-sm text-muted-foreground">Alamat Pembeli:</p>
              <p className="font-medium">Jl. Kampus No. 123, Kos Melati, Kamar 5</p>
              <p className="text-sm">Limau Manis, Padang</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shippingFee">Ongkos Kirim (Rp)</Label>
                <Input
                  id="shippingFee"
                  type="number"
                  placeholder="Contoh: 10000"
                  value={inputShippingFee}
                  onChange={(e) => setInputShippingFee(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Catatan (Opsional)</Label>
                <Input
                  placeholder="Contoh: Pakai motor, estimasi 30 menit"
                  value={shippingNotes}
                  onChange={(e) => setShippingNotes(e.target.value)}
                />
              </div>
            </div>
            <Button className="w-full bg-amber-600 hover:bg-amber-700" onClick={handleInputShippingFee} disabled={!inputShippingFee}>
              <Send className="h-4 w-4 mr-2" />
              Kirim Biaya Ongkir
            </Button>
          </CardContent>
        </Card>
      )}

      {isSellerView && orderStatus === "processing" && (
        <Card className="mb-6 border-primary-200 bg-primary-50 dark:bg-primary-900/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-primary-800 dark:text-primary-200">
              {isService ? <Briefcase className="h-5 w-5" /> : <Package className="h-5 w-5" />}
              {isService ? "Konfirmasi Selesai" : "Konfirmasi Pengiriman"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-primary-700 dark:text-primary-300">
              Pembeli sudah melakukan pembayaran. Segera proses {isService ? "layanan sesuai jadwal" : "dan kirim barang"}.
            </p>
            <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border">
              <p className="text-sm font-medium">Pendapatan Bersih (setelah potongan 5%):</p>
              <p className="text-2xl font-bold text-primary-600">{formatPrice(netIncome)}</p>
            </div>
            <Button className="w-full bg-primary-600 hover:bg-primary-700" onClick={handleConfirmShipment}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {isService ? "Konfirmasi Layanan Selesai" : "Konfirmasi Barang Dikirim"}
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  )
}
