import { lazy, Suspense, useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import type { GoogleAuthSession, NavigateHandler } from "@/app/navigation";
import { UnauthorizedPage, NotFoundPage } from "@/components/pages/guest";
import type { User } from "@/lib/mock-data";

const LandingPage = lazy(() => import("@/components/pages/guest/LandingPage"));
const LoginPage = lazy(() => import("@/components/pages/guest/LoginPage"));
const RegisterPage = lazy(() => import("@/components/pages/guest/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("@/components/pages/guest/ForgotPasswordPage"));
const FacultySelectionPage = lazy(() => import("@/components/pages/guest/FacultySelectionPage"));
const CatalogPage = lazy(() => import("@/components/pages/guest/CatalogPage"));
const ServicesPage = lazy(() => import("@/components/pages/guest/ServicesPage"));
const ServiceDetailPage = lazy(() => import("@/components/pages/guest/ServiceDetailPage"));
const ProductDetailPage = lazy(() => import("@/components/pages/guest/ProductDetailPage"));
const CheckoutPage = lazy(() => import("@/components/pages/user/CheckoutPage"));
const UserDashboardPage = lazy(() => import("@/components/pages/user/UserDashboardPage"));
const ChatPage = lazy(() => import("@/components/pages/user/ChatPage"));
const AdminDashboardPage = lazy(() => import("@/components/pages/admin/AdminDashboardPage"));
const AddProductPage = lazy(() => import("@/components/pages/user/AddProductPage"));
const CartPage = lazy(() => import("@/components/pages/user/CartPage"));
const OrdersListPage = lazy(() => import("@/components/pages/user/OrdersListPage"));
const OrderDetailPage = lazy(() => import("@/components/pages/user/OrderDetailPage"));
const RatingPage = lazy(() => import("@/components/pages/user/RatingPage"));
const UserNotificationsPage = lazy(() => import("@/components/pages/user/UserNotificationsPage"));
const AdminNotificationsPage = lazy(() => import("@/components/pages/admin/AdminNotificationsPage"));
const CheckoutSuccessPage = lazy(() => import("@/components/pages/user/CheckoutSuccessPage"));
const EmailVerificationPage = lazy(() => import("@/components/pages/guest/EmailVerificationPage"));
const SearchResultsPage = lazy(() => import("@/components/pages/guest/SearchResultsPage"));
const ProfilePage = lazy(() => import("@/components/pages/user/ProfilePage"));
const FavoritesPage = lazy(() => import("@/components/pages/user/FavoritesPage"));

type AppRoutesProps = {
  onNavigate: NavigateHandler;
  onLogin: (role?: "user" | "admin", customerOnly?: boolean) => void;
  onStartSelling: () => void;
  onGooglePendingSelection: (session: GoogleAuthSession) => void;
  onSellerProductCountChange: (count: number) => void;
  isLoggedIn: boolean;
  isCustomerOnly: boolean;
  registeredEmail: string | null;
  currentId: string | null;
  googleUserData: { userName?: string; userEmail?: string } | null;
  currentUser: User | null;
  currentSuccessType: "product" | "service" | null;
};

function ProtectedRoute({
  isLoggedIn,
  element,
}: {
  isLoggedIn: boolean;
  element: React.ReactElement;
}): React.ReactElement {
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/unauthorized" replace state={{ from: location.pathname }} />;
  }

  return element;
}

function RoleProtectedRoute({
  isLoggedIn,
  isAdmin,
  element,
}: {
  isLoggedIn: boolean;
  isAdmin: boolean;
  element: React.ReactElement;
}): React.ReactElement {
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/unauthorized" replace state={{ from: location.pathname }} />;
  }

  if (!isAdmin) {
    return <Navigate to="/unauthorized" replace state={{ from: location.pathname, reason: "forbidden" }} />;
  }

  return element;
}

function PublicRoute({
  isLoggedIn,
  element,
  allowLoggedIn = false,
}: {
  isLoggedIn: boolean;
  element: React.ReactElement;
  allowLoggedIn?: boolean;
}): React.ReactElement {
  const location = useLocation();

  // If already logged in and this is a public route (like login/register), redirect to home
  if (isLoggedIn && !allowLoggedIn) {
    const stateFrom = (location.state as { from?: string } | null)?.from;
    const previousPath = stateFrom || sessionStorage.getItem("lastNonAuthPath") || "/";
    return <Navigate to={previousPath} replace />;
  }

  return element;
}

export default function AppRoutes({
  onNavigate,
  onLogin,
  onStartSelling,
  onGooglePendingSelection,
  onSellerProductCountChange,
  isLoggedIn,
  isCustomerOnly,
  registeredEmail,
  currentId,
  googleUserData,
  currentUser,
  currentSuccessType,
}: AppRoutesProps) {
  const location = useLocation();
  const unauthorizedState = location.state as { reason?: string } | null;

  useEffect(() => {
    const authPaths = new Set(["/login", "/register", "/forgot-password", "/faculty-selection", "/email-verification"]);
    if (!authPaths.has(location.pathname)) {
      sessionStorage.setItem("lastNonAuthPath", location.pathname + location.search);
    }
  }, [location.pathname, location.search]);

  return (
    <Suspense
      fallback={(
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
        </div>
      )}
    >
      <Routes>
        <Route
          path="/login"
          element={(
            <PublicRoute
              isLoggedIn={isLoggedIn}
              element={
                <LoginPage
                  onNavigate={onNavigate}
                  onLogin={onLogin}
                  onGooglePendingSelection={onGooglePendingSelection}
                />
              }
            />
          )}
        />
        <Route
          path="/register"
          element={(
            <PublicRoute
              isLoggedIn={isLoggedIn}
              element={
                <RegisterPage onNavigate={onNavigate} onLogin={onLogin} />
              }
            />
          )}
        />
        <Route
          path="/forgot-password"
          element={(
            <PublicRoute
              isLoggedIn={isLoggedIn}
              element={
                <ForgotPasswordPage onNavigate={onNavigate} />
              }
            />
          )}
        />
        <Route
          path="/faculty-selection"
          element={(
            <PublicRoute
              isLoggedIn={isLoggedIn}
              element={
                <FacultySelectionPage
                  onLogin={onLogin}
                  userName={googleUserData?.userName}
                  userEmail={googleUserData?.userEmail}
                />
              }
            />
          )}
        />
        <Route
          path="/unauthorized"
          element={(
            <UnauthorizedPage
              onNavigate={onNavigate}
              variant={unauthorizedState?.reason === "forbidden" ? "forbidden" : "guest"}
            />
          )}
        />
        <Route
          path="/email-verification"
          element={(
            <PublicRoute
              isLoggedIn={isLoggedIn}
              element={<EmailVerificationPage onNavigate={onNavigate} email={registeredEmail || undefined} />}
            />
          )}
        />

        <Route path="/" element={<LandingPage onNavigate={onNavigate} isLoggedIn={isLoggedIn} isCustomerOnly={isCustomerOnly} onStartSelling={onStartSelling} />} />
        <Route path="/catalog" element={<CatalogPage onNavigate={onNavigate} />} />
        <Route path="/services" element={<ServicesPage onNavigate={onNavigate} />} />
        <Route path="/product/:id" element={<ProductDetailPage onNavigate={onNavigate} productId={currentId || "p1"} isLoggedIn={isLoggedIn} onLogin={onLogin} />} />
        <Route path="/service/:id" element={<ServiceDetailPage onNavigate={onNavigate} serviceId={currentId || "s1"} isLoggedIn={isLoggedIn} />} />

        <Route path="/checkout" element={<ProtectedRoute isLoggedIn={isLoggedIn} element={<CheckoutPage onNavigate={onNavigate} />} />} />
        <Route path="/checkout/:id" element={<ProtectedRoute isLoggedIn={isLoggedIn} element={<CheckoutPage onNavigate={onNavigate} productId={currentId || undefined} />} />} />
        <Route path="/cart" element={<ProtectedRoute isLoggedIn={isLoggedIn} element={<CartPage onNavigate={onNavigate} />} />} />
        <Route path="/checkout-success" element={<CheckoutSuccessPage onNavigate={onNavigate} successType={currentSuccessType || "product"} orderId={currentId || undefined} />} />
        <Route path="/checkout-success/:id" element={<CheckoutSuccessPage onNavigate={onNavigate} successType={currentSuccessType || "product"} orderId={currentId || undefined} />} />
        <Route path="/payment-success" element={<CheckoutSuccessPage onNavigate={onNavigate} successType="product" orderId={currentId || undefined} />} />
        <Route path="/payment-success/:id" element={<CheckoutSuccessPage onNavigate={onNavigate} successType="product" orderId={currentId || undefined} />} />
        <Route path="/booking-success" element={<CheckoutSuccessPage onNavigate={onNavigate} successType="service" orderId={currentId || undefined} />} />
        <Route path="/booking-success/:id" element={<CheckoutSuccessPage onNavigate={onNavigate} successType="service" orderId={currentId || undefined} />} />

        <Route path="/dashboard" element={<ProtectedRoute isLoggedIn={isLoggedIn} element={<UserDashboardPage onNavigate={onNavigate} currentPage="dashboard" onSellerProductCountChange={onSellerProductCountChange} currentUser={currentUser} />} />} />
        <Route path="/my-products" element={<ProtectedRoute isLoggedIn={isLoggedIn} element={<UserDashboardPage onNavigate={onNavigate} currentPage="my-products" onSellerProductCountChange={onSellerProductCountChange} currentUser={currentUser} />} />} />
        <Route path="/wallet" element={<ProtectedRoute isLoggedIn={isLoggedIn} element={<UserDashboardPage onNavigate={onNavigate} currentPage="wallet" onSellerProductCountChange={onSellerProductCountChange} currentUser={currentUser} />} />} />
        <Route path="/settings" element={<ProtectedRoute isLoggedIn={isLoggedIn} element={<UserDashboardPage onNavigate={onNavigate} currentPage="settings" onSellerProductCountChange={onSellerProductCountChange} currentUser={currentUser} />} />} />
        <Route path="/orders" element={<ProtectedRoute isLoggedIn={isLoggedIn} element={<OrdersListPage onNavigate={onNavigate} />} />} />
        <Route path="/favorites" element={<ProtectedRoute isLoggedIn={isLoggedIn} element={<FavoritesPage onNavigate={onNavigate} />} />} />
        <Route path="/order-detail/:id" element={<ProtectedRoute isLoggedIn={isLoggedIn} element={<OrderDetailPage onNavigate={onNavigate} orderId={currentId || undefined} />} />} />
        <Route path="/rating" element={<ProtectedRoute isLoggedIn={isLoggedIn} element={<RatingPage onNavigate={onNavigate} />} />} />
        <Route path="/chat" element={<ProtectedRoute isLoggedIn={isLoggedIn} element={<ChatPage onNavigate={onNavigate} />} />} />
        <Route path="/notifications" element={<ProtectedRoute isLoggedIn={isLoggedIn} element={<UserNotificationsPage onNavigate={onNavigate} />} />} />
        <Route path="/profile/:id?" element={<ProtectedRoute isLoggedIn={isLoggedIn} element={<ProfilePage onNavigate={onNavigate} userId={currentId || undefined} />} />} />
        <Route path="/add-product" element={<ProtectedRoute isLoggedIn={isLoggedIn} element={<AddProductPage onNavigate={onNavigate} />} />} />

        <Route path="/search" element={<SearchResultsPage onNavigate={onNavigate} />} />
        <Route path="/admin" element={<RoleProtectedRoute isLoggedIn={isLoggedIn} isAdmin={currentUser?.role === "admin"} element={<AdminDashboardPage onNavigate={onNavigate} />} />} />
        <Route path="/stats" element={<RoleProtectedRoute isLoggedIn={isLoggedIn} isAdmin={currentUser?.role === "admin"} element={<AdminDashboardPage onNavigate={onNavigate} />} />} />
        <Route path="/admin-notifications" element={<RoleProtectedRoute isLoggedIn={isLoggedIn} isAdmin={currentUser?.role === "admin"} element={<AdminNotificationsPage onNavigate={onNavigate} />} />} />
        <Route path="*" element={<NotFoundPage onNavigate={onNavigate} />} />
      </Routes>
    </Suspense>
  );
}
