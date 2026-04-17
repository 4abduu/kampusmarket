"use client";

import { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AdminFooter from "@/components/layout/AdminFooter";
import SellerWelcomeModal from "@/app/components/SellerWelcomeModal";
import { renderPage } from "@/app/navigation/renderPage";
import { NO_FOOTER_PAGES, NO_NAVBAR_PAGES } from "@/app/navigation/constants";
import type { NavigationData, GooglePendingSession } from "@/app/navigation/types";
import { getInitialSellerProductCount } from "@/components/pages/user/dashboard/seller-products";

function getPageFromLocation(): string {
  if (typeof window === "undefined") {
    return "landing";
  }

  const hash = window.location.hash.slice(1);
  if (hash) {
    return hash.split("?")[0] || "landing";
  }

  const pathname = window.location.pathname.replace(/^\/+/, "");
  if (pathname) {
    return pathname.split("/")[0] || "landing";
  }

  return "landing";
}

export default function Home() {
  // Get initial page from URL hash
  const initialPage = useMemo(() => {
    return getPageFromLocation();
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
  const [sellerProductCount, setSellerProductCount] = useState(getInitialSellerProductCount());
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

  const handleLogin = (role: "user" | "admin" = "user") => {
    setIsLoggedIn(true);
    setUserRole(role);
    if (role === "admin") {
      setCurrentPage("admin");
      window.location.hash = "admin";
    } else {
      setCurrentPage("landing");
      window.location.hash = "landing";
    }
  };

  // Handle when customer wants to start selling
  const handleStartSelling = () => {
    setShowSellerWelcome(true);
  };

  const handleGooglePendingSelection = (session: GooglePendingSession) => {
    setGoogleUserData({
      userName: session.userName,
      userEmail: session.userEmail,
    });
    setCurrentPage("faculty-selection");
    window.location.hash = "faculty-selection";
    window.scrollTo(0, 0);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
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

  // Handle Google OAuth redirect back from backend.
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get("token");

    if (!token) {
      return;
    }

    const requiresFacultySelection = searchParams.get("requiresFacultySelection") === "true";
    const isNewUser = searchParams.get("isNewUser") === "true";
    const userName = searchParams.get("userName") || undefined;
    const userEmail = searchParams.get("userEmail") || undefined;

    setGoogleUserData({ userName, userEmail });
    setIsLoggedIn(true);
    setUserRole("user");

    const nextPage = requiresFacultySelection ? "faculty-selection" : getPageFromLocation() === "dashboard" ? "dashboard" : "landing";

    if (requiresFacultySelection) {
      setCurrentPage("faculty-selection");
      window.location.hash = "faculty-selection";
    } else if (nextPage === "dashboard") {
      setCurrentPage("dashboard");
      window.location.hash = "dashboard";
    } else {
      setCurrentPage("landing");
      window.location.hash = "landing";
    }

    if (isNewUser && !requiresFacultySelection) {
      setShowSellerWelcome(false);
    }

    const cleanUrl = `${window.location.pathname}${window.location.hash ? window.location.hash : ""}`;
    window.history.replaceState({}, document.title, cleanUrl);
  }, []);

  // Check if current page is admin-related
  const isAdminPage = currentPage === "admin" || currentPage === "admin-notifications";
  const hasSellerProducts = sellerProductCount > 0;
  const isCustomerOnly = !hasSellerProducts;

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
          isLoggedIn,
          onNavigate: handleNavigate,
          onLogin: handleLogin,
          onGooglePendingSelection: handleGooglePendingSelection,
          onStartSelling: handleStartSelling,
          isCustomerOnly,
          onSellerProductCountChange: setSellerProductCount,
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
