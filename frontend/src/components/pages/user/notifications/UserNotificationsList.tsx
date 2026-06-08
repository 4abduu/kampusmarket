import type { MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell, ChevronRight, Clock, Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Notification } from "@/lib/notification-store";

interface UserNotificationsListProps {
  notifications: Notification[];
  onClickNotification: (notification: Notification) => void;
  onDeleteNotification: (event: MouseEvent, id: string) => void;
}

export default function UserNotificationsList({
  notifications,
  onClickNotification,
  onDeleteNotification,
}: UserNotificationsListProps) {
  const navigate = useNavigate();

  const handleActionClick = (e: MouseEvent, notification: Notification) => {
    e.stopPropagation();
    if (!notification.link) return;

    const link = notification.link;

    if (link.startsWith("/order-detail/")) {
      navigate(link);
      return;
    }

    if (link.startsWith("/rating/")) {
      const id = link.replace("/rating/", "");
      navigate(`/order-detail/${id}`);
      return;
    }

    if (link === "/chat") {
      navigate("/chat");
      return;
    }

    if (link === "/dashboard/wallet" || link.startsWith("/wallet")) {
      navigate("/dashboard/wallet");
      return;
    }

    // Fallback: navigate langsung ke link yang diberikan
    navigate(link);
  };

  return (
    <ScrollArea className="h-[calc(100vh-280px)]">
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">Tidak ada notifikasi</p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => {
            return (
              <Card
                key={notification.id}
                onClick={() => onClickNotification(notification)}
                className={`cursor-pointer transition-all hover:shadow-md group ${
                  !notification.read
                    ? "border-l-4 border-l-primary-500 bg-primary-50/50 dark:bg-primary-900/10"
                    : "hover:border-slate-300"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${notification.iconBg}`}>
                      <notification.icon
                        className={`h-4 w-4 ${notification.iconColor}`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`font-medium ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}
                        >
                          {notification.title}
                        </p>
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <Badge
                              variant="secondary"
                              className="text-xs bg-primary-100 text-primary-700 shrink-0"
                            >
                              Baru
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(event) =>
                              onDeleteNotification(event, notification.id)
                            }
                          >
                            <Trash2 className="h-3 w-3 text-muted-foreground hover:text-red-500" />
                          </Button>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>

                      <div className="flex items-center justify-between mt-2 gap-2">
                        <p className="text-xs text-muted-foreground/70 flex items-center gap-1 shrink-0">
                          <Clock className="h-3 w-3" />
                          {notification.timeRelative ?? notification.time}
                        </p>

                        {/* Plain blue text link */}
                        {notification.link && (
                          <button
                            onClick={(e) => handleActionClick(e, notification)}
                            className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-0.5 transition-colors"
                          >
                            {notification.link === "/dashboard/wallet" || notification.link.startsWith("/wallet")
                              ? "Lihat saldo"
                              : notification.type === "order"
                                ? "Lihat pesanan"
                                : notification.type === "chat"
                                  ? "Buka chat"
                                  : notification.type === "review"
                                    ? "Lihat review"
                                    : notification.type === "withdrawal"
                                      ? "Lihat dompet"
                                      : "Lihat detail"}
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </ScrollArea>
  );
}
