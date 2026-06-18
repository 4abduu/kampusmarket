import { CheckCircle2 } from "lucide-react";

interface CheckoutSuccessHeaderProps {
  isMultiOrder: boolean;
  ordersCount: number;
  isServiceOrder: boolean;
}

export default function CheckoutSuccessHeader({
  isMultiOrder,
  ordersCount,
  isServiceOrder,
}: CheckoutSuccessHeaderProps) {
  return (
    <div className="text-center mb-8">
      <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${!isMultiOrder && isServiceOrder ? "bg-purple-100 dark:bg-purple-900/50" : "bg-primary-100 dark:bg-primary-900/50"}`}>
        <CheckCircle2 className={`h-12 w-12 ${!isMultiOrder && isServiceOrder ? "text-purple-600" : "text-primary-600"}`} />
      </div>
      <h1 className={`text-2xl font-bold mb-2 ${!isMultiOrder && isServiceOrder ? "text-purple-700 dark:text-purple-400" : "text-primary-700 dark:text-primary-400"}`}>
        {isMultiOrder
          ? `${ordersCount} Pesanan Berhasil Dibuat!`
          : isServiceOrder
          ? "Booking Berhasil Dibuat!"
          : "Pesanan Berhasil Dibuat!"}
      </h1>
      <p className="text-muted-foreground">
        {isMultiOrder
          ? "Semua pesananmu sedang diproses. Penyedia/Penjual akan segera menghubungimu."
          : isServiceOrder
          ? "Booking jasa kamu sedang diproses. Penyedia jasa akan segera menghubungimu."
          : "Pesananmu sedang diproses. Penjual akan segera menghubungimu."}
      </p>
    </div>
  );
}
