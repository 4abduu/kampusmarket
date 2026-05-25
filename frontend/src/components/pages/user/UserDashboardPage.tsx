"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  type User,
  // @mock-flagged
  // mockUsers,
  // mockAddresses,
  getFacultyName,
  ADMIN_FEE_PERCENTAGE,
  calculateAdminFee,
  calculateNetIncome,
  categories,
  serviceCategories,
} from "@/lib/mock-data";
import apiClient from "@/lib/api/client";
import { getInitialSellerProducts } from "@/components/pages/user/dashboard/seller-products";
import {
  formatTransactionDate,
  getTransactionIcon,
  getTransactionStatusBadge,
} from "@/components/pages/user/dashboard/transaction-ui";
import UserDashboardDialogs from "@/components/pages/user/dashboard/UserDashboardDialogs";
import UserDashboardOrdersTab from "@/components/pages/user/dashboard/UserDashboardOrdersTab";
import UserDashboardSettingsTab from "@/components/pages/user/dashboard/UserDashboardSettingsTab";
import UserDashboardOverviewTab from "@/components/pages/user/dashboard/UserDashboardOverviewTab";
import UserDashboardProductsTab from "@/components/pages/user/dashboard/UserDashboardProductsTab";
import UserDashboardWalletTab from "@/components/pages/user/dashboard/UserDashboardWalletTab";
import UserDashboardSidebar from "@/components/pages/user/dashboard/UserDashboardSidebar";
import {
  UserDashboardOverviewSkeleton,
  UserDashboardOverviewTabSkeleton,
  UserDashboardProductsTabSkeleton,
  UserDashboardOrdersTabSkeleton,
  UserDashboardSettingsSkeleton,
  UserDashboardWalletSkeleton,
} from "@/components/skeleton";
import { useDashboardProducts } from "@/components/pages/user/dashboard/useDashboardProducts";
import { useDashboardWallet } from "@/components/pages/user/dashboard/useDashboardWallet";
import { useDashboardSettings } from "@/components/pages/user/dashboard/useDashboardSettings";
import { useDashboardOrderActions } from "@/components/pages/user/dashboard/useDashboardOrderActions";

interface UserDashboardPageProps {
  onNavigate: (page: string, productId?: string) => void;
  onSellerProductCountChange?: (count: number) => void;
  currentUser?: User | null;
}

