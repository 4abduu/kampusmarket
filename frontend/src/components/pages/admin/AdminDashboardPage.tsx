"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Clock, LayoutDashboard } from "lucide-react";
import AdminOverviewTab from "@/components/pages/admin/overview/AdminOverviewTab";
import AdminUsersTab from "@/components/pages/admin/users/AdminUsersTab";
import AdminProductsTab from "@/components/pages/admin/products/AdminProductsTab";
import AdminCategoriesTab from "@/components/pages/admin/categories/AdminCategoriesTab";
import AdminFacultiesTab from "@/components/pages/admin/faculties/AdminFacultiesTab";
import AdminReportsTab from "@/components/pages/admin/reports/AdminReportsTab";
import AdminCancelRequestsTab from "@/components/pages/admin/cancel-requests/AdminCancelRequestsTab";
import AdminOrdersTab from "@/components/pages/admin/orders/AdminOrdersTab";
import AdminFinanceTab from "@/components/pages/admin/finance/AdminFinanceTab";
import AdminAddressesTab from "@/components/pages/admin/addresses/AdminAddressesTab";
import UserDialogs from "@/components/pages/admin/users/components/UserDialogs";
import ProductDialogs from "@/components/pages/admin/products/components/ProductDialogs";
import CategoryDialogs from "@/components/pages/admin/categories/components/CategoryDialogs";
import ReportDialogs from "@/components/pages/admin/reports/components/ReportDialogs";
import CancelRequestDialogs from "@/components/pages/admin/cancel-requests/components/CancelRequestDialogs";
import FacultyDialogs from "@/components/pages/admin/faculties/components/FacultyDialogs";
import { useAdminDashboardController } from "@/components/pages/admin/useAdminDashboardController";
import {
  AdminOverviewTabSkeleton,
  AdminUsersTabSkeleton,
  AdminProductsTabSkeleton,
  AdminCategoriesTabSkeleton,
  AdminFacultiesTabSkeleton,
  AdminReportsTabSkeleton,
  AdminFinanceTabSkeleton,
  AdminCancelRequestsTabSkeleton,
} from "@/components/skeleton/admin";

interface AdminDashboardPageProps {
  onNavigate: (page: string) => void;
}

