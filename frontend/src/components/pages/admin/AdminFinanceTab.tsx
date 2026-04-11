import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Wallet, Clock, DollarSign, BarChart3, Search, Filter, ChevronDown, ChevronUp, X, CheckCircle2, XCircle } from "lucide-react";

interface Props {
  financeSubTab: "withdrawals" | "revenue";
  setFinanceSubTab: (value: "withdrawals" | "revenue") => void;
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
  getWithdrawalStatusBadge: (status: string) => React.ReactNode;
  getInitials: (value?: string | null) => string;
  handleApproveWithdrawal: (withdrawal: any) => void;
  handleRejectWithdrawal: (withdrawal: any) => void;
  handleProcessWithdrawal: (withdrawal: any) => void;
  handleCompleteWithdrawal: (withdrawal: any) => void;
  handleFailWithdrawal: (withdrawal: any) => void;
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
    getWithdrawalStatusBadge,
    getInitials,
    handleApproveWithdrawal,
    handleRejectWithdrawal,
    handleProcessWithdrawal,
    handleCompleteWithdrawal,
    handleFailWithdrawal,
  } = props;

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-6"><div className="flex items-center justify-between mb-2"><span className="text-sm text-muted-foreground">Total Escrow</span><Wallet className="h-4 w-4 text-primary-600" /></div><p className="text-2xl font-bold">{formatPrice(2500000)}</p><p className="text-xs text-muted-foreground mt-1">Dana ditahan dalam sistem</p></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between mb-2"><span className="text-sm text-muted-foreground">Pending Withdrawal</span><Clock className="h-4 w-4 text-amber-600" /></div><p className="text-2xl font-bold">{formatPrice(withdrawals.filter((w) => w.status === "pending").reduce((sum, w) => sum + w.amount, 0))}</p><p className="text-xs text-muted-foreground mt-1">{withdrawals.filter((w) => w.status === "pending").length} permintaan</p></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between mb-2"><span className="text-sm text-muted-foreground">Total Transaksi</span><DollarSign className="h-4 w-4 text-blue-600" /></div><p className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</p><p className="text-xs text-muted-foreground mt-1">Nilai transaksi platform</p></CardContent></Card>
        <Card className="border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20"><CardContent className="p-6"><div className="flex items-center justify-between mb-2"><span className="text-sm text-muted-foreground">Pendapatan Platform (5%)</span><BarChart3 className="h-4 w-4 text-primary-600" /></div><p className="text-2xl font-bold text-primary-600">{formatPrice(platformRevenue.total)}</p><p className="text-xs text-muted-foreground mt-1">Dari potongan penjualan seller</p></CardContent></Card>
      </div>
      <div className="flex gap-2 border-b pb-2">
        <Button variant={financeSubTab === "withdrawals" ? "default" : "ghost"} size="sm" onClick={() => setFinanceSubTab("withdrawals")} className="gap-2"><Wallet className="h-4 w-4" />Penarikan Dana</Button>
        <Button variant={financeSubTab === "revenue" ? "default" : "ghost"} size="sm" onClick={() => setFinanceSubTab("revenue")} className="gap-2"><BarChart3 className="h-4 w-4" />Pendapatan Platform</Button>
      </div>
      {financeSubTab === "withdrawals" && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><CardTitle>Permintaan Penarikan Dana</CardTitle><CardDescription>Proses penarikan dana user ke rekening bank dan e-wallet</CardDescription></div><div className="text-sm text-muted-foreground">{filteredWithdrawals.length} penarikan</div></div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[200px] max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input type="search" placeholder="Cari user, provider, no rekening..." value={withdrawalSearchTerm} onChange={(e) => { setWithdrawalSearchTerm(e.target.value); setWithdrawalPage(1); }} className="pl-9" /></div>
                <Select value={withdrawalStatusFilter} onValueChange={(value) => { setWithdrawalStatusFilter(value); setWithdrawalPage(1); }}><SelectTrigger className="w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">Semua Status</SelectItem><SelectItem value="pending">Menunggu</SelectItem><SelectItem value="approved">Disetujui</SelectItem><SelectItem value="processing">Diproses</SelectItem><SelectItem value="completed">Selesai</SelectItem><SelectItem value="failed">Gagal</SelectItem><SelectItem value="rejected">Ditolak</SelectItem></SelectContent></Select>
                <Button variant="outline" size="sm" onClick={() => setShowWithdrawalFilters(!showWithdrawalFilters)} className="gap-1"><Filter className="h-4 w-4" />Filter{showWithdrawalFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</Button>
                {(withdrawalStatusFilter !== "all" || withdrawalAccountTypeFilter !== "all" || withdrawalProviderFilter !== "all" || withdrawalSearchTerm) && <Button variant="ghost" size="sm" onClick={() => { setWithdrawalSearchTerm(""); setWithdrawalStatusFilter("all"); setWithdrawalAccountTypeFilter("all"); setWithdrawalProviderFilter("all"); setWithdrawalPage(1); }} className="text-xs text-muted-foreground"><X className="h-3 w-3 mr-1" />Reset</Button>}
              </div>
              {showWithdrawalFilters && <div className="flex flex-wrap gap-2 pt-2 border-t"><Select value={withdrawalAccountTypeFilter} onValueChange={(value) => { setWithdrawalAccountTypeFilter(value); setWithdrawalProviderFilter("all"); setWithdrawalPage(1); }}><SelectTrigger className="w-[120px]"><SelectValue placeholder="Tipe Akun" /></SelectTrigger><SelectContent><SelectItem value="all">Semua Tipe</SelectItem><SelectItem value="bank">Bank</SelectItem><SelectItem value="e_wallet">E-Wallet</SelectItem></SelectContent></Select><Select value={withdrawalProviderFilter} onValueChange={(value) => { setWithdrawalProviderFilter(value); setWithdrawalPage(1); }}><SelectTrigger className="w-[140px]"><SelectValue placeholder="Provider" /></SelectTrigger><SelectContent><SelectItem value="all">Semua Provider</SelectItem></SelectContent></Select></div>}
            </div>
          </CardHeader>
          <CardContent>
            {paginatedWithdrawals.length === 0 ? (<div className="text-center py-8 text-muted-foreground"><Wallet className="h-12 w-12 mx-auto mb-4 opacity-30" /><p>Tidak ada penarikan ditemukan dengan filter tersebut</p></div>) : (<><Table><TableHeader><TableRow><TableHead>User</TableHead><TableHead>Jumlah</TableHead><TableHead>Tipe</TableHead><TableHead>Provider</TableHead><TableHead>No. Akun</TableHead><TableHead>Tanggal</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader><TableBody>{paginatedWithdrawals.map((withdrawal) => (<TableRow key={withdrawal.id}><TableCell><div className="flex items-center gap-2"><Avatar className="h-8 w-8"><AvatarFallback className="bg-primary-100 text-primary-700 text-xs">{getInitials(withdrawal.user?.name)}</AvatarFallback></Avatar><span className="font-medium text-sm">{withdrawal.user?.name || "-"}</span></div></TableCell><TableCell className="font-bold text-primary-600">{formatPrice(withdrawal.amount)}</TableCell><TableCell><Badge variant={withdrawal.accountType === "e_wallet" ? "secondary" : "outline"} className={withdrawal.accountType === "e_wallet" ? "bg-purple-50 text-purple-700 border-purple-200" : ""}>{withdrawal.accountType === "e_wallet" ? "E-Wallet" : "Bank"}</Badge></TableCell><TableCell className="text-sm font-medium">{withdrawal.bankName}</TableCell><TableCell className="text-sm"><div><p className="font-mono">{withdrawal.accountNumber}</p><p className="text-xs text-muted-foreground">a.n {withdrawal.accountName}</p></div></TableCell><TableCell className="text-sm">{withdrawal.createdAt ? new Date(withdrawal.createdAt).toLocaleDateString("id-ID") : "-"}</TableCell><TableCell>{getWithdrawalStatusBadge(withdrawal.status)}</TableCell><TableCell className="text-right">{withdrawal.status === "pending" && <div className="flex items-center justify-end gap-2"><Button variant="outline" size="sm" className="text-red-500" onClick={() => handleRejectWithdrawal(withdrawal)}><XCircle className="h-3 w-3 mr-1" />Tolak</Button><Button size="sm" className="bg-primary-600 hover:bg-primary-700" onClick={() => handleApproveWithdrawal(withdrawal)}><CheckCircle2 className="h-3 w-3 mr-1" />Approve</Button></div>}{withdrawal.status === "approved" && <div className="flex items-center justify-end gap-2"><Button variant="outline" size="sm" onClick={() => handleProcessWithdrawal(withdrawal)}><Clock className="h-3 w-3 mr-1" />Proses</Button><Button size="sm" className="bg-primary-600 hover:bg-primary-700" onClick={() => handleCompleteWithdrawal(withdrawal)}><CheckCircle2 className="h-3 w-3 mr-1" />Selesai</Button><Button variant="destructive" size="sm" onClick={() => handleFailWithdrawal(withdrawal)}><XCircle className="h-3 w-3 mr-1" />Gagal</Button></div>}{withdrawal.status === "processing" && <div className="flex items-center justify-end gap-2"><Button size="sm" className="bg-primary-600 hover:bg-primary-700" onClick={() => handleCompleteWithdrawal(withdrawal)}><CheckCircle2 className="h-3 w-3 mr-1" />Selesai</Button><Button variant="destructive" size="sm" onClick={() => handleFailWithdrawal(withdrawal)}><XCircle className="h-3 w-3 mr-1" />Gagal</Button></div>}{withdrawal.status === "completed" && withdrawal.processedAt && <span className="text-xs text-primary-600">Selesai: {new Date(withdrawal.processedAt).toLocaleDateString("id-ID")}</span>}{withdrawal.status === "failed" && withdrawal.failureReason && <div className="text-xs max-w-[200px]"><p className="text-red-500 font-medium">Gagal</p><p className="text-muted-foreground mt-1 line-clamp-2">{withdrawal.failureReason}</p></div>}{withdrawal.status === "rejected" && withdrawal.rejectionReason && <div className="text-xs max-w-[200px]"><p className="text-red-500 font-medium">Ditolak</p><p className="text-muted-foreground mt-1 line-clamp-2">{withdrawal.rejectionReason}</p></div>}</TableCell></TableRow>))}</TableBody></Table>{renderPagination(currentPage, getTotalPages(filteredWithdrawals.length), setWithdrawalPage)}</>) }
          </CardContent>
        </Card>
      )}
      {financeSubTab === "revenue" && (<Card className="border-primary-200 dark:border-primary-800"><CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary-600" />Pendapatan Platform</CardTitle><CardDescription>Potongan 5% dari setiap transaksi penjualan seller</CardDescription></CardHeader><CardContent><div className="grid sm:grid-cols-3 gap-4 mb-6"><div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4"><p className="text-sm text-muted-foreground">Bulan Ini</p><p className="text-xl font-bold text-primary-600">{formatPrice(platformRevenue.thisMonth)}</p></div><div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4"><p className="text-sm text-muted-foreground">Bulan Lalu</p><p className="text-xl font-bold">{formatPrice(platformRevenue.lastMonth)}</p></div><div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4"><p className="text-sm text-muted-foreground">Pending Clearance</p><p className="text-xl font-bold text-amber-600">{formatPrice(platformRevenue.pendingClearance)}</p></div></div><div className="text-sm text-muted-foreground"><p className="font-medium mb-2">Transaksi Terbaru dengan Potongan:</p><div className="space-y-2">{platformRevenue.transactions.map((tx: any, idx: number) => (<div key={idx} className="flex items-center justify-between py-2 border-b last:border-0"><div><p className="font-medium">{tx.productTitle}</p><p className="text-xs text-muted-foreground">{tx.orderNumber} • {tx.createdAt}</p></div><p className="font-bold text-primary-600">+{formatPrice(tx.adminFee)}</p></div>))}</div></div></CardContent></Card>)}
    </>
  );
}
