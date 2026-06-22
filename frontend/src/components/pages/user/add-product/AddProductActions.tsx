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
    <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
      <Button type="button" variant="outline" className="w-full sm:w-auto order-2 sm:order-1" onClick={onCancel} disabled={isLoading}>Batal</Button>
      <Button type="submit" className="w-full sm:w-auto order-1 sm:order-2 bg-primary hover:bg-primary/90" disabled={submitDisabled || isLoading}>
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
