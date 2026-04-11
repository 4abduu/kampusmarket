import { CheckCircle2, Clock, Package, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

interface OrdersListTabsProps {
  orders: OrderListItem[];
  viewMode: OrdersViewMode;
  onNavigate: OrdersListPageNavigate;
}

const tabs: Array<{ value: OrdersTab; label: string; emptyMessage: string; emptyIcon: typeof Package }> = [
  { value: "all", label: "Semua", emptyMessage: "", emptyIcon: Package },
  { value: "pending", label: "Pending", emptyMessage: "Tidak ada pesanan pending", emptyIcon: Clock },
  { value: "processing", label: "Diproses", emptyMessage: "Tidak ada pesanan yang sedang diproses", emptyIcon: Package },
  { value: "shipping", label: "Dikirim", emptyMessage: "Tidak ada pesanan dalam pengiriman", emptyIcon: Truck },
  { value: "completed", label: "Selesai", emptyMessage: "Belum ada pesanan selesai", emptyIcon: CheckCircle2 },
];

export default function OrdersListTabs({ orders, viewMode, onNavigate }: OrdersListTabsProps) {
  const pendingCount = filterOrdersByTab(orders, "pending").length;

  return (
    <Tabs defaultValue="all">
      <TabsList className="mb-6 flex-wrap h-auto">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
            {tab.value === "pending" && pendingCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => {
        const filteredOrders = filterOrdersByTab(orders, tab.value);

        return (
          <TabsContent key={tab.value} value={tab.value}>
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <OrdersListCard key={order.id} order={order} viewMode={viewMode} onNavigate={onNavigate} />
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
