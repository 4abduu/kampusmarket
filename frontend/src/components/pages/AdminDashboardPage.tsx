"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  Ban,
  Trash2,
  MessageCircle,
  Clock,
  Wallet,
  BarChart3,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  LayoutDashboard,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Shield,
  X,
  AlertCircle,
  UserCheck,
  Home,
  Building,
  MapPinned,
  Plus,
  Pencil,
  Tag,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  Check,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { mockUsers, mockProducts, mockReports, mockWithdrawals, mockAddresses, mockCategories, mockServiceCategories, mockOrders, mockCancelRequests, platformRevenue, getFacultyName, CANCEL_REASONS } from "@/lib/mock-data";
import type { User, Product, Category, Order, Report, Withdrawal, CancelRequest } from "@/lib/mock-data";
import type { ReactNode } from "react";

interface AdminDashboardPageProps {
  onNavigate: (page: string) => void;
}

// Helper function to safely get initials from a name
const getInitials = (name: string | undefined | null): string => {
  if (!name) return "?";
  return name
    .toString()
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";
};

export default function AdminDashboardPage({ onNavigate }: AdminDashboardPageProps) {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Filter visibility state
  const [showUserFilters, setShowUserFilters] = useState(false);
  const [showProductFilters, setShowProductFilters] = useState(false);
  const [showReportFilters, setShowReportFilters] = useState(false);
  const [showWithdrawalFilters, setShowWithdrawalFilters] = useState(false);
  const [showOrderFilters, setShowOrderFilters] = useState(false);
  
  // User management state
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showUnbanDialog, setShowUnbanDialog] = useState(false);
  const [userToAction, setUserToAction] = useState<User | null>(null);
  
  // Product management state
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [showDeleteProductDialog, setShowDeleteProductDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  
  // Report management state
  const [reports, setReports] = useState<Report[]>(mockReports);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [showBanReportDialog, setShowBanReportDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  
  // Withdrawal management state
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(mockWithdrawals);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showFailDialog, setShowFailDialog] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [failureReason, setFailureReason] = useState("");
  
  // Finance tab state
  const [financeSubTab, setFinanceSubTab] = useState<"withdrawals" | "revenue">("withdrawals");
  
  // Cancel request management state
  const [cancelRequests, setCancelRequests] = useState<CancelRequest[]>(mockCancelRequests);
  const [showCancelApproveDialog, setShowCancelApproveDialog] = useState(false);
  const [showCancelRejectDialog, setShowCancelRejectDialog] = useState(false);
  const [selectedCancelRequest, setSelectedCancelRequest] = useState<CancelRequest | null>(null);
  const [cancelRejectReason, setCancelRejectReason] = useState("");
  const [cancelApproveNotes, setCancelApproveNotes] = useState("");
  const [cancelRejectReasonInput, setCancelRejectReasonInput] = useState("");
  
  // Category management state
  const [categories, setCategories] = useState<Category[]>([...mockCategories, ...mockServiceCategories]);
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
  
  // User filtering state
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [userStatusFilter, setUserStatusFilter] = useState<"all" | "active" | "banned" | "warned" | "unverified">("all");
  const [userFacultyFilter, setUserFacultyFilter] = useState<string>("all");
  
  // Product filtering state
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [productTypeFilter, setProductTypeFilter] = useState<"all" | "barang" | "jasa">("all");
  const [productConditionFilter, setProductConditionFilter] = useState<"all" | "baru" | "bekas">("all");
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>("all");
  const [productPriceMin, setProductPriceMin] = useState<string>("");
  const [productPriceMax, setProductPriceMax] = useState<string>("");
  const [productSellerFilter, setProductSellerFilter] = useState<string>("");
  
  // Withdrawal filtering state
  const [withdrawalSearchTerm, setWithdrawalSearchTerm] = useState("");
  const [withdrawalStatusFilter, setWithdrawalStatusFilter] = useState<"all" | "pending" | "approved" | "processing" | "completed" | "failed" | "rejected">("all");
  const [withdrawalAccountTypeFilter, setWithdrawalAccountTypeFilter] = useState<"all" | "bank" | "e_wallet">("all");
  const [withdrawalProviderFilter, setWithdrawalProviderFilter] = useState<string>("all");
  
  // Address filtering state
  const [addressSearchTerm, setAddressSearchTerm] = useState("");
  
  // Order management state
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [orderSearchTerm, setOrderSearchTerm] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<"all" | "pending" | "processing" | "ready_pickup" | "in_delivery" | "completed" | "cancelled">("all");
  const [orderTypeFilter, setOrderTypeFilter] = useState<"all" | "barang" | "jasa">("all");
  const [orderCategoryFilter, setOrderCategoryFilter] = useState<string>("all");
  const [orderPaymentFilter, setOrderPaymentFilter] = useState<"all" | "pending" | "paid" | "failed" | "refunded">("all");
  
  // Report filtering state
  const [reportSearchTerm, setReportSearchTerm] = useState("");
  const [reportStatusFilter, setReportStatusFilter] = useState<"all" | "pending" | "reviewed" | "resolved">("all");
  
  // Success/Error messages
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Pagination state
  const ITEMS_PER_PAGE = 10;
  const [userPage, setUserPage] = useState(1);
  const [productPage, setProductPage] = useState(1);
  const [reportPage, setReportPage] = useState(1);
  const [withdrawalPage, setWithdrawalPage] = useState(1);
  const [categoryPage, setCategoryPage] = useState(1);
  const [addressPage, setAddressPage] = useState(1);
  const [orderPage, setOrderPage] = useState(1);
  
  // Pagination helper functions
  const getPaginatedData = <T,>(data: T[], page: number): T[] => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return data.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };
  
  const getTotalPages = (totalItems: number): number => {
    return Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  };
  
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
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };
  
  // Filtered data
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = userSearchTerm === "" || 
        user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        (user.phone?.toLowerCase() || "").includes(userSearchTerm.toLowerCase());
      
      const matchesStatus = userStatusFilter === "all" || 
        (userStatusFilter === "active" && user.isVerified && !user.isBanned && !user.isWarned) ||
        (userStatusFilter === "banned" && user.isBanned) ||
        (userStatusFilter === "warned" && user.isWarned) ||
        (userStatusFilter === "unverified" && !user.isVerified);
      
      const matchesFaculty = userFacultyFilter === "all" || user.faculty === userFacultyFilter;
      
      return matchesSearch && matchesStatus && matchesFaculty;
    });
  }, [users, userSearchTerm, userStatusFilter, userFacultyFilter]);
  
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = productSearchTerm === "" || 
        product.title.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
        product.seller.name.toLowerCase().includes(productSearchTerm.toLowerCase());
      
      const matchesType = productTypeFilter === "all" || product.type === productTypeFilter;
      
      const matchesCondition = productConditionFilter === "all" || 
        (product.type === "barang" && product.condition === productConditionFilter);
      
      const matchesCategory = productCategoryFilter === "all" || 
        product.categoryId === productCategoryFilter ||
        product.category.toLowerCase() === productCategoryFilter.toLowerCase();
      
      const productPrice = product.priceMin || product.price;
      const minPrice = productPriceMin ? parseInt(productPriceMin) : 0;
      const maxPrice = productPriceMax ? parseInt(productPriceMax) : Infinity;
      const matchesPrice = productPrice >= minPrice && productPrice <= maxPrice;
      
      const matchesSeller = productSellerFilter === "" || 
        product.seller.name.toLowerCase().includes(productSellerFilter.toLowerCase());
      
      return matchesSearch && matchesType && matchesCondition && matchesCategory && matchesPrice && matchesSeller;
    });
  }, [products, productSearchTerm, productTypeFilter, productConditionFilter, productCategoryFilter, productPriceMin, productPriceMax, productSellerFilter]);
  
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchesSearch = reportSearchTerm === "" || 
        report.reason.toLowerCase().includes(reportSearchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(reportSearchTerm.toLowerCase()) ||
        report.reporter.name.toLowerCase().includes(reportSearchTerm.toLowerCase()) ||
        report.reportedUser.name.toLowerCase().includes(reportSearchTerm.toLowerCase());
      
      const matchesStatus = reportStatusFilter === "all" || report.status === reportStatusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [reports, reportSearchTerm, reportStatusFilter]);
  
  const filteredWithdrawals = useMemo(() => {
    const commonBanks = ["bca", "mandiri", "bri", "bni", "bsi", "bank bca", "bank mandiri", "bank bri", "bank bni", "bank bsi"];
    const commonEWallets = ["gopay", "ovo", "dana", "shopeepay", "linkaja"];
    
    return withdrawals.filter(withdrawal => {
      const matchesSearch = withdrawalSearchTerm === "" || 
        withdrawal.user.name.toLowerCase().includes(withdrawalSearchTerm.toLowerCase()) ||
        withdrawal.bankName.toLowerCase().includes(withdrawalSearchTerm.toLowerCase()) ||
        withdrawal.accountNumber.includes(withdrawalSearchTerm) ||
        withdrawal.accountName.toLowerCase().includes(withdrawalSearchTerm.toLowerCase());
      
      const matchesStatus = withdrawalStatusFilter === "all" || withdrawal.status === withdrawalStatusFilter;
      
      const matchesAccountType = withdrawalAccountTypeFilter === "all" || withdrawal.accountType === withdrawalAccountTypeFilter;
      
      let matchesProvider = true;
      if (withdrawalProviderFilter === "all") {
        matchesProvider = true;
      } else if (withdrawalProviderFilter === "bank_lainnya") {
        matchesProvider = withdrawal.accountType === "bank" && 
          !commonBanks.some(bank => withdrawal.bankName.toLowerCase().includes(bank));
      } else if (withdrawalProviderFilter === "ewallet_lainnya") {
        matchesProvider = withdrawal.accountType === "e_wallet" && 
          !commonEWallets.some(wallet => withdrawal.bankName.toLowerCase().includes(wallet));
      } else {
        matchesProvider = withdrawal.bankName.toLowerCase().includes(withdrawalProviderFilter.toLowerCase());
      }
      
      return matchesSearch && matchesStatus && matchesAccountType && matchesProvider;
    });
  }, [withdrawals, withdrawalSearchTerm, withdrawalStatusFilter, withdrawalAccountTypeFilter, withdrawalProviderFilter]);
  
  const filteredAddresses = useMemo(() => {
    return mockAddresses.filter(address => {
      const matchesSearch = addressSearchTerm === "" || 
        address.recipient.toLowerCase().includes(addressSearchTerm.toLowerCase()) ||
        address.address.toLowerCase().includes(addressSearchTerm.toLowerCase()) ||
        address.label.toLowerCase().includes(addressSearchTerm.toLowerCase()) ||
        (address.notes && address.notes.toLowerCase().includes(addressSearchTerm.toLowerCase()));
      
      return matchesSearch;
    });
  }, [addressSearchTerm]);
  
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = orderSearchTerm === "" || 
        order.orderNumber.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
        order.productTitle.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
        (order.buyer?.name || "").toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
        (order.seller?.name || "").toLowerCase().includes(orderSearchTerm.toLowerCase());
      
      const matchesStatus = orderStatusFilter === "all" || order.status === orderStatusFilter;
      const matchesType = orderTypeFilter === "all" || order.productType === orderTypeFilter;
      const matchesCategory = orderCategoryFilter === "all" || order.product?.categoryId === orderCategoryFilter;
      const matchesPayment = orderPaymentFilter === "all" || order.paymentStatus === orderPaymentFilter;
      
      return matchesSearch && matchesStatus && matchesType && matchesCategory && matchesPayment;
    });
  }, [orders, orderSearchTerm, orderStatusFilter, orderTypeFilter, orderCategoryFilter, orderPaymentFilter]);
  
  // Paginated data
  const paginatedUsers = useMemo(() => getPaginatedData(filteredUsers, userPage), [filteredUsers, userPage]);
  const paginatedProducts = useMemo(() => getPaginatedData(filteredProducts, productPage), [filteredProducts, productPage]);
  const paginatedReports = useMemo(() => getPaginatedData(filteredReports, reportPage), [filteredReports, reportPage]);
  const paginatedWithdrawals = useMemo(() => getPaginatedData(filteredWithdrawals, withdrawalPage), [filteredWithdrawals, withdrawalPage]);
  const paginatedOrders = useMemo(() => getPaginatedData(filteredOrders, orderPage), [filteredOrders, orderPage]);

  const stats = {
    totalUsers: 2534,
    activeProducts: 5012,
    pendingOrders: 23,
    totalRevenue: 125450000,
    platformRevenue: platformRevenue.total,
    monthlyGrowth: 12.5,
    pendingWithdrawals: 8,
    pendingReports: 2,
    pendingCancelRequests: 3,
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

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

  // User actions
  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowUserDetail(true);
  };

  const handleBanUser = (user: User) => {
    setUserToAction(user);
    setShowBanDialog(true);
  };

  const confirmBanUser = () => {
    if (userToAction) {
      setUsers(users.map(u => 
        u.id === userToAction.id 
          ? { ...u, isBanned: true, banReason: "Melanggar aturan platform KampusMarket." }
          : u
      ));
      showSuccess(`User ${userToAction.name} berhasil diblokir`);
      setShowBanDialog(false);
      setUserToAction(null);
    }
  };

  const handleUnbanUser = (user: User) => {
    setUserToAction(user);
    setShowUnbanDialog(true);
  };

  const confirmUnbanUser = () => {
    if (userToAction) {
      setUsers(users.map(u => 
        u.id === userToAction.id 
          ? { ...u, isBanned: false, banReason: undefined }
          : u
      ));
      showSuccess(`User ${userToAction.name} berhasil di-unblock`);
      setShowUnbanDialog(false);
      setUserToAction(null);
    }
  };

  // Product actions
  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowProductDetail(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteProductDialog(true);
  };

  const confirmDeleteProduct = () => {
    if (productToDelete) {
      setProducts(products.filter(p => p.id !== productToDelete.id));
      showSuccess(`Produk "${productToDelete.title}" berhasil dihapus`);
      setShowDeleteProductDialog(false);
      setProductToDelete(null);
    }
  };

  // Report actions
  const handleSendWarning = (report: Report) => {
    setSelectedReport(report);
    setShowWarningDialog(true);
  };

  const confirmSendWarning = () => {
    if (selectedReport) {
      setReports(reports.map(r => 
        r.id === selectedReport.id 
          ? { ...r, status: "reviewed" as const }
          : r
      ));
      setUsers(users.map(u => 
        u.id === selectedReport.reportedUser.id 
          ? { ...u, isWarned: true, warningReason: selectedReport.reason }
          : u
      ));
      showSuccess(`Warning berhasil dikirim ke ${selectedReport.reportedUser.name}`);
      setShowWarningDialog(false);
      setSelectedReport(null);
    }
  };

  const handleBanFromReport = (report: Report) => {
    setSelectedReport(report);
    setShowBanReportDialog(true);
  };

  const confirmBanFromReport = () => {
    if (selectedReport) {
      setUsers(users.map(u => 
        u.id === selectedReport.reportedUser.id 
          ? { ...u, isBanned: true, banReason: selectedReport.reason }
          : u
      ));
      setReports(reports.map(r => 
        r.id === selectedReport.id 
          ? { ...r, status: "resolved" as const }
          : r
      ));
      showSuccess(`User ${selectedReport.reportedUser.name} berhasil diblokir`);
      setShowBanReportDialog(false);
      setSelectedReport(null);
    }
  };

  // Withdrawal actions
  const handleApproveWithdrawal = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setShowApproveDialog(true);
  };

  const confirmApproveWithdrawal = () => {
    if (selectedWithdrawal) {
      setWithdrawals(withdrawals.map(w => 
        w.id === selectedWithdrawal.id 
          ? { ...w, status: "approved" as const, processedAt: new Date().toLocaleDateString("id-ID") }
          : w
      ));
      showSuccess(`Penarikan ${formatPrice(selectedWithdrawal.amount)} berhasil disetujui`);
      setShowApproveDialog(false);
      setSelectedWithdrawal(null);
    }
  };

  const handleRejectWithdrawal = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setRejectionReason("");
    setShowRejectDialog(true);
  };

  const confirmRejectWithdrawal = () => {
    if (selectedWithdrawal && rejectionReason.trim()) {
      setWithdrawals(withdrawals.map(w => 
        w.id === selectedWithdrawal.id 
          ? { ...w, status: "rejected" as const, rejectionReason: rejectionReason.trim(), processedAt: new Date().toLocaleDateString("id-ID") }
          : w
      ));
      showSuccess(`Penarikan ${formatPrice(selectedWithdrawal.amount)} ditolak`);
      setShowRejectDialog(false);
      setSelectedWithdrawal(null);
      setRejectionReason("");
    }
  };

  // Cancel request actions
  const handleApproveCancelRequest = (cancelReq: CancelRequest) => {
    setSelectedCancelRequest(cancelReq);
    setCancelApproveNotes("");
    setShowCancelApproveDialog(true);
  };

  const confirmApproveCancelRequest = () => {
    if (selectedCancelRequest) {
      // Update cancel request status
      setCancelRequests(cancelRequests.map(cr => 
        cr.id === selectedCancelRequest.id 
          ? { 
              ...cr, 
              status: "approved" as const, 
              adminNotes: cancelApproveNotes || "Permintaan pembatalan disetujui. Refund akan diproses.",
              refundProcessed: true,
              reviewedAt: new Date().toLocaleDateString("id-ID"),
              refundedAt: new Date().toLocaleDateString("id-ID"),
            }
          : cr
      ));
      
      // Add refund to buyer's wallet balance
      setUsers(users.map(u => 
        u.id === selectedCancelRequest.requester.id 
          ? { 
              ...u, 
              walletBalance: (u.walletBalance || 0) + selectedCancelRequest.refundAmount 
            }
          : u
      ));
      
      // Show success message
      showSuccess(`Permintaan pembatalan ${selectedCancelRequest.requestNumber} disetujui. Refund ${formatPrice(selectedCancelRequest.refundAmount)} telah dikembalikan ke dompet pembeli.`);
      setShowCancelApproveDialog(false);
      setSelectedCancelRequest(null);
      setCancelApproveNotes("");
    }
  };

  const handleRejectCancelRequest = (cancelReq: CancelRequest) => {
    setSelectedCancelRequest(cancelReq);
    setCancelRejectReasonInput("");
    setShowCancelRejectDialog(true);
  };

  const confirmRejectCancelRequest = () => {
    if (selectedCancelRequest && cancelRejectReasonInput.trim()) {
      // Update cancel request status
      setCancelRequests(cancelRequests.map(cr => 
        cr.id === selectedCancelRequest.id 
          ? { 
              ...cr, 
              status: "rejected" as const, 
              rejectionReason: cancelRejectReasonInput.trim(),
              reviewedAt: new Date().toLocaleDateString("id-ID"),
            }
          : cr
      ));
      
      showSuccess(`Permintaan pembatalan ${selectedCancelRequest.requestNumber} ditolak`);
      setShowCancelRejectDialog(false);
      setSelectedCancelRequest(null);
      setCancelRejectReasonInput("");
    }
  };

  // Complete withdrawal handler
  const handleCompleteWithdrawal = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setShowCompleteDialog(true);
  };

  const confirmCompleteWithdrawal = () => {
    if (selectedWithdrawal) {
      setWithdrawals(withdrawals.map(w => 
        w.id === selectedWithdrawal.id 
          ? { ...w, status: "completed" as const, processedAt: new Date().toLocaleDateString("id-ID") }
          : w
      ));
      showSuccess(`Penarikan ${formatPrice(selectedWithdrawal.amount)} berhasil diselesaikan`);
      setShowCompleteDialog(false);
      setSelectedWithdrawal(null);
    }
  };

  // Fail withdrawal handler
  const handleFailWithdrawal = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setFailureReason("");
    setShowFailDialog(true);
  };

  const confirmFailWithdrawal = () => {
    if (selectedWithdrawal && failureReason.trim()) {
      setWithdrawals(withdrawals.map(w => 
        w.id === selectedWithdrawal.id 
          ? { ...w, status: "failed" as const, failureReason: failureReason.trim(), processedAt: new Date().toLocaleDateString("id-ID") }
          : w
      ));
      showSuccess(`Penarikan ${formatPrice(selectedWithdrawal.amount)} ditandai gagal`);
      setShowFailDialog(false);
      setSelectedWithdrawal(null);
      setFailureReason("");
    }
  };

  // Mark as processing
  const handleProcessWithdrawal = (withdrawal: Withdrawal) => {
    setWithdrawals(withdrawals.map(w => 
      w.id === withdrawal.id 
        ? { ...w, status: "processing" as const }
        : w
    ));
    showSuccess(`Penarikan ${formatPrice(withdrawal.amount)} sedang diproses`);
  };

  // Category actions
  const filteredCategories = useMemo(() => {
    return categories.filter(cat => {
      const matchesSearch = cat.name.toLowerCase().includes(categorySearchTerm.toLowerCase());
      const matchesType = categoryTypeFilter === "all" || cat.type === categoryTypeFilter;
      return matchesSearch && matchesType;
    }).sort((a, b) => a.sortOrder - b.sortOrder);
  }, [categories, categorySearchTerm, categoryTypeFilter]);

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setCategoryForm({
      name: "",
      type: "barang",
      description: "",
      sortOrder: categories.length + 1,
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

  const handleSaveCategory = () => {
    if (!categoryForm.name.trim()) return;

    const slug = categoryForm.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    if (selectedCategory) {
      setCategories(categories.map(c => 
        c.id === selectedCategory.id 
          ? { 
              ...c, 
              name: categoryForm.name.trim(),
              slug,
              type: categoryForm.type,
              description: categoryForm.description || undefined,
              sortOrder: categoryForm.sortOrder,
              isActive: categoryForm.isActive,
            }
          : c
      ));
      showSuccess(`Kategori "${categoryForm.name}" berhasil diperbarui`);
    } else {
      const newCategory: Category = {
        id: `cat-${Date.now()}`,
        name: categoryForm.name.trim(),
        slug,
        type: categoryForm.type,
        description: categoryForm.description || undefined,
        sortOrder: categoryForm.sortOrder,
        isActive: categoryForm.isActive,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setCategories([...categories, newCategory]);
      showSuccess(`Kategori "${categoryForm.name}" berhasil ditambahkan`);
    }
    setShowCategoryDialog(false);
    setSelectedCategory(null);
  };

  const handleDeleteCategory = (category: Category) => {
    setCategoryToDelete(category);
    setShowDeleteCategoryDialog(true);
  };

  const confirmDeleteCategory = () => {
    if (categoryToDelete) {
      setCategories(categories.filter(c => c.id !== categoryToDelete.id));
      showSuccess(`Kategori "${categoryToDelete.name}" berhasil dihapus`);
      setShowDeleteCategoryDialog(false);
      setCategoryToDelete(null);
    }
  };

  const handleToggleCategoryActive = (category: Category) => {
    setCategories(categories.map(c => 
      c.id === category.id 
        ? { ...c, isActive: !c.isActive }
        : c
    ));
    showSuccess(`Kategori "${category.name}" ${!category.isActive ? "diaktifkan" : "dinonaktifkan"}`);
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
    const badges: Record<string, any> = {
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
    const badges: Record<string, any> = {
      pending: <Badge variant="outline" className="border-amber-500 text-amber-600">Menunggu</Badge>,
      paid: <Badge variant="default" className="bg-primary-500">Dibayar</Badge>,
      failed: <Badge variant="destructive">Gagal</Badge>,
      refunded: <Badge variant="secondary">Dikembalikan</Badge>,
    };
    return badges[status] || <Badge variant="outline">{status}</Badge>;
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 flex-1">
      <div className="container mx-auto px-4 py-8">
        {/* Success Toast */}
        {successMessage && (
          <div className="fixed top-4 right-4 z-50 animate-in fade-in-0 slide-in-from-top-2">
            <Card className="bg-primary-50 dark:bg-primary-900/30 border-primary-200 dark:border-primary-800 shadow-lg">
              <CardContent className="p-4 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary-600" />
                <p className="text-sm font-medium text-primary-700 dark:text-primary-300">{successMessage}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <LayoutDashboard className="h-8 w-8 text-primary-600" />
              Dashboard Admin
            </h1>
            <p className="text-muted-foreground">Moderasi & Mediator Keuangan KampusMarket</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              Terakhir update: Hari ini, 14:30
            </Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 flex-wrap">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User</TabsTrigger>
            <TabsTrigger value="products">Produk</TabsTrigger>
            <TabsTrigger value="categories">Kategori</TabsTrigger>
            <TabsTrigger value="reports">Laporan</TabsTrigger>
            <TabsTrigger value="cancel-requests">
              Pembatalan
              {stats.pendingCancelRequests > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 px-1.5">
                  {stats.pendingCancelRequests}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="orders">Transaksi</TabsTrigger>
            <TabsTrigger value="finance">Keuangan</TabsTrigger>
            <TabsTrigger value="addresses">Alamat</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  title: "Total User",
                  value: stats.totalUsers.toLocaleString(),
                  icon: Users,
                  color: "text-blue-600",
                  bg: "bg-blue-100 dark:bg-blue-900/30",
                  trend: "+12%",
                  trendUp: true,
                },
                {
                  title: "Produk Aktif",
                  value: stats.activeProducts.toLocaleString(),
                  icon: Package,
                  color: "text-purple-600",
                  bg: "bg-purple-100 dark:bg-purple-900/30",
                  trend: "+8%",
                  trendUp: true,
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
                  trend: "+15%",
                  trendUp: true,
                },
              ].map((stat, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">{stat.title}</span>
                      <div className={`p-2 rounded-lg ${stat.bg}`}>
                        <stat.icon className={`h-4 w-4 ${stat.color}`} />
                      </div>
                    </div>
                    <div className="flex items-end justify-between">
                      <p className="text-2xl font-bold">{stat.value}</p>
                      {stat.trend && (
                        <span
                          className={`text-sm flex items-center ${
                            stat.trendUp ? "text-primary-600" : "text-red-600"
                          }`}
                        >
                          {stat.trendUp ? (
                            <ArrowUpRight className="h-4 w-4" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4" />
                          )}
                          {stat.trend}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Tren Transaksi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="h-16 w-16 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Grafik Tren Transaksi</p>
                      <p className="text-xs text-muted-foreground">Line Chart - 30 hari terakhir</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Distribusi Kategori
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="text-center">
                      <PieChart className="h-16 w-16 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Pie Chart Kategori</p>
                      <p className="text-xs text-muted-foreground">Elektronik, Buku, Fashion, dll</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid sm:grid-cols-3 gap-4">
              <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-800 flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-bold text-2xl">{stats.pendingReports}</p>
                    <p className="text-sm text-muted-foreground">Laporan Pending</p>
                  </div>
                  <Button size="sm" className="ml-auto" onClick={() => setActiveTab("reports")}>
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
                  <Button size="sm" className="ml-auto" onClick={() => setActiveTab("finance")}>
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
                    <p className="font-bold text-2xl">{orders.filter(o => o.status === "pending").length}</p>
                    <p className="text-sm text-muted-foreground">Order Pending</p>
                  </div>
                  <Button size="sm" className="ml-auto" onClick={() => setActiveTab("orders")}>
                    Lihat
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Aktivitas Terbaru</CardTitle>
              </CardHeader>
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
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.name}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle>Manajemen User</CardTitle>
                      <CardDescription>Daftar semua user terdaftar (Read & Ban)</CardDescription>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {filteredUsers.length} user
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative flex-1 min-w-[200px] max-w-md">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Cari nama, email, telepon..."
                        value={userSearchTerm}
                        onChange={(e) => { setUserSearchTerm(e.target.value); setUserPage(1); }}
                        className="pl-9"
                      />
                    </div>
                    <Select value={userStatusFilter} onValueChange={(value) => { setUserStatusFilter(value as typeof userStatusFilter); setUserPage(1); }}>
                      <SelectTrigger className="w-[130px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Status</SelectItem>
                        <SelectItem value="active">Aktif</SelectItem>
                        <SelectItem value="banned">Diblokir</SelectItem>
                        <SelectItem value="warned">Warning</SelectItem>
                        <SelectItem value="unverified">Belum Verif</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowUserFilters(!showUserFilters)}
                      className="gap-1"
                    >
                      <Filter className="h-4 w-4" />
                      Filter
                      {showUserFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                    {(userStatusFilter !== "all" || userFacultyFilter !== "all") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { 
                          setUserSearchTerm(""); 
                          setUserStatusFilter("all"); 
                          setUserFacultyFilter("all"); 
                          setUserPage(1); 
                        }}
                        className="text-xs text-muted-foreground"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Reset
                      </Button>
                    )}
                  </div>
                  {showUserFilters && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                      <Select value={userFacultyFilter} onValueChange={(value) => { setUserFacultyFilter(value); setUserPage(1); }}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Fakultas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua Fakultas</SelectItem>
                          <SelectItem value="ft">Fakultas Teknik</SelectItem>
                          <SelectItem value="feb">Fakultas Ekonomi & Bisnis</SelectItem>
                          <SelectItem value="fkip">Fakultas Keguruan & Ilmu Pendidikan</SelectItem>
                          <SelectItem value="fmipa">Fakultas MIPA</SelectItem>
                          <SelectItem value="fh">Fakultas Hukum</SelectItem>
                          <SelectItem value="fkb">Fakultas Kedokteran</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>Tidak ada user ditemukan dengan filter tersebut</p>
                  </div>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Fakultas</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Bergabung</TableHead>
                          <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className={`text-xs ${user.isBanned ? "bg-red-100 text-red-700" : "bg-primary-100 text-primary-700"}`}>
                                    {getInitials(user.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-sm">{user.name}</p>
                                  <p className="text-xs text-muted-foreground">{user.phone || "-"}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">{user.email}</TableCell>
                            <TableCell className="text-sm">{getFacultyName(user.faculty)}</TableCell>
                            <TableCell>
                              {user.isBanned ? (
                                <Badge variant="destructive">Diblokir</Badge>
                              ) : user.isWarned ? (
                                <Badge variant="outline" className="border-amber-500 text-amber-600">Warning</Badge>
                              ) : user.isVerified ? (
                                <Badge variant="default" className="bg-primary-500">Aktif</Badge>
                              ) : (
                                <Badge variant="secondary">Belum Verif</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-sm">{user.joinedAt}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewUser(user)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {user.isBanned ? (
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-600" onClick={() => handleUnbanUser(user)}>
                                    <UserCheck className="h-4 w-4" />
                                  </Button>
                                ) : (
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleBanUser(user)}>
                                    <Ban className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {renderPagination(userPage, getTotalPages(filteredUsers.length), setUserPage)}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle>Manajemen Produk</CardTitle>
                      <CardDescription>Daftar semua produk dan jasa di platform</CardDescription>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {filteredProducts.length} produk
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative flex-1 min-w-[200px] max-w-md">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Cari produk, deskripsi, penjual..."
                        value={productSearchTerm}
                        onChange={(e) => { setProductSearchTerm(e.target.value); setProductPage(1); }}
                        className="pl-9"
                      />
                    </div>
                    <Select value={productTypeFilter} onValueChange={(value) => { setProductTypeFilter(value as typeof productTypeFilter); setProductPage(1); }}>
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="Tipe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua</SelectItem>
                        <SelectItem value="barang">Barang</SelectItem>
                        <SelectItem value="jasa">Jasa</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowProductFilters(!showProductFilters)}
                      className="gap-1"
                    >
                      <Filter className="h-4 w-4" />
                      Filter
                      {showProductFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                    {(productTypeFilter !== "all" || productConditionFilter !== "all" || productCategoryFilter !== "all") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { 
                          setProductSearchTerm(""); 
                          setProductTypeFilter("all"); 
                          setProductConditionFilter("all");
                          setProductCategoryFilter("all");
                          setProductPriceMin("");
                          setProductPriceMax("");
                          setProductSellerFilter("");
                          setProductPage(1); 
                        }}
                        className="text-xs text-muted-foreground"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Reset
                      </Button>
                    )}
                  </div>
                  {showProductFilters && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                      {(productTypeFilter === "all" || productTypeFilter === "barang") && (
                        <Select value={productConditionFilter} onValueChange={(value) => { setProductConditionFilter(value as typeof productConditionFilter); setProductPage(1); }}>
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Kondisi" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Semua Kondisi</SelectItem>
                            <SelectItem value="baru">Baru</SelectItem>
                            <SelectItem value="bekas">Bekas</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      <Select value={productCategoryFilter} onValueChange={(value) => { setProductCategoryFilter(value); setProductPage(1); }}>
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="Kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua Kategori</SelectItem>
                          {productTypeFilter === "barang" && mockCategories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                          ))}
                          {productTypeFilter === "jasa" && mockServiceCategories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                          ))}
                          {productTypeFilter === "all" && [...mockCategories, ...mockServiceCategories].map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>Tidak ada produk ditemukan dengan filter tersebut</p>
                  </div>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produk</TableHead>
                          <TableHead>Tipe</TableHead>
                          <TableHead>Harga</TableHead>
                          <TableHead>Penjual</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedProducts.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center">
                                  {product.type === "jasa" ? (
                                    <CalendarDays className="h-5 w-5 text-muted-foreground" />
                                  ) : (
                                    <Package className="h-5 w-5 text-muted-foreground" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-sm line-clamp-1">{product.title}</p>
                                  <p className="text-xs text-muted-foreground">{product.category}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={product.type === "jasa" ? "secondary" : "outline"} className={product.type === "jasa" ? "bg-purple-50 text-purple-700 border-purple-200" : ""}>
                                {product.type === "jasa" ? "Jasa" : "Barang"}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium text-primary-600">
                              {formatProductPrice(product)}
                            </TableCell>
                            <TableCell className="text-sm">{product.seller.name}</TableCell>
                            <TableCell>
                              <Badge variant={product.status === "active" ? "default" : "secondary"} className={product.status === "active" ? "bg-primary-500" : ""}>
                                {product.status === "active" ? "Aktif" : "Nonaktif"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewProduct(product)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDeleteProduct(product)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {renderPagination(productPage, getTotalPages(filteredProducts.length), setProductPage)}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle>Manajemen Kategori</CardTitle>
                      <CardDescription>Kelola kategori untuk barang dan jasa</CardDescription>
                    </div>
                    <Button onClick={handleAddCategory} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Tambah Kategori
                    </Button>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative flex-1 min-w-[200px] max-w-md">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Cari kategori..."
                        value={categorySearchTerm}
                        onChange={(e) => setCategorySearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <Select value={categoryTypeFilter} onValueChange={(value) => setCategoryTypeFilter(value as typeof categoryTypeFilter)}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Tipe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua</SelectItem>
                        <SelectItem value="barang">Barang</SelectItem>
                        <SelectItem value="jasa">Jasa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Kategori</TableHead>
                      <TableHead>Tipe</TableHead>
                      <TableHead>Deskripsi</TableHead>
                      <TableHead>Urutan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCategories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>
                          <Badge variant={category.type === "jasa" ? "secondary" : "outline"} className={category.type === "jasa" ? "bg-purple-50 text-purple-700 border-purple-200" : ""}>
                            {category.type === "jasa" ? "Jasa" : "Barang"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                          {category.description || "-"}
                        </TableCell>
                        <TableCell className="text-sm">{category.sortOrder}</TableCell>
                        <TableCell>
                          <Badge variant={category.isActive ? "default" : "secondary"} className={category.isActive ? "bg-primary-500" : ""}>
                            {category.isActive ? "Aktif" : "Nonaktif"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditCategory(category)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDeleteCategory(category)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle>Report Center</CardTitle>
                      <CardDescription>Laporan dari user tentang pelanggaran</CardDescription>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {filteredReports.length} laporan
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative flex-1 min-w-[200px] max-w-md">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Cari alasan, pelapor, atau user dilaporkan..."
                        value={reportSearchTerm}
                        onChange={(e) => { setReportSearchTerm(e.target.value); setReportPage(1); }}
                        className="pl-9"
                      />
                    </div>
                    <Select value={reportStatusFilter} onValueChange={(value) => { setReportStatusFilter(value as typeof reportStatusFilter); setReportPage(1); }}>
                      <SelectTrigger className="w-[130px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Status</SelectItem>
                        <SelectItem value="pending">Menunggu</SelectItem>
                        <SelectItem value="reviewed">Ditinjau</SelectItem>
                        <SelectItem value="resolved">Selesai</SelectItem>
                      </SelectContent>
                    </Select>
                    {reportStatusFilter !== "all" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setReportSearchTerm(""); setReportStatusFilter("all"); setReportPage(1); }}
                        className="text-xs text-muted-foreground"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Reset
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredReports.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>Tidak ada laporan ditemukan dengan filter tersebut</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {paginatedReports.map((report) => (
                        <div
                          key={report.id}
                          className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                              </div>
                              <div>
                                <p className="font-medium">{report.reason}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {report.description}
                                </p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                  <span>Pelapor: {report.reporter.name}</span>
                                  <span>•</span>
                                  <span>Dilaporkan: {report.reportedUser.name}</span>
                                  <span>•</span>
                                  <span>{report.createdAt}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                              {getReportStatusBadge(report.status)}
                              {report.status === "pending" && (
                                <div className="flex gap-1 mt-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleSendWarning(report)}
                                  >
                                    <MessageCircle className="h-3 w-3 mr-1" />
                                    Warning
                                  </Button>
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => handleBanFromReport(report)}
                                  >
                                    <Ban className="h-3 w-3 mr-1" />
                                    Ban
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {renderPagination(reportPage, getTotalPages(filteredReports.length), setReportPage)}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cancel Requests Tab */}
          <TabsContent value="cancel-requests">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle>Permintaan Pembatalan</CardTitle>
                      <CardDescription>Permintaan pembatalan pesanan yang sudah dikonfirmasi</CardDescription>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {mockCancelRequests.length} permintaan
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Status</SelectItem>
                        <SelectItem value="pending">Menunggu</SelectItem>
                        <SelectItem value="approved">Disetujui</SelectItem>
                        <SelectItem value="rejected">Ditolak</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {mockCancelRequests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <XCircle className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>Tidak ada permintaan pembatalan</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {mockCancelRequests.map((cancelReq) => (
                      <div
                        key={cancelReq.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                              <XCircle className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{cancelReq.requestNumber}</p>
                                {cancelReq.status === "pending" && (
                                  <Badge variant="outline" className="text-amber-600 border-amber-300">
                                    Menunggu
                                  </Badge>
                                )}
                                {cancelReq.status === "approved" && (
                                  <Badge variant="outline" className="text-primary-600 border-primary-300">
                                    Disetujui
                                  </Badge>
                                )}
                                {cancelReq.status === "rejected" && (
                                  <Badge variant="outline" className="text-red-600 border-red-300">
                                    Ditolak
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {cancelReq.description}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span>Pemohon: {cancelReq.requester.name}</span>
                                <span>•</span>
                                <span>Order: {cancelReq.orderId}</span>
                                <span>•</span>
                                <span>{cancelReq.createdAt}</span>
                              </div>
                              {cancelReq.adminNotes && (
                                <div className="mt-2 p-2 bg-slate-50 dark:bg-slate-800 rounded text-xs">
                                  <span className="text-muted-foreground">Catatan Admin:</span>{" "}
                                  {cancelReq.adminNotes}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                            <p className="text-sm font-medium">
                              Refund: {formatPrice(cancelReq.refundAmount)}
                            </p>
                            {cancelReq.status === "pending" && (
                              <div className="flex gap-1 mt-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-red-600 border-red-300 hover:bg-red-50"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRejectCancelRequest(cancelReq);
                                  }}
                                >
                                  <X className="h-3 w-3 mr-1" />
                                  Tolak
                                </Button>
                                <Button 
                                  variant="default" 
                                  size="sm"
                                  className="bg-primary-600 hover:bg-primary-700"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleApproveCancelRequest(cancelReq);
                                  }}
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Setujui
                                </Button>
                              </div>
                            )}
                            {cancelReq.status === "approved" && cancelReq.refundProcessed && (
                              <span className="text-xs text-primary-600">Refund diproses</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders/Transactions Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle>Manajemen Transaksi</CardTitle>
                      <CardDescription>Daftar semua transaksi dan pesanan</CardDescription>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {filteredOrders.length} transaksi
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative flex-1 min-w-[200px] max-w-md">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Cari nomor order, produk, pembeli..."
                        value={orderSearchTerm}
                        onChange={(e) => { setOrderSearchTerm(e.target.value); setOrderPage(1); }}
                        className="pl-9"
                      />
                    </div>
                    <Select value={orderTypeFilter} onValueChange={(value) => { setOrderTypeFilter(value as typeof orderTypeFilter); setOrderCategoryFilter("all"); setOrderStatusFilter("all"); setOrderPage(1); }}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Tipe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Tipe</SelectItem>
                        <SelectItem value="barang">Barang</SelectItem>
                        <SelectItem value="jasa">Jasa</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowOrderFilters(!showOrderFilters)}
                      className="gap-1"
                    >
                      <Filter className="h-4 w-4" />
                      Filter
                      {showOrderFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                    {(orderStatusFilter !== "all" || orderTypeFilter !== "all" || orderCategoryFilter !== "all" || orderPaymentFilter !== "all" || orderSearchTerm) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { 
                          setOrderSearchTerm(""); 
                          setOrderStatusFilter("all"); 
                          setOrderTypeFilter("all"); 
                          setOrderCategoryFilter("all");
                          setOrderPaymentFilter("all"); 
                          setOrderPage(1); 
                        }}
                        className="text-xs text-muted-foreground"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Reset
                      </Button>
                    )}
                  </div>
                  {showOrderFilters && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                      <Select value={orderStatusFilter} onValueChange={(value) => { setOrderStatusFilter(value as typeof orderStatusFilter); setOrderPage(1); }}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua Status</SelectItem>
                          <SelectItem value="pending">Menunggu</SelectItem>
                          <SelectItem value="processing">Diproses</SelectItem>
                          {(orderTypeFilter === "all" || orderTypeFilter === "barang") && (
                            <SelectItem value="ready_pickup">Siap Ambil</SelectItem>
                          )}
                          {(orderTypeFilter === "all" || orderTypeFilter === "barang") && (
                            <SelectItem value="in_delivery">Dalam Pengiriman</SelectItem>
                          )}
                          <SelectItem value="completed">Selesai</SelectItem>
                          <SelectItem value="cancelled">Dibatalkan</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={orderPaymentFilter} onValueChange={(value) => { setOrderPaymentFilter(value as typeof orderPaymentFilter); setOrderPage(1); }}>
                        <SelectTrigger className="w-[130px]">
                          <SelectValue placeholder="Pembayaran" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua</SelectItem>
                          <SelectItem value="pending">Menunggu</SelectItem>
                          <SelectItem value="paid">Dibayar</SelectItem>
                          <SelectItem value="failed">Gagal</SelectItem>
                          <SelectItem value="refunded">Dikembalikan</SelectItem>
                        </SelectContent>
                      </Select>
                      {(orderTypeFilter === "barang" || orderTypeFilter === "jasa") && (
                        <Select value={orderCategoryFilter} onValueChange={(value) => { setOrderCategoryFilter(value); setOrderPage(1); }}>
                          <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Kategori" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Semua Kategori</SelectItem>
                            {orderTypeFilter === "barang" && mockCategories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                            {orderTypeFilter === "jasa" && mockServiceCategories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>Tidak ada transaksi ditemukan</p>
                  </div>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order</TableHead>
                          <TableHead>Produk</TableHead>
                          <TableHead>Kategori</TableHead>
                          <TableHead>Pembeli</TableHead>
                          <TableHead>Penjual</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Pembayaran</TableHead>
                          <TableHead>Tanggal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium text-sm">{order.orderNumber}</p>
                                <p className="text-xs text-muted-foreground">{order.quantity} item</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center">
                                  {order.productType === "jasa" ? (
                                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-sm max-w-[150px] truncate">{order.productTitle}</p>
                                  <Badge variant={order.productType === "jasa" ? "secondary" : "outline"} className="text-xs">
                                    {order.productType === "jasa" ? "Jasa" : "Barang"}
                                  </Badge>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                {order.product?.category || "-"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-7 w-7">
                                  <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                                    {getInitials(order.buyer?.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm">{order.buyer?.name || "-"}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-7 w-7">
                                  <AvatarFallback className="bg-primary-100 text-primary-700 text-xs">
                                    {getInitials(order.seller?.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm">{order.seller?.name || "-"}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <p className="font-bold text-primary-600">{formatPrice(order.totalPrice)}</p>
                              {order.shippingFee > 0 && (
                                <p className="text-xs text-muted-foreground">+ {formatPrice(order.shippingFee)} ongkir</p>
                              )}
                            </TableCell>
                            <TableCell>{getOrderStatusBadge(order.status)}</TableCell>
                            <TableCell>{getPaymentStatusBadge(order.paymentStatus)}</TableCell>
                            <TableCell className="text-sm">{order.createdAt ? new Date(order.createdAt).toLocaleDateString("id-ID") : "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {renderPagination(orderPage, getTotalPages(filteredOrders.length), setOrderPage)}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Finance Tab */}
          <TabsContent value="finance" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Total Escrow</span>
                    <Wallet className="h-4 w-4 text-primary-600" />
                  </div>
                  <p className="text-2xl font-bold">{formatPrice(2500000)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Dana ditahan dalam sistem</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Pending Withdrawal</span>
                    <Clock className="h-4 w-4 text-amber-600" />
                  </div>
                  <p className="text-2xl font-bold">{formatPrice(withdrawals.filter(w => w.status === "pending").reduce((sum, w) => sum + w.amount, 0))}</p>
                  <p className="text-xs text-muted-foreground mt-1">{withdrawals.filter(w => w.status === "pending").length} permintaan</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Total Transaksi</span>
                    <DollarSign className="h-4 w-4 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Nilai transaksi platform</p>
                </CardContent>
              </Card>
              <Card className="border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Pendapatan Platform (5%)</span>
                    <BarChart3 className="h-4 w-4 text-primary-600" />
                  </div>
                  <p className="text-2xl font-bold text-primary-600">{formatPrice(stats.platformRevenue)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Dari potongan penjualan seller</p>
                </CardContent>
              </Card>
            </div>

            {/* Sub Tabs Switcher */}
            <div className="flex gap-2 border-b pb-2">
              <Button 
                variant={financeSubTab === "withdrawals" ? "default" : "ghost"} 
                size="sm"
                onClick={() => setFinanceSubTab("withdrawals")}
                className="gap-2"
              >
                <Wallet className="h-4 w-4" />
                Penarikan Dana
              </Button>
              <Button 
                variant={financeSubTab === "revenue" ? "default" : "ghost"} 
                size="sm"
                onClick={() => setFinanceSubTab("revenue")}
                className="gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Pendapatan Platform
              </Button>
            </div>

            {/* Withdrawal Requests Tab */}
            {financeSubTab === "withdrawals" && (
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <CardTitle>Permintaan Penarikan Dana</CardTitle>
                        <CardDescription>
                          Proses penarikan dana user ke rekening bank dan e-wallet
                        </CardDescription>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {filteredWithdrawals.length} penarikan
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="relative flex-1 min-w-[200px] max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="search"
                          placeholder="Cari user, provider, no rekening..."
                          value={withdrawalSearchTerm}
                          onChange={(e) => { setWithdrawalSearchTerm(e.target.value); setWithdrawalPage(1); }}
                          className="pl-9"
                        />
                      </div>
                      <Select value={withdrawalStatusFilter} onValueChange={(value) => { setWithdrawalStatusFilter(value as typeof withdrawalStatusFilter); setWithdrawalPage(1); }}>
                        <SelectTrigger className="w-[130px]">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua Status</SelectItem>
                          <SelectItem value="pending">Menunggu</SelectItem>
                          <SelectItem value="approved">Disetujui</SelectItem>
                          <SelectItem value="processing">Diproses</SelectItem>
                          <SelectItem value="completed">Selesai</SelectItem>
                          <SelectItem value="failed">Gagal</SelectItem>
                          <SelectItem value="rejected">Ditolak</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowWithdrawalFilters(!showWithdrawalFilters)}
                        className="gap-1"
                      >
                        <Filter className="h-4 w-4" />
                        Filter
                        {showWithdrawalFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                      {(withdrawalStatusFilter !== "all" || withdrawalAccountTypeFilter !== "all" || withdrawalProviderFilter !== "all" || withdrawalSearchTerm) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { 
                            setWithdrawalSearchTerm(""); 
                            setWithdrawalStatusFilter("all"); 
                            setWithdrawalAccountTypeFilter("all"); 
                            setWithdrawalProviderFilter("all"); 
                            setWithdrawalPage(1); 
                          }}
                          className="text-xs text-muted-foreground"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Reset
                        </Button>
                      )}
                    </div>
                    {showWithdrawalFilters && (
                      <div className="flex flex-wrap gap-2 pt-2 border-t">
                        <Select value={withdrawalAccountTypeFilter} onValueChange={(value) => { setWithdrawalAccountTypeFilter(value as typeof withdrawalAccountTypeFilter); setWithdrawalProviderFilter("all"); setWithdrawalPage(1); }}>
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Tipe Akun" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Semua Tipe</SelectItem>
                            <SelectItem value="bank">Bank</SelectItem>
                            <SelectItem value="e_wallet">E-Wallet</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={withdrawalProviderFilter} onValueChange={(value) => { setWithdrawalProviderFilter(value); setWithdrawalPage(1); }}>
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Provider" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Semua Provider</SelectItem>
                            {(withdrawalAccountTypeFilter === "all" || withdrawalAccountTypeFilter === "bank") && (
                              <>
                                <SelectItem value="bca">Bank BCA</SelectItem>
                                <SelectItem value="mandiri">Bank Mandiri</SelectItem>
                                <SelectItem value="bri">Bank BRI</SelectItem>
                                <SelectItem value="bni">Bank BNI</SelectItem>
                                <SelectItem value="bsi">Bank BSI</SelectItem>
                              </>
                            )}
                            {(withdrawalAccountTypeFilter === "all" || withdrawalAccountTypeFilter === "e_wallet") && (
                              <>
                                <SelectItem value="gopay">GoPay</SelectItem>
                                <SelectItem value="ovo">OVO</SelectItem>
                                <SelectItem value="dana">DANA</SelectItem>
                                <SelectItem value="shopeepay">ShopeePay</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {paginatedWithdrawals.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Wallet className="h-12 w-12 mx-auto mb-4 opacity-30" />
                      <p>Tidak ada penarikan ditemukan dengan filter tersebut</p>
                    </div>
                  ) : (
                    <>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Jumlah</TableHead>
                            <TableHead>Tipe</TableHead>
                            <TableHead>Provider</TableHead>
                            <TableHead>No. Akun</TableHead>
                            <TableHead>Tanggal</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedWithdrawals.map((withdrawal) => (
                            <TableRow key={withdrawal.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-primary-100 text-primary-700 text-xs">
                                      {getInitials(withdrawal.user?.name)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium text-sm">{withdrawal.user?.name || "-"}</span>
                                </div>
                              </TableCell>
                              <TableCell className="font-bold text-primary-600">
                                {formatPrice(withdrawal.amount)}
                              </TableCell>
                              <TableCell>
                                <Badge variant={withdrawal.accountType === "e_wallet" ? "secondary" : "outline"} className={withdrawal.accountType === "e_wallet" ? "bg-purple-50 text-purple-700 border-purple-200" : ""}>
                                  {withdrawal.accountType === "e_wallet" ? "E-Wallet" : "Bank"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm font-medium">{withdrawal.bankName}</TableCell>
                              <TableCell className="text-sm">
                                <div>
                                  <p className="font-mono">{withdrawal.accountNumber}</p>
                                  <p className="text-xs text-muted-foreground">a.n {withdrawal.accountName}</p>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm">{withdrawal.createdAt ? new Date(withdrawal.createdAt).toLocaleDateString("id-ID") : "-"}</TableCell>
                              <TableCell>{getWithdrawalStatusBadge(withdrawal.status)}</TableCell>
                              <TableCell className="text-right">
                                {withdrawal.status === "pending" && (
                                  <div className="flex items-center justify-end gap-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="text-red-500"
                                      onClick={() => handleRejectWithdrawal(withdrawal)}
                                    >
                                      <XCircle className="h-3 w-3 mr-1" />
                                      Tolak
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      className="bg-primary-600 hover:bg-primary-700"
                                      onClick={() => handleApproveWithdrawal(withdrawal)}
                                    >
                                      <CheckCircle2 className="h-3 w-3 mr-1" />
                                      Approve
                                    </Button>
                                  </div>
                                )}
                                {withdrawal.status === "approved" && (
                                  <div className="flex items-center justify-end gap-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleProcessWithdrawal(withdrawal)}
                                    >
                                      <Clock className="h-3 w-3 mr-1" />
                                      Proses
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      className="bg-primary-600 hover:bg-primary-700"
                                      onClick={() => handleCompleteWithdrawal(withdrawal)}
                                    >
                                      <CheckCircle2 className="h-3 w-3 mr-1" />
                                      Selesai
                                    </Button>
                                    <Button 
                                      variant="destructive" 
                                      size="sm"
                                      onClick={() => handleFailWithdrawal(withdrawal)}
                                    >
                                      <XCircle className="h-3 w-3 mr-1" />
                                      Gagal
                                    </Button>
                                  </div>
                                )}
                                {withdrawal.status === "processing" && (
                                  <div className="flex items-center justify-end gap-2">
                                    <Button 
                                      size="sm" 
                                      className="bg-primary-600 hover:bg-primary-700"
                                      onClick={() => handleCompleteWithdrawal(withdrawal)}
                                    >
                                      <CheckCircle2 className="h-3 w-3 mr-1" />
                                      Selesai
                                    </Button>
                                    <Button 
                                      variant="destructive" 
                                      size="sm"
                                      onClick={() => handleFailWithdrawal(withdrawal)}
                                    >
                                      <XCircle className="h-3 w-3 mr-1" />
                                      Gagal
                                    </Button>
                                  </div>
                                )}
                                {withdrawal.status === "completed" && withdrawal.processedAt && (
                                  <span className="text-xs text-primary-600">
                                    Selesai: {new Date(withdrawal.processedAt).toLocaleDateString("id-ID")}
                                  </span>
                                )}
                                {withdrawal.status === "failed" && withdrawal.failureReason && (
                                  <div className="text-xs max-w-[200px]">
                                    <p className="text-red-500 font-medium">Gagal</p>
                                    <p className="text-muted-foreground mt-1 line-clamp-2">{withdrawal.failureReason}</p>
                                  </div>
                                )}
                                {withdrawal.status === "rejected" && withdrawal.rejectionReason && (
                                  <div className="text-xs max-w-[200px]">
                                    <p className="text-red-500 font-medium">Ditolak</p>
                                    <p className="text-muted-foreground mt-1 line-clamp-2">{withdrawal.rejectionReason}</p>
                                  </div>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {renderPagination(withdrawalPage, getTotalPages(filteredWithdrawals.length), setWithdrawalPage)}
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Platform Revenue Tab */}
            {financeSubTab === "revenue" && (
              <Card className="border-primary-200 dark:border-primary-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary-600" />
                    Pendapatan Platform
                  </CardTitle>
                  <CardDescription>
                    Potongan 5% dari setiap transaksi penjualan seller
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">Bulan Ini</p>
                      <p className="text-xl font-bold text-primary-600">{formatPrice(platformRevenue.thisMonth)}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">Bulan Lalu</p>
                      <p className="text-xl font-bold">{formatPrice(platformRevenue.lastMonth)}</p>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">Pending Clearance</p>
                      <p className="text-xl font-bold text-amber-600">{formatPrice(platformRevenue.pendingClearance)}</p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium mb-2">Transaksi Terbaru dengan Potongan:</p>
                    <div className="space-y-2">
                      {platformRevenue.transactions.map((tx, idx) => (
                        <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                          <div>
                            <p className="font-medium">{tx.productTitle}</p>
                            <p className="text-xs text-muted-foreground">{tx.orderNumber} • {tx.createdAt}</p>
                          </div>
                          <p className="font-bold text-primary-600">+{formatPrice(tx.adminFee)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Addresses Tab */}
          <TabsContent value="addresses" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Daftar Alamat User
                      </CardTitle>
                      <CardDescription>
                        Lihat dan kelola semua alamat pengiriman user
                      </CardDescription>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total {filteredAddresses.length} alamat
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Cari alamat, penerima, label, catatan..."
                        value={addressSearchTerm}
                        onChange={(e) => setAddressSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    {addressSearchTerm && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setAddressSearchTerm("")}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Reset
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredAddresses.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <MapPin className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg">Tidak ada alamat ditemukan</p>
                    <p className="text-sm">Coba ubah filter pencarian</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Array.from(new Set(filteredAddresses.map(a => a.userId))).map(userId => {
                      const user = mockUsers.find(u => u.id === userId);
                      if (!user) return null;
                      const userAddresses = filteredAddresses.filter(addr => addr.userId === userId);
                      
                      return (
                        <div key={userId} className="border rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-4">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className={`text-sm ${user.isBanned ? "bg-red-100 text-red-700" : "bg-primary-100 text-primary-700"}`}>
                                {getInitials(user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                            <Badge variant="outline" className="ml-auto">
                              {userAddresses.length} alamat
                            </Badge>
                          </div>
                          
                          <div className="grid sm:grid-cols-2 gap-3">
                            {userAddresses.map((address) => {
                              const AddressIcon = address.label.toLowerCase() === "kos" ? Home :
                                                 address.label.toLowerCase() === "rumah" ? Building :
                                                 address.label.toLowerCase() === "kantor" ? Building : MapPinned;
                              return (
                                <div
                                  key={address.id}
                                  className={`border rounded-lg p-3 ${address.isPrimary ? "border-primary-500 bg-primary-50 dark:bg-primary-900/10" : "bg-slate-50 dark:bg-slate-800"}`}
                                >
                                  <div className="flex items-start gap-2">
                                    <div className={`p-1.5 rounded ${address.isPrimary ? "bg-primary-100 dark:bg-primary-800" : "bg-slate-200 dark:bg-slate-700"}`}>
                                      <AddressIcon className={`h-4 w-4 ${address.isPrimary ? "text-primary-600" : "text-slate-500"}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm">{address.label}</span>
                                        {address.isPrimary && (
                                          <Badge variant="outline" className="text-xs border-primary-500 text-primary-600">
                                            Utama
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="text-sm mt-1">{address.recipient}</p>
                                      {address.phone && (
                                        <p className="text-xs text-muted-foreground">{address.phone}</p>
                                      )}
                                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                        {address.address}
                                      </p>
                                      {address.notes && (
                                        <p className="text-xs text-muted-foreground mt-1 italic">
                                          📍 {address.notes}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      {/* User Detail Modal */}
      <Dialog open={showUserDetail} onOpenChange={setShowUserDetail}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Detail User
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className={`text-lg ${selectedUser.isBanned ? "bg-red-100 text-red-700" : "bg-primary-100 text-primary-700"}`}>
                    {getInitials(selectedUser.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-lg">{selectedUser.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {selectedUser.isBanned ? (
                      <Badge variant="destructive">Diblokir</Badge>
                    ) : selectedUser.isVerified ? (
                      <Badge variant="default">Aktif</Badge>
                    ) : (
                      <Badge variant="secondary">Belum Verifikasi</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedUser.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedUser.phone || "-"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span>{getFacultyName(selectedUser.faculty)}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Bergabung: {selectedUser.joinedAt}</span>
                </div>
              </div>

              {selectedUser.isBanned && selectedUser.banReason && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                    Alasan Pemblokiran:
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {selectedUser.banReason}
                  </p>
                </div>
              )}
              {selectedUser.isWarned && selectedUser.warningReason && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                    Peringatan:
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    {selectedUser.warningReason}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserDetail(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban User Confirmation Modal */}
      <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Ban className="h-5 w-5" />
              Blokir User
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin memblokir user ini? User tidak akan bisa login atau melakukan transaksi.
            </DialogDescription>
          </DialogHeader>
          {userToAction && (
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
              <p className="font-medium">{userToAction.name}</p>
              <p className="text-sm text-muted-foreground">{userToAction.email}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBanDialog(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={confirmBanUser}>
              <Ban className="h-4 w-4 mr-2" />
              Blokir User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unban User Confirmation Modal */}
      <Dialog open={showUnbanDialog} onOpenChange={setShowUnbanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary-600">
              <UserCheck className="h-5 w-5" />
              Buka Blokir User
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin membuka blokir user ini? User akan bisa login dan bertransaksi kembali.
            </DialogDescription>
          </DialogHeader>
          {userToAction && (
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
              <p className="font-medium">{userToAction.name}</p>
              <p className="text-sm text-muted-foreground">{userToAction.email}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUnbanDialog(false)}>
              Batal
            </Button>
            <Button className="bg-primary-600 hover:bg-primary-700" onClick={confirmUnbanUser}>
              <UserCheck className="h-4 w-4 mr-2" />
              Buka Blokir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product Detail Modal */}
      <Dialog open={showProductDetail} onOpenChange={setShowProductDetail}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedProduct?.type === "jasa" ? (
                <>
                  <CalendarDays className="h-5 w-5" />
                  Detail Jasa
                </>
              ) : (
                <>
                  <Package className="h-5 w-5" />
                  Detail Produk
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                {selectedProduct.type === "jasa" ? (
                  <CalendarDays className="h-12 w-12 text-muted-foreground/30" />
                ) : (
                  <Package className="h-12 w-12 text-muted-foreground/30" />
                )}
              </div>
              <div>
                <p className="font-bold text-lg">{selectedProduct.title}</p>
                <p className="text-sm text-muted-foreground mt-1">{selectedProduct.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                  <p className="text-muted-foreground">Harga</p>
                  <p className="font-bold text-primary-600">{formatProductPrice(selectedProduct)}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                  <p className="text-muted-foreground">{selectedProduct.type === "jasa" ? "Tipe" : "Kondisi"}</p>
                  <p className="font-medium">
                    {selectedProduct.type === "jasa" 
                      ? "Jasa" 
                      : selectedProduct.condition === "baru" ? "Baru" : "Bekas"}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                  <p className="text-muted-foreground">Kategori</p>
                  <p className="font-medium">{selectedProduct.category}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                  <p className="text-muted-foreground">{selectedProduct.type === "jasa" ? "Dipesan" : "Terjual"}</p>
                  <p className="font-medium">{selectedProduct.soldCount} item</p>
                </div>
              </div>
              {selectedProduct.type === "jasa" && selectedProduct.durationMin && selectedProduct.durationUnit && (
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                  <p className="text-sm text-muted-foreground">Estimasi Durasi</p>
                  <p className="font-medium text-purple-700 dark:text-purple-300">
                    {selectedProduct.durationMin === selectedProduct.durationMax 
                      ? `${selectedProduct.durationMin} ${selectedProduct.durationUnit}`
                      : `${selectedProduct.durationMin} - ${selectedProduct.durationMax} ${selectedProduct.durationUnit}`}
                  </p>
                </div>
              )}
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                <p className="text-sm text-muted-foreground">{selectedProduct.type === "jasa" ? "Penyedia Jasa" : "Penjual"}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-primary-100 text-primary-700 text-xs">
                      {getInitials(selectedProduct.seller?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-sm">{selectedProduct.seller?.name || "-"}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{selectedProduct.location}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProductDetail(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Product Confirmation Modal */}
      <Dialog open={showDeleteProductDialog} onOpenChange={setShowDeleteProductDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Hapus Produk
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus produk ini secara permanen? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          {productToDelete && (
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center">
                {productToDelete.type === "jasa" ? (
                  <CalendarDays className="h-6 w-6 text-muted-foreground/30" />
                ) : (
                  <Package className="h-6 w-6 text-muted-foreground/30" />
                )}
              </div>
              <div>
                <p className="font-medium">{productToDelete.title}</p>
                <p className="text-sm text-muted-foreground">{formatProductPrice(productToDelete)}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteProductDialog(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={confirmDeleteProduct}>
              <Trash2 className="h-4 w-4 mr-2" />
              Hapus Produk
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Warning Confirmation Modal */}
      <Dialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <MessageCircle className="h-5 w-5" />
              Kirim Warning
            </DialogTitle>
            <DialogDescription>
              Warning akan dikirim ke user yang dilaporkan. User akan menerima notifikasi tentang pelanggaran mereka.
            </DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-3">
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                  Alasan Laporan:
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  {selectedReport.reason}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                <p className="text-sm text-muted-foreground">User yang dilaporkan:</p>
                <p className="font-medium">{selectedReport.reportedUser.name}</p>
                <p className="text-sm text-muted-foreground">{selectedReport.reportedUser.email}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWarningDialog(false)}>
              Batal
            </Button>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={confirmSendWarning}>
              <MessageCircle className="h-4 w-4 mr-2" />
              Kirim Warning
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban from Report Confirmation Modal */}
      <Dialog open={showBanReportDialog} onOpenChange={setShowBanReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Ban className="h-5 w-5" />
              Blokir User
            </DialogTitle>
            <DialogDescription>
              User akan diblokir permanen dan tidak bisa login atau bertransaksi lagi.
            </DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-3">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                  Alasan Laporan:
                </p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {selectedReport.reason}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                <p className="text-sm text-muted-foreground">User yang akan diblokir:</p>
                <p className="font-medium">{selectedReport.reportedUser.name}</p>
                <p className="text-sm text-muted-foreground">{selectedReport.reportedUser.email}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBanReportDialog(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={confirmBanFromReport}>
              <Ban className="h-4 w-4 mr-2" />
              Blokir User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Withdrawal Modal */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary-600">
              <CheckCircle2 className="h-5 w-5" />
              Setujui Penarikan
            </DialogTitle>
            <DialogDescription>
              Dana akan ditransfer ke rekening user dalam 1x24 jam kerja.
            </DialogDescription>
          </DialogHeader>
          {selectedWithdrawal && (
            <div className="space-y-3">
              <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-3">
                <p className="text-sm text-muted-foreground">Jumlah Penarikan:</p>
                <p className="font-bold text-xl text-primary-600">{formatPrice(selectedWithdrawal.amount)}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-primary-100 text-primary-700 text-xs">
                      {getInitials(selectedWithdrawal.user?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{selectedWithdrawal.user?.name || "-"}</span>
                </div>
                <p className="text-sm text-muted-foreground">{selectedWithdrawal.bankName} - {selectedWithdrawal.accountNumber}</p>
                <p className="text-sm text-muted-foreground">a.n {selectedWithdrawal.accountName}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Batal
            </Button>
            <Button className="bg-primary-600 hover:bg-primary-700" onClick={confirmApproveWithdrawal}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Setujui
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Withdrawal Modal */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              Tolak Penarikan
            </DialogTitle>
            <DialogDescription>
              Dana akan dikembalikan ke saldo user. User akan menerima notifikasi.
            </DialogDescription>
          </DialogHeader>
          {selectedWithdrawal && (
            <div className="space-y-3">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-muted-foreground">Jumlah Penarikan:</p>
                <p className="font-bold text-xl text-red-600">{formatPrice(selectedWithdrawal.amount)}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-primary-100 text-primary-700 text-xs">
                      {getInitials(selectedWithdrawal.user?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{selectedWithdrawal.user?.name || "-"}</span>
                </div>
                <p className="text-sm text-muted-foreground">{selectedWithdrawal.bankName} - {selectedWithdrawal.accountNumber}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Alasan Penolakan <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Contoh: Nomor rekening tidak sesuai dengan nama pemilik akun..."
                  className="w-full min-h-[80px] px-3 py-2 text-sm border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <p className="text-xs text-muted-foreground">
                  Alasan ini akan ditampilkan ke user.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={confirmRejectWithdrawal} disabled={!rejectionReason.trim()}>
              <XCircle className="h-4 w-4 mr-2" />
              Tolak
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Withdrawal Modal */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary-600">
              <CheckCircle2 className="h-5 w-5" />
              Selesaikan Penarikan
            </DialogTitle>
            <DialogDescription>
              Konfirmasi bahwa dana telah berhasil ditransfer ke rekening user.
            </DialogDescription>
          </DialogHeader>
          {selectedWithdrawal && (
            <div className="space-y-3">
              <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-3">
                <p className="text-sm text-muted-foreground">Jumlah Penarikan:</p>
                <p className="font-bold text-xl text-primary-600">{formatPrice(selectedWithdrawal.amount)}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-primary-100 text-primary-700 text-xs">
                      {getInitials(selectedWithdrawal.user?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{selectedWithdrawal.user?.name || "-"}</span>
                </div>
                <p className="text-sm text-muted-foreground">{selectedWithdrawal.bankName} - {selectedWithdrawal.accountNumber}</p>
                <p className="text-sm text-muted-foreground">a.n {selectedWithdrawal.accountName}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompleteDialog(false)}>
              Batal
            </Button>
            <Button className="bg-primary-600 hover:bg-primary-700" onClick={confirmCompleteWithdrawal}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Selesaikan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fail Withdrawal Modal */}
      <Dialog open={showFailDialog} onOpenChange={setShowFailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              Penarikan Gagal
            </DialogTitle>
            <DialogDescription>
              Dana akan dikembalikan ke saldo user. User akan menerima notifikasi.
            </DialogDescription>
          </DialogHeader>
          {selectedWithdrawal && (
            <div className="space-y-3">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-muted-foreground">Jumlah Penarikan:</p>
                <p className="font-bold text-xl text-red-600">{formatPrice(selectedWithdrawal.amount)}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-primary-100 text-primary-700 text-xs">
                      {getInitials(selectedWithdrawal.user?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{selectedWithdrawal.user?.name || "-"}</span>
                </div>
                <p className="text-sm text-muted-foreground">{selectedWithdrawal.bankName} - {selectedWithdrawal.accountNumber}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Alasan Kegagalan <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={failureReason}
                  onChange={(e) => setFailureReason(e.target.value)}
                  placeholder="Contoh: Transfer gagal karena rekening tujuan tidak aktif..."
                  className="w-full min-h-[80px] px-3 py-2 text-sm border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <p className="text-xs text-muted-foreground">
                  Alasan ini akan ditampilkan ke user.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFailDialog(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={confirmFailWithdrawal} disabled={!failureReason.trim()}>
              <XCircle className="h-4 w-4 mr-2" />
              Tandai Gagal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Add/Edit Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              {selectedCategory ? "Edit Kategori" : "Tambah Kategori Baru"}
            </DialogTitle>
            <DialogDescription>
              {selectedCategory 
                ? "Perbarui informasi kategori"
                : "Isi informasi untuk kategori baru"
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 overflow-y-auto flex-1 min-h-0 pr-2">
            {/* Category Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Nama Kategori <span className="text-red-500">*</span>
              </label>
              <Input
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="Contoh: Elektronik"
              />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipe</label>
              <Select 
                value={categoryForm.type}
                onValueChange={(value: "barang" | "jasa") => setCategoryForm({ ...categoryForm, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="barang">Barang</SelectItem>
                  <SelectItem value="jasa">Jasa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Deskripsi</label>
                <span className="text-xs text-muted-foreground">(Opsional)</span>
              </div>
              <textarea
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                placeholder="Contoh: Kategori untuk barang-barang elektronik seperti HP, laptop, kamera, dll"
                className="w-full min-h-[80px] px-3 py-2 text-sm border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-xs text-muted-foreground flex items-start gap-1">
                <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                Deskripsi akan ditampilkan sebagai tooltip saat user hover di kategori, membantu user memahami isi kategori.
              </p>
            </div>

            {/* Sort Order */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Urutan Tampil</label>
              <Input
                type="number"
                value={categoryForm.sortOrder}
                onChange={(e) => setCategoryForm({ ...categoryForm, sortOrder: parseInt(e.target.value) || 0 })}
                min={1}
                className="w-24"
              />
              <p className="text-xs text-muted-foreground">
                Semakin kecil angka, semakin awal kategori ditampilkan
              </p>
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div>
                <label className="text-sm font-medium">Status Aktif</label>
                <p className="text-xs text-muted-foreground">
                  Kategori nonaktif tidak akan ditampilkan ke user
                </p>
              </div>
              <Switch
                checked={categoryForm.isActive}
                onCheckedChange={(checked) => setCategoryForm({ ...categoryForm, isActive: checked })}
              />
            </div>
          </div>
          <DialogFooter className="flex-shrink-0 border-t pt-4">
            <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleSaveCategory} disabled={!categoryForm.name.trim()}>
              {selectedCategory ? "Simpan Perubahan" : "Tambah Kategori"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Modal */}
      <Dialog open={showDeleteCategoryDialog} onOpenChange={setShowDeleteCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Hapus Kategori
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus kategori "{categoryToDelete?.name}"?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-700 dark:text-red-300">Perhatian!</p>
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    Tindakan ini tidak dapat dibatalkan.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteCategoryDialog(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={confirmDeleteCategory}>
              <Trash2 className="h-4 w-4 mr-2" />
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Cancel Request Dialog */}
      <Dialog open={showCancelApproveDialog} onOpenChange={setShowCancelApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary-600">
              <CheckCircle2 className="h-5 w-5" />
              Setujui Pembatalan
            </DialogTitle>
            <DialogDescription>
              Refund akan dikembalikan ke dompet pembeli secara otomatis.
            </DialogDescription>
          </DialogHeader>
          {selectedCancelRequest && (
            <div className="space-y-3">
              <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">No. Permintaan</p>
                    <p className="font-medium">{selectedCancelRequest.requestNumber}</p>
                  </div>
                  <Badge variant="outline" className="text-amber-600 border-amber-300">
                    Pending
                  </Badge>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Pemohon</span>
                  <span className="font-medium">{selectedCancelRequest.requester.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Order ID</span>
                  <span className="font-mono text-sm">{selectedCancelRequest.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Alasan</span>
                  <span className="text-sm">{CANCEL_REASONS.find(r => r.value === selectedCancelRequest.reason)?.label || selectedCancelRequest.reason}</span>
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-sm text-muted-foreground">Jumlah Refund</p>
                <p className="text-2xl font-bold text-blue-600">{formatPrice(selectedCancelRequest.refundAmount)}</p>
                <p className="text-xs text-muted-foreground mt-1">Akan dikembalikan ke dompet pembeli</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cancelApproveNotes">Catatan Admin (Opsional)</Label>
                <Textarea
                  id="cancelApproveNotes"
                  placeholder="Tambahkan catatan untuk pembeli..."
                  value={cancelApproveNotes}
                  onChange={(e) => setCancelApproveNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelApproveDialog(false)}>
              Batal
            </Button>
            <Button className="bg-primary-600 hover:bg-primary-700" onClick={confirmApproveCancelRequest}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Setujui & Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Cancel Request Dialog */}
      <Dialog open={showCancelRejectDialog} onOpenChange={setShowCancelRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              Tolak Pembatalan
            </DialogTitle>
            <DialogDescription>
              Berikan alasan penolakan kepada pembeli.
            </DialogDescription>
          </DialogHeader>
          {selectedCancelRequest && (
            <div className="space-y-3">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">No. Permintaan</span>
                  <span className="font-mono text-sm">{selectedCancelRequest.requestNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Pemohon</span>
                  <span className="font-medium">{selectedCancelRequest.requester.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Jumlah Refund</span>
                  <span className="font-medium">{formatPrice(selectedCancelRequest.refundAmount)}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cancelRejectReason">Alasan Penolakan *</Label>
                <Textarea
                  id="cancelRejectReason"
                  placeholder="Jelaskan alasan penolakan permintaan pembatalan ini..."
                  value={cancelRejectReasonInput}
                  onChange={(e) => setCancelRejectReasonInput(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Pembeli akan menerima notifikasi penolakan dengan alasan yang Anda berikan.
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelRejectDialog(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={confirmRejectCancelRequest} disabled={!cancelRejectReasonInput.trim()}>
              <XCircle className="h-4 w-4 mr-2" />
              Tolak Permintaan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
