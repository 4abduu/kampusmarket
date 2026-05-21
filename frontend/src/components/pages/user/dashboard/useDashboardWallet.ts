import { useEffect, useMemo, useState } from "react"
import apiClient from "@/lib/api/client"
import { useToast } from "@/hooks/use-toast"
// @mock-flagged — digantikan oleh fetchTransactions() dari API /wallet/transactions
// import { mockWalletTransactions } from "@/lib/mock-data"
import type { WalletTransaction } from "@/lib/mock-data"
import { USER_DASHBOARD_ITEMS_PER_PAGE } from "@/components/pages/user/dashboard/constants"

interface UseDashboardWalletParams {
  userId: string
}

export function useDashboardWallet({ userId }: UseDashboardWalletParams) {
  const { toast } = useToast()
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false)
  const [withdrawForm, setWithdrawForm] = useState({
    type: "bank" as "bank" | "ewallet",
    bankType: "",
    customBankName: "",
    accountNumber: "",
    accountName: "",
    ewalletType: "",
    customEwalletName: "",
    amount: "",
  })
  const [showWithdrawSuccess, setShowWithdrawSuccess] = useState(false)

  const [showBalance, setShowBalance] = useState(true)
  const [showTopUpDialog, setShowTopUpDialog] = useState(false)
  const [topUpAmount, setTopUpAmount] = useState("")
  const [showTopUpSuccess, setShowTopUpSuccess] = useState(false)

  const [transactionSearchTerm, setTransactionSearchTerm] = useState("")
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<"all" | "top_up" | "withdrawal" | "payment" | "refund" | "income" | "admin_fee">("all")
  const [transactionStatusFilter, setTransactionStatusFilter] = useState<"all" | "completed" | "pending" | "failed">("all")
  const [showTransactionFilters, setShowTransactionFilters] = useState(false)
  const [transactionPage, setTransactionPage] = useState(1)

  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [transactionsLoading, setTransactionsLoading] = useState(false)
  const [transactionsError, setTransactionsError] = useState<string | null>(null)
  const [totalPages, setTotalPages] = useState(1)
  const [totalIncomeFetched, setTotalIncomeFetched] = useState(0)
  const [totalExpenseFetched, setTotalExpenseFetched] = useState(0)

  const fetchTransactions = async () => {
    setTransactionsLoading(true)
    setTransactionsError(null)
    try {
      const params = new URLSearchParams()
      params.set('per_page', String(USER_DASHBOARD_ITEMS_PER_PAGE))
      params.set('page', String(transactionPage))
      if (transactionTypeFilter !== 'all') params.set('type', transactionTypeFilter)
      if (transactionStatusFilter !== 'all') params.set('status', transactionStatusFilter)
      if (transactionSearchTerm.trim()) params.set('search', transactionSearchTerm.trim())

      const res = await apiClient.get(`/wallet/transactions?${params.toString()}`)
      const data = res.data?.data ?? res.data ?? []
      const meta = res.data?.meta ?? {}

      setTransactions(Array.isArray(data) ? data : [])
      setTotalPages(meta.last_page ?? 1)
      
      // Calculate/extract income and expense
      if (meta.total_income !== undefined) {
        setTotalIncomeFetched(meta.total_income)
      } else {
        // Fallback calculation if not returned in meta
        const list = Array.isArray(data) ? data : []
        const inc = list
          .filter((t: any) => t.amount > 0 && t.status === "completed")
          .reduce((sum: number, t: any) => sum + t.amount, 0)
        setTotalIncomeFetched(inc)
      }

      if (meta.total_expense !== undefined) {
        setTotalExpenseFetched(meta.total_expense)
      } else {
        // Fallback calculation if not returned in meta
        const list = Array.isArray(data) ? data : []
        const exp = list
          .filter((t: any) => t.amount < 0 && t.status === "completed")
          .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0)
        setTotalExpenseFetched(exp)
      }
    } catch (err: any) {
      setTransactionsError(err?.message || 'Gagal memuat riwayat transaksi')
    } finally {
      setTransactionsLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      void fetchTransactions()
    }
  }, [userId, transactionPage, transactionTypeFilter, transactionStatusFilter, transactionSearchTerm])

  const quickAmounts = [50000, 100000, 200000, 500000, 1000000]

  const handleTopUp = async () => {
    if (!topUpAmount || parseInt(topUpAmount, 10) < 10000) return
    try {
      await apiClient.post('/wallet/topup', { amount: parseInt(topUpAmount, 10) })
      setShowTopUpDialog(false)
      setShowTopUpSuccess(true)
      setTimeout(() => setShowTopUpSuccess(false), 3000)
      setTopUpAmount('')
      void fetchTransactions()
      toast({ title: 'Top-up berhasil', description: 'Saldo akan diperbarui setelah pembayaran dikonfirmasi' })
    } catch (err: any) {
      toast({ title: 'Gagal top-up', description: err?.message || 'Terjadi kesalahan', variant: 'destructive' })
    }
  }

  const handleWithdraw = async () => {
    const amount = parseInt(withdrawForm.amount, 10)
    if (!amount || amount < 10000) {
      toast({
        title: "Nominal tidak valid",
        description: "Minimal penarikan Rp 10.000",
        variant: "destructive",
      })
      return
    }

    const accountType = withdrawForm.type === "ewallet" ? "e_wallet" : "bank"
    const bankName =
      accountType === "bank"
        ? (withdrawForm.bankType === "lainnya"
            ? withdrawForm.customBankName
            : withdrawForm.bankType)
        : (withdrawForm.ewalletType === "lainnya"
            ? withdrawForm.customEwalletName
            : withdrawForm.ewalletType)

    if (!bankName || !withdrawForm.accountNumber || !withdrawForm.accountName) {
      toast({
        title: "Data belum lengkap",
        description: "Lengkapi detail rekening/e-wallet",
        variant: "destructive",
      })
      return
    }

    try {
      await apiClient.post("/wallet/withdraw", {
        amount,
        accountType,
        bankName,
        accountNumber: withdrawForm.accountNumber,
        accountName: withdrawForm.accountName,
      })

      setShowWithdrawDialog(false)
      setWithdrawForm({
        type: "bank",
        bankType: "",
        customBankName: "",
        accountNumber: "",
        accountName: "",
        ewalletType: "",
        customEwalletName: "",
        amount: "",
      })
      setShowWithdrawSuccess(true)
      setTimeout(() => setShowWithdrawSuccess(false), 3000)
      void fetchTransactions()
      toast({
        title: "Permintaan penarikan dibuat",
        description: "Admin akan memproses penarikan Anda",
      })
    } catch (err: any) {
      toast({
        title: "Gagal menarik dana",
        description: err?.message || "Terjadi kesalahan",
        variant: "destructive",
      })
    }
  }

  const isBankLainnya = withdrawForm.bankType === "lainnya"
  const isEwalletLainnya = withdrawForm.ewalletType === "lainnya"

  return {
    showWithdrawDialog,
    setShowWithdrawDialog,
    withdrawForm,
    setWithdrawForm,
    showWithdrawSuccess,
    showBalance,
    setShowBalance,
    showTopUpDialog,
    setShowTopUpDialog,
    topUpAmount,
    setTopUpAmount,
    showTopUpSuccess,
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
    filteredTransactions: transactions,
    paginatedTransactions: transactions,
    totalTransactionPages: totalPages,
    totalIncome: totalIncomeFetched,
    totalExpense: totalExpenseFetched,
    quickAmounts,
    handleTopUp,
    handleWithdraw,
    isBankLainnya,
    isEwalletLainnya,
    transactionsLoading,
    transactionsError,
  }
}

