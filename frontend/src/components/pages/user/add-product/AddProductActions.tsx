import { Button } from "@/components/ui/button";
import { Tag } from "lucide-react";
import type { ProductType } from "@/components/pages/user/add-product/types";

interface AddProductActionsProps {
  productType: ProductType;
  submitDisabled: boolean;
  onCancel: () => void;
}

export default function AddProductActions({ productType, submitDisabled, onCancel }: AddProductActionsProps) {
  return (
    <div className="flex gap-3 justify-end">
      <Button type="button" variant="outline" onClick={onCancel}>Batal</Button>
      <Button type="submit" className="bg-primary-600 hover:bg-primary-700" disabled={submitDisabled}>
        <Tag className="h-4 w-4 mr-2" />
        Simpan {productType === "barang" ? "Produk" : "Jasa"}
      </Button>
    </div>
  );
}
