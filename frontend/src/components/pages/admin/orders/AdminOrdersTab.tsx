import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, Package, ShoppingCart, Search, Filter, ChevronDown, ChevronUp, X } from "lucide-react";
import { formatAdminDate } from "../admin-dashboard.shared";

interface Props {
  orders: any[];
  currentPage: number;
  totalOrders: number;
  totalPages: number;
  isLoading: boolean;
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
  renderPagination: (currentPage: number, totalPages: number, setPage: (page: number) => void) => any;
  getInitials: (value?: string | null) => string;
  formatPrice: (value: number) => string;
  getOrderStatusBadge: (status: string) => React.ReactNode;
  getPaymentStatusBadge: (status: string) => React.ReactNode;
  handleViewUser?: (user: any) => void;
  handleViewProduct?: (product: any) => void;
}

export default function AdminOrdersTab({
  orders,
  currentPage,
  totalOrders,
  totalPages,
  isLoading,
  orderSearchTerm,
  setOrderSearchTerm,
  orderStatusFilter,
  setOrderStatusFilter,
  orderTypeFilter,
  setOrderTypeFilter,
  orderCategoryFilter,
  setOrderCategoryFilter,
  orderPaymentFilter,
  setOrderPaymentFilter,
  showOrderFilters,
  setShowOrderFilters,
  setOrderPage,
  renderPagination,
  getInitials,
  formatPrice,
  getOrderStatusBadge,
  getPaymentStatusBadge,
  handleViewUser,
  handleViewProduct
}: Props) {
  return (
    <Card className="border-slate-100 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold">Manajemen Transaksi</CardTitle>
              <CardDescription className="text-xs">Daftar semua transaksi dan pesanan di dalam ekosistem KampusMarket.</CardDescription>
            </div>
            <div className="text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full">
              {totalOrders} transaksi
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Cari nomor order, nama produk, pembeli..." 
                value={orderSearchTerm} 
                onChange={(e) => { setOrderSearchTerm(e.target.value); setOrderPage(1); }} 
                className="pl-9 text-xs" 
              />
            </div>
            
            <Select 
              value={orderTypeFilter} 
              onValueChange={(value) => { setOrderTypeFilter(value); setOrderCategoryFilter("all"); setOrderStatusFilter("all"); setOrderPage(1); }}
            >
              <SelectTrigger className="w-[120px] text-xs h-9">
                <SelectValue placeholder="Tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tipe</SelectItem>
                <SelectItem value="barang">Barang</SelectItem>
                <SelectItem value="jasa">Jasa</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowOrderFilters(!showOrderFilters)} 
              className="gap-1 text-xs h-9"
            >
              <Filter className="h-4 w-4" />
              Filter
              {showOrderFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            
            {(orderStatusFilter !== "all" || orderTypeFilter !== "all" || orderCategoryFilter !== "all" || orderPaymentFilter !== "all" || orderSearchTerm) && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => { setOrderSearchTerm(""); setOrderStatusFilter("all"); setOrderTypeFilter("all"); setOrderCategoryFilter("all"); setOrderPaymentFilter("all"); setOrderPage(1); }} 
                className="text-xs text-muted-foreground hover:text-slate-800"
              >
                <X className="h-3 w-3 mr-1" />
                Reset Filter
              </Button>
            )}
          </div>
          
          {showOrderFilters && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
              <Select 
                value={orderStatusFilter} 
                onValueChange={(value) => { setOrderStatusFilter(value); setOrderPage(1); }}
              >
                <SelectTrigger className="w-[140px] text-xs h-8">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="pending">Menunggu</SelectItem>
                  <SelectItem value="processing">Diproses</SelectItem>
                  <SelectItem value="ready_pickup">Siap Ambil</SelectItem>
                  <SelectItem value="in_delivery">Dalam Pengiriman</SelectItem>
                  <SelectItem value="completed">Selesai</SelectItem>
                  <SelectItem value="cancelled">Dibatalkan</SelectItem>
                </SelectContent>
              </Select>
              
              <Select 
                value={orderPaymentFilter} 
                onValueChange={(value) => { setOrderPaymentFilter(value); setOrderPage(1); }}
              >
                <SelectTrigger className="w-[130px] text-xs h-8">
                  <SelectValue placeholder="Pembayaran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Pembayaran</SelectItem>
                  <SelectItem value="pending">Menunggu</SelectItem>
                  <SelectItem value="paid">Dibayar</SelectItem>
                  <SelectItem value="failed">Gagal</SelectItem>
                  <SelectItem value="refunded">Dikembalikan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="space-y-3 py-6">
            <div className="flex justify-between items-center pb-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/12" />
            </div>
            <div className="overflow-x-auto">
              <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[10%]">Order</TableHead>
                  <TableHead className="w-[25%]">Produk</TableHead>
                  <TableHead className="w-[10%]">Kategori</TableHead>
                  <TableHead className="w-[15%]">Pembeli</TableHead>
                  <TableHead className="w-[15%]">Penjual</TableHead>
                  <TableHead className="w-[10%]">Total</TableHead>
                  <TableHead className="w-[10%]">Status</TableHead>
                  <TableHead className="w-[5%]">Tanggal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, idx) => (
                  <TableRow key={idx}>
                    {[...Array(8)].map((_, cellIdx) => (
                      <TableCell key={cellIdx}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
              </Table>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground flex flex-col items-center justify-center">
            <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium">Tidak ada transaksi ditemukan</p>
            <p className="text-xs text-muted-foreground mt-0.5">Silakan ganti kata kunci pencarian atau status filter Anda.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border border-slate-100 dark:border-slate-800">
              <Table className="min-w-[1000px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Produk</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Pembeli</TableHead>
                    <TableHead>Penjual</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Pembayaran</TableHead>
                    <TableHead>Tanggal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                      {/* Order Number */}
                      <TableCell>
                        <div>
                          <p className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {order.orderNumber}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{order.quantity} item</p>
                        </div>
                      </TableCell>

                      {/* Clickable Product Detail */}
                      <TableCell>
                        <div 
                          className="flex items-center gap-2 cursor-pointer group"
                          onClick={() => order.product && handleViewProduct?.(order.product)}
                        >
                          <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center group-hover:scale-105 transition-transform">
                            {order.productType === "jasa" ? (
                              <CalendarDays className="h-4 w-4 text-slate-500" />
                            ) : (
                              <Package className="h-4 w-4 text-slate-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-xs text-slate-700 dark:text-slate-200 max-w-[150px] truncate group-hover:underline text-primary-600">
                              {order.productTitle}
                            </p>
                            <Badge 
                              variant={order.productType === "jasa" ? "secondary" : "outline"} 
                              className={`text-[10px] py-0 px-1.5 mt-0.5 ${
                                order.productType === "jasa" 
                                  ? "bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-300 border-none" 
                                  : "border-slate-200"
                              }`}
                            >
                              {order.productType === "jasa" ? "Jasa" : "Barang"}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>

                      {/* Category */}
                      <TableCell>
                        <Badge 
                          variant="secondary" 
                          className="text-[10px] py-0.5 px-2 bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-100 dark:border-slate-700/50"
                        >
                          {order.product?.category || order.category || "-"}
                        </Badge>
                      </TableCell>

                      {/* Clickable Buyer */}
                      <TableCell>
                        <div 
                          className="flex items-center gap-2 cursor-pointer group"
                          onClick={() => order.buyer && handleViewUser?.(order.buyer)}
                        >
                          <Avatar className="h-7 w-7 ring-2 ring-transparent group-hover:ring-primary-200 transition-shadow">
                            {order.buyer?.avatar && <AvatarImage src={order.buyer.avatar} alt={order.buyer.name} className="object-cover" />}
                            <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-semibold">
                              {getInitials(order.buyer?.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300 group-hover:underline group-hover:text-primary-600 max-w-[100px] truncate">
                            {order.buyer?.name || "-"}
                          </span>
                        </div>
                      </TableCell>

                      {/* Clickable Seller */}
                      <TableCell>
                        <div 
                          className="flex items-center gap-2 cursor-pointer group"
                          onClick={() => order.seller && handleViewUser?.(order.seller)}
                        >
                          <Avatar className="h-7 w-7 ring-2 ring-transparent group-hover:ring-primary-200 transition-shadow">
                            {order.seller?.avatar && <AvatarImage src={order.seller.avatar} alt={order.seller.name} className="object-cover" />}
                            <AvatarFallback className="bg-primary-100 text-primary-700 text-xs font-semibold">
                              {getInitials(order.seller?.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300 group-hover:underline group-hover:text-primary-600 max-w-[100px] truncate">
                            {order.seller?.name || "-"}
                          </span>
                        </div>
                      </TableCell>

                      {/* Price Metadata */}
                      <TableCell>
                        <p className="font-bold text-xs text-primary-600">{formatPrice(order.totalPrice)}</p>
                        {order.shippingFee > 0 && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            + {formatPrice(order.shippingFee)} ongkir
                          </p>
                        )}
                      </TableCell>

                      {/* Badges */}
                      <TableCell>{getOrderStatusBadge(order.status)}</TableCell>
                      <TableCell>
                        {getPaymentStatusBadge(
                          order.status === 'cancelled' && (!order.paymentStatus || order.paymentStatus === 'pending') 
                            ? 'cancelled' 
                            : order.status === 'completed' && (!order.paymentStatus || order.paymentStatus === 'pending')
                            ? 'paid'
                            : order.paymentStatus || 'pending'
                        )}
                      </TableCell>
                      
                      {/* Date */}
                      <TableCell className="text-xs text-slate-500">
                        {formatAdminDate(order.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {renderPagination(currentPage, totalPages, setOrderPage)}
          </>
        )}
      </CardContent>
    </Card>
  );
}
