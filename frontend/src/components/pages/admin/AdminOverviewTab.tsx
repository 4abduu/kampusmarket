import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  Wallet,
  PieChartIcon as PieChartLucide,
  Activity,
  Clock,
  GraduationCap,
} from "lucide-react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

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
  activitySummary: {
    newUsersThisWeek: number;
    newProductsThisWeek: number;
    newOrdersThisWeek: number;
    pendingReports: number;
    pendingWithdrawals: number;
  };
  revenueChartData?: Array<{
    date: string;
    transactions: number;
    revenue: number;
  }>;
  categoryChartData?: Array<{ name: string; value: number; fill: string }>;
  formatPrice: (price: number) => string;
  onOpenTab: (tab: string) => void;
}

export default function AdminOverviewTab({
  stats,
  activitySummary,
  revenueChartData,
  categoryChartData,
  formatPrice,
  onOpenTab,
}: AdminOverviewTabProps) {
  // Fallback to empty data if not provided
  const transactionTrendData = revenueChartData || [];
  const categoryDistributionData = categoryChartData || [];
  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Total User",
            value: stats.totalUsers.toLocaleString(),
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-100 dark:bg-blue-900/30",
          },
          {
            title: "Produk Aktif",
            value: stats.activeProducts.toLocaleString(),
            icon: Package,
            color: "text-purple-600",
            bg: "bg-purple-100 dark:bg-purple-900/30",
          },
          {
            title: "Transaksi Pending",
            value: stats.pendingOrders.toString(),
            icon: Clock,
            color: "text-amber-600",
            bg: "bg-amber-100 dark:bg-amber-900/30",
          },
          {
            title: "Pendapatan Platform",
            value: formatPrice(stats.platformRevenue),
            icon: DollarSign,
            color: "text-primary-600",
            bg: "bg-primary-100 dark:bg-primary-900/30",
          },
        ].map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  {stat.title}
                </span>
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Tren Transaksi
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              15 hari terakhir - Jumlah transaksi dan pendapatan
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={transactionTrendData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="currentColor"
                  opacity={0.1}
                />
                <XAxis dataKey="date" stroke="currentColor" opacity={0.5} />
                <YAxis stroke="currentColor" opacity={0.5} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="transactions"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Transaksi"
                  dot={{ fill: "#3b82f6", r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChartLucide className="h-5 w-5" />
              Distribusi Kategori
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Produk aktif berdasarkan kategori
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={categoryDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) =>
                    value && typeof value === "number"
                      ? value.toLocaleString()
                      : value
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid sm:grid-cols-4 gap-4">
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-800 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="font-bold text-2xl">{stats.pendingReports}</p>
              <p className="text-sm text-muted-foreground">Laporan Pending</p>
            </div>
            <Button
              size="sm"
              className="ml-auto"
              onClick={() => onOpenTab("reports")}
            >
              Tinjau
            </Button>
          </CardContent>
        </Card>
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
              <Wallet className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="font-bold text-2xl">{stats.pendingWithdrawals}</p>
              <p className="text-sm text-muted-foreground">Penarikan Pending</p>
            </div>
            <Button
              size="sm"
              className="ml-auto"
              onClick={() => onOpenTab("finance")}
            >
              Proses
            </Button>
          </CardContent>
        </Card>
        <Card className="border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-800 flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="font-bold text-2xl">{stats.pendingOrders}</p>
              <p className="text-sm text-muted-foreground">Order Pending</p>
            </div>
            <Button
              size="sm"
              className="ml-auto"
              onClick={() => onOpenTab("orders")}
            >
              Lihat
            </Button>
          </CardContent>
        </Card>
        <Card className="border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-900/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-cyan-100 dark:bg-cyan-800 flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-cyan-600" />
            </div>
            <div>
              <p className="font-bold text-2xl">{stats.totalFaculties}</p>
              <p className="text-sm text-muted-foreground">Fakultas</p>
            </div>
            <Button
              size="sm"
              className="ml-auto"
              onClick={() => onOpenTab("faculties")}
            >
              Kelola
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Mingguan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                type: "user",
                label: "User baru minggu ini",
                value: activitySummary.newUsersThisWeek.toLocaleString(),
              },
              {
                type: "product",
                label: "Produk baru minggu ini",
                value: activitySummary.newProductsThisWeek.toLocaleString(),
              },
              {
                type: "order",
                label: "Order baru minggu ini",
                value: activitySummary.newOrdersThisWeek.toLocaleString(),
              },
              {
                type: "report",
                label: "Laporan pending",
                value: activitySummary.pendingReports.toLocaleString(),
              },
              {
                type: "withdrawal",
                label: "Withdrawal pending",
                value: activitySummary.pendingWithdrawals.toLocaleString(),
              },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  {activity.type === "user" && (
                    <Users className="h-4 w-4 text-blue-600" />
                  )}
                  {activity.type === "product" && (
                    <Package className="h-4 w-4 text-purple-600" />
                  )}
                  {activity.type === "order" && (
                    <ShoppingCart className="h-4 w-4 text-primary-600" />
                  )}
                  {activity.type === "report" && (
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                  )}
                  {activity.type === "withdrawal" && (
                    <Wallet className="h-4 w-4 text-purple-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.label}</p>
                </div>
                <span className="text-sm font-semibold">{activity.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
