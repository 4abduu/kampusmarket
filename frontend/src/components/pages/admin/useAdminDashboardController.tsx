import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";

import { useAdminOverview } from "./hooks/useAdminOverview";
import { useAdminUsers } from "./hooks/useAdminUsers";
import { useAdminProducts } from "./hooks/useAdminProducts";
import { useAdminOrders } from "./hooks/useAdminOrders";
import { useAdminCancelRequests } from "./hooks/useAdminCancelRequests";
import { useAdminFinance } from "./hooks/useAdminFinance";
import { useAdminReports } from "./hooks/useAdminReports";
import { useAdminCategories } from "./hooks/useAdminCategories";
import { useAdminFaculties } from "./hooks/useAdminFaculties";
import { useAdminAddresses } from "./hooks/useAdminAddresses";

import { adminCategoriesApi } from "@/lib/api/admin";
import { facultiesApi } from "@/lib/api/faculties";
import type { Category, Product } from "@/lib/mock-data";
import { getInitials, seedFaculties } from "./admin-dashboard.shared";
import type { Faculty } from "./admin-dashboard.shared";
import { useAdminDataMapping } from "./hooks/useAdminDataMapping";
import { getFacultyName, CANCEL_REASONS } from "@/lib/mock-data";

const ITEMS_PER_PAGE = 10;

