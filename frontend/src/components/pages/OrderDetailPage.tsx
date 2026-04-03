"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Package,
  MapPin,
  Truck,
  User,
  Phone,
  MessageCircle,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Wallet,
  AlertCircle,
  ArrowRight,
  DollarSign,
  Info,
  Send,
  Check,
  Calendar,
  FileText,
  XCircle,
  ShoppingBag,
  Loader2,
  Store,
  Ban,
  PackageCheck,
  TruckIcon,
  Star,
  Briefcase,
  Timer,
  X,
} from "lucide-react";
import { mockOrders, calculateAdminFee, ADMIN_FEE_PERCENTAGE, calculateNetIncome, type OrderHistory, CANCEL_REASONS } from "@/lib/mock-data";

interface OrderDetailPageProps {
  onNavigate: (page: string) => void;
  orderId?: string;
}

// Status configuration with icons and colors
const STATUS_CONFIG = {
  pending: {
    label: "Menunggu Konfirmasi",
    color: "text-amber-700 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    borderColor: "border-amber-300 dark:border-amber-700",
    icon: Clock,
    dotColor: "bg-amber-500",
  },
  waiting_price: {
    label: "Menunggu Harga",
    color: "text-orange-700 dark:text-orange-400",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
    borderColor: "border-orange-300 dark:border-orange-700",
    icon: DollarSign,
    dotColor: "bg-orange-500",
  },
  waiting_confirmation: {
    label: "Menunggu Konfirmasi",
    color: "text-blue-700 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    borderColor: "border-blue-300 dark:border-blue-700",
    icon: AlertCircle,
    dotColor: "bg-blue-500",
  },
  waiting_payment: {
    label: "Menunggu Pembayaran",
    color: "text-primary-700 dark:text-primary-400",
    bgColor: "bg-primary-100 dark:bg-primary-900/30",
    borderColor: "border-primary-300 dark:border-primary-700",
    icon: Wallet,
    dotColor: "bg-primary-500",
  },
  processing: {
    label: "Sedang Diproses",
    color: "text-purple-700 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    borderColor: "border-purple-300 dark:border-purple-700",
    icon: Loader2,
    dotColor: "bg-purple-500",
  },
  waiting_shipping_fee: {
    label: "Menunggu Ongkir",
    color: "text-blue-700 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    borderColor: "border-blue-300 dark:border-blue-700",
    icon: Truck,
    dotColor: "bg-blue-500",
  },
  ready_pickup: {
    label: "Siap Diambil",
    color: "text-cyan-700 dark:text-cyan-400",
    bgColor: "bg-cyan-100 dark:bg-cyan-900/30",
    borderColor: "border-cyan-300 dark:border-cyan-700",
    icon: PackageCheck,
    dotColor: "bg-cyan-500",
  },
  in_delivery: {
    label: "Dalam Pengiriman",
    color: "text-secondary-700 dark:text-secondary-400",
    bgColor: "bg-secondary-100 dark:bg-secondary-900/30",
    borderColor: "border-secondary-300 dark:border-secondary-700",
    icon: TruckIcon,
    dotColor: "bg-secondary-500",
  },
  completed: {
    label: "Selesai",
    color: "text-primary-700 dark:text-primary-400",
    bgColor: "bg-primary-100 dark:bg-primary-900/30",
    borderColor: "border-primary-300 dark:border-primary-700",
    icon: CheckCircle2,
    dotColor: "bg-primary-500",
  },
  cancelled: {
    label: "Dibatalkan",
    color: "text-red-700 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    borderColor: "border-red-300 dark:border-red-700",
    icon: XCircle,
    dotColor: "bg-red-500",
  },
};

