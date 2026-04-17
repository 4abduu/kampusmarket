"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import {
  type User,
  mockUsers,
  mockAddresses,
  getFacultyName,
  ADMIN_FEE_PERCENTAGE,
  calculateAdminFee,
  calculateNetIncome,
  categories,
  serviceCategories,
} from "@/lib/mock-data"
import { getDashboardTabFromPage } from "@/components/pages/user/dashboard/constants"
import { getInitialSellerProducts } from "@/components/pages/user/dashboard/seller-products"
import { formatTransactionDate, getTransactionIcon, getTransactionStatusBadge } from "@/components/pages/user/dashboard/transaction-ui"
import UserDashboardDialogs from "@/components/pages/user/dashboard/UserDashboardDialogs"
import UserDashboardOrdersTab from "@/components/pages/user/dashboard/UserDashboardOrdersTab"
import UserDashboardSettingsTab from "@/components/pages/user/dashboard/UserDashboardSettingsTab"
import UserDashboardOverviewTab from "@/components/pages/user/dashboard/UserDashboardOverviewTab"
import UserDashboardProductsTab from "@/components/pages/user/dashboard/UserDashboardProductsTab"
import UserDashboardWalletTab from "@/components/pages/user/dashboard/UserDashboardWalletTab"
import UserDashboardSidebar from "@/components/pages/user/dashboard/UserDashboardSidebar"
import { useDashboardProducts } from "@/components/pages/user/dashboard/useDashboardProducts"
import { useDashboardWallet } from "@/components/pages/user/dashboard/useDashboardWallet"
import { useDashboardSettings } from "@/components/pages/user/dashboard/useDashboardSettings"
import { useDashboardOrderActions } from "@/components/pages/user/dashboard/useDashboardOrderActions"

interface UserDashboardPageProps {
  onNavigate: (page: string, productId?: string) => void
  currentPage?: string
  onSellerProductCountChange?: (count: number) => void
  currentUser?: User | null
}

