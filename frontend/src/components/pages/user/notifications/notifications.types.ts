import type { Notification } from "@/lib/notification-store";

export type NotificationFilter = "all" | "unread" | Notification["type"];

export interface UserNotificationsPageProps {
  onNavigate: (page: string, data?: string) => void;
}
