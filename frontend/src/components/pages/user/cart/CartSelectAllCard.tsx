import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import type { CartSelectAllCardProps } from "@/components/pages/user/cart/cart.types";

export default function CartSelectAllCard({ itemCount, selectedCount, onSelectAll }: CartSelectAllCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Checkbox
              id="select-all"
              checked={selectedCount > 0 && selectedCount === itemCount}
              onCheckedChange={(checked) => onSelectAll(Boolean(checked))}
            />
            <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
              Pilih Semua ({itemCount} barang)
            </label>
          </div>
          {selectedCount > 0 && (
            <Button variant="ghost" size="sm" className="text-red-500" disabled>
              <Trash2 className="h-4 w-4 mr-1" />
              Hapus ({selectedCount})
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
