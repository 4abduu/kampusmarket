import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, CheckCircle2, Clock, Package } from "lucide-react";
import type { Order } from "@/lib/mock-data";

interface RatingOrderCardProps {
  order: Order;
  isSelected: boolean;
  onSelect: () => void;
  formatPrice: (price: number) => string;
}

export default function RatingOrderCard({ order, isSelected, onSelect, formatPrice }: RatingOrderCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected
          ? "ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-950/20"
          : "hover:border-primary-300"
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className={`w-16 h-16 rounded-lg flex items-center justify-center shrink-0 overflow-hidden ${order.productType === "jasa" ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-slate-100 dark:bg-slate-800"}`}>
            {order.productType === "jasa" ? (
              <Briefcase className="h-8 w-8 text-emerald-600/70" />
            ) : order.product.images[0] ? (
              <img src={order.product.images[0]} alt={order.productTitle} className="w-full h-full object-cover" />
            ) : (
              <Package className="h-8 w-8 text-muted-foreground/30" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium truncate">{order.productTitle}</p>
              {isSelected && <CheckCircle2 className="h-5 w-5 text-primary-500 shrink-0" />}
            </div>
            <p className="text-sm text-muted-foreground">{formatPrice(order.finalPrice)}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {order.productType === "barang" ? "Barang" : "Jasa"}
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDate(order.completedAt || order.createdAt)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              dari <span className="font-medium">{order.seller.name}</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
