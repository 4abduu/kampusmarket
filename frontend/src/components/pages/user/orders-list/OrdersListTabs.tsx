import { CheckCircle2, Clock, Package, Truck, Ban } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OrdersListCard from "@/components/pages/user/orders-list/OrdersListCard";
import OrdersListEmptyState from "@/components/pages/user/orders-list/OrdersListEmptyState";
import { filterOrdersByTab } from "@/components/pages/user/orders-list/ordersList.utils";
import type {
  OrderListItem,
  OrdersListPageNavigate,
  OrdersTab,
  OrdersViewMode,
} from "@/components/pages/user/orders-list/ordersList.types";
import { type User } from "@/lib/mock-data";

interface OrdersListTabsProps {
  orders: OrderListItem[];
  viewMode: OrdersViewMode;
  onNavigate: OrdersListPageNavigate;
  currentUser?: User | null;
}

const tabs: Array<{ value: OrdersTab; label: string; emptyMessage: string; emptyIcon: typeof Package }> = [
  { value: "all", label: "Semua", emptyMessage: "", emptyIcon: Package },
  { value: "pending", label: "Pending", emptyMessage: "Tidak ada pesanan pending", emptyIcon: Clock },
  { value: "processing", label: "Diproses", emptyMessage: "Tidak ada pesanan yang sedang diproses", emptyIcon: Package },
  { value: "shipping", label: "Dikirim", emptyMessage: "Tidak ada pesanan dalam pengiriman", emptyIcon: Truck },
  { value: "completed", label: "Selesai", emptyMessage: "Belum ada pesanan selesai", emptyIcon: CheckCircle2 },
  { value: "cancelled", label: "Dibatalkan", emptyMessage: "Tidak ada pesanan dibatalkan", emptyIcon: Ban },
];

export default function OrdersListTabs({ orders, viewMode, onNavigate, currentUser }: OrdersListTabsProps) {


  return (
    <Tabs defaultValue="all">
      <TabsList className="mb-6 flex-wrap h-auto">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => {
        const filteredOrders = filterOrdersByTab(orders, tab.value);

        return (
          <TabsContent key={tab.value} value={tab.value}>
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <OrdersListCard key={order.id} order={order} viewMode={viewMode} onNavigate={onNavigate} currentUser={currentUser} />
              ))}

              {filteredOrders.length === 0 && (
                <OrdersListEmptyState
                  icon={tab.emptyIcon}
                  message={
                    tab.value === "all"
                      ? `Belum ada pesanan sebagai ${viewMode === "buyer" ? "pembeli" : "penjual"}`
                      : tab.emptyMessage
                  }
                />
              )}
            </div>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
