"use client";

import { useEffect } from "react";
import { Bell, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAdminNotificationStore } from "@/lib/admin-notification-store";

interface AdminNotificationPanelProps {
  onOpenTab: (tab: string) => void;
  onOpenNotifications: () => void;
}

export default function AdminNotificationPanel({
  onOpenTab,
  onOpenNotifications,
}: AdminNotificationPanelProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications } =
    useAdminNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const latestNotifications = notifications.slice(0, 4);
  const pendingNotifications = notifications.filter((notification) => !notification.read);

  const handleOpenNotification = (notification: (typeof notifications)[number]) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    if (notification.actionTab) {
      onOpenTab(notification.actionTab);
      return;
    }

    if (notification.actionPage === "admin") {
      onOpenTab("overview");
      return;
    }

    onOpenNotifications();
  };

  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5 text-amber-600" />
            Pusat Notifikasi Admin
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            {unreadCount > 0
              ? `${unreadCount} notifikasi butuh tindak lanjut`
              : "Semua notifikasi admin sudah dibaca"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              Tandai Dibaca
            </Button>
          )}
          <Button size="sm" onClick={onOpenNotifications}>
            Lihat Semua
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="bg-amber-100 text-amber-700">
            Belum dibaca: {unreadCount}
          </Badge>
          <Badge variant="secondary" className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            Total: {notifications.length}
          </Badge>
          <Badge variant="secondary" className="bg-red-100 text-red-700">
            Prioritas: {pendingNotifications.length}
          </Badge>
        </div>

        {latestNotifications.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-muted-foreground dark:border-slate-800">
            Belum ada notifikasi admin.
          </div>
        ) : (
          <div className="space-y-3">
            {latestNotifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => handleOpenNotification(notification)}
                className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition hover:border-amber-300 hover:bg-amber-50/60 dark:hover:border-amber-800 dark:hover:bg-amber-900/10 ${
                  notification.read
                    ? "border-slate-200 dark:border-slate-800"
                    : "border-amber-200 bg-amber-50/40 dark:border-amber-900 dark:bg-amber-900/10"
                }`}
              >
                <div className={`rounded-lg p-2 ${notification.iconBg}`}>
                  <notification.icon className={`h-4 w-4 ${notification.iconColor}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium">{notification.title}</p>
                    {!notification.read && (
                      <Badge className="bg-amber-500 text-white">Baru</Badge>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {notification.message}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {notification.time}
                    </span>
                    <span className="flex items-center gap-1 text-amber-600">
                      {notification.action || "Buka detail"}
                      <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
