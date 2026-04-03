import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";

// Layout
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AdminFooter from "@/components/layout/AdminFooter";

// Pages
import LandingPage from "@/components/pages/LandingPage";
import LoginPage from "@/components/pages/LoginPage";
import RegisterPage from "@/components/pages/RegisterPage";
import ForgotPasswordPage from "@/components/pages/ForgotPasswordPage";
import FacultySelectionPage from "@/components/pages/FacultySelectionPage";
import CatalogPage from "@/components/pages/CatalogPage";
import ServicesPage from "@/components/pages/ServicesPage";
import ServiceDetailPage from "@/components/pages/ServiceDetailPage";
import ProductDetailPage from "@/components/pages/ProductDetailPage";
import CheckoutPage from "@/components/pages/CheckoutPage";
import UserDashboardPage from "@/components/pages/UserDashboardPage";
import ChatPage from "@/components/pages/ChatPage";
import AdminDashboardPage from "@/components/pages/AdminDashboardPage";
import AddProductPage from "@/components/pages/AddProductPage";
import CartPage from "@/components/pages/CartPage";
import OrdersListPage from "@/components/pages/OrdersListPage";
import OrderDetailPage from "@/components/pages/OrderDetailPage";
import RatingPage from "@/components/pages/RatingPage";
import UserNotificationsPage from "@/components/pages/UserNotificationsPage";
import AdminNotificationsPage from "@/components/pages/AdminNotificationsPage";
import PaymentSuccessPage from "@/components/pages/PaymentSuccessPage";
import BookingSuccessPage from "@/components/pages/BookingSuccessPage";
import EmailVerificationPage from "@/components/pages/EmailVerificationPage";
import SearchResultsPage from "@/components/pages/SearchResultsPage";
import ProfilePage from "@/components/pages/ProfilePage";

// Types
interface NavigationData {
  category?: string;
  userName?: string;
  userEmail?: string;
  registeredEmail?: string;
  searchQuery?: string;
  userId?: string;
  productId?: string;
  orderId?: string;
}

// Komponen Utama Aplikasi (Isi)
function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<"user" | "admin" | null>(null);
  const [isCustomerOnly, setIsCustomerOnly] = useState(false);
  const [showSellerWelcome, setShowSellerWelcome] = useState(false);
  
  // Data State
  const [googleUserData, setGoogleUserData] = useState<{ userName?: string; userEmail?: string } | null>(null);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

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
    setIsLoggedIn(false);
    setUserRole(null);
    setIsCustomerOnly(false);
    setShowSellerWelcome(false);
    navigate("/");
  };

  const handleToggleUserType = () => {
    setIsCustomerOnly((prev) => !prev);
  };

  const handleStartSelling = () => {
    setIsCustomerOnly(false);
    setShowSellerWelcome(true);
  };

  // Helper to get ID from URL
  const pathParts = location.pathname.split('/');
  const currentId = pathParts[2] || null;

  // Page Logic
  const noFooterPages = ["/login", "/register", "/forgot-password", "/faculty-selection", "/email-verification", "/chat", "/checkout", "/cart", "/order-detail", "/rating", "/notifications", "/admin-notifications", "/payment-success", "/booking-success", "/admin"];
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar
        currentPage={location.pathname}
        onNavigate={handleNavigate}
        isLoggedIn={isLoggedIn}
        userRole={userRole}
        isCustomerOnly={isCustomerOnly}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onToggleUserType={handleToggleUserType}
      />

      {/* Seller Welcome Popup - SUDAH LENGKAP */}
      {showSellerWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md mx-4 p-6 text-center animate-in fade-in-0 zoom-in-95">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center">
              <span className="text-4xl">🎉</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Selamat Bergabung sebagai Seller!
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Kamu sekarang bisa mulai berjualan di KampusMarket. 
              Tambahkan produk pertamamu dan mulai dapatkan penghasilan!
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowSellerWelcome(false)}
                className="flex-1"
              >
                Nanti Saja
              </Button>
              <Button
                onClick={() => {
                  setShowSellerWelcome(false);
                  handleNavigate("add-product");
                }}
                className="flex-1 bg-primary-600 hover:bg-primary-700"
              >
                Tambah Produk
              </Button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1">
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage onNavigate={handleNavigate} onLogin={handleLogin} />} />
          <Route path="/register" element={<RegisterPage onNavigate={handleNavigate} onLogin={handleLogin} />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage onNavigate={handleNavigate} />} />
          <Route path="/faculty-selection" element={<FacultySelectionPage onNavigate={handleNavigate} onLogin={handleLogin} userName={googleUserData?.userName} userEmail={googleUserData?.userEmail} />} />
          <Route path="/email-verification" element={<EmailVerificationPage onNavigate={handleNavigate} email={registeredEmail || undefined} />} />
          
          {/* Main Routes */}
          <Route path="/" element={<LandingPage onNavigate={handleNavigate} isLoggedIn={isLoggedIn} isCustomerOnly={isCustomerOnly} onStartSelling={handleStartSelling} />} />
          <Route path="/catalog" element={<CatalogPage onNavigate={handleNavigate} />} />
          <Route path="/services" element={<ServicesPage onNavigate={handleNavigate} />} />
          <Route path="/product/:id" element={<ProductDetailPage onNavigate={handleNavigate} productId={currentId || "p1"} isLoggedIn={isLoggedIn} onLogin={handleLogin} />} />
          <Route path="/service/:id" element={<ServiceDetailPage onNavigate={handleNavigate} serviceId={currentId || "s1"} />} />
          
          {/* Transaction Routes */}
          <Route path="/checkout" element={<CheckoutPage onNavigate={handleNavigate} />} />
          <Route path="/cart" element={<CartPage onNavigate={handleNavigate} />} />
          <Route path="/payment-success" element={<PaymentSuccessPage onNavigate={handleNavigate} />} />
          <Route path="/booking-success" element={<BookingSuccessPage onNavigate={handleNavigate} />} />
          
          {/* User Routes */}
          <Route path="/dashboard" element={<UserDashboardPage onNavigate={handleNavigate} currentPage="dashboard" />} />
          <Route path="/my-products" element={<UserDashboardPage onNavigate={handleNavigate} currentPage="my-products" />} />
          <Route path="/wallet" element={<UserDashboardPage onNavigate={handleNavigate} currentPage="wallet" />} />
          <Route path="/settings" element={<UserDashboardPage onNavigate={handleNavigate} currentPage="settings" />} />
          <Route path="/orders" element={<OrdersListPage onNavigate={handleNavigate} />} />
          <Route path="/order-detail/:id" element={<OrderDetailPage onNavigate={handleNavigate} orderId={currentId || undefined} />} />
          <Route path="/rating" element={<RatingPage onNavigate={handleNavigate} />} />
          <Route path="/chat" element={<ChatPage onNavigate={handleNavigate} />} />
          <Route path="/notifications" element={<UserNotificationsPage onNavigate={handleNavigate} />} />
          <Route path="/profile/:id?" element={<ProfilePage onNavigate={handleNavigate} userId={currentId || undefined} />} />
          <Route path="/add-product" element={<AddProductPage onNavigate={handleNavigate} />} />
          
          {/* Search & Admin */}
          <Route path="/search" element={<SearchResultsPage onNavigate={handleNavigate} />} />
          <Route path="/admin" element={<AdminDashboardPage onNavigate={handleNavigate} />} />
          <Route path="/admin-notifications" element={<AdminNotificationsPage onNavigate={handleNavigate} />} />
        </Routes>
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