export default function AdminDashboardPage({
  onNavigate: _onNavigate,
}: AdminDashboardPageProps) {
  const {
    activeTab,
    setActiveTab,
    successMessage,
    stats,
    revenueChartData,
    categoryChartData,
    withdrawals,
    platformRevenue,
    platformRevenueLoading,
    platformRevenueError,
    activitySummary,
    overviewLoading,
    usersLoading,
    productsLoading,
    categoriesLoading,
    facultiesLoading,
    reportsLoading,
    withdrawalsLoading,
    cancelRequestsLoading,
    filteredUsers,
    filteredProducts,
    filteredReports,
    filteredWithdrawals,
    filteredAddresses,
    addressesLoading,
    addressesError,
    loadAddressesData,
    filteredCategories,
    filteredFaculties,
    paginatedUsers,
    paginatedProducts,
    paginatedReports,
    paginatedWithdrawals,
    paginatedFaculties,
    userTotalItems,
    userTotalPages,
    productTotalItems,
    productTotalPages,
    productCategoryOptions,
    userPage,
    setUserPage,
    productPage,
    setProductPage,
    reportPage,
    setReportPage,
    withdrawalPage,
    setWithdrawalPage,
    orderPage,
    setOrderPage,
    facultyPage,
    setFacultyPage,
    showUserFilters,
    setShowUserFilters,
    showProductFilters,
    setShowProductFilters,
    showWithdrawalFilters,
    setShowWithdrawalFilters,
    showOrderFilters,
    setShowOrderFilters,
    userSearchTerm,
    setUserSearchTerm,
    userStatusFilter,
    setUserStatusFilter,
    userFacultyFilter,
    setUserFacultyFilter,
    productSearchTerm,
    setProductSearchTerm,
    productTypeFilter,
    setProductTypeFilter,
    productConditionFilter,
    setProductConditionFilter,
    productCategoryFilter,
    setProductCategoryFilter,
    productPriceMin,
    setProductPriceMin,
    productPriceMax,
    setProductPriceMax,
    productSellerFilter,
    setProductSellerFilter,
    withdrawalSearchTerm,
    setWithdrawalSearchTerm,
    withdrawalStatusFilter,
    setWithdrawalStatusFilter,
    withdrawalAccountTypeFilter,
    setWithdrawalAccountTypeFilter,
    withdrawalProviderFilter,
    setWithdrawalProviderFilter,
    addressSearchTerm,
    setAddressSearchTerm,
    orderSearchTerm,
    setOrderSearchTerm,
    orderStatusFilter,
    setOrderStatusFilter,
    orderTypeFilter,
    setOrderTypeFilter,
    orderCategoryFilter,
    setOrderCategoryFilter,
    orderPaymentFilter,
    setOrderPaymentFilter,
    reportSearchTerm,
    setReportSearchTerm,
    reportStatusFilter,
    setReportStatusFilter,
    categorySearchTerm,
    setCategorySearchTerm,
    categoryTypeFilter,
    setCategoryTypeFilter,
    facultySearchTerm,
    setFacultySearchTerm,
    facultyStatusFilter,
    setFacultyStatusFilter,
    financeSubTab,
    setFinanceSubTab,
    topups,
    topupLoading,
    topupError,
    topupSearchTerm,
    setTopupSearchTerm,
    topupStatusFilter,
    setTopupStatusFilter,
    topupPage,
    setTopupPage,
    topupTotalItems,
    topupTotalPages,
    topupStats,
    debts,
    debtsLoading,
    debtsError,
    debtSearchTerm,
    setDebtSearchTerm,
    debtStatusFilter,
    setDebtStatusFilter,
    debtPage,
    setDebtPage,
    debtTotalItems,
    debtTotalPages,
    debtStats,
    showUserDetail,
    setShowUserDetail,
    selectedUser,
    userDetailLoading,
    userDetailError,
    showBanDialog,
    setShowBanDialog,
    showUnbanDialog,
    setShowUnbanDialog,
    userToAction,
    banReason,
    setBanReason,
    unbanReason,
    setUnbanReason,
    showProductDetail,
    setShowProductDetail,
    selectedProduct,
    productDetailLoading,
    productDetailError,
    showDeleteProductDialog,
    setShowDeleteProductDialog,
    productToDelete,
    productDeleteReason,
    setProductDeleteReason,
    showWarningDialog,
    setShowWarningDialog,
    showBanReportDialog,
    setShowBanReportDialog,
    banReportReason,
    setBanReportReason,
    showResolveReportDialog,
    setShowResolveReportDialog,
    showDismissReportDialog,
    setShowDismissReportDialog,
    confirmResolveReport,
    confirmDismissReport,
    selectedReport,
    financialModalOpen,
    setFinancialModalOpen,
    financialModalVariant,
    setFinancialModalVariant,
    financialLoading,
    financialError,
    selectedWithdrawal,
    revenueModalOpen,
    setRevenueModalOpen,
    selectedRevenueTransaction,
    showCategoryDialog,
    cancelRequestRoleFilter,
    setCancelRequestRoleFilter,
    cancelRequestSearchTerm,
    setCancelRequestSearchTerm,
    filteredCancelRequests,
    paginatedCancelRequests,
    cancelRequestPage,
    setCancelRequestPage,
    setShowCategoryDialog,
    selectedCategory,
    categoryForm,
    setCategoryForm,
    showDeleteCategoryDialog,
    setShowDeleteCategoryDialog,
    categoryToDelete,
    categories,
    showCancelApproveDialog,
    setShowCancelApproveDialog,
    showCancelRejectDialog,
    setShowCancelRejectDialog,
    selectedCancelRequest,
    cancelApproveNotes,
    setCancelApproveNotes,
    cancelRejectReasonInput,
    setCancelRejectReasonInput,
    showFacultyDialog,
    setShowFacultyDialog,
    selectedFaculty,
    facultyForm,
    setFacultyForm,
    showDeleteFacultyDialog,
    setShowDeleteFacultyDialog,
    facultyToDelete,
    facultyAccentClass,
    getTotalPages,
    renderPagination,
    formatPrice,
    formatProductPrice,
    getReportStatusBadge,
    getWithdrawalStatusBadge,
    getOrderStatusBadge,
    getPaymentStatusBadge,
    getInitials,
    getFacultyName,
    cancelReasons,
    handleViewUser,
    handleBanUser,
    handleUnbanUser,
    confirmBanUser,
    confirmUnbanUser,
    handleViewProduct,
    handleDeleteProduct,
    confirmDeleteProduct,
    handleSendWarning,
    handleBanFromReport,
    handleResolveReport,
    handleDismissReport,
    confirmSendWarning,
    confirmBanFromReport,
    handleApproveWithdrawal,
    handleProcessWithdrawal,
    handleCompleteWithdrawal,
    confirmApproveWithdrawal,
    confirmRejectWithdrawal,
    confirmCompleteWithdrawal,
    confirmFailWithdrawal,
    handleViewWithdrawal,
    handleViewRevenueTransaction,
    handleAddCategory,
    handleEditCategory,
    handleSaveCategory,
    handleDeleteCategory,
    confirmDeleteCategory,
    handleToggleCategoryActive,
    handleApproveCancelRequest,
    handleRejectCancelRequest,
    confirmApproveCancelRequest,
    confirmRejectCancelRequest,
    handleAddFaculty,
    handleEditFaculty,
    handleSaveFaculty,
    handleDeleteFaculty,
    confirmDeleteFaculty,
    handleToggleFacultyActive,
    handleRestoreProduct,
    lastUpdatedAt,
    orders,
    ordersLoading,
    orderTotalItems,
    orderTotalPages,
  } = useAdminDashboardController();

  const formatLastUpdated = (date: Date) => {
    if (!date) return "Belum diupdate";
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const timeString = date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    if (isToday) {
      return `Hari ini, ${timeString}`;
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Kemarin, ${timeString}`;
    }

    const dateString = date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return `${dateString}, ${timeString}`;
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 flex-1">
      <div className="container mx-auto px-4 py-8">
        {successMessage && (
          <div className="fixed top-4 right-4 z-50 animate-in fade-in-0 slide-in-from-top-2">
            <Card className="bg-primary-50 dark:bg-primary-900/30 border-primary-200 dark:border-primary-800 shadow-lg">
              <CardContent className="p-4 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary-600" />
                <p className="text-sm font-medium text-primary-700 dark:text-primary-300">
                  {successMessage}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <LayoutDashboard className="h-8 w-8 text-primary-600" />
              Dashboard Admin
            </h1>
            <p className="text-muted-foreground">
              Moderasi & Mediator Keuangan KampusMarket
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              Terakhir update: {formatLastUpdated(lastUpdatedAt)}
            </Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 flex-wrap">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User</TabsTrigger>
            <TabsTrigger value="products">Produk</TabsTrigger>
            <TabsTrigger value="categories">Kategori</TabsTrigger>
            <TabsTrigger value="faculties">Fakultas</TabsTrigger>
            <TabsTrigger value="reports">Laporan</TabsTrigger>
            <TabsTrigger value="cancel-requests">Pembatalan</TabsTrigger>
            <TabsTrigger value="orders">Transaksi</TabsTrigger>
            <TabsTrigger value="finance">Keuangan</TabsTrigger>
            <TabsTrigger value="addresses">Alamat</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 py-2">
            {overviewLoading ? (
              <AdminOverviewTabSkeleton />
            ) : (
              <AdminOverviewTab
                stats={stats}
                activitySummary={activitySummary}
                revenueChartData={revenueChartData}
                categoryChartData={categoryChartData}
                formatPrice={formatPrice}
                onOpenTab={setActiveTab}
              />
            )}
          </TabsContent>
          <TabsContent value="users" className="space-y-6 py-2">
            {usersLoading ? (
              <AdminUsersTabSkeleton />
            ) : (
              <AdminUsersTab
                filteredUsers={filteredUsers}
                paginatedUsers={paginatedUsers}
                totalUsers={userTotalItems}
                totalPages={userTotalPages}
                currentPage={userPage}
                showUserFilters={showUserFilters}
                setShowUserFilters={setShowUserFilters}
                userSearchTerm={userSearchTerm}
                setUserSearchTerm={setUserSearchTerm}
                userStatusFilter={userStatusFilter}
                setUserStatusFilter={setUserStatusFilter}
                userFacultyFilter={userFacultyFilter}
                setUserFacultyFilter={setUserFacultyFilter}
                setUserPage={setUserPage}
                renderPagination={renderPagination}
                getInitials={getInitials}
                getFacultyName={getFacultyName}
                handleViewUser={handleViewUser}
                handleBanUser={handleBanUser}
                handleUnbanUser={handleUnbanUser}
              />
            )}
          </TabsContent>
          <TabsContent value="products" className="space-y-6 py-2">
            {productsLoading ? (
              <AdminProductsTabSkeleton />
            ) : (
              <AdminProductsTab
                filteredProducts={filteredProducts}
                paginatedProducts={paginatedProducts}
                totalProducts={productTotalItems}
                totalPages={productTotalPages}
                currentPage={productPage}
                showProductFilters={showProductFilters}
                setShowProductFilters={setShowProductFilters}
                productSearchTerm={productSearchTerm}
                setProductSearchTerm={setProductSearchTerm}
                productTypeFilter={productTypeFilter}
                setProductTypeFilter={setProductTypeFilter}
                productConditionFilter={productConditionFilter}
                setProductConditionFilter={setProductConditionFilter}
                productCategoryFilter={productCategoryFilter}
                setProductCategoryFilter={setProductCategoryFilter}
                productPriceMin={productPriceMin}
                setProductPriceMin={setProductPriceMin}
                productPriceMax={productPriceMax}
                setProductPriceMax={setProductPriceMax}
                productSellerFilter={productSellerFilter}
                setProductSellerFilter={setProductSellerFilter}
                productCategoryOptions={productCategoryOptions}
                setProductPage={setProductPage}
                getTotalPages={getTotalPages}
                renderPagination={renderPagination}
                formatProductPrice={formatProductPrice}
                handleViewProduct={handleViewProduct}
                handleDeleteProduct={handleDeleteProduct}
                handleRestoreProduct={handleRestoreProduct}
              />
            )}
          </TabsContent>
          <TabsContent value="categories" className="space-y-6 py-2">
            {categoriesLoading ? (
              <AdminCategoriesTabSkeleton />
            ) : (
              <AdminCategoriesTab
                filteredCategories={filteredCategories}
                categorySearchTerm={categorySearchTerm}
                setCategorySearchTerm={setCategorySearchTerm}
                categoryTypeFilter={categoryTypeFilter}
                setCategoryTypeFilter={setCategoryTypeFilter}
                handleAddCategory={handleAddCategory}
                handleEditCategory={handleEditCategory}
                handleDeleteCategory={handleDeleteCategory}
                handleToggleCategoryActive={handleToggleCategoryActive}
              />
            )}
          </TabsContent>
          <TabsContent value="faculties" className="space-y-6 py-2">
            {facultiesLoading ? (
              <AdminFacultiesTabSkeleton />
            ) : (
              <AdminFacultiesTab
                stats={stats}
                filteredFaculties={filteredFaculties}
                paginatedFaculties={paginatedFaculties}
                currentPage={facultyPage}
                facultySearchTerm={facultySearchTerm}
                setFacultySearchTerm={setFacultySearchTerm}
                facultyStatusFilter={facultyStatusFilter}
                setFacultyStatusFilter={setFacultyStatusFilter}
                setFacultyPage={setFacultyPage}
                getTotalPages={getTotalPages}
                renderPagination={renderPagination}
                facultyAccentClass={facultyAccentClass}
                getInitials={getInitials}
                handleAddFaculty={handleAddFaculty}
                handleEditFaculty={handleEditFaculty}
                handleToggleFacultyActive={handleToggleFacultyActive}
                handleDeleteFaculty={handleDeleteFaculty}
              />
            )}
          </TabsContent>
          <TabsContent value="reports" className="space-y-6 py-2">
            {reportsLoading ? (
              <AdminReportsTabSkeleton />
            ) : (
              <AdminReportsTab
                filteredReports={filteredReports}
                paginatedReports={paginatedReports}
                currentPage={reportPage}
                totalPages={getTotalPages(filteredReports.length)}
                reportSearchTerm={reportSearchTerm}
                setReportSearchTerm={setReportSearchTerm}
                reportStatusFilter={reportStatusFilter}
                setReportStatusFilter={setReportStatusFilter}
                setReportPage={setReportPage}
                renderPagination={renderPagination}
                getReportStatusBadge={getReportStatusBadge}
                handleSendWarning={handleSendWarning}
                handleBanFromReport={handleBanFromReport}
                handleResolveReport={handleResolveReport}
                handleDismissReport={handleDismissReport}
              />
            )}
          </TabsContent>
          <TabsContent value="cancel-requests" className="space-y-6 py-2">
            {cancelRequestsLoading ? (
              <AdminCancelRequestsTabSkeleton />
            ) : (
              <AdminCancelRequestsTab
                cancelRequests={filteredCancelRequests}
                paginatedCancelRequests={paginatedCancelRequests}
                cancelRequestRoleFilter={cancelRequestRoleFilter}
                setCancelRequestRoleFilter={setCancelRequestRoleFilter}
                cancelRequestSearchTerm={cancelRequestSearchTerm}
                setCancelRequestSearchTerm={setCancelRequestSearchTerm}
                formatPrice={formatPrice}
                handleApproveCancelRequest={handleApproveCancelRequest}
                handleRejectCancelRequest={handleRejectCancelRequest}
                currentPage={cancelRequestPage}
                setCancelRequestPage={setCancelRequestPage}
                getTotalPages={getTotalPages}
                renderPagination={renderPagination}
              />
            )}
          </TabsContent>
          <TabsContent value="orders" className="space-y-6 py-2">
            <AdminOrdersTab
              orders={orders}
              currentPage={orderPage}
              totalOrders={orderTotalItems}
              totalPages={orderTotalPages}
              isLoading={ordersLoading}
              orderSearchTerm={orderSearchTerm}
              setOrderSearchTerm={setOrderSearchTerm}
              orderStatusFilter={orderStatusFilter}
              setOrderStatusFilter={setOrderStatusFilter}
              orderTypeFilter={orderTypeFilter}
              setOrderTypeFilter={setOrderTypeFilter}
              orderCategoryFilter={orderCategoryFilter}
              setOrderCategoryFilter={setOrderCategoryFilter}
              orderPaymentFilter={orderPaymentFilter}
              setOrderPaymentFilter={setOrderPaymentFilter}
              showOrderFilters={showOrderFilters}
              setShowOrderFilters={setShowOrderFilters}
              setOrderPage={setOrderPage}
              renderPagination={renderPagination}
              getInitials={getInitials}
              formatPrice={formatPrice}
              getOrderStatusBadge={getOrderStatusBadge}
              getPaymentStatusBadge={getPaymentStatusBadge}
              handleViewUser={handleViewUser}
              handleViewProduct={handleViewProduct}
            />
          </TabsContent>
          <TabsContent value="finance" className="space-y-6 py-2">
            {withdrawalsLoading ? (
              <AdminFinanceTabSkeleton />
            ) : (
              <AdminFinanceTab
                financeSubTab={financeSubTab}
                setFinanceSubTab={setFinanceSubTab}
                withdrawals={withdrawals}
                filteredWithdrawals={filteredWithdrawals}
                paginatedWithdrawals={paginatedWithdrawals}
                currentPage={withdrawalPage}
                showWithdrawalFilters={showWithdrawalFilters}
                setShowWithdrawalFilters={setShowWithdrawalFilters}
                withdrawalSearchTerm={withdrawalSearchTerm}
                setWithdrawalSearchTerm={setWithdrawalSearchTerm}
                withdrawalStatusFilter={withdrawalStatusFilter}
                setWithdrawalStatusFilter={setWithdrawalStatusFilter}
                withdrawalAccountTypeFilter={withdrawalAccountTypeFilter}
                setWithdrawalAccountTypeFilter={setWithdrawalAccountTypeFilter}
                withdrawalProviderFilter={withdrawalProviderFilter}
                setWithdrawalProviderFilter={setWithdrawalProviderFilter}
                setWithdrawalPage={setWithdrawalPage}
                getTotalPages={getTotalPages}
                renderPagination={renderPagination}
                formatPrice={formatPrice}
                stats={stats}
                platformRevenue={platformRevenue}
                platformRevenueLoading={platformRevenueLoading}
                platformRevenueError={platformRevenueError}
                getWithdrawalStatusBadge={getWithdrawalStatusBadge}
                getInitials={getInitials}
                handleApproveWithdrawal={handleApproveWithdrawal}
                handleProcessWithdrawal={handleProcessWithdrawal}
                handleCompleteWithdrawal={handleCompleteWithdrawal}
                financialModalOpen={financialModalOpen}
                setFinancialModalOpen={setFinancialModalOpen}
                financialModalVariant={financialModalVariant}
                setFinancialModalVariant={setFinancialModalVariant}
                financialLoading={financialLoading}
                financialError={financialError}
                selectedWithdrawal={selectedWithdrawal}
                handleViewWithdrawal={handleViewWithdrawal}
                revenueModalOpen={revenueModalOpen}
                setRevenueModalOpen={setRevenueModalOpen}
                selectedRevenueTransaction={selectedRevenueTransaction}
                handleViewRevenueTransaction={handleViewRevenueTransaction}
                confirmApproveWithdrawal={confirmApproveWithdrawal}
                confirmRejectWithdrawal={confirmRejectWithdrawal}
                confirmCompleteWithdrawal={confirmCompleteWithdrawal}
                confirmFailWithdrawal={confirmFailWithdrawal}
                // New Top Up Props
                topups={topups}
                topupLoading={topupLoading}
                topupError={topupError}
                topupSearchTerm={topupSearchTerm}
                setTopupSearchTerm={setTopupSearchTerm}
                topupStatusFilter={topupStatusFilter}
                setTopupStatusFilter={setTopupStatusFilter}
                topupPage={topupPage}
                setTopupPage={setTopupPage}
                topupTotalPages={topupTotalPages}
                topupStats={topupStats}
                topupTotalItems={topupTotalItems}
                // Debts Props
                debts={debts}
                debtsLoading={debtsLoading}
                debtsError={debtsError}
                debtSearchTerm={debtSearchTerm}
                setDebtSearchTerm={setDebtSearchTerm}
                debtStatusFilter={debtStatusFilter}
                setDebtStatusFilter={setDebtStatusFilter}
                debtPage={debtPage}
                setDebtPage={setDebtPage}
                debtTotalItems={debtTotalItems}
                debtTotalPages={debtTotalPages}
                debtStats={debtStats}
              />
            )}
          </TabsContent>
          <TabsContent value="addresses" className="space-y-6 py-2">
            <AdminAddressesTab
              filteredAddresses={filteredAddresses}
              addressSearchTerm={addressSearchTerm}
              setAddressSearchTerm={setAddressSearchTerm}
              getInitials={getInitials}
              isLoading={addressesLoading}
              error={addressesError}
              onRetry={loadAddressesData}
            />
          </TabsContent>
        </Tabs>
      </div>

      <UserDialogs
        showUserDetail={showUserDetail}
        setShowUserDetail={setShowUserDetail}
        selectedUser={selectedUser}
        userDetailLoading={userDetailLoading}
        userDetailError={userDetailError}
        showBanDialog={showBanDialog}
        setShowBanDialog={setShowBanDialog}
        showUnbanDialog={showUnbanDialog}
        setShowUnbanDialog={setShowUnbanDialog}
        userToAction={userToAction}
        banReason={banReason}
        setBanReason={setBanReason}
        unbanReason={unbanReason}
        setUnbanReason={setUnbanReason}
        confirmBanUser={confirmBanUser}
        confirmUnbanUser={confirmUnbanUser}
        getFacultyName={getFacultyName}
        getInitials={getInitials}
      />

      <ProductDialogs
        showProductDetail={showProductDetail}
        setShowProductDetail={setShowProductDetail}
        selectedProduct={selectedProduct}
        productDetailLoading={productDetailLoading}
        productDetailError={productDetailError}
        showDeleteProductDialog={showDeleteProductDialog}
        setShowDeleteProductDialog={setShowDeleteProductDialog}
        productToDelete={productToDelete}
        productDeleteReason={productDeleteReason}
        setProductDeleteReason={setProductDeleteReason}
        confirmDeleteProduct={confirmDeleteProduct}
        formatProductPrice={formatProductPrice}
        getInitials={getInitials}
      />

      <CategoryDialogs
        showCategoryDialog={showCategoryDialog}
        setShowCategoryDialog={setShowCategoryDialog}
        selectedCategory={selectedCategory}
        categoryForm={categoryForm}
        setCategoryForm={setCategoryForm}
        handleSaveCategory={handleSaveCategory}
        categories={categories}
        showDeleteCategoryDialog={showDeleteCategoryDialog}
        setShowDeleteCategoryDialog={setShowDeleteCategoryDialog}
        categoryToDelete={categoryToDelete}
        confirmDeleteCategory={confirmDeleteCategory}
      />

      <ReportDialogs
        showWarningDialog={showWarningDialog}
        setShowWarningDialog={setShowWarningDialog}
        showBanReportDialog={showBanReportDialog}
        setShowBanReportDialog={setShowBanReportDialog}
        banReportReason={banReportReason}
        setBanReportReason={setBanReportReason}
        selectedReport={selectedReport}
        confirmSendWarning={confirmSendWarning}
        confirmBanFromReport={confirmBanFromReport}
        showResolveReportDialog={showResolveReportDialog}
        setShowResolveReportDialog={setShowResolveReportDialog}
        showDismissReportDialog={showDismissReportDialog}
        setShowDismissReportDialog={setShowDismissReportDialog}
        confirmResolveReport={confirmResolveReport}
        confirmDismissReport={confirmDismissReport}
      />

      <CancelRequestDialogs
        showCancelApproveDialog={showCancelApproveDialog}
        setShowCancelApproveDialog={setShowCancelApproveDialog}
        showCancelRejectDialog={showCancelRejectDialog}
        setShowCancelRejectDialog={setShowCancelRejectDialog}
        selectedCancelRequest={selectedCancelRequest}
        cancelApproveNotes={cancelApproveNotes}
        setCancelApproveNotes={setCancelApproveNotes}
        cancelRejectReasonInput={cancelRejectReasonInput}
        setCancelRejectReasonInput={setCancelRejectReasonInput}
        confirmApproveCancelRequest={confirmApproveCancelRequest}
        confirmRejectCancelRequest={confirmRejectCancelRequest}
        formatPrice={formatPrice}
        cancelReasons={cancelReasons}
      />

      <FacultyDialogs
        showFacultyDialog={showFacultyDialog}
        setShowFacultyDialog={setShowFacultyDialog}
        selectedFaculty={selectedFaculty}
        facultyForm={facultyForm}
        setFacultyForm={setFacultyForm}
        handleSaveFaculty={handleSaveFaculty}
        showDeleteFacultyDialog={showDeleteFacultyDialog}
        setShowDeleteFacultyDialog={setShowDeleteFacultyDialog}
        facultyToDelete={facultyToDelete}
        confirmDeleteFaculty={confirmDeleteFaculty}
        facultyAccentClass={facultyAccentClass}
        getInitials={getInitials}
      />
    </div>
  );
}