export default function UserDashboardPage({
  onNavigate,
  currentPage = "dashboard",
  onSellerProductCountChange,
  currentUser: authUser,
}: UserDashboardPageProps) {
  const [activeTab, setActiveTab] = useState(() => getDashboardTabFromPage(currentPage))

  useEffect(() => {
    setActiveTab(getDashboardTabFromPage(currentPage))
  }, [currentPage])

  const currentUser = authUser || mockUsers[0]

  const products = useDashboardProducts({
    initialProducts: getInitialSellerProducts(),
  })

  const wallet = useDashboardWallet({
    userId: currentUser.id,
  })

  const settings = useDashboardSettings({
    currentUser,
    initialAddresses: mockAddresses,
  })

  const orderActions = useDashboardOrderActions()

  useEffect(() => {
    onSellerProductCountChange?.(products.userProducts.length)
  }, [onSellerProductCountChange, products.userProducts.length])

  const stats = {
    totalSales: 2450000,
    netIncome: calculateNetIncome(2450000),
    adminFeeDeducted: calculateAdminFee(2450000),
    pendingOrders: 3,
    activeProducts: products.userProducts.filter((product) => product.stock > 0 && product.type === "barang").length,
    activeServices: products.userProducts.filter((product) => product.type === "jasa").length,
    walletBalance: 250000,
    totalSold: 28,
    rating: 4.8,
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

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          <UserDashboardSidebar
            currentUser={currentUser}
            rating={stats.rating}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            getFacultyName={getFacultyName}
          />

          <main className="lg:col-span-3 space-y-6">
            {activeTab === "overview" && (
              <UserDashboardOverviewTab
                onNavigate={onNavigate}
                currentWalletBalance={currentUser.walletBalance || 0}
                formatPrice={products.formatPrice}
                stats={stats}
                userProducts={products.userProducts}
                formatPriceRange={products.formatPriceRange}
                setShowWithdrawDialog={wallet.setShowWithdrawDialog}
                setActiveTab={setActiveTab}
                adminFeePercentage={ADMIN_FEE_PERCENTAGE}
              />
            )}

            {activeTab === "products" && (
              <UserDashboardProductsTab
                onNavigate={onNavigate}
                productFilter={products.productFilter}
                setProductFilter={products.setProductFilter}
                userProducts={products.userProducts}
                filteredProducts={products.filteredProducts}
                formatPriceRange={products.formatPriceRange}
                formatPrice={products.formatPrice}
                handleEditProduct={products.handleEditProduct}
                setProductToDelete={products.setProductToDelete}
                setShowDeleteProductDialog={products.setShowDeleteProductDialog}
              />
            )}

            {activeTab === "orders" && (
              <UserDashboardOrdersTab
                onNavigate={onNavigate}
                formatPrice={products.formatPrice}
                getStatusBadge={getStatusBadge}
                setShowShippingDialog={orderActions.setShowShippingDialog}
                handleOpenServicePriceDialog={orderActions.handleOpenServicePriceDialog}
                setShowOrderConfirmDialog={orderActions.setShowOrderConfirmDialog}
                handleRejectPrice={orderActions.handleRejectPrice}
                handleAcceptPrice={orderActions.handleAcceptPrice}
              />
            )}

            {activeTab === "wallet" && (
              <UserDashboardWalletTab
                showBalance={wallet.showBalance}
                setShowBalance={wallet.setShowBalance}
                currentWalletBalance={currentUser.walletBalance || 0}
                totalIncome={wallet.totalIncome}
                totalExpense={wallet.totalExpense}
                setShowTopUpDialog={wallet.setShowTopUpDialog}
                setShowWithdrawDialog={wallet.setShowWithdrawDialog}
                stats={stats}
                adminFeePercentage={ADMIN_FEE_PERCENTAGE}
                formatPrice={products.formatPrice}
                filteredTransactions={wallet.filteredTransactions}
                paginatedTransactions={wallet.paginatedTransactions}
                transactionSearchTerm={wallet.transactionSearchTerm}
                setTransactionSearchTerm={wallet.setTransactionSearchTerm}
                transactionTypeFilter={wallet.transactionTypeFilter}
                setTransactionTypeFilter={wallet.setTransactionTypeFilter}
                transactionStatusFilter={wallet.transactionStatusFilter}
                setTransactionStatusFilter={wallet.setTransactionStatusFilter}
                showTransactionFilters={wallet.showTransactionFilters}
                setShowTransactionFilters={wallet.setShowTransactionFilters}
                transactionPage={wallet.transactionPage}
                setTransactionPage={wallet.setTransactionPage}
                totalTransactionPages={wallet.totalTransactionPages}
                getTransactionIcon={getTransactionIcon}
                getTransactionStatusBadge={getTransactionStatusBadge}
                formatTransactionDate={formatTransactionDate}
                transactionTypeLabels={{
                  top_up: { label: "Top Up" },
                  withdrawal: { label: "Penarikan" },
                  payment: { label: "Pembayaran" },
                  refund: { label: "Refund" },
                  income: { label: "Pendapatan" },
                  admin_fee: { label: "Biaya Admin" },
                }}
              />
            )}

            {activeTab === "settings" && (
              <UserDashboardSettingsTab
                currentUser={currentUser}
                profileForm={settings.profileForm}
                setProfileForm={settings.setProfileForm}
                handleSaveProfile={settings.handleSaveProfile}
                setShowPasswordDialog={settings.setShowPasswordDialog}
                handleAddAddress={settings.handleAddAddress}
                addresses={settings.addresses}
                handleEditAddress={settings.handleEditAddress}
                setAddressToDelete={settings.setAddressToDelete}
                setShowDeleteAddressDialog={settings.setShowDeleteAddressDialog}
                getFacultyName={getFacultyName}
              />
            )}
          </main>
        </div>
      </div>

      <UserDashboardDialogs
        showEditProductDialog={products.showEditProductDialog}
        setShowEditProductDialog={products.setShowEditProductDialog}
        editingProduct={products.editingProduct}
        setEditingProduct={products.setEditingProduct}
        handleSaveProduct={products.handleSaveProduct}
        categories={categories}
        serviceCategories={serviceCategories}
        showDeleteProductDialog={products.showDeleteProductDialog}
        setShowDeleteProductDialog={products.setShowDeleteProductDialog}
        userProducts={products.userProducts}
        productToDelete={products.productToDelete}
        handleDeleteProduct={products.handleDeleteProduct}
        showAddressDialog={settings.showAddressDialog}
        setShowAddressDialog={settings.setShowAddressDialog}
        editingAddress={settings.editingAddress}
        addressForm={settings.addressForm}
        setAddressForm={settings.setAddressForm}
        handleSaveAddress={settings.handleSaveAddress}
        showDeleteAddressDialog={settings.showDeleteAddressDialog}
        setShowDeleteAddressDialog={settings.setShowDeleteAddressDialog}
        handleDeleteAddress={settings.handleDeleteAddress}
        showPasswordDialog={settings.showPasswordDialog}
        setShowPasswordDialog={settings.setShowPasswordDialog}
        showCurrentPassword={settings.showCurrentPassword}
        setShowCurrentPassword={settings.setShowCurrentPassword}
        showNewPassword={settings.showNewPassword}
        setShowNewPassword={settings.setShowNewPassword}
        showConfirmPassword={settings.showConfirmPassword}
        setShowConfirmPassword={settings.setShowConfirmPassword}
        passwordForm={settings.passwordForm}
        setPasswordForm={settings.setPasswordForm}
        passwordValidations={settings.passwordValidations}
        isPasswordValid={settings.isPasswordValid}
        passwordError={settings.passwordError}
        handleChangePassword={settings.handleChangePassword}
        showTopUpDialog={wallet.showTopUpDialog}
        setShowTopUpDialog={wallet.setShowTopUpDialog}
        quickAmounts={wallet.quickAmounts}
        topUpAmount={wallet.topUpAmount}
        setTopUpAmount={wallet.setTopUpAmount}
        formatPrice={products.formatPrice}
        handleTopUp={wallet.handleTopUp}
        showWithdrawDialog={wallet.showWithdrawDialog}
        setShowWithdrawDialog={wallet.setShowWithdrawDialog}
        withdrawForm={wallet.withdrawForm}
        setWithdrawForm={wallet.setWithdrawForm}
        currentWalletBalance={currentUser.walletBalance || 0}
        isBankLainnya={wallet.isBankLainnya}
        isEwalletLainnya={wallet.isEwalletLainnya}
        statsWalletBalance={stats.walletBalance}
        handleWithdraw={wallet.handleWithdraw}
        showShippingDialog={orderActions.showShippingDialog}
        setShowShippingDialog={orderActions.setShowShippingDialog}
        shippingFee={orderActions.shippingFee}
        setShippingFee={orderActions.setShippingFee}
        showServicePriceDialog={orderActions.showServicePriceDialog}
        setShowServicePriceDialog={orderActions.setShowServicePriceDialog}
        selectedServiceOrder={orderActions.selectedServiceOrder}
        servicePriceForm={orderActions.servicePriceForm}
        setServicePriceForm={orderActions.setServicePriceForm}
        handleSubmitServicePrice={orderActions.handleSubmitServicePrice}
        showOrderConfirmDialog={orderActions.showOrderConfirmDialog}
        setShowOrderConfirmDialog={orderActions.setShowOrderConfirmDialog}
        showPaymentDialog={orderActions.showPaymentDialog}
        setShowPaymentDialog={orderActions.setShowPaymentDialog}
        paymentRequest={orderActions.paymentRequest}
        handlePayWithWallet={orderActions.handlePayWithWallet}
        handlePayWithMidtrans={orderActions.handlePayWithMidtrans}
        showProductSuccess={products.showProductSuccess}
        productSuccessMessage={products.productSuccessMessage}
        showProfileSuccess={settings.showProfileSuccess}
        showPasswordSuccess={settings.showPasswordSuccess}
        showTopUpSuccess={wallet.showTopUpSuccess}
        showWithdrawSuccess={wallet.showWithdrawSuccess}
      />
    </div>
  )
}
