import { create } from "zustand";
import { Package, MessageCircle, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export interface NotificationAction {
  label: string;
  icon: string;
  color: 'primary' | 'secondary' | 'info' | 'warning' | 'danger';
}

export interface Notification {
  id: string;
  type: "order" | "chat" | "review" | "system" | "payment" | "withdrawal";
  title: string;
  message: string;
  time: string;
  timeRelative: string; // "2 jam yang lalu", "Kemarin"
  read: boolean;
  icon: any;
  iconColor: string;
  iconBg: string;
  orderId?: string;
  chatId?: string;
  link?: string;
  action?: NotificationAction; // Button action info
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  deleteAllNotifications: (type?: string) => Promise<void>;
  getUnreadCount: () => number;
}

// Initial notifications removed

let pollingIntervalId: any = null;
let activeEchoUserId: string | null = null;

export const useNotificationStore = create<NotificationState & {
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  initEcho: (userId: string) => void;
  cleanupEcho: () => void;
}>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  
  fetchNotifications: async () => {
    try {
      const apiClient = (await import('@/lib/api/client')).default;
      const res: any = await apiClient.get('/notifications');
      
      // Handle both { success, data: [...] } and { success, data: { data: [...] } }
      const rawData = res.data?.data || res.data || [];
      const notificationsArray = Array.isArray(rawData) ? rawData : [];

      const data = notificationsArray.map((n: any) => {
        let type = n.type;
        
        let icon = Package;
        let iconColor = "text-blue-500";
        let iconBg = "bg-blue-100";
        

        if (type === 'order') {
          icon = Package;
          iconColor = "text-blue-500";
          iconBg = "bg-blue-100";
        } else if (type === 'system') {
          icon = CheckCircle;
          iconColor = "text-amber-500";
          iconBg = "bg-amber-100";
        } else if (type === 'chat') {
          icon = MessageCircle;
          iconColor = "text-purple-500";
          iconBg = "bg-purple-100";
        } else if (type === 'payment' || type === 'withdrawal') {
          icon = Package;
          iconColor = "text-green-500";
          iconBg = "bg-green-100";
        } else if (type === 'review') {
          icon = Package;
          iconColor = "text-yellow-500";
          iconBg = "bg-yellow-100";
        }
        
        // Use relative time from API (e.g., "2 jam yang lalu")
        const timeRelative = n.createdAtRelative || n.created_at_relative || "Baru saja";
        
        // Fallback to calculating time if API doesn't provide it
        let timeStr = timeRelative;
        if (timeStr === "Baru saja" && n.createdAt) {
          try {
            const date = new Date(n.createdAt);
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
            // Fallback to API time
          }
        }
        
        return {
          id: n.id, // This is UUID string from NotificationResource
          type: type,
          title: n.title,
          message: n.message,
          time: n.createdAt || "",
          timeRelative: timeStr,
          read: n.isRead !== undefined ? n.isRead : n.is_read,
          icon,
          iconColor,
          iconBg,
          link: n.link,
          orderId: n.data?.order_id,
          chatId: n.data?.chat_id,
          action: n.action, // Action button info from API
        };
      });
      set({ notifications: data, unreadCount: data.filter((n: any) => !n.read).length });
    } catch (e) {
      console.error('Error fetching notifications:', e);
    }
  },

  fetchUnreadCount: async () => {
    try {
      const apiClient = (await import('@/lib/api/client')).default;
      const res: any = await apiClient.get('/notifications/unread-count');
      // Fix: res.data is already { unreadCount: ... }
      const count = res.data?.unreadCount ?? 0;
      set({ unreadCount: count });
    } catch (e) {
      console.error('Error fetching unread count:', e);
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
      console.error('Error marking as read:', e);
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
      console.error('Error marking all as read:', e);
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
      console.error('Error deleting notification:', e);
    }
  },

  deleteAllNotifications: async (type?: string) => {
    set((state) => {
      const filtered = state.notifications.filter(n => {
        if (!type || type === 'all') return false; // Delete all
        if (type === 'unread') return n.read; // Keep read, delete unread
        return n.type !== type; // Delete specific type
      });
      return {
        notifications: filtered,
        unreadCount: filtered.filter((n) => !n.read).length,
      };
    });
    
    try {
      const apiClient = (await import('@/lib/api/client')).default;
      await apiClient.delete('/notifications/delete-all', { params: { type } });
    } catch (e) {
      console.error('Error deleting all notifications:', e);
    }
  },
  
  getUnreadCount: () => {
    return get().unreadCount;
  },

  initEcho: (userId: string) => {
    activeEchoUserId = userId;
    import('@/lib/echo').then(({ getEcho }) => {
      try {
        const echo = getEcho();
        const channel = echo.private(`users.${userId}`);
        channel.listen('.NewNotification', (e: any) => {
           get().fetchNotifications();
           toast({
             variant: "default",
             title: e.title || "Notifikasi Baru",
             description: e.message || "Anda memiliki notifikasi baru."
           });
        });
      } catch (e) {
        console.info('Reverb echo not active');
      }
    });

    // Polling removed - using Pusher/Echo for real-time updates
    if (pollingIntervalId) clearInterval(pollingIntervalId);
  },

  cleanupEcho: () => {
    if (pollingIntervalId) {
      clearInterval(pollingIntervalId);
      pollingIntervalId = null;
    }

    if (activeEchoUserId) {
      const userId = activeEchoUserId;
      activeEchoUserId = null;
      import('@/lib/echo').then(({ getEcho }) => {
        try {
          const echo = getEcho();
          echo.private(`users.${userId}`).stopListening('.NewNotification');
          echo.leave(`users.${userId}`);
        } catch (e) {
          // Ignore
        }
      });
    }
  }
}));
