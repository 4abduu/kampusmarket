import { useState } from "react";
import { adminDashboardApi } from "@/lib/api/admin";

interface OverviewProps {
  isResourceLoaded: (key: string) => boolean;
  markResourceLoaded: (key: string) => void;
  fetchCategoriesResource: () => Promise<boolean>;
}

export function useAdminOverview({
  isResourceLoaded,
  markResourceLoaded,
  fetchCategoriesResource,
}: OverviewProps) {
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [overviewError, setOverviewError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date>(new Date());

  const [stats, setStats] = useState<{
    totalUsers: number;
    activeProducts: number;
    pendingOrders: number;
    totalRevenue: number;
    platformRevenue: number;
    totalEscrow: number;
    pendingWithdrawals: number;
    pendingReports: number;
    totalFaculties: number;
    activeFaculties: number;
    pendingCancellations: number;
  } | null>(null);

  const [activitySummary, setActivitySummary] = useState<{
    newUsersThisWeek: number;
    newProductsThisWeek: number;
    newOrdersThisWeek: number;
    pendingReports: number;
    pendingWithdrawals: number;
  } | null>(null);

  const [revenueChartData, setRevenueChartData] = useState<
    Array<{ date: string; transactions: number; revenue: number }>
  >([]);

  const applyStatsData = (statsData: any) => {
    setStats({
      totalUsers: statsData.users?.total || 0,
      activeProducts: statsData.products?.active || 0,
      pendingOrders: statsData.orders?.pending || 0,
      totalRevenue: statsData.orders?.total_revenue || 0,
      platformRevenue: statsData.platform_revenue || 0,
      totalEscrow: statsData.total_escrow || 0,
      pendingWithdrawals: statsData.withdrawals?.pending || 0,
      pendingReports: statsData.reports?.pending || 0,
      totalFaculties: statsData.faculties?.total || 0,
      activeFaculties: statsData.faculties?.active || 0,
      pendingCancellations: statsData.pending_cancellations || 0,
    });
  };

  const loadOverviewData = async () => {
    setOverviewLoading(true);
    setOverviewError(null);
    try {
      const [apiStats, apiRevenueStats, apiActivitySummary] = await Promise.all(
        [
          adminDashboardApi.getStats(),
          adminDashboardApi.getRevenueStats(),
          adminDashboardApi.getActivitySummary(),
        ],
      );

      if (apiStats) {
        const statsData = (apiStats as any).data || apiStats;
        applyStatsData(statsData);
      }

      if (apiRevenueStats) {
        const revenueData = (apiRevenueStats as any).data || apiRevenueStats;
        const weekly = Array.isArray(revenueData?.weekly)
          ? revenueData.weekly
          : [];
        const chartData = weekly.map((item: any) => ({
          date: item.date || "",
          transactions: item.transactions || item.count || 1,
          revenue: item.revenue || item.total || 0,
        }));
        setRevenueChartData(chartData);
      }

      if (apiActivitySummary) {
        const summaryData =
          (apiActivitySummary as any).data || apiActivitySummary;
        setActivitySummary({
          newUsersThisWeek: summaryData.new_users_this_week || 0,
          newProductsThisWeek: summaryData.new_products_this_week || 0,
          newOrdersThisWeek: summaryData.new_orders_this_week || 0,
          pendingReports: summaryData.pending_reports || 0,
          pendingWithdrawals: summaryData.pending_withdrawals || 0,
        });
      }

      markResourceLoaded("overview");
      setLastUpdatedAt(new Date());

      // categories chart is also shown on overview — reuse if already loaded
      if (!isResourceLoaded("categories")) {
        await fetchCategoriesResource();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal memuat overview";
      setOverviewError(msg);
      console.error("Failed to load overview data:", err);
    } finally {
      setOverviewLoading(false);
    }
  };

  return {
    overviewLoading,
    overviewError,
    stats,
    activitySummary,
    revenueChartData,
    lastUpdatedAt,
    loadOverviewData,
  };
}
