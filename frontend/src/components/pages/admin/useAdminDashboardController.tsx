import { useEffect, useMemo, useState } from "react";
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
  mockAddresses,
  mockCategories,
  mockServiceCategories,
  mockOrders,
  platformRevenue,
  getFacultyName,
  CANCEL_REASONS,
} from "@/lib/mock-data";
import type { User, Product, Category, Order, Report, Withdrawal, CancelRequest } from "@/lib/mock-data";
import type { Faculty } from "@/components/pages/admin/admin-dashboard.shared";
import { getInitials, seedFaculties } from "@/components/pages/admin/admin-dashboard.shared";
import { facultiesApi } from "@/lib/api/faculties";
import { 
  adminCategoriesApi,
  adminDashboardApi,
  adminProductsApi,
  adminUsersApi,
  adminReportsApi,
  adminWithdrawalsApi,
} from "@/lib/api/admin";

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
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showUnbanDialog, setShowUnbanDialog] = useState(false);
  const [userToAction, setUserToAction] = useState<User | null>(null);
  const [banReason, setBanReason] = useState("");
  const [unbanReason, setUnbanReason] = useState("");

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [showDeleteProductDialog, setShowDeleteProductDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [productDeleteReason, setProductDeleteReason] = useState("");

  const [reports, setReports] = useState<Report[]>([]);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [showBanReportDialog, setShowBanReportDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showFailDialog, setShowFailDialog] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [failureReason, setFailureReason] = useState("");

  const [financeSubTab, setFinanceSubTab] = useState<"withdrawals" | "revenue">("withdrawals");

  const [cancelRequests, setCancelRequests] = useState<CancelRequest[]>([]);
  const [showCancelApproveDialog, setShowCancelApproveDialog] = useState(false);
  const [showCancelRejectDialog, setShowCancelRejectDialog] = useState(false);
  const [selectedCancelRequest, setSelectedCancelRequest] = useState<CancelRequest | null>(null);
  const [cancelApproveNotes, setCancelApproveNotes] = useState("");
  const [cancelRejectReasonInput, setCancelRejectReasonInput] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showDeleteCategoryDialog, setShowDeleteCategoryDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    type: "barang" as "barang" | "jasa",
    description: "",
    sortOrder: 0,
    isActive: true,
  });
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const [categoryTypeFilter, setCategoryTypeFilter] = useState<"all" | "barang" | "jasa">("all");

  const [faculties, setFaculties] = useState<Faculty[]>(seedFaculties);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [showFacultyDialog, setShowFacultyDialog] = useState(false);
  const [showDeleteFacultyDialog, setShowDeleteFacultyDialog] = useState(false);
  const [facultyToDelete, setFacultyToDelete] = useState<Faculty | null>(null);
  const [facultyForm, setFacultyForm] = useState({
    name: "",
    code: "",
    sortOrder: 0,
    isActive: true,
  });
  const [facultySearchTerm, setFacultySearchTerm] = useState("");
  const [facultyStatusFilter, setFacultyStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [facultyPage, setFacultyPage] = useState(1);

  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [userStatusFilter, setUserStatusFilter] = useState<"all" | "active" | "banned" | "warned" | "unverified">("all");
  const [userFacultyFilter, setUserFacultyFilter] = useState<string>("all");

  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [productTypeFilter, setProductTypeFilter] = useState<"all" | "barang" | "jasa">("all");
  const [productConditionFilter, setProductConditionFilter] = useState<"all" | "baru" | "bekas">("all");
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>("all");
  const [productPriceMin, setProductPriceMin] = useState<string>("");
  const [productPriceMax, setProductPriceMax] = useState<string>("");
  const [productSellerFilter, setProductSellerFilter] = useState<string>("");

  const [withdrawalSearchTerm, setWithdrawalSearchTerm] = useState("");
  const [withdrawalStatusFilter, setWithdrawalStatusFilter] = useState<"all" | "pending" | "approved" | "processing" | "completed" | "failed" | "rejected">("all");
  const [withdrawalAccountTypeFilter, setWithdrawalAccountTypeFilter] = useState<"all" | "bank" | "e_wallet">("all");
  const [withdrawalProviderFilter, setWithdrawalProviderFilter] = useState<string>("all");

  const [addressSearchTerm, setAddressSearchTerm] = useState("");

  const [orders] = useState<Order[]>(mockOrders);
  const [stats, setStats] = useState<{
    totalUsers: number;
    activeProducts: number;
    pendingOrders: number;
    totalRevenue: number;
    platformRevenue: number;
    monthlyGrowth: number;
    pendingWithdrawals: number;
    pendingReports: number;
    pendingCancelRequests: number;
    totalFaculties: number;
    activeFaculties: number;
  } | null>(null);
  const [revenueChartData, setRevenueChartData] = useState<Array<{ date: string; transactions: number; revenue: number }>>([]);
  const [categoryChartData, setCategoryChartData] = useState<Array<{ name: string; value: number; fill: string }>>([]);
  const [orderSearchTerm, setOrderSearchTerm] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<"all" | "pending" | "processing" | "ready_pickup" | "in_delivery" | "completed" | "cancelled">("all");
  const [orderTypeFilter, setOrderTypeFilter] = useState<"all" | "barang" | "jasa">("all");
  const [orderCategoryFilter, setOrderCategoryFilter] = useState<string>("all");
  const [orderPaymentFilter, setOrderPaymentFilter] = useState<"all" | "pending" | "paid" | "failed" | "refunded">("all");

  const [reportSearchTerm, setReportSearchTerm] = useState("");
  const [reportStatusFilter, setReportStatusFilter] = useState<"all" | "pending" | "reviewed" | "resolved">("all");

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [userPage, setUserPage] = useState(1);
  const [productPage, setProductPage] = useState(1);
  const [reportPage, setReportPage] = useState(1);
  const [withdrawalPage, setWithdrawalPage] = useState(1);
  const [orderPage, setOrderPage] = useState(1);

  const getPaginatedData = <T,>(data: T[], page: number): T[] => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return data.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  const getTotalPages = (totalItems: number): number => Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;

  useEffect(() => {
    const controller = new AbortController();

    const loadData = async () => {
      try {
        const [
          apiFaculties,
          apiCategoriesResponse,
          apiStats,
          apiUsers,
          apiProducts,
          apiReports,
          apiWithdrawals,
          apiRevenueStats,
        ] = await Promise.all([
          facultiesApi.listAdmin(),
          adminCategoriesApi.getCategories({ per_page: 100 }),
          adminDashboardApi.getStats(),
          adminUsersApi.getUsers({ per_page: 100 }),
          adminProductsApi.getProducts({ per_page: 100 }),
          adminReportsApi.getReports({ per_page: 100 }),
          adminWithdrawalsApi.getWithdrawals({ per_page: 100 }),
          adminDashboardApi.getRevenueStats(),
        ]);

        if (!controller.signal.aborted) {
          if (apiFaculties.length > 0) {
            setFaculties(apiFaculties);
          }
          
          if (apiCategoriesResponse?.data && Array.isArray(apiCategoriesResponse.data)) {
            const mappedCategories = apiCategoriesResponse.data.map((cat: any) => ({
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
            setCategories(mappedCategories);

            // Process category distribution data for chart with actual product counts
            const colors = ["#3b82f6", "#8b5cf6", "#06b6d4", "#f59e0b", "#6b7280"];
            const categoryCharts = mappedCategories.map((cat: any, idx: number) => ({
              name: cat.name,
              value: cat.productCount || 0,
              fill: colors[idx % colors.length],
            }));
            setCategoryChartData(categoryCharts);
          }

          // Set stats from API
          if (apiStats) {
            const statsData = (apiStats as any).data || apiStats;
            setStats({
              totalUsers: statsData.users?.total || 0,
              activeProducts: statsData.products?.active || 0,
              pendingOrders: statsData.orders?.pending || 0,
              totalRevenue: statsData.orders?.total_revenue || 0,
              platformRevenue: statsData.platform_revenue || 0,
              monthlyGrowth: 12.5,
              pendingWithdrawals: statsData.withdrawals?.pending || 0,
              pendingReports: statsData.reports?.pending || 0,
              pendingCancelRequests: 3,
              totalFaculties: statsData.faculties?.total || 0,
              activeFaculties: statsData.faculties?.active || 0,
            });
          }

          // Set revenue chart data from API
          if (apiRevenueStats) {
            const revenueData = (apiRevenueStats as any).data || apiRevenueStats;
            const chartData = Array.isArray(revenueData) 
              ? revenueData.map((item: any, idx: number) => ({
                  date: (idx + 1).toString(),
                  transactions: item.transactions || item.count || 1,
                  revenue: item.revenue || item.total || 0,
                }))
              : [];
            setRevenueChartData(chartData);
          }

          // Set users data from API
          if (apiUsers?.data && Array.isArray(apiUsers.data)) {
            const mappedUsers = apiUsers.data.map((user: any) => ({
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
              isWarned: user.isWarned || false,
              joinedAt: user.joinedAt || user.created_at || new Date().toISOString(),
              createdAt: user.joinedAt || user.created_at || new Date().toISOString(),
              banReason: user.banReason || "",
            } as unknown as User));
            setUsers(mappedUsers);
          }

          // Set products data from API
          if (apiProducts?.data && Array.isArray(apiProducts.data)) {
            const mappedProducts = apiProducts.data.map((product: any) => ({
              id: product.id?.toString() || product.uuid || "",
              title: product.title || "",
              slug: product.slug || "",
              type: product.type || "barang",
              price: product.price || 0,
              priceMin: product.price_min || product.priceMin || 0,
              priceMax: product.price_max || product.priceMax || 0,
              priceType: product.price_type || product.priceType || "fixed",
              category: product.category?.name || product.category_name || "",
              categoryId: product.category?.uuid || product.category_id?.toString() || "",
              description: product.description || "",
              condition: product.condition || "baru",
              stock: product.stock || 0,
              location: product.location || "",
              canNego: product.can_nego || false,
              seller: {
                id: product.seller?.uuid || product.seller_id?.toString() || "",
                name: product.seller?.name || product.seller_name || "",
                avatar: product.seller?.avatar || product.seller_avatar || "",
              },
              images: product.images || [],
              isActive: product.status === "active" || product.is_active || false,
              createdAt: product.created_at || new Date().toISOString(),
              deletedAt: product.deleted_at || product.deletedAt || undefined,
              deletedBy: product.deleted_by || product.deletedBy || undefined,
            } as unknown as Product));
            setProducts(mappedProducts);
          }

          // Set reports data from API
          if (apiReports?.data && Array.isArray(apiReports.data)) {
            const mappedReports = apiReports.data.map((report: any) => ({
              id: report.id?.toString() || "",
              reportNumber: `RPT-${report.id}`,
              reason: report.reason || "",
              description: report.description || "",
              status: report.status || "pending",
              priority: "normal",
              reporter: {
                id: report.reporter_id?.toString() || "",
                name: report.reporter_name || "",
              },
              reportedUser: {
                id: report.reported_user_id?.toString() || "",
                name: report.reported_user_name || "",
              },
              createdAt: report.created_at || new Date().toISOString(),
            } as unknown as Report));
            setReports(mappedReports);
          }

          // Set withdrawals data from API
          if (apiWithdrawals?.data && Array.isArray(apiWithdrawals.data)) {
            const mappedWithdrawals = apiWithdrawals.data.map((withdrawal: any) => ({
              id: withdrawal.id?.toString() || "",
              withdrawalNumber: `WD-${withdrawal.id}`,
              user: {
                id: withdrawal.user_id?.toString() || "",
                name: withdrawal.user_name || "",
              },
              amount: withdrawal.amount || 0,
              totalDeduction: 0,
              bankName: withdrawal.bank_name || "",
              accountNumber: withdrawal.account_number || "",
              accountName: withdrawal.account_name || "",
              accountType: withdrawal.account_type || "bank",
              status: withdrawal.status || "pending",
              createdAt: withdrawal.created_at || new Date().toISOString(),
            } as unknown as Withdrawal));
            setWithdrawals(mappedWithdrawals);
          }
        }
      } catch (err) {
        console.error("Failed to load admin data:", err);
      }
    };

    loadData();
    return () => controller.abort();
  }, []);

  const renderPagination = (currentPage: number, totalPages: number, setPage: (page: number) => void) => {
    if (totalPages <= 1) return null;

    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("ellipsis");
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
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
              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
          {pages.map((page, index) => (
            <PaginationItem key={index}>
              {page === "ellipsis" ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink onClick={() => setPage(page)} isActive={currentPage === page} className="cursor-pointer">
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  const filteredUsers = useMemo(() => users.filter((user) => {
    const matchesSearch = userSearchTerm === "" || user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) || user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) || (user.phone?.toLowerCase() || "").includes(userSearchTerm.toLowerCase());
    const matchesStatus = userStatusFilter === "all" || (userStatusFilter === "active" && user.isVerified && !user.isBanned && !user.isWarned) || (userStatusFilter === "banned" && user.isBanned) || (userStatusFilter === "warned" && user.isWarned) || (userStatusFilter === "unverified" && !user.isVerified);
    const matchesFaculty = userFacultyFilter === "all" || user.faculty === userFacultyFilter;
    return matchesSearch && matchesStatus && matchesFaculty;
  }), [users, userSearchTerm, userStatusFilter, userFacultyFilter]);

  const filteredProducts = useMemo(() => products.filter((product) => {
    const matchesSearch = productSearchTerm === "" || product.title.toLowerCase().includes(productSearchTerm.toLowerCase()) || product.description.toLowerCase().includes(productSearchTerm.toLowerCase()) || product.seller.name.toLowerCase().includes(productSearchTerm.toLowerCase());
    const matchesType = productTypeFilter === "all" || product.type === productTypeFilter;
    const matchesCondition = productConditionFilter === "all" || (product.type === "barang" && product.condition === productConditionFilter);
    const matchesCategory = productCategoryFilter === "all" || product.categoryId === productCategoryFilter || product.category.toLowerCase() === productCategoryFilter.toLowerCase();
    const productPrice = product.priceMin || product.price;
    const minPrice = productPriceMin ? parseInt(productPriceMin) : 0;
    const maxPrice = productPriceMax ? parseInt(productPriceMax) : Infinity;
    const matchesPrice = productPrice >= minPrice && productPrice <= maxPrice;
    const matchesSeller = productSellerFilter === "" || product.seller.name.toLowerCase().includes(productSellerFilter.toLowerCase());
    return matchesSearch && matchesType && matchesCondition && matchesCategory && matchesPrice && matchesSeller;
  }), [products, productSearchTerm, productTypeFilter, productConditionFilter, productCategoryFilter, productPriceMin, productPriceMax, productSellerFilter]);

  const filteredReports = useMemo(() => reports.filter((report) => {
    const matchesSearch = reportSearchTerm === "" || report.reason.toLowerCase().includes(reportSearchTerm.toLowerCase()) || report.description.toLowerCase().includes(reportSearchTerm.toLowerCase()) || report.reporter.name.toLowerCase().includes(reportSearchTerm.toLowerCase()) || report.reportedUser.name.toLowerCase().includes(reportSearchTerm.toLowerCase());
    const matchesStatus = reportStatusFilter === "all" || report.status === reportStatusFilter;
    return matchesSearch && matchesStatus;
  }), [reports, reportSearchTerm, reportStatusFilter]);

  const filteredWithdrawals = useMemo(() => {
    const commonBanks = ["bca", "mandiri", "bri", "bni", "bsi", "bank bca", "bank mandiri", "bank bri", "bank bni", "bank bsi"];
    const commonEWallets = ["gopay", "ovo", "dana", "shopeepay", "linkaja"];

    return withdrawals.filter((withdrawal) => {
      const matchesSearch = withdrawalSearchTerm === "" || withdrawal.user.name.toLowerCase().includes(withdrawalSearchTerm.toLowerCase()) || withdrawal.bankName.toLowerCase().includes(withdrawalSearchTerm.toLowerCase()) || withdrawal.accountNumber.includes(withdrawalSearchTerm) || withdrawal.accountName.toLowerCase().includes(withdrawalSearchTerm.toLowerCase());
      const matchesStatus = withdrawalStatusFilter === "all" || withdrawal.status === withdrawalStatusFilter;
      const matchesAccountType = withdrawalAccountTypeFilter === "all" || withdrawal.accountType === withdrawalAccountTypeFilter;
      let matchesProvider = true;
      if (withdrawalProviderFilter === "all") {
        matchesProvider = true;
      } else if (withdrawalProviderFilter === "bank_lainnya") {
        matchesProvider = withdrawal.accountType === "bank" && !commonBanks.some((bank) => withdrawal.bankName.toLowerCase().includes(bank));
      } else if (withdrawalProviderFilter === "ewallet_lainnya") {
        matchesProvider = withdrawal.accountType === "e_wallet" && !commonEWallets.some((wallet) => withdrawal.bankName.toLowerCase().includes(wallet));
      } else {
        matchesProvider = withdrawal.bankName.toLowerCase().includes(withdrawalProviderFilter.toLowerCase());
      }
      return matchesSearch && matchesStatus && matchesAccountType && matchesProvider;
    });
  }, [withdrawals, withdrawalSearchTerm, withdrawalStatusFilter, withdrawalAccountTypeFilter, withdrawalProviderFilter]);

  const filteredAddresses = useMemo(() => mockAddresses.filter((address) => {
    const matchesSearch = addressSearchTerm === "" || address.recipient.toLowerCase().includes(addressSearchTerm.toLowerCase()) || address.address.toLowerCase().includes(addressSearchTerm.toLowerCase()) || address.label.toLowerCase().includes(addressSearchTerm.toLowerCase()) || (address.notes && address.notes.toLowerCase().includes(addressSearchTerm.toLowerCase()));
    return matchesSearch;
  }), [addressSearchTerm]);

  const filteredOrders = useMemo(() => orders.filter((order) => {
    const matchesSearch = orderSearchTerm === "" || order.orderNumber.toLowerCase().includes(orderSearchTerm.toLowerCase()) || order.productTitle.toLowerCase().includes(orderSearchTerm.toLowerCase()) || (order.buyer?.name || "").toLowerCase().includes(orderSearchTerm.toLowerCase()) || (order.seller?.name || "").toLowerCase().includes(orderSearchTerm.toLowerCase());
    const matchesStatus = orderStatusFilter === "all" || order.status === orderStatusFilter;
    const matchesType = orderTypeFilter === "all" || order.productType === orderTypeFilter;
    const matchesCategory = orderCategoryFilter === "all" || order.product?.categoryId === orderCategoryFilter;
    const matchesPayment = orderPaymentFilter === "all" || order.paymentStatus === orderPaymentFilter;
    return matchesSearch && matchesStatus && matchesType && matchesCategory && matchesPayment;
  }), [orders, orderSearchTerm, orderStatusFilter, orderTypeFilter, orderCategoryFilter, orderPaymentFilter]);

  const filteredFaculties = useMemo(() => faculties.filter((faculty) => {
    const matchesSearch = facultySearchTerm === "" || faculty.name.toLowerCase().includes(facultySearchTerm.toLowerCase()) || faculty.code.toLowerCase().includes(facultySearchTerm.toLowerCase());
    const matchesStatus = facultyStatusFilter === "all" || (facultyStatusFilter === "active" && faculty.isActive) || (facultyStatusFilter === "inactive" && !faculty.isActive);
    return matchesSearch && matchesStatus;
  }).sort((a, b) => a.sortOrder - b.sortOrder), [faculties, facultySearchTerm, facultyStatusFilter]);

  const paginatedUsers = useMemo(() => getPaginatedData(filteredUsers, userPage), [filteredUsers, userPage]);
  const paginatedProducts = useMemo(() => getPaginatedData(filteredProducts, productPage), [filteredProducts, productPage]);
  const paginatedReports = useMemo(() => getPaginatedData(filteredReports, reportPage), [filteredReports, reportPage]);
  const paginatedWithdrawals = useMemo(() => getPaginatedData(filteredWithdrawals, withdrawalPage), [filteredWithdrawals, withdrawalPage]);
  const paginatedOrders = useMemo(() => getPaginatedData(filteredOrders, orderPage), [filteredOrders, orderPage]);
  const paginatedFaculties = useMemo(() => getPaginatedData(filteredFaculties, facultyPage), [filteredFaculties, facultyPage]);
  const productCategoryOptions = [...mockCategories, ...mockServiceCategories];

  const displayStats = stats || {
    totalUsers: 0,
    activeProducts: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    platformRevenue: 0,
    monthlyGrowth: 0,
    pendingWithdrawals: 0,
    pendingReports: 0,
    pendingCancelRequests: 0,
    totalFaculties: faculties.length,
    activeFaculties: faculties.filter((faculty) => faculty.isActive).length,
  };

  const formatPrice = (price: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);

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

  const handleViewUser = (user: User) => { setSelectedUser(user); setShowUserDetail(true); };
  const handleBanUser = (user: User) => { setUserToAction(user); setShowBanDialog(true); };
  const confirmBanUser = async () => {
    if (userToAction) {
      try {
        await adminUsersApi.banUser(userToAction.id, { ban_reason: "Melanggar aturan platform KampusMarket." });
        setUsers(users.map((u) => u.id === userToAction.id ? { ...u, isBanned: true, banReason: "Melanggar aturan platform KampusMarket." } : u));
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
  const handleUnbanUser = (user: User) => { setUserToAction(user); setShowUnbanDialog(true); };
  const confirmUnbanUser = async () => {
    if (userToAction) {
      try {
        await adminUsersApi.unbanUser(userToAction.id);
        setUsers(users.map((u) => u.id === userToAction.id ? { ...u, isBanned: false, banReason: undefined } : u));
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

  const handleViewProduct = (product: Product) => { setSelectedProduct(product); setShowProductDetail(true); };
  const handleDeleteProduct = (product: Product) => { setProductToDelete(product); setShowDeleteProductDialog(true); };
  const confirmDeleteProduct = async () => {
    if (productToDelete) {
      try {
        await adminProductsApi.deleteProduct(productToDelete.id, { delete_reason: "Dihapus oleh admin." });
        setProducts(products.map((p) => p.id === productToDelete.id ? { ...p, deletedAt: new Date().toISOString(), deletedBy: "admin" } : p));
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
      setProducts(products.map(p => p.id === product.id ? { ...p, deletedAt: undefined, deletedBy: undefined } : p));
      showSuccess(`Produk "${product.title}" berhasil dipulihkan`);
    } catch (err) {
      console.error(err);
      showSuccess(`Gagal memulihkan produk "${product.title}"`);
    }
  };

  const handleSendWarning = (report: Report) => { setSelectedReport(report); setShowWarningDialog(true); };
  const confirmSendWarning = () => {
    if (selectedReport) {
      setReports(reports.map((r) => r.id === selectedReport.id ? { ...r, status: "reviewed" as const } : r));
      setUsers(users.map((u) => u.id === selectedReport.reportedUser.id ? { ...u, isWarned: true, warningReason: selectedReport.reason } : u));
      showSuccess(`Warning berhasil dikirim ke ${selectedReport.reportedUser.name}`);
      setShowWarningDialog(false);
      setSelectedReport(null);
    }
  };
  const handleBanFromReport = (report: Report) => { setSelectedReport(report); setShowBanReportDialog(true); };
  const confirmBanFromReport = () => {
    if (selectedReport) {
      setUsers(users.map((u) => u.id === selectedReport.reportedUser.id ? { ...u, isBanned: true, banReason: selectedReport.reason } : u));
      setReports(reports.map((r) => r.id === selectedReport.id ? { ...r, status: "resolved" as const } : r));
      showSuccess(`User ${selectedReport.reportedUser.name} berhasil diblokir`);
      setShowBanReportDialog(false);
      setSelectedReport(null);
    }
  };

  const handleApproveWithdrawal = (withdrawal: Withdrawal) => { setSelectedWithdrawal(withdrawal); setShowApproveDialog(true); };
  const confirmApproveWithdrawal = () => {
    if (selectedWithdrawal) {
      setWithdrawals(withdrawals.map((w) => w.id === selectedWithdrawal.id ? { ...w, status: "approved" as const, processedAt: new Date().toLocaleDateString("id-ID") } : w));
      showSuccess(`Penarikan ${formatPrice(selectedWithdrawal.amount)} berhasil disetujui`);
      setShowApproveDialog(false);
      setSelectedWithdrawal(null);
    }
  };
  const handleRejectWithdrawal = (withdrawal: Withdrawal) => { setSelectedWithdrawal(withdrawal); setRejectionReason(""); setShowRejectDialog(true); };
  const confirmRejectWithdrawal = () => {
    if (selectedWithdrawal && rejectionReason.trim()) {
      setWithdrawals(withdrawals.map((w) => w.id === selectedWithdrawal.id ? { ...w, status: "rejected" as const, rejectionReason: rejectionReason.trim(), processedAt: new Date().toLocaleDateString("id-ID") } : w));
      showSuccess(`Penarikan ${formatPrice(selectedWithdrawal.amount)} ditolak`);
      setShowRejectDialog(false);
      setSelectedWithdrawal(null);
      setRejectionReason("");
    }
  };

  const handleApproveCancelRequest = (cancelReq: CancelRequest) => { setSelectedCancelRequest(cancelReq); setCancelApproveNotes(""); setShowCancelApproveDialog(true); };
  const confirmApproveCancelRequest = () => {
    if (selectedCancelRequest) {
      setCancelRequests(cancelRequests.map((cr) => cr.id === selectedCancelRequest.id ? { ...cr, status: "approved" as const, adminNotes: cancelApproveNotes || "Permintaan pembatalan disetujui. Refund akan diproses.", refundProcessed: true, reviewedAt: new Date().toLocaleDateString("id-ID"), refundedAt: new Date().toLocaleDateString("id-ID") } : cr));
      setUsers(users.map((u) => u.id === selectedCancelRequest.requester.id ? { ...u, walletBalance: (u.walletBalance || 0) + selectedCancelRequest.refundAmount } : u));
      showSuccess(`Permintaan pembatalan ${selectedCancelRequest.requestNumber} disetujui. Refund ${formatPrice(selectedCancelRequest.refundAmount)} telah dikembalikan ke dompet pembeli.`);
      setShowCancelApproveDialog(false);
      setSelectedCancelRequest(null);
      setCancelApproveNotes("");
    }
  };
  const handleRejectCancelRequest = (cancelReq: CancelRequest) => { setSelectedCancelRequest(cancelReq); setCancelRejectReasonInput(""); setShowCancelRejectDialog(true); };
  const confirmRejectCancelRequest = () => {
    if (selectedCancelRequest && cancelRejectReasonInput.trim()) {
      setCancelRequests(cancelRequests.map((cr) => cr.id === selectedCancelRequest.id ? { ...cr, status: "rejected" as const, rejectionReason: cancelRejectReasonInput.trim(), reviewedAt: new Date().toLocaleDateString("id-ID") } : cr));
      showSuccess(`Permintaan pembatalan ${selectedCancelRequest.requestNumber} ditolak`);
      setShowCancelRejectDialog(false);
      setSelectedCancelRequest(null);
      setCancelRejectReasonInput("");
    }
  };

  const handleCompleteWithdrawal = (withdrawal: Withdrawal) => { setSelectedWithdrawal(withdrawal); setShowCompleteDialog(true); };
  const confirmCompleteWithdrawal = () => {
    if (selectedWithdrawal) {
      setWithdrawals(withdrawals.map((w) => w.id === selectedWithdrawal.id ? { ...w, status: "completed" as const, processedAt: new Date().toLocaleDateString("id-ID") } : w));
      showSuccess(`Penarikan ${formatPrice(selectedWithdrawal.amount)} berhasil diselesaikan`);
      setShowCompleteDialog(false);
      setSelectedWithdrawal(null);
    }
  };
  const handleFailWithdrawal = (withdrawal: Withdrawal) => { setSelectedWithdrawal(withdrawal); setFailureReason(""); setShowFailDialog(true); };
  const confirmFailWithdrawal = () => {
    if (selectedWithdrawal && failureReason.trim()) {
      setWithdrawals(withdrawals.map((w) => w.id === selectedWithdrawal.id ? { ...w, status: "failed" as const, failureReason: failureReason.trim(), processedAt: new Date().toLocaleDateString("id-ID") } : w));
      showSuccess(`Penarikan ${formatPrice(selectedWithdrawal.amount)} ditandai gagal`);
      setShowFailDialog(false);
      setSelectedWithdrawal(null);
      setFailureReason("");
    }
  };
  const handleProcessWithdrawal = (withdrawal: Withdrawal) => {
    setWithdrawals(withdrawals.map((w) => w.id === withdrawal.id ? { ...w, status: "processing" as const } : w));
    showSuccess(`Penarikan ${formatPrice(withdrawal.amount)} sedang diproses`);
  };

  const filteredCategories = useMemo(() => categories.filter((cat) => {
    const matchesSearch = cat.name.toLowerCase().includes(categorySearchTerm.toLowerCase());
    const matchesType = categoryTypeFilter === "all" || cat.type === categoryTypeFilter;
    return matchesSearch && matchesType;
  }).sort((a, b) => a.sortOrder - b.sortOrder), [categories, categorySearchTerm, categoryTypeFilter]);

  const handleAddCategory = () => {
    setSelectedCategory(null);
    // Calculate next sort order based on type
    const barangCategories = categories.filter(c => c.type === "barang");
    const nextSortOrder = barangCategories.length > 0 
      ? Math.max(...barangCategories.map(c => c.sortOrder)) + 1
      : 1;
    setCategoryForm({ name: "", type: "barang", description: "", sortOrder: nextSortOrder, isActive: true });
    setShowCategoryDialog(true);
  };
  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setCategoryForm({ name: category.name, type: category.type, description: category.description || "", sortOrder: category.sortOrder, isActive: category.isActive });
    setShowCategoryDialog(true);
  };
  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim()) return;
    
    try {
      if (selectedCategory) {
        const updatedCat = await adminCategoriesApi.updateCategory(selectedCategory.id, {
          name: categoryForm.name.trim(),
          type: categoryForm.type,
          sort_order: categoryForm.sortOrder,
          is_active: categoryForm.isActive,
        });
        
        setCategories(categories.map((c) => c.id === selectedCategory.id ? {
          ...c,
          name: updatedCat.name,
          type: updatedCat.type,
          sortOrder: updatedCat.sort_order,
          isActive: updatedCat.is_active,
          slug: updatedCat.slug,
          description: updatedCat.description
        } : c));
        showSuccess(`Kategori "${categoryForm.name}" berhasil diperbarui`);
      } else {
        const newCat = await adminCategoriesApi.createCategory({
          name: categoryForm.name.trim(),
          type: categoryForm.type,
          sort_order: categoryForm.sortOrder,
          is_active: categoryForm.isActive,
        });
        
        const mappedNewCat: Category = {
          id: newCat.id?.toString() || newCat.slug,
          name: newCat.name,
          slug: newCat.slug,
          type: newCat.type,
          description: newCat.description,
          sortOrder: newCat.sort_order || 0,
          isActive: newCat.is_active,
          createdAt: newCat.created_at || new Date().toISOString().split("T")[0],
        };
        
        setCategories([...categories, mappedNewCat]);
        showSuccess(`Kategori "${categoryForm.name}" berhasil ditambahkan`);
      }
    } catch (err) {
      console.error("Failed to save category:", err);
      showSuccess("Gagal menyimpan kategori ke database, silakan coba lagi.");
    }
    
    setShowCategoryDialog(false);
    setSelectedCategory(null);
  };
  const handleDeleteCategory = (category: Category) => { setCategoryToDelete(category); setShowDeleteCategoryDialog(true); };
  const confirmDeleteCategory = async () => {
    if (categoryToDelete) {
      try {
        await adminCategoriesApi.deleteCategory(categoryToDelete.id);
        setCategories(categories.filter((c) => c.id !== categoryToDelete.id));
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
      setCategories(categories.map((c) => c.id === category.id ? { ...c, isActive: nextState } : c));
      showSuccess(`Kategori "${category.name}" ${nextState ? "diaktifkan" : "dinonaktifkan"}`);
    } catch (err) {
      console.error("Failed to toggle category status:", err);
      showSuccess("Gagal mengubah status kategori.");
    }
  };

  const handleAddFaculty = () => {
    setSelectedFaculty(null);
    setFacultyForm({ name: "", code: "", sortOrder: faculties.length + 1, isActive: true });
    setShowFacultyDialog(true);
  };
  const handleEditFaculty = (faculty: Faculty) => {
    setSelectedFaculty(faculty);
    setFacultyForm({ name: faculty.name, code: faculty.code, sortOrder: faculty.sortOrder, isActive: faculty.isActive });
    setShowFacultyDialog(true);
  };
  const handleSaveFaculty = async () => {
    if (!facultyForm.name.trim() || !facultyForm.code.trim()) return;
    const normalizedCode = facultyForm.code.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    try {
      if (selectedFaculty) {
        const updatedFaculty = await facultiesApi.update(selectedFaculty.code, {
          code: normalizedCode || selectedFaculty.code,
          name: facultyForm.name.trim(),
          sortOrder: facultyForm.sortOrder,
          isActive: facultyForm.isActive,
        });

        setFaculties(
          faculties.map((faculty) =>
            faculty.id === selectedFaculty.id ? updatedFaculty : faculty
          )
        );
        showSuccess(`Fakultas "${facultyForm.name}" berhasil diperbarui`);
      } else {
        const createdFaculty = await facultiesApi.create({
          code: normalizedCode || facultyForm.code.toLowerCase(),
          name: facultyForm.name.trim(),
          sortOrder: facultyForm.sortOrder,
          isActive: facultyForm.isActive,
        });

        setFaculties([...faculties, createdFaculty]);
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
                  sortOrder: facultyForm.sortOrder,
                  isActive: facultyForm.isActive,
                }
              : faculty
          )
        );
        showSuccess(`Fakultas "${facultyForm.name}" berhasil diperbarui (mode lokal)`);
      } else {
        const newFaculty: Faculty = {
          id: normalizedCode || `fac-${Date.now()}`,
          code: normalizedCode || facultyForm.code.toLowerCase(),
          name: facultyForm.name.trim(),
          sortOrder: facultyForm.sortOrder,
          isActive: facultyForm.isActive,
        };
        setFaculties([...faculties, newFaculty]);
        showSuccess(`Fakultas "${facultyForm.name}" berhasil ditambahkan (mode lokal)`);
      }
    }

    setShowFacultyDialog(false);
    setSelectedFaculty(null);
    setFacultyPage(1);
  };
  const handleDeleteFaculty = (faculty: Faculty) => { setFacultyToDelete(faculty); setShowDeleteFacultyDialog(true); };
  const confirmDeleteFaculty = async () => {
    if (facultyToDelete) {
      try {
        await facultiesApi.remove(facultyToDelete.code);
        setFaculties(faculties.filter((faculty) => faculty.id !== facultyToDelete.id));
        showSuccess(`Fakultas "${facultyToDelete.name}" berhasil dihapus`);
      } catch {
        setFaculties(faculties.filter((faculty) => faculty.id !== facultyToDelete.id));
        showSuccess(`Fakultas "${facultyToDelete.name}" berhasil dihapus (mode lokal)`);
      }

      setShowDeleteFacultyDialog(false);
      setFacultyToDelete(null);
    }
  };
  const handleToggleFacultyActive = async (faculty: Faculty) => {
    const nextState = !faculty.isActive;

    try {
      const updatedFaculty = await facultiesApi.updateStatus(faculty.code, nextState);
      setFaculties(
        faculties.map((item) =>
          item.id === faculty.id ? updatedFaculty : item
        )
      );
      showSuccess(`Fakultas "${faculty.name}" ${nextState ? "diaktifkan" : "dinonaktifkan"}`);
    } catch {
      setFaculties(
        faculties.map((item) =>
          item.id === faculty.id ? { ...item, isActive: nextState } : item
        )
      );
      showSuccess(`Fakultas "${faculty.name}" ${nextState ? "diaktifkan" : "dinonaktifkan"} (mode lokal)`);
    }
  };

  const getReportStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      pending: { variant: "outline", label: "Menunggu" },
      reviewed: { variant: "secondary", label: "Ditinjau" },
      resolved: { variant: "default", label: "Selesai" },
    };
    const statusConfig = config[status] || config.pending;
    return <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>;
  };

  const getWithdrawalStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string; className?: string }> = {
      pending: { variant: "outline", label: "Menunggu", className: "border-amber-500 text-amber-600" },
      approved: { variant: "default", label: "Disetujui", className: "bg-blue-500" },
      processing: { variant: "secondary", label: "Diproses", className: "bg-blue-100 text-blue-700" },
      completed: { variant: "default", label: "Selesai", className: "bg-primary-500" },
      failed: { variant: "destructive", label: "Gagal" },
      rejected: { variant: "destructive", label: "Ditolak" },
      cancelled: { variant: "outline", label: "Dibatalkan", className: "text-slate-500" },
    };
    const statusConfig = config[status] || config.pending;
    return <Badge variant={statusConfig.variant} className={statusConfig.className}>{statusConfig.label}</Badge>;
  };

  const getOrderStatusBadge = (status: string) => {
    const badges: Record<string, ReactElement> = {
      pending: <Badge variant="outline" className="border-amber-500 text-amber-600">Menunggu</Badge>,
      processing: <Badge variant="secondary" className="bg-blue-100 text-blue-700">Diproses</Badge>,
      ready_pickup: <Badge variant="secondary" className="bg-purple-100 text-purple-700">Siap Ambil</Badge>,
      in_delivery: <Badge variant="secondary" className="bg-cyan-100 text-cyan-700">Dalam Pengiriman</Badge>,
      completed: <Badge variant="default" className="bg-primary-500">Selesai</Badge>,
      cancelled: <Badge variant="destructive">Dibatalkan</Badge>,
      waiting_price: <Badge variant="outline" className="border-purple-500 text-purple-600">Tunggu Harga</Badge>,
      waiting_confirmation: <Badge variant="outline" className="border-blue-500 text-blue-600">Tunggu Konfirmasi</Badge>,
      waiting_shipping_fee: <Badge variant="outline" className="border-cyan-500 text-cyan-600">Tunggu Ongkir</Badge>,
    };
    return badges[status] || <Badge variant="outline">{status}</Badge>;
  };

  const getPaymentStatusBadge = (status: string) => {
    const badges: Record<string, ReactElement> = {
      pending: <Badge variant="outline" className="border-amber-500 text-amber-600">Menunggu</Badge>,
      paid: <Badge variant="default" className="bg-primary-500">Dibayar</Badge>,
      failed: <Badge variant="destructive">Gagal</Badge>,
      refunded: <Badge variant="secondary">Dikembalikan</Badge>,
    };
    return badges[status] || <Badge variant="outline">{status}</Badge>;
  };

  const facultyAccentClass = "bg-slate-700";

  return {
    activeTab,
    setActiveTab,
    successMessage,
    stats: displayStats,
    revenueChartData,
    categoryChartData,
    orders,
    users,
    withdrawals,
    cancelRequests,
    platformRevenue,
    filteredUsers,
    filteredProducts,
    filteredReports,
    filteredWithdrawals,
    filteredAddresses,
    filteredOrders,
    filteredCategories,
    filteredFaculties,
    paginatedUsers,
    paginatedProducts,
    paginatedReports,
    paginatedWithdrawals,
    paginatedOrders,
    paginatedFaculties,
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
    showUserDetail,
    setShowUserDetail,
    selectedUser,
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
    showApproveDialog,
    setShowApproveDialog,
    showRejectDialog,
    setShowRejectDialog,
    showCompleteDialog,
    setShowCompleteDialog,
    showFailDialog,
    setShowFailDialog,
    selectedWithdrawal,
    rejectionReason,
    setRejectionReason,
    failureReason,
    setFailureReason,
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
    handleApproveWithdrawal,
    handleRejectWithdrawal,
    handleProcessWithdrawal,
    handleCompleteWithdrawal,
    handleFailWithdrawal,
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
