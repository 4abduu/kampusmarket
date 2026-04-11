"use client";

import { useEffect, useMemo, useState } from "react";
import type { MouseEvent } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import UserNotificationsHeader from "@/components/pages/user/notifications/UserNotificationsHeader";
import UserNotificationsList from "@/components/pages/user/notifications/UserNotificationsList";
import UserNotificationsTabs from "@/components/pages/user/notifications/UserNotificationsTabs";
import type { Notification } from "@/lib/notification-store";
import { useNotificationStore } from "@/lib/notification-store";
import type {
  NotificationFilter,
  UserNotificationsPageProps,
} from "@/components/pages/user/notifications/notifications.types";

export default function UserNotificationsPage({ onNavigate }: UserNotificationsPageProps) {
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotificationStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      const unreadIds = notifications.filter((notification) => !notification.read).map((notification) => notification.id);
      unreadIds.forEach((id) => markAsRead(id));
    }, 2000);

    return () => clearTimeout(timer);
  }, [notifications, markAsRead]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      if (filter === "all") return true;
      if (filter === "unread") return !notification.read;
      return notification.type === filter;
    });
  }, [filter, notifications]);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    if (notification.type === "order" && notification.orderId) {
      onNavigate("order-detail", notification.orderId);
      return;
    }

    if (notification.type === "chat" && notification.chatId) {
      onNavigate("chat", notification.chatId);
      return;
    }

    if (notification.type === "review" && notification.orderId) {
      onNavigate("rating", notification.orderId);
    }
  };

  const handleDeleteNotification = (event: MouseEvent, id: number) => {
    event.stopPropagation();
    deleteNotification(id);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <UserNotificationsHeader
          unreadCount={unreadCount}
          onBack={() => onNavigate("landing")}
          onMarkAllAsRead={markAllAsRead}
        />

        <Tabs value={filter} onValueChange={(value) => setFilter(value as NotificationFilter)} className="w-full">
          <UserNotificationsTabs unreadCount={unreadCount} />

          <TabsContent value={filter} className="mt-0">
            <UserNotificationsList
              notifications={filteredNotifications}
              onClickNotification={handleNotificationClick}
              onDeleteNotification={handleDeleteNotification}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
