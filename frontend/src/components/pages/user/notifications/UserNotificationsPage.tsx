"use client";

import { useMemo, useState, useEffect } from "react";
import type { MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotificationStore();

  // Auto mark-all-read sekali saat halaman notif dibuka
  useEffect(() => {
    if (unreadCount > 0) {
      markAllAsRead();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


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

    // Gunakan notification.link dari backend sebagai sumber kebenaran routing
    if (notification.link) {
      // Untuk order-detail, chat, rating, wallet — langsung navigate via link
      const link = notification.link;

      if (link.startsWith("/order-detail/")) {
        const id = link.replace("/order-detail/", "").split(/[#?]/)[0];
        onNavigate("order-detail", id);
        return;
      }

      if (link.startsWith("/rating/")) {
        const id = link.replace("/rating/", "").split(/[#?]/)[0];
        onNavigate("order-detail", id);
        return;
      }

      if (link.startsWith("/product/") || link.startsWith("/service/")) {
        navigate(link);
        return;
      }

      if (link === "/chat") {
        onNavigate("chat");
        return;
      }

      if (link === "/dashboard/wallet" || link.startsWith("/wallet")) {
        onNavigate("dashboard", "wallet");
        return;
      }
    }

    // Fallback ke orderId jika ada (untuk order & payment)
    if ((notification.type === "order" || notification.type === "payment" || notification.type === "system") && notification.orderId) {
      onNavigate("order-detail", notification.orderId);
      return;
    }

    if (notification.type === "chat") {
      onNavigate("chat");
      return;
    }

    if (notification.type === "review" && notification.orderId) {
      onNavigate("order-detail", notification.orderId);
      return;
    }

    if (notification.type === "withdrawal") {
      onNavigate("dashboard", "wallet");
      return;
    }
  };

  const handleDeleteNotification = (event: MouseEvent, id: string) => {
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
