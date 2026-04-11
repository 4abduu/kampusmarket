import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowDown, ArrowUp, ArrowUpRight, ChevronDown, ChevronUp, Eye, EyeOff, Filter, Plus, Search, Wallet, X } from "lucide-react"
import TransactionPagination from "@/components/pages/user/dashboard/TransactionPagination"

type Stats = {
  totalSales: number
  netIncome: number
}

type Transaction = {
  id: string
  type: string
  status: string
  description: string
  createdAt: string
  amount: number
  balanceAfter: number
}

type Props = {
  showBalance: boolean
  setShowBalance: (v: boolean) => void
  currentWalletBalance: number
  totalIncome: number
  totalExpense: number
  setShowTopUpDialog: (open: boolean) => void
  setShowWithdrawDialog: (open: boolean) => void
  stats: Stats
  adminFeePercentage: number
  formatPrice: (price: number) => string
  filteredTransactions: Transaction[]
  paginatedTransactions: Transaction[]
  transactionSearchTerm: string
  setTransactionSearchTerm: (v: string) => void
  transactionTypeFilter: "all" | "top_up" | "withdrawal" | "payment" | "refund" | "income" | "admin_fee"
  setTransactionTypeFilter: (v: "all" | "top_up" | "withdrawal" | "payment" | "refund" | "income" | "admin_fee") => void
  transactionStatusFilter: "all" | "completed" | "pending" | "failed"
  setTransactionStatusFilter: (v: "all" | "completed" | "pending" | "failed") => void
  showTransactionFilters: boolean
  setShowTransactionFilters: (v: boolean) => void
  transactionPage: number
  setTransactionPage: (v: number) => void
  totalTransactionPages: number
  getTransactionIcon: (type: string) => React.ReactNode
  getTransactionStatusBadge: (status: string) => React.ReactNode
  formatTransactionDate: (isoDate: string) => string
  transactionTypeLabels: Record<string, { label: string }>
}

export default function UserDashboardWalletTab({
  showBalance,
  setShowBalance,
  currentWalletBalance,
  totalIncome,
  totalExpense,
  setShowTopUpDialog,
  setShowWithdrawDialog,
  stats,
  adminFeePercentage,
  formatPrice,
  filteredTransactions,
  paginatedTransactions,
  transactionSearchTerm,
  setTransactionSearchTerm,
  transactionTypeFilter,
  setTransactionTypeFilter,
  transactionStatusFilter,
  setTransactionStatusFilter,
  showTransactionFilters,
  setShowTransactionFilters,
  transactionPage,
  setTransactionPage,
  totalTransactionPages,
  getTransactionIcon,
  getTransactionStatusBadge,
  formatTransactionDate,
  transactionTypeLabels,
}: Props) {
  return (
    <>
      <Card className="bg-gradient-to-br from-primary-600 to-primary-700 text-white">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-primary-100 text-sm">Saldo Tersedia</p>
              <div className="flex items-center gap-2 mt-1">
                <h2 className="text-3xl font-bold">{showBalance ? formatPrice(currentWalletBalance) : "Rp ••••••••"}</h2>
                <button onClick={() => setShowBalance(!showBalance)} className="p-1 hover:bg-primary-500/50 rounded transition-colors">
                  {showBalance ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center"><Wallet className="h-6 w-6" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 text-primary-100 text-sm mb-1"><ArrowDown className="h-4 w-4" />Masuk</div>
              <p className="font-bold">{showBalance ? formatPrice(totalIncome) : "Rp ••••••••"}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 text-primary-100 text-sm mb-1"><ArrowUp className="h-4 w-4" />Keluar</div>
              <p className="font-bold">{showBalance ? formatPrice(totalExpense) : "Rp ••••••••"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Button className="h-20 flex-col gap-2 bg-primary-600 hover:bg-primary-700" onClick={() => setShowTopUpDialog(true)}>
          <Plus className="h-6 w-6" />Top Up
        </Button>
        <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => setShowWithdrawDialog(true)} disabled={currentWalletBalance < 10000}>
          <ArrowUpRight className="h-6 w-6" />Tarik Dana
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ringkasan Keuangan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
              <p className="text-sm text-muted-foreground">Total Penjualan</p>
              <p className="text-2xl font-bold text-primary-600">{formatPrice(stats.totalSales)}</p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-muted-foreground">Pendapatan Bersih</p>
              <p className="text-2xl font-bold text-blue-600">{formatPrice(stats.netIncome)}</p>
              <p className="text-xs text-muted-foreground mt-1">Setelah potongan admin {adminFeePercentage * 100}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg">Riwayat Transaksi</CardTitle>
                <CardDescription>{filteredTransactions.length} transaksi</CardDescription>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Cari transaksi..."
                  value={transactionSearchTerm}
                  onChange={(e) => { setTransactionSearchTerm(e.target.value); setTransactionPage(1) }}
                  className="pl-9"
                />
              </div>
              <Select value={transactionTypeFilter} onValueChange={(v) => { setTransactionTypeFilter(v as typeof transactionTypeFilter); setTransactionPage(1) }}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="Tipe" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tipe</SelectItem>
                  <SelectItem value="top_up">Top Up</SelectItem>
                  <SelectItem value="income">Pendapatan</SelectItem>
                  <SelectItem value="withdrawal">Penarikan</SelectItem>
                  <SelectItem value="payment">Pembayaran</SelectItem>
                  <SelectItem value="refund">Refund</SelectItem>
                  <SelectItem value="admin_fee">Biaya Admin</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => setShowTransactionFilters(!showTransactionFilters)} className="gap-1">
                <Filter className="h-4 w-4" />
                Filter
                {showTransactionFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
              {(transactionTypeFilter !== "all" || transactionStatusFilter !== "all" || transactionSearchTerm) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setTransactionSearchTerm("")
                    setTransactionTypeFilter("all")
                    setTransactionStatusFilter("all")
                    setTransactionPage(1)
                  }}
                  className="text-xs text-muted-foreground"
                >
                  <X className="h-3 w-3 mr-1" />Reset
                </Button>
              )}
            </div>
            {showTransactionFilters && (
              <div className="flex flex-wrap gap-2 pt-2 border-t">
                <Select value={transactionStatusFilter} onValueChange={(v) => { setTransactionStatusFilter(v as typeof transactionStatusFilter); setTransactionPage(1) }}>
                  <SelectTrigger className="w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="completed">Selesai</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Gagal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {paginatedTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Wallet className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>Tidak ada transaksi ditemukan</p>
            </div>
          ) : (
            <>
              <ScrollArea className="max-h-[400px]">
                <div className="space-y-1 pr-4">
                  {paginatedTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">{getTransactionIcon(transaction.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium truncate">{transactionTypeLabels[transaction.type]?.label || transaction.type}</p>
                          {getTransactionStatusBadge(transaction.status)}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">{formatTransactionDate(transaction.createdAt)}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`font-bold ${transaction.amount > 0 ? "text-primary-600" : "text-red-600"}`}>
                          {transaction.amount > 0 ? "+" : ""}{formatPrice(transaction.amount)}
                        </p>
                        {showBalance && <p className="text-xs text-muted-foreground">Saldo: {formatPrice(transaction.balanceAfter)}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <TransactionPagination currentPage={transactionPage} totalPages={totalTransactionPages} onChangePage={setTransactionPage} />
            </>
          )}
        </CardContent>
      </Card>
    </>
  )
}
