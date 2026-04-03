"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination"
import {
  User,
  Package,
  ShoppingCart,
  Wallet,
  Settings,
  Plus,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle2,
  Truck,
  MessageCircle,
  Star,
  MapPin,
  ChevronRight,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowUp,
  ArrowDown,
  Lock,
  Percent,
  Building2,
  AlertCircle,
  Smartphone,
  CreditCard,
  Building,
  Check,
  EyeOff,
  Eye as EyeIcon,
  Save,
  Briefcase,
  Clock3,
  AlertTriangle,
  Camera,
  Monitor,
  Home,
  Minus,
  RefreshCcw,
  XCircle,
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
  X,
} from "lucide-react"
import { mockProducts, mockOrders, mockUsers, mockAddresses, getFacultyName, ADMIN_FEE_PERCENTAGE, calculateAdminFee, calculateNetIncome, categories, serviceCategories, FACULTIES, mockWalletTransactions, TRANSACTION_TYPE_LABELS, type Product, type Address as AddressType, type WalletTransaction } from "@/lib/mock-data"

interface UserDashboardPageProps {
  onNavigate: (page: string, productId?: string) => void
  currentPage?: string
}

// Bank options
const BANK_OPTIONS = [
  { id: "bca", name: "Bank BCA", logo: "🏦" },
  { id: "mandiri", name: "Bank Mandiri", logo: "🏦" },
  { id: "bri", name: "Bank BRI", logo: "🏦" },
  { id: "bni", name: "Bank BNI", logo: "🏦" },
  { id: "bsi", name: "Bank BSI", logo: "🏦" },
  { id: "cimb", name: "Bank CIMB Niaga", logo: "🏦" },
  { id: "danamon", name: "Bank Danamon", logo: "🏦" },
  { id: "permata", name: "Bank Permata", logo: "🏦" },
  { id: "panin", name: "Bank Panin", logo: "🏦" },
  { id: "ocbc", name: "Bank OCBC NISP", logo: "🏦" },
  { id: "jago", name: "Bank Jago", logo: "🏦" },
  { id: "seabank", name: "Sea Bank", logo: "🏦" },
  { id: "neobank", name: "Neo Bank", logo: "🏦" },
  { id: "lainnya", name: "Bank Lainnya", logo: "🏦" },
]

// E-Wallet options
const EWALLET_OPTIONS = [
  { id: "gopay", name: "GoPay", logo: "💚" },
  { id: "ovo", name: "OVO", logo: "💜" },
  { id: "dana", name: "DANA", logo: "💙" },
  { id: "shopeepay", name: "ShopeePay", logo: "🧡" },
  { id: "linkaja", name: "LinkAja", logo: "❤️" },
  { id: "isaku", name: "i.saku", logo: "💛" },
  { id: "sakuku", name: "Sakuku", logo: "💙" },
  { id: "lainnya", name: "Lainnya", logo: "📱" },
]

