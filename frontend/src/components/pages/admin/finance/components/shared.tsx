import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User as UserIcon } from "lucide-react";

interface UserType {
  name: string;
  email?: string;
  avatar?: string;
  role?: string;
}

export function getInitials(name?: string | null): string {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export const formatPrice = (price: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);

export interface FinancialUserCardProps {
  user: UserType;
}

export const FinancialUserCard: React.FC<FinancialUserCardProps> = ({ user }) => {
  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
      <Avatar className="h-10 w-10">
        {user.avatar && <AvatarImage src={user.avatar} alt={user.name} className="object-cover" />}
        <AvatarFallback className="bg-primary-100 text-primary-700 font-medium text-sm">
          {getInitials(user.name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-sm font-semibold flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
          <UserIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="truncate">{user.name || "-"}</span>
        </span>
        <span className="text-xs text-muted-foreground truncate">
          {user.email || "Email tidak tersedia"}
        </span>
      </div>
    </div>
  );
};

export interface FinancialAmountCardProps {
  amount: number;
  totalDeduction?: number;
  label?: string;
  variant?: "success" | "danger" | "neutral";
}

export const FinancialAmountCard: React.FC<FinancialAmountCardProps> = ({
  amount,
  totalDeduction = 0,
  label = "Total Penarikan",
  variant = "success"
}) => {
  const netAmount = amount - totalDeduction;
  const isDanger = variant === "danger";
  const isSuccess = variant === "success";

  const textClass = isSuccess 
    ? "text-emerald-600 dark:text-emerald-400" 
    : isDanger 
    ? "text-red-600 dark:text-red-400" 
    : "text-slate-900 dark:text-slate-100";
    
  const bgClass = isSuccess 
    ? "bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-emerald-100/50 dark:border-emerald-800/30" 
    : isDanger 
    ? "bg-red-50/50 dark:bg-red-950/20 border-red-100/50 dark:border-red-900/30" 
    : "bg-slate-50/50 dark:bg-slate-900/50 border-slate-100/50 dark:border-slate-800/30";

  return (
    <div className={`flex flex-col items-center justify-center p-4 md:p-5 rounded-xl border shadow-sm text-center ${bgClass}`}>
      <span className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
        {label}
      </span>
      <span className={`text-2xl sm:text-3xl font-extrabold select-all tracking-tight ${textClass}`}>
        {formatPrice(amount)}
      </span>
      {totalDeduction > 0 && (
        <div className="mt-2.5 pt-2.5 border-t border-emerald-100/40 w-full flex flex-col gap-1 text-xs">
          <div className="flex justify-between text-muted-foreground text-[11px] md:text-xs">
            <span>Potongan/Biaya:</span>
            <span className="font-medium text-red-500">-{formatPrice(totalDeduction)}</span>
          </div>
          <div className="flex justify-between text-emerald-800 dark:text-emerald-300 font-semibold text-[11px] md:text-xs">
            <span>Diterima Pengguna:</span>
            <span>{formatPrice(netAmount)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export interface FinancialStatusBadgeProps {
  status: string;
}

export const FinancialStatusBadge: React.FC<FinancialStatusBadgeProps> = ({
  status,
}) => {
  const config: Record<
    string,
    {
      variant: "default" | "secondary" | "destructive" | "outline";
      label: string;
      className?: string;
    }
  > = {
    pending: {
      variant: "outline",
      label: "Menunggu",
      className: "border-amber-500 text-amber-600 dark:border-amber-400 dark:text-amber-400 bg-amber-50/20",
    },
    approved: {
      variant: "default",
      label: "Disetujui",
      className: "bg-blue-500 hover:bg-blue-600 text-white",
    },
    processing: {
      variant: "secondary",
      label: "Diproses",
      className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-none",
    },
    completed: {
      variant: "default",
      label: "Selesai",
      className: "bg-primary-500 hover:bg-primary-600 text-white",
    },
    failed: {
      variant: "destructive",
      label: "Gagal",
    },
    rejected: {
      variant: "destructive",
      label: "Ditolak",
    },
    cancelled: {
      variant: "outline",
      label: "Dibatalkan",
      className: "text-slate-500 border-slate-300 dark:text-slate-400 dark:border-slate-700 bg-slate-50/10",
    },
  };

  const statusConfig = config[status] || config.pending;

  return (
    <Badge variant={statusConfig.variant} className={`font-medium ${statusConfig.className || ""}`}>
      {statusConfig.label}
    </Badge>
  );
};