// Status flow order for timeline
const STATUS_ORDER = [
  "pending",
  "waiting_price",
  "waiting_confirmation",
  "waiting_shipping_fee",
  "waiting_payment",
  "processing",
  "ready_pickup",
  "in_delivery",
  "completed",
];

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
  const [showShippingFeeDialog, setShowShippingFeeDialog] = useState(false);
  const [expandedHistory, setExpandedHistory] = useState<string[]>([]);
  
  // For seller view demo
  const [isSellerView, setIsSellerView] = useState(true); // Toggle to see seller/customer view
  const [inputShippingFee, setInputShippingFee] = useState("");
  const [shippingNotes, setShippingNotes] = useState("");

  // Service variable pricing states
  const [showServicePriceDialog, setShowServicePriceDialog] = useState(false);
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
  const shippingMethods = {
    cod: { label: "COD (Cash on Delivery)", desc: "Bayar tunai saat ketemuan" },
    pickup: { label: isService ? "Datang ke Lokasi" : "Ambil Sendiri", desc: isService ? "Kamu datang ke lokasi penyedia jasa" : "Ambil di lokasi penjual" },
    delivery: { label: "Antar Manual", desc: "Penjual mengantar ke alamat" },
    online: { label: "Online/Remote", desc: "Layanan dilakukan secara online" },
  };

  const getStatusConfig = (status: string) => {
    return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
  };

  const statusConfig = getStatusConfig(orderStatus);

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

        {/* Demo Toggle - Remove in production */}
        <Card className="mb-6 bg-slate-100 dark:bg-slate-800 border-dashed">
          <CardContent className="p-3">
            <p className="text-sm text-muted-foreground mb-2">Demo: Toggle View</p>
            <div className="flex gap-2 flex-wrap">
              <Button 
                size="sm" 
                variant={!isSellerView ? "default" : "outline"}
                onClick={() => setIsSellerView(false)}
                className="text-xs"
              >
                {isService ? "Customer View" : "Pembeli View"}
              </Button>
              <Button 
                size="sm" 
                variant={isSellerView ? "default" : "outline"}
                onClick={() => setIsSellerView(true)}
                className="text-xs"
              >
                {isService ? "Penyedia View" : "Penjual View"}
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  if (orderStatus === "waiting_price") setOrderStatus("waiting_confirmation");
                  else if (orderStatus === "waiting_confirmation") setOrderStatus("processing");
                  else if (orderStatus === "waiting_shipping_fee") setOrderStatus("waiting_payment");
                  else if (orderStatus === "waiting_payment") setOrderStatus("processing");
                  else if (orderStatus === "processing") setOrderStatus("completed");
                  else setOrderStatus(isService ? "waiting_price" : "waiting_shipping_fee");
                }}
                className="text-xs"
              >
                Next Status: {orderStatus}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* SERVICE: Waiting Price Banner for Customer */}
        {isService && orderStatus === "waiting_price" && !isSellerView && (
          <Card className="mb-6 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-800 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="font-medium text-orange-800 dark:text-orange-200">
                    Menunggu Penawaran Harga
                  </p>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    Penyedia jasa sedang meninjau kebutuhanmu dan akan mengirimkan penawaran harga.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* SERVICE: Seller Input Price Card */}
        {isService && isSellerView && orderStatus === "waiting_price" && (
          <Card className="mb-6 border-amber-200 bg-amber-50 dark:bg-amber-900/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-amber-800 dark:text-amber-200">
                <DollarSign className="h-5 w-5" />
                Kirim Penawaran Harga
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border">
                <p className="text-sm text-muted-foreground">Kebutuhan Pembeli:</p>
                <p className="mt-1">{serviceData.serviceNotes}</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="servicePrice">Harga Jasa (Rp) *</Label>
                  <Input
                    id="servicePrice"
                    type="number"
                    placeholder="Contoh: 250000"
                    value={servicePriceInput}
                    onChange={(e) => setServicePriceInput(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Catatan (Opsional)</Label>
                  <Input 
                    placeholder="Contoh: Termasuk editing 10 foto"
                    value={servicePriceNotes}
                    onChange={(e) => setServicePriceNotes(e.target.value)}
                  />
                </div>
              </div>
              <Button 
                className="w-full bg-amber-600 hover:bg-amber-700"
                onClick={handleInputServicePrice}
                disabled={!servicePriceInput}
              >
                <Send className="h-4 w-4 mr-2" />
                Kirim Penawaran Harga
              </Button>
            </CardContent>
          </Card>
        )}

        {/* SERVICE: Waiting Confirmation Banner for Customer */}
        {isService && orderStatus === "waiting_confirmation" && !isSellerView && (
          <Card className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-200">
                    Penawaran Harga Diterima!
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Penyedia jasa telah mengirimkan penawaran harga. Silakan tinjau dan konfirmasi.
                  </p>
                </div>
              </div>

              {/* Price Offer Card */}
              <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Penawaran Harga</p>
                    <p className="text-2xl font-bold text-blue-600">{formatPrice(basePrice)}</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700">Menunggu Konfirmasi</Badge>
                </div>
                {priceOfferNotes && (
                  <div className="mt-2 p-2 bg-slate-50 dark:bg-slate-700 rounded text-sm">
                    <p className="text-muted-foreground">Catatan Penyedia:</p>
                    <p>{priceOfferNotes}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-4">
                <Button 
                  variant="outline" 
                  className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                  onClick={handleRejectPrice}
                >
                  <X className="h-4 w-4 mr-2" />
                  Tolak
                </Button>
                <Button 
                  className="flex-1 bg-primary-600 hover:bg-primary-700"
                  onClick={handleAcceptPrice}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Setuju & Bayar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* SERVICE: Processing Status for Seller */}
        {isService && isSellerView && orderStatus === "waiting_confirmation" && (
          <Card className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-blue-800 dark:text-blue-200">
                    Menunggu Konfirmasi Pembeli
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Penawaran harga {formatPrice(basePrice)} sedang ditinjau oleh pembeli.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* PRODUCT: Status Banner for Customer */}
        {!isService && orderStatus === "waiting_shipping_fee" && !isSellerView && (
          <Card className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-200">
                    Menunggu Penjual Input Ongkir
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Penjual sedang melihat alamatmu dan akan segera menginput ongkir.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* PRODUCT: Waiting Payment Banner for Customer */}
        {!isService && orderStatus === "waiting_payment" && !isSellerView && (
          <Card className="mb-6 bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="font-medium text-primary-800 dark:text-primary-200">
                    Ongkir Dikonfirmasi - Silakan Bayar
                  </p>
                  <p className="text-sm text-primary-700 dark:text-primary-300">
                    Ongkos kirim {formatPrice(shippingFee)} telah diinput. Segera lakukan pembayaran.
                  </p>
                </div>
              </div>

              {/* Payment Summary Card */}
              <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-primary-200 dark:border-primary-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Harga Barang</span>
                  <span>{formatPrice(basePrice)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Ongkos Kirim</span>
                  <span>{formatPrice(shippingFee)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Pembayaran</span>
                  <span className="text-xl font-bold text-primary-600">{formatPrice(totalPayment)}</span>
                </div>
              </div>

              <Button 
                className="w-full bg-primary-600 hover:bg-primary-700 mt-4"
                size="lg"
                onClick={() => setShowPaymentDialog(true)}
              >
                <Wallet className="h-4 w-4 mr-2" />
                Bayar Sekarang
              </Button>
            </CardContent>
          </Card>
        )}

        {/* PRODUCT: Seller view - Waiting for buyer payment */}
        {!isService && isSellerView && orderStatus === "waiting_payment" && (
          <Card className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-blue-800 dark:text-blue-200">
                    Menunggu Pembayaran Pembeli
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Ongkos kirim {formatPrice(shippingFee)} telah dikirim. Total: {formatPrice(totalPayment)}
                  </p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-white dark:bg-slate-800 rounded-lg border">
                <p className="text-sm text-muted-foreground">Pendapatan bersih (setelah potongan 5%):</p>
                <p className="text-xl font-bold text-primary-600">{formatPrice(netIncome)}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* PRODUCT: Seller Input Shipping Fee Card */}
        {!isService && isSellerView && orderStatus === "waiting_shipping_fee" && (
          <Card className="mb-6 border-amber-200 bg-amber-50 dark:bg-amber-900/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-amber-800 dark:text-amber-200">
                <Truck className="h-5 w-5" />
                Input Ongkos Kirim
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border">
                <p className="text-sm text-muted-foreground">Alamat Pembeli:</p>
                <p className="font-medium">Jl. Kampus No. 123, Kos Melati, Kamar 5</p>
                <p className="text-sm">Limau Manis, Padang</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shippingFee">Ongkos Kirim (Rp)</Label>
                  <Input
                    id="shippingFee"
                    type="number"
                    placeholder="Contoh: 10000"
                    value={inputShippingFee}
                    onChange={(e) => setInputShippingFee(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Catatan (Opsional)</Label>
                  <Input 
                    placeholder="Contoh: Pakai motor, estimasi 30 menit"
                    value={shippingNotes}
                    onChange={(e) => setShippingNotes(e.target.value)}
                  />
                </div>
              </div>
              <Button 
                className="w-full bg-amber-600 hover:bg-amber-700"
                onClick={handleInputShippingFee}
                disabled={!inputShippingFee}
              >
                <Send className="h-4 w-4 mr-2" />
                Kirim Biaya Ongkir
              </Button>
            </CardContent>
          </Card>
        )}

        {/* SERVICE: Seller Action for Processing Order */}
        {isService && isSellerView && orderStatus === "processing" && (
          <Card className="mb-6 border-primary-200 bg-primary-50 dark:bg-primary-900/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-primary-800 dark:text-primary-200">
                <Briefcase className="h-5 w-5" />
                Konfirmasi Selesai
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-primary-700 dark:text-primary-300">
                Pembeli sudah melakukan pembayaran. Segera proses layanan sesuai jadwal.
              </p>
              <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border">
                <p className="text-sm font-medium">Pendapatan Bersih (setelah potongan 5%):</p>
                <p className="text-2xl font-bold text-primary-600">{formatPrice(netIncome)}</p>
              </div>
              <Button 
                className="w-full bg-primary-600 hover:bg-primary-700"
                onClick={handleConfirmShipment}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Konfirmasi Layanan Selesai
              </Button>
            </CardContent>
          </Card>
        )}

        {/* PRODUCT: Seller Action for Processing Order */}
        {!isService && isSellerView && orderStatus === "processing" && (
          <Card className="mb-6 border-primary-200 bg-primary-50 dark:bg-primary-900/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-primary-800 dark:text-primary-200">
                <Package className="h-5 w-5" />
                Konfirmasi Pengiriman
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-primary-700 dark:text-primary-300">
                Pembeli sudah melakukan pembayaran. Segera proses dan kirim barang.
              </p>
              <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border">
                <p className="text-sm font-medium">Pendapatan Bersih (setelah potongan 5%):</p>
                <p className="text-2xl font-bold text-primary-600">{formatPrice(netIncome)}</p>
              </div>
              <Button 
                className="w-full bg-primary-600 hover:bg-primary-700"
                onClick={handleConfirmShipment}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Konfirmasi Barang Dikirim
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Order History Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  Riwayat {isService ? "Booking" : "Pesanan"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />
                  
                  {/* Timeline items */}
                  <div className="space-y-1">
                    {orderHistory.map((history, index) => {
                      const config = getStatusConfig(history.status);
                      const Icon = config.icon;
                      const isExpanded = expandedHistory.includes(history.id);
                      const isLatest = index === orderHistory.length - 1;
                      
                      return (
                        <div key={history.id} className="relative">
                          <Collapsible
                            open={isExpanded}
                            onOpenChange={() => toggleHistoryExpand(history.id)}
                          >
                            <CollapsibleTrigger asChild>
                              <button className="w-full flex items-start gap-4 py-3 px-2 -mx-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left">
                                {/* Timeline dot */}
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center z-10 shrink-0 transition-all ${
                                    isLatest
                                      ? `${config.bgColor} ring-2 ring-offset-2 ring-offset-background ${config.borderColor}`
                                      : "bg-slate-200 dark:bg-slate-700"
                                  }`}
                                >
                                  <Icon className={`h-4 w-4 ${isLatest ? config.color : "text-muted-foreground"} ${history.status === "processing" && isLatest ? "animate-spin" : ""}`} />
                                </div>
                                
                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className={`font-medium ${isLatest ? config.color : ""}`}>
                                      {config.label}
                                    </p>
                                    {isLatest && (
                                      <Badge variant="secondary" className={`text-xs ${config.bgColor} ${config.color}`}>
                                        Terbaru
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {formatShortDate(history.createdAt)}
                                  </p>
                                </div>
                                
                                {/* Expand indicator */}
                                <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                              </button>
                            </CollapsibleTrigger>
                            
                            <CollapsibleContent>
                              <div className="ml-12 mt-1 mb-3 p-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                {/* Actor */}
                                {history.actorName && (
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${history.actorId === "system" ? "bg-slate-300 dark:bg-slate-600" : "bg-primary-100 dark:bg-primary-900"}`}>
                                      {history.actorId === "system" ? (
                                        <Info className="h-3 w-3 text-slate-600 dark:text-slate-400" />
                                      ) : (
                                        <User className="h-3 w-3 text-primary-600 dark:text-primary-400" />
                                      )}
                                    </div>
                                    <span className="text-sm font-medium">{history.actorName}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {history.actorId === order.seller.id ? `(${isService ? "Penyedia" : "Penjual"})` : history.actorId === order.buyer.id ? `(${isService ? "Pemesan" : "Pembeli"})` : ""}
                                    </span>
                                  </div>
                                )}
                                
                                {/* Notes */}
                                {history.notes && (
                                  <p className="text-sm text-muted-foreground">{history.notes}</p>
                                )}
                                
                                {/* Timestamp */}
                                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatDate(history.createdAt)}
                                </p>
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detail {isService ? "Layanan" : "Produk"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className={`w-20 h-20 rounded-lg flex items-center justify-center shrink-0 ${isService ? "bg-secondary-100 dark:bg-secondary-900/30" : "bg-slate-100 dark:bg-slate-800"}`}>
                    {isService ? (
                      <Briefcase className="h-8 w-8 text-secondary-600/50" />
                    ) : (
                      <Package className="h-8 w-8 text-muted-foreground/30" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium line-clamp-2">{order.productTitle || order.product.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={`text-xs ${isService ? "border-secondary-300 text-secondary-600" : ""}`}>
                        {isService ? "Jasa" : "Barang"}
                      </Badge>
                      <p className="text-sm text-muted-foreground">{order.quantity}x</p>
                    </div>
                    <p className="font-bold text-primary-600 mt-1">
                      {isService && order.product.priceType === "starting" 
                        ? `Mulai dari ${formatPrice(order.product.priceMin || order.product.price)}`
                        : formatPrice(offeredPrice || order.product.price)}
                    </p>
                  </div>
                </div>

                {/* Service Details */}
                {isService && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-secondary-600" />
                        <span className="text-muted-foreground">Tanggal Pelaksanaan:</span>
                        <span className="font-medium">{serviceData.serviceDate}</span>
                      </div>
                      {serviceData.serviceDeadline && (
                        <div className="flex items-center gap-2 text-sm">
                          <Timer className="h-4 w-4 text-orange-500" />
                          <span className="text-muted-foreground">Tenggat Waktu:</span>
                          <span className="font-medium">{serviceData.serviceDeadline}</span>
                        </div>
                      )}
                      {serviceData.serviceNotes && (
                        <div className="flex items-start gap-2 text-sm">
                          <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <span className="text-muted-foreground">Catatan:</span>
                            <p className="mt-1 p-2 bg-slate-100 dark:bg-slate-800 rounded-md">
                              {serviceData.serviceNotes}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                <Separator />

                {/* Seller Info */}
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className={isService ? "bg-secondary-100 text-secondary-700" : "bg-primary-100 text-primary-700"}>
                      {order.seller.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{order.seller.name}</p>
                    <p className="text-sm text-muted-foreground">{order.seller.phone}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => onNavigate("chat")}>
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Chat
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Shipping/Service Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{isService ? "Info Layanan" : "Info Pengiriman"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Metode</p>
                  <div className="flex items-center gap-2">
                    {isService ? (
                      <Briefcase className="h-4 w-4 text-secondary-600" />
                    ) : (
                      <Truck className="h-4 w-4 text-primary-600" />
                    )}
                    <span className="font-medium">{shippingMethods[shippingMethod]?.label}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {shippingMethods[shippingMethod]?.desc}
                  </p>
                </div>

                {order.shippingAddress && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{isService ? "Lokasi" : "Alamat"}</p>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <p className="font-medium">{order.shippingAddress}</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => onNavigate("chat")}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Chat {isSellerView ? (isService ? "Pemesan" : "Pembeli") : (isService ? "Penyedia" : "Penjual")}
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Phone className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Payment Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rincian Pembayaran</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{isService ? "Harga Jasa" : "Harga Barang"}</span>
                    <span>{formatPrice(basePrice)}</span>
                  </div>
                  
                  {!isService && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ongkos Kirim</span>
                      {orderStatus === "waiting_shipping_fee" ? (
                        <span className="text-blue-600">Menunggu konfirmasi</span>
                      ) : (
                        <span>{formatPrice(shippingFee)}</span>
                      )}
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                  <span>Total Pembayaran</span>
                  {(orderStatus === "waiting_shipping_fee" || orderStatus === "waiting_price") ? (
                    <div className="text-right">
                      <span className="text-sm font-normal text-muted-foreground">Belum final</span>
                      <p className="text-primary-600">{formatPrice(basePrice)}</p>
                    </div>
                  ) : (
                    <span className="text-primary-600">{formatPrice(totalPayment)}</span>
                  )}
                </div>
                
                {/* Info: No admin fee for buyer */}
                {!isSellerView && (
                  <div className="p-2 rounded bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 text-xs">
                    <p className="flex items-center gap-1 font-medium text-primary-700 dark:text-primary-300">
                      <CheckCircle2 className="h-3 w-3" />
                      Tanpa Biaya Admin untuk Pembeli
                    </p>
                    <p className="text-primary-600 dark:text-primary-400 mt-1">
                      Kamu hanya membayar harga {isService ? "jasa" : "barang"}{!isService && " + ongkir"}. Biaya layanan {ADMIN_FEE_PERCENTAGE * 100}% ditanggung {isService ? "penyedia" : "penjual"}.
                    </p>
                  </div>
                )}

                {/* Net Income Info for Seller */}
                {isSellerView && (orderStatus === "waiting_confirmation" || orderStatus === "waiting_payment" || orderStatus === "processing" || orderStatus === "completed") && (
                  <div className="p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
                    <div className="flex items-center gap-2 text-primary-800 dark:text-primary-200">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-medium text-sm">Pendapatan Bersih (Setelah Potongan)</span>
                    </div>
                    <div className="flex items-baseline gap-2 mt-1">
                      <p className="text-xl font-bold text-primary-600">{formatPrice(netIncome)}</p>
                      <span className="text-xs text-muted-foreground">
                        dari {formatPrice(basePrice + shippingFee)}
                      </span>
                    </div>
                    <p className="text-xs text-primary-700 dark:text-primary-300 mt-1">
                      Sudah dipotong biaya admin {ADMIN_FEE_PERCENTAGE * 100}% ({formatPrice(adminFeeDeducted)})
                    </p>
                  </div>
                )}

                {/* Service Info */}
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-800 text-xs text-muted-foreground">
                  <p className="flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    Biaya admin {ADMIN_FEE_PERCENTAGE * 100}% dipotong dari pendapatan {isService ? "penyedia" : "penjual"}, bukan ditambah ke pembeli
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Customer View Actions */}
              {!isSellerView && (
                <>
                  {orderStatus === "completed" && (
                    <Button
                      className="w-full bg-primary-600 hover:bg-primary-700"
                      size="lg"
                      onClick={() => onNavigate("rating")}
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Beri Rating & Ulasan
                    </Button>
                  )}

                  {orderStatus === "processing" && (
                    <div className={`p-3 rounded-lg border ${isService ? "bg-purple-50 dark:bg-purple-900/20 border-purple-200" : "bg-purple-50 dark:bg-purple-900/20 border-purple-200"}`}>
                      <p className="text-sm text-purple-700 dark:text-purple-300">
                        {isService ? "Layanan sedang diproses" : "Pesanan sedang diproses oleh penjual"}
                      </p>
                    </div>
                  )}

                  {orderStatus === "completed" && (
                    <div className="p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200">
                      <p className="text-sm text-primary-700 dark:text-primary-300">
                        {isService ? "Layanan telah selesai" : "Pesanan telah selesai"}. Jangan lupa beri rating!
                      </p>
                    </div>
                  )}

                  {/* Cancel Button - shown for orders that can be cancelled */}
                  {(canCancelDirectly || needsCancelRequest) && orderStatus !== "cancelled" && (
                    <Button 
                      variant="outline" 
                      className="w-full text-red-600 border-red-300 hover:bg-red-50"
                      onClick={handleCancelClick}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      {canCancelDirectly ? "Batalkan Pesanan" : "Ajukan Pembatalan"}
                    </Button>
                  )}

                  <Button variant="outline" className="w-full">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Hubungi {isService ? "Penyedia" : "Penjual"}
                  </Button>
                </>
              )}

              {/* Seller View Actions */}
              {isSellerView && (
                <>
                  {(orderStatus === "waiting_confirmation" || orderStatus === "waiting_payment") && (
                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Menunggu {isService ? "pemesan" : "pembeli"} {isService ? "mengkonfirmasi penawaran" : "melakukan pembayaran"}
                      </p>
                      <p className="font-bold text-blue-600 mt-1">
                        Total: {formatPrice(totalPayment)}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Pendapatan bersih: {formatPrice(netIncome)}
                      </p>
                    </div>
                  )}

                  {/* Cancel Button for Seller */}
                  {(sellerCanCancelDirectly || sellerNeedsCancelRequest) && orderStatus !== "cancelled" && (
                    <Button 
                      variant="outline" 
                      className="w-full text-red-600 border-red-300 hover:bg-red-50"
                      onClick={() => {
                        if (sellerCanCancelDirectly) {
                          setShowCancelDialog(true);
                        } else if (sellerNeedsCancelRequest) {
                          setShowCancelRequestDialog(true);
                        }
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      {sellerCanCancelDirectly ? "Batalkan Pesanan" : "Ajukan Pembatalan"}
                    </Button>
                  )}

                  <Button variant="outline" className="w-full" onClick={() => onNavigate("chat")}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Chat {isService ? "Pemesan" : "Pembeli"}
                  </Button>
                </>
              )}
            </div>

            {/* Order Info */}
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">No. {isService ? "Booking" : "Pesanan"}</p>
                    <p className="font-medium font-mono">{order.orderNumber || order.id.toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tanggal</p>
                    <p className="font-medium">{order.createdAt}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pilih Metode Pembayaran</DialogTitle>
            <DialogDescription>
              Total pembayaran: <strong className="text-primary-600">{formatPrice(totalPayment)}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {[
              { id: "gopay", label: "GoPay", icon: "💚" },
              { id: "ovo", label: "OVO", icon: "💜" },
              { id: "dana", label: "DANA", icon: "💙" },
              { id: "bca", label: "Transfer BCA", icon: "🏦" },
              { id: "mandiri", label: "Transfer Mandiri", icon: "🏦" },
            ].map((method) => (
              <button
                key={method.id}
                className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                onClick={handlePayment}
              >
                <span className="text-xl">{method.icon}</span>
                <span className="font-medium">{method.label}</span>
                <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Price Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tolak Penawaran Harga?</AlertDialogTitle>
            <AlertDialogDescription>
              Jika kamu menolak, {isService ? "booking" : "pesanan"} ini akan dibatalkan. Kamu bisa membuat {isService ? "booking" : "pesanan"} baru atau nego langsung dengan {isService ? "penyedia" : "penjual"} via chat.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                setShowRejectDialog(false);
                setOrderStatus("cancelled");
              }}
            >
              Ya, Tolak
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Direct Cancel Dialog - for orders not yet confirmed (or for seller: buyer hasn't paid) */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Batalkan Pesanan?</AlertDialogTitle>
            <AlertDialogDescription>
              {isSellerView ? (
                <>
                  {isService ? "Booking" : "Pesanan"} ini{" "}
                  {["waiting_payment", "waiting_confirmation"].includes(orderStatus) 
                    ? "sudah dikonfirmasi, namun pembeli belum melakukan pembayaran." 
                    : "belum dikonfirmasi."}
                  <br /><br />
                  Pembatalan akan langsung diproses tanpa perlu persetujuan admin.
                </>
              ) : (
                <>
                  {isService ? "Booking" : "Pesanan"} ini belum dikonfirmasi oleh {isService ? "penyedia" : "penjual"}. 
                  Pembatalan akan langsung diproses tanpa perlu persetujuan.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Tidak Jadi</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDirectCancel}
            >
              Ya, Batalkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Request Dialog - for orders already confirmed and paid (requires admin approval) */}
      <Dialog open={showCancelRequestDialog} onOpenChange={setShowCancelRequestDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ajukan Pembatalan</DialogTitle>
            <DialogDescription>
              {isSellerView ? (
                <>
                  <strong className="text-red-600">Pembeli sudah melakukan pembayaran.</strong>
                  <br />
                  Pembatalan memerlukan persetujuan admin. Jika disetujui, dana akan dikembalikan ke pembeli.
                  Proses akan memakan waktu 1x24 jam.
                </>
              ) : (
                <>
                  {isService ? "Booking" : "Pesanan"} ini sudah dikonfirmasi oleh {isService ? "penyedia" : "penjual"}. 
                  Pembatalan memerlukan persetujuan admin dan akan diproses dalam 1x24 jam.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Reason Select */}
            <div className="space-y-2">
              <Label htmlFor="cancelReason">Alasan Pembatalan *</Label>
              <select
                id="cancelReason"
                className="w-full p-2 border rounded-lg bg-background"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              >
                <option value="">Pilih alasan...</option>
                {CANCEL_REASONS.map((reason) => (
                  <option key={reason.value} value={reason.value}>
                    {reason.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="cancelDescription">Penjelasan Detail *</Label>
              <Textarea
                id="cancelDescription"
                placeholder="Jelaskan alasan pembatalan Anda secara detail..."
                value={cancelDescription}
                onChange={(e) => setCancelDescription(e.target.value)}
                rows={4}
              />
            </div>

            {/* Info */}
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-700 dark:text-amber-300 flex items-start gap-2">
                <Info className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  {isSellerView 
                    ? "Jika permintaan pembatalan disetujui, dana akan dikembalikan ke pembeli."
                    : "Jika permintaan pembatalan disetujui, dana akan dikembalikan ke saldo kamu dalam 3-5 hari kerja."}
                </span>
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelRequestDialog(false)}>
              Batal
            </Button>
            <Button 
              className="bg-red-600 hover:bg-red-700"
              disabled={!cancelReason || !cancelDescription}
              onClick={handleCancelRequest}
            >
              Kirim Permintaan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
