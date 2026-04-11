"use client";

import { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AdminFooter from "@/components/layout/AdminFooter";
import SellerWelcomeModal from "@/app/components/SellerWelcomeModal";
import { renderPage } from "@/app/navigation/renderPage";
import { NO_FOOTER_PAGES, NO_NAVBAR_PAGES } from "@/app/navigation/constants";
import type { NavigationData, GooglePendingSession } from "@/app/navigation/types";

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
  const [chatAction, setChatAction] = useState<"chat" | "nego" | null>(null);
  const [selectedSuccessType, setSelectedSuccessType] = useState<"product" | "service" | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<"user" | "admin" | null>(null);
  const [isCustomerOnly, setIsCustomerOnly] = useState(false); // true = customer only, false = seller
  const [showSellerWelcome, setShowSellerWelcome] = useState(false); // popup for new seller
  const [googleUserData, setGoogleUserData] = useState<{ userName?: string; userEmail?: string } | null>(null);
  const [googleAuthToken, setGoogleAuthToken] = useState<string | null>(null);
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
      setChatAction(null);
      setSelectedSuccessType(null);
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
      if ("chatAction" in data) {
        setChatAction(data.chatAction || null);
      } else {
        setChatAction(null);
      }
      if ("successType" in data) {
        setSelectedSuccessType(data.successType || null);
      } else {
        setSelectedSuccessType(null);
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
      setChatAction(null);
      setSelectedSuccessType(null);
    }

    if (page !== "chat") {
      setChatAction(null);
    }
    
    window.location.hash = page;
    window.scrollTo(0, 0);
  };

  const handleLogin = (role: "user" | "admin" = "user", customerOnly: boolean = false) => {
    setGoogleAuthToken(null);
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

  const handleGooglePendingSelection = (session: GooglePendingSession) => {
    setGoogleAuthToken(session.token);
    setGoogleUserData({
      userName: session.userName,
      userEmail: session.userEmail,
    });
    setCurrentPage("faculty-selection");
    window.location.hash = "faculty-selection";
    window.scrollTo(0, 0);
  };

  const handleLogout = () => {
    setGoogleAuthToken(null);
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

  // Check if current page is admin-related
  const isAdminPage = currentPage === "admin" || currentPage === "admin-notifications";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {!NO_NAVBAR_PAGES.includes(currentPage) && (
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
      
      <SellerWelcomeModal
        open={showSellerWelcome}
        onClose={() => setShowSellerWelcome(false)}
        onNavigate={handleNavigate}
      />
      
      <main className="flex-1">
        {renderPage({
          currentPage,
          selectedProductId,
          selectedUserId,
          selectedOrderId,
          selectedCategory,
          searchQuery,
          chatAction,
          selectedSuccessType,
          registeredEmail,
          googleUserData,
          googleAuthToken,
          isLoggedIn,
          onNavigate: handleNavigate,
          onLogin: handleLogin,
          onGooglePendingSelection: handleGooglePendingSelection,
          onStartSelling: handleStartSelling,
          isCustomerOnly,
        })}
      </main>
      
      {/* Footer Logic */}
      {isAdminPage ? (
        <AdminFooter />
      ) : !NO_FOOTER_PAGES.includes(currentPage) && (
        <Footer onNavigate={handleNavigate} />
      )}
    </div>
  );
}
