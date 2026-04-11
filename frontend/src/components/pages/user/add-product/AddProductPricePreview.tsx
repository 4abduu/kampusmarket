import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";
import type { ProductType } from "@/components/pages/user/add-product/types";

interface AddProductPricePreviewProps {
  productType: ProductType;
  getPricePreview: () => string;
  getDurationPreview: () => string | null;
  canNego: boolean;
}

export default function AddProductPricePreview({
  productType,
  getPricePreview,
  getDurationPreview,
  canNego,
}: AddProductPricePreviewProps) {
  return (
    <Card className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 border-primary-200 dark:border-primary-800">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Preview Harga</p>
            <p className="text-2xl font-bold text-primary-700 dark:text-primary-400">{getPricePreview()}</p>
            {productType === "jasa" && (
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <Clock className="h-3 w-3" />
                {getDurationPreview()}
              </p>
            )}
          </div>
          <Badge variant="secondary" className="bg-primary-100 text-primary-700 dark:bg-primary-800 dark:text-primary-300">
            {canNego ? "Bisa Nego" : "Harga Fix"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
