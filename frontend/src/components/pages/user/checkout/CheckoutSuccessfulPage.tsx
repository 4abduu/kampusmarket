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
    <div className={`min-h-[calc(100dvh-64px)] bg-gradient-to-b ${isServiceOrder ? "from-purple-50 dark:from-purple-950/30" : "from-primary-50 dark:from-primary-950/30"} to-white dark:to-background`}>
      <div className="container mx-auto px-4 py-5 sm:py-8 max-w-2xl">
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
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {orderData.isService ? (
                        <>
                          <Briefcase className="h-4 w-4 text-purple-600 shrink-0" />
                          <span className="font-medium text-sm">Booking Jasa</span>
                        </>
                      ) : (
                        <>
                          <Package className="h-4 w-4 text-primary-600 shrink-0" />
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
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <div className="text-left sm:text-right">
                      <p className="font-semibold text-primary-600">{formatPrice(orderData.total)}</p>
                      <p className="text-xs text-muted-foreground">Status: Menunggu Konfirmasi</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
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
                        <span className="hidden sm:inline">Lihat Detail</span>
                        <span className="sm:hidden">Detail</span>
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
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
        <Card className="mb-4 sm:mb-6">
          <CardContent className="p-4 sm:p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Clock className={`h-5 w-5 ${isServiceOrder ? "text-purple-600" : "text-primary-600"}`} />
              Langkah Selanjutnya
            </h2>

            <div className="space-y-3">
              {getNextSteps().map((step, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isServiceOrder ? "bg-purple-100 dark:bg-purple-900/50" : "bg-primary-100 dark:bg-primary-900/50"}`}>
                    <span className={`text-sm font-medium ${isServiceOrder ? "text-purple-600" : "text-primary-600"}`}>
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
          <Card className={`mb-6 ${firstOrderData?.isService ? "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800" : "bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800"}`}>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className={`font-medium ${firstOrderData?.isService ? "text-purple-800 dark:text-purple-200" : "text-primary-800 dark:text-primary-200"}`}>
                    Ada pertanyaan?
                  </p>
                  <p className={`text-sm ${firstOrderData?.isService ? "text-purple-700 dark:text-purple-300" : "text-primary-700 dark:text-primary-300"}`}>
                    Hubungi {firstOrderData?.isService ? "penyedia jasa" : "penjual"} untuk info lebih lanjut
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`flex-1 sm:flex-none ${firstOrderData?.isService ? "border-purple-300 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950/20 text-purple-700 dark:text-purple-300" : "border-primary-300 dark:border-primary-700"}`}
                    onClick={() => onNavigate("chat", { productId: firstOrderData?.product?.id, chatAction: "chat" })}
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Chat
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`flex-1 sm:flex-none ${firstOrderData?.isService ? "border-purple-300 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950/20 text-purple-700 dark:text-purple-300" : "border-primary-300 dark:border-primary-700"}`}
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
              className={`w-full ${isServiceOrder ? "bg-purple-600 hover:bg-purple-700 text-white" : "bg-primary-600 hover:bg-primary-700"}`}
              size="lg"
              onClick={() => onNavigate("orders")}
            >
              <ShoppingBag className="h-5 w-5 mr-2" />
              Lihat Semua Pesanan
            </Button>
          ) : (
            <Button
              className={`w-full ${firstOrderData?.isService ? "bg-purple-600 hover:bg-purple-700 text-white" : "bg-primary-600 hover:bg-primary-700"}`}
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
        <nav className="flex items-center justify-center gap-2 text-xs sm:text-sm text-muted-foreground mt-6 sm:mt-8 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [ms-overflow-style:none]">
          <button
            onClick={() => onNavigate("landing")}
            className={`hover:${isServiceOrder ? "text-purple-600" : "text-primary-600"}`}
          >
            Beranda
          </button>
          <ChevronRight className="h-4 w-4" />
          <button
            onClick={() => onNavigate("cart")}
            className={`hover:${isServiceOrder ? "text-purple-600" : "text-primary-600"}`}
          >
            Keranjang
          </button>
          <ChevronRight className="h-4 w-4" />
          <button
            onClick={() => onNavigate("checkout")}
            className={`hover:${isServiceOrder ? "text-purple-600" : "text-primary-600"}`}
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
