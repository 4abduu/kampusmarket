import { useMemo, useState } from "react"
import { mockWalletTransactions } from "@/lib/mock-data"
import { USER_DASHBOARD_ITEMS_PER_PAGE } from "@/components/pages/user/dashboard/constants"

interface UseDashboardWalletParams {
  userId: string
}

export function useDashboardWallet({ userId }: UseDashboardWalletParams) {
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

  const handleWithdraw = () => {
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
