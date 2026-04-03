"use client";

import { useState } from "react";
import type { ComponentType, SVGProps } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  ChevronRight,
  MessageCircle,
  ArrowLeft,
  Wallet,
  AlertCircle,
  Star,
  Briefcase,
  DollarSign,
  X,
  Check,
  Ban,
} from "lucide-react";
import { mockOrders } from "@/lib/mock-data";

type LucideIcon = ComponentType<SVGProps<SVGSVGElement>>;

interface OrdersListPageProps {
  onNavigate: (page: string, orderId?: string) => void;
}

// EmptyState defined outside the component
function EmptyState({ icon: Icon, message }: { icon: LucideIcon; message: string }) {
  return (
    <Card>
      <CardContent className="p-12 text-center">
        <Icon className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}

export default function OrdersListPage({ onNavigate }: OrdersListPageProps) {
  // Toggle view mode
  const [viewMode, setViewMode] = useState<"buyer" | "seller">("buyer");

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Updated status config with all statuses including service
  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: LucideIcon; color: string }> = {
      pending: { 
        label: "Menunggu Konfirmasi", 
        variant: "outline", 
        icon: Clock,
        color: "text-amber-600"
      },
      waiting_price: { 
        label: "Menunggu Harga", 
        variant: "outline", 
        icon: DollarSign,
        color: "text-orange-600"
      },
      waiting_confirmation: { 
        label: "Menunggu Konfirmasi", 
        variant: "outline", 
        icon: AlertCircle,
        color: "text-blue-600"
      },
      waiting_shipping_fee: { 
        label: "Menunggu Ongkir", 
        variant: "outline", 
        icon: Truck,
        color: "text-blue-600"
      },
      waiting_payment: { 
        label: "Menunggu Pembayaran", 
        variant: "outline", 
        icon: Wallet,
        color: "text-primary-600"
      },
      processing: { 
        label: "Diproses", 
        variant: "default", 
        icon: Package,
        color: "text-purple-600"
      },
      in_delivery: { 
        label: "Dalam Pengiriman", 
        variant: "default", 
        icon: Truck,
        color: "text-secondary-600"
      },
      ready_pickup: { 
        label: "Siap Diambil", 
        variant: "default", 
        icon: Package,
        color: "text-cyan-600"
      },
      completed: { 
        label: "Selesai", 
        variant: "default", 
        icon: CheckCircle2,
        color: "text-primary-600"
      },
      cancelled: { 
        label: "Dibatalkan", 
        variant: "destructive", 
        icon: Ban,
        color: "text-red-600"
      },
    };
    return configs[status] || configs.pending;
  };

  // Use all mock orders
  const orders = mockOrders;

  const renderOrderCard = (order: typeof mockOrders[0]) => {
    const statusConfig = getStatusConfig(order.status);
    const StatusIcon = statusConfig.icon;
    const isService = order.productType === "jasa";
    
    return (
      <Card
        key={order.id}
        className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => onNavigate("order-detail", order.id)}
      >
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className={`w-20 h-20 rounded-lg flex items-center justify-center shrink-0 ${isService ? "bg-secondary-100 dark:bg-secondary-900/30" : "bg-slate-100 dark:bg-slate-800"}`}>
              {isService ? (
                <Briefcase className="h-8 w-8 text-secondary-600/50" />
              ) : (
                <Package className="h-8 w-8 text-muted-foreground/30" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <p className="font-medium line-clamp-1">{order.productTitle}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.quantity}x {isService ? "jasa" : "barang"}
                  </p>
                </div>
                <Badge variant={statusConfig.variant}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusConfig.label}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 mt-2">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className={`text-[10px] ${isService ? "bg-secondary-100 text-secondary-700" : "bg-primary-100 text-primary-700"}`}>
                    {order.seller.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">
                  {viewMode === "buyer" 
                    ? `${isService ? "Penyedia" : "Penjual"}: ${order.seller.name}`
                    : `${isService ? "Pemesan" : "Pembeli"}: ${order.buyer.name}`
                  }
                </span>
              </div>

              <div className="flex items-center justify-between mt-3">
                <p className="font-bold text-primary-600">
                  {order.offeredPrice ? formatPrice(order.offeredPrice) : formatPrice(order.totalPrice)}
                </p>
                <div className="flex items-center gap-2">
                  {/* Buyer View Actions */}
                  {viewMode === "buyer" && (
                    <>
                      {order.status === "waiting_confirmation" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: Handle reject
                            }}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Tolak
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            className="bg-primary-600 hover:bg-primary-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: Handle accept
                            }}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Setuju
                          </Button>
                        </>
                      )}
                      {order.status === "waiting_payment" && (
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-primary-600 hover:bg-primary-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate("order-detail", order.id);
                          }}
                        >
                          <Wallet className="h-3 w-3 mr-1" />
                          Bayar
                        </Button>
                      )}
                      {order.status === "completed" && (
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-primary-600 hover:bg-primary-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate("rating", order.id);
                          }}
                        >
                          <Star className="h-3 w-3 mr-1" />
                          Beri Rating
                        </Button>
                      )}
                    </>
                  )}

                  {/* Seller View Actions */}
                  {viewMode === "seller" && (
                    <>
                      {order.status === "waiting_price" && (
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-amber-600 hover:bg-amber-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Open price dialog
                          }}
                        >
                          <DollarSign className="h-3 w-3 mr-1" />
                          Kirim Penawaran
                        </Button>
                      )}
                      {order.status === "waiting_shipping_fee" && (
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-amber-600 hover:bg-amber-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Open shipping dialog
                          }}
                        >
                          <Truck className="h-3 w-3 mr-1" />
                          Input Ongkir
                        </Button>
                      )}
                      {order.status === "processing" && (
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-primary-600 hover:bg-primary-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Confirm shipment
                          }}
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Konfirmasi
                        </Button>
                      )}
                    </>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate("chat");
                    }}
                  >
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Chat
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate("order-detail", order.id);
                    }}
                  >
                    Detail
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Filter orders based on view mode
  const buyerOrders = orders.filter(o => o.buyer.id === "1"); // Ahmad Santoso
  const sellerOrders = orders.filter(o => o.seller.id === "1"); // Ahmad Santoso as seller
  const displayedOrders = viewMode === "buyer" ? buyerOrders : sellerOrders;

  const filterOrders = (status: string) => {
    if (status === "all") return displayedOrders;
    if (status === "pending") {
      return displayedOrders.filter(
        (o) => ["pending", "waiting_price", "waiting_confirmation", "waiting_shipping_fee", "waiting_payment"].includes(o.status)
      );
    }
    if (status === "processing") {
      return displayedOrders.filter((o) => o.status === "processing" || o.status === "ready_pickup");
    }
    if (status === "shipping") {
      return displayedOrders.filter((o) => o.status === "in_delivery");
    }
    if (status === "completed") {
      return displayedOrders.filter((o) => o.status === "completed");
    }
    return [];
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => onNavigate("dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Pesanan Saya</h1>
              <p className="text-muted-foreground">Daftar semua transaksi</p>
            </div>
          </div>

          {/* Toggle View Mode */}
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant={viewMode === "buyer" ? "default" : "outline"}
              onClick={() => setViewMode("buyer")}
            >
              {viewMode === "buyer" ? "Pembeli" : "Lihat sebagai Pembeli"}
            </Button>
            <Button 
              size="sm" 
              variant={viewMode === "seller" ? "default" : "outline"}
              onClick={() => setViewMode("seller")}
            >
              {viewMode === "seller" ? "Penjual" : "Lihat sebagai Penjual"}
            </Button>
          </div>
        </div>

        {/* Status Legend */}
        <div className="flex flex-wrap gap-2 mb-6">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <DollarSign className="h-3 w-3 text-orange-600" />
            Menunggu Harga
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <AlertCircle className="h-3 w-3 text-blue-600" />
            Menunggu Konfirmasi
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Truck className="h-3 w-3 text-secondary-600" />
            Dalam Pengiriman
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <CheckCircle2 className="h-3 w-3 text-primary-600" />
            Selesai
          </div>
        </div>

        <Tabs defaultValue="all">
          <TabsList className="mb-6 flex-wrap h-auto">
            <TabsTrigger value="all">Semua</TabsTrigger>
            <TabsTrigger value="pending">
              Pending
              {filterOrders("pending").length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                  {filterOrders("pending").length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="processing">Diproses</TabsTrigger>
            <TabsTrigger value="shipping">Dikirim</TabsTrigger>
            <TabsTrigger value="completed">Selesai</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="space-y-4">
              {displayedOrders.map(renderOrderCard)}
              {displayedOrders.length === 0 && (
                <EmptyState icon={Package} message={`Belum ada pesanan sebagai ${viewMode === "buyer" ? "pembeli" : "penjual"}`} />
              )}
            </div>
          </TabsContent>

          <TabsContent value="pending">
            <div className="space-y-4">
              {filterOrders("pending").map(renderOrderCard)}
              {filterOrders("pending").length === 0 && (
                <EmptyState icon={Clock} message="Tidak ada pesanan pending" />
              )}
            </div>
          </TabsContent>

          <TabsContent value="processing">
            <div className="space-y-4">
              {filterOrders("processing").map(renderOrderCard)}
              {filterOrders("processing").length === 0 && (
                <EmptyState icon={Package} message="Tidak ada pesanan yang sedang diproses" />
              )}
            </div>
          </TabsContent>

          <TabsContent value="shipping">
            <div className="space-y-4">
              {filterOrders("shipping").map(renderOrderCard)}
              {filterOrders("shipping").length === 0 && (
                <EmptyState icon={Truck} message="Tidak ada pesanan dalam pengiriman" />
              )}
            </div>
          </TabsContent>

          <TabsContent value="completed">
            <div className="space-y-4">
              {filterOrders("completed").map(renderOrderCard)}
              {filterOrders("completed").length === 0 && (
                <EmptyState icon={CheckCircle2} message="Belum ada pesanan selesai" />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
