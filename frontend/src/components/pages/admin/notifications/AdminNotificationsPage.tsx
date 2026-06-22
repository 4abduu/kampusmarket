"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useNavigate } from "react-router-dom";
import { useAdminNotificationStore } from "@/lib/admin-notification-store";

interface AdminNotificationsPageProps {
  onNavigate: (page: string) => void;
}

export default function AdminNotificationsPage({ onNavigate }: AdminNotificationsPageProps) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const { notifications, adminStats, markAsRead, markAllAsRead, deleteNotification, fetchNotifications, fetchAdminStats } = useAdminNotificationStore();

  const [isLoadingCounts, setIsLoadingCounts] = useState(true);

  // 1. Initial load: fetch notifications and mark as read if there are any unread
  useEffect(() => {
    let cancelled = false;
    fetchNotifications().then(() => {
      if (cancelled) return;
      const fresh = useAdminNotificationStore.getState().notifications;
      if (fresh.some((n) => !n.read)) markAllAsRead();
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Real-time stats
  useEffect(() => {
    let cancelled = false;

    const fetchRealCounts = async () => {
      // Don't show skeleton if we already have data in the store
      if (adminStats.moderation === 0 && adminStats.dispute === 0 && adminStats.withdrawal === 0) {
        setIsLoadingCounts(true);
      }
      
      try {
        await fetchAdminStats();
      } finally {
        if (!cancelled) setIsLoadingCounts(false);
      }
    };

    fetchRealCounts();

    return () => { cancelled = true; };
  }, [notifications.length]); // Tetap refetch saat length notif berubah (ada notif baru)

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.read;
    return n.type === filter;
  });

  const moderationCount = adminStats.moderation;
  const disputeCount    = adminStats.dispute;
  const withdrawalCount = adminStats.withdrawal;

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Navigate ke tab admin yang sesuai berdasarkan actionTab dari notifikasi
    if (notification.actionTab) {
      onNavigate(`admin/${notification.actionTab}`);
    } else if (notification.actionPage) {
      onNavigate(notification.actionPage);
    }
  };

  const handleDeleteNotification = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteNotification(id);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Bell className="h-6 w-6 text-amber-600" />
                Notifikasi Admin
              </h1>
              <p className="text-sm text-muted-foreground">
                {notifications.some(n => !n.read) ? `${notifications.filter(n => !n.read).length} notifikasi memerlukan perhatian` : "Tidak ada notifikasi baru"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {notifications.some(n => !n.read) && (
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
                  {isLoadingCounts ? (
                    <Skeleton className="h-8 w-12 mb-1" />
                  ) : (
                    <p className="text-2xl font-bold">{moderationCount}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Pembatalan Menunggu</p>
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
                  {isLoadingCounts ? (
                    <Skeleton className="h-8 w-12 mb-1" />
                  ) : (
                    <p className="text-2xl font-bold">{disputeCount}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Laporan Belum Ditindak</p>
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
                  {isLoadingCounts ? (
                    <Skeleton className="h-8 w-12 mb-1" />
                  ) : (
                    <p className="text-2xl font-bold">{withdrawalCount}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Penarikan Menunggu</p>
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
              {notifications.filter(n => !n.read).length > 0 && (
                <Badge className="ml-1 h-4 w-4 p-0 text-[10px] bg-red-500">
                  {notifications.filter(n => !n.read).length}
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
                                <span className="text-xs text-blue-500 flex items-center gap-1">
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
