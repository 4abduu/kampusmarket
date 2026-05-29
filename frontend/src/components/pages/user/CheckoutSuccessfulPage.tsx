"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Package,
  MapPin,
  CreditCard,
  ShoppingBag,
  Home,
  MessageCircle,
  Clock,
  Phone,
  ChevronRight,
  Calendar,
  Briefcase,
  Monitor,
} from "lucide-react";
import { openWhatsApp } from "@/lib/whatsapp";
import { getOrderDetail, type Order } from "@/lib/api/orders";
import { PaymentSuccessPageSkeleton } from "@/components/skeleton";
import type { NavigationData } from "@/app/navigation/types";

interface CheckoutSuccessfulPageProps {
  onNavigate: (page: string, data?: string | NavigationData) => void;
  orderId?: string;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price || 0);

const normalizeServiceMethod = (method: string): "pickup" | "cod" | "online" => {
  switch (method.toLowerCase()) {
    case "onsite":
    case "pickup":
      return "pickup";
    case "home_service":
    case "cod":
      return "cod";
    default:
      return "online";
  }
};

const getServiceMethodLabel = (method: string) => {
  switch (method) {
    case "pickup":
      return { label: "Datang ke Lokasi", icon: Home, color: "bg-blue-100 text-blue-700" };
    case "cod":
      return { label: "Jasa Datang ke Lokasi", icon: MapPin, color: "bg-amber-100 text-amber-700" };
    case "online":
      return { label: "Online/Remote", icon: Monitor, color: "bg-purple-100 text-purple-700" };
    default:
      return { label: "Sesuai Kesepakatan", icon: Calendar, color: "bg-slate-100 text-slate-700" };
  }
};

// Extract order data - unified for both product and service
function extractOrderData(order: Order) {
  const isService = order.productType === "jasa";
  const createdAt = (order as any)?.createdAt || (order as any)?.created_at;
  const serviceMethodRaw = String(
    (order as any)?.shippingType || (order as any)?.shipping_type || "online"
  );
  const serviceMethodKey = normalizeServiceMethod(serviceMethodRaw);

  // Product data
  const productTitle =
    (order as any)?.product?.title ||
    (order as any)?.productTitle ||
    (order as any)?.product_title ||
    "Produk";
  
  // Seller/Provider data
  const sellerName =
    (order as any)?.seller?.name ||
    (order as any)?.product?.seller?.name ||
    "Tidak diketahui";

  return {
    id: (order as any)?.uuid || (order as any)?.id || "",
    orderId:
      (order as any)?.orderNumber || (order as any)?.order_number || "-",
    orderDate: createdAt
      ? new Date(createdAt).toLocaleDateString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-",
    isService,
    product: {
      id: order.product?.id || order.product?.uuid || "",
      title: productTitle,
      price: Number(
        (order as any)?.finalPrice || (order as any)?.final_price || 0
      ),
      quantity: Number((order as any)?.quantity || 1),
      seller: {
        name: sellerName,
        phone: (order as any)?.seller?.phone || "-",
        rating: isService ? Number((order as any)?.seller?.rating || 0) : undefined,
        totalOrders: isService ? Number((order as any)?.seller?.soldCount || 0) : undefined,
      },
    },
    shippingMethod: String(
      (order as any)?.shippingType ||
        (order as any)?.shipping_type ||
        "cod"
    ).toUpperCase(),
    paymentMethod: String(
      (order as any)?.paymentMethod ||
        (order as any)?.payment_method ||
        ""
    ).toUpperCase(),
    shippingAddress:
      (order as any)?.shippingAddress ||
      (order as any)?.shipping_address ||
      "-",
    subtotal: Number(
      (order as any)?.finalPrice || (order as any)?.final_price || 0
    ),
    shippingFee: Number(
      (order as any)?.shippingFee || (order as any)?.shipping_fee || 0
    ),
    total: Number(
      (order as any)?.totalPrice || (order as any)?.total_price || 0
    ),
    status: String((order as any)?.status || "pending"),
    serviceMethod: serviceMethodKey,
    schedule: isService ? {
      startDate: (order as any)?.serviceDate || "Sesuai kesepakatan",
      deadline: (order as any)?.serviceDeadline || "",
      time: (order as any)?.serviceTime || "",
    } : undefined,
    serviceNotes: isService ? ((order as any)?.serviceNotes || (order as any)?.service_notes || "") : undefined,
  };
}

