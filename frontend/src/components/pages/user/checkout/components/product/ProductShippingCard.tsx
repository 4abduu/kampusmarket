import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Package, CreditCard } from "lucide-react";
import type { ExtractedOrderData } from "../../hooks/useCheckoutSuccessful";
import { formatPrice } from "../../hooks/useCheckoutSuccessful";

interface ProductShippingCardProps {
  orderData: ExtractedOrderData;
}

export default function ProductShippingCard({ orderData }: ProductShippingCardProps) {
  return (
    <Card className="mb-4 sm:mb-6">
      <CardContent className="p-4 sm:p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Package className="h-5 w-5 text-primary-600" />
          Detail Pesanan
        </h2>

        <div className="flex gap-4">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
            <Package className="h-8 w-8 text-muted-foreground/30" />
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
              Penjual: {orderData.product.seller.name}
            </p>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Harga Barang</span>
            <span>{formatPrice(orderData.subtotal || 0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ongkos Kirim</span>
            <span className="text-primary-600">
              {(orderData.shippingFee || 0) === 0
                ? "Gratis"
                : formatPrice(orderData.shippingFee || 0)}
            </span>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="flex justify-between font-bold text-lg">
          <span>Total Pembayaran</span>
          <span className="text-primary-600">
            {formatPrice(orderData.total || 0)}
          </span>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              Metode Pengiriman: {orderData.shippingMethod}
            </span>
          </div>

          {orderData.shippingMethod === "COD" && (
            <p className="text-xs text-muted-foreground mt-1">
              Bayar tunai saat bertemu dengan penjual
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
