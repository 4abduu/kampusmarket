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
    <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
      <Button variant="ghost" size="icon" className="shrink-0" onClick={onBack}>
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <div className="flex-1 min-w-0">
        <h1 className="text-xl sm:text-2xl font-bold">Notifikasi</h1>
        <p className="text-xs sm:text-sm text-muted-foreground truncate">
          {unreadCount > 0 ? `${unreadCount} notifikasi belum dibaca` : "Semua notifikasi sudah dibaca"}
        </p>
      </div>
      {unreadCount > 0 && (
        <Button variant="outline" size="sm" className="shrink-0" onClick={onMarkAllAsRead}>
          <Check className="h-4 w-4 sm:mr-1" />
          <span className="hidden sm:inline">Tandai Dibaca</span>
        </Button>
      )}
    </div>
  );
}
