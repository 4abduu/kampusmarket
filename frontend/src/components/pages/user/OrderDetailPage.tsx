"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Loader2 } from "lucide-react";
import {
  getOrderDetail,
  payOrder,
  confirmOrder,
  deliverOrder,
  completeOrder,
  cancelOrder,
  createCancelRequest,
  setShippingFee as apiSetShippingFee,
  offerPrice as apiOfferPrice,
  confirmPrice as apiConfirmPrice,
  confirmPaymentClient,
  type Order,
} from "@/lib/api/orders";
import { walletApi } from "@/lib/api/wallet";
import OrderHistoryTimeline from "@/components/pages/user/order-detail/OrderHistoryTimeline";
import {
  getOrderStatusConfig,
  getShippingMethodLabel,
} from "@/components/pages/user/order-detail/constants";
import OrderDetailDialogs from "@/components/pages/user/order-detail/OrderDetailDialogs";
import OrderDetailStatusSection from "@/components/pages/user/order-detail/OrderDetailStatusSection";
import OrderDetailProductCard from "@/components/pages/user/order-detail/OrderDetailProductCard";
import OrderDetailSummaryColumn from "@/components/pages/user/order-detail/OrderDetailSummaryColumn";
import type { PaymentMethod } from "@/components/pages/user/shared/PaymentMethodDialog";
import VerifyPinDialog from "@/components/pages/user/dashboard/VerifyPinDialog";
import SetPinDialog from "@/components/pages/user/dashboard/SetPinDialog";
import RatingPromptDialog from "@/components/pages/user/order-detail/RatingPromptDialog";
import { useToast } from "@/hooks/use-toast";

interface OrderDetailPageProps {
  onNavigate: (page: string, data?: any) => void;
  orderId?: string;
  currentUser?: any;
}

