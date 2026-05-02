import type { ComponentType, SVGProps } from "react";
import type { Order } from "@/lib/api/orders";

export type LucideIcon = ComponentType<SVGProps<SVGSVGElement>>;

export type OrdersViewMode = "buyer" | "seller";

export type OrdersTab = "all" | "pending" | "processing" | "shipping" | "completed" | "cancelled";

export type OrderListItem = Order;

export interface OrdersListPageNavigate {
  (page: string, orderId?: string): void;
}
