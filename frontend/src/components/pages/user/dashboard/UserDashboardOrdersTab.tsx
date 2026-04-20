import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getUserOrders } from "@/lib/api/orders"
import type { OrderListItem } from "@/components/pages/user/orders-list/ordersList.types"
import { AlertCircle, Briefcase, Check, CheckCircle2, DollarSign, MessageCircle, Package, Truck, RotateCw } from "lucide-react"
import UserDashboardOrdersTabSkeleton from "@/components/skeleton/UserDashboardOrdersTabSkeleton"

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
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("selling")

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      setError(null)
      try {
        console.log('[UserDashboardOrdersTab] Fetching orders...')
        const data = await getUserOrders()
        console.log('[UserDashboardOrdersTab] Orders fetched successfully:', data)
        setOrders(Array.isArray(data) ? data : data.data || [])
      } catch (err: any) {
        const errorMessage = err?.message || 'Gagal memuat pesanan'
        const errorStatus = err?.status || err?.response?.status || 'unknown'
        
        console.error('[UserDashboardOrdersTab] Failed to fetch orders:', {
          error: err,
          message: errorMessage,
          status: errorStatus
        })
        
        // Provide more helpful error message to user
        let displayMessage = errorMessage
        if (errorStatus === 'Network Error' || errorStatus === 'unknown') {
          displayMessage = 'Tidak dapat terhubung ke server. Pastikan backend sedang berjalan (php artisan serve)'
        }
        
        setError(displayMessage)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  const sellingOrders = orders.filter((o: any) => o.role === 'seller')
  const buyingOrders = orders.filter((o: any) => o.role === 'buyer')

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pesanan Saya</CardTitle>
        <CardDescription>Daftar semua transaksi jual dan beli</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <UserDashboardOrdersTabSkeleton itemCount={3} />
        ) : error ? (
          <div className="space-y-3">
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
                <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                  Jika error terus terjadi, coba refresh halaman atau hubungi support.
                </p>
              </div>
            </div>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RotateCw className="h-4 w-4" />
              Coba Lagi
            </Button>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="selling">Penjualan ({sellingOrders.length})</TabsTrigger>
              <TabsTrigger value="buying">Pembelian ({buyingOrders.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="selling">
              <div className="space-y-4">
                {sellingOrders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p>Belum ada pesanan penjualan</p>
                  </div>
                ) : (
                  sellingOrders.map((order: any) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-16 h-16 rounded flex items-center justify-center ${order.productType === "jasa" ? "bg-secondary-100 dark:bg-secondary-900/30" : "bg-slate-100 dark:bg-slate-800"}`}>
                            {order.productType === "jasa" ? <Briefcase className="h-8 w-8 text-secondary-600/50" /> : <Package className="h-8 w-8 text-muted-foreground/30" />}
                          </div>
                          <div>
                            <p className="font-medium">{order.product?.title || 'Produk Tidak Ditemukan'}</p>
                            <p className="text-sm text-muted-foreground">untuk {order.buyer?.name || 'Pembeli'}</p>
                          </div>
                        </div>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg mb-3">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex justify-between"><span className="text-muted-foreground">Harga:</span><span>{formatPrice(order.basePrice)}</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Ongkir:</span><span>{formatPrice(order.shippingFee)}</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Biaya Admin:</span><span className="text-red-500">-{formatPrice(order.adminFeeDeducted)}</span></div>
                          <div className="flex justify-between font-medium text-primary"><span>Bersih:</span><span>{formatPrice(order.netIncome)}</span></div>
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
                          <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={() => setShowOrderConfirmDialog(true)}>
                            <CheckCircle2 className="h-4 w-4 mr-1" />Konfirmasi Dikirim
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="buying">
              <div className="space-y-4">
                {buyingOrders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p>Belum ada pesanan pembelian</p>
                  </div>
                ) : (
                  buyingOrders.map((order: any) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-16 h-16 rounded flex items-center justify-center ${order.productType === "jasa" ? "bg-secondary-100 dark:bg-secondary-900/30" : "bg-slate-100 dark:bg-slate-800"}`}>
                            {order.productType === "jasa" ? <Briefcase className="h-8 w-8 text-secondary-600/50" /> : <Package className="h-8 w-8 text-muted-foreground/30" />}
                          </div>
                          <div>
                            <p className="font-medium">{order.product?.title || 'Produk Tidak Ditemukan'}</p>
                            <p className="text-sm text-muted-foreground">dari {order.seller?.name || 'Penjual'}</p>
                          </div>
                        </div>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg mb-3">
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between"><span className="text-muted-foreground">Harga:</span><span>{formatPrice(order.basePrice)}</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Ongkir:</span><span>{formatPrice(order.shippingFee)}</span></div>
                          <div className="flex justify-between font-bold border-t pt-1"><span>Total:</span><span className="text-primary">{formatPrice(order.totalPrice)}</span></div>
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
                            <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={() => handleAcceptPrice(order)}>
                              <Check className="h-4 w-4 mr-1" />Setuju & Bayar
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}
