import { useState } from "react";
import { formatAdminDate } from "./admin-dashboard.shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import FinancialActionModal from "./financial-modal/FinancialActionModal";
import { RevenueDetailModal } from "./financial-modal/RevenueDetailModal";
import { 
  Wallet, 
  Clock, 
  DollarSign, 
  BarChart3, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  X, 
  CheckCircle2, 
  XCircle, 
  ArrowUpCircle, 
  Eye,
  Calendar,
  CreditCard,
  Hash,
  User as UserIcon
} from "lucide-react";

interface Props {
  financeSubTab: "withdrawals" | "revenue" | "topups";
  setFinanceSubTab: (value: "withdrawals" | "revenue" | "topups") => void;
  withdrawals: any[];
  filteredWithdrawals: any[];
  paginatedWithdrawals: any[];
  currentPage: number;
  showWithdrawalFilters: boolean;
  setShowWithdrawalFilters: (value: boolean) => void;
  withdrawalSearchTerm: string;
  setWithdrawalSearchTerm: (value: string) => void;
  withdrawalStatusFilter: string;
  setWithdrawalStatusFilter: (value: any) => void;
  withdrawalAccountTypeFilter: string;
  setWithdrawalAccountTypeFilter: (value: any) => void;
  withdrawalProviderFilter: string;
  setWithdrawalProviderFilter: (value: string) => void;
  setWithdrawalPage: (value: number) => void;
  getTotalPages: (value: number) => number;
  renderPagination: (currentPage: number, totalPages: number, setPage: (page: number) => void) => any;
  formatPrice: (value: number) => string;
  stats: any;
  platformRevenue: any;
  platformRevenueLoading?: boolean;
  platformRevenueError?: string | null;
  getWithdrawalStatusBadge: (status: string) => React.ReactNode;
  getInitials: (value?: string | null) => string;
  handleApproveWithdrawal: (withdrawal: any) => void;
  handleProcessWithdrawal: (withdrawal: any) => void;
  handleCompleteWithdrawal: (withdrawal: any) => void;
  confirmApproveWithdrawal: () => void;
  confirmRejectWithdrawal: (reason: string) => void;
  confirmCompleteWithdrawal: () => void;
  confirmFailWithdrawal: (reason: string) => void;

  // Unified Modal Props
  financialModalOpen: boolean;
  setFinancialModalOpen: (open: boolean) => void;
  financialModalVariant: 'detail' | 'approve' | 'reject' | 'finish' | 'failed';
  setFinancialModalVariant: (variant: 'detail' | 'approve' | 'reject' | 'finish' | 'failed') => void;
  financialLoading: boolean;
  financialError: string | null;
  selectedWithdrawal: any;
  handleViewWithdrawal: (withdrawal: any) => void;

  // Platform Revenue Modal Props
  revenueModalOpen: boolean;
  setRevenueModalOpen: (open: boolean) => void;
  selectedRevenueTransaction: any;
  handleViewRevenueTransaction: (transaction: any) => void;

  // New Top Up Props
  topups: any[];
  topupLoading: boolean;
  topupError: string | null;
  topupSearchTerm: string;
  setTopupSearchTerm: (value: string) => void;
  topupStatusFilter: "all" | "pending" | "paid" | "failed";
  setTopupStatusFilter: (value: "all" | "pending" | "paid" | "failed") => void;
  topupPage: number;
  setTopupPage: (value: number) => void;
  topupTotalPages: number;
  topupStats: {
    total_amount: number;
    successful_amount: number;
    pending_amount: number;
    failed_amount: number;
  };
  topupTotalItems: number;
}

