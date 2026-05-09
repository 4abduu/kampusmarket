// Export all skeleton components from a central location reorganized into folders
// Auth
export { default as AuthLoadingSkeleton } from "./auth/AuthLoadingSkeleton";

// Landing
export { default as LandingPageSkeleton } from "./landing/LandingPageSkeleton";
export { default as LandingHeroSectionSkeleton } from "./landing/LandingHeroSectionSkeleton";
export { default as LandingProductsSectionSkeleton } from "./landing/LandingProductsSectionSkeleton";
export { default as LandingServicesSectionSkeleton } from "./landing/LandingServicesSectionSkeleton";
export { default as CategorySectionSkeleton } from "./landing/CategorySectionSkeleton";

// Product
export { default as CatalogPageSkeleton } from "./product/CatalogPageSkeleton";
export { default as ProductDetailPageSkeleton } from "./product/ProductDetailPageSkeleton";
export { default as SearchResultsPageSkeleton } from "./product/SearchResultsPageSkeleton";
export { default as ServicesPageSkeleton } from "./product/ServicesPageSkeleton";
export { default as ServiceDetailPageSkeleton } from "./product/ServiceDetailPageSkeleton";
export { default as AddProductPageSkeleton } from "./product/AddProductPageSkeleton";

// Order
export { default as CartPageSkeleton } from "./order/CartPageSkeleton";
export { default as CheckoutPageSkeleton } from "./order/CheckoutPageSkeleton";
export { default as OrderDetailPageSkeleton } from "./order/OrderDetailPageSkeleton";
export { default as OrdersListPageSkeleton } from "./order/OrdersListPageSkeleton";
export { default as PaymentSuccessPageSkeleton } from "./order/PaymentSuccessPageSkeleton";
export { default as BookingSuccessPageSkeleton } from "./order/BookingSuccessPageSkeleton";

// User Dashboard
export { default as UserDashboardSkeleton } from "./user-dashboard/UserDashboardSkeleton";
export { default as UserDashboardOverviewSkeleton } from "./user-dashboard/UserDashboardOverviewSkeleton";
export { default as UserDashboardOverviewTabSkeleton } from "./user-dashboard/UserDashboardOverviewTabSkeleton";
export { default as UserDashboardProductsTabSkeleton } from "./user-dashboard/UserDashboardProductsTabSkeleton";
export { default as UserDashboardOrdersTabSkeleton } from "./user-dashboard/UserDashboardOrdersTabSkeleton";
export { default as UserDashboardSettingsSkeleton } from "./user-dashboard/UserDashboardSettingsSkeleton";
export { default as UserDashboardSettingsTabSkeleton } from "./user-dashboard/UserDashboardSettingsTabSkeleton";
export { default as UserDashboardWalletSkeleton } from "./user-dashboard/UserDashboardWalletSkeleton";

// Chat
export { default as ChatPageSkeleton } from "./chat/ChatPageSkeleton";

// Profile
export { default as ProfilePageSkeleton } from "./profile/ProfilePageSkeleton";

// Admin (re-export from subfolder)
export * from "./admin";
