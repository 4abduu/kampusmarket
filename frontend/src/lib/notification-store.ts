import { create } from "zustand";
import { Package, MessageCircle, Wallet, Star, CheckCircle } from "lucide-react";

export interface Notification {
  id: number;
  type: "order" | "chat" | "review" | "system";
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: typeof Package;
  iconColor: string;
  iconBg: string;
  orderId?: string;
  chatId?: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: number) => void;
  getUnreadCount: () => number;
}

// Initial notifications data
const initialNotifications: Notification[] = [
  {
    id: 1,
    type: "order",
    title: "Pesanan Dikonfirmasi",
    message: "Pesanan #ORD-2024-001 telah dikonfirmasi oleh penjual. Penjual sedang menyiapkan barang.",
    time: "5 menit yang lalu",
    read: false,
    icon: Package,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-100",
    orderId: "ORD-2024-001",
  },
  {
    id: 2,
    type: "order",
    title: "Ongkir Sudah Ditentukan",
    message: "Ongkir untuk pesanan #ORD-2024-001 sebesar Rp 15.000. Silakan lakukan pembayaran.",
    time: "30 menit yang lalu",
    read: false,
    icon: Wallet,
    iconColor: "text-primary-500",
    iconBg: "bg-primary-100",
    orderId: "ORD-2024-001",
  },
  {
    id: 3,
    type: "chat",
    title: "Pesan Baru dari Budi Santoso",
    message: "Halo, apakah buku ini masih tersedia? Saya tertarik untuk membeli.",
    time: "1 jam yang lalu",
    read: false,
    icon: MessageCircle,
    iconColor: "text-purple-500",
    iconBg: "bg-purple-100",
    chatId: "1",
  },
  {
    id: 4,
    type: "review",
    title: "Beri Rating Transaksi",
    message: "Transaksi #ORD-2023-089 sudah selesai. Beri rating untuk penjual ya!",
    time: "2 jam yang lalu",
    read: true,
    icon: Star,
    iconColor: "text-amber-500",
    iconBg: "bg-amber-100",
    orderId: "ORD-2023-089",
  },
  {
    id: 5,
    type: "order",
    title: "Pesanan Selesai",
    message: "Pesanan #ORD-2023-088 telah selesai. Terima kasih sudah bertransaksi!",
    time: "1 hari yang lalu",
    read: true,
    icon: CheckCircle,
    iconColor: "text-green-500",
    iconBg: "bg-green-100",
    orderId: "ORD-2023-088",
  },
];

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: initialNotifications,
  unreadCount: initialNotifications.filter((n) => !n.read).length,
  
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
  
  getUnreadCount: () => {
    return get().notifications.filter((n) => !n.read).length;
  },
}));
