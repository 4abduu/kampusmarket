import { create } from "zustand";
import { ShieldAlert, AlertTriangle, DollarSign, UserPlus, CheckCircle, Ban } from "lucide-react";

export interface AdminNotification {
  id: number;
  type: "moderation" | "dispute" | "withdrawal" | "user" | "report" | "system";
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: typeof ShieldAlert;
  iconColor: string;
  iconBg: string;
  action?: string;
  actionPage?: string;
}

interface AdminNotificationState {
  notifications: AdminNotification[];
  unreadCount: number;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: number) => void;
}

// Initial admin notifications data
const initialAdminNotifications: AdminNotification[] = [
  {
    id: 1,
    type: "moderation",
    title: "Produk Perlu Dimoderasi",
    message: "5 produk baru menunggu persetujuan untuk ditampilkan di marketplace.",
    time: "5 menit yang lalu",
    read: false,
    icon: ShieldAlert,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-100 dark:bg-amber-900/30",
    action: "Lihat Produk",
    actionPage: "admin",
  },
  {
    id: 2,
    type: "dispute",
    title: "Dispute Baru dari Transaksi #ORD-2024-001",
    message: "Pembeli melaporkan barang tidak sesuai deskripsi. Perlu mediasi segera.",
    time: "15 menit yang lalu",
    read: false,
    icon: AlertTriangle,
    iconColor: "text-red-600",
    iconBg: "bg-red-100 dark:bg-red-900/30",
    action: "Lihat Dispute",
    actionPage: "admin",
  },
  {
    id: 3,
    type: "withdrawal",
    title: "Permintaan Penarikan Dana",
    message: "Budi Santoso meminta penarikan dana sebesar Rp 500.000 ke rekening BRI.",
    time: "30 menit yang lalu",
    read: false,
    icon: DollarSign,
    iconColor: "text-primary-600",
    iconBg: "bg-primary-100 dark:bg-primary-900/30",
    action: "Proses Penarikan",
    actionPage: "admin",
  },
  {
    id: 4,
    type: "user",
    title: "Pengguna Baru Terdaftar",
    message: "10 pengguna baru mendaftar hari ini. Total pengguna: 1.234 orang.",
    time: "1 jam yang lalu",
    read: true,
    icon: UserPlus,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
  },
  {
    id: 5,
    type: "report",
    title: "Laporan Pengguna",
    message: "Ahmad melaporkan penjual 'TokoBuku' karena produk palsu. Perlu investigasi.",
    time: "2 jam yang lalu",
    read: true,
    icon: AlertTriangle,
    iconColor: "text-orange-600",
    iconBg: "bg-orange-100 dark:bg-orange-900/30",
    action: "Lihat Laporan",
    actionPage: "admin",
  },
  {
    id: 6,
    type: "system",
    title: "Backup Database Selesai",
    message: "Backup otomatis database telah selesai. Ukuran: 256 MB.",
    time: "3 jam yang lalu",
    read: true,
    icon: CheckCircle,
    iconColor: "text-green-600",
    iconBg: "bg-green-100 dark:bg-green-900/30",
  },
  {
    id: 7,
    type: "moderation",
    title: "Produk Ditolak Otomatis",
    message: "3 produk ditolak karena mengandung kata terlarang atau gambar tidak sesuai.",
    time: "5 jam yang lalu",
    read: true,
    icon: Ban,
    iconColor: "text-slate-600",
    iconBg: "bg-slate-100 dark:bg-slate-800",
  },
  {
    id: 8,
    type: "dispute",
    title: "Dispute Diselesaikan",
    message: "Dispute #DSP-2024-012 telah diselesaikan. Dana dikembalikan ke pembeli.",
    time: "1 hari yang lalu",
    read: true,
    icon: CheckCircle,
    iconColor: "text-green-600",
    iconBg: "bg-green-100 dark:bg-green-900/30",
  },
];

export const useAdminNotificationStore = create<AdminNotificationState>((set) => ({
  notifications: initialAdminNotifications,
  unreadCount: initialAdminNotifications.filter((n) => !n.read).length,
  
  markAsRead: (id: number) => {
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      return {
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
      };
    });
  },
  
  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },
  
  deleteNotification: (id: number) => {
    set((state) => {
      const notifications = state.notifications.filter((n) => n.id !== id);
      return {
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
      };
    });
  },
}));
