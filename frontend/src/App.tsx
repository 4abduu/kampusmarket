import { BrowserRouter, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import AppRoutes from "@/app/AppRoutes";
import type { GoogleAuthSession, NavigationData } from "@/app/navigation";

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
  const [isCustomerOnly, setIsCustomerOnly] = useState(false);
  const [sellerProductCount, setSellerProductCount] = useState(getInitialSellerProductCount());
  const [showSellerWelcome, setShowSellerWelcome] = useState(false);
  
  // Data State
  const [googleUserData, setGoogleUserData] = useState<{ userName?: string; userEmail?: string } | null>(null);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [googleAuthSession, setGoogleAuthSession] = useState<GoogleAuthSession | null>(null);

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
      if ("productId" in data && data.productId) url = `/product/${data.productId}`;
      
      // Store misc data in state
      if ("userName" in data || "userEmail" in data) {
        setGoogleUserData({ userName: data.userName, userEmail: data.userEmail });
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

  const handleLogin = (role: "user" | "admin" = "user", customerOnly: boolean = false) => {
    setGoogleAuthSession(null);
    setGoogleUserData(null);
    setIsLoggedIn(true);
    setUserRole(role);
    setIsCustomerOnly(customerOnly);
    if (role === "admin") {
      navigate("/admin");
    } else {
      navigate("/");
    }
  };

  const handleLogout = () => {
    setGoogleAuthSession(null);
    setGoogleUserData(null);
    setIsLoggedIn(false);
    setUserRole(null);
    setIsCustomerOnly(false);
    setShowSellerWelcome(false);
    navigate("/");
  };

  const handleToggleUserType = () => {
    if (sellerProductCount <= 0) return;
    setIsCustomerOnly((prev) => !prev);
  };

  const handleStartSelling = () => {
    setIsCustomerOnly(false);
    setShowSellerWelcome(true);
  };

  const handleGooglePendingSelection = (session: GoogleAuthSession) => {
    setGoogleAuthSession(session);
    setGoogleUserData({
      userName: session.userName,
      userEmail: session.userEmail,
    });
    navigate("/faculty-selection");
    window.scrollTo(0, 0);
  };

  // Helper to get ID from URL
  const pathParts = location.pathname.split('/');
  const currentId = pathParts[2] || null;
  const successTypeParam = new URLSearchParams(location.search).get("successType");
  const currentSuccessType = successTypeParam === "service" ? "service" : successTypeParam === "product" ? "product" : null;

  // Page Logic
  const noFooterPages = ["/login", "/register", "/forgot-password", "/faculty-selection", "/email-verification", "/chat", "/checkout", "/cart", "/order-detail", "/rating", "/notifications", "/admin-notifications", "/checkout-success", "/payment-success", "/booking-success", "/admin"];
  const isAdminPage = location.pathname.startsWith("/admin");
  const hasSellerProducts = sellerProductCount > 0;
  const effectiveIsCustomerOnly = isCustomerOnly || !hasSellerProducts;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar
        currentPage={location.pathname}
        onNavigate={handleNavigate}
        isLoggedIn={isLoggedIn}
        userRole={userRole}
        isCustomerOnly={effectiveIsCustomerOnly}
        hasSellerProducts={hasSellerProducts}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onToggleUserType={handleToggleUserType}
      />

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
          isCustomerOnly={effectiveIsCustomerOnly}
          onSellerProductCountChange={setSellerProductCount}
          registeredEmail={registeredEmail}
          currentId={currentId}
          currentSuccessType={currentSuccessType}
          googleUserData={googleUserData}
          googleAuthSession={googleAuthSession}
        />
      </main>

      {/* Footer Logic */}
      {isAdminPage ? (
        <AdminFooter />
      ) : !noFooterPages.some(p => location.pathname.startsWith(p)) && (
        <Footer onNavigate={handleNavigate} />
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