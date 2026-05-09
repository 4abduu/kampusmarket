import { create } from "zustand";
import { Package, MessageCircle, CheckCircle } from "lucide-react";

export interface Notification {
  id: string;
  type: "order" | "chat" | "review" | "system";
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: any;
  iconColor: string;
  iconBg: string;
  orderId?: string;
  chatId?: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  getUnreadCount: () => number;
}

// Initial notifications removed

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
        if (type === 'payment') type = 'order';
        
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
        }
        
        return {
          id: n.id, // This is UUID string from NotificationResource
          type: type,
          title: n.title,
          message: n.message,
          time: n.createdAt || n.created_at, // Handle both camelCase and snake_case
          read: n.isRead !== undefined ? n.isRead : n.is_read, // Handle both camelCase and snake_case
          icon,
          iconColor,
          iconBg,
          orderId: n.data?.order_id,
          chatId: n.data?.chat_id,
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
  
  getUnreadCount: () => {
    return get().unreadCount;
  },

  initEcho: (userId: string) => {
    import('@/lib/echo').then(({ getEcho }) => {
      try {
        const echo = getEcho();
        const channel = echo.private(`users.${userId}`);
        channel.listen('.NewNotification', () => {
           get().fetchNotifications();
        });
      } catch (e) {
        console.info('Reverb echo not active');
      }
    });
  },

  cleanupEcho: () => {
    import('@/lib/echo').then(() => {
      // Nothing needed to explicitly clean up unless we want to unlisten
    });
  }
}));
