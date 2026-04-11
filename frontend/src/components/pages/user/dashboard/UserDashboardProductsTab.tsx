import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Briefcase, Clock3, Edit, Eye, Package, Plus, Trash2 } from "lucide-react"
import type { Product } from "@/lib/mock-data"

type Props = {
  onNavigate: (page: string, productId?: string) => void
  productFilter: "semua" | "barang" | "jasa"
  setProductFilter: (filter: "semua" | "barang" | "jasa") => void
  userProducts: Product[]
  filteredProducts: Product[]
  formatPriceRange: (product: Product) => string
  formatPrice: (price: number) => string
  handleEditProduct: (product: Product) => void
  setProductToDelete: (id: string | null) => void
  setShowDeleteProductDialog: (open: boolean) => void
}

export default function UserDashboardProductsTab({
  onNavigate,
  productFilter,
  setProductFilter,
  userProducts,
  filteredProducts,
  formatPriceRange,
  formatPrice,
  handleEditProduct,
  setProductToDelete,
  setShowDeleteProductDialog,
}: Props) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Produk & Jasa Saya</CardTitle>
          <CardDescription>Kelola semua produk dan jasa yang kamu tawarkan</CardDescription>
        </div>
        <Button className="bg-primary-600 hover:bg-primary-700" onClick={() => onNavigate("add-product")}>
          <Plus className="h-4 w-4 mr-2" />Tambah
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs value={productFilter} onValueChange={(v) => setProductFilter(v as "semua" | "barang" | "jasa")} className="mb-4">
          <TabsList>
            <TabsTrigger value="semua">Semua ({userProducts.length})</TabsTrigger>
            <TabsTrigger value="barang">Barang ({userProducts.filter(p => p.type === "barang").length})</TabsTrigger>
            <TabsTrigger value="jasa">Jasa ({userProducts.filter(p => p.type === "jasa").length})</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produk/Jasa</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead>{productFilter === "jasa" ? "Pengerjaan" : "Stok"}</TableHead>
                <TableHead>Terjual</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {productFilter === "jasa" ? "Belum ada jasa" : productFilter === "barang" ? "Belum ada produk" : "Belum ada produk atau jasa"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded flex items-center justify-center ${product.type === "jasa" ? "bg-secondary-100 dark:bg-secondary-900/30" : "bg-slate-100 dark:bg-slate-800"}`}>
                          {product.type === "jasa" ? <Briefcase className="h-6 w-6 text-secondary-600" /> : <Package className="h-6 w-6 text-muted-foreground/30" />}
                        </div>
                        <div>
                          <p className="font-medium line-clamp-1">{product.title}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant={product.type === "jasa" ? "default" : "outline"} className="text-xs">
                              {product.type === "jasa" ? "Jasa" : "Barang"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{product.category}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{formatPriceRange(product)}</p>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <p className="text-xs text-muted-foreground line-through">{formatPrice(product.originalPrice)}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      {product.type === "jasa" ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Clock3 className="h-3 w-3" />
                          {product.durationIsPlus && product.durationMin
                            ? `${product.durationMin} ${product.durationUnit || "hari"}+`
                            : product.durationMin && product.durationMax
                            ? `${product.durationMin}-${product.durationMax} ${product.durationUnit || "jam"}`
                            : product.durationMin
                            ? `${product.durationMin} ${product.durationUnit || "jam"}`
                            : "-"}
                        </div>
                      ) : (
                        <span className={product.stock > 0 ? "" : "text-red-500"}>{product.stock}</span>
                      )}
                    </TableCell>
                    <TableCell>{product.soldCount}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant={product.status === "active" && (product.type === "jasa" || product.stock > 0) ? "default" : "secondary"}>
                          {product.status === "active" && (product.type === "jasa" || product.stock > 0) ? "Aktif" : "Nonaktif"}
                        </Badge>
                        {product.type === "jasa" && product.availabilityStatus && product.availabilityStatus !== "available" && (
                          <Badge variant={product.availabilityStatus === "full" ? "destructive" : "secondary"} className="text-xs">
                            {product.availabilityStatus === "full" ? "🔴 Penuh" : "⚠️ Sibuk"}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => onNavigate("product", product.id)}>
                          <Eye className="h-4 w-4 mr-1" />Lihat
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditProduct(product)}>
                          <Edit className="h-4 w-4 mr-1" />Edit
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={() => { setProductToDelete(product.id); setShowDeleteProductDialog(true) }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
