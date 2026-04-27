import {
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  FacultySelectionPage,
  EmailVerificationPage,
} from "@/components/pages/auth";
import {
  LandingPage,
  CatalogPage,
  ServicesPage,
  ServiceDetailPage,
  SearchResultsPage,
} from "@/components/pages/guest";
import {
  CheckoutPage,
  UserDashboardPage,
  ChatPage,
  AddProductPage,
  CartPage,
  OrdersListPage,
  OrderDetailPage,
  RatingPage,
  FavoritesPage,
  UserNotificationsPage,
  CheckoutSuccessPage,
  ProfilePage,
} from "@/components/pages/user";
import AdminDashboardPage from "@/components/pages/admin/AdminDashboardPage";
import AdminNotificationsPage from "@/components/pages/admin/AdminNotificationsPage";
import type { GooglePendingSession, NavigateFn } from "@/app/navigation/types";

interface RenderPageParams {
  currentPage: string;
  selectedProductId: string | null;
  selectedUserId: string | null;
  selectedOrderId: string | null;
  selectedCategory: string | null;
  searchQuery: string | null;
  chatAction: "chat" | "nego" | null;
  selectedSuccessType: "product" | "service" | null;
  registeredEmail: string | null;
  googleUserData: { userName?: string; userEmail?: string } | null;
  isLoggedIn: boolean;
  onNavigate: NavigateFn;
  onLogin: (role?: "user" | "admin", customerOnly?: boolean) => void;
  onGooglePendingSelection: (session: GooglePendingSession) => void;
  onStartSelling: () => void;
  onSellerProductCountChange?: (count: number) => void;
  isCustomerOnly: boolean;
}

export function renderPage(params: RenderPageParams) {
  const {
    currentPage,
    selectedProductId,
    selectedUserId,
    selectedOrderId,
    selectedCategory,
    chatAction,
    selectedSuccessType,
    registeredEmail,
    googleUserData,
    isLoggedIn,
    onNavigate,
    onLogin,
    onGooglePendingSelection,
    onStartSelling,
    onSellerProductCountChange,
    isCustomerOnly,
  } = params;

  switch (currentPage) {
    case "login":
      if (isLoggedIn) return <LandingPage onNavigate={onNavigate} isLoggedIn={isLoggedIn} isCustomerOnly={isCustomerOnly} onStartSelling={onStartSelling} />;
      return <LoginPage onNavigate={onNavigate} onLogin={onLogin} onGooglePendingSelection={onGooglePendingSelection} />;
    case "register":
      if (isLoggedIn) return <LandingPage onNavigate={onNavigate} isLoggedIn={isLoggedIn} isCustomerOnly={isCustomerOnly} onStartSelling={onStartSelling} />;
      return <RegisterPage onNavigate={onNavigate} onLogin={onLogin} />;
    case "forgot-password":
      if (isLoggedIn) return <LandingPage onNavigate={onNavigate} isLoggedIn={isLoggedIn} isCustomerOnly={isCustomerOnly} onStartSelling={onStartSelling} />;
      return <ForgotPasswordPage onNavigate={onNavigate} />;
    case "faculty-selection":
      if (isLoggedIn) return <LandingPage onNavigate={onNavigate} isLoggedIn={isLoggedIn} isCustomerOnly={isCustomerOnly} onStartSelling={onStartSelling} />;
      return (
        <FacultySelectionPage
          onLogin={onLogin}
          userName={googleUserData?.userName}
          userEmail={googleUserData?.userEmail}
        />
      );
    case "email-verification":
      if (isLoggedIn) return <LandingPage onNavigate={onNavigate} isLoggedIn={isLoggedIn} isCustomerOnly={isCustomerOnly} onStartSelling={onStartSelling} />;
      return <EmailVerificationPage onNavigate={onNavigate} email={registeredEmail ?? undefined} />;
    case "catalog":
      return <CatalogPage onNavigate={onNavigate} initialCategory={selectedCategory ?? undefined} />;
    case "services":
      return <ServicesPage onNavigate={onNavigate} initialCategory={selectedCategory ?? undefined} />;
    case "product":
      return <div>Legacy renderPage not supported - use AppRoutes</div>;
    case "service":
      return <ServiceDetailPage onNavigate={onNavigate} serviceId={(selectedProductId || "s1") as string} isLoggedIn={isLoggedIn} />;
    case "checkout":
      return <CheckoutPage onNavigate={onNavigate} productId={selectedProductId || undefined} />;
    case "checkout-success":
      return <CheckoutSuccessPage onNavigate={onNavigate} successType={selectedSuccessType || "product"} />;
    case "payment-success":
      return <CheckoutSuccessPage onNavigate={onNavigate} successType="product" />;
    case "booking-success":
      return <CheckoutSuccessPage onNavigate={onNavigate} successType="service" />;
    case "cart":
      return <CartPage onNavigate={onNavigate} />;
    case "add-product":
      return <AddProductPage onNavigate={onNavigate} />;
    case "orders":
      return <OrdersListPage onNavigate={onNavigate} />;
    case "order-detail":
      return <OrderDetailPage onNavigate={onNavigate} orderId={selectedOrderId || undefined} />;
    case "rating":
      return <RatingPage onNavigate={onNavigate} />;
    case "favorites":
      return <FavoritesPage onNavigate={onNavigate} />;
    case "dashboard":
      return <UserDashboardPage onNavigate={onNavigate} currentPage="dashboard" onSellerProductCountChange={onSellerProductCountChange} />;
    case "my-products":
      return <UserDashboardPage onNavigate={onNavigate} currentPage="my-products" onSellerProductCountChange={onSellerProductCountChange} />;
    case "dashboard-wallet":
    case "wallet":
      return <UserDashboardPage onNavigate={onNavigate} currentPage="wallet" onSellerProductCountChange={onSellerProductCountChange} />;
    case "settings":
      return <UserDashboardPage onNavigate={onNavigate} currentPage="settings" onSellerProductCountChange={onSellerProductCountChange} />;
    case "chat":
      return <ChatPage onNavigate={onNavigate} initialContextId={selectedProductId || undefined} initialChatAction={chatAction || undefined} />;
    case "notifications":
      return <UserNotificationsPage onNavigate={onNavigate} />;
    case "admin":
      return <AdminDashboardPage onNavigate={onNavigate} />;
    case "admin-notifications":
      return <AdminNotificationsPage onNavigate={onNavigate} />;
    case "search":
      return <SearchResultsPage onNavigate={onNavigate} />;
    case "profile":
      return <ProfilePage onNavigate={onNavigate} userId={selectedUserId || undefined} />;
    case "landing":
    default:
      return (
        <LandingPage
          onNavigate={onNavigate}
          isLoggedIn={isLoggedIn}
          isCustomerOnly={isCustomerOnly}
          onStartSelling={onStartSelling}
        />
      );
  }
}
