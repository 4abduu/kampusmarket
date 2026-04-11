import type { ComponentType, SVGProps } from "react";
import { mockOrders } from "@/lib/mock-data";

export type LucideIcon = ComponentType<SVGProps<SVGSVGElement>>;

export type OrdersViewMode = "buyer" | "seller";

export type OrdersTab = "all" | "pending" | "processing" | "shipping" | "completed";

export type OrderListItem = (typeof mockOrders)[number];

export interface OrdersListPageNavigate {
  (page: string, orderId?: string): void;
}
