import {
  AlertCircle,
  Ban,
  CheckCircle2,
  Clock,
  DollarSign,
  Package,
  Truck,
  Wallet,
} from "lucide-react";
import type {
  LucideIcon,
  OrderListItem,
  OrdersTab,
  OrdersViewMode,
} from "@/components/pages/user/orders-list/ordersList.types";

interface StatusConfig {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
  icon: LucideIcon;
  color: string;
}

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};

export const getStatusConfig = (status: string): StatusConfig => {
  const configs: Record<string, StatusConfig> = {
    pending: {
      label: "Menunggu Konfirmasi",
      variant: "outline",
      icon: Clock,
      color: "text-amber-600",
    },
    waiting_price: {
      label: "Menunggu Harga",
      variant: "outline",
      icon: DollarSign,
      color: "text-orange-600",
    },
    waiting_confirmation: {
      label: "Menunggu Konfirmasi",
      variant: "outline",
      icon: AlertCircle,
      color: "text-blue-600",
    },
    waiting_shipping_fee: {
      label: "Menunggu Ongkir",
      variant: "outline",
      icon: Truck,
      color: "text-blue-600",
    },
    waiting_payment: {
      label: "Menunggu Pembayaran",
      variant: "outline",
      icon: Wallet,
      color: "text-primary-600",
    },
    processing: {
      label: "Diproses",
      variant: "default",
      icon: Package,
      color: "text-purple-600",
    },
    in_delivery: {
      label: "Dalam Pengiriman",
      variant: "default",
      icon: Truck,
      color: "text-secondary-600",
    },
    ready_pickup: {
      label: "Siap Diambil",
      variant: "default",
      icon: Package,
      color: "text-cyan-600",
    },
    completed: {
      label: "Selesai",
      variant: "default",
      icon: CheckCircle2,
      color: "text-primary-600",
    },
    cancelled: {
      label: "Dibatalkan",
      variant: "destructive",
      icon: Ban,
      color: "text-red-600",
    },
  };

  return configs[status] || configs.pending;
};

export const getOrdersByViewMode = (orders: OrderListItem[], viewMode: OrdersViewMode) => {
  const buyerOrders = orders.filter((order) => order.buyer.id === "1");
  const sellerOrders = orders.filter((order) => order.seller.id === "1");
  return viewMode === "buyer" ? buyerOrders : sellerOrders;
};

export const filterOrdersByTab = (orders: OrderListItem[], tab: OrdersTab) => {
  if (tab === "all") return orders;

  if (tab === "pending") {
    return orders.filter((order) =>
      ["pending", "waiting_price", "waiting_confirmation", "waiting_shipping_fee", "waiting_payment"].includes(order.status),
    );
  }

  if (tab === "processing") {
    return orders.filter((order) => order.status === "processing" || order.status === "ready_pickup");
  }

  if (tab === "shipping") {
    return orders.filter((order) => order.status === "in_delivery");
  }

  if (tab === "completed") {
    return orders.filter((order) => order.status === "completed");
  }

  return [];
};
