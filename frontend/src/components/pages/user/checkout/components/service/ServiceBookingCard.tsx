import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Briefcase, CreditCard, Star } from "lucide-react";
import type { ExtractedOrderData } from "../../hooks/useCheckoutSuccessful";
import { formatPrice, getServiceMethodLabel } from "../../hooks/useCheckoutSuccessful";

interface ServiceBookingCardProps {
  orderData: ExtractedOrderData;
}

export default function ServiceBookingCard({ orderData }: ServiceBookingCardProps) {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-purple-600" />
          Detail Booking
        </h2>

        <div className="flex gap-4">
          <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center shrink-0">
            <Briefcase className="h-8 w-8 text-purple-600/60" />
          </div>
          <div className="flex-1">
            <p className="font-medium">
              {orderData.product.title}
            </p>
            <p className="text-sm text-muted-foreground">
              {orderData.product.quantity}x •{" "}
              {formatPrice(orderData.product.price || 0)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Penyedia: {orderData.product.seller.name}
            </p>
            {orderData.product.seller.rating !== undefined && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                <span>Rating: {orderData.product.seller.rating.toFixed(1)}</span>
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span>• {orderData.product.seller.totalOrders} pesanan</span>
              </div>
            )}
          </div>
        </div>

        <Separator className="my-4" />

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Harga Jasa</span>
            <span>{formatPrice(orderData.subtotal || 0)}</span>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="flex justify-between font-bold text-lg">
          <span>Total Pembayaran</span>
          <span className="text-purple-600">
            {formatPrice(orderData.total || 0)}
          </span>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              Metode Layanan: {orderData.serviceMethod ? getServiceMethodLabel(orderData.serviceMethod).label : orderData.shippingMethod}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
