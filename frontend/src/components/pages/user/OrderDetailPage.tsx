"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
} from "lucide-react";
import { mockOrders, calculateAdminFee, ADMIN_FEE_PERCENTAGE, calculateNetIncome, type OrderHistory, CANCEL_REASONS } from "@/lib/mock-data";
import OrderHistoryTimeline from "@/components/pages/user/order-detail/OrderHistoryTimeline";
import { getOrderStatusConfig, getShippingMethodLabel } from "@/components/pages/user/order-detail/constants";
import OrderDetailDialogs from "@/components/pages/user/order-detail/OrderDetailDialogs";
import OrderDetailStatusSection from "@/components/pages/user/order-detail/OrderDetailStatusSection";
import OrderDetailProductCard from "@/components/pages/user/order-detail/OrderDetailProductCard";
import OrderDetailSummaryColumn from "@/components/pages/user/order-detail/OrderDetailSummaryColumn";

interface OrderDetailPageProps {
  onNavigate: (page: string) => void;
  orderId?: string;
}

export default function OrderDetailPage({ onNavigate, orderId }: OrderDetailPageProps) {
  // Find the order by ID, or use first service/product order for demo
  const orderById = orderId ? mockOrders.find(o => o.id === orderId) : null;
  
  // For demo, if no order found, use first service or product order
  const serviceOrderIndex = mockOrders.findIndex(o => o.productType === "jasa");
  const productOrderIndex = mockOrders.findIndex(o => o.productType === "barang");
  
  // Priority: 1) Found by ID, 2) First service order (for demo), 3) First product order
  const initialOrder = orderById 
    || mockOrders[serviceOrderIndex >= 0 ? serviceOrderIndex : 0]
    || mockOrders[productOrderIndex >= 0 ? productOrderIndex : 0]
    || mockOrders[0];
  
  // Determine if service from the order's productType
  const isService = initialOrder.productType === "jasa";
  
  // Simulating different order states for demo
  const [orderStatus, setOrderStatus] = useState<
    "waiting_price" | "waiting_confirmation" | "waiting_shipping_fee" | "waiting_payment" | "processing" | "completed" | "cancelled"
  >(isService ? "waiting_price" : "waiting_shipping_fee");
  
  const [shippingFee, setShippingFee] = useState(12000);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [_showShippingFeeDialog, setShowShippingFeeDialog] = useState(false);
  const [expandedHistory, setExpandedHistory] = useState<string[]>([]);
  
  // For seller view demo
  const [isSellerView, setIsSellerView] = useState(true); // Toggle to see seller/customer view
  const [inputShippingFee, setInputShippingFee] = useState("");
  const [shippingNotes, setShippingNotes] = useState("");

  // Service variable pricing states
  const [_showServicePriceDialog, setShowServicePriceDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [servicePriceInput, setServicePriceInput] = useState("");
  const [servicePriceNotes, setServicePriceNotes] = useState("");
  const [offeredPrice, setOfferedPrice] = useState<number | null>(null);
  const [priceOfferNotes, setPriceOfferNotes] = useState("");

  // Cancel order states
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showCancelRequestDialog, setShowCancelRequestDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelDescription, setCancelDescription] = useState("");

  const order = initialOrder;

  // Service specific data from order or fallback to mock
  const serviceData = {
    serviceDate: order.serviceDate || "30 November 2024, 09:00",
    serviceDeadline: order.serviceDeadline || "30 November 2024, 17:00",
    serviceNotes: order.serviceNotes || "Foto wisuda di gedung rektorat, bawa 2 toga. Bisa setelah jam 9 pagi.",
    serviceMethod: order.shippingType || "pickup", // pickup | cod | online
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const basePrice = offeredPrice || (order.product.priceMin || order.product.price) * order.quantity;
  const adminFeeDeducted = calculateAdminFee(basePrice + shippingFee);
  const totalPayment = basePrice + (orderStatus === "waiting_confirmation" || orderStatus === "waiting_payment" || orderStatus === "processing" || orderStatus === "completed" ? shippingFee : 0);
  const netIncome = calculateNetIncome(basePrice + shippingFee);

  // Demo shipping methods
  const shippingMethod = isService ? serviceData.serviceMethod : "delivery";
  const shippingMethodConfig = getShippingMethodLabel(shippingMethod, isService);
  const statusConfig = getOrderStatusConfig(orderStatus);

  // Generate order history for demo based on current status
  const generateOrderHistory = (): OrderHistory[] => {
    const history: OrderHistory[] = [
      {
        id: "h1",
        orderId: order.id,
        status: "pending",
        notes: isService ? "Booking jasa dibuat" : "Pesanan dibuat oleh pembeli",
        actorId: order.buyer.id,
        actorName: order.buyer.name,
        createdAt: order.createdAt,
      },
    ];

    if (isService) {
      if (orderStatus === "waiting_confirmation" || orderStatus === "processing" || orderStatus === "completed") {
        history.push({
          id: "h2",
          orderId: order.id,
          status: "waiting_price",
          notes: "Menunggu penawaran harga dari penyedia jasa",
          actorId: "system",
          actorName: "Sistem",
          createdAt: new Date(new Date(order.createdAt).getTime() + 5 * 60 * 1000).toISOString(),
        });
        history.push({
          id: "h3",
          orderId: order.id,
          status: "waiting_confirmation",
          notes: `Penawaran harga ${formatPrice(basePrice)} telah dikirim`,
          actorId: order.seller.id,
          actorName: order.seller.name,
          createdAt: new Date(new Date(order.createdAt).getTime() + 30 * 60 * 1000).toISOString(),
        });
      }

      if (orderStatus === "processing" || orderStatus === "completed") {
        history.push({
          id: "h4",
          orderId: order.id,
          status: "processing",
          notes: "Pembayaran berhasil, jasa sedang diproses",
          actorId: order.buyer.id,
          actorName: order.buyer.name,
          createdAt: new Date(new Date(order.createdAt).getTime() + 60 * 60 * 1000).toISOString(),
        });
      }

      if (orderStatus === "completed") {
        history.push({
          id: "h5",
          orderId: order.id,
          status: "completed",
          notes: "Layanan jasa telah selesai",
          actorId: order.seller.id,
          actorName: order.seller.name,
          createdAt: new Date(new Date(order.createdAt).getTime() + 180 * 60 * 1000).toISOString(),
        });
      }
    } else {
      // Product order history
      if (orderStatus === "waiting_payment" || orderStatus === "processing" || orderStatus === "completed") {
        history.push({
          id: "h2",
          orderId: order.id,
          status: "waiting_shipping_fee",
          notes: "Menunggu penjual input ongkos kirim",
          actorId: "system",
          actorName: "Sistem",
          createdAt: new Date(new Date(order.createdAt).getTime() + 5 * 60 * 1000).toISOString(),
        });
        history.push({
          id: "h3",
          orderId: order.id,
          status: "waiting_payment",
          notes: `Ongkos kirim ${formatPrice(shippingFee)} telah diinput, menunggu pembayaran`,
          actorId: order.seller.id,
          actorName: order.seller.name,
          createdAt: new Date(new Date(order.createdAt).getTime() + 30 * 60 * 1000).toISOString(),
        });
      }

      if (orderStatus === "processing" || orderStatus === "completed") {
        history.push({
          id: "h4",
          orderId: order.id,
          status: "processing",
          notes: "Pembayaran berhasil diterima",
          actorId: order.buyer.id,
          actorName: order.buyer.name,
          createdAt: new Date(new Date(order.createdAt).getTime() + 60 * 60 * 1000).toISOString(),
        });
      }

      if (orderStatus === "completed") {
        history.push({
          id: "h5",
          orderId: order.id,
          status: "in_delivery",
          notes: "Barang sedang dalam pengiriman",
          actorId: order.seller.id,
          actorName: order.seller.name,
          createdAt: new Date(new Date(order.createdAt).getTime() + 120 * 60 * 1000).toISOString(),
        });
        history.push({
          id: "h6",
          orderId: order.id,
          status: "completed",
          notes: "Pesanan telah selesai",
          actorId: order.buyer.id,
          actorName: order.buyer.name,
          createdAt: new Date(new Date(order.createdAt).getTime() + 180 * 60 * 1000).toISOString(),
        });
      }
    }

    return history;
  };

  const orderHistory = generateOrderHistory();

  // Toggle expanded state for history item
  const toggleHistoryExpand = (id: string) => {
    setExpandedHistory(prev => 
      prev.includes(id) 
        ? prev.filter(h => h !== id)
        : [...prev, id]
    );
  };

  // Handle seller input shipping fee
  const handleInputShippingFee = () => {
    if (inputShippingFee) {
      setShippingFee(parseInt(inputShippingFee));
      setOrderStatus("waiting_payment"); // Changed from waiting_confirmation to waiting_payment for products
      setShowShippingFeeDialog(false);
    }
  };

  // Handle seller input service price
  const handleInputServicePrice = () => {
    if (servicePriceInput) {
      setOfferedPrice(parseInt(servicePriceInput));
      setPriceOfferNotes(servicePriceNotes);
      setOrderStatus("waiting_confirmation");
      setShowServicePriceDialog(false);
    }
  };

  // Handle buyer accept price
  const handleAcceptPrice = () => {
    setShowPaymentDialog(true);
  };

  // Handle buyer reject price
  const handleRejectPrice = () => {
    setShowRejectDialog(true);
  };

  const handleConfirmRejectPrice = () => {
    setShowRejectDialog(false);
    setOrderStatus("cancelled");
  };

  // Handle seller confirm shipment
  const handleConfirmShipment = () => {
    setOrderStatus("completed");
  };

  // For demo: simulate payment
  const handlePayment = () => {
    setShowPaymentDialog(false);
    setOrderStatus("processing");
  };

  // For CUSTOMER: Determine if order can be cancelled directly (no admin approval needed)
  const canCancelDirectly = ["pending", "waiting_price", "waiting_shipping_fee"].includes(orderStatus);
  
  // For CUSTOMER: Determine if order needs cancel request (admin approval required)
  const needsCancelRequest = ["waiting_confirmation", "waiting_payment", "processing"].includes(orderStatus);

  // For SELLER: Can cancel directly if buyer hasn't paid yet (no refund needed)
  // Statuses where buyer hasn't paid: pending, waiting_price, waiting_shipping_fee, waiting_payment, waiting_confirmation
  const sellerCanCancelDirectly = ["pending", "waiting_price", "waiting_shipping_fee", "waiting_payment", "waiting_confirmation"].includes(orderStatus);
  
  // For SELLER: Need admin approval if buyer has already paid (refund needed)
  const sellerNeedsCancelRequest = ["processing"].includes(orderStatus);

  // Handle direct cancel (for orders not yet confirmed by seller)
  const handleDirectCancel = () => {
    setOrderStatus("cancelled" as typeof orderStatus);
    setShowCancelDialog(false);
  };

  // Handle cancel request submission (for orders already confirmed)
  const handleCancelRequest = () => {
    // In production, this would send to backend
    console.log("Cancel request submitted:", {
      orderId: order.id,
      reason: cancelReason,
      description: cancelDescription,
    });
    setShowCancelRequestDialog(false);
    // Reset form
    setCancelReason("");
    setCancelDescription("");
  };

  // Handle cancel button click
  const handleCancelClick = () => {
    if (canCancelDirectly) {
      setShowCancelDialog(true);
    } else if (needsCancelRequest) {
      setShowCancelRequestDialog(true);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header with Order Number */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => onNavigate("orders")}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Detail {isService ? "Booking" : "Pesanan"}</h1>
            <p className="text-muted-foreground font-mono text-sm">
              {order.orderNumber || `Order #${order.id.toUpperCase()}`}
            </p>
          </div>
          <div className={`px-3 py-1.5 rounded-full ${statusConfig.bgColor} border ${statusConfig.borderColor}`}>
            <span className={`font-medium ${statusConfig.color} flex items-center gap-1`}>
              <statusConfig.icon className={`h-4 w-4 ${orderStatus === "processing" ? "animate-spin" : ""}`} />
              {statusConfig.label}
            </span>
          </div>
        </div>

        <OrderDetailStatusSection
          isService={isService}
          isSellerView={isSellerView}
          setIsSellerView={setIsSellerView}
          orderStatus={orderStatus}
          setOrderStatus={setOrderStatus}
          serviceData={serviceData}
          servicePriceInput={servicePriceInput}
          setServicePriceInput={setServicePriceInput}
          servicePriceNotes={servicePriceNotes}
          setServicePriceNotes={setServicePriceNotes}
          handleInputServicePrice={handleInputServicePrice}
          formatPrice={formatPrice}
          basePrice={basePrice}
          priceOfferNotes={priceOfferNotes}
          handleRejectPrice={handleRejectPrice}
          handleAcceptPrice={handleAcceptPrice}
          shippingFee={shippingFee}
          totalPayment={totalPayment}
          setShowPaymentDialog={setShowPaymentDialog}
          netIncome={netIncome}
          inputShippingFee={inputShippingFee}
          setInputShippingFee={setInputShippingFee}
          shippingNotes={shippingNotes}
          setShippingNotes={setShippingNotes}
          handleInputShippingFee={handleInputShippingFee}
          handleConfirmShipment={handleConfirmShipment}
        />

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <OrderHistoryTimeline
              isService={isService}
              orderHistory={orderHistory}
              expandedHistory={expandedHistory}
              toggleHistoryExpand={toggleHistoryExpand}
              getStatusConfig={getOrderStatusConfig}
              formatShortDate={formatShortDate}
              formatDate={formatDate}
              sellerId={order.seller.id}
              buyerId={order.buyer.id}
            />

            <OrderDetailProductCard
              isService={isService}
              order={order}
              offeredPrice={offeredPrice}
              formatPrice={formatPrice}
              serviceData={serviceData}
              onNavigate={onNavigate}
            />
          </div>

          <OrderDetailSummaryColumn
            isService={isService}
            isSellerView={isSellerView}
            shippingMethodConfig={shippingMethodConfig}
            shippingAddress={order.shippingAddress}
            onNavigate={onNavigate}
            basePrice={basePrice}
            shippingFee={shippingFee}
            orderStatus={orderStatus}
            totalPayment={totalPayment}
            netIncome={netIncome}
            adminFeeDeducted={adminFeeDeducted}
            formatPrice={formatPrice}
            adminFeePercentage={ADMIN_FEE_PERCENTAGE}
            canCancelDirectly={canCancelDirectly}
            needsCancelRequest={needsCancelRequest}
            sellerCanCancelDirectly={sellerCanCancelDirectly}
            sellerNeedsCancelRequest={sellerNeedsCancelRequest}
            handleCancelClick={handleCancelClick}
            openSellerCancelDialog={() => {
              if (sellerCanCancelDirectly) {
                setShowCancelDialog(true);
              } else if (sellerNeedsCancelRequest) {
                setShowCancelRequestDialog(true);
              }
            }}
            orderNumber={order.orderNumber || order.id.toUpperCase()}
            createdAt={order.createdAt}
          />
        </div>
      </div>

      <OrderDetailDialogs
        showPaymentDialog={showPaymentDialog}
        setShowPaymentDialog={setShowPaymentDialog}
        totalPayment={totalPayment}
        formatPrice={formatPrice}
        handlePayment={handlePayment}
        showRejectDialog={showRejectDialog}
        setShowRejectDialog={setShowRejectDialog}
        isService={isService}
        onConfirmRejectPrice={handleConfirmRejectPrice}
        showCancelDialog={showCancelDialog}
        setShowCancelDialog={setShowCancelDialog}
        isSellerView={isSellerView}
        orderStatus={orderStatus}
        handleDirectCancel={handleDirectCancel}
        showCancelRequestDialog={showCancelRequestDialog}
        setShowCancelRequestDialog={setShowCancelRequestDialog}
        cancelReason={cancelReason}
        setCancelReason={setCancelReason}
        cancelDescription={cancelDescription}
        setCancelDescription={setCancelDescription}
        cancelReasons={CANCEL_REASONS}
        handleCancelRequest={handleCancelRequest}
      />
    </div>
  );
}
