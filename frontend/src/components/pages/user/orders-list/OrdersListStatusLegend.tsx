import { AlertCircle, CheckCircle2, DollarSign, Truck } from "lucide-react";

export default function OrdersListStatusLegend() {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <DollarSign className="h-3 w-3 text-orange-600" />
        Menunggu Harga
      </div>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <AlertCircle className="h-3 w-3 text-blue-600" />
        Menunggu Konfirmasi
      </div>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Truck className="h-3 w-3 text-secondary-600" />
        Dalam Pengiriman
      </div>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <CheckCircle2 className="h-3 w-3 text-primary-600" />
        Selesai
      </div>
    </div>
  );
}
