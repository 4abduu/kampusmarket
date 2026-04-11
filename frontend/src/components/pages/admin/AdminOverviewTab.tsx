import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, ShoppingCart, DollarSign, AlertTriangle, Wallet, BarChart3, PieChart, Activity, ArrowUpRight, ArrowDownRight, Clock, GraduationCap } from "lucide-react";

interface AdminOverviewTabProps {
  stats: {
    totalUsers: number;
    activeProducts: number;
    pendingOrders: number;
    platformRevenue: number;
    pendingReports: number;
    pendingWithdrawals: number;
    totalFaculties: number;
  };
  orders: Array<{ status: string }>;
  formatPrice: (price: number) => string;
  onOpenTab: (tab: string) => void;
}

export default function AdminOverviewTab({ stats, orders, formatPrice, onOpenTab }: AdminOverviewTabProps) {
  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total User", value: stats.totalUsers.toLocaleString(), icon: Users, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30", trend: "+12%", trendUp: true },
          { title: "Produk Aktif", value: stats.activeProducts.toLocaleString(), icon: Package, color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30", trend: "+8%", trendUp: true },
          { title: "Transaksi Pending", value: stats.pendingOrders.toString(), icon: Clock, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30" },
          { title: "Pendapatan Platform", value: formatPrice(stats.platformRevenue), icon: DollarSign, color: "text-primary-600", bg: "bg-primary-100 dark:bg-primary-900/30", trend: "+15%", trendUp: true },
        ].map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{stat.title}</span>
                <div className={`p-2 rounded-lg ${stat.bg}`}><stat.icon className={`h-4 w-4 ${stat.color}`} /></div>
              </div>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold">{stat.value}</p>
                {stat.trend && <span className={`text-sm flex items-center ${stat.trendUp ? "text-primary-600" : "text-red-600"}`}>{stat.trendUp ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}{stat.trend}</span>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Activity className="h-5 w-5" />Tren Transaksi</CardTitle></CardHeader>
          <CardContent><div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-lg"><div className="text-center"><BarChart3 className="h-16 w-16 text-muted-foreground/30 mx-auto mb-2" /><p className="text-sm text-muted-foreground">Grafik Tren Transaksi</p><p className="text-xs text-muted-foreground">Line Chart - 30 hari terakhir</p></div></div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><PieChart className="h-5 w-5" />Distribusi Kategori</CardTitle></CardHeader>
          <CardContent><div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-lg"><div className="text-center"><PieChart className="h-16 w-16 text-muted-foreground/30 mx-auto mb-2" /><p className="text-sm text-muted-foreground">Pie Chart Kategori</p><p className="text-xs text-muted-foreground">Elektronik, Buku, Fashion, dll</p></div></div></CardContent>
        </Card>
      </div>

      <div className="grid sm:grid-cols-4 gap-4">
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
          <CardContent className="p-4 flex items-center gap-4"><div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-800 flex items-center justify-center"><AlertTriangle className="h-6 w-6 text-amber-600" /></div><div><p className="font-bold text-2xl">{stats.pendingReports}</p><p className="text-sm text-muted-foreground">Laporan Pending</p></div><Button size="sm" className="ml-auto" onClick={() => onOpenTab("reports")}>Tinjau</Button></CardContent>
        </Card>
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="p-4 flex items-center gap-4"><div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center"><Wallet className="h-6 w-6 text-blue-600" /></div><div><p className="font-bold text-2xl">{stats.pendingWithdrawals}</p><p className="text-sm text-muted-foreground">Penarikan Pending</p></div><Button size="sm" className="ml-auto" onClick={() => onOpenTab("finance")}>Proses</Button></CardContent>
        </Card>
        <Card className="border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20">
          <CardContent className="p-4 flex items-center gap-4"><div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-800 flex items-center justify-center"><ShoppingCart className="h-6 w-6 text-purple-600" /></div><div><p className="font-bold text-2xl">{orders.filter((o) => o.status === "pending").length}</p><p className="text-sm text-muted-foreground">Order Pending</p></div><Button size="sm" className="ml-auto" onClick={() => onOpenTab("orders")}>Lihat</Button></CardContent>
        </Card>
        <Card className="border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-900/20">
          <CardContent className="p-4 flex items-center gap-4"><div className="w-12 h-12 rounded-full bg-cyan-100 dark:bg-cyan-800 flex items-center justify-center"><GraduationCap className="h-6 w-6 text-cyan-600" /></div><div><p className="font-bold text-2xl">{stats.totalFaculties}</p><p className="text-sm text-muted-foreground">Fakultas</p></div><Button size="sm" className="ml-auto" onClick={() => onOpenTab("faculties")}>Kelola</Button></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Aktivitas Terbaru</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { type: "user", action: "User baru mendaftar", name: "Dewi Lestari", time: "5 menit lalu" },
              { type: "order", action: "Transaksi selesai", name: "Invoice #1234", time: "15 menit lalu" },
              { type: "report", action: "Laporan baru diterima", name: "User melaporkan produk", time: "30 menit lalu" },
              { type: "withdrawal", action: "Penarikan diajukan", name: "Rp 500.000", time: "1 jam lalu" },
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  {activity.type === "user" && <Users className="h-4 w-4 text-blue-600" />}
                  {activity.type === "order" && <ShoppingCart className="h-4 w-4 text-primary-600" />}
                  {activity.type === "report" && <AlertTriangle className="h-4 w-4 text-amber-600" />}
                  {activity.type === "withdrawal" && <Wallet className="h-4 w-4 text-purple-600" />}
                </div>
                <div className="flex-1"><p className="text-sm font-medium">{activity.action}</p><p className="text-xs text-muted-foreground">{activity.name}</p></div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
