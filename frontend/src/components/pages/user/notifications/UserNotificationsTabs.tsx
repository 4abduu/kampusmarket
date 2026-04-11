import { Badge } from "@/components/ui/badge";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UserNotificationsTabsProps {
  unreadCount: number;
}

export default function UserNotificationsTabs({
  unreadCount,
}: UserNotificationsTabsProps) {
  return (
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
  );
}
