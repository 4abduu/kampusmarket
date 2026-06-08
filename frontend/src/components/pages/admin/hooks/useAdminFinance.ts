import { useState, useMemo, useEffect } from "react";
import type { Withdrawal } from "@/lib/mock-data";
import { adminWithdrawalsApi, adminTopUpsApi, adminDebtsApi, adminDashboardApi, type AdminTopUp, type AdminTopUpStats } from "@/lib/api/admin";
import { useAdminDataMapping } from "./useAdminDataMapping";

const ITEMS_PER_PAGE = 10;

interface FinanceProps {
  markResourceLoaded: (key: string) => void;
  showSuccess: (msg: string) => void;
  stats: any | null;
}

export function useAdminFinance({
  markResourceLoaded,
  showSuccess,
  stats,
}: FinanceProps) {
  const { mapWithdrawals } = useAdminDataMapping();

  const [financeSubTab, setFinanceSubTab] = useState<
    "withdrawals" | "revenue" | "topups" | "debts"
  >("withdrawals");

  // Withdrawals
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(false);
  const [withdrawalsError, setWithdrawalsError] = useState<string | null>(null);
  const [withdrawalSearchTerm, setWithdrawalSearchTerm] = useState("");
  const [withdrawalStatusFilter, setWithdrawalStatusFilter] = useState<
    | "all"
    | "pending"
    | "approved"
    | "processing"
    | "completed"
    | "failed"
    | "rejected"
  >("all");
  const [withdrawalAccountTypeFilter, setWithdrawalAccountTypeFilter] =
    useState<"all" | "bank" | "e_wallet">("all");
  const [withdrawalProviderFilter, setWithdrawalProviderFilter] =
    useState<string>("all");
  const [withdrawalPage, setWithdrawalPage] = useState(1);
  const [financialModalOpen, setFinancialModalOpen] = useState(false);
  const [financialModalVariant, setFinancialModalVariant] = useState<
    "detail" | "approve" | "reject" | "finish" | "failed"
  >("detail");
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [financialLoading, setFinancialLoading] = useState(false);
  const [financialError, setFinancialError] = useState<string | null>(null);

  // Top Ups
  const [topups, setTopups] = useState<AdminTopUp[]>([]);
  const [topupLoading, setTopupLoading] = useState(false);
  const [topupError, setTopupError] = useState<string | null>(null);
  const [topupSearchTerm, setTopupSearchTerm] = useState("");
  const [debouncedTopupSearch, setDebouncedTopupSearch] = useState("");
  const [topupStatusFilter, setTopupStatusFilter] = useState<"all" | "pending" | "paid" | "failed">("all");
  const [topupPage, setTopupPage] = useState(1);
  const [topupTotalItems, setTopupTotalItems] = useState(0);
  const [topupTotalPages, setTopupTotalPages] = useState(1);
  const [topupStats, setTopupStats] = useState<AdminTopUpStats>({
    total_amount: 0,
    successful_amount: 0,
    pending_amount: 0,
    failed_amount: 0,
  });

  // Debts
  const [debts, setDebts] = useState<any[]>([]);
  const [debtsLoading, setDebtsLoading] = useState(false);
  const [debtsError, setDebtsError] = useState<string | null>(null);
  const [debtSearchTerm, setDebtSearchTerm] = useState("");
  const [debouncedDebtSearch, setDebouncedDebtSearch] = useState("");
  const [debtStatusFilter, setDebtStatusFilter] = useState<"all" | "unpaid" | "paid" | "overdue">("all");
  const [debtPage, setDebtPage] = useState(1);
  const [debtTotalItems, setDebtTotalItems] = useState(0);
  const [debtTotalPages, setDebtTotalPages] = useState(1);
  const [debtStats, setDebtStats] = useState<{
    total_unpaid_amount: number;
    total_overdue_amount: number;
    count_unpaid: number;
    count_overdue: number;
  }>({
    total_unpaid_amount: 0,
    total_overdue_amount: 0,
    count_unpaid: 0,
    count_overdue: 0,
  });

  // Revenue
  const [revenueModalOpen, setRevenueModalOpen] = useState(false);
  const [selectedRevenueTransaction, setSelectedRevenueTransaction] = useState<any | null>(null);
  const [platformRevenue, setPlatformRevenue] = useState<{
    total: number;
    thisMonth: number;
    lastMonth: number;
    pendingClearance: number;
    transactions: any[];
  }>({
    total: 0,
    thisMonth: 0,
    lastMonth: 0,
    pendingClearance: 0,
    transactions: [],
  });
  const [platformRevenueLoading, setPlatformRevenueLoading] = useState(false);
  const [platformRevenueError, setPlatformRevenueError] = useState<string | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTopupSearch(topupSearchTerm);
      setTopupPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [topupSearchTerm]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedDebtSearch(debtSearchTerm);
      setDebtPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [debtSearchTerm]);

  const loadWithdrawalsData = async () => {
    setWithdrawalsLoading(true);
    setWithdrawalsError(null);
    try {
      const res = await adminWithdrawalsApi.getWithdrawals({ per_page: 100 });
      if (res?.data && Array.isArray(res.data)) {
        setWithdrawals(mapWithdrawals(res.data));
      }
      markResourceLoaded("withdrawals");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal memuat penarikan";
      setWithdrawalsError(msg);
      console.error("Failed to load withdrawals data:", err);
    } finally {
      setWithdrawalsLoading(false);
    }
  };

  const loadTopupsData = async (
    page = topupPage,
    search = debouncedTopupSearch,
    status = topupStatusFilter
  ) => {
    setTopupLoading(true);
    setTopupError(null);
    try {
      const res = await adminTopUpsApi.getTopUps({
        page,
        search,
        status,
        per_page: ITEMS_PER_PAGE,
      });
      if (res) {
        setTopups(res.topups || []);
        setTopupStats(res.stats || {
          total_amount: 0,
          successful_amount: 0,
          pending_amount: 0,
          failed_amount: 0,
        });
        setTopupTotalItems(res.meta?.total || 0);
        setTopupTotalPages(res.meta?.last_page || 1);
      }
      markResourceLoaded("topups");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal memuat transaksi top up";
      setTopupError(msg);
      console.error("Failed to load topups data:", err);
    } finally {
      setTopupLoading(false);
    }
  };

  const loadDebtsData = async (
    page = debtPage,
    search = debouncedDebtSearch,
    status = debtStatusFilter
  ): Promise<boolean> => {
    setDebtsLoading(true);
    setDebtsError(null);
    try {
      const [res, statsRes] = await Promise.all([
        adminDebtsApi.getDebts({
          page,
          per_page: ITEMS_PER_PAGE,
          search,
          status,
        }),
        adminDebtsApi.getDebtStats(),
      ]);

      if (res?.data) {
        setDebts(res.data);
        setDebtTotalItems(res.meta?.total || 0);
        setDebtTotalPages(res.meta?.last_page || 1);
      }

      if (statsRes) {
        setDebtStats(statsRes);
      }
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal memuat data tunggakan";
      setDebtsError(msg);
      console.error("Failed to load debts:", err);
      return false;
    } finally {
      setDebtsLoading(false);
    }
  };

  const loadPlatformRevenueData = async () => {
    setPlatformRevenueLoading(true);
    setPlatformRevenueError(null);
    try {
      const res = await adminDashboardApi.getPlatformRevenue();
      if (res) {
        setPlatformRevenue({
          total: res.total || 0,
          thisMonth: res.thisMonth || 0,
          lastMonth: res.lastMonth || 0,
          pendingClearance: res.pendingClearance || 0,
          transactions: Array.isArray(res.transactions) ? res.transactions : [],
        });
      }
      markResourceLoaded("revenue");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal memuat rincian pendapatan platform";
      setPlatformRevenueError(msg);
      console.error("Failed to load platform revenue data:", err);
    } finally {
      setPlatformRevenueLoading(false);
    }
  };

  const loadStatsFallbackForFinance = async () => {
    if (stats) return;

    try {
      const apiStats = await adminDashboardApi.getStats();
      if (!apiStats) return;

      const statsData = (apiStats as any).data || apiStats;
      setPlatformRevenue((prev) => ({
        ...prev,
        total: statsData.platform_revenue || 0,
      }));
    } catch (err) {
      console.error("Failed to load stats fallback for finance tab:", err);
    }
  };

  const handleApproveWithdrawal = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setFinancialModalVariant("approve");
    setFinancialModalOpen(true);
  };

  const confirmApproveWithdrawal = () => {
    if (selectedWithdrawal) {
      const run = async () => {
        setFinancialLoading(true);
        setFinancialError(null);
        try {
          const updated = await adminWithdrawalsApi.approveWithdrawal(
            selectedWithdrawal.id,
          );
          const mapped = mapWithdrawals([updated])[0];
          setWithdrawals(
            withdrawals.map((w) => (w.id === mapped.id ? mapped : w)),
          );
          showSuccess(
            `Penarikan ${selectedWithdrawal.amount} berhasil disetujui`,
          );
          setFinancialModalOpen(false);
          setSelectedWithdrawal(null);
        } catch (err) {
          console.error(err);
          const msg = err instanceof Error ? err.message : "Gagal menyetujui penarikan";
          setFinancialError(msg);
          showSuccess(
            `Gagal menyetujui penarikan ${selectedWithdrawal.amount}`,
          );
        } finally {
          setFinancialLoading(false);
        }
      };
      void run();
    }
  };

  const handleRejectWithdrawal = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setFinancialModalVariant("reject");
    setFinancialModalOpen(true);
  };

  const confirmRejectWithdrawal = (reason: string) => {
    if (selectedWithdrawal && reason.trim()) {
      const run = async () => {
        setFinancialLoading(true);
        setFinancialError(null);
        try {
          const updated = await adminWithdrawalsApi.rejectWithdrawal(
            selectedWithdrawal.id,
            { rejectionReason: reason.trim() },
          );
          const mapped = mapWithdrawals([updated])[0];
          setWithdrawals(
            withdrawals.map((w) => (w.id === mapped.id ? mapped : w)),
          );
          showSuccess(
            `Penarikan ${selectedWithdrawal.amount} ditolak`,
          );
          setFinancialModalOpen(false);
          setSelectedWithdrawal(null);
        } catch (err) {
          console.error(err);
          const msg = err instanceof Error ? err.message : "Gagal menolak penarikan";
          setFinancialError(msg);
          showSuccess(
            `Gagal menolak penarikan ${selectedWithdrawal.amount}`,
          );
        } finally {
          setFinancialLoading(false);
        }
      };
      void run();
    }
  };

  const handleCompleteWithdrawal = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setFinancialModalVariant("finish");
    setFinancialModalOpen(true);
  };

  const confirmCompleteWithdrawal = () => {
    if (selectedWithdrawal) {
      const run = async () => {
        setFinancialLoading(true);
        setFinancialError(null);
        try {
          const updated = await adminWithdrawalsApi.completeWithdrawal(selectedWithdrawal.id);
          const mapped = mapWithdrawals([updated])[0];
          setWithdrawals(withdrawals.map((w) => (w.id === mapped.id ? mapped : w)));
          showSuccess(`Penarikan ${selectedWithdrawal.amount} berhasil diselesaikan`);
          setFinancialModalOpen(false);
          setSelectedWithdrawal(null);
        } catch (err) {
          console.error(err);
          const msg = err instanceof Error ? err.message : "Gagal menyelesaikan penarikan";
          setFinancialError(msg);
          showSuccess(`Gagal menyelesaikan penarikan ${selectedWithdrawal.amount}`);
        } finally {
          setFinancialLoading(false);
        }
      };
      void run();
    }
  };

  const handleProcessWithdrawal = (withdrawal: Withdrawal) => {
    const run = async () => {
      setFinancialLoading(true);
      setFinancialError(null);
      try {
        const updated = await adminWithdrawalsApi.processWithdrawal(withdrawal.id);
        const mapped = mapWithdrawals([updated])[0];
        setWithdrawals(withdrawals.map((w) => (w.id === mapped.id ? mapped : w)));
        showSuccess(`Penarikan ${withdrawal.amount} sedang diproses`);
        if (selectedWithdrawal && selectedWithdrawal.id === withdrawal.id) {
          setSelectedWithdrawal(mapped);
        }
      } catch (err) {
        console.error(err);
        showSuccess(`Gagal memproses penarikan ${withdrawal.amount}`);
      } finally {
        setFinancialLoading(false);
      }
    };
    void run();
  };

  const handleFailWithdrawal = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setFinancialModalVariant("failed");
    setFinancialModalOpen(true);
  };

  const confirmFailWithdrawal = (reason: string) => {
    if (selectedWithdrawal && reason.trim()) {
      const run = async () => {
        setFinancialLoading(true);
        setFinancialError(null);
        try {
          const updated = await adminWithdrawalsApi.failWithdrawal(selectedWithdrawal.id, { failureReason: reason.trim() });
          const mapped = mapWithdrawals([updated])[0];
          setWithdrawals(withdrawals.map((w) => (w.id === mapped.id ? mapped : w)));
          showSuccess(`Penarikan ${selectedWithdrawal.amount} ditandai gagal`);
          setFinancialModalOpen(false);
          setSelectedWithdrawal(null);
        } catch (err) {
          console.error(err);
          const msg = err instanceof Error ? err.message : "Gagal menandai gagal penarikan";
          setFinancialError(msg);
          showSuccess(`Gagal menandai penarikan ${selectedWithdrawal.amount} sebagai gagal`);
        } finally {
          setFinancialLoading(false);
        }
      };
      void run();
    }
  };

  const handleViewWithdrawal = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setFinancialModalVariant("detail");
    setFinancialModalOpen(true);
  };

  const handleViewRevenueTransaction = (transaction: any) => {
    setSelectedRevenueTransaction(transaction);
    setRevenueModalOpen(true);
  };

  const filteredWithdrawals = useMemo(() => {
    const commonBanks = [
      "bca",
      "mandiri",
      "bri",
      "bni",
      "bsi",
      "bank bca",
      "bank mandiri",
      "bank bri",
      "bank bni",
      "bank bsi",
    ];
    const commonEWallets = ["gopay", "ovo", "dana", "shopeepay", "linkaja"];

    return withdrawals.filter((withdrawal) => {
      const matchesSearch =
        withdrawalSearchTerm === "" ||
        withdrawal.user.name
          .toLowerCase()
          .includes(withdrawalSearchTerm.toLowerCase()) ||
        withdrawal.bankName
          .toLowerCase()
          .includes(withdrawalSearchTerm.toLowerCase()) ||
        withdrawal.accountNumber.includes(withdrawalSearchTerm) ||
        withdrawal.accountName
          .toLowerCase()
          .includes(withdrawalSearchTerm.toLowerCase());
      const matchesStatus =
        withdrawalStatusFilter === "all" ||
        withdrawal.status === withdrawalStatusFilter;
      const matchesAccountType =
        withdrawalAccountTypeFilter === "all" ||
        withdrawal.accountType === withdrawalAccountTypeFilter;
      let matchesProvider = true;
      if (withdrawalProviderFilter === "all") {
        matchesProvider = true;
      } else if (withdrawalProviderFilter === "bank_lainnya") {
        matchesProvider =
          withdrawal.accountType === "bank" &&
          !commonBanks.some((bank) =>
            withdrawal.bankName.toLowerCase().includes(bank),
          );
      } else if (withdrawalProviderFilter === "ewallet_lainnya") {
        matchesProvider =
          withdrawal.accountType === "e_wallet" &&
          !commonEWallets.some((wallet) =>
            withdrawal.bankName.toLowerCase().includes(wallet),
          );
      } else {
        matchesProvider = withdrawal.bankName
          .toLowerCase()
          .includes(withdrawalProviderFilter.toLowerCase());
      }
      return (
        matchesSearch && matchesStatus && matchesAccountType && matchesProvider
      );
    });
  }, [
    withdrawals,
    withdrawalSearchTerm,
    withdrawalStatusFilter,
    withdrawalAccountTypeFilter,
    withdrawalProviderFilter,
  ]);

  const getPaginatedData = <T,>(data: T[], page: number): T[] => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return data.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  const paginatedWithdrawals = useMemo(
    () => getPaginatedData(filteredWithdrawals, withdrawalPage),
    [filteredWithdrawals, withdrawalPage],
  );

  return {
    financeSubTab,
    setFinanceSubTab,
    withdrawals,
    setWithdrawals,
    withdrawalsLoading,
    setWithdrawalsLoading,
    withdrawalsError,
    setWithdrawalsError,
    withdrawalSearchTerm,
    setWithdrawalSearchTerm,
    withdrawalStatusFilter,
    setWithdrawalStatusFilter,
    withdrawalAccountTypeFilter,
    setWithdrawalAccountTypeFilter,
    withdrawalProviderFilter,
    setWithdrawalProviderFilter,
    withdrawalPage,
    setWithdrawalPage,
    financialModalOpen,
    setFinancialModalOpen,
    financialModalVariant,
    setFinancialModalVariant,
    selectedWithdrawal,
    setSelectedWithdrawal,
    financialLoading,
    setFinancialLoading,
    financialError,
    setFinancialError,
    topups,
    setTopups,
    topupLoading,
    setTopupLoading,
    topupError,
    setTopupError,
    topupSearchTerm,
    setTopupSearchTerm,
    debouncedTopupSearch,
    topupStatusFilter,
    setTopupStatusFilter,
    topupPage,
    setTopupPage,
    topupTotalItems,
    topupTotalPages,
    topupStats,
    setTopupStats,
    debts,
    setDebts,
    debtsLoading,
    setDebtsLoading,
    debtsError,
    setDebtsError,
    debtSearchTerm,
    setDebtSearchTerm,
    debouncedDebtSearch,
    debtStatusFilter,
    setDebtStatusFilter,
    debtPage,
    setDebtPage,
    debtTotalItems,
    debtTotalPages,
    debtStats,
    setDebtStats,
    revenueModalOpen,
    setRevenueModalOpen,
    selectedRevenueTransaction,
    setSelectedRevenueTransaction,
    platformRevenue,
    setPlatformRevenue,
    platformRevenueLoading,
    setPlatformRevenueLoading,
    platformRevenueError,
    setPlatformRevenueError,
    loadWithdrawalsData,
    loadTopupsData,
    loadDebtsData,
    loadPlatformRevenueData,
    loadStatsFallbackForFinance,
    handleApproveWithdrawal,
    confirmApproveWithdrawal,
    handleRejectWithdrawal,
    confirmRejectWithdrawal,
    handleCompleteWithdrawal,
    confirmCompleteWithdrawal,
    handleProcessWithdrawal,
    handleFailWithdrawal,
    confirmFailWithdrawal,
    handleViewWithdrawal,
    handleViewRevenueTransaction,
    filteredWithdrawals,
    paginatedWithdrawals,
  };
}