export default function OrderDetailPage({
  onNavigate,
  orderId,
  currentUser,
}: OrderDetailPageProps) {
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [expandedHistory, setExpandedHistory] = useState<string[]>([]);

  // Dialog states
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showCancelRequestDialog, setShowCancelRequestDialog] = useState(false);
  const [showCompleteConfirmDialog, setShowCompleteConfirmDialog] =
    useState(false);

  // Input states
  const [inputShippingFee, setInputShippingFee] = useState("");
  const [shippingNotes, setShippingNotes] = useState("");
  const [servicePriceInput, setServicePriceInput] = useState("");
  const [servicePriceNotes, setServicePriceNotes] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [cancelDescription, setCancelDescription] = useState("");
  const [otherReasonText, setOtherReasonText] = useState("");

  const [showVerifyPinDialog, setShowVerifyPinDialog] = useState(false);
  const [showSetPinDialog, setShowSetPinDialog] = useState(false);
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [pendingPaymentMethod, setPendingPaymentMethod] = useState<PaymentMethod | null>(null);
  // PIN verification handled in VerifyPinDialog during payment

  // Rating states
  const [showRatingPrompt, setShowRatingPrompt] = useState(false);
  const [hasShownRatingPrompt, setHasShownRatingPrompt] = useState(false);

  // Fetch order
  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    try {
      setLoading(true);
      const data = await getOrderDetail(orderId);
      setOrder(data);
    } catch (err: any) {
      toast({
        title: "Gagal memuat pesanan",
        description: err?.message || "Terjadi kesalahan",
        variant: "destructive",
      });
      // Redirect to not-found/home if unauthorized or not found
      onNavigate("/not-found");
    } finally {
      setLoading(false);
    }
  }, [orderId, toast, onNavigate]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // Auto trigger rating prompt
  useEffect(() => {
    if (!order || hasShownRatingPrompt) return;
    
    const isBuyerView = currentUser?.id === order?.buyer?.id;
    // (order as any).isRated is our proxy for hasRated. 
    // Ideally we check if reviewId exists or similar. The API should return `isRated` or `hasReview`.
    const isRated = (order as any).isRated || (order as any).hasReview;

    if (order.status === "completed" && isBuyerView && !isRated) {
      const timer = setTimeout(() => {
        setShowRatingPrompt(true);
        setHasShownRatingPrompt(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [order?.status, order?.buyer?.id, currentUser?.id, hasShownRatingPrompt]);

  // Listen to real-time order updates
  useEffect(() => {
    if (!orderId || !(window as any).Echo) return;

    const channelName = `order.${orderId}`;
    const channel = (window as any).Echo.private(channelName);

    channel.listen(".OrderUpdated", (e: any) => {
      console.log("[Midtrans] Real-time OrderUpdated event:", e);
      fetchOrder(); // Re-fetch to get latest status
    });

    return () => {
      channel.stopListening(".OrderUpdated");
      (window as any).Echo.leave(channelName);
    };
  }, [orderId, fetchOrder]);

  // Auto-detect buyer/seller view based on currentUser
  const isSellerView = currentUser?.id === order?.seller?.id;
  const isBuyerView = currentUser?.id === order?.buyer?.id;
  const isService = order?.productType === "jasa";

  // Define filtered reasons based on role and type
  const cancelReasons = useMemo(() => {
    const common = [{ value: "other", label: "Lainnya" }];

    const buyerCommon = [
      { value: "changed_mind", label: "Berubah pikiran" },
      { value: "found_better_price", label: "Menemukan harga lebih murah" },
      { value: "suspected_fraud", label: "Indikasi penipuan" },
    ];

    const sellerCommon = [
      { value: "buyer_not_responding", label: "Pembeli tidak merespon" },
      { value: "buyer_not_serious", label: "Pembeli tidak serius" },
    ];

    if (isSellerView) {
      if (isService) {
        return [
          {
            value: "service_unavailable",
            label: "Layanan tidak tersedia saat ini",
          },
          { value: "schedule_conflict", label: "Bentrok dengan jadwal lain" },
          {
            value: "brief_unclear_or_changed",
            label: "Brief tidak jelas / berubah-ubah",
          },
          {
            value: "out_of_scope_request",
            label: "Permintaan di luar jangkauan layanan",
          },
          ...sellerCommon,
          ...common,
        ];
      } else {
        return [
          { value: "out_of_stock", label: "Stok habis" },
          {
            value: "item_damaged_before_shipping",
            label: "Barang rusak sebelum dikirim",
          },
          { value: "address_unreachable", label: "Alamat tidak terjangkau" },
          {
            value: "shipping_operational_issue",
            label: "Kendala operasional pengiriman",
          },
          ...sellerCommon,
          ...common,
        ];
      }
    } else {
      // Buyer view
      if (isService) {
        return [
          ...buyerCommon,
          {
            value: "provider_communication_issue",
            label: "Komunikasi penyedia buruk",
          },
          {
            value: "timeline_not_feasible",
            label: "Waktu pengerjaan terlalu lama",
          },
          {
            value: "service_location_not_feasible",
            label: "Lokasi tidak memungkinkan",
          },
          ...common,
        ];
      } else {
        return [
          ...buyerCommon,
          { value: "seller_not_responding", label: "Penjual tidak merespon" },
          { value: "delivery_too_long", label: "Pengiriman terlalu lama" },
          { value: "shipping_fee_too_high", label: "Ongkir terlalu mahal" },
          {
            value: "shipping_method_mismatch",
            label: "Metode pengiriman tidak cocok",
          },
          ...common,
        ];
      }
    }
  }, [isSellerView, isService]);

  // Identify who cancelled the order
  const cancellerEntry = order?.history?.find(
    (h: any) => h.status === "cancelled",
  );
  const cancelledBy = useMemo(() => {
    if (!cancellerEntry) return null;
    const actorId = String(cancellerEntry.actorId || cancellerEntry.actor?.id);
    if (!actorId || actorId === "undefined") return "Sistem";
    if (actorId === String(order?.seller?.id))
      return isService ? "Penyedia" : "Penjual";
    if (actorId === String(order?.buyer?.id))
      return isService ? "Pemesan" : "Pembeli";
    return "Sistem";
  }, [cancellerEntry, order?.seller?.id, order?.buyer?.id, isService]);

  if (loading || !order) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  const orderStatus = order.status;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

  const formatDate = (dateString: string) =>
    new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));

  const formatShortDate = (dateString: string) =>
    new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));

  // Price calculations from API data
  const basePrice = order.offeredPrice || order.finalPrice;
  const shippingFee = order.shippingFee || 0;
  const totalPayment = order.totalPrice;
  const netIncome = order.netIncome;
  const adminFeeDeducted = order.adminFeeDeducted;

  const shippingMethod = order.shippingType || "delivery";
  const shippingMethodConfig = getShippingMethodLabel(
    shippingMethod,
    isService,
  );
  const statusConfig = getOrderStatusConfig(orderStatus);

  const serviceData = {
    serviceDate: order.serviceDate || "",
    serviceDeadline: order.serviceDeadline || "",
    serviceNotes: order.serviceNotes || "",
    notes: order.notes || "",
    serviceMethod: order.shippingType || "pickup",
  };

  // Has seller confirmed delivery/service?
  const sellerHasConfirmed = !!order.sellerConfirmedAt;

  // Determine if cash payment option is available (jasa with cod/home_service/onsite)
  const showCashOption = isService && ["cod", "home_service", "onsite"].includes(shippingMethod.toLowerCase());

  // Cancel logic
  const prePaidStatuses = [
    "pending",
    "waiting_price",
    "waiting_shipping_fee",
    "waiting_payment",
    "waiting_confirmation",
  ];
  const canCancelDirectly = prePaidStatuses.includes(orderStatus);
  const needsCancelRequest =
    ["processing", "ready_pickup"].includes(orderStatus) &&
    orderStatus !== "in_delivery";
  const sellerCanCancelDirectly = prePaidStatuses.includes(orderStatus);
  const sellerNeedsCancelRequest = ["processing", "ready_pickup"].includes(
    orderStatus,
  );

  const toggleHistoryExpand = (id: string) =>
    setExpandedHistory((prev) =>
      prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id],
    );

  // ── Action Handlers ──

  const handleConfirmOrder = async () => {
    setActionLoading(true);
    try {
      await confirmOrder(order.id);
      toast({ title: "Pesanan diterima!" });
      await fetchOrder();
    } catch (err: any) {
      toast({
        title: "Gagal",
        description: err?.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectOrder = async () => {
    setActionLoading(true);
    try {
      await cancelOrder(order.id, "Ditolak oleh penjual");
      toast({ title: "Pesanan ditolak" });
      await fetchOrder();
    } catch (err: any) {
      toast({
        title: "Gagal",
        description: err?.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleInputShippingFee = async () => {
    if (!inputShippingFee) return;
    setActionLoading(true);
    try {
      await apiSetShippingFee(
        order.id,
        parseInt(inputShippingFee),
        shippingNotes || undefined,
      );
      toast({ title: "Ongkir berhasil dikirim" });
      await fetchOrder();
      setInputShippingFee("");
      setShippingNotes("");
    } catch (err: any) {
      toast({
        title: "Gagal",
        description: err?.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleInputServicePrice = async () => {
    if (!servicePriceInput) return;
    setActionLoading(true);
    try {
      await apiOfferPrice(
        order.id,
        parseInt(servicePriceInput),
        servicePriceNotes || undefined,
      );
      toast({ title: "Penawaran harga terkirim" });
      await fetchOrder();
      setServicePriceInput("");
      setServicePriceNotes("");
    } catch (err: any) {
      toast({
        title: "Gagal",
        description: err?.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptPrice = () => setShowPaymentDialog(true);
  const handleRejectPrice = () => setShowRejectDialog(true);

  const handleConfirmRejectPrice = async () => {
    setActionLoading(true);
    try {
      await apiConfirmPrice(order.id, false);
      toast({ title: "Penawaran ditolak" });
      setShowRejectDialog(false);
      await fetchOrder();
    } catch (err: any) {
      toast({
        title: "Gagal",
        description: err?.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeliver = async () => {
    setActionLoading(true);
    try {
      await deliverOrder(order.id);
      toast({
        title: isService
          ? "Layanan dikonfirmasi selesai"
          : "Barang dikonfirmasi dikirim",
      });
      await fetchOrder();
    } catch (err: any) {
      toast({
        title: "Gagal",
        description: err?.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleBuyerConfirmComplete = async () => {
    setActionLoading(true);
    try {
      await completeOrder(order.id);
      toast({ title: "Pesanan dikonfirmasi selesai!" });
      setShowCompleteConfirmDialog(false);
      // Let the auto-trigger handle showing the rating prompt after refetch
      await fetchOrder();
    } catch (err: any) {
      toast({
        title: "Gagal",
        description: err?.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Midtrans Snap helper
  const openMidtransSnap = (token: string, paymentUuid: string) => {
    const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || "";
    const isSandbox =
      (import.meta.env.VITE_MIDTRANS_IS_SANDBOX || "true") === "true";
    const snapSrc = isSandbox
      ? "https://app.sandbox.midtrans.com/snap/snap.js"
      : "https://app.midtrans.com/snap/snap.js";

    const doSnap = () => {
      // Check if snap is loaded
      if (!(window as any).snap) {
        console.error("[Midtrans] Snap.js not loaded yet");
        toast({
          title: "Error",
          description:
            "Payment gateway belum siap. Silakan refresh dan coba lagi.",
          variant: "destructive",
        });
        setActionLoading(false);
        return;
      }

      console.log(
        "[Midtrans] Opening Snap with token:",
        token.substring(0, 20) + "...",
      );

      try {
        (window as any).snap.pay(token, {
          onSuccess: async (result: any) => {
            console.log("[Midtrans] Payment success:", result);
            toast({
              title: "Pembayaran berhasil!",
              description: "Mengonfirmasi pembayaran...",
            });
            try {
              if (paymentUuid) {
                await confirmPaymentClient(paymentUuid);
              }
            } catch (e) {
              console.error("Failed to confirm payment on frontend", e);
            }
            setActionLoading(false);
            fetchOrder();
          },
          onPending: async (result: any) => {
            console.log("[Midtrans] Payment pending:", result);
            toast({
              title: "⏳ Pembayaran pending",
              description: "Selesaikan pembayaran Anda untuk melanjutkan.",
            });
            try {
              if (paymentUuid) {
                await confirmPaymentClient(paymentUuid);
              }
            } catch (e) {
              console.error("Failed to confirm payment on frontend", e);
            }
            setActionLoading(false);
            fetchOrder();
          },
          onError: (result: any) => {
            console.error("[Midtrans] Payment error:", result);
            toast({
              title: "❌ Pembayaran gagal",
              description: "Terjadi kesalahan. Silakan coba lagi.",
              variant: "destructive",
            });
            setActionLoading(false);
            fetchOrder();
          },
          onClose: () => {
            console.log("[Midtrans] Payment popup closed by user");
            setActionLoading(false);
            fetchOrder();
          },
        });
      } catch (error) {
        console.error("[Midtrans] Error calling snap.pay:", error);
        toast({
          title: "Error",
          description: "Gagal membuka payment gateway. Coba lagi.",
          variant: "destructive",
        });
        setActionLoading(false);
      }
    };

    // Check if script already loaded
    const existingScript = document.querySelector(`script[src="${snapSrc}"]`);

    if (!existingScript) {
      console.log("[Midtrans] Loading Snap.js from:", snapSrc);
      console.log(
        "[Midtrans] Client Key:",
        clientKey ? clientKey.substring(0, 15) + "..." : "NOT SET!",
      );

      if (!clientKey) {
        toast({
          title: "❌ Configuration Error",
          description:
            "Midtrans client key tidak ditemukan. Hubungi administrator.",
          variant: "destructive",
        });
        setActionLoading(false);
        return;
      }

      const script = document.createElement("script");
      script.src = snapSrc;
      script.setAttribute("data-client-key", clientKey);
      script.type = "text/javascript";

      script.onerror = (error) => {
        console.error("[Midtrans] Failed to load Snap.js:", error);
        toast({
          title: "❌ Network Error",
          description:
            "Gagal memuat payment gateway. Periksa koneksi internet Anda.",
          variant: "destructive",
        });
        setActionLoading(false);
      };

      script.onload = () => {
        console.log("[Midtrans]  Snap.js loaded successfully");
        console.log(
          "[Midtrans] Window.snap available:",
          !!(window as any).snap,
        );

        // Small delay to ensure snap object is ready
        setTimeout(() => {
          doSnap();
        }, 200);
      };

      document.body.appendChild(script);
    } else {
      console.log("[Midtrans] Snap.js already loaded, using existing script");

      // Script exists, check if snap is ready
      if ((window as any).snap) {
        doSnap();
      } else {
        // Script loaded but snap not ready, wait a bit
        console.log("[Midtrans] Waiting for snap object to be ready...");
        setTimeout(() => {
          if ((window as any).snap) {
            doSnap();
          } else {
            console.error(
              "[Midtrans] Snap object still not available after wait",
            );
            toast({
              title: "Error",
              description:
                "Payment gateway tidak dapat dimuat. Refresh halaman dan coba lagi.",
              variant: "destructive",
            });
            setActionLoading(false);
          }
        }, 500);
      }
    }
  };

  const handlePayment = async (method: PaymentMethod, walletPin?: string) => {
    setShowPaymentDialog(false);
    setActionLoading(true);
    try {
      // For service waiting_confirmation → accept price first
      if (orderStatus === "waiting_confirmation") {
        await apiConfirmPrice(order.id, true);
        // Refresh to get updated status then pay
        const updated = await getOrderDetail(order.id);
        setOrder(updated);
        // If now waiting_payment and method is wallet, need to pay
        if (
          updated.status === "waiting_payment" ||
          updated.status === "waiting_shipping_fee"
        ) {
          if (updated.status === "waiting_shipping_fee") {
            // Needs shipping fee first — just accepted price, wait for seller
            toast({ title: "Harga diterima, menunggu ongkir dari penjual" });
            setActionLoading(false);
            return;
          }
        }
      }

      if (method === "midtrans") {
        const result = await payOrder(order.id, 'midtrans');
        const token = result?.snap_token || (result as any)?.token;
        const paymentUuid =
          result?.payment_uuid || (result as any)?.data?.payment_uuid;
        if (token) {
          openMidtransSnap(token, paymentUuid);
        } else {
          toast({
            title: "Gagal mendapatkan token pembayaran",
            variant: "destructive",
          });
        }
      } else if (method === "cash") {
        // Cash payment - langsung mark as processing
        await payOrder(order.id, 'cash');
        toast({ title: "Pembayaran cash diterima. Pesanan dalam proses!" });
        await fetchOrder();
      } else {
        // wallet payment
        const balance = currentUser?.walletBalance || 0;
        
        // For wallet payment, fetch real-time balance to ensure accuracy after top-up
        try {
          const balanceResponse = await walletApi.getBalance();
          if (balanceResponse.success) {
            const currentBalance = balanceResponse.data.balance;
            if (currentBalance < order.totalPrice) {
              toast({
                title: "Saldo tidak mencukupi",
                description: `Saldo Anda (${formatPrice(currentBalance)}) kurang dari total pembayaran (${formatPrice(order.totalPrice)})`,
                variant: "destructive",
              });
              setActionLoading(false);
              return;
            }
          }
        } catch (e) {
          console.warn("[OrderDetail] Failed to fetch balance, using cached value", e);
          if (balance < order.totalPrice) {
            toast({
              title: "Saldo tidak mencukupi",
              description: `Saldo Anda (${formatPrice(balance)}) kurang dari total pembayaran (${formatPrice(order.totalPrice)})`,
              variant: "destructive",
            });
            setActionLoading(false);
            return;
          }
        }

        await payOrder(order.id, 'wallet', walletPin);
        try {
          const balanceResponse = await walletApi.getBalance();
          const balance = balanceResponse.data.balance;
          window.dispatchEvent(
            new CustomEvent("wallet-balance-updated", {
              detail: { balance },
            }),
          );
        } catch (e) {
          console.warn("[OrderDetail] Failed to sync balance after wallet payment", e);
        }
        toast({ title: "Pembayaran berhasil!" });
        await fetchOrder();
      }
    } catch (err: any) {
      toast({
        title: "Gagal",
        description: err?.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Wallet PIN-aware payment handler
  const handlePaymentWithPin = async (method: PaymentMethod) => {
    if (method === 'wallet') {
      // Check if user has PIN
      try {
        const balanceRes = await walletApi.getBalance();
        if (!balanceRes.data.hasPin) {
          setShowPaymentDialog(false);
          setShowSetPinDialog(true);
          return;
        }
      } catch {
        // fallback: let backend validate
      }
      setPendingPaymentMethod('wallet');
      setShowPaymentDialog(false);
      setShowVerifyPinDialog(true);
    } else {
      handlePayment(method);
    }
  };

  const handleVerifyPinSuccess = (pin: string) => {
    setShowVerifyPinDialog(false);
    if (pendingPaymentMethod === 'wallet') {
      handlePayment('wallet', pin);
    }
    setPendingPaymentMethod(null);
  };

  const handleSetPinSuccess = async (pin: string) => {
    setIsSettingPin(true);
    try {
      await walletApi.setWalletPin(pin);
      setShowSetPinDialog(false);
      toast({ title: "PIN berhasil diatur" });
      // After setting PIN, show verify dialog for the payment
      setPendingPaymentMethod('wallet');
      setShowVerifyPinDialog(true);
    } catch (err: any) {
      toast({
        title: "Gagal mengatur PIN",
        description: err?.message,
        variant: "destructive",
      });
    } finally {
      setIsSettingPin(false);
    }
  };

  const handleDirectCancel = async () => {
    if (!cancelReason) return;
    setActionLoading(true);
    try {
      const finalReasonKey =
        cancelReason === "other" ? otherReasonText : cancelReason;
      const fullReason = cancelDescription
        ? `${finalReasonKey}: ${cancelDescription}`
        : finalReasonKey;
      await cancelOrder(order.id, fullReason);
      toast({ title: "Pesanan dibatalkan" });
      setShowCancelDialog(false);
      setCancelReason("");
      setCancelDescription("");
      setOtherReasonText("");
      await fetchOrder();
    } catch (err: any) {
      toast({
        title: "Gagal",
        description: err?.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!order) return;
    if (!cancelReason || !cancelDescription) return;
    if (cancelReason === "other" && !otherReasonText) return;

    setActionLoading(true);
    try {
      const description =
        cancelReason === "other"
          ? `${otherReasonText}: ${cancelDescription}`
          : cancelDescription;

      await createCancelRequest({
        orderId: order.id,
        reason: cancelReason,
        description,
      });

      toast({
        title: "Permohonan pembatalan dikirim",
        description: "Menunggu persetujuan admin",
      });
      setShowCancelRequestDialog(false);
      setCancelReason("");
      setCancelDescription("");
      setOtherReasonText("");
    } catch (err: any) {
      toast({
        title: "Gagal mengirim permohonan",
        description: err?.message || "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelClick = () => {
    if (canCancelDirectly) setShowCancelDialog(true);
    else if (needsCancelRequest) setShowCancelRequestDialog(true);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate("orders")}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">
              Detail {isService ? "Booking" : "Pesanan"}
            </h1>
            <p className="text-muted-foreground font-mono text-sm">
              {order.orderNumber}
            </p>
          </div>
          <div
            className={`px-3 py-1.5 rounded-full ${statusConfig.bgColor} border ${statusConfig.borderColor}`}
          >
            <span
              className={`font-medium ${statusConfig.color} flex items-center gap-1`}
            >
              <statusConfig.icon
                className={`h-4 w-4 ${orderStatus === "processing" ? "animate-spin" : ""}`}
              />
              {statusConfig.label}
            </span>
          </div>
        </div>


        <OrderDetailStatusSection
          isService={isService}
          isSellerView={isSellerView}
          orderStatus={orderStatus}
          serviceData={serviceData}
          servicePriceInput={servicePriceInput}
          setServicePriceInput={setServicePriceInput}
          servicePriceNotes={servicePriceNotes}
          setServicePriceNotes={setServicePriceNotes}
          handleInputServicePrice={handleInputServicePrice}
          formatPrice={formatPrice}
          basePrice={basePrice}
          priceOfferNotes={order.priceOfferNotes || ""}
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
          handleDeliver={handleDeliver}
          handleConfirmOrder={handleConfirmOrder}
          handleRejectOrder={handleRejectOrder}
          sellerHasConfirmed={sellerHasConfirmed}
          cancelReason={order.cancelReason}
          handleBuyerConfirmComplete={() => setShowCompleteConfirmDialog(true)}
          autoConfirmDeadline={order.autoConfirmDeadline || null}
          actionLoading={actionLoading}
          shippingAddress={order.shippingAddress}
          cancelledBy={cancelledBy}
        />

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <OrderHistoryTimeline
              isService={isService}
              orderHistory={order.history || []}
              expandedHistory={expandedHistory}
              toggleHistoryExpand={toggleHistoryExpand}
              getStatusConfig={getOrderStatusConfig}
              formatShortDate={formatShortDate}
              sellerId={order.seller?.id}
              buyerId={order.buyer?.id}
            />
            <OrderDetailProductCard
              isService={isService}
              isSellerView={isSellerView}
              order={order}
              offeredPrice={order.offeredPrice || null}
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
            productId={order.product?.id || order.product?.uuid}
            buyerId={order.buyer?.id || order.buyer?.uuid}
            partnerName={isSellerView ? order.buyer?.name : order.seller?.name}
            partnerPhone={isSellerView ? order.buyer?.phone : order.seller?.phone}
            productTitle={order.productTitle || order.product?.title || "Produk/Jasa"}
            netIncome={netIncome}
            adminFeeDeducted={adminFeeDeducted}
            formatPrice={formatPrice}
            adminFeePercentage={0.05}
            canCancelDirectly={canCancelDirectly && isBuyerView}
            needsCancelRequest={needsCancelRequest && isBuyerView}
            sellerCanCancelDirectly={sellerCanCancelDirectly && isSellerView}
            sellerNeedsCancelRequest={sellerNeedsCancelRequest && isSellerView}
            handleCancelClick={handleCancelClick}
            openSellerCancelDialog={() => {
              if (sellerCanCancelDirectly) setShowCancelDialog(true);
              else if (sellerNeedsCancelRequest)
                setShowCancelRequestDialog(true);
            }}
            orderNumber={order.orderNumber}
            createdAt={formatDate(order.createdAt)}
            orderCompleted={orderStatus === "completed"}
            onRating={() => {
              const isRated = (order as any).isRated || (order as any).hasReview;
              if (isRated) {
                // If already rated, go to product detail where rating is shown
                onNavigate("product", order.product?.id || order.product?.uuid);
              } else {
                setShowRatingPrompt(true);
              }
            }}
            isRated={(order as any).isRated || (order as any).hasReview}
          />
        </div>
      </div>

      <OrderDetailDialogs
        showPaymentDialog={showPaymentDialog}
        setShowPaymentDialog={setShowPaymentDialog}
        totalPayment={totalPayment}
        walletBalance={currentUser?.walletBalance}
        formatPrice={formatPrice}
        handlePayment={handlePaymentWithPin}
        showCashOption={showCashOption}
        showRejectDialog={showRejectDialog}
        setShowRejectDialog={setShowRejectDialog}
        isService={isService}
        onConfirmRejectPrice={handleConfirmRejectPrice}
        showCancelDialog={showCancelDialog}
        setShowCancelDialog={setShowCancelDialog}
        isSellerView={isSellerView}
        handleDirectCancel={handleDirectCancel}
        showCancelRequestDialog={showCancelRequestDialog}
        setShowCancelRequestDialog={setShowCancelRequestDialog}
        cancelReason={cancelReason}
        setCancelReason={setCancelReason}
        cancelDescription={cancelDescription}
        setCancelDescription={setCancelDescription}
        cancelReasons={cancelReasons}
        handleCancelRequest={handleCancelRequest}
        showCompleteConfirmDialog={showCompleteConfirmDialog}
        setShowCompleteConfirmDialog={setShowCompleteConfirmDialog}
        handleBuyerConfirmComplete={handleBuyerConfirmComplete}
        actionLoading={actionLoading}
        otherReasonText={otherReasonText}
        setOtherReasonText={setOtherReasonText}
      />

      <VerifyPinDialog
        open={showVerifyPinDialog}
        onOpenChange={setShowVerifyPinDialog}
        onSuccess={handleVerifyPinSuccess}
        isLoading={actionLoading}
        description="Masukkan 6 digit PIN Dompet untuk memverifikasi pembayaran."
      />

      <SetPinDialog
        open={showSetPinDialog}
        onOpenChange={setShowSetPinDialog}
        onSuccess={handleSetPinSuccess}
        isLoading={isSettingPin}
      />

      <RatingPromptDialog
        open={showRatingPrompt}
        onOpenChange={setShowRatingPrompt}
        onSubmit={(rating) => {
          // Pass the selected rating to the rating page
          // Assuming `onNavigate` supports passing state via the second argument
          onNavigate("rating", { orderId: order.id, initialRating: rating });
        }}
        productTitle={order.productTitle || order.product?.title || "Produk"}
        isService={isService}
      />
    </div>
  );
}
