import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/components/pages/user/cart/cart.utils";

const MAX_CHECKOUT_ITEMS = 5;

interface CartSummaryCardProps {
  selectedCount: number;
  subtotal: number;
  onCheckout: () => void;
  onContinueShopping: () => void;
}

export default function CartSummaryCard({
  selectedCount,
  subtotal,
  onCheckout,
  onContinueShopping,
}: CartSummaryCardProps) {
  const isOverLimit = selectedCount > MAX_CHECKOUT_ITEMS;

  return (
    <>
      {/* Desktop Card */}
      <Card className="hidden lg:block sticky top-20">
        <CardHeader>
          <CardTitle className="text-lg">Ringkasan Belanja</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Harga ({selectedCount} barang)</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ongkos Kirim</span>
              <span className="text-muted-foreground">Dihitung saat checkout</span>
            </div>
          </div>

          <Separator />

          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span className="text-primary-600">{formatPrice(subtotal)}</span>
          </div>

          {isOverLimit && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Maksimal {MAX_CHECKOUT_ITEMS} barang per checkout. Kurangi pilihan barang untuk melanjutkan.
              </p>
            </div>
          )}

          <Button
            className="w-full bg-primary-600 hover:bg-primary-700"
            size="lg"
            disabled={selectedCount === 0 || isOverLimit}
            onClick={onCheckout}
          >
            Checkout ({selectedCount})
          </Button>

          <Button variant="outline" className="w-full" onClick={onContinueShopping}>
            Lanjut Belanja
          </Button>
        </CardContent>
      </Card>

      {/* Mobile Sticky Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 pb-safe">
        {isOverLimit && (
          <div className="bg-amber-50 dark:bg-amber-900/20 px-4 py-2 flex items-center gap-2 border-b border-amber-200 dark:border-amber-800">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <p className="text-[10px] text-amber-700 dark:text-amber-300">
              Maks. {MAX_CHECKOUT_ITEMS} barang per checkout.
            </p>
          </div>
        )}
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Total Belanja</p>
            <p className="font-bold text-primary-600 text-lg leading-none mt-1">{formatPrice(subtotal)}</p>
          </div>
          <Button
            className="bg-primary-600 hover:bg-primary-700 px-6 rounded-full"
            disabled={selectedCount === 0 || isOverLimit}
            onClick={onCheckout}
          >
            Checkout ({selectedCount})
          </Button>
        </div>
      </div>
    </>
  );
}
