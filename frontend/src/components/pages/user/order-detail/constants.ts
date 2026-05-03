import { 
  Clock, 
  ShieldCheck, 
  Package, 
  Truck, 
  CheckCircle2, 
  X, 
  Loader2,
  AlertCircle,
  Wallet
} from "lucide-react";

export const CANCEL_REASONS_MAP: Record<string, string> = {
  changed_mind: "Berubah pikiran",
  found_better_price: "Menemukan harga lebih murah",
  seller_not_responding: "Penjual tidak merespon",
  item_not_as_described: "Barang tidak sesuai deskripsi",
  delivery_too_long: "Estimasi pengiriman terlalu lama",
  asked_outside_platform: "Diminta transaksi di luar platform",
  shipping_method_mismatch: "Metode pengiriman tidak sesuai",
  shipping_fee_too_high: "Ongkir terlalu mahal",
  out_of_stock: "Stok habis",
  address_unreachable: "Alamat tidak terjangkau",
  buyer_not_responding: "Pembeli tidak merespon",
  buyer_not_serious: "Indikasi pembeli tidak serius",
  suspected_fraud: "Risiko penipuan terdeteksi",
  item_damaged_before_shipping: "Barang rusak sebelum dikirim",
  shipping_operational_issue: "Kendala operasional pengiriman",
  service_unavailable: "Penyedia tidak tersedia",
  schedule_conflict: "Jadwal tidak cocok",
  provider_communication_issue: "Komunikasi penyedia kurang jelas",
  timeline_not_feasible: "Waktu pengerjaan tidak memungkinkan",
  service_scope_changed: "Scope layanan berubah",
  portfolio_not_matching: "Portofolio tidak sesuai ekspektasi",
  brief_unclear_or_changed: "Brief tidak jelas atau sering berubah",
  out_of_scope_request: "Permintaan di luar scope awal",
  service_location_not_feasible: "Lokasi atau jadwal eksekusi tidak feasible",
  team_unavailable: "Ketersediaan tim mendadak berubah",
  other: "Lainnya",
};

export function formatCancelReason(reason: string | null | undefined): string {
  if (!reason) return "Tidak ada alasan spesifik";
  
  // If it's a "key: description" format
  if (reason.includes(":")) {
    const parts = reason.split(":");
    const key = parts[0].trim();
    const description = parts.slice(1).join(":").trim();
    
    const label = CANCEL_REASONS_MAP[key] || key;
    return description ? `${label}: ${description}` : label;
  }

  return CANCEL_REASONS_MAP[reason] || reason;
}

export const getOrderStatusConfig = (status: string) => {
  switch (status) {
    case "pending":
      return { label: "Menunggu Konfirmasi", color: "text-amber-600", bgColor: "bg-amber-50", borderColor: "border-amber-200", dotColor: "bg-amber-500", icon: Clock };
    case "waiting_price":
      return { label: "Menunggu Penawaran Harga", color: "text-amber-600", bgColor: "bg-amber-50", borderColor: "border-amber-200", dotColor: "bg-amber-500", icon: Clock };
    case "waiting_shipping_fee":
      return { label: "Menunggu Ongkir", color: "text-amber-600", bgColor: "bg-amber-50", borderColor: "border-amber-200", dotColor: "bg-amber-500", icon: Clock };
    case "waiting_payment":
      return { label: "Menunggu Pembayaran", color: "text-amber-600", bgColor: "bg-amber-50", borderColor: "border-amber-200", dotColor: "bg-amber-500", icon: Wallet };
    case "waiting_confirmation":
      return { label: "Menunggu Konfirmasi Pembeli", color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200", dotColor: "bg-blue-500", icon: ShieldCheck };
    case "processing":
      return { label: "Sedang Diproses", color: "text-primary-600", bgColor: "bg-primary-50", borderColor: "border-primary-200", dotColor: "bg-primary-500", icon: Loader2 };
    case "ready_pickup":
      return { label: "Siap Diambil", color: "text-primary-600", bgColor: "bg-primary-50", borderColor: "border-primary-200", dotColor: "bg-primary-500", icon: Package };
    case "in_delivery":
      return { label: "Sedang Dikirim", color: "text-primary-600", bgColor: "bg-primary-50", borderColor: "border-primary-200", dotColor: "bg-primary-500", icon: Truck };
    case "completed":
      return { label: "Selesai", color: "text-emerald-600", bgColor: "bg-emerald-50", borderColor: "border-emerald-200", dotColor: "bg-emerald-500", icon: CheckCircle2 };
    case "cancelled":
      return { label: "Dibatalkan", color: "text-red-600", bgColor: "bg-red-50", borderColor: "border-red-200", dotColor: "bg-red-500", icon: X };
    default:
      return { label: status, color: "text-slate-600", bgColor: "bg-slate-50", borderColor: "border-slate-200", dotColor: "bg-slate-500", icon: AlertCircle };
  }
};

export const getShippingMethodLabel = (method: string, isService: boolean = false) => {
  if (isService) {
    switch (method) {
      case "pickup": return { label: "Ke Lokasi Penyedia", desc: "Anda datang ke lokasi penyedia jasa" };
      case "delivery": return { label: "Penyedia Datang", desc: "Penyedia jasa datang ke lokasi Anda" };
      default: return { label: method, desc: "" };
    }
  }
  switch (method) {
    case "pickup": return { label: "Ambil Sendiri", desc: "Ambil barang di lokasi penjual" };
    case "delivery": return { label: "Antar Manual", desc: "Penjual mengantar barang langsung" };
    case "cod": return { label: "COD", desc: "Bayar di tempat" };
    default: return { label: method, desc: "" };
  }
};
