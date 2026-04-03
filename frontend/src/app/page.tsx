"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
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

// Navigation data type
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

export default function Home() {
  // Get initial page from URL hash
  const initialPage = useMemo(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.slice(1);
      return hash || "landing";
    }
    return "landing";
  }, []);

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<"user" | "admin" | null>(null);
  const [isCustomerOnly, setIsCustomerOnly] = useState(false); // true = customer only, false = seller
  const [showSellerWelcome, setShowSellerWelcome] = useState(false); // popup for new seller
  const [googleUserData, setGoogleUserData] = useState<{ userName?: string; userEmail?: string } | null>(null);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  const handleNavigate = (page: string, data?: string | NavigationData) => {
    setCurrentPage(page);
    
    // Handle different data types
    if (typeof data === "string") {
      // Product/Service/User/Order ID
      if (page === "profile") {
        setSelectedUserId(data);
        setSelectedOrderId(null);
      } else if (page === "order-detail" || page === "rating") {
        setSelectedOrderId(data);
        setSelectedProductId(null);
        setSelectedUserId(null);
      } else {
        setSelectedProductId(data);
        setSelectedUserId(null);
        setSelectedOrderId(null);
      }
      setSelectedCategory(null);
      setSearchQuery(null);
    } else if (data) {
      // Navigation data object
      if ("category" in data && data.category) {
        setSelectedCategory(data.category);
        setSelectedProductId(null);
        setSelectedUserId(null);
      }
      if ("searchQuery" in data && data.searchQuery) {
        setSearchQuery(data.searchQuery);
        setSelectedProductId(null);
        setSelectedCategory(null);
        setSelectedUserId(null);
      }
      if ("userId" in data && data.userId) {
        setSelectedUserId(data.userId);
        setSelectedProductId(null);
        setSelectedCategory(null);
      }
      if ("productId" in data && data.productId) {
        setSelectedProductId(data.productId);
        setSelectedUserId(null);
      }
      if ("userName" in data || "userEmail" in data) {
        setGoogleUserData({
          userName: data.userName,
          userEmail: data.userEmail,
        });
      }
      if ("registeredEmail" in data && data.registeredEmail) {
        setRegisteredEmail(data.registeredEmail);
      }
    } else {
      // No data - reset category
      setSelectedCategory(null);
    }
    
    window.location.hash = page;
    window.scrollTo(0, 0);
  };

  const handleLogin = (role: "user" | "admin" = "user", customerOnly: boolean = false) => {
    setIsLoggedIn(true);
    setUserRole(role);
    setIsCustomerOnly(customerOnly);
    if (role === "admin") {
      setCurrentPage("admin");
      window.location.hash = "admin";
    } else {
      setCurrentPage("landing");
      window.location.hash = "landing";
    }
  };

  // Toggle demo user type (seller vs customer-only)
  const handleToggleUserType = () => {
    setIsCustomerOnly((prev) => !prev);
  };

  // Handle when customer wants to start selling
  const handleStartSelling = () => {
    setIsCustomerOnly(false);
    setShowSellerWelcome(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setIsCustomerOnly(false);
    setShowSellerWelcome(false);
    setCurrentPage("landing");
    window.location.hash = "landing";
  };

  // Listen to hash changes for browser navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash && hash !== currentPage) {
        setCurrentPage(hash);
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [currentPage]);

  // Pages that don't need footer (admin pages use minimal footer)
  const noFooterPages = ["login", "register", "forgot-password", "faculty-selection", "email-verification", "chat", "checkout", "cart", "order-detail", "rating", "notifications", "admin-notifications", "payment-success", "booking-success", "admin"];
  // Pages that don't need navbar
  const noNavbarPages: string[] = [];

  // Check if current page is admin-related
  const isAdminPage = currentPage === "admin" || currentPage === "admin-notifications";

  const renderPage = () => {
    switch (currentPage) {
      case "login":
        return <LoginPage onNavigate={handleNavigate} onLogin={handleLogin} />;
      case "register":
        return <RegisterPage onNavigate={handleNavigate} onLogin={handleLogin} />;
      case "forgot-password":
        return <ForgotPasswordPage onNavigate={handleNavigate} />;
      case "faculty-selection":
        return (
          <FacultySelectionPage
            onNavigate={handleNavigate}
            onLogin={handleLogin}
            userName={googleUserData?.userName}
            userEmail={googleUserData?.userEmail}
          />
        );
      case "email-verification":
        return (
          <EmailVerificationPage
            onNavigate={handleNavigate}
            email={registeredEmail || undefined}
          />
        );
      case "catalog":
        return <CatalogPage onNavigate={handleNavigate} initialCategory={selectedCategory} />;
      case "services":
        return <ServicesPage onNavigate={handleNavigate} initialCategory={selectedCategory} />;
      case "product":
        return (
          <ProductDetailPage
            onNavigate={handleNavigate}
            productId={selectedProductId || "p1"}
            isLoggedIn={isLoggedIn}
            onLogin={handleLogin}
          />
        );
      case "service":
        return (
          <ServiceDetailPage
            onNavigate={handleNavigate}
            serviceId={selectedProductId || "s1"}
          />
        );
      case "checkout":
        return <CheckoutPage onNavigate={handleNavigate} productId={selectedProductId || undefined} />;
      case "payment-success":
        return <PaymentSuccessPage onNavigate={handleNavigate} />;
      case "booking-success":
        return <BookingSuccessPage onNavigate={handleNavigate} />;
      case "cart":
        return <CartPage onNavigate={handleNavigate} />;
      case "add-product":
        return <AddProductPage onNavigate={handleNavigate} />;
      case "orders":
        return <OrdersListPage onNavigate={handleNavigate} />;
      case "order-detail":
        return <OrderDetailPage onNavigate={handleNavigate} orderId={selectedOrderId || undefined} />;
      case "rating":
        return <RatingPage onNavigate={handleNavigate} />;
      case "dashboard":
        return <UserDashboardPage onNavigate={handleNavigate} currentPage="dashboard" />;
      case "my-products":
        return <UserDashboardPage onNavigate={handleNavigate} currentPage="my-products" />;
      case "dashboard-wallet":
        return <UserDashboardPage onNavigate={handleNavigate} currentPage="wallet" />;
      case "settings":
        return <UserDashboardPage onNavigate={handleNavigate} currentPage="settings" />;
      case "orders":
        return <UserDashboardPage onNavigate={handleNavigate} currentPage="orders" />;
      case "chat":
        return <ChatPage onNavigate={handleNavigate} />;
      case "notifications":
        return <UserNotificationsPage onNavigate={handleNavigate} />;
      case "admin":
        return <AdminDashboardPage onNavigate={handleNavigate} />;
      case "admin-notifications":
        return <AdminNotificationsPage onNavigate={handleNavigate} />;
      case "search":
        return <SearchResultsPage onNavigate={handleNavigate} searchQuery={searchQuery || undefined} />;
      case "profile":
        return <ProfilePage onNavigate={handleNavigate} userId={selectedUserId || undefined} />;
      case "wallet":
        return <UserDashboardPage onNavigate={handleNavigate} currentPage="wallet" />;
      case "landing":
      default:
        return (
          <LandingPage
            onNavigate={handleNavigate}
            isLoggedIn={isLoggedIn}
            isCustomerOnly={isCustomerOnly}
            onStartSelling={handleStartSelling}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {!noNavbarPages.includes(currentPage) && (
        <Navbar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          isLoggedIn={isLoggedIn}
          userRole={userRole}
          isCustomerOnly={isCustomerOnly}
          onLogin={handleLogin}
          onLogout={handleLogout}
          onToggleUserType={handleToggleUserType}
        />
      )}
      
      {/* Seller Welcome Popup */}
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
        {renderPage()}
      </main>
      
      {/* Footer Logic */}
      {isAdminPage ? (
        <AdminFooter />
      ) : !noFooterPages.includes(currentPage) && (
        <Footer onNavigate={handleNavigate} />
      )}
    </div>
  );
}
