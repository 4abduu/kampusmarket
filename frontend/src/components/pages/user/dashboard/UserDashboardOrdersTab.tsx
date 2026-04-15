import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockOrders } from "@/lib/mock-data"
import type { OrderListItem } from "@/components/pages/user/orders-list/ordersList.types"
import { AlertCircle, Briefcase, Check, CheckCircle2, DollarSign, MessageCircle, Package, Truck } from "lucide-react"

type Props = {
  onNavigate: (page: string, productId?: string) => void
  formatPrice: (price: number) => string
  getStatusBadge: (status: string) => React.ReactNode
  setShowShippingDialog: (open: boolean) => void
  handleOpenServicePriceDialog: (orderId: string) => void
  setShowOrderConfirmDialog: (open: boolean) => void
  handleRejectPrice: (orderId: string) => void
  handleAcceptPrice: (order: OrderListItem) => void
}

export default function UserDashboardOrdersTab({
  onNavigate,
  formatPrice,
  getStatusBadge,
  setShowShippingDialog,
  handleOpenServicePriceDialog,
  setShowOrderConfirmDialog,
  handleRejectPrice,
  handleAcceptPrice,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pesanan Saya</CardTitle>
        <CardDescription>Daftar semua transaksi jual dan beli</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="selling">
          <TabsList className="mb-4">
            <TabsTrigger value="selling">Penjualan</TabsTrigger>
            <TabsTrigger value="buying">Pembelian</TabsTrigger>
          </TabsList>

          <TabsContent value="selling">
            <div className="space-y-4">
              {mockOrders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-16 h-16 rounded flex items-center justify-center ${order.productType === "jasa" ? "bg-secondary-100 dark:bg-secondary-900/30" : "bg-slate-100 dark:bg-slate-800"}`}>
                        {order.productType === "jasa" ? <Briefcase className="h-8 w-8 text-secondary-600/50" /> : <Package className="h-8 w-8 text-muted-foreground/30" />}
                      </div>
                      <div>
                        <p className="font-medium">{order.product.title}</p>
                        <p className="text-sm text-muted-foreground">untuk {order.buyer.name}</p>
                      </div>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg mb-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Harga:</span><span>{formatPrice(order.basePrice)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Ongkir:</span><span>{formatPrice(order.shippingFee)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Biaya Admin:</span><span className="text-red-500">-{formatPrice(order.adminFeeDeducted)}</span></div>
                      <div className="flex justify-between font-medium text-primary-600"><span>Bersih:</span><span>{formatPrice(order.netIncome)}</span></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => onNavigate("chat")}><MessageCircle className="h-4 w-4 mr-1" />Chat</Button>
                      <Button variant="outline" size="sm" onClick={() => onNavigate("order-detail", order.id)}>Detail</Button>
                    </div>
                    {order.status === "waiting_shipping_fee" && (
                      <Button size="sm" className="bg-amber-600 hover:bg-amber-700" onClick={() => setShowShippingDialog(true)}>
                        <Truck className="h-4 w-4 mr-1" />Input Ongkir
                      </Button>
                    )}
                    {order.status === "waiting_price" && (
                      <Button size="sm" className="bg-amber-600 hover:bg-amber-700" onClick={() => handleOpenServicePriceDialog(order.id)}>
                        <DollarSign className="h-4 w-4 mr-1" />Kirim Penawaran
                      </Button>
                    )}
                    {order.status === "processing" && (
                      <Button size="sm" className="bg-primary-600 hover:bg-primary-700" onClick={() => setShowOrderConfirmDialog(true)}>
                        <CheckCircle2 className="h-4 w-4 mr-1" />Konfirmasi Dikirim
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="buying">
            <div className="space-y-4">
              {mockOrders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-16 h-16 rounded flex items-center justify-center ${order.productType === "jasa" ? "bg-secondary-100 dark:bg-secondary-900/30" : "bg-slate-100 dark:bg-slate-800"}`}>
                        {order.productType === "jasa" ? <Briefcase className="h-8 w-8 text-secondary-600/50" /> : <Package className="h-8 w-8 text-muted-foreground/30" />}
                      </div>
                      <div>
                        <p className="font-medium">{order.product.title}</p>
                        <p className="text-sm text-muted-foreground">dari {order.seller.name}</p>
                      </div>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg mb-3">
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Harga:</span><span>{formatPrice(order.basePrice)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Ongkir:</span><span>{formatPrice(order.shippingFee)}</span></div>
                      <div className="flex justify-between font-bold border-t pt-1"><span>Total:</span><span className="text-primary-600">{formatPrice(order.totalPrice)}</span></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => onNavigate("chat")}><MessageCircle className="h-4 w-4 mr-1" />Chat</Button>
                      <Button variant="outline" size="sm" onClick={() => onNavigate("order-detail", order.id)}>Detail</Button>
                    </div>
                    {order.status === "waiting_confirmation" && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50" onClick={() => handleRejectPrice(order.id)}>
                          <AlertCircle className="h-4 w-4 mr-1" />Tolak
                        </Button>
                        <Button size="sm" className="bg-primary-600 hover:bg-primary-700" onClick={() => handleAcceptPrice(order)}>
                          <Check className="h-4 w-4 mr-1" />Setuju & Bayar
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
