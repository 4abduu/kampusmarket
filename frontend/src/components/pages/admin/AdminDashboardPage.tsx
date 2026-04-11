"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2,
  Clock,
  LayoutDashboard,
} from "lucide-react";
import AdminOverviewTab from "@/components/pages/admin/AdminOverviewTab";
import AdminUsersTab from "@/components/pages/admin/AdminUsersTab";
import AdminProductsTab from "@/components/pages/admin/AdminProductsTab";
import AdminCategoriesTab from "@/components/pages/admin/AdminCategoriesTab";
import AdminFacultiesTab from "@/components/pages/admin/AdminFacultiesTab";
import AdminFacultyDialogs from "@/components/pages/admin/AdminFacultyDialogs";
import AdminReportsTab from "@/components/pages/admin/AdminReportsTab";
import AdminCancelRequestsTab from "@/components/pages/admin/AdminCancelRequestsTab";
import AdminOrdersTab from "@/components/pages/admin/AdminOrdersTab";
import AdminFinanceTab from "@/components/pages/admin/AdminFinanceTab";
import AdminAddressesTab from "@/components/pages/admin/AdminAddressesTab";
import AdminActionDialogs from "@/components/pages/admin/AdminActionDialogs";
import { useAdminDashboardController } from "@/components/pages/admin/useAdminDashboardController";

interface AdminDashboardPageProps {
  onNavigate: (page: string) => void;
}

