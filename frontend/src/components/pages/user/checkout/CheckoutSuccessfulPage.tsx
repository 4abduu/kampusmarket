"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Package, ShoppingBag, Home, MessageCircle, Clock, Phone, ChevronRight, Briefcase } from "lucide-react";
import { openWhatsApp } from "@/lib/whatsapp";
import { PaymentSuccessPageSkeleton } from "@/components/skeleton";
import type { NavigationData } from "@/app/navigation/types";
import { useCheckoutSuccessful, formatPrice } from "./hooks/useCheckoutSuccessful";
import CheckoutSuccessHeader from "./components/CheckoutSuccessHeader";
import CheckoutSuccessOrderInfo from "./components/CheckoutSuccessOrderInfo";
import ProductShippingCard from "./components/product/ProductShippingCard";
import ServiceBookingCard from "./components/service/ServiceBookingCard";

interface CheckoutSuccessfulPageProps {
  onNavigate: (page: string, data?: string | NavigationData) => void;
  orderId?: string;
}

export default function CheckoutSuccessfulPage({
  onNavigate,
  orderId,
}: CheckoutSuccessfulPageProps) {
  const {
    orders,
    loading,
    isMultiOrder,
    orderDataList,
    firstOrderData,
    getNextSteps,
    isServiceOrder,
  } = useCheckoutSuccessful(orderId);

  if (loading) {
    return <PaymentSuccessPageSkeleton />;
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-primary-50 to-white dark:from-primary-950/30 dark:to-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* ── Header ── */}
        <CheckoutSuccessHeader 
          isMultiOrder={isMultiOrder} 
          ordersCount={orders.length} 
          isServiceOrder={isServiceOrder} 
        />

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
                        onNavigate("chat", { productId: orderData.product.id, chatAction: "chat" });
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
            <CheckoutSuccessOrderInfo orderData={firstOrderData} />

            {firstOrderData.isService ? (
              <ServiceBookingCard orderData={firstOrderData} />
            ) : (
              <ProductShippingCard orderData={firstOrderData} />
            )}
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
                    onClick={() => onNavigate("chat", { productId: firstOrderData?.product?.id, chatAction: "chat" })}
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
