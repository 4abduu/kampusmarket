import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactElement } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  getFacultyName,
  CANCEL_REASONS,
} from "@/lib/mock-data";
import type {
  User,
  Product,
  Category,
  Order,
  Report,
  Withdrawal,
  CancelRequest,
} from "@/lib/mock-data";
import type { Faculty } from "@/components/pages/admin/admin-dashboard.shared";
import {
  getInitials,
  seedFaculties,
} from "@/components/pages/admin/admin-dashboard.shared";
import { facultiesApi } from "@/lib/api/faculties";
import {
  adminCategoriesApi,
  adminDashboardApi,
  adminCancelRequestsApi,
  adminOrdersApi,
  adminProductsApi,
  adminUsersApi,
  adminReportsApi,
  adminWithdrawalsApi,
  adminAddressesApi,
  adminTopUpsApi,
} from "@/lib/api/admin";
import type { AdminAddressUser, AdminTopUp, AdminTopUpStats } from "@/lib/api/admin";

const ITEMS_PER_PAGE = 10;

export function useAdminDashboardController() {
  const { section } = useParams<{ section?: string }>();
  const navigate = useNavigate();

  const activeTab = (section as string) ?? "overview";
  const setActiveTab = (tab: string) => {
    navigate(`/admin/${tab}`, { replace: false });
  };

  const [showUserFilters, setShowUserFilters] = useState(false);
  const [showProductFilters, setShowProductFilters] = useState(false);
  const [showWithdrawalFilters, setShowWithdrawalFilters] = useState(false);
  const [showOrderFilters, setShowOrderFilters] = useState(false);

  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [userDetailLoading, setUserDetailLoading] = useState(false);
  const [userDetailError, setUserDetailError] = useState<string | null>(null);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showUnbanDialog, setShowUnbanDialog] = useState(false);
  const [userToAction, setUserToAction] = useState<User | null>(null);
  const [banReason, setBanReason] = useState("");
  const [unbanReason, setUnbanReason] = useState("");

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [productDetailLoading, setProductDetailLoading] = useState(false);
  const [productDetailError, setProductDetailError] = useState<string | null>(
    null,
  );
  const [showDeleteProductDialog, setShowDeleteProductDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [productDeleteReason, setProductDeleteReason] = useState("");

  const [reports, setReports] = useState<Report[]>([]);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [showBanReportDialog, setShowBanReportDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [financialModalOpen, setFinancialModalOpen] = useState(false);
  const [financialModalVariant, setFinancialModalVariant] = useState<'detail' | 'approve' | 'reject' | 'finish' | 'failed'>('detail');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [financialLoading, setFinancialLoading] = useState(false);
  const [financialError, setFinancialError] = useState<string | null>(null);

  const [revenueModalOpen, setRevenueModalOpen] = useState(false);
  const [selectedRevenueTransaction, setSelectedRevenueTransaction] = useState<any | null>(null);

  const [financeSubTab, setFinanceSubTab] = useState<
    "withdrawals" | "revenue" | "topups"
  >("withdrawals");

  const [cancelRequests, setCancelRequests] = useState<CancelRequest[]>([]);
  const [cancelRequestsLoading, setCancelRequestsLoading] = useState(false);
  const [showCancelApproveDialog, setShowCancelApproveDialog] = useState(false);
  const [showCancelRejectDialog, setShowCancelRejectDialog] = useState(false);
  const [selectedCancelRequest, setSelectedCancelRequest] =
    useState<CancelRequest | null>(null);
  const [cancelApproveNotes, setCancelApproveNotes] = useState("");
  const [cancelRejectReasonInput, setCancelRejectReasonInput] = useState("");
  const [cancelRequestRoleFilter, setCancelRequestRoleFilter] = useState<"all" | "pembeli" | "penjual">("all");

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showDeleteCategoryDialog, setShowDeleteCategoryDialog] =
    useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null,
  );
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    type: "barang" as "barang" | "jasa",
    description: "",
    sortOrder: 0,
    isActive: true,
  });
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const [categoryTypeFilter, setCategoryTypeFilter] = useState<
    "all" | "barang" | "jasa"
  >("all");

  const [faculties, setFaculties] = useState<Faculty[]>(seedFaculties);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [showFacultyDialog, setShowFacultyDialog] = useState(false);
  const [showDeleteFacultyDialog, setShowDeleteFacultyDialog] = useState(false);
  const [facultyToDelete, setFacultyToDelete] = useState<Faculty | null>(null);
  const [facultyForm, setFacultyForm] = useState<{
    name: string;
    code: string;
    description?: string;
    sortOrder: number;
    isActive: boolean;
  }>({
    name: "",
    code: "",
    description: "",
    sortOrder: 0,
    isActive: true,
  });
  const [facultySearchTerm, setFacultySearchTerm] = useState("");
  const [facultyStatusFilter, setFacultyStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [facultyPage, setFacultyPage] = useState(1);

  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [userStatusFilter, setUserStatusFilter] = useState<
    "all" | "active" | "banned" | "warned" | "unverified"
  >("all");
  const [userFacultyFilter, setUserFacultyFilter] = useState<string>("all");

  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [productTypeFilter, setProductTypeFilter] = useState<
    "all" | "barang" | "jasa"
  >("all");
  const [productConditionFilter, setProductConditionFilter] = useState<
    "all" | "baru" | "bekas"
  >("all");
  const [productCategoryFilter, setProductCategoryFilter] =
    useState<string>("all");
  const [productPriceMin, setProductPriceMin] = useState<string>("");
  const [productPriceMax, setProductPriceMax] = useState<string>("");
  const [productSellerFilter, setProductSellerFilter] = useState<string>("");

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

  // Top Up States
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

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTopupSearch(topupSearchTerm);
      setTopupPage(1);
    }, 400);
    return () => {
      clearTimeout(handler);
    };
  }, [topupSearchTerm]);

  useEffect(() => {
    if (activeTab === "finance" && financeSubTab === "topups") {
      loadTopupsData(topupPage, debouncedTopupSearch, topupStatusFilter);
    }
  }, [activeTab, financeSubTab, topupPage, debouncedTopupSearch, topupStatusFilter]);

  useEffect(() => {
    if (activeTab === "finance") {
      if (financeSubTab === "withdrawals" && !isResourceLoaded("withdrawals")) {
        void loadWithdrawalsData();
      } else if (financeSubTab === "revenue" && !isResourceLoaded("revenue")) {
        void loadPlatformRevenueData();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, financeSubTab]);

  const [addressSearchTerm, setAddressSearchTerm] = useState("");
  const [addressesData, setAddressesData] = useState<AdminAddressUser[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [addressesError, setAddressesError] = useState<string | null>(null);

  const [orders, setOrders] = useState<Order[]>([]);
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
  const [categoryChartData, setCategoryChartData] = useState<
    Array<{ name: string; value: number; fill: string }>
  >([]);
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
  const [orderSearchTerm, setOrderSearchTerm] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<
    | "all"
    | "pending"
    | "processing"
    | "ready_pickup"
    | "in_delivery"
    | "completed"
    | "cancelled"
  >("all");
  const [orderTypeFilter, setOrderTypeFilter] = useState<
    "all" | "barang" | "jasa"
  >("all");
  const [orderCategoryFilter, setOrderCategoryFilter] = useState<string>("all");
  const [orderPaymentFilter, setOrderPaymentFilter] = useState<
    "all" | "pending" | "paid" | "failed" | "refunded"
  >("all");

  const [reportSearchTerm, setReportSearchTerm] = useState("");
  const [reportStatusFilter, setReportStatusFilter] = useState<
    "all" | "pending" | "resolved" | "warning" | "banned"
  >("all");
  const [cancelRequestSearchTerm, setCancelRequestSearchTerm] = useState("");

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date>(new Date());

  const [userPage, setUserPage] = useState(1);
  const [productPage, setProductPage] = useState(1);
  const [reportPage, setReportPage] = useState(1);
  const [withdrawalPage, setWithdrawalPage] = useState(1);
  const [orderPage, setOrderPage] = useState(1);
  const [userTotalItems, setUserTotalItems] = useState(0);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [productTotalItems, setProductTotalItems] = useState(0);
  const [productTotalPages, setProductTotalPages] = useState(1);
  
  // Server-Side Orders Pagination States
  const [orderTotalItems, setOrderTotalItems] = useState(0);
  const [orderTotalPages, setOrderTotalPages] = useState(1);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [debouncedOrderSearch, setDebouncedOrderSearch] = useState("");

  const userRequestRef = useRef(0);
  const productRequestRef = useRef(0);
  const orderRequestRef = useRef(0);
  const userDetailRequestRef = useRef(0);
  const productDetailRequestRef = useRef(0);

  const getPaginatedData = <T,>(data: T[], page: number): T[] => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return data.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  const getTotalPages = (totalItems: number): number =>
    Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;

  // ---------------------------------------------------------------------------
  // Per-resource loaded flags (NOT per-tab).
  // `categories` and `faculties` are shared across tabs — using per-resource
  // guards ensures they are never re-fetched just because a different tab
  // opens them for the first time.
  // A resource is only marked loaded AFTER a successful fetch, so a failed
  // request can be retried when the tab is opened again.
  // ---------------------------------------------------------------------------
  const [loadedResources, setLoadedResources] = useState<
    Record<string, boolean>
  >({});

  const isResourceLoaded = (key: string) => loadedResources[key] === true;
  const markResourceLoaded = (key: string) =>
    setLoadedResources((prev) => ({ ...prev, [key]: true }));

  // --- Per-resource/tab loading states ---
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [facultiesLoading, setFacultiesLoading] = useState(false);

  // Track when the data was last updated dynamically by listening to transition completions
  const prevLoadingRef = useRef({
    overviewLoading,
    usersLoading,
    productsLoading,
    reportsLoading,
    withdrawalsLoading,
    categoriesLoading,
    facultiesLoading,
  });

  useEffect(() => {
    const prev = prevLoadingRef.current;
    const finished =
      (prev.overviewLoading && !overviewLoading) ||
      (prev.usersLoading && !usersLoading) ||
      (prev.productsLoading && !productsLoading) ||
      (prev.reportsLoading && !reportsLoading) ||
      (prev.withdrawalsLoading && !withdrawalsLoading) ||
      (prev.categoriesLoading && !categoriesLoading) ||
      (prev.facultiesLoading && !facultiesLoading);

    if (finished) {
      setLastUpdatedAt(new Date());
    }

    prevLoadingRef.current = {
      overviewLoading,
      usersLoading,
      productsLoading,
      reportsLoading,
      withdrawalsLoading,
      categoriesLoading,
      facultiesLoading,
    };
  }, [
    overviewLoading,
    usersLoading,
    productsLoading,
    reportsLoading,
    withdrawalsLoading,
    categoriesLoading,
    facultiesLoading,
  ]);

  // --- Per-resource/tab error states ---
  const [overviewError, setOverviewError] = useState<string | null>(null);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [reportsError, setReportsError] = useState<string | null>(null);
  const [withdrawalsError, setWithdrawalsError] = useState<string | null>(null);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [facultiesError, setFacultiesError] = useState<string | null>(null);

  // ---- Helper: map raw API responses to local types ----
  const mapUser = (user: any): User =>
    ({
      id: user.id?.toString() || user.uuid || user.id,
      uuid: user.id || user.uuid || "",
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      avatar: user.avatar || "",
      faculty: user.faculty || user.facultyDetails?.id || "",
      role: user.role || "student",
      isBanned: user.isBanned || false,
      isVerified: user.isVerified || false,
      isWarned: user.isWarned || user.is_warned || false,
      warningReason: user.warningReason || user.warning_reason || "",
      warningCount: user.warningCount || user.warning_count || 0,
      joinedAt: user.joinedAt || user.created_at || new Date().toISOString(),
      createdAt: user.joinedAt || user.created_at || new Date().toISOString(),
      banReason: user.banReason || "",
    }) as unknown as User;

  const mapUsers = (data: any[]): User[] => data.map((user) => mapUser(user));

  const mapProduct = (product: any): Product =>
    ({
      id: product.id?.toString() || product.uuid || "",
      title: product.title || "",
      slug: product.slug || "",
      type: product.type || "barang",
      price: product.price || 0,
      priceMin: product.price_min || product.priceMin || 0,
      priceMax: product.price_max || product.priceMax || 0,
      priceType: product.price_type || product.priceType || "fixed",
      category: typeof product.category === "string" ? product.category : (product.category?.name || product.category_name || ""),
      categoryId:
        product.categoryId || product.category?.uuid || product.category_id?.toString() || "",
      description: product.description || "",
      condition: product.condition || "baru",
      stock: product.stock || 0,
      location: product.location || "",
      canNego: product.can_nego || false,
      seller: {
        id:
          product.seller?.id ||
          product.seller?.uuid ||
          product.seller_id?.toString() ||
          "",
        name: product.seller?.name || product.seller_name || "",
        avatar: product.seller?.avatar || product.seller_avatar || "",
      },
      images: product.images || [],
      isActive: product.status === "active" || product.is_active || false,
      status: product.status || (product.is_active ? "active" : "inactive"),
      soldCount: product.soldCount || product.sold_count || 0,
      durationMin: product.durationMin || product.duration_min || undefined,
      durationMax: product.durationMax || product.duration_max || undefined,
      durationUnit: product.durationUnit || product.duration_unit || undefined,
      createdAt: product.created_at || new Date().toISOString(),
      deletedAt: product.deleted_at || product.deletedAt || undefined,
      deletedBy: product.deleted_by || product.deletedBy || undefined,
    }) as unknown as Product;

  const mapProducts = (data: any[]): Product[] =>
    data.map((product) => mapProduct(product));

  const mapCategoriesToState = (data: any[]) => {
    const colors = ["#3b82f6", "#8b5cf6", "#06b6d4", "#f59e0b", "#6b7280"];
    const mapped = data.map((cat: any) => ({
      id: cat.id?.toString() || cat.slug,
      name: cat.name,
      slug: cat.slug,
      type: cat.type,
      description: cat.description,
      sortOrder: cat.sort_order || cat.sortOrder || 0,
      isActive: cat.is_active !== undefined ? cat.is_active : cat.isActive,
      productCount: cat.product_count || cat.productCount || 0,
      createdAt: cat.created_at || cat.createdAt,
    }));
    const charts = mapped.map((cat: any, idx: number) => ({
      name: cat.name,
      value: cat.productCount || 0,
      fill: colors[idx % colors.length],
    }));
    return { mapped, charts };
  };

  const mapReports = (data: any[]): Report[] =>
    data.map(
      (report) =>
        ({
          id: report.id?.toString() || "",
          reportNumber: report.reportNumber || `RPT-${report.id}`,
          reason: report.reason || "",
          description: report.description || "",
          status: report.status || "pending",
          priority: report.priority || "normal",
          reporter: report.reporter
            ? {
                id: report.reporter.id?.toString() || report.reporter.uuid || "",
                name: report.reporter.name || "Unknown",
                email: report.reporter.email || "",
              }
            : {
                id: report.reporter_id?.toString() || "",
                name: report.reporter_name || "Unknown",
                email: "",
              },
          reportedUser: report.reportedUser
            ? {
                id: report.reportedUser.id?.toString() || report.reportedUser.uuid || "",
                name: report.reportedUser.name || "Unknown",
                email: report.reportedUser.email || "",
                warningCount: report.reportedUser.warningCount || report.reportedUser.warning_count || 0,
                isBanned: report.reportedUser.isBanned || report.reportedUser.is_banned || false,
              }
            : {
                id: report.reported_user_id?.toString() || "",
                name: report.reported_user_name || "Unknown",
                email: "",
              },
          productId: report.productId || report.product_id || "",
          productTitle: report.productTitle || "",
          chatId: report.chatId || report.chat_id || "",
          chatMessage: report.chatMessage || "",
          reportType: report.reportType || "user",
          createdAt: report.createdAt || report.created_at || new Date().toISOString(),
        }) as unknown as Report,
    );

  const mapCancelRequest = (request: any): CancelRequest => {
    const requester = request.requester
      ? mapUser(request.requester)
      : ({
          id: request.requester_id?.toString() || request.requesterId || "",
          name: request.requester_name || "Unknown",
          email: "",
          phone: "",
          avatar: "",
          faculty: null,
          isVerified: false,
          joinedAt: request.createdAt || new Date().toISOString(),
        } as User);

    return {
      id: request.id || request.uuid || "",
      requestNumber: request.requestNumber || request.request_number || "",
      orderId:
        request.orderId ||
        request.order_id ||
        request.order?.id ||
        request.order?.uuid ||
        "",
      order: request.order
        ? {
            ...request.order,
            buyer: request.order.buyer ? mapUser(request.order.buyer) : undefined,
            seller: request.order.seller ? mapUser(request.order.seller) : undefined,
          }
        : undefined,
      requester,
      reason: request.reason || "other",
      description: request.description || "",
      status: request.status || "pending",
      adminNotes: request.adminNotes || request.admin_notes || undefined,
      rejectionReason:
        request.rejectionReason || request.rejection_reason || undefined,
      refundAmount: request.refundAmount ?? request.refund_amount ?? 0,
      refundProcessed:
        request.refundProcessed ?? request.refund_processed ?? false,
      createdAt:
        request.createdAt || request.created_at || new Date().toISOString(),
      reviewedAt: request.reviewedAt || request.reviewed_at || undefined,
      refundedAt: request.refundedAt || request.refunded_at || undefined,
    } as CancelRequest;
  };

  const mapWithdrawals = (data: any[]): Withdrawal[] =>
    data.map(
      (withdrawal) =>
        ({
          id: withdrawal.id?.toString() || "",
          withdrawalNumber:
            withdrawal.withdrawalNumber ||
            withdrawal.withdrawal_number ||
            `WD-${withdrawal.id}`,
          user: withdrawal.user
            ? mapUser(withdrawal.user)
            : ({
                id: withdrawal.user_id?.toString() || "",
                name: withdrawal.user_name || "",
              } as User),
          amount: withdrawal.amount || 0,
          totalDeduction:
            withdrawal.totalDeduction || withdrawal.total_deduction || 0,
          bankName: withdrawal.bankName || withdrawal.bank_name || "",
          accountNumber:
            withdrawal.accountNumber || withdrawal.account_number || "",
          accountName: withdrawal.accountName || withdrawal.account_name || "",
          accountType:
            withdrawal.accountType || withdrawal.account_type || "bank",
          status: withdrawal.status || "pending",
          rejectionReason:
            withdrawal.rejectionReason ||
            withdrawal.rejection_reason ||
            undefined,
          failureReason:
            withdrawal.failureReason || withdrawal.failure_reason || undefined,
          createdAt:
            withdrawal.createdAt ||
            withdrawal.created_at ||
            new Date().toISOString(),
          processedAt:
            withdrawal.processedAt || withdrawal.processed_at || undefined,
        }) as unknown as Withdrawal,
    );

  const mapOrders = (data: any[]): Order[] =>
    data.map(
      (order) =>
        ({
          id: order.id || order.uuid || "",
          orderNumber: order.orderNumber || order.order_number || "",
          product: order.product ? mapProduct(order.product) : undefined,
          productTitle: order.productTitle || order.product_title || "",
          productType: order.productType || order.product_type || "barang",
          buyer: order.buyer ? mapUser(order.buyer) : undefined,
          seller: order.seller ? mapUser(order.seller) : undefined,
          status: order.status || "pending",
          quantity: order.quantity || 1,
          basePrice: order.basePrice || order.base_price || 0,
          negoPrice: order.negoPrice ?? order.nego_price ?? undefined,
          finalPrice: order.finalPrice || order.final_price || 0,
          shippingFee: order.shippingFee || order.shipping_fee || 0,
          adminFeePercent:
            order.adminFeePercent || order.admin_fee_percent || 0,
          adminFeeDeducted:
            order.adminFeeDeducted || order.admin_fee_deducted || 0,
          totalPrice: order.totalPrice || order.total_price || 0,
          netIncome: order.netIncome || order.net_income || 0,
          shippingMethod: order.shippingMethod || order.shipping_method || "",
          shippingType: order.shippingType || order.shipping_type || "",
          paymentMethod: order.paymentMethod || order.payment_method || "",
          paymentStatus:
            order.paymentStatus || order.payment_status || "pending",
          createdAt:
            order.createdAt || order.created_at || new Date().toISOString(),
          updatedAt:
            order.updatedAt || order.updated_at || new Date().toISOString(),
          completedAt: order.completedAt || order.completed_at || undefined,
          cancelledAt: order.cancelledAt || order.cancelled_at || undefined,
          cancelReason: order.cancelReason || order.cancel_reason || undefined,
        }) as unknown as Order,
    );

  // ---------------------------------------------------------------------------
  // Shared-resource fetch helpers.
  // These return true on success so callers can decide whether to mark loaded.
  // ---------------------------------------------------------------------------

  /** Fetch categories (shared: overview, products, categories tabs). */
  const fetchCategoriesResource = async (): Promise<boolean> => {
    setCategoriesLoading(true);
    setCategoriesError(null);
    try {
      const res = await adminCategoriesApi.getCategories({ per_page: 100 });
      if (res?.data && Array.isArray(res.data)) {
        const { mapped, charts } = mapCategoriesToState(res.data);
        setCategories(mapped);
        setCategoryChartData(charts);
      }
      markResourceLoaded("categories");
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal memuat kategori";
      setCategoriesError(msg);
      console.error("Failed to load categories:", err);
      return false;
    } finally {
      setCategoriesLoading(false);
    }
  };

  /** Fetch faculties (shared: users, faculties tabs). */
  const fetchFacultiesResource = async (): Promise<boolean> => {
    setFacultiesLoading(true);
    setFacultiesError(null);
    try {
      const res = await facultiesApi.listAdmin();
      if (res.length > 0) {
        setFaculties(res);
      }
      markResourceLoaded("faculties");
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal memuat fakultas";
      setFacultiesError(msg);
      console.error("Failed to load faculties:", err);
      return false;
    } finally {
      setFacultiesLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Per-tab fetch functions.
  // Each function fetches only the data its tab actually needs.
  // Shared resources (categories, faculties) are only fetched if not already
  // loaded by a previous tab — checked via isResourceLoaded().
  // ---------------------------------------------------------------------------

  const loadOverviewData = async () => {
    setOverviewLoading(true);
    setOverviewError(null);
    try {
      // overview-specific: stats + revenue + activity summary (always fetch fresh)
      const [apiStats, apiRevenueStats, apiActivitySummary] = await Promise.all(
        [
          adminDashboardApi.getStats(),
          adminDashboardApi.getRevenueStats(),
          adminDashboardApi.getActivitySummary(),
        ],
      );

      if (apiStats) {
        const statsData = (apiStats as any).data || apiStats;
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
        setPlatformRevenue((prev) => ({
          ...prev,
          total: statsData.platform_revenue || 0,
        }));
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

  const loadUsersData = async () => {
    const requestId = ++userRequestRef.current;
    setUsersLoading(true);
    setUsersError(null);
    try {
      const params: Parameters<typeof adminUsersApi.getUsers>[0] = {
        per_page: ITEMS_PER_PAGE,
        page: userPage,
      };

      if (userSearchTerm.trim()) params.search = userSearchTerm.trim();
      if (userFacultyFilter !== "all") params.faculty_code = userFacultyFilter;

      if (userStatusFilter === "active") {
        params.is_verified = true;
        params.is_banned = false;
        params.is_warned = false;
      } else if (userStatusFilter === "banned") {
        params.is_banned = true;
      } else if (userStatusFilter === "warned") {
        params.is_warned = true;
      } else if (userStatusFilter === "unverified") {
        params.is_verified = false;
      }

      const res = await adminUsersApi.getUsers(params);
      if (requestId !== userRequestRef.current) return;
      if (res?.data && Array.isArray(res.data)) {
        setUsers(mapUsers(res.data));
      }
      setUserTotalItems(res?.meta?.total ?? 0);
      setUserTotalPages(res?.meta?.last_page ?? 1);
      markResourceLoaded("users");

      // faculties needed for user faculty filter — reuse if already loaded
      if (!isResourceLoaded("faculties")) {
        await fetchFacultiesResource();
      }
    } catch (err) {
      if (requestId !== userRequestRef.current) return;
      const msg = err instanceof Error ? err.message : "Gagal memuat data user";
      setUsersError(msg);
      console.error("Failed to load users data:", err);
    } finally {
      if (requestId === userRequestRef.current) {
        setUsersLoading(false);
      }
    }
  };

  const loadProductsData = async () => {
    const requestId = ++productRequestRef.current;
    setProductsLoading(true);
    setProductsError(null);
    try {
      const params: Parameters<typeof adminProductsApi.getProducts>[0] = {
        per_page: ITEMS_PER_PAGE,
        page: productPage,
      };

      if (productSearchTerm.trim()) params.search = productSearchTerm.trim();
      if (productTypeFilter !== "all") params.type = productTypeFilter;
      if (productConditionFilter !== "all")
        params.condition = productConditionFilter;
      if (productCategoryFilter !== "all")
        params.category_id = productCategoryFilter;
      if (productSellerFilter.trim())
        params.seller_name = productSellerFilter.trim();
      if (productPriceMin.trim()) params.price_min = Number(productPriceMin);
      if (productPriceMax.trim()) params.price_max = Number(productPriceMax);

      const res = await adminProductsApi.getProducts(params);
      if (requestId !== productRequestRef.current) return;
      if (res?.data && Array.isArray(res.data)) {
        setProducts(mapProducts(res.data));
      }
      setProductTotalItems(res?.meta?.total ?? 0);
      setProductTotalPages(res?.meta?.last_page ?? 1);
      markResourceLoaded("products");

      // categories needed for product category filter — reuse if already loaded
      if (!isResourceLoaded("categories")) {
        await fetchCategoriesResource();
      }
    } catch (err) {
      if (requestId !== productRequestRef.current) return;
      const msg =
        err instanceof Error ? err.message : "Gagal memuat data produk";
      setProductsError(msg);
      console.error("Failed to load products data:", err);
    } finally {
      if (requestId === productRequestRef.current) {
        setProductsLoading(false);
      }
    }
  };

  const loadCategoriesData = async () => {
    // Use cached data if already loaded. Data is invalidated after any
    // successful CRUD mutation via invalidateCategories().
    if (!isResourceLoaded("categories")) {
      await fetchCategoriesResource();
    }
  };

  const loadFacultiesData = async () => {
    // Use cached data if already loaded. Invalidated after CRUD via
    // invalidateFaculties().
    if (!isResourceLoaded("faculties")) {
      await fetchFacultiesResource();
    }
  };

  /**
   * Call after a successful category create/update/delete/toggle so that the
   * next time the categories tab is opened (or products/overview need it)
   * the data is re-fetched from the server.
   */
  const invalidateCategories = () =>
    setLoadedResources((prev) => ({ ...prev, categories: false }));

  /**
   * Call after a successful faculty create/update/delete/toggle so that the
   * next time the faculties/users tab needs it the data is re-fetched.
   */
  const invalidateFaculties = () =>
    setLoadedResources((prev) => ({ ...prev, faculties: false }));

  const loadReportsData = async () => {
    setReportsLoading(true);
    setReportsError(null);
    try {
      const res = await adminReportsApi.getReports({ per_page: 100 });
      if (res?.data && Array.isArray(res.data)) {
        setReports(mapReports(res.data));
      }
      markResourceLoaded("reports");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal memuat laporan";
      setReportsError(msg);
      console.error("Failed to load reports data:", err);
    } finally {
      setReportsLoading(false);
    }
  };

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

  const loadPlatformRevenueData = async () => {
    setPlatformRevenueLoading(true);
    setPlatformRevenueError(null);
    try {
      const res = await adminDashboardApi.getPlatformRevenue();
      if (res?.data) {
        setPlatformRevenue({
          total: res.data.total || 0,
          thisMonth: res.data.thisMonth || 0,
          lastMonth: res.data.lastMonth || 0,
          pendingClearance: res.data.pendingClearance || 0,
          transactions: Array.isArray(res.data.transactions) ? res.data.transactions : [],
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

  const loadOrdersData = async () => {
    const requestId = ++orderRequestRef.current;
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const params: Parameters<typeof adminOrdersApi.getOrders>[0] = {
        per_page: ITEMS_PER_PAGE,
        page: orderPage,
      };

      if (debouncedOrderSearch.trim()) params.search = debouncedOrderSearch.trim();
      if (orderStatusFilter !== "all") params.status = orderStatusFilter;
      if (orderTypeFilter !== "all") params.type = orderTypeFilter;
      if (orderCategoryFilter !== "all") params.category_id = orderCategoryFilter;
      if (orderPaymentFilter !== "all") params.payment_status = orderPaymentFilter;

      const res = await adminOrdersApi.getOrders(params);
      if (requestId !== orderRequestRef.current) return;
      if (res?.data && Array.isArray(res.data)) {
        setOrders(mapOrders(res.data));
      }
      setOrderTotalItems(res?.meta?.total ?? 0);
      setOrderTotalPages(res?.meta?.last_page ?? 1);
      markResourceLoaded("orders");
    } catch (err) {
      if (requestId !== orderRequestRef.current) return;
      const msg = err instanceof Error ? err.message : "Gagal memuat data transaksi";
      setOrdersError(msg);
      console.error("Failed to load orders data:", err);
    } finally {
      if (requestId === orderRequestRef.current) {
        setOrdersLoading(false);
      }
    }
  };

  const loadCancelRequestsData = async () => {
    setCancelRequestsLoading(true);
    try {
      const res = await adminCancelRequestsApi.getCancelRequests({
        per_page: 100,
      });
      if (res?.data && Array.isArray(res.data)) {
        setCancelRequests(res.data.map((item) => mapCancelRequest(item)));
      }
      markResourceLoaded("cancel-requests");
    } catch (err) {
      console.error("Failed to load cancel requests:", err);
    } finally {
      setCancelRequestsLoading(false);
    }
  };

  const loadAddressesData = async () => {
    setAddressesLoading(true);
    setAddressesError(null);
    try {
      const res = await adminAddressesApi.getAddresses();
      if (Array.isArray(res)) {
        setAddressesData(res);
      }
      markResourceLoaded("addresses");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal memuat data alamat";
      setAddressesError(msg);
      setAddressesData([]);
      console.error("Failed to load admin addresses:", err);
    } finally {
      setAddressesLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Lazy-fetch effect: fires only when activeTab changes.
  // Guard: skip if the primary resource for this tab is already loaded.
  // Exception: categories/faculties management tabs always refresh on open.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    const runLoad = async () => {
      if (cancelled) return;

      switch (activeTab) {
        case "overview":
          if (!isResourceLoaded("overview")) {
            await loadOverviewData();
          }
          break;
        case "categories":
          // Guard: loadCategoriesData() itself checks isResourceLoaded.
          // Cache is cleared by invalidateCategories() after any CRUD success.
          await loadCategoriesData();
          break;
        case "faculties":
          // Same pattern as categories.
          await loadFacultiesData();
          break;
        case "reports":
          if (!isResourceLoaded("reports")) {
            await loadReportsData();
          }
          break;
        case "finance":
          if (!isResourceLoaded("withdrawals")) {
            await loadWithdrawalsData();
          }
          if (financeSubTab === "topups" && !isResourceLoaded("topups")) {
            await loadTopupsData();
          }
          break;
        case "cancel-requests":
          await loadCancelRequestsData();
          break;
        case "orders":
          if (!isResourceLoaded("categories")) {
            await fetchCategoriesResource();
          }
          break;
        case "addresses":
          if (!isResourceLoaded("addresses")) {
            await loadAddressesData();
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

  useEffect(() => {
    if (activeTab !== "users") return;
    void loadUsersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeTab,
    userPage,
    userSearchTerm,
    userStatusFilter,
    userFacultyFilter,
  ]);

  useEffect(() => {
    if (activeTab !== "products") return;
    void loadProductsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeTab,
    productPage,
    productSearchTerm,
    productTypeFilter,
    productConditionFilter,
    productCategoryFilter,
    productPriceMin,
    productPriceMax,
    productSellerFilter,
  ]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedOrderSearch(orderSearchTerm);
      setOrderPage(1);
    }, 400);
    return () => {
      clearTimeout(handler);
    };
  }, [orderSearchTerm]);

  useEffect(() => {
    if (activeTab !== "orders") return;
    void loadOrdersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeTab,
    orderPage,
    debouncedOrderSearch,
    orderStatusFilter,
    orderTypeFilter,
    orderCategoryFilter,
    orderPaymentFilter,
  ]);

  const renderPagination = (
    currentPage: number,
    totalPages: number,
    setPage: (page: number) => void,
  ) => {
    if (totalPages <= 1) return null;

    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("ellipsis");
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }

    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setPage(Math.max(1, currentPage - 1))}
              className={
                currentPage === 1
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>
          {pages.map((page, index) => (
            <PaginationItem key={index}>
              {page === "ellipsis" ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  onClick={() => setPage(page)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
              className={
                currentPage === totalPages
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  const filteredUsers = useMemo(() => users, [users]);

  const filteredProducts = useMemo(() => products, [products]);

  const filteredReports = useMemo(
    () =>
      reports.filter((report) => {
        const matchesSearch =
          reportSearchTerm === "" ||
          report.reason
            .toLowerCase()
            .includes(reportSearchTerm.toLowerCase()) ||
          report.description
            .toLowerCase()
            .includes(reportSearchTerm.toLowerCase()) ||
          report.reporter?.name
            ?.toLowerCase()
            ?.includes(reportSearchTerm.toLowerCase()) ||
          report.reportedUser?.name
            ?.toLowerCase()
            ?.includes(reportSearchTerm.toLowerCase());
        const matchesStatus =
          reportStatusFilter === "all" || report.status === reportStatusFilter;
        return matchesSearch && matchesStatus;
      }),
    [reports, reportSearchTerm, reportStatusFilter],
  );

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

  const filteredAddresses = useMemo<AdminAddressUser[]>(() => {
    if (!addressSearchTerm.trim()) return addressesData;

    const query = addressSearchTerm.toLowerCase().trim();
    return addressesData
      .map((item) => {
        const userMatches =
          item.user.name.toLowerCase().includes(query) ||
          item.user.email.toLowerCase().includes(query);

        const matchingAddresses = item.addresses.filter(
          (addr) =>
            userMatches ||
            addr.label.toLowerCase().includes(query) ||
            addr.recipient_name.toLowerCase().includes(query) ||
            addr.phone.toLowerCase().includes(query) ||
            addr.address.toLowerCase().includes(query) ||
            (addr.note && addr.note.toLowerCase().includes(query)),
        );

        if (matchingAddresses.length > 0) {
          return {
            ...item,
            addresses: matchingAddresses,
          };
        }
        return null;
      })
      .filter((item): item is AdminAddressUser => item !== null);
  }, [addressesData, addressSearchTerm]);

  const filteredOrders = useMemo(() => orders, [orders]);

  const filteredFaculties = useMemo(
    () =>
      faculties
        .filter((faculty) => {
          const matchesSearch =
            facultySearchTerm === "" ||
            faculty.name
              .toLowerCase()
              .includes(facultySearchTerm.toLowerCase()) ||
            faculty.code
              .toLowerCase()
              .includes(facultySearchTerm.toLowerCase());
          const matchesStatus =
            facultyStatusFilter === "all" ||
            (facultyStatusFilter === "active" && faculty.isActive) ||
            (facultyStatusFilter === "inactive" && !faculty.isActive);
          return matchesSearch && matchesStatus;
        })
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [faculties, facultySearchTerm, facultyStatusFilter],
  );

  const paginatedUsers = useMemo(() => users, [users]);
  const paginatedProducts = useMemo(() => products, [products]);
  const paginatedReports = useMemo(
    () => getPaginatedData(filteredReports, reportPage),
    [filteredReports, reportPage],
  );
  const paginatedWithdrawals = useMemo(
    () => getPaginatedData(filteredWithdrawals, withdrawalPage),
    [filteredWithdrawals, withdrawalPage],
  );
  const paginatedOrders = useMemo(
    () => filteredOrders,
    [filteredOrders],
  );
  const paginatedFaculties = useMemo(
    () => getPaginatedData(filteredFaculties, facultyPage),
    [filteredFaculties, facultyPage],
  );
  const productCategoryOptions = useMemo(
    () =>
      categories.map((category) => ({ id: category.id, name: category.name })),
    [categories],
  );

  const displayStats = stats || {
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

  const displayActivitySummary = activitySummary || {
    newUsersThisWeek: 0,
    newProductsThisWeek: 0,
    newOrdersThisWeek: 0,
    pendingReports: 0,
    pendingWithdrawals: 0,
  };

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

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleViewUser = async (user: User) => {
    const requestId = ++userDetailRequestRef.current;
    setSelectedUser(user);
    setUserDetailError(null);
    setShowUserDetail(true);
    setUserDetailLoading(true);

    try {
      const detail = await adminUsersApi.getUser(user.id);
      if (requestId !== userDetailRequestRef.current) return;
      setSelectedUser(mapUser(detail));
    } catch (err) {
      if (requestId !== userDetailRequestRef.current) return;
      const msg =
        err instanceof Error ? err.message : "Gagal memuat detail user";
      setUserDetailError(msg);
      console.error("Failed to load user detail:", err);
    } finally {
      if (requestId === userDetailRequestRef.current) {
        setUserDetailLoading(false);
      }
    }
  };
  const handleBanUser = (user: User) => {
    setUserToAction(user);
    setShowBanDialog(true);
  };
  const confirmBanUser = async () => {
    if (userToAction) {
      try {
        await adminUsersApi.banUser(userToAction.id, {
          ban_reason: "Melanggar aturan platform KampusMarket.",
        });
        setUsers(
          users.map((u) =>
            u.id === userToAction.id
              ? {
                  ...u,
                  isBanned: true,
                  banReason: "Melanggar aturan platform KampusMarket.",
                }
              : u,
          ),
        );
        showSuccess(`User ${userToAction.name} berhasil diblokir`);
      } catch (err) {
        console.error(err);
        showSuccess(`Gagal memblokir user ${userToAction.name}`);
      } finally {
        setShowBanDialog(false);
        setUserToAction(null);
      }
    }
  };
  const handleUnbanUser = (user: User) => {
    setUserToAction(user);
    setShowUnbanDialog(true);
  };
  const confirmUnbanUser = async () => {
    if (userToAction) {
      try {
        await adminUsersApi.unbanUser(userToAction.id);
        setUsers(
          users.map((u) =>
            u.id === userToAction.id
              ? { ...u, isBanned: false, banReason: undefined }
              : u,
          ),
        );
        showSuccess(`User ${userToAction.name} berhasil di-unblock`);
      } catch (err) {
        console.error(err);
        showSuccess(`Gagal meng-unblock user ${userToAction.name}`);
      } finally {
        setShowUnbanDialog(false);
        setUserToAction(null);
      }
    }
  };

  const handleViewProduct = async (product: Product) => {
    const requestId = ++productDetailRequestRef.current;
    setSelectedProduct(product);
    setProductDetailError(null);
    setShowProductDetail(true);
    setProductDetailLoading(true);

    try {
      const detail = await adminProductsApi.getProduct(product.id);
      if (requestId !== productDetailRequestRef.current) return;
      setSelectedProduct(mapProduct(detail));
    } catch (err) {
      if (requestId !== productDetailRequestRef.current) return;
      const msg =
        err instanceof Error ? err.message : "Gagal memuat detail produk";
      setProductDetailError(msg);
      console.error("Failed to load product detail:", err);
    } finally {
      if (requestId === productDetailRequestRef.current) {
        setProductDetailLoading(false);
      }
    }
  };
  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteProductDialog(true);
  };
  const confirmDeleteProduct = async () => {
    if (productToDelete) {
      try {
        await adminProductsApi.deleteProduct(productToDelete.id, {
          delete_reason: "Dihapus oleh admin.",
        });
        setProducts(
          products.map((p) =>
            p.id === productToDelete.id
              ? {
                  ...p,
                  deletedAt: new Date().toISOString(),
                  deletedBy: "admin",
                }
              : p,
          ),
        );
        showSuccess(`Produk "${productToDelete.title}" berhasil dihapus`);
      } catch (err) {
        console.error(err);
        showSuccess(`Gagal menghapus produk "${productToDelete.title}"`);
      } finally {
        setShowDeleteProductDialog(false);
        setProductToDelete(null);
      }
    }
  };
  const handleRestoreProduct = async (product: Product) => {
    try {
      await adminProductsApi.restoreProduct(product.id);
      setProducts(
        products.map((p) =>
          p.id === product.id
            ? { ...p, deletedAt: undefined, deletedBy: undefined }
            : p,
        ),
      );
      showSuccess(`Produk "${product.title}" berhasil dipulihkan`);
    } catch (err) {
      console.error(err);
      showSuccess(`Gagal memulihkan produk "${product.title}"`);
    }
  };

  const handleSendWarning = (report: Report) => {
    setSelectedReport(report);
    setShowWarningDialog(true);
  };
  const confirmSendWarning = () => {
    if (selectedReport) {
      const run = async () => {
        try {
          await adminReportsApi.reviewReport(selectedReport.id);
          if (selectedReport.reportedUser?.id) {
            await adminUsersApi.warnUser(selectedReport.reportedUser.id, selectedReport.reason);
          }
          setReports(
            reports.map((r) =>
              r.id === selectedReport.id
                ? { ...r, status: "warning" as const }
                : r,
            ),
          );
          setUsers(
            users.map((u) =>
              u.id === selectedReport.reportedUser.id
                ? { ...u, isWarned: true, warningReason: selectedReport.reason, warningCount: (u.warningCount || 0) + 1 }
                : u,
            ),
          );
          showSuccess(
            `Warning berhasil dikirim ke ${selectedReport.reportedUser.name}`,
          );
        } catch (err) {
          console.error(err);
          showSuccess("Gagal mengirim warning, coba lagi");
        } finally {
          setShowWarningDialog(false);
          setSelectedReport(null);
        }
      };
      void run();
    }
  };
  const handleBanFromReport = (report: Report) => {
    setSelectedReport(report);
    setShowBanReportDialog(true);
  };
  const confirmBanFromReport = () => {
    if (selectedReport) {
      const run = async () => {
        try {
          await adminReportsApi.resolveReport(selectedReport.id, {
            resolution: `Ban user karena laporan: ${selectedReport.reason}`,
            banUser: true,
            banReason: selectedReport.reason,
          });
          setUsers(
            users.map((u) =>
              u.id === selectedReport.reportedUser.id
                ? { ...u, isBanned: true, banReason: selectedReport.reason }
                : u,
            ),
          );
          setReports(
            reports.map((r) =>
              r.reportedUser?.id === selectedReport.reportedUser.id
                ? { ...r, status: "banned" as const }
                : r,
            ),
          );
          showSuccess(`User ${selectedReport.reportedUser.name} berhasil diblokir`);
        } catch (err) {
          console.error(err);
          showSuccess("Gagal memblokir user, coba lagi");
        } finally {
          setShowBanReportDialog(false);
          setSelectedReport(null);
        }
      };
      void run();
    }
  };
  const handleResolveReport = async (report: Report) => {
    try {
      await adminReportsApi.resolveReport(report.id, {
        resolution: `Diselesaikan oleh admin: ${report.reason}`,
        banUser: false,
      });
      setReports(
        reports.map((r) =>
          r.id === report.id
            ? { ...r, status: "resolved" as const }
            : r,
        ),
      );
      showSuccess(`Laporan untuk "${report.reportedUser?.name || 'User'}" berhasil diselesaikan`);
    } catch (err) {
      console.error(err);
      showSuccess("Gagal menyelesaikan laporan, coba lagi");
    }
  };
  const handleDismissReport = async (report: Report) => {
    try {
      await adminReportsApi.dismissReport(report.id);
      setReports(
        reports.map((r) =>
          r.id === report.id
            ? { ...r, status: "dismissed" as const }
            : r,
        ),
      );
      showSuccess(`Laporan untuk "${report.reportedUser?.name || 'User'}" berhasil ditolak`);
    } catch (err) {
      console.error(err);
      showSuccess("Gagal menolak laporan, coba lagi");
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
            `Penarikan ${formatPrice(selectedWithdrawal.amount)} berhasil disetujui`,
          );
          setFinancialModalOpen(false);
          setSelectedWithdrawal(null);
        } catch (err) {
          console.error(err);
          const msg = err instanceof Error ? err.message : "Gagal menyetujui penarikan";
          setFinancialError(msg);
          showSuccess(
            `Gagal menyetujui penarikan ${formatPrice(selectedWithdrawal.amount)}`,
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
            `Penarikan ${formatPrice(selectedWithdrawal.amount)} ditolak`,
          );
          setFinancialModalOpen(false);
          setSelectedWithdrawal(null);
        } catch (err) {
          console.error(err);
          const msg = err instanceof Error ? err.message : "Gagal menolak penarikan";
          setFinancialError(msg);
          showSuccess(
            `Gagal menolak penarikan ${formatPrice(selectedWithdrawal.amount)}`,
          );
        } finally {
          setFinancialLoading(false);
        }
      };
      void run();
    }
  };

  const handleApproveCancelRequest = (cancelReq: CancelRequest) => {
    setSelectedCancelRequest(cancelReq);
    setCancelApproveNotes("");
    setShowCancelApproveDialog(true);
  };
  const confirmApproveCancelRequest = () => {
    if (selectedCancelRequest) {
      const run = async () => {
        try {
          const updated = await adminCancelRequestsApi.approveCancelRequest(
            selectedCancelRequest.id,
            {
              adminNotes: cancelApproveNotes || undefined,
            },
          );
          const mapped = mapCancelRequest(updated);
          setCancelRequests(
            cancelRequests.map((cr) => (cr.id === mapped.id ? mapped : cr)),
          );
          showSuccess(
            `Permintaan pembatalan ${mapped.requestNumber} disetujui.`,
          );
        } catch (err) {
          console.error(err);
          showSuccess(
            `Gagal menyetujui pembatalan ${selectedCancelRequest.requestNumber}`,
          );
        } finally {
          setShowCancelApproveDialog(false);
          setSelectedCancelRequest(null);
          setCancelApproveNotes("");
        }
      };
      void run();
    }
  };
  const handleRejectCancelRequest = (cancelReq: CancelRequest) => {
    setSelectedCancelRequest(cancelReq);
    setCancelRejectReasonInput("");
    setShowCancelRejectDialog(true);
  };
  const confirmRejectCancelRequest = () => {
    if (selectedCancelRequest && cancelRejectReasonInput.trim()) {
      const run = async () => {
        try {
          const updated = await adminCancelRequestsApi.rejectCancelRequest(
            selectedCancelRequest.id,
            {
              rejectionReason: cancelRejectReasonInput.trim(),
            },
          );
          const mapped = mapCancelRequest(updated);
          setCancelRequests(
            cancelRequests.map((cr) => (cr.id === mapped.id ? mapped : cr)),
          );
          showSuccess(`Permintaan pembatalan ${mapped.requestNumber} ditolak`);
        } catch (err) {
          console.error(err);
          showSuccess(
            `Gagal menolak pembatalan ${selectedCancelRequest.requestNumber}`,
          );
        } finally {
          setShowCancelRejectDialog(false);
          setSelectedCancelRequest(null);
          setCancelRejectReasonInput("");
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
          const updated = await adminWithdrawalsApi.completeWithdrawal(
            selectedWithdrawal.id,
          );
          const mapped = mapWithdrawals([updated])[0];
          setWithdrawals(
            withdrawals.map((w) => (w.id === mapped.id ? mapped : w)),
          );
          showSuccess(
            `Penarikan ${formatPrice(selectedWithdrawal.amount)} berhasil diselesaikan`,
          );
          setFinancialModalOpen(false);
          setSelectedWithdrawal(null);
        } catch (err) {
          console.error(err);
          const msg = err instanceof Error ? err.message : "Gagal menyelesaikan penarikan";
          setFinancialError(msg);
          showSuccess(
            `Gagal menyelesaikan penarikan ${formatPrice(selectedWithdrawal.amount)}`,
          );
        } finally {
          setFinancialLoading(false);
        }
      };
      void run();
    }
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
          const updated = await adminWithdrawalsApi.failWithdrawal(
            selectedWithdrawal.id,
            { failureReason: reason.trim() },
          );
          const mapped = mapWithdrawals([updated])[0];
          setWithdrawals(
            withdrawals.map((w) => (w.id === mapped.id ? mapped : w)),
          );
          showSuccess(
            `Penarikan ${formatPrice(selectedWithdrawal.amount)} ditandai gagal`,
          );
          setFinancialModalOpen(false);
          setSelectedWithdrawal(null);
        } catch (err) {
          console.error(err);
          const msg = err instanceof Error ? err.message : "Gagal menandai gagal penarikan";
          setFinancialError(msg);
          showSuccess(
            `Gagal menandai penarikan ${formatPrice(selectedWithdrawal.amount)} sebagai gagal`,
          );
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
        const updated = await adminWithdrawalsApi.processWithdrawal(
          withdrawal.id,
        );
        const mapped = mapWithdrawals([updated])[0];
        setWithdrawals(
          withdrawals.map((w) => (w.id === mapped.id ? mapped : w)),
        );
        showSuccess(
          `Penarikan ${formatPrice(withdrawal.amount)} sedang diproses`,
        );
        if (selectedWithdrawal && selectedWithdrawal.id === withdrawal.id) {
          setSelectedWithdrawal(mapped);
        }
      } catch (err) {
        console.error(err);
        showSuccess(
          `Gagal memproses penarikan ${formatPrice(withdrawal.amount)}`,
        );
      } finally {
        setFinancialLoading(false);
      }
    };
    void run();
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

  const filteredCategories = useMemo(
    () =>
      categories
        .filter((cat) => {
          const matchesSearch = cat.name
            .toLowerCase()
            .includes(categorySearchTerm.toLowerCase());
          const matchesType =
            categoryTypeFilter === "all" || cat.type === categoryTypeFilter;
          return matchesSearch && matchesType;
        })
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [categories, categorySearchTerm, categoryTypeFilter],
  );

  const handleAddCategory = () => {
    setSelectedCategory(null);
    // Calculate next sort order based on type
    const barangCategories = categories.filter((c) => c.type === "barang");
    const nextSortOrder =
      barangCategories.length > 0
        ? Math.max(...barangCategories.map((c) => c.sortOrder)) + 1
        : 1;
    setCategoryForm({
      name: "",
      type: "barang",
      description: "",
      sortOrder: nextSortOrder,
      isActive: true,
    });
    setShowCategoryDialog(true);
  };
  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setCategoryForm({
      name: category.name,
      type: category.type,
      description: category.description || "",
      sortOrder: category.sortOrder,
      isActive: category.isActive,
    });
    setShowCategoryDialog(true);
  };
  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim()) return;

    try {
      if (selectedCategory) {
        const updatedCat = await adminCategoriesApi.updateCategory(
          selectedCategory.id,
          {
            name: categoryForm.name.trim(),
            type: categoryForm.type,
            description: categoryForm.description.trim(),
            sort_order: categoryForm.sortOrder,
            is_active: categoryForm.isActive,
          },
        );

        setCategories(
          categories.map((c) =>
            c.id === selectedCategory.id
              ? {
                  ...c,
                  name: updatedCat.name,
                  type: updatedCat.type,
                  sortOrder: updatedCat.sortOrder ?? updatedCat.sort_order ?? 0,
                  isActive: updatedCat.isActive !== undefined ? updatedCat.isActive : updatedCat.is_active,
                  slug: updatedCat.slug,
                  description: updatedCat.description,
                }
              : c,
          ),
        );
        invalidateCategories();
        showSuccess(`Kategori "${categoryForm.name}" berhasil diperbarui`);
      } else {
        const newCat = await adminCategoriesApi.createCategory({
          name: categoryForm.name.trim(),
          type: categoryForm.type,
          description: categoryForm.description.trim(),
          sort_order: categoryForm.sortOrder,
          is_active: categoryForm.isActive,
        });

        const mappedNewCat: Category = {
          id: newCat.id?.toString() || newCat.slug,
          name: newCat.name,
          slug: newCat.slug,
          type: newCat.type,
          description: newCat.description,
          sortOrder: newCat.sortOrder ?? newCat.sort_order ?? 0,
          isActive: newCat.isActive !== undefined ? newCat.isActive : newCat.is_active,
          createdAt:
            newCat.created_at || new Date().toISOString().split("T")[0],
        };

        setCategories([...categories, mappedNewCat]);
        invalidateCategories();
        showSuccess(`Kategori "${categoryForm.name}" berhasil ditambahkan`);
      }
    } catch (err) {
      console.error("Failed to save category:", err);
      showSuccess("Gagal menyimpan kategori ke database, silakan coba lagi.");
    }

    setShowCategoryDialog(false);
    setSelectedCategory(null);
  };
  const handleDeleteCategory = (category: Category) => {
    setCategoryToDelete(category);
    setShowDeleteCategoryDialog(true);
  };
  const confirmDeleteCategory = async () => {
    if (categoryToDelete) {
      try {
        await adminCategoriesApi.deleteCategory(categoryToDelete.id);
        setCategories(categories.filter((c) => c.id !== categoryToDelete.id));
        invalidateCategories();
        showSuccess(`Kategori "${categoryToDelete.name}" berhasil dihapus`);
      } catch (err) {
        console.error("Failed to delete category:", err);
        showSuccess("Gagal menghapus kategori dari database.");
      }
      setShowDeleteCategoryDialog(false);
      setCategoryToDelete(null);
    }
  };

  const handleToggleCategoryActive = async (category: Category) => {
    const nextState = !category.isActive;
    try {
      await adminCategoriesApi.updateCategoryStatus(category.id, nextState);
      setCategories(
        categories.map((c) =>
          c.id === category.id ? { ...c, isActive: nextState } : c,
        ),
      );
      invalidateCategories();
      showSuccess(
        `Kategori "${category.name}" ${nextState ? "diaktifkan" : "dinonaktifkan"}`,
      );
    } catch (err) {
      console.error("Failed to toggle category status:", err);
      showSuccess("Gagal mengubah status kategori.");
    }
  };

  const handleAddFaculty = () => {
    setSelectedFaculty(null);
    setFacultyForm({
      name: "",
      code: "",
      description: "",
      sortOrder: faculties.length + 1,
      isActive: true,
    });
    setShowFacultyDialog(true);
  };
  const handleEditFaculty = (faculty: Faculty) => {
    setSelectedFaculty(faculty);
    setFacultyForm({
      name: faculty.name,
      code: faculty.code,
      description: faculty.description || "",
      sortOrder: faculty.sortOrder,
      isActive: faculty.isActive,
    });
    setShowFacultyDialog(true);
  };
  const handleSaveFaculty = async () => {
    if (!facultyForm.name.trim() || !facultyForm.code.trim()) return;
    const normalizedCode = facultyForm.code
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    try {
      if (selectedFaculty) {
        const updatedFaculty = await facultiesApi.update(selectedFaculty.code, {
          code: normalizedCode || selectedFaculty.code,
          name: facultyForm.name.trim(),
          description: facultyForm.description?.trim() || "",
          sortOrder: facultyForm.sortOrder,
          isActive: facultyForm.isActive,
        });

        setFaculties(
          faculties.map((faculty) =>
            faculty.id === selectedFaculty.id ? updatedFaculty : faculty,
          ),
        );
        invalidateFaculties();
        showSuccess(`Fakultas "${facultyForm.name}" berhasil diperbarui`);
      } else {
        const createdFaculty = await facultiesApi.create({
          code: normalizedCode || facultyForm.code.toLowerCase(),
          name: facultyForm.name.trim(),
          description: facultyForm.description?.trim() || "",
          sortOrder: facultyForm.sortOrder,
          isActive: facultyForm.isActive,
        });

        setFaculties([...faculties, createdFaculty]);
        invalidateFaculties();
        showSuccess(`Fakultas "${facultyForm.name}" berhasil ditambahkan`);
      }
    } catch {
      if (selectedFaculty) {
        setFaculties(
          faculties.map((faculty) =>
            faculty.id === selectedFaculty.id
              ? {
                  ...faculty,
                  id: normalizedCode || faculty.id,
                  code: normalizedCode || faculty.code,
                  name: facultyForm.name.trim(),
                  description: facultyForm.description?.trim() || "",
                  sortOrder: facultyForm.sortOrder,
                  isActive: facultyForm.isActive,
                }
              : faculty,
          ),
        );
        showSuccess(
          `Fakultas "${facultyForm.name}" berhasil diperbarui (mode lokal)`,
        );
      } else {
        const newFaculty: Faculty = {
          id: normalizedCode || `fac-${Date.now()}`,
          code: normalizedCode || facultyForm.code.toLowerCase(),
          name: facultyForm.name.trim(),
          description: facultyForm.description?.trim() || "",
          sortOrder: facultyForm.sortOrder,
          isActive: facultyForm.isActive,
        };
        setFaculties([...faculties, newFaculty]);
        showSuccess(
          `Fakultas "${facultyForm.name}" berhasil ditambahkan (mode lokal)`,
        );
      }
    }

    setShowFacultyDialog(false);
    setSelectedFaculty(null);
    setFacultyPage(1);
  };
  const handleDeleteFaculty = (faculty: Faculty) => {
    setFacultyToDelete(faculty);
    setShowDeleteFacultyDialog(true);
  };
  const confirmDeleteFaculty = async () => {
    if (facultyToDelete) {
      try {
        await facultiesApi.remove(facultyToDelete.code);
        setFaculties(
          faculties.filter((faculty) => faculty.id !== facultyToDelete.id),
        );
        invalidateFaculties();
        showSuccess(`Fakultas "${facultyToDelete.name}" berhasil dihapus`);
      } catch {
        setFaculties(
          faculties.filter((faculty) => faculty.id !== facultyToDelete.id),
        );
        showSuccess(
          `Fakultas "${facultyToDelete.name}" berhasil dihapus (mode lokal)`,
        );
      }

      setShowDeleteFacultyDialog(false);
      setFacultyToDelete(null);
    }
  };
  const handleToggleFacultyActive = async (faculty: Faculty) => {
    const nextState = !faculty.isActive;

    try {
      const updatedFaculty = await facultiesApi.updateStatus(
        faculty.code,
        nextState,
      );
      setFaculties(
        faculties.map((item) =>
          item.id === faculty.id ? updatedFaculty : item,
        ),
      );
      invalidateFaculties();
      showSuccess(
        `Fakultas "${faculty.name}" ${nextState ? "diaktifkan" : "dinonaktifkan"}`,
      );
    } catch {
      setFaculties(
        faculties.map((item) =>
          item.id === faculty.id ? { ...item, isActive: nextState } : item,
        ),
      );
      showSuccess(
        `Fakultas "${faculty.name}" ${nextState ? "diaktifkan" : "dinonaktifkan"} (mode lokal)`,
      );
    }
  };

  const getReportStatusBadge = (status: string) => {
    const config: Record<
      string,
      {
        variant: "default" | "secondary" | "destructive" | "outline";
        label: string;
        className?: string;
      }
    > = {
      pending: {
        variant: "outline",
        label: "Menunggu",
        className: "border-amber-500 text-amber-600 dark:border-amber-400 dark:text-amber-400",
      },

      resolved: {
        variant: "default",
        label: "Selesai",
        className: "bg-primary text-white hover:bg-primary/90 border-transparent",
      },
      warning: {
        variant: "secondary",
        label: "Warning",
        className: "bg-amber-500 text-white hover:bg-amber-600 border-transparent",
      },
      banned: {
        variant: "destructive",
        label: "Banned",
        className: "bg-red-600 text-white hover:bg-red-700 border-transparent",
      },
    };
    const statusConfig = config[status] || config.pending;
    return (
      <Badge variant={statusConfig.variant} className={statusConfig.className}>
        {statusConfig.label}
      </Badge>
    );
  };

  const getWithdrawalStatusBadge = (status: string) => {
    const config: Record<
      string,
      {
        variant: "default" | "secondary" | "destructive" | "outline";
        label: string;
        className?: string;
      }
    > = {
      pending: {
        variant: "outline",
        label: "Menunggu",
        className: "border-amber-500 text-amber-600",
      },
      approved: {
        variant: "default",
        label: "Disetujui",
        className: "bg-blue-500",
      },
      processing: {
        variant: "secondary",
        label: "Diproses",
        className: "bg-blue-100 text-blue-700",
      },
      completed: {
        variant: "default",
        label: "Selesai",
        className: "bg-primary-500",
      },
      failed: { variant: "destructive", label: "Gagal" },
      rejected: { variant: "destructive", label: "Ditolak" },
      cancelled: {
        variant: "outline",
        label: "Dibatalkan",
        className: "text-slate-500",
      },
    };
    const statusConfig = config[status] || config.pending;
    return (
      <Badge variant={statusConfig.variant} className={statusConfig.className}>
        {statusConfig.label}
      </Badge>
    );
  };

  const getOrderStatusBadge = (status: string) => {
    const badges: Record<string, ReactElement> = {
      pending: (
        <Badge variant="outline" className="border-amber-500 text-amber-600">
          Menunggu
        </Badge>
      ),
      processing: (
        <Badge variant="outline" className="bg-white border-blue-500 text-blue-600 hover:bg-slate-50 dark:bg-slate-900/10 dark:border-blue-400 dark:text-blue-400">
          Diproses
        </Badge>
      ),
      ready_pickup: (
        <Badge variant="outline" className="bg-white border-purple-500 text-purple-600 hover:bg-slate-50 dark:bg-slate-900/10 dark:border-purple-400 dark:text-purple-400">
          Siap Ambil
        </Badge>
      ),
      in_delivery: (
        <Badge variant="outline" className="bg-white border-cyan-500 text-cyan-600 hover:bg-slate-50 dark:bg-slate-900/10 dark:border-cyan-400 dark:text-cyan-400">
          Dalam Pengiriman
        </Badge>
      ),
      completed: (
        <Badge variant="default" className="bg-primary-500">
          Selesai
        </Badge>
      ),
      cancelled: <Badge variant="destructive">Dibatalkan</Badge>,
      waiting_price: (
        <Badge variant="outline" className="border-purple-500 text-purple-600">
          Tunggu Harga
        </Badge>
      ),
      waiting_confirmation: (
        <Badge variant="outline" className="border-blue-500 text-blue-600">
          Tunggu Konfirmasi
        </Badge>
      ),
      waiting_shipping_fee: (
        <Badge variant="outline" className="border-cyan-500 text-cyan-600">
          Tunggu Ongkir
        </Badge>
      ),
    };
    return badges[status] || <Badge variant="outline">{status}</Badge>;
  };

  const getPaymentStatusBadge = (status: string) => {
    const badges: Record<string, ReactElement> = {
      pending: (
        <Badge variant="outline" className="border-amber-500 text-amber-600">
          Menunggu
        </Badge>
      ),
      paid: (
        <Badge variant="default" className="bg-primary-500">
          Dibayar
        </Badge>
      ),
      failed: <Badge variant="destructive">Gagal</Badge>,
      refunded: (
        <Badge variant="default" className="bg-secondary text-white hover:bg-secondary/90 border-transparent">
          Dikembalikan
        </Badge>
      ),
    };
    return badges[status] || <Badge variant="outline">{status}</Badge>;
  };

  const facultyAccentClass = "bg-slate-700";

  const filteredCancelRequests = useMemo(() => {
    return cancelRequests.filter((cr) => {
      const matchesRole = (() => {
        if (cancelRequestRoleFilter === "all") return true;
        const isBuyer = cr.requester?.id === cr.order?.buyer?.id;
        const isSeller = cr.requester?.id === cr.order?.seller?.id;
        if (cancelRequestRoleFilter === "pembeli" && isBuyer) return true;
        if (cancelRequestRoleFilter === "penjual" && isSeller) return true;
        return false;
      })();
      const matchesSearch =
        cancelRequestSearchTerm === "" ||
        cr.requestNumber
          ?.toLowerCase()
          ?.includes(cancelRequestSearchTerm.toLowerCase()) ||
        cr.description
          ?.toLowerCase()
          ?.includes(cancelRequestSearchTerm.toLowerCase()) ||
        cr.reason
          ?.toLowerCase()
          ?.includes(cancelRequestSearchTerm.toLowerCase()) ||
        cr.requester?.name
          ?.toLowerCase()
          ?.includes(cancelRequestSearchTerm.toLowerCase()) ||
        cr.orderId
          ?.toLowerCase()
          ?.includes(cancelRequestSearchTerm.toLowerCase()) ||
        cr.order?.orderNumber
          ?.toLowerCase()
          ?.includes(cancelRequestSearchTerm.toLowerCase());
      return matchesRole && matchesSearch;
    });
  }, [cancelRequests, cancelRequestRoleFilter, cancelRequestSearchTerm]);

  return {
    activeTab,
    setActiveTab,
    successMessage,
    lastUpdatedAt,
    stats: displayStats,
    activitySummary: displayActivitySummary,
    revenueChartData,
    categoryChartData,
    orders,
    users,
    withdrawals,
    cancelRequests,
    filteredCancelRequests,
    platformRevenue,
    // Per-resource loading states
    overviewLoading,
    usersLoading,
    productsLoading,
    reportsLoading,
    withdrawalsLoading,
    platformRevenueLoading,
    categoriesLoading,
    facultiesLoading,
    cancelRequestsLoading,
    // Per-resource error states
    overviewError,
    usersError,
    productsError,
    reportsError,
    withdrawalsError,
    platformRevenueError,
    categoriesError,
    facultiesError,
    // Resource cache map (true = successfully loaded at least once)
    loadedResources,
    filteredUsers,
    filteredProducts,
    filteredReports,
    filteredWithdrawals,
    filteredAddresses,
    addressesLoading,
    addressesError,
    loadAddressesData,
    filteredOrders,
    filteredCategories,
    filteredFaculties,
    paginatedUsers,
    paginatedProducts,
    paginatedReports,
    paginatedWithdrawals,
    paginatedOrders,
    paginatedFaculties,
    userTotalItems,
    userTotalPages,
    productTotalItems,
    productTotalPages,
    productCategoryOptions,
    userPage,
    setUserPage,
    productPage,
    setProductPage,
    reportPage,
    setReportPage,
    withdrawalPage,
    setWithdrawalPage,
    orderPage,
    setOrderPage,
    facultyPage,
    setFacultyPage,
    showUserFilters,
    setShowUserFilters,
    showProductFilters,
    setShowProductFilters,
    showWithdrawalFilters,
    setShowWithdrawalFilters,
    showOrderFilters,
    setShowOrderFilters,
    userSearchTerm,
    setUserSearchTerm,
    userStatusFilter,
    setUserStatusFilter,
    userFacultyFilter,
    setUserFacultyFilter,
    productSearchTerm,
    setProductSearchTerm,
    productTypeFilter,
    setProductTypeFilter,
    productConditionFilter,
    setProductConditionFilter,
    productCategoryFilter,
    setProductCategoryFilter,
    productPriceMin,
    setProductPriceMin,
    productPriceMax,
    setProductPriceMax,
    productSellerFilter,
    setProductSellerFilter,
    withdrawalSearchTerm,
    setWithdrawalSearchTerm,
    withdrawalStatusFilter,
    setWithdrawalStatusFilter,
    withdrawalAccountTypeFilter,
    setWithdrawalAccountTypeFilter,
    withdrawalProviderFilter,
    setWithdrawalProviderFilter,
    addressSearchTerm,
    setAddressSearchTerm,
    orderSearchTerm,
    setOrderSearchTerm,
    orderStatusFilter,
    setOrderStatusFilter,
    orderTypeFilter,
    setOrderTypeFilter,
    orderCategoryFilter,
    setOrderCategoryFilter,
    orderPaymentFilter,
    setOrderPaymentFilter,
    reportSearchTerm,
    setReportSearchTerm,
    reportStatusFilter,
    setReportStatusFilter,
    categorySearchTerm,
    setCategorySearchTerm,
    categoryTypeFilter,
    setCategoryTypeFilter,
    facultySearchTerm,
    setFacultySearchTerm,
    facultyStatusFilter,
    setFacultyStatusFilter,
    financeSubTab,
    setFinanceSubTab,
    // Top Up Exports
    topups,
    topupLoading,
    topupError,
    topupSearchTerm,
    setTopupSearchTerm,
    topupStatusFilter,
    setTopupStatusFilter,
    topupPage,
    setTopupPage,
    topupTotalItems,
    topupTotalPages,
    topupStats,
    loadTopupsData,
    ordersLoading,
    ordersError,
    orderTotalItems,
    orderTotalPages,
    showUserDetail,
    setShowUserDetail,
    selectedUser,
    userDetailLoading,
    userDetailError,
    showBanDialog,
    setShowBanDialog,
    showUnbanDialog,
    setShowUnbanDialog,
    userToAction,
    banReason,
    setBanReason,
    unbanReason,
    setUnbanReason,
    showProductDetail,
    setShowProductDetail,
    selectedProduct,
    productDetailLoading,
    productDetailError,
    showDeleteProductDialog,
    setShowDeleteProductDialog,
    productToDelete,
    productDeleteReason,
    setProductDeleteReason,
    showWarningDialog,
    setShowWarningDialog,
    showBanReportDialog,
    setShowBanReportDialog,
    selectedReport,
    financialModalOpen,
    setFinancialModalOpen,
    financialModalVariant,
    setFinancialModalVariant,
    financialLoading,
    financialError,
    selectedWithdrawal,
    setSelectedWithdrawal,
    revenueModalOpen,
    setRevenueModalOpen,
    selectedRevenueTransaction,
    setSelectedRevenueTransaction,
    showCategoryDialog,
    setShowCategoryDialog,
    selectedCategory,
    categoryForm,
    setCategoryForm,
    showDeleteCategoryDialog,
    setShowDeleteCategoryDialog,
    categoryToDelete,
    categories,
    showCancelApproveDialog,
    setShowCancelApproveDialog,
    showCancelRejectDialog,
    setShowCancelRejectDialog,
    selectedCancelRequest,
    cancelApproveNotes,
    setCancelApproveNotes,
    cancelRejectReasonInput,
    setCancelRejectReasonInput,
    cancelRequestRoleFilter,
    setCancelRequestRoleFilter,
    cancelRequestSearchTerm,
    setCancelRequestSearchTerm,
    showFacultyDialog,
    setShowFacultyDialog,
    selectedFaculty,
    facultyForm,
    setFacultyForm,
    showDeleteFacultyDialog,
    setShowDeleteFacultyDialog,
    facultyToDelete,
    facultyAccentClass,
    getTotalPages,
    renderPagination,
    formatPrice,
    formatProductPrice,
    getReportStatusBadge,
    getWithdrawalStatusBadge,
    getOrderStatusBadge,
    getPaymentStatusBadge,
    getInitials,
    getFacultyName,
    cancelReasons: CANCEL_REASONS,
    handleViewUser,
    handleBanUser,
    handleUnbanUser,
    confirmBanUser,
    confirmUnbanUser,
    handleViewProduct,
    handleDeleteProduct,
    confirmDeleteProduct,
    handleSendWarning,
    handleBanFromReport,
    confirmSendWarning,
    confirmBanFromReport,
    handleResolveReport,
    handleDismissReport,
    handleApproveWithdrawal,
    handleRejectWithdrawal,
    handleProcessWithdrawal,
    handleCompleteWithdrawal,
    handleFailWithdrawal,
    handleViewWithdrawal,
    handleViewRevenueTransaction,
    confirmApproveWithdrawal,
    confirmRejectWithdrawal,
    confirmCompleteWithdrawal,
    confirmFailWithdrawal,
    handleApproveCancelRequest,
    handleRejectCancelRequest,
    confirmApproveCancelRequest,
    confirmRejectCancelRequest,
    handleAddCategory,
    handleEditCategory,
    handleDeleteCategory,
    handleSaveCategory,
    confirmDeleteCategory,
    handleToggleCategoryActive,
    handleAddFaculty,
    handleEditFaculty,
    handleDeleteFaculty,
    handleSaveFaculty,
    confirmDeleteFaculty,
    handleToggleFacultyActive,
    handleRestoreProduct,
  };
}