export default function UserDashboardPage({ onNavigate, currentPage = "dashboard" }: UserDashboardPageProps) {
  // Map currentPage to activeTab
  const getTabFromPage = (page: string): string => {
    switch (page) {
      case "my-products": return "products"
      case "orders": return "orders"
      case "wallet": return "wallet"
      case "settings": return "settings"
      default: return "overview"
    }
  }

  const [activeTab, setActiveTab] = useState(() => getTabFromPage(currentPage))
  
  // Products & Services State
  const [userProducts, setUserProducts] = useState<Product[]>(() => {
    return mockProducts.filter(p => p.sellerId === "1" || p.sellerId === "2" || p.sellerId === "adit-1" || p.sellerId === "adit-2").slice(0, 8)
  })
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showEditProductDialog, setShowEditProductDialog] = useState(false)
  const [showDeleteProductDialog, setShowDeleteProductDialog] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const [showProductSuccess, setShowProductSuccess] = useState(false)
  const [productSuccessMessage, setProductSuccessMessage] = useState("")
  const [productFilter, setProductFilter] = useState<"semua" | "barang" | "jasa">("semua")

  // Addresses State
  const [addresses, setAddresses] = useState<AddressType[]>(mockAddresses)
  const [editingAddress, setEditingAddress] = useState<AddressType | null>(null)
  const [showAddressDialog, setShowAddressDialog] = useState(false)
  const [showDeleteAddressDialog, setShowDeleteAddressDialog] = useState(false)
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null)
  const [addressForm, setAddressForm] = useState({
    label: "",
    recipient: "",
    phone: "",
    address: "",
    notes: "",
    isPrimary: false,
  })

  // Profile State
  const [profileForm, setProfileForm] = useState({
    name: mockUsers[0].name,
    email: mockUsers[0].email,
    phone: mockUsers[0].phone || "",
    bio: mockUsers[0].bio || "",
    faculty: mockUsers[0].faculty || "",
  })
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  const [showProfileSuccess, setShowProfileSuccess] = useState(false)

  // Handle photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Password State
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [showPasswordSuccess, setShowPasswordSuccess] = useState(false)

  // Password validation helpers
  const passwordValidations = {
    minLength: passwordForm.newPassword.length >= 8,
    hasNumber: /\d/.test(passwordForm.newPassword),
    hasLowercase: /[a-z]/.test(passwordForm.newPassword),
    hasUppercase: /[A-Z]/.test(passwordForm.newPassword),
  }

  const isPasswordValid = Object.values(passwordValidations).every(Boolean)

  // Withdrawal State
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

  // Wallet State
  const [showBalance, setShowBalance] = useState(true)
  const [showTopUpDialog, setShowTopUpDialog] = useState(false)
  const [topUpAmount, setTopUpAmount] = useState("")
  const [showTopUpSuccess, setShowTopUpSuccess] = useState(false)

  // Transaction Filter State
  const [transactionSearchTerm, setTransactionSearchTerm] = useState("")
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<"all" | "top_up" | "withdrawal" | "payment" | "refund" | "income" | "admin_fee">("all")
  const [transactionStatusFilter, setTransactionStatusFilter] = useState<"all" | "completed" | "pending" | "failed">("all")
  const [showTransactionFilters, setShowTransactionFilters] = useState(false)
  const [transactionPage, setTransactionPage] = useState(1)
  const ITEMS_PER_PAGE = 5

  // Sample user - defined early for use in other states
  const currentUser = mockUsers[0]

  // Get user transactions
  const userTransactions = mockWalletTransactions.filter(t => t.userId === currentUser.id)

  // Filter transactions
  const filteredTransactions = userTransactions.filter(t => {
    const matchesSearch = transactionSearchTerm === "" ||
      t.description.toLowerCase().includes(transactionSearchTerm.toLowerCase())
    const matchesType = transactionTypeFilter === "all" || t.type === transactionTypeFilter
    const matchesStatus = transactionStatusFilter === "all" || t.status === transactionStatusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  // Paginated transactions
  const paginatedTransactions = filteredTransactions.slice(
    (transactionPage - 1) * ITEMS_PER_PAGE,
    transactionPage * ITEMS_PER_PAGE
  )

  const totalTransactionPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE) || 1

  // Calculate wallet stats
  const totalIncome = userTransactions
    .filter(t => t.amount > 0 && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = userTransactions
    .filter(t => t.amount < 0 && t.status === "completed")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  // Quick amounts for top up
  const quickAmounts = [50000, 100000, 200000, 500000, 1000000]

  // Top Up Handler
  const handleTopUp = () => {
    if (!topUpAmount || parseInt(topUpAmount) < 10000) return
    // In real app, this would call Midtrans API
    // Midtrans will show its own payment method selection popup
    console.log("Top up:", { amount: topUpAmount })
    setShowTopUpDialog(false)
    setShowTopUpSuccess(true)
    setTimeout(() => setShowTopUpSuccess(false), 3000)
    setTopUpAmount("")
  }

  // Get transaction icon
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "top_up":
        return <ArrowDownLeft className="h-5 w-5 text-primary-600" />
      case "withdrawal":
        return <ArrowUpRight className="h-5 w-5 text-red-600" />
      case "payment":
        return <Minus className="h-5 w-5 text-red-600" />
      case "refund":
        return <RefreshCcw className="h-5 w-5 text-primary-600" />
      case "income":
        return <Plus className="h-5 w-5 text-primary-600" />
      case "admin_fee":
        return <Minus className="h-5 w-5 text-amber-600" />
      default:
        return <Wallet className="h-5 w-5 text-muted-foreground" />
    }
  }

  // Format date for transactions
  const formatTransactionDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  // Get status badge for transactions
  const getTransactionStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="outline" className="text-primary-600 border-primary-300">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Selesai
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="text-amber-600 border-amber-300">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="outline" className="text-red-600 border-red-300">
            <XCircle className="h-3 w-3 mr-1" />
            Gagal
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Render pagination for transactions
  const renderTransactionPagination = () => {
    if (totalTransactionPages <= 1) return null

    const pages: (number | "ellipsis")[] = []
    if (totalTransactionPages <= 5) {
      for (let i = 1; i <= totalTransactionPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (transactionPage > 3) pages.push("ellipsis")
      for (let i = Math.max(2, transactionPage - 1); i <= Math.min(totalTransactionPages - 1, transactionPage + 1); i++) {
        pages.push(i)
      }
      if (transactionPage < totalTransactionPages - 2) pages.push("ellipsis")
      pages.push(totalTransactionPages)
    }

    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setTransactionPage(Math.max(1, transactionPage - 1))}
              className={transactionPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
          {pages.map((page, index) => (
            <PaginationItem key={index}>
              {page === "ellipsis" ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  onClick={() => setTransactionPage(page)}
                  isActive={transactionPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              onClick={() => setTransactionPage(Math.min(totalTransactionPages, transactionPage + 1))}
              className={transactionPage === totalTransactionPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    )
  }

  // Order Actions State
  const [showShippingDialog, setShowShippingDialog] = useState(false)
  const [shippingFee, setShippingFee] = useState("")
  const [showOrderConfirmDialog, setShowOrderConfirmDialog] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  
  // Service Price Dialog State (for variable pricing services - SELLER)
  const [showServicePriceDialog, setShowServicePriceDialog] = useState(false)
  const [selectedServiceOrder, setSelectedServiceOrder] = useState<string | null>(null)
  const [servicePriceForm, setServicePriceForm] = useState({
    price: "",
    notes: "",
  })

  // Filter products based on type
  const filteredProducts = userProducts.filter(p => {
    if (productFilter === "semua") return true
    return p.type === productFilter
  })

  const stats = {
    totalSales: 2450000,
    netIncome: calculateNetIncome(2450000),
    adminFeeDeducted: calculateAdminFee(2450000),
    pendingOrders: 3,
    activeProducts: userProducts.filter(p => p.stock > 0 && p.type === "barang").length,
    activeServices: userProducts.filter(p => p.type === "jasa").length,
    walletBalance: 250000,
    totalSold: 28,
    rating: 4.8,
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatPriceRange = (product: Product) => {
    if (product.priceType === "range" && product.priceMin && product.priceMax) {
      return `${formatPrice(product.priceMin)} - ${formatPrice(product.priceMax)}`
    }
    if (product.priceType === "starting") {
      return `Mulai ${formatPrice(product.price)}`
    }
    return formatPrice(product.price)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      pending_payment: { variant: "outline", label: "Menunggu Pembayaran" },
      pending_meetup: { variant: "secondary", label: "Menunggu Ketemuan" },
      waiting_shipping_fee: { variant: "outline", label: "Menunggu Ongkir" },
      waiting_price: { variant: "outline", label: "Menunggu Harga" },
      waiting_confirmation: { variant: "outline", label: "Menunggu Konfirmasi" },
      processing: { variant: "default", label: "Diproses" },
      in_delivery: { variant: "default", label: "Dalam Pengiriman" },
      completed: { variant: "default", label: "Selesai" },
      cancelled: { variant: "destructive", label: "Dibatalkan" },
    }
    const config = statusConfig[status] || { variant: "outline", label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  // Product Handlers
  const handleEditProduct = (product: Product) => {
    setEditingProduct({ ...product })
    setShowEditProductDialog(true)
  }

  const handleSaveProduct = () => {
    if (editingProduct) {
      setUserProducts(prev => prev.map(p => p.id === editingProduct.id ? editingProduct : p))
      setShowEditProductDialog(false)
      setEditingProduct(null)
      setProductSuccessMessage(editingProduct.type === "jasa" ? "Jasa berhasil diperbarui!" : "Produk berhasil diperbarui!")
      setShowProductSuccess(true)
      setTimeout(() => setShowProductSuccess(false), 3000)
    }
  }

  const handleDeleteProduct = () => {
    if (productToDelete) {
      const product = userProducts.find(p => p.id === productToDelete)
      setUserProducts(prev => prev.filter(p => p.id !== productToDelete))
      setShowDeleteProductDialog(false)
      setProductToDelete(null)
      setProductSuccessMessage(product?.type === "jasa" ? "Jasa berhasil dihapus!" : "Produk berhasil dihapus!")
      setShowProductSuccess(true)
      setTimeout(() => setShowProductSuccess(false), 3000)
    }
  }

  // Address Handlers
  const handleAddAddress = () => {
    setEditingAddress(null)
    setAddressForm({ label: "", recipient: "", phone: "", address: "", notes: "", isPrimary: false })
    setShowAddressDialog(true)
  }

  const handleEditAddress = (address: AddressType) => {
    setEditingAddress(address)
    setAddressForm({
      label: address.label,
      recipient: address.recipient,
      phone: address.phone || "",
      address: address.address,
      notes: address.notes || "",
      isPrimary: address.isPrimary,
    })
    setShowAddressDialog(true)
  }

  const handleSaveAddress = () => {
    if (editingAddress) {
      setAddresses(prev => prev.map(a => 
        a.id === editingAddress.id 
          ? { ...a, ...addressForm }
          : addressForm.isPrimary ? { ...a, isPrimary: false } : a
      ))
    } else {
      const newAddress: AddressType = {
        id: `addr-${Date.now()}`,
        userId: currentUser.id,
        ...addressForm,
        createdAt: new Date().toISOString(),
      }
      if (addressForm.isPrimary) {
        setAddresses(prev => [...prev.map(a => ({ ...a, isPrimary: false })), newAddress])
      } else {
        setAddresses(prev => [...prev, newAddress])
      }
    }
    setShowAddressDialog(false)
    setEditingAddress(null)
  }

  const handleDeleteAddress = () => {
    if (addressToDelete) {
      setAddresses(prev => prev.filter(a => a.id !== addressToDelete))
      setShowDeleteAddressDialog(false)
      setAddressToDelete(null)
    }
  }

  // Profile Handler
  const handleSaveProfile = () => {
    setShowProfileSuccess(true)
    setTimeout(() => setShowProfileSuccess(false), 3000)
  }

  // Password Handler
  const handleChangePassword = () => {
    if (!passwordForm.currentPassword) {
      setPasswordError("Masukkan password saat ini")
      return
    }
    if (!isPasswordValid) {
      setPasswordError("Password baru belum memenuhi syarat")
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Konfirmasi password tidak cocok")
      return
    }
    setPasswordError("")
    setShowPasswordDialog(false)
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
    setShowPasswordSuccess(true)
    setTimeout(() => setShowPasswordSuccess(false), 3000)
  }

  // Withdrawal Handler
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

  // Service Price Handler (for variable pricing services - SELLER)
  const handleOpenServicePriceDialog = (orderId: string) => {
    setSelectedServiceOrder(orderId);
    const order = mockOrders.find(o => o.id === orderId);
    if (order) {
      setServicePriceForm({
        price: order.basePrice?.toString() || "",
        notes: "",
      });
    }
    setShowServicePriceDialog(true);
  };

  const handleSubmitServicePrice = () => {
    // In real app, this would send the price offer to buyer
    console.log("Service price submitted:", servicePriceForm)
    setShowServicePriceDialog(false)
    setSelectedServiceOrder(null)
    setServicePriceForm({ price: "", notes: "" })
  }

  // Price Confirmation Handler (for variable pricing services - BUYER)
  const handleAcceptPrice = (orderId: string) => {
    // In real app, this would update order status and process payment
    console.log("Price accepted for order:", orderId)
    // TODO: Open payment dialog or process payment directly
  }

  const handleRejectPrice = (orderId: string) => {
    // In real app, this would cancel the order
    console.log("Price rejected for order:", orderId)
    // TODO: Show cancel confirmation dialog
  }

  const isBankLainnya = withdrawForm.bankType === "lainnya"
  const isEwalletLainnya = withdrawForm.ewalletType === "lainnya"

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <Avatar className="h-20 w-20 mx-auto mb-3">
                    <AvatarFallback className="bg-primary-100 text-primary-700 text-xl">
                      {currentUser.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="font-bold text-lg">{currentUser.name}</h2>
                  <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      <Building2 className="h-3 w-3 mr-1" />
                      {getFacultyName(currentUser.faculty)}
                    </Badge>
                  </div>
                  <Badge variant="outline" className="mt-2">
                    <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                    {stats.rating} Rating
                  </Badge>
                </div>

                <Separator className="mb-4" />

                <nav className="space-y-1">
                  {[
                    { id: "overview", label: "Dashboard", icon: TrendingUp },
                    { id: "products", label: "Produk & Jasa", icon: Package },
                    { id: "orders", label: "Pesanan", icon: ShoppingCart },
                    { id: "wallet", label: "Dompet", icon: Wallet },
                    { id: "settings", label: "Pengaturan", icon: Settings },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        activeTab === item.id
                          ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3 space-y-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <>
                {/* Wallet Balance Card */}
                <Card className="bg-gradient-to-br from-primary-600 to-primary-700 text-white cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate("wallet")}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-primary-100 text-sm">Saldo Dompet</p>
                        <p className="text-3xl font-bold mt-1">{formatPrice(currentUser.walletBalance || 0)}</p>
                        <p className="text-primary-200 text-sm mt-2">Klik untuk kelola dompet →</p>
                      </div>
                      <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                        <Wallet className="h-7 w-7" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { title: "Total Penjualan", value: formatPrice(stats.totalSales), icon: DollarSign, color: "text-blue-600", bg: "bg-blue-100" },
                    { title: "Produk Aktif", value: stats.activeProducts.toString(), icon: Package, color: "text-purple-600", bg: "bg-purple-100" },
                    { title: "Jasa Aktif", value: stats.activeServices.toString(), icon: Briefcase, color: "text-secondary-600", bg: "bg-secondary-100" },
                    { title: "Rating", value: stats.rating.toFixed(1), icon: Star, color: "text-yellow-600", bg: "bg-yellow-100" },
                  ].map((stat, i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">{stat.title}</span>
                          <div className={`p-2 rounded-lg ${stat.bg}`}>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                          </div>
                        </div>
                        <p className="text-2xl font-bold">{stat.value}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 border-primary-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-primary-700 mb-2">
                          <DollarSign className="h-5 w-5" />
                          <span className="font-medium">Pendapatan Bersih</span>
                        </div>
                        <p className="text-3xl font-bold text-primary-600">{formatPrice(stats.netIncome)}</p>
                        <p className="text-sm text-primary-600/70 mt-1">Setelah potongan biaya admin {ADMIN_FEE_PERCENTAGE * 100}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-500">Biaya Admin</p>
                        <p className="text-lg font-semibold text-slate-600">-{formatPrice(stats.adminFeeDeducted)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Aksi Cepat</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <Button className="bg-primary-600 hover:bg-primary-700" onClick={() => onNavigate("add-product")}>
                        <Plus className="h-4 w-4 mr-2" />Tambah Produk
                      </Button>
                      <Button variant="outline" onClick={() => setShowWithdrawDialog(true)}>
                        <Wallet className="h-4 w-4 mr-2" />Tarik Dana
                      </Button>
                      <Button variant="outline" onClick={() => onNavigate("chat")}>
                        <MessageCircle className="h-4 w-4 mr-2" />Pesan (2)
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Produk & Jasa Terbaru</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab("products")}>Lihat Semua<ChevronRight className="h-4 w-4" /></Button>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-3 gap-4">
                      {userProducts.slice(0, 3).map((product) => (
                        <div key={product.id} className="border rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-colors" onClick={() => onNavigate("product", product.id)}>
                          <div className={`${product.type === "jasa" ? "bg-gradient-to-br from-secondary-100 to-primary-100 dark:from-secondary-900/30 dark:to-primary-900/30" : "bg-slate-100 dark:bg-slate-800"} h-32 flex items-center justify-center`}>
                            {product.type === "jasa" ? <Briefcase className="h-10 w-10 text-secondary-600/50" /> : <Package className="h-10 w-10 text-muted-foreground/30" />}
                          </div>
                          <div className="p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant={product.type === "jasa" ? "default" : "secondary"} className="text-xs">
                                {product.type === "jasa" ? "Jasa" : "Barang"}
                              </Badge>
                            </div>
                            <p className="font-medium text-sm line-clamp-1">{product.title}</p>
                            <p className="text-primary-600 font-bold text-sm">{formatPriceRange(product)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Products & Services Tab */}
            {activeTab === "products" && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Produk & Jasa Saya</CardTitle>
                    <CardDescription>Kelola semua produk dan jasa yang kamu tawarkan</CardDescription>
                  </div>
                  <Button className="bg-primary-600 hover:bg-primary-700" onClick={() => onNavigate("add-product")}>
                    <Plus className="h-4 w-4 mr-2" />Tambah
                  </Button>
                </CardHeader>
                <CardContent>
                  {/* Filter Tabs */}
                  <Tabs value={productFilter} onValueChange={(v) => setProductFilter(v as "semua" | "barang" | "jasa")} className="mb-4">
                    <TabsList>
                      <TabsTrigger value="semua">Semua ({userProducts.length})</TabsTrigger>
                      <TabsTrigger value="barang">Barang ({userProducts.filter(p => p.type === "barang").length})</TabsTrigger>
                      <TabsTrigger value="jasa">Jasa ({userProducts.filter(p => p.type === "jasa").length})</TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produk/Jasa</TableHead>
                          <TableHead>Harga</TableHead>
                          <TableHead>{productFilter === "jasa" ? "Pengerjaan" : "Stok"}</TableHead>
                          <TableHead>Terjual</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProducts.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                              {productFilter === "jasa" ? "Belum ada jasa" : productFilter === "barang" ? "Belum ada produk" : "Belum ada produk atau jasa"}
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredProducts.map((product) => (
                            <TableRow key={product.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className={`w-12 h-12 rounded flex items-center justify-center ${product.type === "jasa" ? "bg-secondary-100 dark:bg-secondary-900/30" : "bg-slate-100 dark:bg-slate-800"}`}>
                                    {product.type === "jasa" ? <Briefcase className="h-6 w-6 text-secondary-600" /> : <Package className="h-6 w-6 text-muted-foreground/30" />}
                                  </div>
                                  <div>
                                    <p className="font-medium line-clamp-1">{product.title}</p>
                                    <div className="flex items-center gap-2">
                                      <Badge variant={product.type === "jasa" ? "default" : "outline"} className="text-xs">
                                        {product.type === "jasa" ? "Jasa" : "Barang"}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">{product.category}</span>
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <p className="font-medium">{formatPriceRange(product)}</p>
                                {product.originalPrice && product.originalPrice > product.price && (
                                  <p className="text-xs text-muted-foreground line-through">{formatPrice(product.originalPrice)}</p>
                                )}
                              </TableCell>
                              <TableCell>
                                {product.type === "jasa" ? (
                                  <div className="flex items-center gap-1 text-sm">
                                    <Clock3 className="h-3 w-3" />
                                    {product.durationIsPlus && product.durationMin
                                      ? `${product.durationMin} ${product.durationUnit || "hari"}+`
                                      : product.durationMin && product.durationMax 
                                      ? `${product.durationMin}-${product.durationMax} ${product.durationUnit || "jam"}`
                                      : product.durationMin ? `${product.durationMin} ${product.durationUnit || "jam"}` : "-"}
                                  </div>
                                ) : (
                                  <span className={product.stock > 0 ? "" : "text-red-500"}>{product.stock}</span>
                                )}
                              </TableCell>
                              <TableCell>{product.soldCount}</TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-1">
                                  <Badge variant={product.status === "active" && (product.type === "jasa" || product.stock > 0) ? "default" : "secondary"}>
                                    {product.status === "active" && (product.type === "jasa" || product.stock > 0) ? "Aktif" : "Nonaktif"}
                                  </Badge>
                                  {product.type === "jasa" && product.availabilityStatus && product.availabilityStatus !== "available" && (
                                    <Badge variant={product.availabilityStatus === "full" ? "destructive" : "secondary"} className="text-xs">
                                      {product.availabilityStatus === "full" ? "🔴 Penuh" : "⚠️ Sibuk"}
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button variant="ghost" size="sm" onClick={() => onNavigate("product", product.id)}>
                                    <Eye className="h-4 w-4 mr-1" />Lihat
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => handleEditProduct(product)}>
                                    <Edit className="h-4 w-4 mr-1" />Edit
                                  </Button>
                                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={() => { setProductToDelete(product.id); setShowDeleteProductDialog(true); }}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <Card>
                <CardHeader>
                  <CardTitle>Pesanan Saya</CardTitle>
                  <CardDescription>Daftar semua transaksi jual dan beli</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="selling">
                    <TabsList className="mb-4">
                      <TabsTrigger value="selling">Penjualan</TabsTrigger>
                      <TabsTrigger value="buying">Pembelian</TabsTrigger>
                    </TabsList>

                    <TabsContent value="selling">
                      <div className="space-y-4">
                        {mockOrders.map((order) => (
                          <div key={order.id} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className={`w-16 h-16 rounded flex items-center justify-center ${order.productType === "jasa" ? "bg-secondary-100 dark:bg-secondary-900/30" : "bg-slate-100 dark:bg-slate-800"}`}>
                                  {order.productType === "jasa" ? <Briefcase className="h-8 w-8 text-secondary-600/50" /> : <Package className="h-8 w-8 text-muted-foreground/30" />}
                                </div>
                                <div>
                                  <p className="font-medium">{order.product.title}</p>
                                  <p className="text-sm text-muted-foreground">untuk {order.buyer.name}</p>
                                </div>
                              </div>
                              {getStatusBadge(order.status)}
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg mb-3">
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="flex justify-between"><span className="text-muted-foreground">Harga:</span><span>{formatPrice(order.basePrice)}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Ongkir:</span><span>{formatPrice(order.shippingFee)}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Biaya Admin:</span><span className="text-red-500">-{formatPrice(order.adminFeeDeducted)}</span></div>
                                <div className="flex justify-between font-medium text-primary-600"><span>Bersih:</span><span>{formatPrice(order.netIncome)}</span></div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => onNavigate("chat")}><MessageCircle className="h-4 w-4 mr-1" />Chat</Button>
                                <Button variant="outline" size="sm" onClick={() => onNavigate("order-detail", order.id)}>Detail</Button>
                              </div>
                              {order.status === "waiting_shipping_fee" && (
                                <Button size="sm" className="bg-amber-600 hover:bg-amber-700" onClick={() => setShowShippingDialog(true)}>
                                  <Truck className="h-4 w-4 mr-1" />Input Ongkir
                                </Button>
                              )}
                              {order.status === "waiting_price" && (
                                <Button size="sm" className="bg-amber-600 hover:bg-amber-700" onClick={() => handleOpenServicePriceDialog(order.id)}>
                                  <DollarSign className="h-4 w-4 mr-1" />Kirim Penawaran
                                </Button>
                              )}
                              {order.status === "processing" && (
                                <Button size="sm" className="bg-primary-600 hover:bg-primary-700" onClick={() => setShowOrderConfirmDialog(true)}>
                                  <CheckCircle2 className="h-4 w-4 mr-1" />Konfirmasi Dikirim
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="buying">
                      <div className="space-y-4">
                        {mockOrders.map((order) => (
                          <div key={order.id} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className={`w-16 h-16 rounded flex items-center justify-center ${order.productType === "jasa" ? "bg-secondary-100 dark:bg-secondary-900/30" : "bg-slate-100 dark:bg-slate-800"}`}>
                                  {order.productType === "jasa" ? <Briefcase className="h-8 w-8 text-secondary-600/50" /> : <Package className="h-8 w-8 text-muted-foreground/30" />}
                                </div>
                                <div>
                                  <p className="font-medium">{order.product.title}</p>
                                  <p className="text-sm text-muted-foreground">dari {order.seller.name}</p>
                                </div>
                              </div>
                              {getStatusBadge(order.status)}
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg mb-3">
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between"><span className="text-muted-foreground">Harga:</span><span>{formatPrice(order.basePrice)}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Ongkir:</span><span>{formatPrice(order.shippingFee)}</span></div>
                                <div className="flex justify-between font-bold border-t pt-1"><span>Total:</span><span className="text-primary-600">{formatPrice(order.totalPrice)}</span></div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => onNavigate("chat")}><MessageCircle className="h-4 w-4 mr-1" />Chat</Button>
                                <Button variant="outline" size="sm" onClick={() => onNavigate("order-detail", order.id)}>Detail</Button>
                              </div>
                              {order.status === "waiting_confirmation" && (
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50" onClick={() => handleRejectPrice(order.id)}>
                                    <AlertCircle className="h-4 w-4 mr-1" />Tolak
                                  </Button>
                                  <Button size="sm" className="bg-primary-600 hover:bg-primary-700" onClick={() => handleAcceptPrice(order.id)}>
                                    <Check className="h-4 w-4 mr-1" />Setuju & Bayar
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}

            {/* Wallet Tab */}
            {activeTab === "wallet" && (
              <>
                {/* Balance Card */}
                <Card className="bg-gradient-to-br from-primary-600 to-primary-700 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-primary-100 text-sm">Saldo Tersedia</p>
                        <div className="flex items-center gap-2 mt-1">
                          <h2 className="text-3xl font-bold">
                            {showBalance ? formatPrice(currentUser.walletBalance || 0) : "Rp ••••••••"}
                          </h2>
                          <button
                            onClick={() => setShowBalance(!showBalance)}
                            className="p-1 hover:bg-primary-500/50 rounded transition-colors"
                          >
                            {showBalance ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <Wallet className="h-6 w-6" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/10 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-primary-100 text-sm mb-1">
                          <ArrowDown className="h-4 w-4" />
                          Masuk
                        </div>
                        <p className="font-bold">
                          {showBalance ? formatPrice(totalIncome) : "Rp ••••••••"}
                        </p>
                      </div>
                      <div className="bg-white/10 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-primary-100 text-sm mb-1">
                          <ArrowUp className="h-4 w-4" />
                          Keluar
                        </div>
                        <p className="font-bold">
                          {showBalance ? formatPrice(totalExpense) : "Rp ••••••••"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    className="h-20 flex-col gap-2 bg-primary-600 hover:bg-primary-700"
                    onClick={() => setShowTopUpDialog(true)}
                  >
                    <Plus className="h-6 w-6" />
                    Top Up
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-2"
                    onClick={() => setShowWithdrawDialog(true)}
                    disabled={(currentUser.walletBalance || 0) < 10000}
                  >
                    <ArrowUpRight className="h-6 w-6" />
                    Tarik Dana
                  </Button>
                </div>

                {/* Financial Summary */}
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
                        <p className="text-xs text-muted-foreground mt-1">Setelah potongan admin {ADMIN_FEE_PERCENTAGE * 100}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Transaction History */}
                <Card>
                  <CardHeader className="pb-4">
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <CardTitle className="text-lg">Riwayat Transaksi</CardTitle>
                          <CardDescription>
                            {filteredTransactions.length} transaksi
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="relative flex-1 min-w-[200px] max-w-md">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="search"
                            placeholder="Cari transaksi..."
                            value={transactionSearchTerm}
                            onChange={(e) => { setTransactionSearchTerm(e.target.value); setTransactionPage(1); }}
                            className="pl-9"
                          />
                        </div>
                        <Select value={transactionTypeFilter} onValueChange={(v) => { setTransactionTypeFilter(v as typeof transactionTypeFilter); setTransactionPage(1); }}>
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Tipe" />
                          </SelectTrigger>
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowTransactionFilters(!showTransactionFilters)}
                          className="gap-1"
                        >
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
                            <X className="h-3 w-3 mr-1" />
                            Reset
                          </Button>
                        )}
                      </div>
                      {showTransactionFilters && (
                        <div className="flex flex-wrap gap-2 pt-2 border-t">
                          <Select value={transactionStatusFilter} onValueChange={(v) => { setTransactionStatusFilter(v as typeof transactionStatusFilter); setTransactionPage(1); }}>
                            <SelectTrigger className="w-[130px]">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
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
                              <div
                                key={transaction.id}
                                className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              >
                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                  {getTransactionIcon(transaction.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="font-medium truncate">
                                      {TRANSACTION_TYPE_LABELS[transaction.type]?.label || transaction.type}
                                    </p>
                                    {getTransactionStatusBadge(transaction.status)}
                                  </div>
                                  <p className="text-sm text-muted-foreground truncate">
                                    {transaction.description}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatTransactionDate(transaction.createdAt)}
                                  </p>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className={`font-bold ${
                                    transaction.amount > 0 ? "text-primary-600" : "text-red-600"
                                  }`}>
                                    {transaction.amount > 0 ? "+" : ""}
                                    {formatPrice(transaction.amount)}
                                  </p>
                                  {showBalance && (
                                    <p className="text-xs text-muted-foreground">
                                      Saldo: {formatPrice(transaction.balanceAfter)}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                        {renderTransactionPagination()}
                      </>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <>
                {/* Profile Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />Profil Saya</CardTitle>
                    <CardDescription>Kelola informasi profil kamu</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarFallback className="bg-primary-100 text-primary-700 text-xl">
                          {currentUser.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{currentUser.name}</p>
                        <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Nama Lengkap</label>
                        <input
                          type="text"
                          defaultValue={currentUser.name}
                          className="w-full border rounded-lg px-3 py-2"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <div className="relative">
                          <input
                            type="email"
                            defaultValue={currentUser.email}
                            disabled
                            className="w-full border rounded-lg px-3 py-2 pr-10 bg-slate-50 text-slate-600 cursor-not-allowed"
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Lock className="h-4 w-4 text-slate-400" />
                          </div>
                        </div>
                        <p className="text-xs text-amber-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Email tidak dapat diubah setelah pendaftaran
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Nomor HP</label>
                        <input
                          type="tel"
                          defaultValue={currentUser.phone}
                          className="w-full border rounded-lg px-3 py-2"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Fakultas</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={getFacultyName(currentUser.faculty)}
                            disabled
                            className="w-full border rounded-lg px-3 py-2 pr-10 bg-slate-50 text-slate-600 cursor-not-allowed"
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Lock className="h-4 w-4 text-slate-400" />
                          </div>
                        </div>
                        <p className="text-xs text-amber-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Fakultas tidak dapat diubah setelah pendaftaran
                        </p>
                      </div>
                    </div>
                    <div>
                      <Label>Bio</Label>
                      <Textarea value={profileForm.bio} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} placeholder="Ceritakan tentang dirimu..." rows={3} />
                    </div>
                    <Button className="bg-primary-600 hover:bg-primary-700" onClick={handleSaveProfile}>
                      <Save className="h-4 w-4 mr-2" />Simpan Perubahan
                    </Button>
                  </CardContent>
                </Card>

                {/* Password Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" />Keamanan</CardTitle>
                    <CardDescription>Ubah password dan pengaturan keamanan</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" onClick={() => setShowPasswordDialog(true)}>
                      <Lock className="h-4 w-4 mr-2" />Ubah Password
                    </Button>
                  </CardContent>
                </Card>

                {/* Address Settings */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" />Alamat</CardTitle>
                      <CardDescription>Kelola alamat pengiriman</CardDescription>
                    </div>
                    <Button size="sm" className="bg-primary-600 hover:bg-primary-700" onClick={handleAddAddress}>
                      <Plus className="h-4 w-4 mr-1" />Tambah
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {addresses.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">Belum ada alamat tersimpan</p>
                    ) : (
                      <div className="space-y-3">
                        {addresses.map((addr) => (
                          <div key={addr.id} className="p-4 border rounded-lg">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium">{addr.label}</span>
                                  {addr.isPrimary && <Badge className="bg-primary-100 text-primary-700 text-xs">Utama</Badge>}
                                </div>
                                <p className="text-sm font-medium">{addr.recipient}</p>
                                {addr.phone && <p className="text-sm text-muted-foreground">{addr.phone}</p>}
                                <p className="text-sm text-muted-foreground">{addr.address}</p>
                              </div>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="icon" onClick={() => handleEditAddress(addr)}><Edit className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="text-red-500" onClick={() => { setAddressToDelete(addr.id); setShowDeleteAddressDialog(true); }}><Trash2 className="h-4 w-4" /></Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </main>
        </div>
      </div>

      {/* ========================================== */}
      {/* MODAL BARU - DARI KODE KEDUA */}
      {/* ========================================== */}

      {/* Edit Product/Service Dialog */}
      <Dialog open={showEditProductDialog} onOpenChange={setShowEditProductDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct?.type === "jasa" ? "Edit Jasa" : "Edit Produk"}</DialogTitle>
            <DialogDescription>Perbarui informasi {editingProduct?.type === "jasa" ? "jasa" : "produk"} kamu</DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <div className="space-y-4">
              <div>
                <Label>Judul</Label>
                <Input value={editingProduct.title} onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {editingProduct.type === "jasa" ? (
                  <>
                    <div>
                      <Label>Harga Min (Rp)</Label>
                      <Input type="number" value={editingProduct.priceMin || ""} onChange={(e) => setEditingProduct({ ...editingProduct, priceMin: parseInt(e.target.value) || 0 })} />
                    </div>
                    <div>
                      <Label>Harga Max (Rp)</Label>
                      <Input type="number" value={editingProduct.priceMax || ""} onChange={(e) => setEditingProduct({ ...editingProduct, priceMax: parseInt(e.target.value) || 0 })} />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Label>Harga (Rp)</Label>
                      <Input type="number" value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: parseInt(e.target.value) || 0 })} />
                    </div>
                    <div>
                      <Label>Stok</Label>
                      <Input type="number" value={editingProduct.stock} onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })} />
                    </div>
                  </>
                )}
              </div>
              {editingProduct.type === "jasa" && (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Durasi Min</Label>
                      <Input type="number" value={editingProduct.durationMin || ""} onChange={(e) => setEditingProduct({ ...editingProduct, durationMin: parseInt(e.target.value) || undefined })} />
                    </div>
                    <div>
                      <Label>Durasi Max</Label>
                      <Input type="number" value={editingProduct.durationMax || ""} onChange={(e) => setEditingProduct({ ...editingProduct, durationMax: parseInt(e.target.value) || undefined })} disabled={editingProduct.durationIsPlus} />
                    </div>
                    <div>
                      <Label>Satuan</Label>
                      <Select value={editingProduct.durationUnit || "hari"} onValueChange={(v) => setEditingProduct({ ...editingProduct, durationUnit: v as "jam" | "hari" | "minggu" | "bulan" })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="jam">Jam</SelectItem>
                          <SelectItem value="hari">Hari</SelectItem>
                          <SelectItem value="minggu">Minggu</SelectItem>
                          <SelectItem value="bulan">Bulan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {/* Mode Lebih Dari Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <Clock3 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Mode "Lebih dari"</span>
                      </div>
                      <p className="text-xs text-muted-foreground ml-6">Contoh: 30 hari+</p>
                    </div>
                    <Switch
                      checked={editingProduct.durationIsPlus || false}
                      onCheckedChange={(checked) => setEditingProduct({ ...editingProduct, durationIsPlus: checked, durationMax: checked ? undefined : editingProduct.durationMax })}
                    />
                  </div>
                  <div>
                    <Label>Status Ketersediaan</Label>
                    <Select value={editingProduct.availabilityStatus || "available"} onValueChange={(v) => setEditingProduct({ ...editingProduct, availabilityStatus: v as "available" | "busy" | "full" })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Tersedia - Siap menerima order</SelectItem>
                        <SelectItem value="busy">Sibuk - Tampil info tapi bisa chat</SelectItem>
                        <SelectItem value="full">Penuh - Tidak bisa order baru</SelectItem>
                      </SelectContent>
                    </Select>
                    {(editingProduct.availabilityStatus === "busy" || editingProduct.availabilityStatus === "full") && (
                      <p className="text-xs text-amber-600 mt-1">
                        {editingProduct.availabilityStatus === "full" 
                          ? "Pembeli tidak akan bisa melakukan booking" 
                          : "Waktu respon mungkin lebih lambat"}
                      </p>
                    )}
                  </div>
                </>
              )}
              <div>
                <Label>Deskripsi</Label>
                <Textarea value={editingProduct.description} onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })} rows={3} />
              </div>
              <div>
                <Label>Kategori</Label>
                <Select value={editingProduct.category} onValueChange={(v) => setEditingProduct({ ...editingProduct, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(editingProduct.type === "jasa" ? serviceCategories : categories).map(c => <SelectItem key={c.id} value={c.label}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {editingProduct.type === "barang" && (
                <div>
                  <Label>Kondisi</Label>
                  <Select value={editingProduct.condition || "bekas"} onValueChange={(v: "baru" | "bekas") => setEditingProduct({ ...editingProduct, condition: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baru">Baru</SelectItem>
                      <SelectItem value="bekas">Bekas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              {/* Bisa Nego Toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg border bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Bisa Nego</span>
                </div>
                <Switch
                  checked={editingProduct.canNego}
                  onCheckedChange={(checked) => setEditingProduct({ ...editingProduct, canNego: checked })}
                />
              </div>

              {/* Shipping Methods for Barang */}
              {editingProduct.type === "barang" && (
                <div className="space-y-3">
                  <Label className="text-base">Metode Pengiriman</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${editingProduct.isCod ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" : "border-slate-200 dark:border-slate-700"}`}
                      onClick={() => setEditingProduct({ ...editingProduct, isCod: !editingProduct.isCod })}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">COD</span>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${editingProduct.isCod ? "border-primary-500 bg-primary-500" : "border-slate-300"}`}>
                          {editingProduct.isCod && <Check className="h-3 w-3 text-white" />}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">Bayar saat ketemuan</p>
                    </div>
                    <div className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${editingProduct.isPickup ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" : "border-slate-200 dark:border-slate-700"}`}
                      onClick={() => setEditingProduct({ ...editingProduct, isPickup: !editingProduct.isPickup })}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">Ambil Sendiri</span>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${editingProduct.isPickup ? "border-primary-500 bg-primary-500" : "border-slate-300"}`}>
                          {editingProduct.isPickup && <Check className="h-3 w-3 text-white" />}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">Ambil di lokasi</p>
                    </div>
                    <div className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${editingProduct.isDelivery ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" : "border-slate-200 dark:border-slate-700"}`}
                      onClick={() => setEditingProduct({ ...editingProduct, isDelivery: !editingProduct.isDelivery })}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">Antar</span>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${editingProduct.isDelivery ? "border-primary-500 bg-primary-500" : "border-slate-300"}`}>
                          {editingProduct.isDelivery && <Check className="h-3 w-3 text-white" />}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">Diantar ke alamat</p>
                    </div>
                  </div>
                  {editingProduct.isDelivery && (
                    <div className="grid grid-cols-2 gap-4 p-3 rounded-lg border bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                      <div>
                        <Label className="text-xs">Ongkir Min (Rp)</Label>
                        <Input
                          type="number"
                          value={editingProduct.deliveryFeeMin || ""}
                          onChange={(e) => setEditingProduct({ ...editingProduct, deliveryFeeMin: parseInt(e.target.value) || 0 })}
                          placeholder="5000"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Ongkir Max (Rp)</Label>
                        <Input
                          type="number"
                          value={editingProduct.deliveryFeeMax || ""}
                          onChange={(e) => setEditingProduct({ ...editingProduct, deliveryFeeMax: parseInt(e.target.value) || 0 })}
                          placeholder="20000"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Service Methods for Jasa */}
              {editingProduct.type === "jasa" && (
                <div className="space-y-3">
                  <Label className="text-base">Metode Pelayanan</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${editingProduct.isOnline ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" : "border-slate-200 dark:border-slate-700"}`}
                      onClick={() => setEditingProduct({ ...editingProduct, isOnline: !editingProduct.isOnline })}>
                      <div className="flex items-center justify-between mb-2">
                        <Monitor className="h-4 w-4" />
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${editingProduct.isOnline ? "border-primary-500 bg-primary-500" : "border-slate-300"}`}>
                          {editingProduct.isOnline && <Check className="h-3 w-3 text-white" />}
                        </div>
                      </div>
                      <span className="font-medium text-sm">Online</span>
                      <p className="text-xs text-muted-foreground">Via Zoom/Meet</p>
                    </div>
                    <div className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${editingProduct.isOnsite ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" : "border-slate-200 dark:border-slate-700"}`}
                      onClick={() => setEditingProduct({ ...editingProduct, isOnsite: !editingProduct.isOnsite })}>
                      <div className="flex items-center justify-between mb-2">
                        <MapPin className="h-4 w-4" />
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${editingProduct.isOnsite ? "border-primary-500 bg-primary-500" : "border-slate-300"}`}>
                          {editingProduct.isOnsite && <Check className="h-3 w-3 text-white" />}
                        </div>
                      </div>
                      <span className="font-medium text-sm">Onsite</span>
                      <p className="text-xs text-muted-foreground">Datang ke lokasi</p>
                    </div>
                    <div className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${editingProduct.isHomeService ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" : "border-slate-200 dark:border-slate-700"}`}
                      onClick={() => setEditingProduct({ ...editingProduct, isHomeService: !editingProduct.isHomeService })}>
                      <div className="flex items-center justify-between mb-2">
                        <Home className="h-4 w-4" />
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${editingProduct.isHomeService ? "border-primary-500 bg-primary-500" : "border-slate-300"}`}>
                          {editingProduct.isHomeService && <Check className="h-3 w-3 text-white" />}
                        </div>
                      </div>
                      <span className="font-medium text-sm">Home Service</span>
                      <p className="text-xs text-muted-foreground">Ke lokasi customer</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditProductDialog(false)}>Batal</Button>
            <Button className="bg-primary-600 hover:bg-primary-700" onClick={handleSaveProduct}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Product Dialog */}
      <AlertDialog open={showDeleteProductDialog} onOpenChange={setShowDeleteProductDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus {userProducts.find(p => p.id === productToDelete)?.type === "jasa" ? "Jasa" : "Produk"}?</AlertDialogTitle>
            <AlertDialogDescription>Data akan dihapus permanen dan tidak dapat dikembalikan.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDeleteProduct}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Address Dialog */}
      <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAddress ? "Edit Alamat" : "Tambah Alamat"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Label Alamat</Label>
              <Input placeholder="Rumah, Kos, Kantor..." value={addressForm.label} onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nama Penerima</Label>
                <Input value={addressForm.recipient} onChange={(e) => setAddressForm({ ...addressForm, recipient: e.target.value })} />
              </div>
              <div>
                <Label>No. HP</Label>
                <Input value={addressForm.phone} onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Alamat Lengkap</Label>
              <Textarea value={addressForm.address} onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })} rows={2} />
            </div>
            <div>
              <Label>Catatan (opsional)</Label>
              <Input value={addressForm.notes} onChange={(e) => setAddressForm({ ...addressForm, notes: e.target.value })} placeholder="Patokan, warna rumah, dll" />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary-600" />
                <span className="font-medium">Jadikan Alamat Utama</span>
              </div>
              <Switch
                checked={addressForm.isPrimary}
                onCheckedChange={(checked) => setAddressForm({ ...addressForm, isPrimary: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddressDialog(false)}>Batal</Button>
            <Button className="bg-primary-600 hover:bg-primary-700" onClick={handleSaveAddress}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Address Dialog */}
      <AlertDialog open={showDeleteAddressDialog} onOpenChange={setShowDeleteAddressDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Alamat?</AlertDialogTitle>
            <AlertDialogDescription>Alamat akan dihapus permanen.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDeleteAddress}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ubah Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Password Saat Ini</Label>
              <div className="relative">
                <Input type={showCurrentPassword ? "text" : "password"} value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} placeholder="Masukkan password saat ini" />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label>Password Baru</Label>
              <div className="relative">
                <Input type={showNewPassword ? "text" : "password"} value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} placeholder="Masukkan password baru" />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowNewPassword(!showNewPassword)}>
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
              {/* Password Requirements */}
              <div className="mt-3 space-y-2">
                <p className="text-xs text-muted-foreground font-medium">Password harus memenuhi syarat:</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className={`flex items-center gap-2 text-xs transition-colors ${passwordValidations.minLength ? "text-primary-600" : "text-muted-foreground"}`}>
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordValidations.minLength ? "bg-primary-100" : "bg-slate-100"}`}>
                      {passwordValidations.minLength ? <Check className="h-3 w-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
                    </div>
                    Minimal 8 karakter
                  </div>
                  <div className={`flex items-center gap-2 text-xs transition-colors ${passwordValidations.hasNumber ? "text-primary-600" : "text-muted-foreground"}`}>
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordValidations.hasNumber ? "bg-primary-100" : "bg-slate-100"}`}>
                      {passwordValidations.hasNumber ? <Check className="h-3 w-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
                    </div>
                    1 Angka
                  </div>
                  <div className={`flex items-center gap-2 text-xs transition-colors ${passwordValidations.hasLowercase ? "text-primary-600" : "text-muted-foreground"}`}>
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordValidations.hasLowercase ? "bg-primary-100" : "bg-slate-100"}`}>
                      {passwordValidations.hasLowercase ? <Check className="h-3 w-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
                    </div>
                    1 Huruf kecil
                  </div>
                  <div className={`flex items-center gap-2 text-xs transition-colors ${passwordValidations.hasUppercase ? "text-primary-600" : "text-muted-foreground"}`}>
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordValidations.hasUppercase ? "bg-primary-100" : "bg-slate-100"}`}>
                      {passwordValidations.hasUppercase ? <Check className="h-3 w-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
                    </div>
                    1 Huruf besar
                  </div>
                </div>
              </div>
            </div>
            <div>
              <Label>Konfirmasi Password</Label>
              <div className="relative">
                <Input type={showConfirmPassword ? "text" : "password"} value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} placeholder="Ulangi password baru" />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
              {passwordForm.confirmPassword && passwordForm.newPassword && (
                <p className={`text-xs mt-1 ${passwordForm.confirmPassword === passwordForm.newPassword ? "text-primary-600" : "text-red-500"}`}>
                  {passwordForm.confirmPassword === passwordForm.newPassword ? "✓ Password cocok" : "✗ Password tidak cocok"}
                </p>
              )}
            </div>
            {passwordError && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{passwordError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>Batal</Button>
            <Button className="bg-primary-600 hover:bg-primary-700" onClick={handleChangePassword} disabled={!isPasswordValid || passwordForm.newPassword !== passwordForm.confirmPassword}>Ubah Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Top Up Dialog */}
      <Dialog open={showTopUpDialog} onOpenChange={setShowTopUpDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary-600" />
              Top Up Saldo
            </DialogTitle>
            <DialogDescription>
              Pilih nominal top up, pembayaran via Midtrans
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Quick Amounts */}
            <div className="space-y-2">
              <Label>Pilih Nominal</Label>
              <div className="grid grid-cols-3 gap-2">
                {quickAmounts.map((amount) => (
                  <Button
                    key={amount}
                    variant={topUpAmount === amount.toString() ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTopUpAmount(amount.toString())}
                    className={topUpAmount === amount.toString() ? "bg-primary-600 hover:bg-primary-700" : ""}
                  >
                    {formatPrice(amount)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div className="space-y-2">
              <Label htmlFor="topUpAmount">Atau masukkan nominal</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Rp</span>
                <Input
                  id="topUpAmount"
                  type="number"
                  placeholder="Minimal Rp 10.000"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Minimal top up Rp 10.000
              </p>
            </div>

            {/* Midtrans Info */}
            {topUpAmount && parseInt(topUpAmount) >= 10000 && (
              <div className="p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
                <p className="text-sm text-primary-700 dark:text-primary-300 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>
                    Setelah klik "Top Up Sekarang", Anda akan diarahkan ke halaman pembayaran Midtrans untuk memilih metode pembayaran.
                  </span>
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowTopUpDialog(false)
              setTopUpAmount("")
            }}>
              Batal
            </Button>
            <Button
              className="bg-primary-600 hover:bg-primary-700"
              disabled={!topUpAmount || parseInt(topUpAmount) < 10000}
              onClick={handleTopUp}
            >
              Top Up Sekarang
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog - WITH BANK LAINNYA & EWALLET LAINNYA */}
      <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tarik Dana</DialogTitle>
            <DialogDescription>Saldo: {formatPrice(currentUser.walletBalance || 0)}</DialogDescription>
          </DialogHeader>
          <Tabs value={withdrawForm.type} onValueChange={(v) => setWithdrawForm({ ...withdrawForm, type: v as "bank" | "ewallet", bankType: "", ewalletType: "" })} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="bank"><Building className="h-4 w-4 mr-2" />Bank</TabsTrigger>
              <TabsTrigger value="ewallet"><Smartphone className="h-4 w-4 mr-2" />E-Wallet</TabsTrigger>
            </TabsList>
            
            {/* Bank Tab */}
            <TabsContent value="bank" className="space-y-4">
              <div>
                <Label>Pilih Bank</Label>
                <Select value={withdrawForm.bankType} onValueChange={(v) => setWithdrawForm({ ...withdrawForm, bankType: v, customBankName: "" })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih bank tujuan" />
                  </SelectTrigger>
                  <SelectContent>
                    {BANK_OPTIONS.map(bank => (
                      <SelectItem key={bank.id} value={bank.id}>
                        {bank.logo} {bank.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Show custom bank name input if "Lainnya" selected */}
              {isBankLainnya && (
                <div className="animate-in slide-in-from-top-2">
                  <Label>Nama Bank</Label>
                  <Input 
                    placeholder="Masukkan nama bank (contoh: Bank Sumut, Bank Nagari, dll)"
                    value={withdrawForm.customBankName}
                    onChange={(e) => setWithdrawForm({ ...withdrawForm, customBankName: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Masukkan nama bank yang tidak ada di daftar
                  </p>
                </div>
              )}
              
              <div>
                <Label>Nomor Rekening</Label>
                <Input 
                  placeholder="Masukkan nomor rekening"
                  value={withdrawForm.accountNumber}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, accountNumber: e.target.value })}
                />
              </div>
              <div>
                <Label>Nama Pemilik Rekening</Label>
                <Input 
                  placeholder="Nama sesuai buku rekening"
                  value={withdrawForm.accountName}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, accountName: e.target.value })}
                />
              </div>
              <div>
                <Label>Jumlah Penarikan</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Rp</span>
                  <Input 
                    type="number"
                    placeholder="0"
                    className="pl-10"
                    value={withdrawForm.amount}
                    onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                  />
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-muted-foreground">Min: Rp 10.000</span>
                  <button 
                    className="text-primary-600 hover:underline"
                    onClick={() => setWithdrawForm({ ...withdrawForm, amount: stats.walletBalance.toString() })}
                  >
                    Tarik semua
                  </button>
                </div>
              </div>
              
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                  <div className="text-xs text-blue-700 dark:text-blue-300">
                    <p className="font-medium">Transfer Bank</p>
                    <p className="mt-1">• Proses 1x24 jam kerja</p>
                    <p>• Pastikan data rekening benar</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* E-Wallet Tab */}
            <TabsContent value="ewallet" className="space-y-4">
              <div>
                <Label>Pilih E-Wallet</Label>
                <Select value={withdrawForm.ewalletType} onValueChange={(v) => setWithdrawForm({ ...withdrawForm, ewalletType: v, customEwalletName: "" })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih e-wallet" />
                  </SelectTrigger>
                  <SelectContent>
                    {EWALLET_OPTIONS.map(ew => (
                      <SelectItem key={ew.id} value={ew.id}>
                        {ew.logo} {ew.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Show custom e-wallet name input if "Lainnya" selected */}
              {isEwalletLainnya && (
                <div className="animate-in slide-in-from-top-2">
                  <Label>Nama E-Wallet</Label>
                  <Input 
                    placeholder="Masukkan nama e-wallet (contoh: i.saku, Sakuku, dll)"
                    value={withdrawForm.customEwalletName}
                    onChange={(e) => setWithdrawForm({ ...withdrawForm, customEwalletName: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Masukkan nama e-wallet yang tidak ada di daftar
                  </p>
                </div>
              )}
              
              <div>
                <Label>Nomor HP</Label>
                <Input 
                  placeholder="08xxxxxxxxxx"
                  value={withdrawForm.accountNumber}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, accountNumber: e.target.value })}
                />
              </div>
              <div>
                <Label>Nama Pemilik E-Wallet</Label>
                <Input 
                  placeholder="Nama sesuai akun e-wallet"
                  value={withdrawForm.accountName}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, accountName: e.target.value })}
                />
              </div>
              <div>
                <Label>Jumlah Penarikan</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Rp</span>
                  <Input 
                    type="number"
                    placeholder="0"
                    className="pl-10"
                    value={withdrawForm.amount}
                    onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                  />
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-muted-foreground">Min: Rp 10.000</span>
                  <button 
                    className="text-primary-600 hover:underline"
                    onClick={() => setWithdrawForm({ ...withdrawForm, amount: stats.walletBalance.toString() })}
                  >
                    Tarik semua
                  </button>
                </div>
              </div>
              
              <div className="p-3 rounded-lg bg-secondary-50 dark:bg-secondary-900/20 border border-secondary-200 dark:border-secondary-800">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-secondary-600 mt-0.5 shrink-0" />
                  <div className="text-xs text-secondary-700 dark:text-secondary-300">
                    <p className="font-medium">Transfer E-Wallet</p>
                    <p className="mt-1">• Proses instan (5-30 menit)</p>
                    <p>• Pastikan nomor HP aktif</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWithdrawDialog(false)}>Batal</Button>
            <Button 
              className="bg-primary-600 hover:bg-primary-700" 
              onClick={handleWithdraw}
              disabled={
                (withdrawForm.type === "bank" && (!withdrawForm.bankType || !withdrawForm.accountNumber || !withdrawForm.amount || (isBankLainnya && !withdrawForm.customBankName))) ||
                (withdrawForm.type === "ewallet" && (!withdrawForm.ewalletType || !withdrawForm.accountNumber || !withdrawForm.amount || (isEwalletLainnya && !withdrawForm.customEwalletName)))
              }
            >
              Ajukan Penarikan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shipping Fee Dialog */}
      <Dialog open={showShippingDialog} onOpenChange={setShowShippingDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-amber-600" />
              Input Ongkos Kirim
            </DialogTitle>
            <DialogDescription>
              Masukkan ongkos kirim untuk pesanan ini
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Buyer Info Card */}
            <div className="p-4 rounded-lg border bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary-100 text-primary-700">
                    {mockOrders[0]?.buyer?.name?.split(" ").map((n: string) => n[0]).join("") || "B"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{mockOrders[0]?.buyer?.name || "Nama Pembeli"}</p>
                  <p className="text-sm text-muted-foreground">Pembeli</p>
                </div>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Alamat Pengiriman:</p>
                  <p className="text-muted-foreground">
                    {mockOrders[0]?.shippingAddress || mockAddresses[0]?.address || "Jl. Kampus No. 123, Limau Manis, Kec. Pauh, Kota Padang, Sumatera Barat 25176"}
                  </p>
                </div>
              </div>
            </div>

            {/* Shipping Fee Input */}
            <div>
              <Label htmlFor="shipping-fee">Ongkos Kirim (Rp) *</Label>
              <Input
                id="shipping-fee"
                type="number"
                value={shippingFee}
                onChange={(e) => setShippingFee(e.target.value)}
                placeholder="Contoh: 15000"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Masukkan ongkir berdasarkan jarak ke alamat pembeli
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShippingDialog(false)}>Batal</Button>
            <Button 
              className="bg-primary-600 hover:bg-primary-700" 
              onClick={() => { setShowShippingDialog(false); setShippingFee(""); }}
              disabled={!shippingFee}
            >
              Kirim ke Pembeli
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Service Price Dialog (for variable pricing services - SELLER) */}
      <Dialog open={showServicePriceDialog} onOpenChange={setShowServicePriceDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-amber-600" />
              Input Harga Jasa
            </DialogTitle>
            <DialogDescription>
              Masukkan harga untuk layanan ini berdasarkan kebutuhan pembeli
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Show buyer's requirements */}
            {mockOrders.find(o => o.id === selectedServiceOrder)?.serviceNotes && (
              <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                <p className="text-xs text-purple-600 font-medium mb-1">Kebutuhan Pembeli:</p>
                <p className="text-sm text-purple-800 dark:text-purple-200 line-clamp-3">
                  {mockOrders.find(o => o.id === selectedServiceOrder)?.serviceNotes}
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="service-price">Harga Jasa (Rp) *</Label>
              <Input
                id="service-price"
                type="number"
                placeholder="Contoh: 350000"
                value={servicePriceForm.price}
                onChange={(e) => setServicePriceForm({ ...servicePriceForm, price: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="service-notes">Catatan (Opsional)</Label>
              <Textarea
                id="service-notes"
                placeholder="Contoh: Harga sudah termasuk revisi 2x"
                value={servicePriceForm.notes}
                onChange={(e) => setServicePriceForm({ ...servicePriceForm, notes: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowServicePriceDialog(false)}>
              Batal
            </Button>
            <Button 
              className="bg-primary-600 hover:bg-primary-700"
              onClick={handleSubmitServicePrice}
              disabled={!servicePriceForm.price}
            >
              Kirim Penawaran
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Confirm Dialog */}
      <AlertDialog open={showOrderConfirmDialog} onOpenChange={setShowOrderConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Barang Dikirim?</AlertDialogTitle>
            <AlertDialogDescription>Pastikan barang sudah dikirim ke pembeli.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction className="bg-primary-600 hover:bg-primary-700" onClick={() => setShowOrderConfirmDialog(false)}>Konfirmasi</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pilih Metode Pembayaran</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {[
              { id: "gopay", label: "GoPay", icon: "💚" },
              { id: "ovo", label: "OVO", icon: "💜" },
              { id: "dana", label: "DANA", icon: "💙" },
              { id: "bca", label: "Transfer BCA", icon: "🏦" },
            ].map((method) => (
              <button key={method.id} className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left" onClick={() => setShowPaymentDialog(false)}>
                <span className="text-xl">{method.icon}</span>
                <span className="font-medium">{method.label}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Toasts */}
      {showProductSuccess && (
        <div className="fixed bottom-4 right-4 bg-primary-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-5 w-5" />
          {productSuccessMessage}
        </div>
      )}
      {showProfileSuccess && (
        <div className="fixed bottom-4 right-4 bg-primary-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-5 w-5" />Profil berhasil diperbarui!
        </div>
      )}
      {showPasswordSuccess && (
        <div className="fixed bottom-4 right-4 bg-primary-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-5 w-5" />Password berhasil diubah!
        </div>
      )}
      {showTopUpSuccess && (
        <div className="fixed bottom-4 right-4 bg-primary-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-5 w-5" />Top up berhasil! Saldo akan masuk dalam 1x24 jam.
        </div>
      )}
      {showWithdrawSuccess && (
        <div className="fixed bottom-4 right-4 bg-primary-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-5 w-5" />Penarikan diajukan! Dana akan dikirim dalam 1x24 jam.
        </div>
      )}
    </div>
  )
}
