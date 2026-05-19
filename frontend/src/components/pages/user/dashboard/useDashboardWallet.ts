import { useMemo, useState } from "react"
import apiClient from "@/lib/api/client"
import { useToast } from "@/hooks/use-toast"
import { mockWalletTransactions } from "@/lib/mock-data"
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

  const userTransactions = useMemo(() => {
    return mockWalletTransactions.filter((transaction) => transaction.userId === userId)
  }, [userId])

  const filteredTransactions = useMemo(() => {
    return userTransactions.filter((transaction) => {
      const matchesSearch = transactionSearchTerm === ""
        || transaction.description.toLowerCase().includes(transactionSearchTerm.toLowerCase())
      const matchesType = transactionTypeFilter === "all" || transaction.type === transactionTypeFilter
      const matchesStatus = transactionStatusFilter === "all" || transaction.status === transactionStatusFilter
      return matchesSearch && matchesType && matchesStatus
    })
  }, [transactionSearchTerm, transactionTypeFilter, transactionStatusFilter, userTransactions])

  const pageSize = USER_DASHBOARD_ITEMS_PER_PAGE
  const paginatedTransactions = useMemo(() => {
    return filteredTransactions.slice((transactionPage - 1) * pageSize, transactionPage * pageSize)
  }, [filteredTransactions, transactionPage])

  const totalTransactionPages = Math.ceil(filteredTransactions.length / pageSize) || 1

  const totalIncome = useMemo(() => {
    return userTransactions
      .filter((transaction) => transaction.amount > 0 && transaction.status === "completed")
      .reduce((sum, transaction) => sum + transaction.amount, 0)
  }, [userTransactions])

  const totalExpense = useMemo(() => {
    return userTransactions
      .filter((transaction) => transaction.amount < 0 && transaction.status === "completed")
      .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0)
  }, [userTransactions])

  const quickAmounts = [50000, 100000, 200000, 500000, 1000000]

  const handleTopUp = () => {
    if (!topUpAmount || parseInt(topUpAmount, 10) < 10000) return
    console.log("Top up:", { amount: topUpAmount })
    setShowTopUpDialog(false)
    setShowTopUpSuccess(true)
    setTimeout(() => setShowTopUpSuccess(false), 3000)
    setTopUpAmount("")
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
    filteredTransactions,
    paginatedTransactions,
    totalTransactionPages,
    totalIncome,
    totalExpense,
    quickAmounts,
    handleTopUp,
    handleWithdraw,
    isBankLainnya,
    isEwalletLainnya,
  }
}
