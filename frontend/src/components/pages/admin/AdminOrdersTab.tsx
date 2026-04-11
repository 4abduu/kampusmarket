import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarDays, Package, ShoppingCart, Search, Filter, ChevronDown, ChevronUp, X } from "lucide-react";

interface Props {
  filteredOrders: any[];
  paginatedOrders: any[];
  currentPage: number;
  orderSearchTerm: string;
  setOrderSearchTerm: (value: string) => void;
  orderStatusFilter: string;
  setOrderStatusFilter: (value: any) => void;
  orderTypeFilter: string;
  setOrderTypeFilter: (value: any) => void;
  orderCategoryFilter: string;
  setOrderCategoryFilter: (value: string) => void;
  orderPaymentFilter: string;
  setOrderPaymentFilter: (value: any) => void;
  showOrderFilters: boolean;
  setShowOrderFilters: (value: boolean) => void;
  setOrderPage: (value: number) => void;
  getTotalPages: (value: number) => number;
  renderPagination: (currentPage: number, totalPages: number, setPage: (page: number) => void) => any;
  getInitials: (value?: string | null) => string;
  formatPrice: (value: number) => string;
  getOrderStatusBadge: (status: string) => React.ReactNode;
  getPaymentStatusBadge: (status: string) => React.ReactNode;
}

export default function AdminOrdersTab({ filteredOrders, paginatedOrders, currentPage, orderSearchTerm, setOrderSearchTerm, orderStatusFilter, setOrderStatusFilter, orderTypeFilter, setOrderTypeFilter, orderCategoryFilter, setOrderCategoryFilter, orderPaymentFilter, setOrderPaymentFilter, showOrderFilters, setShowOrderFilters, setOrderPage, getTotalPages, renderPagination, getInitials, formatPrice, getOrderStatusBadge, getPaymentStatusBadge }: Props) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><CardTitle>Manajemen Transaksi</CardTitle><CardDescription>Daftar semua transaksi dan pesanan</CardDescription></div><div className="text-sm text-muted-foreground">{filteredOrders.length} transaksi</div></div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px] max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input type="search" placeholder="Cari nomor order, produk, pembeli..." value={orderSearchTerm} onChange={(e) => { setOrderSearchTerm(e.target.value); setOrderPage(1); }} className="pl-9" /></div>
            <Select value={orderTypeFilter} onValueChange={(value) => { setOrderTypeFilter(value); setOrderCategoryFilter("all"); setOrderStatusFilter("all"); setOrderPage(1); }}><SelectTrigger className="w-[120px]"><SelectValue placeholder="Tipe" /></SelectTrigger><SelectContent><SelectItem value="all">Semua Tipe</SelectItem><SelectItem value="barang">Barang</SelectItem><SelectItem value="jasa">Jasa</SelectItem></SelectContent></Select>
            <Button variant="outline" size="sm" onClick={() => setShowOrderFilters(!showOrderFilters)} className="gap-1"><Filter className="h-4 w-4" />Filter{showOrderFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</Button>
            {(orderStatusFilter !== "all" || orderTypeFilter !== "all" || orderCategoryFilter !== "all" || orderPaymentFilter !== "all" || orderSearchTerm) && <Button variant="ghost" size="sm" onClick={() => { setOrderSearchTerm(""); setOrderStatusFilter("all"); setOrderTypeFilter("all"); setOrderCategoryFilter("all"); setOrderPaymentFilter("all"); setOrderPage(1); }} className="text-xs text-muted-foreground"><X className="h-3 w-3 mr-1" />Reset</Button>}
          </div>
          {showOrderFilters && <div className="flex flex-wrap gap-2 pt-2 border-t"><Select value={orderStatusFilter} onValueChange={(value) => { setOrderStatusFilter(value); setOrderPage(1); }}><SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">Semua Status</SelectItem><SelectItem value="pending">Menunggu</SelectItem><SelectItem value="processing">Diproses</SelectItem><SelectItem value="ready_pickup">Siap Ambil</SelectItem><SelectItem value="in_delivery">Dalam Pengiriman</SelectItem><SelectItem value="completed">Selesai</SelectItem><SelectItem value="cancelled">Dibatalkan</SelectItem></SelectContent></Select><Select value={orderPaymentFilter} onValueChange={(value) => { setOrderPaymentFilter(value); setOrderPage(1); }}><SelectTrigger className="w-[130px]"><SelectValue placeholder="Pembayaran" /></SelectTrigger><SelectContent><SelectItem value="all">Semua</SelectItem><SelectItem value="pending">Menunggu</SelectItem><SelectItem value="paid">Dibayar</SelectItem><SelectItem value="failed">Gagal</SelectItem><SelectItem value="refunded">Dikembalikan</SelectItem></SelectContent></Select></div>}
        </div>
      </CardHeader>
      <CardContent>
        {filteredOrders.length === 0 ? (<div className="text-center py-8 text-muted-foreground"><ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-30" /><p>Tidak ada transaksi ditemukan</p></div>) : (<><Table><TableHeader><TableRow><TableHead>Order</TableHead><TableHead>Produk</TableHead><TableHead>Kategori</TableHead><TableHead>Pembeli</TableHead><TableHead>Penjual</TableHead><TableHead>Total</TableHead><TableHead>Status</TableHead><TableHead>Pembayaran</TableHead><TableHead>Tanggal</TableHead></TableRow></TableHeader><TableBody>{paginatedOrders.map((order) => (<TableRow key={order.id}><TableCell><div><p className="font-medium text-sm">{order.orderNumber}</p><p className="text-xs text-muted-foreground">{order.quantity} item</p></div></TableCell><TableCell><div className="flex items-center gap-2"><div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center">{order.productType === "jasa" ? <CalendarDays className="h-4 w-4 text-muted-foreground" /> : <Package className="h-4 w-4 text-muted-foreground" />}</div><div><p className="font-medium text-sm max-w-[150px] truncate">{order.productTitle}</p><Badge variant={order.productType === "jasa" ? "secondary" : "outline"} className="text-xs">{order.productType === "jasa" ? "Jasa" : "Barang"}</Badge></div></div></TableCell><TableCell><Badge variant="secondary" className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">{order.product?.category || "-"}</Badge></TableCell><TableCell><div className="flex items-center gap-2"><Avatar className="h-7 w-7"><AvatarFallback className="bg-blue-100 text-blue-700 text-xs">{getInitials(order.buyer?.name)}</AvatarFallback></Avatar><span className="text-sm">{order.buyer?.name || "-"}</span></div></TableCell><TableCell><div className="flex items-center gap-2"><Avatar className="h-7 w-7"><AvatarFallback className="bg-primary-100 text-primary-700 text-xs">{getInitials(order.seller?.name)}</AvatarFallback></Avatar><span className="text-sm">{order.seller?.name || "-"}</span></div></TableCell><TableCell><p className="font-bold text-primary-600">{formatPrice(order.totalPrice)}</p>{order.shippingFee > 0 && <p className="text-xs text-muted-foreground">+ {formatPrice(order.shippingFee)} ongkir</p>}</TableCell><TableCell>{getOrderStatusBadge(order.status)}</TableCell><TableCell>{getPaymentStatusBadge(order.paymentStatus)}</TableCell><TableCell className="text-sm">{order.createdAt ? new Date(order.createdAt).toLocaleDateString("id-ID") : "-"}</TableCell></TableRow>))}</TableBody></Table>{renderPagination(currentPage, getTotalPages(filteredOrders.length), setOrderPage)}</>) }
      </CardContent>
    </Card>
  );
}
