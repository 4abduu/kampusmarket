import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, CalendarDays, Search, Filter, ChevronDown, ChevronUp, X, Eye, Trash2 } from "lucide-react";

interface Props {
  filteredProducts: any[];
  paginatedProducts: any[];
  currentPage: number;
  showProductFilters: boolean;
  setShowProductFilters: (value: boolean) => void;
  productSearchTerm: string;
  setProductSearchTerm: (value: string) => void;
  productTypeFilter: string;
  setProductTypeFilter: (value: any) => void;
  productConditionFilter: string;
  setProductConditionFilter: (value: any) => void;
  productCategoryFilter: string;
  setProductCategoryFilter: (value: string) => void;
  productPriceMin: string;
  setProductPriceMin: (value: string) => void;
  productPriceMax: string;
  setProductPriceMax: (value: string) => void;
  productSellerFilter: string;
  setProductSellerFilter: (value: string) => void;
  productCategoryOptions: Array<{ id: string; name: string }>;
  setProductPage: (value: number) => void;
  getTotalPages: (value: number) => number;
  renderPagination: (currentPage: number, totalPages: number, setPage: (page: number) => void) => any;
  formatProductPrice: (product: any) => string;
  handleViewProduct: (product: any) => void;
  handleDeleteProduct: (product: any) => void;
}

export default function AdminProductsTab(props: Props) {
  const {
    filteredProducts,
    paginatedProducts,
    showProductFilters,
    setShowProductFilters,
    productSearchTerm,
    setProductSearchTerm,
    productTypeFilter,
    setProductTypeFilter,
    productConditionFilter,
    setProductConditionFilter,
    productCategoryFilter,
    setProductCategoryFilter,
    productPriceMin,
    setProductPriceMin,
    productPriceMax,
    setProductPriceMax,
    productSellerFilter,
    setProductSellerFilter,
    productCategoryOptions,
    currentPage,
    setProductPage,
    getTotalPages,
    renderPagination,
    formatProductPrice,
    handleViewProduct,
    handleDeleteProduct,
  } = props;

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Manajemen Produk</CardTitle>
              <CardDescription>Daftar semua produk dan jasa di platform</CardDescription>
            </div>
            <div className="text-sm text-muted-foreground">{filteredProducts.length} produk</div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Cari produk, deskripsi, penjual..." value={productSearchTerm} onChange={(e) => { setProductSearchTerm(e.target.value); setProductPage(1); }} className="pl-9" />
            </div>
            <Select value={productTypeFilter} onValueChange={(value) => { setProductTypeFilter(value); setProductPage(1); }}>
              <SelectTrigger className="w-[100px]"><SelectValue placeholder="Tipe" /></SelectTrigger>
              <SelectContent><SelectItem value="all">Semua</SelectItem><SelectItem value="barang">Barang</SelectItem><SelectItem value="jasa">Jasa</SelectItem></SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => setShowProductFilters(!showProductFilters)} className="gap-1"><Filter className="h-4 w-4" />Filter{showProductFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</Button>
            {(productTypeFilter !== "all" || productConditionFilter !== "all" || productCategoryFilter !== "all") && <Button variant="ghost" size="sm" onClick={() => { setProductSearchTerm(""); setProductTypeFilter("all"); setProductConditionFilter("all"); setProductCategoryFilter("all"); setProductPriceMin(""); setProductPriceMax(""); setProductSellerFilter(""); setProductPage(1); }} className="text-xs text-muted-foreground"><X className="h-3 w-3 mr-1" />Reset</Button>}
          </div>
          {showProductFilters && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              {(productTypeFilter === "all" || productTypeFilter === "barang") && (<Select value={productConditionFilter} onValueChange={(value) => { setProductConditionFilter(value); setProductPage(1); }}><SelectTrigger className="w-[120px]"><SelectValue placeholder="Kondisi" /></SelectTrigger><SelectContent><SelectItem value="all">Semua Kondisi</SelectItem><SelectItem value="baru">Baru</SelectItem><SelectItem value="bekas">Bekas</SelectItem></SelectContent></Select>)}
              <Select value={productCategoryFilter} onValueChange={(value) => { setProductCategoryFilter(value); setProductPage(1); }}><SelectTrigger className="w-[150px]"><SelectValue placeholder="Kategori" /></SelectTrigger><SelectContent><SelectItem value="all">Semua Kategori</SelectItem>{productCategoryOptions.map((category) => <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>)}</SelectContent></Select>
              <Input type="number" min="0" placeholder="Harga min" value={productPriceMin} onChange={(e) => setProductPriceMin(e.target.value)} className="w-[120px]" />
              <Input type="number" min="0" placeholder="Harga max" value={productPriceMax} onChange={(e) => setProductPriceMax(e.target.value)} className="w-[120px]" />
              <Input type="search" placeholder="Cari penjual..." value={productSellerFilter} onChange={(e) => setProductSellerFilter(e.target.value)} className="w-[180px]" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {filteredProducts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground"><Package className="h-12 w-12 mx-auto mb-4 opacity-30" /><p>Tidak ada produk ditemukan dengan filter tersebut</p></div>
        ) : (
          <>
            <Table>
              <TableHeader><TableRow><TableHead>Produk</TableHead><TableHead>Tipe</TableHead><TableHead>Harga</TableHead><TableHead>Penjual</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
              <TableBody>
                {paginatedProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell><div className="flex items-center gap-2"><div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center">{product.type === "jasa" ? <CalendarDays className="h-5 w-5 text-muted-foreground" /> : <Package className="h-5 w-5 text-muted-foreground" />}</div><div><p className="font-medium text-sm line-clamp-1">{product.title}</p><p className="text-xs text-muted-foreground">{product.category}</p></div></div></TableCell>
                    <TableCell><Badge variant={product.type === "jasa" ? "secondary" : "outline"} className={product.type === "jasa" ? "bg-purple-50 text-purple-700 border-purple-200" : ""}>{product.type === "jasa" ? "Jasa" : "Barang"}</Badge></TableCell>
                    <TableCell className="font-medium text-primary-600">{formatProductPrice(product)}</TableCell>
                    <TableCell className="text-sm">{product.seller.name}</TableCell>
                    <TableCell><Badge variant={product.status === "active" ? "default" : "secondary"} className={product.status === "active" ? "bg-primary-500" : ""}>{product.status === "active" ? "Aktif" : "Nonaktif"}</Badge></TableCell>
                    <TableCell className="text-right"><div className="flex items-center justify-end gap-1"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewProduct(product)}><Eye className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDeleteProduct(product)}><Trash2 className="h-4 w-4" /></Button></div></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {renderPagination(currentPage, getTotalPages(filteredProducts.length), setProductPage)}
          </>
        )}
      </CardContent>
    </Card>
  );
}
