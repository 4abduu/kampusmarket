import { useEffect, useState } from "react"
import apiClient from "@/lib/api/client"
import { useToast } from "@/hooks/use-toast"
import { walletApi } from "@/lib/api/wallet"
// @mock-flagged — digantikan oleh fetchTransactions() dari API /wallet/transactions
// import { mockWalletTransactions } from "@/lib/mock-data"
import type { WalletTransaction } from "@/lib/mock-data"
import { USER_DASHBOARD_ITEMS_PER_PAGE } from "@/components/pages/user/dashboard/constants"

interface UseDashboardWalletParams {
  userId: string
  initialBalance?: number
}

export function useDashboardWallet({ userId, initialBalance = 0 }: UseDashboardWalletParams) {
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
  
  // Real-time balance tracking
  const [currentBalance, setCurrentBalance] = useState(initialBalance)

  const broadcastBalanceUpdate = (balance: number) => {
    window.dispatchEvent(
      new CustomEvent("wallet-balance-updated", {
        detail: { balance },
      }),
    )
  }

  useEffect(() => {
    setCurrentBalance(initialBalance)
  }, [initialBalance])

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
        const list = Array.isArray(data) ? data : []
        const inc = list
          .filter((t: any) => t.amount > 0 && t.status === "completed")
          .reduce((sum: number, t: any) => sum + t.amount, 0)
        setTotalIncomeFetched(inc)
      }

      if (meta.total_expense !== undefined) {
        setTotalExpenseFetched(meta.total_expense)
      } else {
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

  const fetchBalance = async () => {
    try {
      const response = await walletApi.getBalance()
      const balance = response.data.balance
      setCurrentBalance(balance)
      broadcastBalanceUpdate(balance)
    } catch (err: any) {
      console.warn('[Wallet] Failed to fetch balance:', err?.message)
    }
  }

  useEffect(() => {
    if (userId) {
      void fetchTransactions()
      void fetchBalance()
    }
  }, [userId, transactionPage, transactionTypeFilter, transactionStatusFilter, transactionSearchTerm])

  const quickAmounts = [50000, 100000, 200000, 500000, 1000000]

  const handleTopUp = async () => {
    if (!topUpAmount || parseInt(topUpAmount, 10) < 10000) return
    
    // Close dialog immediately like in OrderDetailPage (patokan)
    setShowTopUpDialog(false)
    
    try {
      // Step 1: Create Snap token
      const snapResponse = await walletApi.createTopUpSnap(parseInt(topUpAmount, 10))
      const { snap_token, payment_uuid } = snapResponse

      // Step 2: Load and open Midtrans Snap
      const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || ""
      const isSandbox =
        (import.meta.env.VITE_MIDTRANS_IS_SANDBOX || "true") === "true"
      const snapSrc = isSandbox
        ? "https://app.sandbox.midtrans.com/snap/snap.js"
        : "https://app.midtrans.com/snap/snap.js"

      if (!clientKey) {
        toast({
          title: "❌ Configuration Error",
          description:
            "Midtrans client key tidak ditemukan. Hubungi administrator.",
          variant: "destructive",
        })
        setShowTopUpDialog(true)
        return
      }

      const doSnap = () => {
        if (!(window as any).snap) {
          console.error("[Midtrans] Snap.js not loaded yet")
          toast({
            title: "Error",
            description:
              "Payment gateway belum siap. Silakan refresh dan coba lagi.",
            variant: "destructive",
          })
          setShowTopUpDialog(true)
          return
        }

        try {
          console.log("[Midtrans] Opening payment modal with token:", snap_token.substring(0, 20) + "...")
          
          // Suppress postMessage warnings at localhost
          const originalWarn = console.warn
          console.warn = (...args: any[]) => {
            if (args[0]?.includes?.('postMessage')) return
            originalWarn(...args)
          }

          (window as any).snap.pay(snap_token, {
            onSuccess: async (result: any) => {
              console.log("[Midtrans] Top-up success:", result)
              console.warn = originalWarn
              toast({
                title: "✅ Pembayaran berhasil!",
                description: "Mengonfirmasi top-up...",
              })
              try {
                const confirmResponse = await walletApi.confirmTopUpPayment(payment_uuid)
                if (confirmResponse.status === 'paid') {
                  await fetchBalance()
                  console.log("[Wallet] Balance refreshed after top-up")
                  
                  setShowTopUpSuccess(true)
                  setTimeout(() => setShowTopUpSuccess(false), 3000)
                  setTopUpAmount("")
                  void fetchTransactions()
                }
              } catch (e) {
                console.error("Failed to confirm payment", e)
                toast({
                  title: "⚠️ Pembayaran Terkirim",
                  description: "Pembayaran diproses tetapi konfirmasi gagal. Silakan refresh halaman.",
                  variant: "default",
                })
              }
            },
            onPending: async (result: any) => {
              console.log("[Midtrans] Top-up pending:", result)
              console.warn = originalWarn
              toast({
                title: "⏳ Pembayaran pending",
                description: "Selesaikan pembayaran Anda untuk melanjutkan.",
              })
              try {
                const confirmResponse = await walletApi.confirmTopUpPayment(payment_uuid)
                if (confirmResponse.status === 'paid') {
                  await fetchBalance()
                }
                void fetchTransactions()
              } catch (e) {
                console.error("Failed to confirm payment", e)
              }
            },
            onError: (result: any) => {
              console.error("[Midtrans] Top-up error:", result)
              console.warn = originalWarn
              toast({
                title: "❌ Pembayaran gagal",
                description: "Terjadi kesalahan. Silakan coba lagi.",
                variant: "destructive",
              })
            },
            onClose: () => {
              console.log("[Midtrans] Payment popup closed by user")
              console.warn = originalWarn
            },
          })
        } catch (error) {
          console.error("[Midtrans] Error calling snap.pay:", error)
          toast({
            title: "Error",
            description: "Gagal membuka payment gateway. Coba lagi.",
            variant: "destructive",
          })
          setShowTopUpDialog(true)
        }
      }

      // Check if script already loaded
      const existingScript = document.querySelector(
        `script[src="${snapSrc}"]`
      )

      if (!existingScript) {
        console.log("[Midtrans] Loading Snap.js from:", snapSrc)
        const script = document.createElement("script")
        script.src = snapSrc
        script.setAttribute("data-client-key", clientKey)
        script.type = "text/javascript"
        script.async = true

        script.onload = () => {
          console.log("[Midtrans] Snap.js loaded successfully")
          setTimeout(() => doSnap(), 100)
        }

        script.onerror = () => {
          toast({
            title: "Error",
            description:
              "Gagal memuat payment gateway. Coba refresh halaman.",
            variant: "destructive",
          })
          setShowTopUpDialog(true)
        }

        document.head.appendChild(script)
      } else {
        console.log("[Midtrans] Using existing Snap.js")
        setTimeout(() => doSnap(), 100)
      }
    } catch (err: any) {
      console.error("[Wallet TopUp Error]", err)
      toast({
        title: "Gagal memulai top-up",
        description: err?.message || "Terjadi kesalahan",
        variant: "destructive",
      })
      setShowTopUpDialog(true)
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
      void fetchBalance()
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
    currentBalance,
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
