import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Briefcase } from "lucide-react";
import type { ExtractedOrderData } from "../hooks/useCheckoutSuccessful";

interface CheckoutSuccessOrderInfoProps {
  orderData: ExtractedOrderData;
}

export default function CheckoutSuccessOrderInfo({ orderData }: CheckoutSuccessOrderInfoProps) {
  return (
    <Card className="mb-4 sm:mb-6">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            {orderData.product.images && orderData.product.images.length > 0 ? (
              <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                <img src={orderData.product.images[0]} alt={orderData.product.title} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className={`p-3 rounded-full shrink-0 ${orderData.isService ? "bg-purple-100 dark:bg-purple-900/30" : "bg-primary-100 dark:bg-primary-900/30"}`}>
                {orderData.isService ? (
                  <Briefcase className="h-5 w-5 text-purple-600" />
                ) : (
                  <Package className="h-5 w-5 text-primary-600" />
                )}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-semibold text-sm sm:text-base line-clamp-2">{orderData.isService ? "Booking" : "Pesanan"} {orderData.product.title}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">#{orderData.orderId}</p>
            </div>
          </div>
          <div className="shrink-0">
            <Badge variant="outline" className="bg-primary-50 text-primary-700 border-primary-200 whitespace-nowrap">
              Menunggu Konfirmasi
            </Badge>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          <p>{orderData.orderDate || "-"}</p>
        </div>
      </CardContent>
    </Card>
  );
}
