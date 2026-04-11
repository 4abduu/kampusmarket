import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package } from "lucide-react";
import type { ProductType } from "@/components/pages/user/add-product/types";

interface AddProductTypeSelectorProps {
  productType: ProductType;
  setProductType: (value: ProductType) => void;
}

export default function AddProductTypeSelector({ productType, setProductType }: AddProductTypeSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Tipe Listing</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setProductType("barang")}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              productType === "barang"
                ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20"
                : "border-slate-200 hover:border-slate-300 dark:border-slate-700"
            }`}
          >
            <Package className="h-8 w-8 mb-2 text-primary-600" />
            <p className="font-medium">Barang</p>
            <p className="text-sm text-muted-foreground">Jual barang baru atau bekas</p>
          </button>
          <button
            type="button"
            onClick={() => setProductType("jasa")}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              productType === "jasa"
                ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20"
                : "border-slate-200 hover:border-slate-300 dark:border-slate-700"
            }`}
          >
            <DollarSign className="h-8 w-8 mb-2 text-primary-600" />
            <p className="font-medium">Jasa</p>
            <p className="text-sm text-muted-foreground">Tawarkan layanan atau jasa</p>
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
