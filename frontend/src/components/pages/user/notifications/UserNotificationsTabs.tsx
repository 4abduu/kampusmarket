import { Badge } from "@/components/ui/badge";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UserNotificationsTabsProps {
  unreadCount: number;
}

export default function UserNotificationsTabs({
  unreadCount,
}: UserNotificationsTabsProps) {
  return (
    <TabsList className="w-full h-auto flex overflow-x-auto justify-start [scrollbar-width:none] [ms-overflow-style:none] gap-1 p-1 mb-4">
      <TabsTrigger value="all" className="flex-none whitespace-nowrap px-3">Semua</TabsTrigger>
      <TabsTrigger value="unread" className="relative flex-none whitespace-nowrap px-3">
        Belum Dibaca
        {unreadCount > 0 && (
          <Badge className="ml-1 h-4 w-4 p-0 text-[10px] bg-red-500">
            {unreadCount}
          </Badge>
        )}
      </TabsTrigger>
      <TabsTrigger value="order" className="flex-none whitespace-nowrap px-3">Pesanan</TabsTrigger>
      <TabsTrigger value="chat" className="flex-none whitespace-nowrap px-3">Chat</TabsTrigger>
    </TabsList>
  );
}
