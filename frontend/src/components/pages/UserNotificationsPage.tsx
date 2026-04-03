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
  Trash2,
  ArrowLeft,
} from "lucide-react";
import { useNotificationStore } from "@/lib/notification-store";

interface UserNotificationsPageProps {
  onNavigate: (page: string, data?: string) => void;
}

export default function UserNotificationsPage({ onNavigate }: UserNotificationsPageProps) {
  const [filter, setFilter] = useState("all");
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotificationStore();

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

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    if (notification.type === "order" && notification.orderId) {
      onNavigate("order-detail", notification.orderId);
    } else if (notification.type === "chat" && notification.chatId) {
      onNavigate("chat", notification.chatId);
    } else if (notification.type === "review" && notification.orderId) {
      onNavigate("rating", notification.orderId);
    }
  };

  const handleDeleteNotification = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    deleteNotification(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => onNavigate("landing")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Notifikasi</h1>
            <p className="text-sm text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} notifikasi belum dibaca` : "Semua notifikasi sudah dibaca"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
              <Check className="h-4 w-4 mr-1" />
              Tandai Dibaca
            </Button>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={filter} onValueChange={setFilter} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="all">Semua</TabsTrigger>
            <TabsTrigger value="unread" className="relative">
              Belum Dibaca
              {unreadCount > 0 && (
                <Badge className="ml-1 h-4 w-4 p-0 text-[10px] bg-red-500">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="order">Pesanan</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="mt-0">
            <ScrollArea className="h-[calc(100vh-280px)]">
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
                          ? "border-l-4 border-l-primary-500 bg-primary-50/50 dark:bg-primary-900/10" 
                          : "hover:border-slate-300"
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full ${notification.iconBg}`}>
                            <notification.icon className={`h-4 w-4 ${notification.iconColor}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className={`font-medium ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}>
                                {notification.title}
                              </p>
                              <div className="flex items-center gap-2">
                                {!notification.read && (
                                  <Badge variant="secondary" className="text-xs bg-primary-100 text-primary-700 shrink-0">
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
                              <p className="text-xs text-primary-600 flex items-center gap-1">
                                {notification.type === "order" && "Lihat Pesanan"}
                                {notification.type === "chat" && "Buka Chat"}
                                {notification.type === "review" && "Beri Rating"}
                                <ChevronRight className="h-3 w-3" />
                              </p>
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
