"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
} from "lucide-react";
import { getOrderDetail, type Order } from "@/lib/api/orders";
import PaymentSuccessPageSkeleton from "@/components/skeleton/PaymentSuccessPageSkeleton";
import type { NavigationData } from "@/app/navigation/types";

interface PaymentSuccessPageProps {
  onNavigate: (page: string, data?: string | NavigationData) => void;
  orderId?: string;
}

export default function PaymentSuccessPage({ onNavigate, orderId }: PaymentSuccessPageProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(Boolean(orderId));

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getOrderDetail(orderId);
        setOrder(data);
      } catch (error) {
        console.error("[PaymentSuccessPage] Failed to fetch order detail", error);
      } finally {
        setLoading(false);
      }
    };

    void loadOrder();
  }, [orderId]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price || 0);
  };

  const shippingMethodRaw = String((order as any)?.shippingType || (order as any)?.shipping_type || "cod").toUpperCase();
  const paymentMethodRaw = String((order as any)?.paymentMethod || (order as any)?.payment_method || "").toUpperCase();

  const orderData = useMemo(() => {
    const title =
      (order as any)?.product?.title ||
      (order as any)?.productTitle ||
      (order as any)?.product_title ||
      "Produk";

    const sellerName =
      (order as any)?.seller?.name ||
      (order as any)?.product?.seller?.name ||
      "Penjual";

    const createdAt = (order as any)?.createdAt || (order as any)?.created_at;

    return {
      orderId: (order as any)?.orderNumber || (order as any)?.order_number || orderId || "-",
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
      product: {
        title,
        price: Number((order as any)?.finalPrice || (order as any)?.final_price || 0),
        quantity: Number((order as any)?.quantity || 1),
        seller: {
          name: sellerName,
          phone: (order as any)?.seller?.phone || "-",
        },
      },
      shippingMethod: shippingMethodRaw,
      shippingAddress: (order as any)?.shippingAddress || (order as any)?.shipping_address || "-",
      subtotal: Number((order as any)?.finalPrice || (order as any)?.final_price || 0),
      shippingFee: Number((order as any)?.shippingFee || (order as any)?.shipping_fee || 0),
      total: Number((order as any)?.totalPrice || (order as any)?.total_price || 0),
      status: String((order as any)?.status || "pending"),
      paymentMethod: paymentMethodRaw || shippingMethodRaw,
    };
  }, [order, orderId, shippingMethodRaw, paymentMethodRaw]);

  const getNextSteps = () => {
    switch (orderData.shippingMethod) {
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
        return [
          { icon: Clock, text: "Tunggu update dari penjual" },
        ];
    }
  };

  if (loading) {
    return <PaymentSuccessPageSkeleton />;
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-primary-50 to-white dark:from-primary-950/30 dark:to-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/50 mb-4">
            <CheckCircle2 className="h-12 w-12 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-primary-700 dark:text-primary-400 mb-2">
            Pesanan Berhasil Dibuat!
          </h1>
          <p className="text-muted-foreground">
            Pesananmu sedang diproses. Penjual akan segera menghubungimu.
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Nomor Pesanan</p>
                <p className="font-bold text-lg">{orderData.orderId}</p>
              </div>
              <div className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-medium">
                Menunggu Konfirmasi
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>{orderData.orderDate}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-primary-600" />
              Detail Pesanan
            </h2>

            <div className="flex gap-4">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
                <Package className="h-8 w-8 text-muted-foreground/30" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{orderData.product.title}</p>
                <p className="text-sm text-muted-foreground">
                  {orderData.product.quantity}x • {formatPrice(orderData.product.price)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Penjual: {orderData.product.seller.name}
                </p>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Harga Barang</span>
                <span>{formatPrice(orderData.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ongkos Kirim</span>
                <span className="text-primary-600">
                  {orderData.shippingFee === 0 ? "Gratis" : formatPrice(orderData.shippingFee)}
                </span>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between font-bold text-lg">
              <span>Total Pembayaran</span>
              <span className="text-primary-600">{formatPrice(orderData.total)}</span>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Metode Pengiriman: {orderData.shippingMethod}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Metode Pembayaran: {orderData.paymentMethod}</p>
              {orderData.shippingMethod === "COD" && (
                <p className="text-xs text-muted-foreground mt-1">
                  Bayar tunai saat bertemu dengan penjual
                </p>
              )}
            </div>
          </CardContent>
        </Card>

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
                    <span className="text-sm font-medium text-primary-600">{index + 1}</span>
                  </div>
                  <step.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{step.text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-primary-800 dark:text-primary-200">
                  Ada pertanyaan?
                </p>
                <p className="text-sm text-primary-700 dark:text-primary-300">
                  Hubungi penjual untuk info lebih lanjut
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-primary-300 dark:border-primary-700"
                  onClick={() => onNavigate("chat")}
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Chat
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-primary-300 dark:border-primary-700"
                >
                  <Phone className="h-4 w-4 mr-1" />
                  WhatsApp
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Button
            className="w-full bg-primary-600 hover:bg-primary-700"
            size="lg"
            onClick={() => (orderId ? onNavigate("order-detail", orderId) : onNavigate("order-detail"))}
          >
            <Package className="h-5 w-5 mr-2" />
            Lihat Detail Pesanan
          </Button>
          <Button
            variant="outline"
            className="w-full"
            size="lg"
            onClick={() => onNavigate("orders")}
          >
            <ShoppingBag className="h-5 w-5 mr-2" />
            Lihat Semua Pesanan
          </Button>
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

        <nav className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-8">
          <button onClick={() => onNavigate("landing")} className="hover:text-primary-600">
            Beranda
          </button>
          <ChevronRight className="h-4 w-4" />
          <button onClick={() => onNavigate("cart")} className="hover:text-primary-600">
            Keranjang
          </button>
          <ChevronRight className="h-4 w-4" />
          <button onClick={() => onNavigate("checkout")} className="hover:text-primary-600">
            Checkout
          </button>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Sukses</span>
        </nav>
      </div>
    </div>
  );
}
