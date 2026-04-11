"use client";

import { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockOrders } from "@/lib/mock-data";
import OrdersListStatusLegend from "@/components/pages/user/orders-list/OrdersListStatusLegend";
import OrdersListTabs from "@/components/pages/user/orders-list/OrdersListTabs";
import { getOrdersByViewMode } from "@/components/pages/user/orders-list/ordersList.utils";
import type {
  OrdersListPageNavigate,
  OrdersViewMode,
} from "@/components/pages/user/orders-list/ordersList.types";

interface OrdersListPageProps {
  onNavigate: OrdersListPageNavigate;
}

export default function OrdersListPage({ onNavigate }: OrdersListPageProps) {
  const [viewMode, setViewMode] = useState<OrdersViewMode>("buyer");

  const displayedOrders = useMemo(() => {
    return getOrdersByViewMode(mockOrders, viewMode);
  }, [viewMode]);

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

          <div className="flex gap-2">
            <Button size="sm" variant={viewMode === "buyer" ? "default" : "outline"} onClick={() => setViewMode("buyer")}>
              {viewMode === "buyer" ? "Pembeli" : "Lihat sebagai Pembeli"}
            </Button>
            <Button size="sm" variant={viewMode === "seller" ? "default" : "outline"} onClick={() => setViewMode("seller")}>
              {viewMode === "seller" ? "Penjual" : "Lihat sebagai Penjual"}
            </Button>
          </div>
        </div>

        <OrdersListStatusLegend />
        <OrdersListTabs orders={displayedOrders} viewMode={viewMode} onNavigate={onNavigate} />
      </div>
    </div>
  );
}
