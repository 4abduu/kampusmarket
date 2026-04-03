"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowRight,
  Shield,
  Truck,
  MessageCircle,
  Wallet,
  Star,
  MapPin,
  Users,
  Package,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
} from "lucide-react";
import { mockProducts, mockServices, categories, serviceCategories } from "@/lib/mock-data";

interface LandingPageProps {
  onNavigate: (page: string, data?: string | { category?: string }) => void;
  isLoggedIn?: boolean;
  isCustomerOnly?: boolean;
  onStartSelling?: () => void;
}

export default function LandingPage({ onNavigate, isLoggedIn = false, isCustomerOnly = false, onStartSelling }: LandingPageProps) {
  const [categoryType, setCategoryType] = useState<"barang" | "jasa">("barang");
  const [showSellerBanner, setShowSellerBanner] = useState(true); // State untuk dismiss banner
  const categoriesScrollRef = useRef<HTMLDivElement>(null);

  const featuredProducts = mockProducts.slice(0, 3);
  const featuredServices = mockServices.slice(0, 3);

  const currentCategories = categoryType === "barang" ? categories : serviceCategories;

  const scrollCategories = (direction: "left" | "right") => {
    if (categoriesScrollRef.current) {
      const scrollAmount = 200;
      categoriesScrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Handle category click - navigate with category data
  const handleCategoryClick = (categoryId: string) => {
    const targetPage = categoryType === "barang" ? "catalog" : "services";
    onNavigate(targetPage, { category: categoryId });
  };

  return (
    <div className="flex flex-col">
      {/* "Coba Jualan" Banner for Customer-Only Users */}
      {isLoggedIn && isCustomerOnly && showSellerBanner && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 px-4">
          <div className="container mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 shrink-0" />
              <p className="text-sm sm:text-base">
                <span className="font-semibold">Punya barang yang mau dijual?</span>{" "}
                <span className="hidden sm:inline">Coba jualan sekarang dan dapatkan penghasilan tambahan!</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="bg-white text-amber-700 hover:bg-amber-50 text-xs sm:text-sm"
                onClick={onStartSelling}
              >
                Coba Jualan
              </Button>
              <button
                onClick={() => setShowSellerBanner(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Tutup banner"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge className="bg-primary-100 text-primary-700 hover:bg-primary-100">
                Khusus Ekosistem Kampus
              </Badge>
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                Jual Beli Mudah di{" "}
                <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  KampusMarket
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                Marketplace hyperlocal untuk mahasiswa, alumni, dan masyarakat sekitar kampus. 
                Jual beli barang bekas dan jasa dengan aman, mudah, dan tanpa ribet logistik.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="bg-primary-600 hover:bg-primary-700"
                  onClick={() => onNavigate("catalog")}
                >
                  Mulai Belanja
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => onNavigate("register")}>
                  Jual Barang
                </Button>
              </div>
              
              {/* Stats */}
              <div className="flex flex-wrap gap-8 pt-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary-600" />
                  <div>
                    <p className="font-bold">2,500+</p>
                    <p className="text-sm text-muted-foreground">User Aktif</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary-600" />
                  <div>
                    <p className="font-bold">5,000+</p>
                    <p className="text-sm text-muted-foreground">Produk</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary-600" />
                  <div>
                    <p className="font-bold">10,000+</p>
                    <p className="text-sm text-muted-foreground">Transaksi</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Hero Image/Illustration */}
            <div className="relative hidden lg:block">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-3xl blur-3xl" />
              <div className="relative grid grid-cols-2 gap-4">
                {featuredProducts.map((product, index) => (
                  <Card
                    key={product.id}
                    className={`overflow-hidden cursor-pointer hover:shadow-lg transition-shadow ${
                      index === 0 ? "col-span-2" : ""
                    }`}
                    onClick={() => onNavigate("product", product.id)}
                  >
                    <div className={`bg-muted ${index === 0 ? "h-48" : "h-32"} flex items-center justify-center`}>
                      <Package className="h-12 w-12 text-muted-foreground/50" />
                    </div>
                    <CardContent className="p-3">
                      <p className="font-medium text-sm truncate">{product.title}</p>
                      <p className="text-primary-600 font-bold text-sm">
                        Rp {product.price.toLocaleString("id-ID")}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-slate-50 dark:bg-slate-800/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Kenapa Pilih KampusMarket?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Fitur-fitur unggulan yang memudahkan transaksi jual beli di lingkungan kampus
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: MapPin,
                title: "Hyperlocal",
                desc: "Transaksi dengan penjual terdekat dari kampusmu",
              },
              {
                icon: MessageCircle,
                title: "Chat & Nego",
                desc: "Negosiasi harga langsung dengan penjual via chat",
              },
              {
                icon: Shield,
                title: "Escrow Aman",
                desc: "Dana ditahan sampai transaksi selesai",
              },
              {
                icon: Truck,
                title: "Pengiriman Fleksibel",
                desc: "COD, ketemuan, atau antar manual",
              },
            ].map((feature, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section - Compact with Tab Switcher & Horizontal Scroll */}
      <section className="py-8" id="categories-section">
        <div className="container mx-auto px-4">
          {/* Header with Tab Switcher */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Kategori</h2>
            {/* Tab Switcher */}
            <div className="inline-flex rounded-full border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800">
              <button
                onClick={() => setCategoryType("barang")}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                  categoryType === "barang"
                    ? "bg-primary-600 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Package className="h-3 w-3" />
                Barang
              </button>
              <button
                onClick={() => setCategoryType("jasa")}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                  categoryType === "jasa"
                    ? "bg-gradient-to-r from-secondary-600 to-primary-600 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Wallet className="h-3 w-3" />
                Jasa
              </button>
            </div>
          </div>

          {/* Horizontal Scroll Categories - Compact Pills */}
          <div className="relative">
            {/* Left Scroll Button */}
            <button
              onClick={() => scrollCategories("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Right Scroll Button */}
            <button
              onClick={() => scrollCategories("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* Scrollable Container */}
            <div
              ref={categoriesScrollRef}
              className="overflow-x-auto py-2 px-10"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              <div className="flex gap-2">
                {currentCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full shrink-0 transition-all group ${
                      categoryType === "barang"
                        ? "bg-white border border-primary-200 hover:border-primary-400 hover:bg-primary-50 dark:bg-slate-800 dark:border-primary-800 dark:hover:bg-primary-900/30"
                        : "bg-gradient-to-r from-secondary-50 to-primary-50 border border-secondary-200 hover:border-secondary-400 hover:from-secondary-100 hover:to-primary-100 dark:from-slate-800 dark:to-slate-800 dark:border-secondary-800 dark:hover:from-secondary-900/30 dark:hover:to-primary-900/30"
                    }`}
                  >
                    <span className={`text-sm font-medium whitespace-nowrap ${
                      categoryType === "barang"
                        ? "group-hover:text-primary-700 dark:group-hover:text-primary-400"
                        : "group-hover:text-secondary-700 dark:group-hover:text-secondary-400"
                    }`}>
                      {category.label}
                    </span>
                  </button>
                ))}
                {/* View All CTA */}
                <button
                  onClick={() => onNavigate(categoryType === "barang" ? "catalog" : "services")}
                  className={`flex items-center gap-1 px-4 py-2 rounded-full shrink-0 text-sm font-medium transition-all ${
                    categoryType === "barang"
                      ? "bg-primary-600 text-white hover:bg-primary-700"
                      : "bg-gradient-to-r from-secondary-600 to-primary-600 text-white hover:from-secondary-700 hover:to-primary-700"
                  }`}
                >
                  Lihat Semua
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Katalog Barang */}
      <section className="py-16 bg-slate-50 dark:bg-slate-800/50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Katalog Barang</h2>
              <p className="text-muted-foreground">Temukan barang berkualitas dari mahasiswa</p>
            </div>
            <Button variant="outline" onClick={() => onNavigate("catalog")}>
              Lihat Semua
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockProducts.slice(0, 8).map((product) => (
              <Card
                key={product.id}
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group"
                onClick={() => onNavigate("product", product.id)}
              >
                <div className="relative bg-muted h-48 flex items-center justify-center">
                  <Package className="h-16 w-16 text-muted-foreground/30" />
                  {product.originalPrice && (
                    <Badge className="absolute top-2 left-2 bg-red-500">
                      -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                    </Badge>
                  )}
                  {product.condition === "baru" && (
                    <Badge className="absolute top-2 right-2 bg-primary-500">Baru</Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <p className="font-medium line-clamp-2 mb-2 group-hover:text-primary-600 transition-colors">
                    {product.title}
                  </p>
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{product.rating}</span>
                    <span className="text-sm text-muted-foreground">({product.soldCount} terjual)</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-bold text-primary-600">
                      Rp {product.price.toLocaleString("id-ID")}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        Rp {product.originalPrice.toLocaleString("id-ID")}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs bg-primary-100 text-primary-700">
                          {product.seller.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">{product.seller.name.split(" ")[0]}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {product.location.split(",")[0]}
                    </div>
                  </div>
                  {product.canNego && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      Bisa Nego
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Layanan Jasa</h2>
              <p className="text-muted-foreground">Jasa dari mahasiswa untuk mahasiswa</p>
            </div>
            <Button variant="outline" onClick={() => onNavigate("services")}>
              Lihat Semua
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {mockServices.slice(0, 3).map((service) => (
              <Card
                key={service.id}
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group"
                onClick={() => onNavigate("service", service.id)}
              >
                <div className="relative bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 h-40 flex items-center justify-center">
                  <Package className="h-12 w-12 text-primary-600/50" />
                </div>
                <CardContent className="p-4">
                  <Badge variant="outline" className="mb-2">{service.category}</Badge>
                  <p className="font-medium line-clamp-2 mb-2 group-hover:text-primary-600 transition-colors">
                    {service.title}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {service.description}
                  </p>
                  <div className="flex items-center gap-1 mb-3">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{service.rating}</span>
                    <span className="text-sm text-muted-foreground">({service.orderCount} pesanan)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary-600">
                      Rp {service.priceMin.toLocaleString("id-ID")} - {service.priceMax.toLocaleString("id-ID")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 bg-slate-50 dark:bg-slate-800/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Cara Kerja</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Mudah dan cepat untuk mulai berjualan atau belanja
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Untuk Pembeli */}
            <Card className="p-6 border-primary-200 dark:border-primary-800">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary-600 text-white flex items-center justify-center">
                  <Users className="h-6 w-6" />
                </div>
                Untuk Pembeli
              </h3>
              <div className="space-y-4">
                {[
                  { step: 1, title: "Cari Barang", desc: "Temukan barang atau jasa yang kamu butuhkan di katalog" },
                  { step: 2, title: "Chat & Nego", desc: "Hubungi penjual, tanya detail, dan negosiasi harga" },
                  { step: 3, title: "Checkout", desc: "Pilih metode pengiriman dan pembayaran yang diinginkan" },
                  { step: 4, title: "Terima Barang", desc: "Ambil barang atau tunggu diantar, konfirmasi selesai" },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 flex items-center justify-center font-bold shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Untuk Penjual */}
            <Card className="p-6 border-secondary-200 dark:border-secondary-800">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-secondary-600 text-white flex items-center justify-center">
                  <Wallet className="h-6 w-6" />
                </div>
                Untuk Penjual
              </h3>
              <div className="space-y-4">
                {[
                  { step: 1, title: "Daftar Akun", desc: "Buat akun gratis dan lengkapi profil kamu" },
                  { step: 2, title: "Unggah Produk", desc: "Upload foto, deskripsi, dan harga barang atau jasa" },
                  { step: 3, title: "Kelola Pesanan", desc: "Respon chat, terima pesanan, dan atur pengiriman" },
                  { step: 4, title: "Cairkan Dana", desc: "Dana masuk ke dompet, tarik ke rekening kapan saja" },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-400 flex items-center justify-center font-bold shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isLoggedIn && (
      <section className="py-16 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Siap Mulai Berjualan?</h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            Daftar sekarang dan mulai jual barang bekas atau jasa kamu. Gratis tanpa biaya pendaftaran!
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="bg-white text-primary-700 hover:bg-primary-50"
            onClick={() => onNavigate("register")}
          >
            Daftar Gratis
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>
      )}
    </div>
  );
}
