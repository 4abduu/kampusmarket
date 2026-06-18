import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import { AlertCircle, Building2, Package, ReceiptText, Settings, Star, TrendingUp, Wallet } from "lucide-react";

type SidebarUser = {
  name: string;
  email: string;
  faculty: string | null;
  facultyName?: string;
  avatar?: string;
};

type Props = {
  currentUser: SidebarUser;
  rating: number;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  getFacultyName: (id: string | null) => string;
  hasDebt?: boolean;
};

export default function UserDashboardSidebar({
  currentUser,
  rating,
  activeTab,
  setActiveTab,
  getFacultyName,
  hasDebt = false,
}: Props) {
  const navItems = [
    { id: "overview", label: "Dashboard", icon: TrendingUp },
    { id: "products", label: "Produk & Jasa", icon: Package },
    { id: "orders", label: "Pesanan", icon: ReceiptText },
    { id: "wallet", label: "Dompet", icon: Wallet },
    ...(hasDebt ? [{ id: "debts", label: "Tunggakan Komisi", icon: AlertCircle, isAlert: true }] : []),
    { id: "settings", label: "Pengaturan", icon: Settings },
  ];
  return (
    <aside className="lg:col-span-1">
      {/* Mobile: Grid Icon Tabs */}
      <div className="lg:hidden mb-6 bg-white dark:bg-slate-800 rounded-xl p-2 sm:p-3 shadow-sm border border-slate-100 dark:border-slate-700">
        <div 
          className="grid gap-1 sm:gap-2" 
          style={{ gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))` }}
        >
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center gap-1.5 p-1.5 sm:p-2 rounded-lg transition-all ${
                activeTab === item.id
                  ? "alert" in item && item.isAlert
                    ? "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    : "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 font-medium"
                  : "alert" in item && item.isAlert
                    ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <div className="relative">
                <item.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${activeTab === item.id ? "scale-110" : ""} transition-transform`} />
                {"isAlert" in item && item.isAlert && (
                  <span className="absolute -top-1 -right-1 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-red-500 border border-white dark:border-slate-800 animate-pulse" />
                )}
              </div>
              <span className="text-[9px] sm:text-[10px] text-center leading-tight line-clamp-1 w-full">{item.label === "Tunggakan Komisi" ? "Tunggakan" : item.label === "Produk & Jasa" ? "Produk" : item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Desktop: Original vertical sidebar card */}
      <Card className="sticky top-20 hidden lg:block">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <Avatar className="h-20 w-20 mx-auto mb-3">
              {currentUser.avatar && (
                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
              )}
              <AvatarFallback className="bg-primary-100 text-primary-700 text-xl">
                {currentUser.name.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <h2 className="font-bold text-lg">{currentUser.name}</h2>
            <p className="text-sm text-muted-foreground">{currentUser.email}</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                <Building2 className="h-3 w-3 mr-1" />
                {currentUser.facultyName || getFacultyName(currentUser.faculty)}
              </Badge>
            </div>
            <Badge variant="outline" className="mt-2">
              <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
              {rating} Rating
            </Badge>
          </div>

          <div className="h-px bg-border mb-4" />

          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeTab === item.id
                    ? "alert" in item && item.isAlert
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      : "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                    : "alert" in item && item.isAlert
                      ? "hover:bg-red-50 text-red-600 dark:hover:bg-red-900/20 dark:text-red-400"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {"isAlert" in item && item.isAlert && (
                  <span className="h-2 w-2 rounded-full bg-red-500 flex-shrink-0 animate-pulse" />
                )}
              </button>
            ))}
          </nav>
        </CardContent>
      </Card>
    </aside>
  );
}

