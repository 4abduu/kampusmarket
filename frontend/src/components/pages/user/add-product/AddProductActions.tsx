import { Button } from "@/components/ui/button";
import { Tag, Loader2 } from "lucide-react";
import type { ProductType } from "@/components/pages/user/add-product/types";

interface AddProductActionsProps {
  productType: ProductType;
  submitDisabled: boolean;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function AddProductActions({ productType, submitDisabled, onCancel, isLoading }: AddProductActionsProps) {
  return (
    <div className="flex gap-3 justify-end">
      <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Batal</Button>
      <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={submitDisabled || isLoading}>
        {isLoading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Tag className="h-4 w-4 mr-2" />
        )}
        {isLoading ? "Menyimpan..." : `Simpan ${productType === "barang" ? "Produk" : "Jasa"}`}
      </Button>
    </div>
  );
}