export default function UserDashboardPage({
  onNavigate,
  onSellerProductCountChange,
  currentUser: authUser,
}: UserDashboardPageProps) {
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const tabFromUrl = tab || "overview";
  
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  const [isLoading, setIsLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(authUser || null);
  const [ordersRefreshKey, setOrdersRefreshKey] = useState(0);
  const [dashboardStats, setDashboardStats] = useState<{
    totalSales: number;
    totalSold: number;
    rating: number;
    pendingOrders: number;
    walletBalance: number;
  } | null>(null);


  const handleOrderUpdated = () => {
    setOrdersRefreshKey((prev) => prev + 1);
  };

  const handleProfilePictureUpdate = (newAvatarUrl: string) => {
    setCurrentUser((prev) =>
      prev ? { ...prev, avatar: newAvatarUrl } : null
    );
  };

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    navigate(`/dashboard/${newTab}`);
  };

  const products = useDashboardProducts({
    initialProducts: getInitialSellerProducts(),
  });

  const wallet = useDashboardWallet({
    userId: currentUser?.id || "",
    initialBalance: currentUser?.walletBalance ?? authUser?.walletBalance ?? 0,
  });

  const settings = useDashboardSettings({
    currentUser: currentUser || { id: "", name: "", email: "", phone: "", bio: "", faculty: "" },
    initialAddresses: [], // @mock-flagged — addresses diload dari API /addresses di useDashboardSettings
  });

  const orderActions = useDashboardOrderActions({
    onOrderUpdated: handleOrderUpdated,
  });

  // Sync URL changes to activeTab state
  useEffect(() => {
    setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  useEffect(() => {
    setCurrentUser(authUser || null);
  }, [authUser]);

  useEffect(() => {
    setIsLoading(true);
    const timer = window.setTimeout(() => setIsLoading(false), 300);
    return () => window.clearTimeout(timer);
  }, [activeTab]);

  const fetchDashboardStats = async () => {
    if (!currentUser?.id) return;
    setStatsLoading(true);
    try {
      const res = await apiClient.get("/dashboard/stats");
      const data = res.data?.data ?? res.data;
      setDashboardStats({
        totalSales: data.total_sales ?? data.totalSales ?? 0,
        totalSold: data.total_sold ?? data.totalSold ?? 0,
        rating: data.rating ?? 4.8,
        pendingOrders: data.pending_orders ?? data.pendingOrders ?? 0,
        walletBalance: data.wallet_balance ?? currentUser.walletBalance ?? 0,
      });
    } catch {
      try {
        const profileRes = await apiClient.get("/profile");
        const profile = profileRes.data?.data ?? profileRes.data ?? {};
        setDashboardStats({
          totalSales: 0,
          totalSold: 0,
          rating: profile.rating ?? 4.8,
          pendingOrders: 0,
          walletBalance: profile.walletBalance ?? profile.wallet_balance ?? 0,
        });
      } catch {
        setDashboardStats({
          totalSales: 0,
          totalSold: 0,
          rating: 4.8,
          pendingOrders: 0,
          walletBalance: currentUser.walletBalance ?? 0,
        });
      }
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.id) {
      void fetchDashboardStats();
    }
  }, [currentUser?.id, ordersRefreshKey]);

  useEffect(() => {
    if (wallet.showTopUpSuccess || wallet.showWithdrawSuccess) {
      void fetchDashboardStats();
    }
  }, [wallet.showTopUpSuccess, wallet.showWithdrawSuccess]);

  useEffect(() => {
    onSellerProductCountChange?.(products.userProducts.length);
  }, [onSellerProductCountChange, products.userProducts.length]);

  const stats = {
    totalSales: dashboardStats?.totalSales ?? 0,
    netIncome: calculateNetIncome(dashboardStats?.totalSales ?? 0),
    adminFeeDeducted: calculateAdminFee(dashboardStats?.totalSales ?? 0),
    pendingOrders: dashboardStats?.pendingOrders ?? 0,
    activeProducts: products.userProducts.filter(
      (product) => product.stock > 0 && product.type === "barang",
    ).length,
    activeServices: products.userProducts.filter(
      (product) => product.type === "jasa",
    ).length,
    walletBalance: dashboardStats?.walletBalance ?? currentUser?.walletBalance ?? authUser?.walletBalance ?? 0,
    totalSold: dashboardStats?.totalSold ?? 0,
    rating: dashboardStats?.rating ?? currentUser?.rating ?? authUser?.rating ?? 4.8,
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      {
        variant: "default" | "secondary" | "destructive" | "outline";
        label: string;
      }
    > = {
      pending_payment: { variant: "outline", label: "Menunggu Pembayaran" },
      pending_meetup: { variant: "secondary", label: "Menunggu Ketemuan" },
      waiting_shipping_fee: { variant: "outline", label: "Menunggu Ongkir" },
      waiting_price: { variant: "outline", label: "Menunggu Harga" },
      waiting_confirmation: {
        variant: "outline",
        label: "Menunggu Konfirmasi",
      },
      processing: { variant: "default", label: "Diproses" },
      in_delivery: { variant: "default", label: "Dalam Pengiriman" },
      completed: { variant: "default", label: "Selesai" },
      cancelled: { variant: "destructive", label: "Dibatalkan" },
    };
    const config = statusConfig[status] || {
      variant: "outline",
      label: status,
    };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (activeTab === "overview" && isLoading) {
    return <UserDashboardOverviewSkeleton />
  }

  if (activeTab === "settings" && isLoading) {
    return <UserDashboardSettingsSkeleton />
  }

  if (activeTab === "wallet" && isLoading) {
    return <UserDashboardWalletSkeleton />
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          <UserDashboardSidebar
            currentUser={currentUser || { id: "", name: "", email: "", avatar: "", faculty: "" } as any}
            rating={stats.rating}
            activeTab={activeTab}
            setActiveTab={handleTabChange}
            getFacultyName={getFacultyName}
          />

          <main className="lg:col-span-3 space-y-6 min-w-0">
            {activeTab === "overview" && (
              isLoading ? (
                <UserDashboardOverviewTabSkeleton />
              ) : (
                <UserDashboardOverviewTab
                  onNavigate={onNavigate}
                  currentWalletBalance={wallet.currentBalance}
                  formatPrice={products.formatPrice}
                  stats={stats}
                  userProducts={products.userProducts}
                  formatPriceRange={products.formatPriceRange}
                  setShowWithdrawDialog={wallet.setShowWithdrawDialog}
                  setActiveTab={handleTabChange}
                  adminFeePercentage={ADMIN_FEE_PERCENTAGE}
                />
              )
            )}

            {activeTab === "products" &&
              (isLoading || products.isLoadingProducts ? (
                <UserDashboardProductsTabSkeleton />
              ) : (
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
                  setShowDeleteProductDialog={
                    products.setShowDeleteProductDialog
                  }
                />
              ))}

            {activeTab === "orders" && (
              isLoading ? (
                <UserDashboardOrdersTabSkeleton />
              ) : (
                <UserDashboardOrdersTab
                  key={`orders-tab-${ordersRefreshKey}`}
                  onNavigate={onNavigate}
                  formatPrice={products.formatPrice}
                  getStatusBadge={getStatusBadge}
                  setShowShippingDialog={orderActions.setShowShippingDialog}
                  handleOpenServicePriceDialog={
                    orderActions.handleOpenServicePriceDialog
                  }
                  setShowOrderConfirmDialog={
                    orderActions.setShowOrderConfirmDialog
                  }
                  handleRejectPrice={orderActions.handleRejectPrice}
                  handleAcceptPrice={orderActions.handleAcceptPrice}
                />
              )
            )}

            {activeTab === "wallet" && (
              <UserDashboardWalletTab
                showBalance={wallet.showBalance}
                setShowBalance={wallet.setShowBalance}
                currentWalletBalance={wallet.currentBalance}
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
                isLoadingStats={statsLoading}
              />
            )}

            {activeTab === "settings" && (
              isLoading ? (
                <UserDashboardSettingsSkeleton />
              ) : (
                <UserDashboardSettingsTab
                  currentUser={currentUser || { id: "", name: "", email: "", phone: "", bio: "", faculty: "" } as any}
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
                  isLoadingProfile={settings.isLoadingProfile}
                  profileError={settings.profileError}
                  isLoadingAddresses={settings.isLoadingAddresses}
                  addressError={settings.addressError}
                  showProfileSuccess={settings.showProfileSuccess}
                  onNavigate={onNavigate}
                  onProfilePictureUpdate={handleProfilePictureUpdate}
                />
              )
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
        isLoadingPassword={settings.isLoadingPassword}
        isSavingAddress={settings.isSavingAddress}
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
        currentWalletBalance={wallet.currentBalance}
        isBankLainnya={wallet.isBankLainnya}
        isEwalletLainnya={wallet.isEwalletLainnya}
        statsWalletBalance={wallet.currentBalance}
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
        handleSetShippingFee={orderActions.handleSetShippingFee}
        showProfileSuccess={settings.showProfileSuccess}
        showPasswordSuccess={settings.showPasswordSuccess}
        showTopUpSuccess={wallet.showTopUpSuccess}
        showWithdrawSuccess={wallet.showWithdrawSuccess}
      />
    </div>
  );
}
