import { create } from "zustand";

interface ChatState {
  unreadCount: number;
  fetchUnreadCount: () => Promise<void>;
  setUnreadCount: (count: number) => void;
  incrementUnreadCount: () => void;
  decrementUnreadCount: () => void;
  initEcho: (userId: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  unreadCount: 0,

  fetchUnreadCount: async () => {
    try {
      const apiClient = (await import('@/lib/api/client')).default;
      const res: any = await apiClient.get('/chats/unread-count');
      set({ unreadCount: res.data?.unreadCount ?? 0 });
    } catch (e) {
      console.error('Error fetching chat unread count:', e);
    }
  },

  setUnreadCount: (count: number) => set({ unreadCount: count }),

  incrementUnreadCount: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
  
  decrementUnreadCount: () => set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),

  initEcho: (userId: string) => {
    import('@/lib/echo').then(({ getEcho }) => {
      try {
        const echo = getEcho();
        const channel = echo.private(`users.${userId}`);
        
        // Listen for new message notifications to update unread count
        channel.listen('.NewMessageNotification', () => {
          get().fetchUnreadCount();
        });
      } catch (e) {
        // Echo might not be available
      }
    });
  }
}));
