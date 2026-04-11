import { MapPin, Minus, Package, Plus, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/components/pages/user/cart/cart.utils";
import type { CartItem } from "@/components/pages/user/cart/cart.types";

interface CartItemCardProps {
  item: CartItem;
  selected: boolean;
  onSelectItem: (productId: string, checked: boolean) => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onQuantityInput: (productId: string, value: number) => void;
  onRemoveItem: (productId: string) => void;
  onNavigate: (page: string, data?: string) => void;
}

export default function CartItemCard({
  item,
  selected,
  onSelectItem,
  onUpdateQuantity,
  onQuantityInput,
  onRemoveItem,
  onNavigate,
}: CartItemCardProps) {
  return (
    <Card className={selected ? "ring-2 ring-primary-500" : ""}>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <Checkbox checked={selected} onCheckedChange={(checked) => onSelectItem(item.product.id, Boolean(checked))} />
          <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
            <Package className="h-10 w-10 text-muted-foreground/30" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between">
              <div>
                <p className="font-medium hover:text-primary-600 cursor-pointer" onClick={() => onNavigate("product", item.product.id)}>
                  {item.product.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-[10px] bg-primary-100 text-primary-700">
                      {item.product.seller.name.split(" ").map((namePart) => namePart[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">{item.product.seller.name}</span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {item.product.location.split(",")[0]}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500 hover:text-red-600"
                onClick={() => onRemoveItem(item.product.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between mt-3">
              <p className="text-lg font-bold text-primary-600">{formatPrice(item.product.price)}</p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onUpdateQuantity(item.product.id, -1)}
                  disabled={item.quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => onQuantityInput(item.product.id, parseInt(e.target.value, 10) || 1)}
                  className="w-14 h-8 text-center"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onUpdateQuantity(item.product.id, 1)}
                  disabled={item.quantity >= item.product.stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {item.product.canNego && (
              <Badge variant="outline" className="mt-2 text-xs">
                Bisa Nego
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
