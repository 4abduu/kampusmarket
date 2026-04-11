import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CartHeaderProps } from "@/components/pages/user/cart/cart.types";

export default function CartHeader({ itemCount, onNavigate }: CartHeaderProps) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <Button variant="ghost" size="icon" onClick={() => onNavigate("landing")}>
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <div>
        <h1 className="text-2xl font-bold">Keranjang Belanja</h1>
        <p className="text-muted-foreground">{itemCount} barang dalam keranjang</p>
      </div>
    </div>
  );
}
