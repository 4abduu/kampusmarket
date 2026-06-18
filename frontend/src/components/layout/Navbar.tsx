"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ShoppingCart,
  Search,
  Menu,
  User,
  Heart,
  Package,
  MessageCircle,
  Wallet,
  Settings,
  LogOut,
  LayoutDashboard,
  Bell,
  ShieldCheck,
  PlusCircle,
  ReceiptText,
  Home,
  Briefcase,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useNotificationStore } from "@/lib/notification-store";
import { useChatStore } from "@/lib/chat-store";
import { useAdminNotificationStore } from "@/lib/admin-notification-store";
import { useCartStore } from "@/lib/cart-store";
import { useFavoritesStore } from "@/lib/favorites-store";
import type { User as AppUser } from "@/lib/mock-data";

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string, data?: string | { searchQuery?: string }) => void;
  isLoggedIn: boolean;
  userRole: "user" | "admin" | null;
  currentUser?: AppUser | null;
  isCustomerOnly?: boolean;
  onLogin: () => void;
  onLogout: () => void;
}

export default function Navbar({
  currentPage,
  onNavigate,
  isLoggedIn,
  userRole,
  currentUser,
  isCustomerOnly = false,
  onLogin: _onLogin,
  onLogout,
}: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userUnreadCount = useNotificationStore((state) => state.unreadCount);
  const chatUnreadCount = useChatStore((state) => state.unreadCount);
  const adminUnreadCount = useAdminNotificationStore((state) => state.unreadCount);
  const cartCount = useCartStore((state) => state.count);
  const favoritesCount = useFavoritesStore((state) => state.count);
  const displayName = currentUser?.name || (isCustomerOnly ? "Rina Wulandari" : "Ahmad Santoso");
  const displayEmail = currentUser?.email || (isCustomerOnly ? "rina.wulandari@student.ac.id" : "ahmad@student.ac.id");
  const displayAvatar = currentUser?.avatar || "/avatar.png";
  const displayInitials = displayName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const walletText = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(currentUser?.walletBalance || 0);

  const isActive = (page: string) => {
    if (page === "landing" && (currentPage === "/" || currentPage === "")) return true;
    return currentPage.startsWith(`/${page}`);
  };

  // Check if we're on any "account" page (dashboard, profile, settings, wallet, orders, my-products, etc.)
  const isAccountActive = () => {
    const accountPages = ["/dashboard", "/profile", "/settings", "/wallet", "/orders", "/my-products", "/add-product", "/favorites", "/notifications"];
    return accountPages.some(p => currentPage.startsWith(p));
  };

  // User nav links
  const userNavLinks = [
    { href: "#catalog", label: "Katalog", page: "catalog" },
    { href: "#services", label: "Jasa", page: "services" },
    { href: "#how-it-works", label: "Cara Kerja", page: "how-it-works" },
  ];

  const handleNavClick = (page: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (page === "how-it-works") {
      const el = document.getElementById("how-it-works");
      if (el && window.location.pathname === "/") {
        el.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.href = "/#how-it-works";
      }
    } else {
      onNavigate(page);
    }
  };

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onNavigate("search", { searchQuery: searchQuery.trim() });
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Admin Navbar
  if (userRole === "admin" && isLoggedIn) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-slate-900 text-white">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          {/* Logo */}
          <a
            href="#"
            onClick={(e) => handleNavClick("admin", e)}
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-white tracking-tight">KampusMarket</span>
              <span className="text-[9px] text-amber-400 font-medium tracking-wide">ADMIN PANEL</span>
            </div>
          </a>

          {/* Right Side Actions */}
          <div className="flex items-center gap-1">
            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative text-slate-400 hover:text-white hover:bg-slate-800"
              onClick={() => onNavigate("admin-notifications")}
            >
              <Bell className="h-5 w-5" />
              {adminUnreadCount > 0 && (
                <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center p-0 text-[10px] bg-red-500 text-white border-2 border-slate-900">
                  {adminUnreadCount}
                </Badge>
              )}
            </Button>

            {/* Admin Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full hover:bg-slate-800">
                  <Avatar className="h-8 w-8 border-2 border-amber-500/50">
                    <AvatarImage src="/avatar.png" alt="Admin" />
                    <AvatarFallback className="bg-amber-100 text-amber-700 font-bold text-sm">
                      AD
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-2">
                    <p className="text-sm font-semibold">Admin KampusMarket</p>
                    <p className="text-xs text-muted-foreground">
                      admin@kampusmarket.com
                    </p>
                    <Badge variant="secondary" className="w-fit text-xs bg-amber-100 text-amber-700 hover:bg-amber-100">
                      Super Admin
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onNavigate("admin-notifications")}>
                  <Bell className="mr-2 h-4 w-4" />
                  <span>Notifikasi</span>
                  {adminUnreadCount > 0 && (
                    <Badge className="ml-auto bg-red-500 text-white text-xs">{adminUnreadCount}</Badge>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Keluar</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-slate-400 hover:text-white">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-gradient-to-b from-slate-900 to-slate-950 text-white border-slate-700 overflow-y-auto">
                <div className="flex flex-col gap-4 mt-6 pb-8">
                  <Button
                    variant="ghost"
                    onClick={() => { onNavigate("admin"); closeMobileMenu(); }}
                    className="w-full justify-start h-11 px-4 text-sm rounded-lg hover:bg-slate-800 transition-colors duration-200"
                  >
                    <LayoutDashboard className="h-4 w-4 mr-3 text-amber-500" />
                    <span className="font-medium">Dashboard</span>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => { onNavigate("admin-notifications"); closeMobileMenu(); }}
                    className="w-full justify-start h-11 px-4 text-sm rounded-lg hover:bg-slate-800 transition-colors duration-200"
                  >
                    <Bell className="h-4 w-4 mr-3 text-amber-500" />
                    <span className="font-medium">Notifikasi</span>
                    {adminUnreadCount > 0 && (
                      <Badge className="ml-auto bg-red-500 text-white text-xs">{adminUnreadCount}</Badge>
                    )}
                  </Button>

                  <div className="border-t border-slate-700 pt-4 mt-4">
                    <Button
                      onClick={() => { onLogout(); closeMobileMenu(); }}
                      className="w-full h-11 px-4 text-sm font-medium bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Keluar
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    );
  }

  // Regular User Navbar
  return (
    <>
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <a
          href="#"
          onClick={(e) => handleNavClick("landing", e)}
          className="flex items-center gap-2"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-secondary-600">
            <Package className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            KampusMarket
          </span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {userNavLinks.map((link) => (
            <a
              key={link.page}
              href={link.href}
              onClick={(e) => handleNavClick(link.page, e)}
              className={`text-sm font-medium transition-colors hover:text-primary-600 ${
                isActive(link.page)
                  ? "text-primary-600"
                  : "text-muted-foreground"
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Search Bar */}
        <div className="hidden lg:flex items-center flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <Search 
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground cursor-pointer hover:text-primary-600 transition-colors"
              onClick={handleSearch}
            />
            <Input
              type="search"
              placeholder="Cari barang, jasa, atau pengguna..."
              className="pl-10 pr-4 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              {/* Cart Button */}
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => onNavigate("cart")}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {cartCount > 99 ? '99+' : cartCount}
                  </Badge>
                )}
              </Button>

              {/* Messages */}
              <Button
                variant="ghost"
                size="icon"
                className="relative hidden md:flex"
                onClick={() => onNavigate("chat")}
              >
                <MessageCircle className="h-5 w-5" />
                {chatUnreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {chatUnreadCount > 99 ? '99+' : chatUnreadCount}
                  </Badge>
                )}
              </Button>

              {/* Notifications */}
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => onNavigate("notifications")}
              >
                <Bell className="h-5 w-5" />
                {userUnreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500">
                    {userUnreadCount}
                  </Badge>
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="relative hidden md:flex text-slate-500 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/30"
                onClick={() => onNavigate("favorites")}
              >
                <Heart className="h-5 w-5" />
                {favoritesCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 text-white">
                    {favoritesCount > 99 ? '99+' : favoritesCount}
                  </Badge>
                )}
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full ml-1">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={displayAvatar} alt={displayName} />
                      <AvatarFallback className="bg-primary-100 text-primary-700 font-bold">
                        {displayInitials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {displayName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {displayEmail}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {/* Menu items */}
                  <DropdownMenuItem onClick={() => onNavigate("dashboard")}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onNavigate("wallet")}>
                    <Wallet className="mr-2 h-4 w-4" />
                    <span>Dompet ({walletText})</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onNavigate("orders")}>
                    <ReceiptText className="mr-2 h-4 w-4" />
                    <span>Pesanan Saya</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onNavigate("my-products")}>
                    <Package className="mr-2 h-4 w-4" />
                    <span>Produk Saya</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onNavigate("add-product")}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    <span>Tambah Produk</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onNavigate("favorites")}>
                    <Heart className="mr-2 h-4 w-4" />
                    <span>Favorit</span>
                    {favoritesCount > 0 && (
                      <Badge className="ml-auto text-xs bg-rose-100 text-rose-700">{favoritesCount > 99 ? '99+' : favoritesCount}</Badge>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onNavigate("settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Pengaturan</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => currentUser?.id && onNavigate("profile", currentUser.id)}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Lihat Profil Saya</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout} className="text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Keluar</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={() => onNavigate("login")}
                className="hidden sm:flex h-9 px-4 text-sm font-medium"
              >
                Masuk
              </Button>
              <Button
                onClick={() => onNavigate("register")}
                className="h-9 px-4 text-sm font-medium bg-primary-600 hover:bg-primary-700"
              >
                Daftar
              </Button>
            </>
          )}

          {/* Mobile Menu Sheet */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetContent 
              side="right" 
              className="w-[85vw] sm:w-80 overflow-y-auto bg-background p-0"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <div className="flex flex-col py-6 pb-8">
                {/* Mobile Nav Links */}
                <nav className="flex flex-col gap-1 px-3">
                  {userNavLinks.map((link) => (
                    <a
                      key={link.page}
                      href={link.href}
                      onClick={(e) => {
                         handleNavClick(link.page, e);
                         closeMobileMenu();
                      }}
                      className="flex items-center px-4 py-3 text-sm font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  ))}
                </nav>

                {isLoggedIn ? (
                  <>
                    <div className="px-5 py-4 mt-2">
                      <div className="flex items-center gap-3 p-4 bg-slate-100 dark:bg-slate-800/50 rounded-2xl">
                        <Avatar className="h-12 w-12 border-2 border-white dark:border-slate-700 shadow-sm">
                          <AvatarImage src={displayAvatar} alt={displayName} />
                          <AvatarFallback className="bg-primary-100 text-primary-700 font-bold text-lg">
                            {displayInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col flex-1 min-w-0">
                          <p className="text-base font-bold truncate text-slate-900 dark:text-slate-100">{displayName}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{displayEmail}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 px-3">
                      <Button
                        variant="ghost"
                        onClick={() => { onNavigate("dashboard"); closeMobileMenu(); }}
                        className="w-full justify-start h-12 px-4 text-sm rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
                      >
                        <LayoutDashboard className="h-5 w-5 mr-3 text-primary-600" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Dashboard Utama</span>
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => { onNavigate("wallet"); closeMobileMenu(); }}
                        className="w-full justify-start h-12 px-4 text-sm rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
                      >
                        <Wallet className="h-5 w-5 mr-3 text-slate-500" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Dompet Saya</span>
                        <span className="ml-auto text-xs text-primary-600 font-bold">{walletText}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => { onNavigate("orders"); closeMobileMenu(); }}
                        className="w-full justify-start h-12 px-4 text-sm rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
                      >
                        <ReceiptText className="h-5 w-5 mr-3 text-slate-500" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Pesanan Saya</span>
                      </Button>
                    </div>

                    <div className="border-t border-slate-200 dark:border-slate-800 my-4 mx-5"></div>

                    <div className="flex flex-col gap-1 px-3">
                      <Button
                        variant="ghost"
                        onClick={() => { onNavigate("my-products"); closeMobileMenu(); }}
                        className="w-full justify-start h-12 px-4 text-sm rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
                      >
                        <Package className="h-5 w-5 mr-3 text-slate-500" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Produk Saya</span>
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => { onNavigate("add-product"); closeMobileMenu(); }}
                        className="w-full justify-start h-12 px-4 text-sm rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
                      >
                        <PlusCircle className="h-5 w-5 mr-3 text-slate-500" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Tambah Produk</span>
                      </Button>
                    </div>

                    <div className="border-t border-slate-200 dark:border-slate-800 my-4 mx-5"></div>

                    <div className="flex flex-col gap-1 px-3">
                      <Button
                        variant="ghost"
                        onClick={() => { onNavigate("settings"); closeMobileMenu(); }}
                        className="w-full justify-start h-12 px-4 text-sm rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
                      >
                        <Settings className="h-5 w-5 mr-3 text-slate-500" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Pengaturan</span>
                      </Button>
                      {currentUser?.id && (
                        <Button
                          variant="ghost"
                          onClick={() => { onNavigate("profile", currentUser.id); closeMobileMenu(); }}
                          className="w-full justify-start h-12 px-4 text-sm rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
                        >
                          <User className="h-5 w-5 mr-3 text-slate-500" />
                          <span className="font-semibold text-slate-700 dark:text-slate-300">Lihat Profil</span>
                        </Button>
                      )}
                    </div>

                    <div className="mt-8 px-5">
                      <Button
                        onClick={() => { onLogout(); closeMobileMenu(); }}
                        className="w-full h-12 px-4 text-sm font-bold bg-slate-100 hover:bg-red-50 text-red-600 hover:text-red-700 dark:bg-slate-800 dark:hover:bg-red-950/30 rounded-xl transition-colors duration-200"
                      >
                        <LogOut className="h-5 w-5 mr-2" />
                        Keluar
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col gap-3 mt-6 px-5">
                    <Button
                      variant="outline"
                      onClick={() => { onNavigate("login"); closeMobileMenu(); }}
                      className="w-full h-12 px-4 text-sm font-bold rounded-xl border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200"
                    >
                      Masuk
                    </Button>
                    <Button
                      onClick={() => { onNavigate("register"); closeMobileMenu(); }}
                      className="w-full h-12 px-4 text-sm font-bold bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      Daftar Sekarang
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Mobile Search Bar */}
        <div className="pb-3 px-3 md:hidden">
          <div className="relative w-full">
            <Search 
              className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 cursor-pointer hover:text-primary-600 transition-colors"
              onClick={handleSearch}
            />
            <Input
              type="search"
              placeholder="Cari barang, jasa..."
              className="pl-11 pr-4 w-full h-11 bg-slate-100 dark:bg-slate-800/50 border-transparent rounded-2xl focus:bg-background focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 transition-all text-sm shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
          </div>
        </div>
    </header>

    {/* Bottom Navigation (Mobile Only) */}
    <div className="fixed bottom-0 left-0 z-40 w-full h-[68px] bg-background/95 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-800/50 flex justify-around items-center pb-safe md:hidden shadow-[0_-8px_16px_rgba(0,0,0,0.03)]">
      <button onClick={() => onNavigate("landing")} className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive("landing") ? "text-primary-600" : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"}`}>
        <Home className={`h-6 w-6 ${isActive("landing") ? "fill-primary-100 text-primary-600" : ""}`} strokeWidth={isActive("landing") ? 2 : 1.5} />
        <span className="text-[10px] font-semibold tracking-wide">Beranda</span>
      </button>
      <button onClick={() => onNavigate("catalog")} className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive("catalog") ? "text-primary-600" : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"}`}>
        <Package className={`h-6 w-6 ${isActive("catalog") ? "fill-primary-100 text-primary-600" : ""}`} strokeWidth={isActive("catalog") ? 2 : 1.5} />
        <span className="text-[10px] font-semibold tracking-wide">Katalog</span>
      </button>
      <button onClick={() => onNavigate("services")} className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive("services") ? "text-primary-600" : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"}`}>
        <Briefcase className={`h-6 w-6 ${isActive("services") ? "fill-primary-100 text-primary-600" : ""}`} strokeWidth={isActive("services") ? 2 : 1.5} />
        <span className="text-[10px] font-semibold tracking-wide">Jasa</span>
      </button>

      {isLoggedIn ? (
        <>
          <button onClick={() => onNavigate("chat")} className={`relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive("chat") ? "text-primary-600" : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"}`}>
            <div className="relative">
              <MessageCircle className={`h-6 w-6 ${isActive("chat") ? "fill-primary-100 text-primary-600" : ""}`} strokeWidth={isActive("chat") ? 2 : 1.5} />
              {chatUnreadCount > 0 && <Badge className="absolute -top-1.5 -right-2 h-[18px] min-w-[18px] px-1 flex items-center justify-center text-[10px] bg-red-500 shadow-sm border-2 border-background">{chatUnreadCount > 99 ? '99+' : chatUnreadCount}</Badge>}
            </div>
            <span className="text-[10px] font-semibold tracking-wide">Pesan</span>
          </button>
          <button onClick={() => onNavigate("dashboard")} className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isAccountActive() ? "text-primary-600" : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"}`}>
            <User className={`h-6 w-6 ${isAccountActive() ? "fill-primary-100 text-primary-600" : ""}`} strokeWidth={isAccountActive() ? 2 : 1.5} />
            <span className="text-[10px] font-semibold tracking-wide">Profil</span>
          </button>
        </>
      ) : (
        <button onClick={() => setMobileMenuOpen(true)} className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${mobileMenuOpen ? "text-primary-600" : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"}`}>
          <Menu className={`h-6 w-6 ${mobileMenuOpen ? "text-primary-600" : ""}`} strokeWidth={mobileMenuOpen ? 2 : 1.5} />
          <span className="text-[10px] font-semibold tracking-wide">Lainnya</span>
        </button>
      )}
    </div>
    </>
  );
}