export default function CheckoutSuccessfulPage({
  onNavigate,
  orderId,
}: CheckoutSuccessfulPageProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);

        // Try reading multi-order IDs from localStorage first
        const storedIds = localStorage.getItem("recentCheckoutOrderIds");
        let orderIds: string[] = [];

        if (storedIds) {
          try {
            orderIds = JSON.parse(storedIds);
          } catch {
            console.error("[CheckoutSuccessfulPage] Failed to parse recentCheckoutOrderIds");
          }
        }

        // Fallback to single orderId prop
        if (orderIds.length === 0 && orderId) {
          orderIds = [orderId];
        }

        if (orderIds.length === 0) {
          setLoading(false);
          return;
        }

        // Fetch all orders in parallel
        const results = await Promise.all(
          orderIds.map((id) =>
            getOrderDetail(id).catch((err) => {
              console.error(`[CheckoutSuccessfulPage] Failed to fetch order ${id}`, err);
              return null;
            })
          )
        );

        const validOrders = results.filter(Boolean) as Order[];
        setOrders(validOrders);

        // We DON'T clear localStorage here so page refresh works.
        // It will be overwritten next time a new checkout happens.
      } catch (error) {
        console.error("[CheckoutSuccessfulPage] Failed to load orders", error);
      } finally {
        setLoading(false);
      }
    };

    void loadOrders();
  }, [orderId]);

  const isMultiOrder = orders.length > 1;
  const orderDataList = useMemo(
    () => orders.map(extractOrderData),
    [orders]
  );
  const firstOrderData = orderDataList[0];

  const getNextSteps = () => {
    const data = firstOrderData;
    if (!data) return [];
    
    if (data.isService) {
      // Service steps
      return [
        { icon: Clock, text: "Tunggu konfirmasi dari penyedia jasa" },
        { icon: MessageCircle, text: "Penyedia jasa akan menghubungi via WhatsApp" },
        { icon: Calendar, text: "Tentukan jadwal dan waktu layanan" },
        { icon: CreditCard, text: "Selesaikan pembayaran" },
      ];
    } else {
      // Product steps based on shipping method
      const method = data.shippingMethod || "COD";
      switch (method) {
        case "COD":
          return [
            { icon: Clock, text: "Tunggu konfirmasi dari penjual" },
            { icon: MessageCircle, text: "Penjual akan menghubungi via WhatsApp" },
            { icon: MapPin, text: "Tentukan lokasi dan waktu ketemuan" },
            { icon: CreditCard, text: "Bayar tunai saat bertemu" },
          ];
        case "PICKUP":
          return [
            { icon: Clock, text: "Tunggu konfirmasi dari penjual" },
            { icon: MessageCircle, text: "Hubungi penjual untuk jadwal ambil" },
            { icon: Home, text: "Ambil barang di lokasi penjual" },
            { icon: CreditCard, text: "Bayar di tempat atau transfer" },
          ];
        case "DELIVERY":
          return [
            { icon: Clock, text: "Tunggu konfirmasi dari penjual" },
            { icon: CreditCard, text: "Penjual akan update status pengiriman" },
            { icon: Package, text: "Barang diantar ke alamatmu" },
            { icon: MessageCircle, text: "Konfirmasi saat barang diterima" },
          ];
        default:
          return [{ icon: Clock, text: "Tunggu update dari penjual" }];
      }
    }
  };

  if (loading) {
    return <PaymentSuccessPageSkeleton />;
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-primary-50 to-white dark:from-primary-950/30 dark:to-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* ── Header ── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/50 mb-4">
            <CheckCircle2 className="h-12 w-12 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-primary-700 dark:text-primary-400 mb-2">
            {isMultiOrder
              ? `${orders.length} Pesanan Berhasil Dibuat!`
              : firstOrderData?.isService
              ? "Booking Berhasil Dibuat!"
              : "Pesanan Berhasil Dibuat!"}
          </h1>
          <p className="text-muted-foreground">
            {isMultiOrder
              ? "Semua pesananmu sedang diproses. Penyedia/Penjual akan segera menghubungimu."
              : firstOrderData?.isService
              ? "Booking jasa kamu sedang diproses. Penyedia jasa akan segera menghubungimu."
              : "Pesananmu sedang diproses. Penjual akan segera menghubungimu."}
          </p>
        </div>

        {/* ── Multi-order: per-order cards ── */}
        {isMultiOrder && (
          <div className="space-y-4 mb-6">
            {orderDataList.map((orderData, idx) => (
              <Card 
                key={idx} 
                className="border-primary-100 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onNavigate("order-detail", orderData.id)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {orderData.isService ? (
                        <>
                          <Briefcase className="h-4 w-4 text-purple-600" />
                          <span className="font-medium text-sm">Booking Jasa</span>
                        </>
                      ) : (
                        <>
                          <Package className="h-4 w-4 text-primary-600" />
                          <span className="font-medium text-sm">Pesanan Barang</span>
                        </>
                      )}
                    </div>
                    <p className="text-sm font-medium line-clamp-1 mb-1">{orderData.product.title}</p>
                    {orderData.isService && orderData.schedule && (
                      <div className="text-xs text-muted-foreground space-y-0.5 mb-2 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-md">
                        <p><span className="font-medium text-slate-600 dark:text-slate-300">Tgl Pengerjaan:</span> {orderData.schedule.startDate}</p>
                        {orderData.schedule.deadline && <p><span className="font-medium text-slate-600 dark:text-slate-300">Deadline:</span> {orderData.schedule.deadline}</p>}
                        {orderData.serviceNotes && <p className="truncate"><span className="font-medium text-slate-600 dark:text-slate-300">Catatan:</span> {orderData.serviceNotes}</p>}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">#{orderData.orderId}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold text-primary-600">{formatPrice(orderData.total)}</p>
                      <p className="text-xs text-muted-foreground">Status: Menunggu Konfirmasi</p>
                    </div>
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate("chat", { productId: orderData.product.id });
                      }}
                      className="shrink-0 border-primary-300 dark:border-primary-700 hover:bg-primary-50 dark:hover:bg-primary-950/20"
                    >
                      <MessageCircle className="h-3 w-3 mr-1" />
                      Chat
                    </Button>
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate("order-detail", orderData.id);
                      }}
                      className="shrink-0"
                    >
                      Lihat Detail
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* ── Single order details ── */}
        {!isMultiOrder && firstOrderData && (
          <>
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {firstOrderData.isService ? (
                      <>
                        <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
                          <Briefcase className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-semibold">Booking {firstOrderData.product.title}</p>
                          <p className="text-sm text-muted-foreground">#{firstOrderData.orderId}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-3 rounded-full bg-primary-100 dark:bg-primary-900/30">
                          <Package className="h-5 w-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-semibold">Pesanan {firstOrderData.product.title}</p>
                          <p className="text-sm text-muted-foreground">#{firstOrderData.orderId}</p>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="bg-primary-50 text-primary-700 border-primary-200">
                      Menunggu Konfirmasi
                    </Badge>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>{firstOrderData.orderDate || "-"}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardContent className="p-6">
                <h2 className="font-semibold mb-4 flex items-center gap-2">
                  {firstOrderData.isService ? (
                    <>
                      <Briefcase className="h-5 w-5 text-purple-600" />
                      Detail Booking
                    </>
                  ) : (
                    <>
                      <Package className="h-5 w-5 text-primary-600" />
                      Detail Pesanan
                    </>
                  )}
                </h2>

                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
                    {firstOrderData.isService ? (
                      <Briefcase className="h-8 w-8 text-muted-foreground/30" />
                    ) : (
                      <Package className="h-8 w-8 text-muted-foreground/30" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">
                      {firstOrderData.product.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {firstOrderData.product.quantity}x •{" "}
                      {formatPrice(firstOrderData.product.price || 0)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {firstOrderData.isService ? "Penyedia: " : "Penjual: "}{firstOrderData.product.seller.name}
                    </p>
                    {firstOrderData.isService && firstOrderData.product.seller.rating !== undefined && (
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Rating: {firstOrderData.product.seller.rating.toFixed(1)} ⭐ • {firstOrderData.product.seller.totalOrders} pesanan
                      </p>
                    )}
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {firstOrderData.isService ? "Harga Jasa" : "Harga Barang"}
                    </span>
                    <span>
                      {formatPrice(firstOrderData.subtotal || 0)}
                    </span>
                  </div>
                  {!firstOrderData.isService && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ongkos Kirim</span>
                      <span className="text-primary-600">
                        {(firstOrderData.shippingFee || 0) === 0
                          ? "Gratis"
                          : formatPrice(firstOrderData.shippingFee || 0)}
                      </span>
                    </div>
                  )}
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between font-bold text-lg">
                  <span>Total Pembayaran</span>
                  <span className="text-primary-600">
                    {formatPrice(firstOrderData.total || 0)}
                  </span>
                </div>

                <div className="mt-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      Metode {firstOrderData.isService ? "Layanan" : "Pengiriman"}: {firstOrderData.shippingMethod}
                    </span>
                  </div>

                  {!firstOrderData.isService && firstOrderData.shippingMethod === "COD" && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Bayar tunai saat bertemu dengan penjual
                    </p>
                  )}
                  {firstOrderData.isService && firstOrderData.serviceMethod && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {getServiceMethodLabel(firstOrderData.serviceMethod).label}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* ── Next Steps ── */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary-600" />
              Langkah Selanjutnya
            </h2>

            <div className="space-y-3">
              {getNextSteps().map((step, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center shrink-0">
                    <span className="text-sm font-medium text-primary-600">
                      {index + 1}
                    </span>
                  </div>
                  <step.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{step.text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── Contact seller ── */}
        {!isMultiOrder && (
          <Card className="mb-6 bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-primary-800 dark:text-primary-200">
                    Ada pertanyaan?
                  </p>
                  <p className="text-sm text-primary-700 dark:text-primary-300">
                    Hubungi {firstOrderData?.isService ? "penyedia jasa" : "penjual"} untuk info lebih lanjut
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-primary-300 dark:border-primary-700"
                    onClick={() => onNavigate("chat", { productId: orders[0]?.product?.id || orders[0]?.product?.uuid })}
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Chat
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-primary-300 dark:border-primary-700"
                    onClick={() => openWhatsApp(orders[0]?.seller?.phone, orders[0]?.seller?.name || "Penjual", orders[0]?.productTitle || orders[0]?.product?.title || "Pesanan", firstOrderData?.isService)}
                  >
                    <Phone className="h-4 w-4 mr-1" />
                    WhatsApp
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Action Buttons ── */}
        <div className="space-y-3">
          {isMultiOrder ? (
            <Button
              className="w-full bg-primary-600 hover:bg-primary-700"
              size="lg"
              onClick={() => onNavigate("orders")}
            >
              <ShoppingBag className="h-5 w-5 mr-2" />
              Lihat Semua Pesanan
            </Button>
          ) : (
            <Button
              className="w-full bg-primary-600 hover:bg-primary-700"
              size="lg"
              onClick={() =>
                firstOrderData?.id
                  ? onNavigate("order-detail", firstOrderData.id)
                  : onNavigate("orders")
              }
            >
              <Package className="h-5 w-5 mr-2" />
              Lihat Detail {firstOrderData?.isService ? "Booking" : "Pesanan"}
            </Button>
          )}

          {!isMultiOrder && (
            <Button
              variant="outline"
              className="w-full"
              size="lg"
              onClick={() => onNavigate("orders")}
            >
              <ShoppingBag className="h-5 w-5 mr-2" />
              Lihat Semua Pesanan
            </Button>
          )}

          <Button
            variant="ghost"
            className="w-full"
            size="lg"
            onClick={() => onNavigate("landing")}
          >
            <Home className="h-5 w-5 mr-2" />
            Kembali ke Beranda
          </Button>
        </div>

        {/* ── Breadcrumb ── */}
        <nav className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-8">
          <button
            onClick={() => onNavigate("landing")}
            className="hover:text-primary-600"
          >
            Beranda
          </button>
          <ChevronRight className="h-4 w-4" />
          <button
            onClick={() => onNavigate("cart")}
            className="hover:text-primary-600"
          >
            Keranjang
          </button>
          <ChevronRight className="h-4 w-4" />
          <button
            onClick={() => onNavigate("checkout")}
            className="hover:text-primary-600"
          >
            Checkout
          </button>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Sukses</span>
        </nav>
      </div>
    </div>
  );
}
