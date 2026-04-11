import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/components/pages/user/cart/cart.utils";

interface CartSummaryCardProps {
  selectedCount: number;
  subtotal: number;
  onNavigate: (page: string) => void;
}

export default function CartSummaryCard({ selectedCount, subtotal, onNavigate }: CartSummaryCardProps) {
  return (
    <Card className="sticky top-20">
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

        <Button
          className="w-full bg-primary-600 hover:bg-primary-700"
          size="lg"
          disabled={selectedCount === 0}
          onClick={() => onNavigate("checkout")}
        >
          Checkout ({selectedCount})
        </Button>

        <Button variant="outline" className="w-full" onClick={() => onNavigate("catalog")}>
          Lanjut Belanja
        </Button>
      </CardContent>
    </Card>
  );
}
