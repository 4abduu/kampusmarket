import { BrowserRouter, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import AppRoutes from "@/app/AppRoutes";
import type { GoogleAuthSession, NavigationData } from "@/app/navigation";
import { userApi } from "@/lib/api/users";
import type { User } from "@/lib/mock-data";

// Layout
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AdminFooter from "@/components/layout/AdminFooter";
import SellerWelcomeModal from "@/components/layout/SellerWelcomeModal";
import { getInitialSellerProductCount } from "@/components/pages/user/dashboard/seller-products";

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
      const user = await userApi.me();
      if (user) {
        setAuthUser(user);
        setIsLoggedIn(true);
        setUserRole(user.role === "admin" ? "admin" : "user");
      } else {
        setAuthUser(null);
        setIsLoggedIn(false);
        setUserRole(null);
      }
    } catch {
      setAuthUser(null);
      setIsLoggedIn(false);
      setUserRole(null);
    } finally {
      setAuthReady(true);
    }
  };

  useEffect(() => {
    void syncAuthUser();
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      setAuthUser(null);
      setIsLoggedIn(false);
      setUserRole(null);
    };
    window.addEventListener("unauthorized", handleUnauthorized);
    return () => window.removeEventListener("unauthorized", handleUnauthorized);
  }, []);

  // ── Handle Navigation ──
  // Gabungan: format rapi dari main + chat support dari dev-abdu
  const handleNavigate = (page: string, data?: string | NavigationData) => {
    let url = `/${page === "landing" ? "" : page}`;

    // Handle simple string ID
    if (typeof data === "string") {
      if (!page.includes("/")) {
        url = `/${page}/${data}`;
      }
    } else if (data) {
      const params = new URLSearchParams();

      if ("category" in data && data.category) {
        params.set("category", data.category);
      }
      if ("searchQuery" in data && data.searchQuery) {
        params.set("q", data.searchQuery);
        url = "/search";
      }
      if ("successType" in data && data.successType) {
        params.set("successType", data.successType);
      }

      // ✅ Chat support dari dev-abdu: gunakan query params
      if (page === "chat") {
        url = "/chat";
        if ("productId" in data && data.productId) {
          params.set("productId", data.productId);
        }
        if ("chatAction" in data && data.chatAction) {
          params.set("action", data.chatAction);
        }
      } else {
        // Untuk halaman lain, handle ID overrides seperti biasa
        if ("userId" in data && data.userId) url = `/profile/${data.userId}`;
        if ("productId" in data && data.productId)
          url = `/product/${data.productId}`;
      }

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
    navigate(role === "admin" ? "/admin" : "/");
  };

  const handleLogout = async () => {
    try {
      await userApi.logout();
    } catch {}
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

  // ✅ Google auth flow dari main (bukan () => {})
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

  // ✅ Page visibility logic dari main
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

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}