export default function AdminFinanceTab(props: Props) {
  const {
    financeSubTab,
    setFinanceSubTab,
    withdrawals,
    filteredWithdrawals,
    paginatedWithdrawals,
    currentPage,
    showWithdrawalFilters,
    setShowWithdrawalFilters,
    withdrawalSearchTerm,
    setWithdrawalSearchTerm,
    withdrawalStatusFilter,
    setWithdrawalStatusFilter,
    withdrawalAccountTypeFilter,
    setWithdrawalAccountTypeFilter,
    withdrawalProviderFilter,
    setWithdrawalProviderFilter,
    setWithdrawalPage,
    getTotalPages,
    renderPagination,
    formatPrice,
    stats,
    platformRevenue,
    platformRevenueLoading = false,
    platformRevenueError = null,
    getWithdrawalStatusBadge,
    getInitials,
    handleApproveWithdrawal,
    handleProcessWithdrawal,
    handleCompleteWithdrawal,

    // Unified Modal Props
    financialModalOpen,
    setFinancialModalOpen,
    financialModalVariant,
    setFinancialModalVariant,
    financialLoading,
    financialError,
    selectedWithdrawal,
    handleViewWithdrawal,

    // Platform Revenue Modal Props
    revenueModalOpen,
    setRevenueModalOpen,
    selectedRevenueTransaction,
    handleViewRevenueTransaction,
    confirmApproveWithdrawal,
    confirmRejectWithdrawal,
    confirmCompleteWithdrawal,
    confirmFailWithdrawal,

    // Top Up Props
    topups,
    topupLoading,
    topupError,
    topupSearchTerm,
    setTopupSearchTerm,
    topupStatusFilter,
    setTopupStatusFilter,
    topupPage,
    setTopupPage,
    topupTotalPages,
    topupStats,
    topupTotalItems,
  } = props;

  const [selectedTopup, setSelectedTopup] = useState<any | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  const getTopUpStatusBadge = (topup: any) => {
    if (!topup) return null;
    const status = topup.status;
    const rawTxStatus = topup.raw_response?.transaction_status;
    
    let detailedLabel = "Gagal";
    if (status === "failed" && typeof rawTxStatus === "string") {
      const details: Record<string, string> = {
        deny: "Ditolak",
        cancel: "Dibatalkan",
        expire: "Kedaluwarsa",
      };
      detailedLabel = `Gagal (${details[rawTxStatus] || rawTxStatus})`;
    }

    const badges: Record<string, React.ReactNode> = {
      pending: (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">
          Menunggu
        </Badge>
      ),
      paid: (
        <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 text-white border-transparent">
          Berhasil
        </Badge>
      ),
      failed: (
        <Badge variant="destructive" className="bg-red-500 hover:bg-red-600 text-white border-transparent">
          {detailedLabel}
        </Badge>
      ),
    };
    return badges[status] || <Badge variant="outline">{status}</Badge>;
  };

  const formatPaymentMethod = (method: string | null) => {
    if (!method) return "-";
    const methods: Record<string, string> = {
      bank_transfer: "Bank Transfer",
      credit_card: "Kartu Kredit",
      gopay: "GoPay",
      shopeepay: "ShopeePay",
      qris: "QRIS",
    };
    return methods[method] || method.toUpperCase();
  };

  const handleOpenDetail = (topup: any) => {
    setSelectedTopup(topup);
    setShowDetailDialog(true);
  };

  return (
    <>
      {/* 4 Cards Finance Statistics Row */}
      {financeSubTab === "topups" ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Total Inisiasi Top Up</span>
                <Wallet className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold">{formatPrice(topupStats.total_amount)}</p>
              <p className="text-xs text-muted-foreground mt-1">Akumulasi seluruh transaksi top up</p>
            </CardContent>
          </Card>
          <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-900/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Top Up Berhasil</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-emerald-600">{formatPrice(topupStats.successful_amount)}</p>
              <p className="text-xs text-muted-foreground mt-1">Saldo sukses masuk ke dompet user</p>
            </CardContent>
          </Card>
          <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/20 dark:bg-amber-900/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Top Up Menunggu</span>
                <Clock className="h-4 w-4 text-amber-600" />
              </div>
              <p className="text-2xl font-bold text-amber-600">{formatPrice(topupStats.pending_amount)}</p>
              <p className="text-xs text-muted-foreground mt-1">Menunggu penyelesaian pembayaran</p>
            </CardContent>
          </Card>
          <Card className="border-red-200 dark:border-red-800 bg-red-50/20 dark:bg-red-900/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Top Up Gagal</span>
                <XCircle className="h-4 w-4 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-red-600">{formatPrice(topupStats.failed_amount)}</p>
              <p className="text-xs text-muted-foreground mt-1">Kedaluwarsa, dibatalkan, atau ditolak</p>
            </CardContent>
          </Card>
        </div>
      ) : (
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
              <p className="text-2xl font-bold">{formatPrice(withdrawals.filter((w) => w.status === "pending").reduce((sum, w) => sum + w.amount, 0))}</p>
              <p className="text-xs text-muted-foreground mt-1">{withdrawals.filter((w) => w.status === "pending").length} permintaan</p>
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
              <p className="text-2xl font-bold text-primary-600">{formatPrice(stats.platformRevenue || 0)}</p>
              <p className="text-xs text-muted-foreground mt-1">Dari potongan penjualan seller</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Subtab Selector */}
      <div className="flex gap-2 border-b pb-2">
        <Button 
          variant={financeSubTab === "withdrawals" ? "default" : "ghost"} 
          size="sm" 
          onClick={() => setFinanceSubTab("withdrawals")} 
          className="gap-2"
        >
          <Wallet className="h-4 w-4" />Penarikan Dana
        </Button>
        <Button 
          variant={financeSubTab === "topups" ? "default" : "ghost"} 
          size="sm" 
          onClick={() => setFinanceSubTab("topups")} 
          className="gap-2"
        >
          <ArrowUpCircle className="h-4 w-4" />Top Up
        </Button>
        <Button 
          variant={financeSubTab === "revenue" ? "default" : "ghost"} 
          size="sm" 
          onClick={() => setFinanceSubTab("revenue")} 
          className="gap-2"
        >
          <BarChart3 className="h-4 w-4" />Pendapatan Platform
        </Button>
      </div>

      {/* Withdrawals Content */}
      {financeSubTab === "withdrawals" && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Permintaan Penarikan Dana</CardTitle>
                  <CardDescription>Proses penarikan dana user ke rekening bank dan e-wallet</CardDescription>
                </div>
                <div className="text-sm text-muted-foreground">{filteredWithdrawals.length} penarikan</div>
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
                <Select value={withdrawalStatusFilter} onValueChange={(value) => { setWithdrawalStatusFilter(value); setWithdrawalPage(1); }}>
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
                <Button variant="outline" size="sm" onClick={() => setShowWithdrawalFilters(!showWithdrawalFilters)} className="gap-1">
                  <Filter className="h-4 w-4" />Filter{showWithdrawalFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
                {(withdrawalStatusFilter !== "all" || withdrawalAccountTypeFilter !== "all" || withdrawalProviderFilter !== "all" || withdrawalSearchTerm) && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => { setWithdrawalSearchTerm(""); setWithdrawalStatusFilter("all"); setWithdrawalAccountTypeFilter("all"); setWithdrawalProviderFilter("all"); setWithdrawalPage(1); }} 
                    className="text-xs text-muted-foreground"
                  >
                    <X className="h-3 w-3 mr-1" />Reset
                  </Button>
                )}
              </div>
              {showWithdrawalFilters && (
                <div className="flex flex-wrap gap-2 pt-2 border-t">
                  <Select value={withdrawalAccountTypeFilter} onValueChange={(value) => { setWithdrawalAccountTypeFilter(value); setWithdrawalProviderFilter("all"); setWithdrawalPage(1); }}>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[20%]">User</TableHead>
                    <TableHead className="w-[15%]">Jumlah</TableHead>
                    <TableHead className="w-[10%]">Tipe</TableHead>
                    <TableHead className="w-[15%]">Provider</TableHead>
                    <TableHead className="w-[15%]">No. Akun</TableHead>
                    <TableHead className="w-[10%]">Tanggal</TableHead>
                    <TableHead className="w-[10%]">Status</TableHead>
                    <TableHead className="w-[5%] text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedWithdrawals.map((withdrawal) => (
                    <TableRow key={withdrawal.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            {withdrawal.user?.avatar && <AvatarImage src={withdrawal.user.avatar} alt={withdrawal.user.name} className="object-cover" />}
                            <AvatarFallback className="bg-primary-100 text-primary-700 text-xs">{getInitials(withdrawal.user?.name)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm">{withdrawal.user?.name || "-"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-primary-600">{formatPrice(withdrawal.amount)}</TableCell>
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
                      <TableCell className="text-sm">{formatAdminDate(withdrawal.createdAt)}</TableCell>
                      <TableCell>{getWithdrawalStatusBadge(withdrawal.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 w-8 p-0 border-slate-200 hover:border-primary-200 hover:bg-primary-50/40 hover:text-primary-600 dark:hover:bg-primary-950/20 dark:hover:border-primary-900 transition-all duration-200 group/eye"
                            onClick={() => handleViewWithdrawal(withdrawal)}
                            title="Lihat Detail"
                          >
                            <Eye className="h-4 w-4 text-slate-500 group-hover/eye:text-primary-600 group-hover/eye:scale-110 transition-transform" />
                          </Button>
                          
                          {withdrawal.status === "pending" && (
                            <Button 
                              size="sm" 
                              className="h-8 bg-primary-600 hover:bg-primary-700 text-white font-medium px-3 text-xs" 
                              onClick={() => handleApproveWithdrawal(withdrawal)}
                            >
                              Approve
                            </Button>
                          )}
                          {(withdrawal.status === "approved" || withdrawal.status === "processing") && (
                            <Button 
                              size="sm" 
                              className="h-8 bg-primary-600 hover:bg-primary-700 text-white font-medium px-3 text-xs" 
                              onClick={() => handleCompleteWithdrawal(withdrawal)}
                            >
                              Selesai
                            </Button>
                          )}
                          {withdrawal.status === "completed" && withdrawal.processedAt && (
                            <span className="text-xs text-muted-foreground mr-1.5">
                              Selesai
                            </span>
                          )}
                          {withdrawal.status === "failed" && (
                            <span className="text-xs text-red-500 font-medium mr-1.5">
                              Gagal
                            </span>
                          )}
                          {withdrawal.status === "rejected" && (
                            <span className="text-xs text-slate-400 font-medium mr-1.5">
                              Ditolak
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {paginatedWithdrawals.length > 0 && renderPagination(currentPage, getTotalPages(filteredWithdrawals.length), setWithdrawalPage)}
          </CardContent>
        </Card>
      )}

      {/* Top Ups Content */}
      {financeSubTab === "topups" && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Transaksi Top Up</CardTitle>
                  <CardDescription>Catatan penambahan saldo pengguna melalui Midtrans Snap</CardDescription>
                </div>
                <div className="text-sm text-muted-foreground">{topupTotalItems} transaksi</div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[200px] max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="search" 
                    placeholder="Cari nama, email, UUID, transaction ID..." 
                    value={topupSearchTerm} 
                    onChange={(e) => setTopupSearchTerm(e.target.value)} 
                    className="pl-9" 
                  />
                </div>
                <Select value={topupStatusFilter} onValueChange={(value: any) => { setTopupStatusFilter(value); setTopupPage(1); }}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="pending">Menunggu</SelectItem>
                    <SelectItem value="paid">Berhasil</SelectItem>
                    <SelectItem value="failed">Gagal</SelectItem>
                  </SelectContent>
                </Select>
                {(topupStatusFilter !== "all" || topupSearchTerm) && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => { setTopupSearchTerm(""); setTopupStatusFilter("all"); setTopupPage(1); }} 
                    className="text-xs text-muted-foreground"
                  >
                    <X className="h-3 w-3 mr-1" />Reset
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {topupLoading ? (
              <div className="py-20 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></div>
                <p className="text-sm">Memuat data transaksi top up...</p>
              </div>
            ) : topupError ? (
              <div className="py-12 text-center text-red-500">
                <XCircle className="h-12 w-12 mx-auto mb-3 opacity-40" />
                <p className="font-semibold">Terjadi Kesalahan</p>
                <p className="text-sm text-muted-foreground mt-1">{topupError}</p>
              </div>
            ) : topups.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <ArrowUpCircle className="h-12 w-12 mx-auto mb-4 opacity-30 text-slate-400" />
                <p className="font-medium text-slate-500">Tidak ada transaksi top up ditemukan</p>
                <p className="text-xs text-muted-foreground mt-1">Coba gunakan kata kunci atau filter status yang lain</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[20%]">User</TableHead>
                    <TableHead className="w-[15%]">Nominal</TableHead>
                    <TableHead className="w-[15%]">Metode</TableHead>
                    <TableHead className="w-[20%]">Transaction ID / Ref</TableHead>
                    <TableHead className="w-[15%]">Tanggal</TableHead>
                    <TableHead className="w-[10%]">Status</TableHead>
                    <TableHead className="w-[5%] text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topups.map((topup) => (
                    <TableRow key={topup.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            {topup.user?.avatar && <AvatarImage src={topup.user.avatar} alt={topup.user.name} className="object-cover" />}
                            <AvatarFallback className="bg-primary-100 text-primary-700 text-xs">
                              {getInitials(topup.user?.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm line-clamp-1">{topup.user?.name || "-"}</span>
                            <span className="text-xs text-muted-foreground line-clamp-1">{topup.user?.email || "-"}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-emerald-600">{formatPrice(topup.gross_amount)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-slate-50 border-slate-200 text-slate-700 text-xs dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300">
                          {formatPaymentMethod(topup.payment_method)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs max-w-[180px] truncate text-muted-foreground" title={topup.transaction_id || topup.uuid}>
                        {topup.transaction_id || topup.uuid}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatAdminDate(topup.created_at)}
                      </TableCell>
                      <TableCell>{getTopUpStatusBadge(topup)}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0" 
                          onClick={() => handleOpenDetail(topup)}
                          title="Lihat Detail Transaksi"
                        >
                          <Eye className="h-4 w-4 text-muted-foreground hover:text-primary-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {!topupLoading && !topupError && topups.length > 0 && renderPagination(topupPage, topupTotalPages, setTopupPage)}
          </CardContent>
        </Card>
      )}

      {/* Revenue Content */}
      {financeSubTab === "revenue" && (
        <Card className="border-primary-200 dark:border-primary-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary-600" />Pendapatan Platform
            </CardTitle>
            <CardDescription>Potongan 5% dari setiap transaksi penjualan seller</CardDescription>
          </CardHeader>
          <CardContent>
            {platformRevenueLoading ? (
              <div className="py-20 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></div>
                <p className="text-sm">Memuat data rincian pendapatan platform...</p>
              </div>
            ) : platformRevenueError ? (
              <div className="py-12 text-center text-red-500">
                <XCircle className="h-12 w-12 mx-auto mb-3 opacity-40" />
                <p className="font-semibold">Terjadi Kesalahan</p>
                <p className="text-sm text-muted-foreground mt-1">{platformRevenueError}</p>
              </div>
            ) : (
              <>
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
                  {platformRevenue.transactions.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground border rounded-lg border-dashed bg-slate-50/40 dark:bg-slate-900/10 dark:border-slate-300 dark:border-slate-800">
                      <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-30 text-slate-400" />
                      <p className="font-medium">Belum ada pendapatan platform</p>
                      <p className="text-xs text-muted-foreground mt-1">Pendapatan potongan fee 5% akan muncul saat ada transaksi penjualan yang selesai</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {platformRevenue.transactions.map((tx: any, idx: number) => (
                        <div 
                          key={idx} 
                          className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800/60 hover:border-primary-100 dark:hover:border-primary-950/40 hover:bg-slate-50 dark:hover:bg-slate-900/30 cursor-pointer transition-all duration-200 group"
                          onClick={() => handleViewRevenueTransaction(tx)}
                        >
                          <div className="flex-1 min-w-0 pr-4">
                            <p className="font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                              {tx.productTitle}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {tx.orderNumber} • {tx.createdAt}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <p className="font-bold text-primary-600 dark:text-primary-400 text-sm">
                              +{formatPrice(tx.adminFee)}
                            </p>
                            <div className="h-7 w-7 rounded-md border border-slate-200 dark:border-slate-800 flex items-center justify-center bg-white dark:bg-slate-950 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:border-primary-200 dark:hover:border-primary-900">
                              <Eye className="h-3.5 w-3.5 text-slate-500 hover:text-primary-600 dark:hover:text-primary-400" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Premium Detail Modal Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-[480px] w-full max-h-[85vh] overflow-y-auto p-5 md:p-6 transition-all duration-300 ease-in-out scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 scrollbar-track-transparent">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowUpCircle className="h-5 w-5 text-emerald-600" />
              Detail Transaksi Top Up
            </DialogTitle>
            <DialogDescription>
              Informasi lengkap transaksi inisiasi deposit saldo pengguna
            </DialogDescription>
          </DialogHeader>

          {selectedTopup && (
            <div className="space-y-5 py-2">
              {/* User Header Section */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
                <Avatar className="h-10 w-10">
                  {selectedTopup.user?.avatar && <AvatarImage src={selectedTopup.user.avatar} alt={selectedTopup.user.name} className="object-cover" />}
                  <AvatarFallback className="bg-primary-100 text-primary-700 font-medium">
                    {getInitials(selectedTopup.user?.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold flex items-center gap-1.5">
                    <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    {selectedTopup.user?.name || "-"}
                  </span>
                  <span className="text-xs text-muted-foreground line-clamp-1">
                    {selectedTopup.user?.email || "-"}
                  </span>
                </div>
              </div>

              {/* Transaction Metadata Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm border border-slate-100 dark:border-slate-800 rounded-lg overflow-hidden">
                <div className="col-span-2 border-b border-slate-100 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Nominal Deposit</span>
                  <span className="text-lg font-bold text-emerald-600">{formatPrice(selectedTopup.gross_amount)}</span>
                </div>
                
                <div className="p-3 space-y-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Hash className="h-3 w-3" /> Status
                  </span>
                  <div>{getTopUpStatusBadge(selectedTopup)}</div>
                </div>

                <div className="p-3 space-y-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <CreditCard className="h-3 w-3" /> Metode
                  </span>
                  <span className="font-medium">{formatPaymentMethod(selectedTopup.payment_method)}</span>
                </div>

                <div className="col-span-2 border-t border-slate-100 dark:border-slate-800 p-3 space-y-1">
                  <span className="text-xs text-muted-foreground">Payment UUID</span>
                  <p className="font-mono text-xs select-all bg-slate-50 dark:bg-slate-900 p-1.5 rounded border border-slate-100 dark:border-slate-800 break-all">
                    {selectedTopup.uuid}
                  </p>
                </div>

                {selectedTopup.transaction_id && (
                  <div className="col-span-2 border-t border-slate-100 dark:border-slate-800 p-3 space-y-1">
                    <span className="text-xs text-muted-foreground">Transaction ID (Midtrans)</span>
                    <p className="font-mono text-xs select-all bg-slate-50 dark:bg-slate-900 p-1.5 rounded border border-slate-100 dark:border-slate-800 break-all">
                      {selectedTopup.transaction_id}
                    </p>
                  </div>
                )}

                <div className="border-t border-r border-slate-100 dark:border-slate-800 p-3 space-y-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Tanggal Dibuat
                  </span>
                  <span className="text-xs font-medium">
                    {formatAdminDate(selectedTopup.created_at, true)}
                  </span>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 p-3 space-y-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Tanggal Dibayar
                  </span>
                  <span className="text-xs font-medium">
                    {selectedTopup.status === "paid" && selectedTopup.paid_at ? formatAdminDate(selectedTopup.paid_at, true) : <span className="text-muted-foreground font-normal">Belum dibayar</span>}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-end pt-2">
                <Button variant="outline" size="sm" onClick={() => setShowDetailDialog(false)}>
                  Tutup
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <FinancialActionModal
        open={financialModalOpen}
        onOpenChange={setFinancialModalOpen}
        variant={financialModalVariant}
        setVariant={setFinancialModalVariant}
        withdrawal={selectedWithdrawal}
        loading={financialLoading}
        error={financialError}
        onApprove={confirmApproveWithdrawal}
        onReject={confirmRejectWithdrawal}
        onComplete={confirmCompleteWithdrawal}
        onFail={confirmFailWithdrawal}
        onProcess={() => handleProcessWithdrawal(selectedWithdrawal)}
      />

      <RevenueDetailModal
        open={revenueModalOpen}
        onOpenChange={setRevenueModalOpen}
        transaction={selectedRevenueTransaction}
        formatPrice={formatPrice}
      />
    </>
  );
}
