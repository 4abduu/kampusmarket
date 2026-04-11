import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserNotificationsHeaderProps {
  unreadCount: number;
  onBack: () => void;
  onMarkAllAsRead: () => void;
}

export default function UserNotificationsHeader({
  unreadCount,
  onBack,
  onMarkAllAsRead,
}: UserNotificationsHeaderProps) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <Button variant="ghost" size="icon" onClick={onBack}>
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <div className="flex-1">
        <h1 className="text-2xl font-bold">Notifikasi</h1>
        <p className="text-sm text-muted-foreground">
          {unreadCount > 0 ? `${unreadCount} notifikasi belum dibaca` : "Semua notifikasi sudah dibaca"}
        </p>
      </div>
      {unreadCount > 0 && (
        <Button variant="outline" size="sm" onClick={onMarkAllAsRead}>
          <Check className="h-4 w-4 mr-1" />
          Tandai Dibaca
        </Button>
      )}
    </div>
  );
}
