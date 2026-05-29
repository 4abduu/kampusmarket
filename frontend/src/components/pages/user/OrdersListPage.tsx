"use client";

import { useEffect, useState, useCallback } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import OrdersListStatusLegend from "@/components/pages/user/orders-list/OrdersListStatusLegend";
import OrdersListTabs from "@/components/pages/user/orders-list/OrdersListTabs";
import { getUserOrders, type Order } from "@/lib/api/orders";
import { getMyProducts } from "@/lib/api/products";
import type { OrdersListPageNavigate, OrdersViewMode } from "@/components/pages/user/orders-list/ordersList.types";
import { useToast } from "@/hooks/use-toast";

interface OrdersListPageProps {
  onNavigate: OrdersListPageNavigate;
}

export default function OrdersListPage({ onNavigate }: OrdersListPageProps) {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<OrdersViewMode>("buyer");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSeller, setIsSeller] = useState(false);

  const checkSellerStatus = useCallback(async () => {
    try {
      const response = await getMyProducts({ page: 1, per_page: 1 });
      setIsSeller(response.meta.total > 0);
    } catch (err) {
      console.error("Failed to check seller status:", err);
      setIsSeller(false);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getUserOrders(undefined, viewMode, 50, 1);
      
      // Defensive check: API might return {data: [], meta: {}} or just []
      const ordersData = (response as any)?.data || (Array.isArray(response) ? response : []);
      setOrders(ordersData);

    } catch (err: any) {
      toast({
        title: "Gagal memuat pesanan",
        description: err?.message || "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [viewMode, toast]);

  useEffect(() => {
    checkSellerStatus();
  }, [checkSellerStatus]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4 py-8">
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

          {isSeller && (
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  viewMode === "buyer"
                    ? "bg-white dark:bg-slate-700 shadow-sm text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setViewMode("buyer")}
              >
                Pembeli
              </button>
              <button
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  viewMode === "seller"
                    ? "bg-white dark:bg-slate-700 shadow-sm text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setViewMode("seller")}
              >
                Penjual
              </button>
            </div>
          )}
        </div>

        <OrdersListStatusLegend />

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <OrdersListTabs orders={orders} viewMode={viewMode} onNavigate={onNavigate} />
        )}
      </div>
    </div>
  );
}