export default function AdminDashboardPage({ onNavigate: _onNavigate }: AdminDashboardPageProps) {
  const {
    activeTab,
    setActiveTab,
    successMessage,
    stats,
    orders,
    users,
    withdrawals,
    cancelRequests,
    platformRevenue,
    filteredUsers,
    filteredProducts,
    filteredReports,
    filteredWithdrawals,
    filteredAddresses,
    filteredOrders,
    filteredCategories,
    filteredFaculties,
    paginatedUsers,
    paginatedProducts,
    paginatedReports,
    paginatedWithdrawals,
    paginatedOrders,
    paginatedFaculties,
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
    showUserDetail,
    setShowUserDetail,
    selectedUser,
    showBanDialog,
    setShowBanDialog,
    showUnbanDialog,
    setShowUnbanDialog,
    userToAction,
    showProductDetail,
    setShowProductDetail,
    selectedProduct,
    showDeleteProductDialog,
    setShowDeleteProductDialog,
    productToDelete,
    showWarningDialog,
    setShowWarningDialog,
    showBanReportDialog,
    setShowBanReportDialog,
    selectedReport,
    showApproveDialog,
    setShowApproveDialog,
    showRejectDialog,
    setShowRejectDialog,
    showCompleteDialog,
    setShowCompleteDialog,
    showFailDialog,
    setShowFailDialog,
    selectedWithdrawal,
    rejectionReason,
    setRejectionReason,
    failureReason,
    setFailureReason,
    showCategoryDialog,
    setShowCategoryDialog,
    selectedCategory,
    categoryForm,
    setCategoryForm,
    showDeleteCategoryDialog,
    setShowDeleteCategoryDialog,
    categoryToDelete,
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
    confirmSendWarning,
    confirmBanFromReport,
    handleApproveWithdrawal,
    handleRejectWithdrawal,
    handleProcessWithdrawal,
    handleCompleteWithdrawal,
    handleFailWithdrawal,
    confirmApproveWithdrawal,
    confirmRejectWithdrawal,
    confirmCompleteWithdrawal,
    confirmFailWithdrawal,
    handleAddCategory,
    handleEditCategory,
    handleSaveCategory,
    handleDeleteCategory,
    confirmDeleteCategory,
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
  } = useAdminDashboardController();

  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 flex-1">
      <div className="container mx-auto px-4 py-8">
        {successMessage && (
          <div className="fixed top-4 right-4 z-50 animate-in fade-in-0 slide-in-from-top-2">
            <Card className="bg-primary-50 dark:bg-primary-900/30 border-primary-200 dark:border-primary-800 shadow-lg">
              <CardContent className="p-4 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary-600" />
                <p className="text-sm font-medium text-primary-700 dark:text-primary-300">{successMessage}</p>
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
            <p className="text-muted-foreground">Moderasi & Mediator Keuangan KampusMarket</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              Terakhir update: Hari ini, 14:30
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
            <TabsTrigger value="cancel-requests">
              Pembatalan
              {stats.pendingCancelRequests > 0 && <Badge variant="destructive" className="ml-1 h-5 px-1.5">{stats.pendingCancelRequests}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="orders">Transaksi</TabsTrigger>
            <TabsTrigger value="finance">Keuangan</TabsTrigger>
            <TabsTrigger value="addresses">Alamat</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <AdminOverviewTab
              stats={stats}
              formatPrice={formatPrice}
              orders={orders}
              onOpenTab={setActiveTab}
            />
          </TabsContent>
          <TabsContent value="users">
            <AdminUsersTab
              filteredUsers={filteredUsers}
              paginatedUsers={paginatedUsers}
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
              getTotalPages={getTotalPages}
              renderPagination={renderPagination}
              getInitials={getInitials}
              getFacultyName={getFacultyName}
              handleViewUser={handleViewUser}
              handleBanUser={handleBanUser}
              handleUnbanUser={handleUnbanUser}
            />
          </TabsContent>
          <TabsContent value="products">
            <AdminProductsTab
              filteredProducts={filteredProducts}
              paginatedProducts={paginatedProducts}
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
            />
          </TabsContent>
          <TabsContent value="categories">
            <AdminCategoriesTab
              filteredCategories={filteredCategories}
              categorySearchTerm={categorySearchTerm}
              setCategorySearchTerm={setCategorySearchTerm}
              categoryTypeFilter={categoryTypeFilter}
              setCategoryTypeFilter={setCategoryTypeFilter}
              handleAddCategory={handleAddCategory}
              handleEditCategory={handleEditCategory}
              handleDeleteCategory={handleDeleteCategory}
            />
          </TabsContent>
          <TabsContent value="faculties">
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
          </TabsContent>
          <TabsContent value="reports">
            <AdminReportsTab
              filteredReports={filteredReports}
              paginatedReports={paginatedReports}
              currentPage={reportPage}
              reportSearchTerm={reportSearchTerm}
              setReportSearchTerm={setReportSearchTerm}
              reportStatusFilter={reportStatusFilter}
              setReportStatusFilter={setReportStatusFilter}
              setReportPage={setReportPage}
              getTotalPages={getTotalPages}
              renderPagination={renderPagination}
              getReportStatusBadge={getReportStatusBadge}
              handleSendWarning={handleSendWarning}
              handleBanFromReport={handleBanFromReport}
            />
          </TabsContent>
          <TabsContent value="cancel-requests">
            <AdminCancelRequestsTab
              cancelRequests={cancelRequests}
              formatPrice={formatPrice}
              handleApproveCancelRequest={handleApproveCancelRequest}
              handleRejectCancelRequest={handleRejectCancelRequest}
            />
          </TabsContent>
          <TabsContent value="orders">
            <AdminOrdersTab
              filteredOrders={filteredOrders}
              paginatedOrders={paginatedOrders}
              currentPage={orderPage}
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
              getTotalPages={getTotalPages}
              renderPagination={renderPagination}
              getInitials={getInitials}
              formatPrice={formatPrice}
              getOrderStatusBadge={getOrderStatusBadge}
              getPaymentStatusBadge={getPaymentStatusBadge}
            />
          </TabsContent>
          <TabsContent value="finance" className="space-y-6">
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
              getWithdrawalStatusBadge={getWithdrawalStatusBadge}
              getInitials={getInitials}
              handleApproveWithdrawal={handleApproveWithdrawal}
              handleRejectWithdrawal={handleRejectWithdrawal}
              handleProcessWithdrawal={handleProcessWithdrawal}
              handleCompleteWithdrawal={handleCompleteWithdrawal}
              handleFailWithdrawal={handleFailWithdrawal}
            />
          </TabsContent>
          <TabsContent value="addresses" className="space-y-6">
            <AdminAddressesTab
              filteredAddresses={filteredAddresses}
              users={users}
              addressSearchTerm={addressSearchTerm}
              setAddressSearchTerm={setAddressSearchTerm}
              getInitials={getInitials}
            />
          </TabsContent>
        </Tabs>
      </div>

      <AdminActionDialogs
        showUserDetail={showUserDetail}
        setShowUserDetail={setShowUserDetail}
        selectedUser={selectedUser}
        showBanDialog={showBanDialog}
        setShowBanDialog={setShowBanDialog}
        showUnbanDialog={showUnbanDialog}
        setShowUnbanDialog={setShowUnbanDialog}
        userToAction={userToAction}
        confirmBanUser={confirmBanUser}
        confirmUnbanUser={confirmUnbanUser}
        showProductDetail={showProductDetail}
        setShowProductDetail={setShowProductDetail}
        selectedProduct={selectedProduct}
        showDeleteProductDialog={showDeleteProductDialog}
        setShowDeleteProductDialog={setShowDeleteProductDialog}
        productToDelete={productToDelete}
        confirmDeleteProduct={confirmDeleteProduct}
        showWarningDialog={showWarningDialog}
        setShowWarningDialog={setShowWarningDialog}
        showBanReportDialog={showBanReportDialog}
        setShowBanReportDialog={setShowBanReportDialog}
        selectedReport={selectedReport}
        confirmSendWarning={confirmSendWarning}
        confirmBanFromReport={confirmBanFromReport}
        showApproveDialog={showApproveDialog}
        setShowApproveDialog={setShowApproveDialog}
        showRejectDialog={showRejectDialog}
        setShowRejectDialog={setShowRejectDialog}
        showCompleteDialog={showCompleteDialog}
        setShowCompleteDialog={setShowCompleteDialog}
        showFailDialog={showFailDialog}
        setShowFailDialog={setShowFailDialog}
        selectedWithdrawal={selectedWithdrawal}
        confirmApproveWithdrawal={confirmApproveWithdrawal}
        confirmRejectWithdrawal={confirmRejectWithdrawal}
        confirmCompleteWithdrawal={confirmCompleteWithdrawal}
        confirmFailWithdrawal={confirmFailWithdrawal}
        rejectionReason={rejectionReason}
        setRejectionReason={setRejectionReason}
        failureReason={failureReason}
        setFailureReason={setFailureReason}
        showCategoryDialog={showCategoryDialog}
        setShowCategoryDialog={setShowCategoryDialog}
        selectedCategory={selectedCategory}
        categoryForm={categoryForm}
        setCategoryForm={setCategoryForm}
        handleSaveCategory={handleSaveCategory}
        showDeleteCategoryDialog={showDeleteCategoryDialog}
        setShowDeleteCategoryDialog={setShowDeleteCategoryDialog}
        categoryToDelete={categoryToDelete}
        confirmDeleteCategory={confirmDeleteCategory}
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
        formatProductPrice={formatProductPrice}
        getFacultyName={getFacultyName}
        getInitials={getInitials}
        cancelReasons={cancelReasons}
      />

      <AdminFacultyDialogs
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
