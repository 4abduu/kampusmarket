import { create } from "zustand";
import { ShieldAlert, AlertTriangle, DollarSign, UserPlus, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

let activeAdminEchoUserId: string | null = null;

export interface AdminNotification {
  id: string; // UUID string from backend
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
  actionTab?:
    | "overview"
    | "users"
    | "products"
    | "categories"
    | "faculties"
    | "reports"
    | "cancel-requests"
    | "orders"
    | "finance"
    | "addresses";
}

interface AdminNotificationState {
  notifications: AdminNotification[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  initEcho: (userId: string) => void;
  cleanupEcho: () => void;
}

export const useAdminNotificationStore = create<AdminNotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  
  fetchNotifications: async () => {
    try {
      const apiClient = (await import('@/lib/api/client')).default;
      const res: any = await apiClient.get('/notifications');
      
      const rawData = res.data?.data || res.data || [];
      const notificationsArray = Array.isArray(rawData) ? rawData : [];

      const data = notificationsArray.map((n: any) => {
        const actionTab = n.data?.action_tab || null;
        const type = n.type; // standard db types: 'order', 'chat', 'payment', 'system', 'withdrawal', 'review'

        // Determine frontend notification type, icons, color and bg based on actionTab and database type
        let frontendType: "moderation" | "dispute" | "withdrawal" | "user" | "report" | "system" = "system";
        let icon = CheckCircle;
        let iconColor = "text-green-600";
        let iconBg = "bg-green-100 dark:bg-green-900/30";
        let action = "Buka detail";
        
        if (actionTab === 'products') {
          frontendType = "moderation";
          icon = ShieldAlert;
          iconColor = "text-amber-600";
          iconBg = "bg-amber-100 dark:bg-amber-900/30";
          action = "Lihat Produk";
        } else if (actionTab === 'reports') {
          frontendType = "dispute";
          icon = AlertTriangle;
          iconColor = "text-red-600";
          iconBg = "bg-red-100 dark:bg-red-900/30";
          action = "Lihat Dispute";
        } else if (actionTab === 'finance' || type === 'withdrawal') {
          frontendType = "withdrawal";
          icon = DollarSign;
          iconColor = "text-primary-600";
          iconBg = "bg-primary-100 dark:bg-primary-900/30";
          action = type === 'payment' ? "Lihat Keuangan" : "Proses Penarikan";
        } else if (actionTab === 'cancel-requests') {
          frontendType = "dispute"; // map to dispute type in UI
          icon = AlertTriangle;
          iconColor = "text-orange-600";
          iconBg = "bg-orange-100 dark:bg-orange-900/30";
          action = "Lihat Pembatalan";
        } else if (actionTab === 'users') {
          frontendType = "user";
          icon = UserPlus;
          iconColor = "text-blue-600";
          iconBg = "bg-blue-100 dark:bg-blue-900/30";
          action = "Lihat User";
        }

        // Relative time helper or raw date string (e.g. from backend createdAt / created_at)
        let timeStr = n.createdAt || n.created_at || "";
        try {
          const date = new Date(timeStr);
          const now = new Date();
          const diffMs = now.getTime() - date.getTime();
          const diffMins = Math.floor(diffMs / 60000);
          const diffHours = Math.floor(diffMins / 60);
          const diffDays = Math.floor(diffHours / 24);

          if (diffMins < 1) timeStr = "Baru saja";
          else if (diffMins < 60) timeStr = `${diffMins} menit yang lalu`;
          else if (diffHours < 24) timeStr = `${diffHours} jam yang lalu`;
          else if (diffDays === 1) timeStr = "Kemarin";
          else timeStr = `${diffDays} hari yang lalu`;
        } catch (err) {
          // ignore
        }

        return {
          id: n.id, // UUID string
          type: frontendType,
          title: n.title,
          message: n.message,
          time: timeStr,
          read: n.isRead !== undefined ? n.isRead : n.is_read,
          icon,
          iconColor,
          iconBg,
          action,
          actionPage: "admin",
          actionTab: actionTab,
        };
      });

      set({ notifications: data, unreadCount: data.filter((n: any) => !n.read).length });
    } catch (e) {
      console.error('Error fetching admin notifications:', e);
    }
  },

  fetchUnreadCount: async () => {
    try {
      const apiClient = (await import('@/lib/api/client')).default;
      const res: any = await apiClient.get('/notifications/unread-count');
      const count = res.data?.unreadCount ?? 0;
      set({ unreadCount: count });
    } catch (e) {
      console.error('Error fetching admin unread count:', e);
    }
  },

  markAsRead: async (id: string) => {
    const original = get().notifications;
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      return {
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
      };
    });
    
    try {
      const apiClient = (await import('@/lib/api/client')).default;
      const targetId = original.find(n => n.id === id)?.id;
      if (targetId) {
        await apiClient.post(`/notifications/${targetId}/read`);
      }
    } catch (e) {
      console.error('Error marking admin notification as read:', e);
    }
  },
  
  markAllAsRead: async () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
    
    try {
      const apiClient = (await import('@/lib/api/client')).default;
      await apiClient.post('/notifications/read-all');
    } catch (e) {
      console.error('Error marking all admin notifications as read:', e);
    }
  },
  
  deleteNotification: async (id: string) => {
    const original = get().notifications;
    set((state) => {
      const notifications = state.notifications.filter((n) => n.id !== id);
      return {
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
      };
    });
    
    try {
      const apiClient = (await import('@/lib/api/client')).default;
      const targetId = original.find(n => n.id === id)?.id;
      if (targetId) {
        await apiClient.delete(`/notifications/${targetId}`);
      }
    } catch (e) {
      console.error('Error deleting admin notification:', e);
    }
  },

  initEcho: (userId: string) => {
    activeAdminEchoUserId = userId;
    import('@/lib/echo').then(({ getEcho }) => {
      try {
        const echo = getEcho();
        const channel = echo.private(`users.${userId}`);
        channel.listen('.NewNotification', (e: any) => {
           get().fetchNotifications();
           toast({
             variant: "default",
             title: e.title || "Notifikasi Admin",
             description: e.message || "Ada update terbaru di dashboard admin."
           });
        });
      } catch (e) {
        console.info('Reverb echo not active');
      }
    });
  },

  cleanupEcho: () => {
    if (activeAdminEchoUserId) {
      const userId = activeAdminEchoUserId;
      activeAdminEchoUserId = null;
      import('@/lib/echo').then(({ getEcho }) => {
        try {
          const echo = getEcho();
          echo.private(`users.${userId}`).stopListening('.NewNotification');
        } catch (e) {
          // Ignore
        }
      });
    }
  }
}));
