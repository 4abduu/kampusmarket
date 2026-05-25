// REVISI: Tambah useRef untuk isLoggingOut flag agar ProtectedRoute tidak redirect
// ke /unauthorized saat proses logout berlangsung (race condition fix)
import { BrowserRouter, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Toaster } from "@/components/ui/toaster";
import AppRoutes from "@/app/AppRoutes";
import type { GoogleAuthSession, NavigationData } from "@/app/navigation";
import { userApi } from "@/lib/api/users";
import { useCartStore } from "@/lib/cart-store";
import type { User } from "@/lib/mock-data";
import { useNotificationStore } from "@/lib/notification-store";
import { useChatStore } from "@/lib/chat-store";
import { getEcho } from "@/lib/echo";

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
  // REVISI: Flag untuk mencegah ProtectedRoute redirect ke /unauthorized saat logout berlangsung
  const isLoggingOutRef = useRef(false);
  // REVISI: Flag untuk mencegah infinite redirect loop saat user tidak punya faculty
  const hasRedirectedToFacultyRef = useRef(false);
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
  const [emailVerificationSource, setEmailVerificationSource] = useState<"register" | "settings" | "forgot-password" | null>(null);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState<string | null>(null);
  const [forgotPasswordSource, setForgotPasswordSource] = useState<"register" | "settings" | null>(null);

  const syncAuthUser = async (): Promise<boolean> => {
    try {
      const user = await userApi.me();
      if (user) {
        setAuthUser(user);
        setIsLoggedIn(true);
        setUserRole(user.role === "admin" ? "admin" : "user");
        void useCartStore.getState().fetchCount();
        void useNotificationStore.getState().fetchNotifications();
        useNotificationStore.getState().initEcho(user.id);
        void useChatStore.getState().fetchUnreadCount();
        useChatStore.getState().initEcho(user.id);
        return true;
      } else {
        setAuthUser(null);
        setIsLoggedIn(false);
        setUserRole(null);
        useCartStore.getState().setCount(0);
        return false;
      }
    } catch (err) {
      setAuthUser(null);
      setIsLoggedIn(false);
      setUserRole(null);
      useCartStore.getState().setCount(0);
      return false;
    } finally {
      setAuthReady(true);
    }
  };

  useEffect(() => {
    void syncAuthUser();
    
    // Initialize Echo for real-time updates
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).Echo = getEcho();
    } catch (err) {
      // Echo optional - Reverb not configured in development
    }
  }, []);

  useEffect(() => {
    const handleWalletBalanceUpdated = (event: Event) => {
      const detail = (event as CustomEvent<{ balance?: number }>).detail;
      if (typeof detail?.balance !== "number") return;

      setAuthUser((prev) =>
        prev ? { ...prev, walletBalance: detail.balance } : prev,
      );
    };

    const handleProfileUpdated = (event: Event) => {
      const detail = (event as CustomEvent<Record<string, any>>).detail;
      if (!detail) return;

      setAuthUser((prev) =>
        prev
          ? {
              ...prev,
              name: detail.name ?? prev.name,
              email: detail.email ?? prev.email,
              phone: detail.phone ?? prev.phone,
              bio: detail.bio ?? prev.bio,
              faculty: detail.faculty ?? prev.faculty,
              avatar: detail.avatar ?? prev.avatar,
            }
          : prev,
      );
    };

    window.addEventListener("wallet-balance-updated", handleWalletBalanceUpdated);
    window.addEventListener("profile-updated", handleProfileUpdated);
    return () =>
      {
        window.removeEventListener("wallet-balance-updated", handleWalletBalanceUpdated);
        window.removeEventListener("profile-updated", handleProfileUpdated);
      };
  }, []);

  useEffect(() => {
    // REVISI: Saat token expired/invalid dari server, navigate ke home dulu
    // baru clear state, supaya tidak terlihat halaman /unauthorized sekilas
    const handleUnauthorized = () => {
      if (!isLoggingOutRef.current) {
        navigate("/");
      }
      setAuthUser(null);
      setIsLoggedIn(false);
      setUserRole(null);
    };
    window.addEventListener("unauthorized", handleUnauthorized);
    return () => window.removeEventListener("unauthorized", handleUnauthorized);
  }, [navigate]);

  // ── Handle Google OAuth redirect ──
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const userName = searchParams.get("userName");
    const userEmail = searchParams.get("userEmail");
    const requiresFacultySelection = searchParams.get("requiresFacultySelection") === "true";

    if (userName || userEmail) {
      setGoogleUserData({
        userName: userName || undefined,
        userEmail: userEmail || undefined,
      });

      if (requiresFacultySelection) {
        navigate("/faculty-selection");
      }

      // Clean up URL
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, [location.search, navigate]);

  // [PROTECTION #2] Check if user is logged in but has no faculty - enforce faculty selection
  useEffect(() => {
    if (!authReady) return;

    if (isLoggedIn && authUser && userRole === "user" && !authUser.faculty) {
      // Already on faculty-selection? Make sure googleUserData is set
      if (location.pathname === "/faculty-selection") {
        if (!googleUserData?.userName) {
          setGoogleUserData({
            userName: authUser.name,
            userEmail: authUser.email,
          });
        }
      } else {
        // Not on faculty-selection? Redirect there (but only once!)
        if (!hasRedirectedToFacultyRef.current) {
          hasRedirectedToFacultyRef.current = true;
          setGoogleUserData({
            userName: authUser.name,
            userEmail: authUser.email,
          });
          navigate("/faculty-selection");
        }
      }
    } else {
      // User either not logged in, has faculty, or is admin - reset redirect flag
      hasRedirectedToFacultyRef.current = false;
    }
  }, [isLoggedIn, authReady, authUser?.id, authUser?.faculty, userRole, location.pathname, navigate, googleUserData]);

  // ── Handle Navigation ──
  // Gabungan: format rapi dari main + chat support dari dev-abdu
  const handleNavigate = (page: string, data?: string | NavigationData) => {
    let url = `/${page === "landing" ? "" : page}`;
    let params: URLSearchParams | null = null;

    // Handle simple string/number ID
    if (typeof data === "string" || typeof data === "number") {
      if (!page.includes("/")) {
        url = `/${page}/${data}`;
      }
    } else if (data) {
      params = new URLSearchParams();

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
        if ("productId" in data && data.productId) {
          // Support checkout dengan negotiated price dari offer/nego
          if (page === "checkout") {
            url = `/checkout/${data.productId}`;
            if ("negoPrice" in data && data.negoPrice) {
              params.set("price", String(data.negoPrice));
            }
          } else {
            url = `/product/${data.productId}`;
          }
        }
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
      if ("forgotPasswordEmail" in data && data.forgotPasswordEmail) {
        setForgotPasswordEmail(data.forgotPasswordEmail);
      } else if (page === "forgot-password") {
        setForgotPasswordEmail(authUser?.email ?? null);
      } else {
        setForgotPasswordEmail(null);
      }
      if ("forgotPasswordSource" in data && data.forgotPasswordSource) {
        setForgotPasswordSource(data.forgotPasswordSource);
      } else if (page === "forgot-password") {
        setForgotPasswordSource(authUser ? "settings" : "register");
      } else {
        setForgotPasswordSource(null);
      }
      if ("emailVerificationSource" in data) {
        setEmailVerificationSource(data.emailVerificationSource ?? null);
      } else if (page === "email-verification") {
        setEmailVerificationSource(isLoggedIn ? "settings" : "register");
      } else {
        setEmailVerificationSource(null);
      }
    } else if (page === "email-verification") {
      setEmailVerificationSource(isLoggedIn ? "settings" : "register");
    } else {
      setEmailVerificationSource(null);
    }

    if (params?.toString()) {
      url += `?${params.toString()}`;
    }

    navigate(url);
    window.scrollTo(0, 0);
  };

  const handleLogin = (role: "user" | "admin" = "user") => {
    setGoogleUserData(null);
    setIsLoggedIn(true);
    setUserRole(role);
    setAuthReady(true);
    // Sync user data in background tanpa override isLoggedIn jika gagal
    // karena cookie sudah di-set oleh backend saat login
    userApi.me().then((user) => {
      if (user) {
        setAuthUser(user);
        setUserRole(user.role === "admin" ? "admin" : "user");
        void useCartStore.getState().fetchCount();
      }
    }).catch(() => {
      // Ignore - user tetap login, me() akan dicoba ulang saat refresh
    });
    navigate(role === "admin" ? "/admin" : "/");
  };

  const handleLogout = async () => {
    // REVISI: Set flag isLoggingOut SEBELUM apapun agar ProtectedRoute tidak
    // mendeteksi isLoggedIn=false lalu redirect ke /unauthorized.
    isLoggingOutRef.current = true;
    
    // Clear state IMMEDIATELY agar UI (seperti Navbar) langsung berubah menjadi guest
    setGoogleUserData(null);
    setAuthUser(null);
    setIsLoggedIn(false);
    setUserRole(null);
    setShowSellerWelcome(false);
    useNotificationStore.getState().cleanupEcho();
    // Clear lastNonAuthPath to prevent redirect to protected pages
    sessionStorage.removeItem("lastNonAuthPath");

    // Navigasi ke "/" dilakukan setelah state di-clear (aman karena isLoggingOutRef = true)
    navigate("/");

    try {
      await userApi.logout();
    } catch (err) {
      // Silent error
      console.debug("Logout error (ignored):", err);
    } finally {
      // REVISI: Reset flag setelah semua selesai
      isLoggingOutRef.current = false;
    }
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
          emailVerificationSource={emailVerificationSource}
          forgotPasswordEmail={forgotPasswordEmail}
          forgotPasswordSource={forgotPasswordSource}
          currentId={currentId}
          currentCategory={categoryParam}
          currentSuccessType={currentSuccessType}
          googleUserData={googleUserData}
          currentUser={authUser}
          userRole={userRole}
          isLoggingOut={isLoggingOutRef}
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