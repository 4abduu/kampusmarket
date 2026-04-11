import {
  AlertCircle,
  CheckCircle2,
  Clock,
  DollarSign,
  Loader2,
  PackageCheck,
  Truck,
  TruckIcon,
  Wallet,
  XCircle,
} from "lucide-react"

export const ORDER_STATUS_CONFIG = {
  pending: {
    label: "Menunggu Konfirmasi",
    color: "text-amber-700 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    borderColor: "border-amber-300 dark:border-amber-700",
    icon: Clock,
    dotColor: "bg-amber-500",
  },
  waiting_price: {
    label: "Menunggu Harga",
    color: "text-orange-700 dark:text-orange-400",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
    borderColor: "border-orange-300 dark:border-orange-700",
    icon: DollarSign,
    dotColor: "bg-orange-500",
  },
  waiting_confirmation: {
    label: "Menunggu Konfirmasi",
    color: "text-blue-700 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    borderColor: "border-blue-300 dark:border-blue-700",
    icon: AlertCircle,
    dotColor: "bg-blue-500",
  },
  waiting_payment: {
    label: "Menunggu Pembayaran",
    color: "text-primary-700 dark:text-primary-400",
    bgColor: "bg-primary-100 dark:bg-primary-900/30",
    borderColor: "border-primary-300 dark:border-primary-700",
    icon: Wallet,
    dotColor: "bg-primary-500",
  },
  processing: {
    label: "Sedang Diproses",
    color: "text-purple-700 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    borderColor: "border-purple-300 dark:border-purple-700",
    icon: Loader2,
    dotColor: "bg-purple-500",
  },
  waiting_shipping_fee: {
    label: "Menunggu Ongkir",
    color: "text-blue-700 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    borderColor: "border-blue-300 dark:border-blue-700",
    icon: Truck,
    dotColor: "bg-blue-500",
  },
  ready_pickup: {
    label: "Siap Diambil",
    color: "text-cyan-700 dark:text-cyan-400",
    bgColor: "bg-cyan-100 dark:bg-cyan-900/30",
    borderColor: "border-cyan-300 dark:border-cyan-700",
    icon: PackageCheck,
    dotColor: "bg-cyan-500",
  },
  in_delivery: {
    label: "Dalam Pengiriman",
    color: "text-secondary-700 dark:text-secondary-400",
    bgColor: "bg-secondary-100 dark:bg-secondary-900/30",
    borderColor: "border-secondary-300 dark:border-secondary-700",
    icon: TruckIcon,
    dotColor: "bg-secondary-500",
  },
  completed: {
    label: "Selesai",
    color: "text-primary-700 dark:text-primary-400",
    bgColor: "bg-primary-100 dark:bg-primary-900/30",
    borderColor: "border-primary-300 dark:border-primary-700",
    icon: CheckCircle2,
    dotColor: "bg-primary-500",
  },
  cancelled: {
    label: "Dibatalkan",
    color: "text-red-700 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    borderColor: "border-red-300 dark:border-red-700",
    icon: XCircle,
    dotColor: "bg-red-500",
  },
} as const

export const SHIPPING_METHODS: Record<string, { label: string; desc: string }> = {
  cod: { label: "COD (Cash on Delivery)", desc: "Bayar tunai saat ketemuan" },
  pickup: { label: "Ambil Sendiri", desc: "Ambil di lokasi penjual" },
  delivery: { label: "Antar Manual", desc: "Penjual mengantar ke alamat" },
  online: { label: "Online/Remote", desc: "Layanan dilakukan secara online" },
  onsite: { label: "On-site", desc: "Layanan dilakukan di lokasi penyedia" },
  home_service: { label: "Home Service", desc: "Penyedia jasa datang ke lokasi kamu" },
}

export const getOrderStatusConfig = (status: string) => {
  return ORDER_STATUS_CONFIG[status as keyof typeof ORDER_STATUS_CONFIG] || ORDER_STATUS_CONFIG.pending
}

export const getShippingMethodLabel = (method: string, isService: boolean) => {
  if (method !== "pickup") return SHIPPING_METHODS[method] || SHIPPING_METHODS.delivery

  return {
    label: isService ? "Datang ke Lokasi" : "Ambil Sendiri",
    desc: isService ? "Kamu datang ke lokasi penyedia jasa" : "Ambil di lokasi penjual",
  }
}
