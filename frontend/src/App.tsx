import { BrowserRouter, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import AppRoutes from "@/app/AppRoutes";
import type { GoogleAuthSession, NavigationData } from "@/app/navigation";
import { userApi } from "@/lib/api/users";
import type { User } from "@/lib/mock-data";
// import AuthLoadingSkeleton from "@/components/pages/guest/AuthLoadingSkeleton";

// Layout
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AdminFooter from "@/components/layout/AdminFooter";
import SellerWelcomeModal from "@/components/layout/SellerWelcomeModal";
import { getInitialSellerProductCount } from "@/components/pages/user/dashboard/seller-products";

// Komponen Utama Aplikasi (Isi)
function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<"user" | "admin" | null>(null);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [sellerProductCount, setSellerProductCount] = useState(
    getInitialSellerProductCount(),
  );
  const [showSellerWelcome, setShowSellerWelcome] = useState(false);

  // Data State
  const [googleUserData, setGoogleUserData] = useState<{
    userName?: string;
    userEmail?: string;
  } | null>(null);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  const syncAuthUser = async () => {
    try {
      console.debug("[App] Checking auth status via /auth/me");
      const user = await userApi.me();

      if (user) {
        console.debug("[App] User authenticated:", {
          userId: user.id,
          email: user.email,
          role: user.role,
        });
        setAuthUser(user);
        setIsLoggedIn(true);
        setUserRole(user.role === "admin" ? "admin" : "user");
      } else {
        console.debug("[App] No authenticated user found");
        setAuthUser(null);
        setIsLoggedIn(false);
        setUserRole(null);
      }
    } catch (error) {
      console.debug("[App] Auth check failed:", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      setAuthUser(null);
      setIsLoggedIn(false);
      setUserRole(null);
    } finally {
      setAuthReady(true);
    }
  };

  // Check auth status on app load
  useEffect(() => {
    void syncAuthUser();
  }, []);

  // Handle unauthorized event (when API returns true 401)
  useEffect(() => {
    const handleUnauthorized = () => {
      console.warn("[App] Unauthorized event - User session expired");
      setAuthUser(null);
      setIsLoggedIn(false);
      setUserRole(null);
      // Don't navigate here, let the app naturally show unauthorized page
      // or user can click login manually
    };

    window.addEventListener("unauthorized", handleUnauthorized);
    return () => window.removeEventListener("unauthorized", handleUnauthorized);
  }, []);

  // Handle Navigation
  const handleNavigate = (page: string, data?: string | NavigationData) => {
    let url = `/${page === "landing" ? "" : page}`;

    // Handle simple string ID (e.g. "product", "p1")
    if (typeof data === "string") {
      // Jika page sudah mengandung id (misal profile/p1), jangan tambahkan /id lagi
      if (!page.includes("/")) {
        url = `/${page}/${data}`;
      } else {
        url = `/${page}`;
      }
    }
    // Handle object data
    else if (data) {
      const params = new URLSearchParams();

      if ("category" in data && data.category) {
        params.set("category", data.category);
      }
      if ("searchQuery" in data && data.searchQuery) {
        params.set("q", data.searchQuery);
        url = "/search"; // Override ke halaman search
      }
      if ("successType" in data && data.successType) {
        params.set("successType", data.successType);
      }

      // Handle specific ID overrides
      if ("userId" in data && data.userId) url = `/profile/${data.userId}`;
      if ("productId" in data && data.productId)
        url = `/product/${data.productId}`;

      // Store misc data in state
      if ("userName" in data || "userEmail" in data) {
        setGoogleUserData({
          userName: data.userName,
          userEmail: data.userEmail,
        });
      }
      if ("registeredEmail" in data && data.registeredEmail) {
        setRegisteredEmail(data.registeredEmail);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }
    }

    navigate(url);
    window.scrollTo(0, 0);
  };

  const handleLogin = (role: "user" | "admin" = "user") => {
    setGoogleUserData(null);
    setIsLoggedIn(true);
    setUserRole(role);
    void syncAuthUser();
    if (role === "admin") {
      navigate("/admin");
    } else {
      navigate("/");
    }
  };

  const handleLogout = async () => {
    try {
      await userApi.logout();
    } catch (error) {
      console.debug("[App] Logout API failed, continuing local cleanup", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    setGoogleUserData(null);
    setAuthUser(null);
    setIsLoggedIn(false);
    setUserRole(null);
    setShowSellerWelcome(false);
    navigate("/");
  };

  const handleStartSelling = () => {
    setShowSellerWelcome(true);
  };

  const handleGooglePendingSelection = (session: GoogleAuthSession) => {
    setGoogleUserData({
      userName: session.userName,
      userEmail: session.userEmail,
    });
    navigate("/faculty-selection");
    window.scrollTo(0, 0);
  };

  // Helper to get ID from URL
  const pathParts = location.pathname.split("/");
  const currentId = pathParts[2] || null;
  const successTypeParam = new URLSearchParams(location.search).get(
    "successType",
  );
  const currentSuccessType =
    successTypeParam === "service"
      ? "service"
      : successTypeParam === "product"
        ? "product"
        : null;
  const categoryParam = new URLSearchParams(location.search).get("category");

  // Page Logic
  // Pages that don't need footer n navbar
  const noNavbarPages = [
    "login",
    "register",
    "forgot-password",
    "faculty-selection",
    "email-verification",
    "payment-success",
    "booking-success",
    "unauthorized",
    "not-found",
    "notfound",
    "404",
    "no-access",
  ];

  const noFooterPages = [
    "login",
    "register",
    "forgot-password",
    "faculty-selection",
    "email-verification",
    "chat",
    "checkout",
    "payment-success",
    "booking-success",
    "admin",
    "stats",
    "admin-notifications",
    "unauthorized",
    "not-found",
    "notfound",
    "404",
    "no-access",
  ];
  const hideNavbar = noNavbarPages.some((p) =>
    location.pathname.startsWith(`/${p}`),
  );
  const isAdminPage =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/stats");
  const hasSellerProducts = sellerProductCount > 0;
  const isCustomerOnly = !hasSellerProducts;

  // Check if current path matches a known route pattern (for 404 pages)
  const knownPagePrefixes = [
    "login",
    "register",
    "forgot-password",
    "faculty-selection",
    "email-verification",
    "catalog",
    "services",
    "product",
    "service",
    "search",
    "checkout",
    "cart",
    "checkout-success",
    "payment-success",
    "booking-success",
    "dashboard",
    "my-products",
    "wallet",
    "settings",
    "orders",
    "favorites",
    "order-detail",
    "rating",
    "chat",
    "notifications",
    "profile",
    "add-product",
    "admin",
    "stats",
    "admin-notifications",
    "unauthorized",
  ];
  const isKnownRoute =
    location.pathname === "/" ||
    knownPagePrefixes.some((p) => location.pathname.startsWith(`/${p}`));
  const isNotFoundPage = !isKnownRoute;

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {!hideNavbar && !isNotFoundPage && (
        <Navbar
          currentPage={location.pathname}
          onNavigate={handleNavigate}
          isLoggedIn={isLoggedIn}
          userRole={userRole}
          currentUser={authUser}
          isCustomerOnly={isCustomerOnly}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />
      )}

      <SellerWelcomeModal
        open={showSellerWelcome}
        onClose={() => setShowSellerWelcome(false)}
        onAddProduct={() => {
          setShowSellerWelcome(false);
          handleNavigate("add-product");
        }}
      />

      <main className="flex-1">
        <AppRoutes
          onNavigate={handleNavigate}
          onLogin={handleLogin}
          onStartSelling={handleStartSelling}
          onGooglePendingSelection={handleGooglePendingSelection}
          isLoggedIn={isLoggedIn}
          isCustomerOnly={isCustomerOnly}
          onSellerProductCountChange={setSellerProductCount}
          registeredEmail={registeredEmail}
          currentId={currentId}
          currentCategory={categoryParam}
          currentSuccessType={currentSuccessType}
          googleUserData={googleUserData}
          currentUser={authUser}
        />
      </main>

      {/* Footer Logic */}
      {isAdminPage && !isNotFoundPage ? (
        <AdminFooter />
      ) : (
        !isNotFoundPage &&
        !noFooterPages.some((p) => location.pathname.startsWith(`/${p}`)) && (
          <Footer onNavigate={handleNavigate} />
        )
      )}

      <Toaster />
    </div>
  );
}

// Pembungkus Router (Jangan ubah bagian ini)
export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
