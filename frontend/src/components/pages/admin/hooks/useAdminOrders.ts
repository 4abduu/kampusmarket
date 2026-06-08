import { useState, useRef, useMemo, useEffect } from "react";
import type { Order } from "@/lib/mock-data";
import { adminOrdersApi } from "@/lib/api/admin";
import { useAdminDataMapping } from "./useAdminDataMapping";

const ITEMS_PER_PAGE = 10;

interface OrdersProps {
  isResourceLoaded: (key: string) => boolean;
  markResourceLoaded: (key: string) => void;
  fetchCategoriesResource: () => Promise<boolean>;
}

export function useAdminOrders({
  isResourceLoaded,
  markResourceLoaded,
  fetchCategoriesResource,
}: OrdersProps) {
  const { mapOrders } = useAdminDataMapping();

  const [orders, setOrders] = useState<Order[]>([]);
  const [orderSearchTerm, setOrderSearchTerm] = useState("");
  const [debouncedOrderSearch, setDebouncedOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<
    | "all"
    | "pending"
    | "processing"
    | "ready_pickup"
    | "in_delivery"
    | "completed"
    | "cancelled"
  >("all");
  const [orderTypeFilter, setOrderTypeFilter] = useState<"all" | "barang" | "jasa">("all");
  const [orderCategoryFilter, setOrderCategoryFilter] = useState<string>("all");
  const [orderPaymentFilter, setOrderPaymentFilter] = useState<
    "all" | "pending" | "paid" | "failed" | "refunded"
  >("all");

  const [orderPage, setOrderPage] = useState(1);
  const [orderTotalItems, setOrderTotalItems] = useState(0);
  const [orderTotalPages, setOrderTotalPages] = useState(1);

  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  const orderRequestRef = useRef(0);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedOrderSearch(orderSearchTerm);
      setOrderPage(1);
    }, 400);
    return () => {
      clearTimeout(handler);
    };
  }, [orderSearchTerm]);

  const loadOrdersData = async () => {
    const requestId = ++orderRequestRef.current;
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const params: Parameters<typeof adminOrdersApi.getOrders>[0] = {
        per_page: ITEMS_PER_PAGE,
        page: orderPage,
      };

      if (debouncedOrderSearch.trim()) params.search = debouncedOrderSearch.trim();
      if (orderStatusFilter !== "all") params.status = orderStatusFilter;
      if (orderTypeFilter !== "all") params.type = orderTypeFilter;
      if (orderCategoryFilter !== "all") params.category_id = orderCategoryFilter;
      if (orderPaymentFilter !== "all") params.payment_status = orderPaymentFilter;

      const res = await adminOrdersApi.getOrders(params);
      if (requestId !== orderRequestRef.current) return;
      if (res?.data && Array.isArray(res.data)) {
        setOrders(mapOrders(res.data));
      }
      setOrderTotalItems(res?.meta?.total ?? 0);
      setOrderTotalPages(res?.meta?.last_page ?? 1);
      markResourceLoaded("orders");

      if (!isResourceLoaded("categories")) {
        await fetchCategoriesResource();
      }
    } catch (err) {
      if (requestId !== orderRequestRef.current) return;
      const msg = err instanceof Error ? err.message : "Gagal memuat data transaksi";
      setOrdersError(msg);
      console.error("Failed to load orders data:", err);
    } finally {
      if (requestId === orderRequestRef.current) {
        setOrdersLoading(false);
      }
    }
  };

  const paginatedOrders = useMemo(() => orders, [orders]);

  return {
    orders,
    setOrders,
    orderSearchTerm,
    setOrderSearchTerm,
    debouncedOrderSearch,
    orderStatusFilter,
    setOrderStatusFilter,
    orderTypeFilter,
    setOrderTypeFilter,
    orderCategoryFilter,
    setOrderCategoryFilter,
    orderPaymentFilter,
    setOrderPaymentFilter,
    orderPage,
    setOrderPage,
    orderTotalItems,
    orderTotalPages,
    ordersLoading,
    ordersError,
    loadOrdersData,
    paginatedOrders,
  };
}
