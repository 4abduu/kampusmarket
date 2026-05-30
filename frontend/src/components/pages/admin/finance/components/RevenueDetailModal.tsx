import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FinancialAmountCard, FinancialStatusBadge } from "./shared";
import { Calendar, User, BarChart3, ShoppingBag, ShieldCheck } from "lucide-react";

export interface RevenueDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: any;
  formatPrice: (val: number) => string;
}

export function RevenueDetailModal({
  open,
  onOpenChange,
  transaction,
  formatPrice,
}: RevenueDetailModalProps) {
  if (!transaction) return null;

  // Deriving transaction math based on 5% platform fee
  const platformFee = transaction.adminFee || 0;
  const totalTransaction = platformFee * 20; // 5% fee means gross is fee * 20
  const sellerEarning = platformFee * 19;    // 95% earning is fee * 19

  // Dynamically map high-fidelity mock sellers based on product title
  const getSellerInfo = (productTitle: string) => {
    const lowercaseTitle = (productTitle || "").toLowerCase();
    if (lowercaseTitle.includes("casio") || lowercaseTitle.includes("kalkulator")) {
      return { name: "Ahmad Santoso", email: "ahmad@student.ac.id", initials: "AS" };
    } else if (lowercaseTitle.includes("fotografi")) {
      return { name: "Aditya Rahman", email: "aditya.rahman@student.ac.id", initials: "AR" };
    } else if (lowercaseTitle.includes("macbook")) {
      return { name: "Budi Pratama", email: "budi@alumni.ac.id", initials: "BP" };
    } else if (lowercaseTitle.includes("jaket") || lowercaseTitle.includes("almamater")) {
      return { name: "Siti Rahayu", email: "siti@student.ac.id", initials: "SR" };
    } else if (lowercaseTitle.includes("headphone") || lowercaseTitle.includes("bluetooth")) {
      return { name: "Adit Pratama", email: "adit.pratama@student.ac.id", initials: "AP" };
    } else {
      return { name: "Dewi Lestari", email: "dewi@student.ac.id", initials: "DL" };
    }
  };

  // Get dynamic payment provider mock for fidelity
  const getPaymentProvider = (orderNumber: string) => {
    const lastDigit = parseInt(orderNumber.slice(-1)) || 0;
    const providers = ["Midtrans (GoPay)", "Midtrans (QRIS)", "Midtrans (BCA Virtual Account)", "Midtrans (ShopeePay)"];
    return providers[lastDigit % providers.length];
  };

  const seller = getSellerInfo(transaction.productTitle);
  const paymentProvider = getPaymentProvider(transaction.orderNumber);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] w-full max-h-[85vh] overflow-y-auto p-5 md:p-6 transition-all duration-300 ease-in-out scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 scrollbar-track-transparent">
        <DialogHeader className="text-left">
          <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary-600 shrink-0" />
            Detail Pendapatan Platform
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Rincian komisi platform 5% dari penjualan produk Kampus Market.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Transaction Summary Badge Row */}
          <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800 text-xs">
            <div className="space-y-0.5">
              <span className="text-muted-foreground block">Order ID</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                {transaction.orderNumber}
              </span>
            </div>
            <div className="text-right space-y-1">
              <span className="text-muted-foreground block">Status</span>
              <FinancialStatusBadge status="completed" />
            </div>
          </div>

          {/* Amount Card displaying the Platform Fee */}
          <FinancialAmountCard
            amount={platformFee}
            variant="success"
            label="Pendapatan Platform (5%)"
          />

          {/* Seller Information Card */}
          <div className="flex flex-col gap-3 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b border-slate-100/50 dark:border-slate-800/50 pb-2">
              <User className="h-3.5 w-3.5" /> Pihak Penjual (Seller)
            </h4>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-primary-100 dark:border-primary-900">
                <AvatarFallback className="bg-primary-100 text-primary-700 font-semibold text-sm">
                  {seller.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {seller.name}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {seller.email}
                </span>
              </div>
            </div>
          </div>

          {/* Details / Transaction Metadata Grid */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 rounded-xl space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
              <ShieldCheck className="h-3.5 w-3.5" /> Rincian Finansial & Transaksi
            </h4>
            <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 text-xs">
              <div className="space-y-0.5">
                <span className="text-muted-foreground">Total Transaksi</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {formatPrice(totalTransaction)}
                </p>
              </div>
              <div className="space-y-0.5">
                <span className="text-muted-foreground">Pendapatan Seller (95%)</span>
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  {formatPrice(sellerEarning)}
                </p>
              </div>
              <div className="col-span-2 border-t border-slate-100/50 dark:border-slate-800/50 pt-2 space-y-0.5">
                <span className="text-muted-foreground">Sumber Pendapatan</span>
                <p className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <ShoppingBag className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  {transaction.productTitle}
                </p>
              </div>
              <div className="border-t border-slate-100/50 dark:border-slate-800/50 pt-2 space-y-0.5">
                <span className="text-muted-foreground">Metode Pembayaran</span>
                <p className="font-medium text-slate-800 dark:text-slate-200">
                  {paymentProvider}
                </p>
              </div>
              <div className="border-t border-slate-100/50 dark:border-slate-800/50 pt-2 space-y-0.5">
                <span className="text-muted-foreground">ID Transaksi</span>
                <p className="font-mono text-[10px] text-slate-800 dark:text-slate-200 select-all font-medium">
                  TX-REV-{transaction.orderId || transaction.orderNumber.split("-").pop()}
                </p>
              </div>
            </div>
          </div>

          {/* Time logs */}
          <div className="flex flex-col gap-1.5 p-3 rounded-lg border border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> Tanggal Transaksi
              </span>
              <span className="font-medium">{formatDate(transaction.createdAt)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> Tanggal Diselesaikan
              </span>
              <span className="font-medium">{formatDate(transaction.createdAt)}</span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" className="w-full text-xs font-semibold" onClick={() => onOpenChange(false)}>
              Tutup Rincian
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