export function useAdminDashboardController() {
  const { section } = useParams<{ section?: string }>();
  const navigate = useNavigate();

  const activeTab = (section as string) ?? "overview";
  const setActiveTab = (tab: string) => {
    navigate(`/admin/${tab}`, { replace: false });
  };

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // --- UI States ---
  const [showWithdrawalFilters, setShowWithdrawalFilters] = useState(false);
  const [showOrderFilters, setShowOrderFilters] = useState(false);
  const [showUserFilters, setShowUserFilters] = useState(false);
  const [showProductFilters, setShowProductFilters] = useState(false);

  // --- Shared Resources State ---
  const [loadedResources, setLoadedResources] = useState<Record<string, boolean>>({});
  const isResourceLoaded = (key: string) => !!loadedResources[key];
  const markResourceLoaded = (key: string) => {
    setLoadedResources((prev) => ({ ...prev, [key]: true }));
  };

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const [faculties, setFaculties] = useState<Faculty[]>(seedFaculties);
  const [facultiesLoading, setFacultiesLoading] = useState(false);

  const { mapCategory, mapFaculty } = useAdminDataMapping();

  const fetchCategoriesResource = async (): Promise<boolean> => {
    if (isResourceLoaded("categories")) return true;
    setCategoriesLoading(true);
    try {
      const res = await adminCategoriesApi.getCategories();
      let dataArray = [];
      if (Array.isArray(res)) {
        dataArray = res;
      } else if (res && typeof res === "object" && "data" in res && Array.isArray((res as any).data)) {
        dataArray = (res as any).data;
      }
      setCategories(dataArray.map(mapCategory));

      markResourceLoaded("categories");
      return true;
    } catch (err) {
      console.error("Failed to fetch categories resource:", err);
      return false;
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchFacultiesResource = async (): Promise<boolean> => {
    if (isResourceLoaded("faculties")) return true;
    setFacultiesLoading(true);
    try {
      const res = await facultiesApi.listAdmin();
      let dataArray = [];
      if (Array.isArray(res)) {
        dataArray = res;
      } else if (res && typeof res === "object" && "data" in res && Array.isArray((res as any).data)) {
        dataArray = (res as any).data;
      }
      setFaculties(dataArray.map(mapFaculty));

      markResourceLoaded("faculties");
      return true;
    } catch (err) {
      console.error("Failed to fetch faculties resource:", err);
      return false;
    } finally {
      setFacultiesLoading(false);
    }
  };

  const invalidateCategories = () => setLoadedResources((prev) => ({ ...prev, categories: false }));
  const invalidateFaculties = () => setLoadedResources((prev) => ({ ...prev, faculties: false }));

  // --- Initialize Hooks ---
  const overviewTab = useAdminOverview({
    isResourceLoaded,
    markResourceLoaded,
    fetchCategoriesResource,
  });

  const usersTab = useAdminUsers({
    isResourceLoaded,
    markResourceLoaded,
    fetchFacultiesResource,
    showSuccess,
  });

  const productsTab = useAdminProducts({
    isResourceLoaded,
    markResourceLoaded,
    fetchCategoriesResource,
    showSuccess,
  });

  const ordersTab = useAdminOrders({
    isResourceLoaded,
    markResourceLoaded,
    fetchCategoriesResource,
  });

  const cancelRequestsTab = useAdminCancelRequests({
    markResourceLoaded,
    showSuccess,
  });

  const financeTab = useAdminFinance({
    markResourceLoaded,
    showSuccess,
    stats: overviewTab.stats,
  });

  const reportsTab = useAdminReports({
    markResourceLoaded,
    showSuccess,
    users: usersTab.users,
    setUsers: usersTab.setUsers,
  });

  const categoriesTab = useAdminCategories({
    categories,
    setCategories,
    invalidateCategories,
    showSuccess,
  });

  const facultiesTab = useAdminFaculties({
    faculties,
    setFaculties,
    invalidateFaculties,
    showSuccess,
  });

  const addressesTab = useAdminAddresses({
    markResourceLoaded,
  });

  // --- Lazy Loading Effect ---
  useEffect(() => {
    let cancelled = false;

    const runLoad = async () => {
      if (cancelled) return;

      switch (activeTab) {
        case "overview":
          if (!isResourceLoaded("overview")) {
            await overviewTab.loadOverviewData();
          }
          break;
        case "categories":
          if (!isResourceLoaded("categories")) {
            await fetchCategoriesResource();
          }
          break;
        case "faculties":
          if (!isResourceLoaded("faculties")) {
            await fetchFacultiesResource();
          }
          break;
        case "reports":
          if (!isResourceLoaded("reports")) {
            await reportsTab.loadReportsData();
          }
          break;
        case "finance":
          if (!isResourceLoaded("withdrawals")) {
            await financeTab.loadWithdrawalsData();
          }
          if (financeTab.financeSubTab === "topups" && !isResourceLoaded("topups")) {
            await financeTab.loadTopupsData();
          }
          if (!isResourceLoaded("revenue")) {
            await financeTab.loadPlatformRevenueData();
          }
          if (!overviewTab.stats) {
            await financeTab.loadStatsFallbackForFinance();
          }
          break;
        case "cancel-requests":
          if (!isResourceLoaded("cancel-requests")) {
            await cancelRequestsTab.loadCancelRequestsData();
          }
          break;
        case "orders":
          if (!isResourceLoaded("categories")) {
            await fetchCategoriesResource();
          }
          break;
        case "addresses":
          if (!isResourceLoaded("addresses")) {
            await addressesTab.loadAddressesData();
          }
          break;
        default:
          break;
      }
    };

    runLoad();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Load Finance Subtabs
  useEffect(() => {
    if (activeTab !== "finance") return;
    if (financeTab.financeSubTab === "topups") {
      void financeTab.loadTopupsData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeTab,
    financeTab.financeSubTab,
    financeTab.topupPage,
    financeTab.debouncedTopupSearch,
    financeTab.topupStatusFilter,
  ]);

  useEffect(() => {
    if (activeTab !== "finance") return;
    if (financeTab.financeSubTab === "debts") {
      void financeTab.loadDebtsData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeTab,
    financeTab.financeSubTab,
    financeTab.debtPage,
    financeTab.debouncedDebtSearch,
    financeTab.debtStatusFilter,
  ]);

  useEffect(() => {
    if (activeTab !== "users") return;
    void usersTab.loadUsersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeTab,
    usersTab.userPage,
    usersTab.debouncedUserSearch,
    usersTab.userStatusFilter,
    usersTab.userFacultyFilter,
  ]);

  useEffect(() => {
    if (activeTab !== "products") return;
    void productsTab.loadProductsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeTab,
    productsTab.productPage,
    productsTab.debouncedProductSearch,
    productsTab.productTypeFilter,
    productsTab.productConditionFilter,
    productsTab.productCategoryFilter,
    productsTab.productPriceMin,
    productsTab.productPriceMax,
    productsTab.productSellerFilter,
  ]);

  useEffect(() => {
    if (activeTab !== "orders") return;
    void ordersTab.loadOrdersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeTab,
    ordersTab.orderPage,
    ordersTab.debouncedOrderSearch,
    ordersTab.orderStatusFilter,
    ordersTab.orderTypeFilter,
    ordersTab.orderCategoryFilter,
    ordersTab.orderPaymentFilter,
  ]);

  // --- Formatting & UI Helpers ---
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

  const formatProductPrice = (product: Product) => {
    if (product.type === "jasa") {
      switch (product.priceType) {
        case "range":
          return `${formatPrice(product.priceMin || product.price)} - ${formatPrice(product.priceMax || product.price)}`;
        case "starting":
          return `Mulai ${formatPrice(product.price)}`;
        case "fixed":
        default:
          return formatPrice(product.price);
      }
    }
    return formatPrice(product.price);
  };

  const getReportStatusBadge = (status: string) => {
    const config: Record<string, { variant: any; label: string; className?: string }> = {
      pending: { variant: "outline", label: "Menunggu", className: "border-amber-500 text-amber-600" },
      resolved: { variant: "default", label: "Selesai", className: "bg-primary text-white hover:bg-primary/90" },
      warning: { variant: "secondary", label: "Warning", className: "bg-amber-500 text-white hover:bg-amber-600" },
      banned: { variant: "destructive", label: "Banned", className: "bg-red-600 text-white hover:bg-red-700" },
      dismissed: { variant: "destructive", label: "Ditolak", className: "bg-red-500 text-white hover:bg-red-600" },
    };
    const c = config[status] || config.pending;
    return <Badge variant={c.variant} className={c.className}>{c.label}</Badge>;
  };

  const getWithdrawalStatusBadge = (status: string) => {
    const config: Record<string, { variant: any; label: string; className?: string }> = {
      pending: { variant: "outline", label: "Menunggu", className: "border-amber-500 text-amber-600" },
      approved: { variant: "secondary", label: "Disetujui", className: "bg-blue-500 text-white hover:bg-blue-600" },
      processing: { variant: "secondary", label: "Diproses", className: "bg-purple-500 text-white hover:bg-purple-600" },
      completed: { variant: "default", label: "Selesai", className: "bg-green-600 text-white hover:bg-green-700" },
      failed: { variant: "destructive", label: "Gagal", className: "bg-red-600 text-white hover:bg-red-700" },
      rejected: { variant: "destructive", label: "Ditolak", className: "bg-red-500 text-white hover:bg-red-600" },
    };
    const c = config[status] || config.pending;
    return <Badge variant={c.variant} className={c.className}>{c.label}</Badge>;
  };

  const getOrderStatusBadge = (status: string) => {
    const config: Record<string, { variant: any; label: string; className?: string }> = {
      pending: { variant: "outline", label: "Menunggu Pembayaran", className: "border-amber-500 text-amber-600" },
      processing: { variant: "secondary", label: "Diproses", className: "bg-blue-500 text-white" },
      shipped: { variant: "secondary", label: "Dikirim", className: "bg-purple-500 text-white" },
      delivered: { variant: "secondary", label: "Sampai", className: "bg-teal-500 text-white" },
      completed: { variant: "default", label: "Selesai", className: "bg-green-600 text-white" },
      cancelled: { variant: "destructive", label: "Dibatalkan", className: "bg-red-600 text-white" },
    };
    const c = config[status] || config.pending;
    return <Badge variant={c.variant} className={c.className}>{c.label}</Badge>;
  };

  const getPaymentStatusBadge = (status: string) => {
    const config: Record<string, { variant: any; label: string; className?: string }> = {
      pending: { variant: "outline", label: "Pending", className: "border-amber-500 text-amber-600" },
      paid: { variant: "secondary", label: "Dibayar", className: "bg-blue-500 text-white hover:bg-blue-600" },
      escrow: { variant: "secondary", label: "Di Escrow", className: "bg-purple-500 text-white hover:bg-purple-600" },
      released: { variant: "default", label: "Dilepaskan", className: "bg-green-600 text-white hover:bg-green-700" },
      refunded: { variant: "destructive", label: "Dikembalikan", className: "bg-red-500 text-white hover:bg-red-600" },
      failed: { variant: "destructive", label: "Gagal", className: "bg-red-700 text-white hover:bg-red-800" },
    };
    const c = config[status] || config.pending;
    return <Badge variant={c.variant} className={c.className}>{c.label}</Badge>;
  };

  const facultyAccentClass = "bg-slate-700";
  const cancelReasons = CANCEL_REASONS;

  const getTotalPages = (totalItems: number) => Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

  const filteredUsers = usersTab.paginatedUsers;
  const filteredProducts = productsTab.paginatedProducts;

  const productCategoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
    id: cat.id,
    name: cat.name,
  }));

  const categoryChartData = categories.map((cat, idx) => {
    const colors = ["#3b82f6", "#8b5cf6", "#06b6d4", "#f59e0b", "#6b7280"];
    return {
      name: cat.name,
      value: (cat as any).productCount || 0,
      fill: colors[idx % colors.length],
    };
  });

  const renderPagination = (page: number, totalPages: number, onPageChange: (p: number) => void) => {
    if (totalPages <= 1) return null;
    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(Math.max(1, page - 1))}
              className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
          {Array.from({ length: totalPages }).map((_, i) => (
            <PaginationItem key={i}>
              <PaginationLink
                onClick={() => onPageChange(i + 1)}
                isActive={page === i + 1}
              >
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  const stats = overviewTab.stats || {
    totalUsers: 0,
    activeProducts: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    platformRevenue: 0,
    totalEscrow: 0,
    pendingWithdrawals: 0,
    pendingReports: 0,
    totalFaculties: faculties.length,
    activeFaculties: faculties.filter((faculty) => faculty.isActive).length,
    pendingCancellations: 0,
  };

  const activitySummary = overviewTab.activitySummary || {
    newUsersThisWeek: 0,
    newProductsThisWeek: 0,
    newOrdersThisWeek: 0,
    pendingReports: 0,
    pendingWithdrawals: 0,
  };

  return {
    activeTab,
    setActiveTab,
    successMessage,
    loadedResources,
    categories,
    faculties,
    categoriesLoading,
    facultiesLoading,

    showWithdrawalFilters, setShowWithdrawalFilters,
    showOrderFilters, setShowOrderFilters,
    showUserFilters, setShowUserFilters,
    showProductFilters, setShowProductFilters,

    formatPrice, formatProductPrice,
    getReportStatusBadge, getWithdrawalStatusBadge, getOrderStatusBadge, getPaymentStatusBadge,
    facultyAccentClass, getInitials, getFacultyName, cancelReasons,
    getTotalPages, renderPagination,

    ...overviewTab,
    ...usersTab,
    ...productsTab,
    ...ordersTab,
    ...cancelRequestsTab,
    ...financeTab,
    ...reportsTab,
    ...categoriesTab,
    ...facultiesTab,
    ...addressesTab,

    filteredUsers,
    filteredProducts,
    productCategoryOptions,
    categoryChartData,

    stats,
    activitySummary,
  };
}
