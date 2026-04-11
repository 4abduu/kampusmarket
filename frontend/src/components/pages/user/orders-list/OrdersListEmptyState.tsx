import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "@/components/pages/user/orders-list/ordersList.types";

interface OrdersListEmptyStateProps {
  icon: LucideIcon;
  message: string;
}

export default function OrdersListEmptyState({ icon: Icon, message }: OrdersListEmptyStateProps) {
  return (
    <Card>
      <CardContent className="p-12 text-center">
        <Icon className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}
