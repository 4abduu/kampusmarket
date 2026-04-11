"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bell,
  Clock,
  ChevronRight,
  Check,
  ShieldAlert,
  AlertTriangle,
  DollarSign,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import { useAdminNotificationStore } from "@/lib/admin-notification-store";

interface AdminNotificationsPageProps {
  onNavigate: (page: string) => void;
}

export default function AdminNotificationsPage({ onNavigate }: AdminNotificationsPageProps) {
  const [filter, setFilter] = useState("all");
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useAdminNotificationStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      unreadIds.forEach(id => markAsRead(id));
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.read;
    return n.type === filter;
  });

  const moderationCount = notifications.filter((n) => n.type === "moderation" && !n.read).length;
  const disputeCount = notifications.filter((n) => n.type === "dispute" && !n.read).length;
  const withdrawalCount = notifications.filter((n) => n.type === "withdrawal" && !n.read).length;

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    if (notification.actionPage) {
      onNavigate(notification.actionPage);
    }
  };

  const handleDeleteNotification = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    deleteNotification(id);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => onNavigate("admin")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Bell className="h-6 w-6 text-amber-600" />
                Notifikasi Admin
              </h1>
              <p className="text-sm text-muted-foreground">
                {unreadCount > 0 ? `${unreadCount} notifikasi memerlukan perhatian` : "Tidak ada notifikasi baru"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                <Check className="h-4 w-4 mr-1" />
                Tandai Semua Dibaca
              </Button>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-800 flex items-center justify-center">
                  <ShieldAlert className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{moderationCount}</p>
                  <p className="text-xs text-muted-foreground">Perlu Moderasi</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-800 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{disputeCount}</p>
                  <p className="text-xs text-muted-foreground">Dispute Aktif</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{withdrawalCount}</p>
                  <p className="text-xs text-muted-foreground">Penarikan Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={filter} onValueChange={setFilter} className="w-full">
          <TabsList className="mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger value="all">Semua</TabsTrigger>
            <TabsTrigger value="unread" className="relative">
              Belum Dibaca
              {unreadCount > 0 && (
                <Badge className="ml-1 h-4 w-4 p-0 text-[10px] bg-red-500">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="moderation">Moderasi</TabsTrigger>
            <TabsTrigger value="dispute">Dispute</TabsTrigger>
            <TabsTrigger value="withdrawal">Penarikan</TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="mt-0">
            <ScrollArea className="h-[calc(100vh-400px)]">
              <div className="space-y-3">
                {filteredNotifications.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Bell className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                      <p className="text-muted-foreground">Tidak ada notifikasi</p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredNotifications.map((notification) => (
                    <Card
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`cursor-pointer transition-all hover:shadow-md group ${
                        !notification.read 
                          ? "border-l-4 border-l-amber-500 bg-amber-50/50 dark:bg-amber-900/10" 
                          : ""
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${notification.iconBg}`}>
                            <notification.icon className={`h-4 w-4 ${notification.iconColor}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className={`font-medium ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}>
                                {notification.title}
                              </p>
                              <div className="flex items-center gap-2">
                                {!notification.read && (
                                  <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700 shrink-0">
                                    Baru
                                  </Badge>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={(e) => handleDeleteNotification(e, notification.id)}
                                >
                                  <Trash2 className="h-3 w-3 text-muted-foreground hover:text-red-500" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-xs text-muted-foreground/70 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {notification.time}
                              </p>
                              {notification.action && (
                                <span className="text-xs text-amber-600 flex items-center gap-1">
                                  {notification.action}
                                  <ChevronRight className="h-3 w-3" />
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
