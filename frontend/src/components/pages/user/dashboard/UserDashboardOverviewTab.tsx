import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, ChevronRight, DollarSign, MessageCircle, Package, Plus, Star, Wallet } from "lucide-react"
import type { Product } from "@/lib/mock-data"

type Stats = {
  totalSales: number
  activeProducts: number
  activeServices: number
  rating: number
  netIncome: number
  adminFeeDeducted: number
}

type Props = {
  onNavigate: (page: string, productId?: string) => void
  currentWalletBalance: number
  formatPrice: (price: number) => string
  stats: Stats
  userProducts: Product[]
  formatPriceRange: (product: Product) => string
  setShowWithdrawDialog: (open: boolean) => void
  setActiveTab: (tab: string) => void
  adminFeePercentage: number
}

export default function UserDashboardOverviewTab({
  onNavigate,
  currentWalletBalance,
  formatPrice,
  stats,
  userProducts,
  formatPriceRange,
  setShowWithdrawDialog,
  setActiveTab,
  adminFeePercentage,
}: Props) {
  return (
    <>
      <Card className="bg-gradient-to-br from-primary-600 to-primary-700 text-white cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate("wallet")}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100 text-sm">Saldo Dompet</p>
              <p className="text-3xl font-bold mt-1">{formatPrice(currentWalletBalance)}</p>
              <p className="text-primary-200 text-sm mt-2">Klik untuk kelola dompet →</p>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
              <Wallet className="h-7 w-7" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Penjualan", value: formatPrice(stats.totalSales), icon: DollarSign, color: "text-blue-600", bg: "bg-blue-100" },
          { title: "Produk Aktif", value: stats.activeProducts.toString(), icon: Package, color: "text-purple-600", bg: "bg-purple-100" },
          { title: "Jasa Aktif", value: stats.activeServices.toString(), icon: Briefcase, color: "text-secondary-600", bg: "bg-secondary-100" },
          { title: "Rating", value: stats.rating.toFixed(1), icon: Star, color: "text-yellow-600", bg: "bg-yellow-100" },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{stat.title}</span>
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 border-primary-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-primary-700 mb-2">
                <DollarSign className="h-5 w-5" />
                <span className="font-medium">Pendapatan Bersih</span>
              </div>
              <p className="text-3xl font-bold text-primary-600">{formatPrice(stats.netIncome)}</p>
              <p className="text-sm text-primary-600/70 mt-1">Setelah potongan biaya admin {adminFeePercentage * 100}%</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Biaya Admin</p>
              <p className="text-lg font-semibold text-slate-600">-{formatPrice(stats.adminFeeDeducted)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Aksi Cepat</CardTitle></CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4">
            <Button className="bg-primary-600 hover:bg-primary-700" onClick={() => onNavigate("add-product")}>
              <Plus className="h-4 w-4 mr-2" />Tambah Produk
            </Button>
            <Button variant="outline" onClick={() => setShowWithdrawDialog(true)}>
              <Wallet className="h-4 w-4 mr-2" />Tarik Dana
            </Button>
            <Button variant="outline" onClick={() => onNavigate("chat")}>
              <MessageCircle className="h-4 w-4 mr-2" />Pesan (2)
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Produk & Jasa Terbaru</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setActiveTab("products")}>Lihat Semua<ChevronRight className="h-4 w-4" /></Button>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4">
            {userProducts.slice(0, 3).map((product) => (
              <div key={product.id} className="border rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-colors" onClick={() => onNavigate("product", product.id)}>
                <div className={`${product.type === "jasa" ? "bg-gradient-to-br from-secondary-100 to-primary-100 dark:from-secondary-900/30 dark:to-primary-900/30" : "bg-slate-100 dark:bg-slate-800"} h-32 flex items-center justify-center`}>
                  {product.type === "jasa" ? <Briefcase className="h-10 w-10 text-secondary-600/50" /> : <Package className="h-10 w-10 text-muted-foreground/30" />}
                </div>
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={product.type === "jasa" ? "default" : "secondary"} className="text-xs">
                      {product.type === "jasa" ? "Jasa" : "Barang"}
                    </Badge>
                  </div>
                  <p className="font-medium text-sm line-clamp-1">{product.title}</p>
                  <p className="text-primary-600 font-bold text-sm">{formatPriceRange(product)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
