import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface CartEmptyStateProps {
  onNavigate: (page: string) => void;
}

export default function CartEmptyState({ onNavigate }: CartEmptyStateProps) {
  return (
    <Card>
      <CardContent className="p-12 text-center">
        <ShoppingCart className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Keranjang Kosong</h3>
        <p className="text-muted-foreground mb-4">Yuk mulai belanja dan temukan barang menarik!</p>
        <Button className="bg-primary-600 hover:bg-primary-700" onClick={() => onNavigate("catalog")}>
          Mulai Belanja
        </Button>
      </CardContent>
    </Card>
  );
}
