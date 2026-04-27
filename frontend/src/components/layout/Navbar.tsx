"use client";

import { useState } from "react";
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
  Home,
  ShieldCheck,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useNotificationStore } from "@/lib/notification-store";
import { useAdminNotificationStore } from "@/lib/admin-notification-store";
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
  const userUnreadCount = useNotificationStore((state) => state.unreadCount);
  const adminUnreadCount = useAdminNotificationStore((state) => state.unreadCount);
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

  // User nav links
  const userNavLinks = [
    { href: "#catalog", label: "Katalog", page: "catalog" },
    { href: "#services", label: "Jasa", page: "services" },
    { href: "#how-it-works", label: "Cara Kerja", page: "landing" },
  ];

  const handleNavClick = (page: string, e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate(page);
  };

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
                      admin@kampusmarket.id
                    </p>
                    <Badge variant="secondary" className="w-fit text-xs bg-amber-100 text-amber-700 hover:bg-amber-100">
                      Super Admin
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onNavigate("landing")}>
                  <Home className="mr-2 h-4 w-4" />
                  <span>Lihat Website</span>
                </DropdownMenuItem>
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
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-slate-400 hover:text-white">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-slate-900 text-white border-slate-700">
                <div className="flex flex-col gap-4 mt-8">
                  <Button
                    variant="ghost"
                    onClick={() => onNavigate("admin")}
                    className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
                  >
                    <LayoutDashboard className="h-4 w-4 mr-3" />
                    Dashboard
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => onNavigate("admin-notifications")}
                    className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
                  >
                    <Bell className="h-4 w-4 mr-3" />
                    Notifikasi
                    {adminUnreadCount > 0 && (
                      <Badge className="ml-auto bg-red-500 text-white text-xs">{adminUnreadCount}</Badge>
                    )}
                  </Button>

                  <div className="border-t border-slate-700 pt-4 mt-4">
                    <Button
                      variant="outline"
                      onClick={onLogout}
                      className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500"
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
                currentPage === link.page
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
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  3
                </Badge>
              </Button>

              {/* Messages */}
              <Button
                variant="ghost"
                size="icon"
                className="relative hidden sm:flex"
                onClick={() => onNavigate("chat")}
              >
                <MessageCircle className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  2
                </Badge>
              </Button>

              {/* Notifications */}
              <Button
                variant="ghost"
                size="icon"
                className="relative hidden sm:flex"
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
                className="hidden sm:flex text-slate-500 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/30"
                onClick={() => onNavigate("favorites")}
              >
                <Heart className="h-5 w-5" />
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={displayAvatar} alt={displayName} />
                      <AvatarFallback className={isCustomerOnly ? "bg-blue-100 text-blue-700" : "bg-primary-100 text-primary-700"}>
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
                      {isCustomerOnly && (
                        <span className="text-xs text-blue-600 mt-1">Customer Only</span>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {/* Menu items for Customer Only */}
                  {isCustomerOnly ? (
                    <>
                      <DropdownMenuItem onClick={() => onNavigate("orders")}>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        <span>Pesanan Saya</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onNavigate("notifications")}>
                        <Bell className="mr-2 h-4 w-4" />
                        <span>Notifikasi</span>
                        {userUnreadCount > 0 && (
                          <Badge className="ml-auto bg-red-500 text-white text-xs">{userUnreadCount}</Badge>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onNavigate("settings")}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Pengaturan</span>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      {/* Menu items for Seller */}
                      <DropdownMenuItem onClick={() => onNavigate("dashboard")}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onNavigate("favorites") }>
                        <Heart className="mr-2 h-4 w-4" />
                        <span>Favorit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onNavigate("notifications")}>
                        <Bell className="mr-2 h-4 w-4" />
                        <span>Notifikasi</span>
                        {userUnreadCount > 0 && (
                          <Badge className="ml-auto bg-red-500 text-white text-xs">{userUnreadCount}</Badge>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onNavigate("my-products")}>
                        <Package className="mr-2 h-4 w-4" />
                        <span>Produk Saya</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onNavigate("orders")}>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        <span>Pesanan Saya</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onNavigate("wallet")}>
                        <Wallet className="mr-2 h-4 w-4" />
                        <span>Dompet ({walletText})</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onNavigate("settings")}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Pengaturan</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => currentUser?.id && onNavigate("profile", currentUser.id)}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Lihat Profil Saya</span>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout}>
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

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col gap-4 mt-8">
                {/* Mobile Search */}
                <div className="relative">
                  <Search 
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground cursor-pointer hover:text-primary-600 transition-colors"
                    onClick={handleSearch}
                  />
                  <Input
                    type="search"
                    placeholder="Cari barang, jasa, atau pengguna..."
                    className="pl-10 pr-4"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                  />
                </div>

                {/* Mobile Nav Links */}
                <nav className="flex flex-col gap-2">
                  {userNavLinks.map((link) => (
                    <a
                      key={link.page}
                      href={link.href}
                      onClick={(e) => handleNavClick(link.page, e)}
                      className="flex items-center py-2 text-sm font-medium hover:text-primary-600"
                    >
                      {link.label}
                    </a>
                  ))}
                </nav>

                {isLoggedIn && (
                  <div className="border-t pt-4 mt-2">
                    <Button
                      variant="ghost"
                      onClick={() => onNavigate("notifications")}
                      className="w-full justify-start"
                    >
                      <Bell className="h-4 w-4 mr-3" />
                      Notifikasi
                      {userUnreadCount > 0 && (
                        <Badge className="ml-auto bg-red-500 text-white text-xs">{userUnreadCount}</Badge>
                      )}
                    </Button>
                  </div>
                )}

                {!isLoggedIn && (
                  <div className="flex flex-col gap-2 mt-4">
                    <Button
                      variant="outline"
                      onClick={() => onNavigate("login")}
                      className="w-full h-10 px-4 text-sm font-medium"
                    >
                      Masuk
                    </Button>
                    <Button
                      onClick={() => onNavigate("register")}
                      className="w-full h-10 px-4 text-sm font-medium bg-primary-600 hover:bg-primary-700"
                    >
                      Daftar
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
