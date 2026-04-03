"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import {
  Star,
  MapPin,
  Package,
  MessageCircle,
  Calendar,
  Shield,
  Award,
  SlidersHorizontal,
  X,
  Briefcase,
} from "lucide-react";
import { mockProducts, mockServices, mockUsers, categories, serviceCategories } from "@/lib/mock-data";

interface ProfilePageProps {
  onNavigate: (page: string, data?: string | { userId?: string; productId?: string }) => void;
  userId?: string;
}

export default function ProfilePage({ onNavigate, userId }: ProfilePageProps) {
  // Find user by ID or use first user as default
  const user = mockUsers.find((u) => u.id === userId) || mockUsers[0];

  // Tab state
  const [activeTab, setActiveTab] = useState("products");

  // Product filters
  const [productCategory, setProductCategory] = useState<string | null>(null);
  const [productPriceRange, setProductPriceRange] = useState([0, 1000000]);
  const [productSortBy, setProductSortBy] = useState("terbaru");

  // Service filters
  const [serviceCategory, setServiceCategory] = useState<string | null>(null);
  const [servicePriceRange, setServicePriceRange] = useState([0, 1000000]);
  const [serviceSortBy, setServiceSortBy] = useState("terbaru");

  // Get user's products (type = "barang")
  const userProducts = useMemo(() => {
    return mockProducts.filter((p) => p.sellerId === user.id && p.type === "barang");
  }, [user.id]);

  // Get user's services (type = "jasa")
  const userServices = useMemo(() => {
    // Check in mockProducts first (some services are stored there)
    const productsAsServices = mockProducts.filter((p) => p.sellerId === user.id && p.type === "jasa");
    // Also check in mockServices
    const services = mockServices.filter((s) => s.provider.id === user.id);
    return [...productsAsServices, ...services];
  }, [user.id]);

  // Calculate stats
  const totalSold = userProducts.reduce((acc, p) => acc + (p.soldCount || 0), 0);
  const avgRating = user.rating || 4.8;
  const totalReviews = user.reviewCount || 24;
  const memberSince = user.createdAt || "September 2024";

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...userProducts];

    // Category filter
    if (productCategory) {
      filtered = filtered.filter((p) => {
        const catId = p.categoryId || p.category.toLowerCase();
        return catId === productCategory || p.category.toLowerCase() === productCategory.toLowerCase();
      });
    }

    // Price filter
    filtered = filtered.filter((p) => p.price >= productPriceRange[0] && p.price <= productPriceRange[1]);

    // Sort
    switch (productSortBy) {
      case "terbaru":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "terpopuler":
        filtered.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
        break;
      case "termurah":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "termahal":
        filtered.sort((a, b) => b.price - a.price);
        break;
    }

    return filtered;
  }, [userProducts, productCategory, productPriceRange, productSortBy]);

  // Filter and sort services
  const filteredServices = useMemo(() => {
    let filtered = [...userServices];

    // Category filter
    if (serviceCategory) {
      filtered = filtered.filter((s) => {
        const catId = s.categoryId || s.category.toLowerCase();
        return catId === serviceCategory || s.category.toLowerCase() === serviceCategory.toLowerCase();
      });
    }

    // Price filter (use priceMin for services)
    filtered = filtered.filter((s) => {
    const minPrice = 'priceMin' in s ? s.priceMin ?? 0 : s.price ?? 0;
    if (minPrice === undefined) return false;
    return minPrice >= servicePriceRange[0] && minPrice <= servicePriceRange[1];
    });

    // Sort
    switch (serviceSortBy) {
      case "terbaru":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "terpopuler":
        filtered.sort((a, b) => {
          const aCount = 'soldCount' in a ? (a.soldCount || 0) : ('orderCount' in a ? a.orderCount : 0);
          const bCount = 'soldCount' in b ? (b.soldCount || 0) : ('orderCount' in b ? b.orderCount : 0);
          return bCount - aCount;
        });
        break;
      case "termurah":
        filtered.sort((a, b) => {
          const aPrice = "priceMin" in a ? (a.priceMin ?? 0) : (a.price ?? 0);
          const bPrice = "priceMin" in b ? (b.priceMin ?? 0) : (b.price ?? 0);
          return aPrice - bPrice;
        });
        break;
      case "termahal":
        filtered.sort((a, b) => {
          const aPrice = "priceMin" in a ? (a.priceMin ?? 0) : (a.price ?? 0);
          const bPrice = "priceMin" in b ? (b.priceMin ?? 0) : (b.price ?? 0);
          return bPrice - aPrice;
        });
        break;
    }

    return filtered;
  }, [userServices, serviceCategory, servicePriceRange, serviceSortBy]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= Math.floor(rating)
                ? "fill-yellow-400 text-yellow-400"
                : star - 0.5 <= rating
                ? "fill-yellow-400/50 text-yellow-400"
                : "text-slate-300"
            }`}
          />
        ))}
        <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  // Reset filters when changing tabs
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "products") {
      setProductCategory(null);
      setProductPriceRange([0, 1000000]);
      setProductSortBy("terbaru");
    } else if (tab === "services") {
      setServiceCategory(null);
      setServicePriceRange([0, 1000000]);
      setServiceSortBy("terbaru");
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <button
            onClick={() => onNavigate("landing")}
            className="hover:text-primary-600"
          >
            Beranda
          </button>
          <span>/</span>
          <span className="text-foreground">Profil {user.name}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1 space-y-4">
            {/* Profile Card */}
            <Card>
              <CardContent className="p-6">
                {/* Avatar & Name */}
                <div className="text-center mb-6">
                  <Avatar className="h-24 w-24 mx-auto mb-4">
                    <AvatarFallback className="bg-primary-100 text-primary-700 text-2xl">
                      {user.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <h1 className="text-xl font-bold">{user.name}</h1>
                    {user.isVerified && (
                      <Badge variant="outline" className="text-primary-600 border-primary-600">
                        <Shield className="h-3 w-3 mr-1" />
                        Terverifikasi
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm">{user.faculty}</p>
                  <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3" />
                    {user.location || "Universitas Indonesia"}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-center mb-6">
                  <div>
                    <p className="font-bold text-lg text-primary-600">{totalSold}</p>
                    <p className="text-xs text-muted-foreground">Terjual</p>
                  </div>
                  <div>
                    <p className="font-bold text-lg">{avgRating.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">Rating</p>
                  </div>
                  <div>
                    <p className="font-bold text-lg">{totalReviews}</p>
                    <p className="text-xs text-muted-foreground">Ulasan</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button
                    className="w-full bg-primary-600 hover:bg-primary-700"
                    onClick={() => onNavigate("chat", { userId: user.id })}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Hubungi Penjual
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => onNavigate("catalog")}
                  >
                    Lihat Semua Produk
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Seller Info Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Informasi Penjual</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Bergabung sejak</p>
                    <p className="font-medium">{memberSince}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Rating</p>
                    <p className="font-medium">{avgRating} ({totalReviews} ulasan)</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Produk Terjual</p>
                    <p className="font-medium">{totalSold} produk</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Badges */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Badge Penjual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {user.isVerified && (
                    <Badge variant="secondary" className="bg-primary-100 text-primary-700">
                      <Shield className="h-3 w-3 mr-1" />
                      Terverifikasi
                    </Badge>
                  )}
                  {totalSold >= 10 && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      <Award className="h-3 w-3 mr-1" />
                      Seller Aktif
                    </Badge>
                  )}
                  {avgRating >= 4.5 && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                      <Star className="h-3 w-3 mr-1" />
                      Rating Tinggi
                    </Badge>
                  )}
                  {totalSold >= 50 && (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                      <Package className="h-3 w-3 mr-1" />
                      Power Seller
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Products, Services & Reviews */}
          <div className="lg:col-span-2 space-y-4">
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="w-full">
                <TabsTrigger value="products" className="flex-1">
                  <Package className="h-4 w-4 mr-1" />
                  Produk ({userProducts.length})
                </TabsTrigger>
                <TabsTrigger value="services" className="flex-1">
                  <Briefcase className="h-4 w-4 mr-1" />
                  Jasa ({userServices.length})
                </TabsTrigger>
                <TabsTrigger value="reviews" className="flex-1">
                  Ulasan ({totalReviews})
                </TabsTrigger>
                <TabsTrigger value="about" className="flex-1">
                  Tentang
                </TabsTrigger>
              </TabsList>

              {/* Products Tab */}
              <TabsContent value="products" className="mt-4">
                {/* Filter Toolbar */}
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  {/* Mobile Filter */}
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="lg:hidden">
                        <SlidersHorizontal className="h-4 w-4 mr-2" />
                        Filter
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80 overflow-y-auto">
                      <SheetHeader>
                        <SheetTitle>Filter Produk</SheetTitle>
                        <SheetDescription>
                          Filter produk sesuai kebutuhanmu
                        </SheetDescription>
                      </SheetHeader>
                      <div className="mt-6 space-y-6">
                        {/* Categories */}
                        <div>
                          <h3 className="font-semibold mb-3">Kategori</h3>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            <button
                              onClick={() => setProductCategory(null)}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                productCategory === null
                                  ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                                  : "hover:bg-slate-100 dark:hover:bg-slate-800"
                              }`}
                            >
                              Semua Kategori
                            </button>
                            {categories.map((category) => (
                              <button
                                key={category.id}
                                onClick={() => setProductCategory(category.id)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                  productCategory === category.id
                                    ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                                    : "hover:bg-slate-100 dark:hover:bg-slate-800"
                                }`}
                              >
                                {category.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Price Range */}
                        <div>
                          <h3 className="font-semibold mb-3">Rentang Harga</h3>
                          <div className="space-y-4">
                            <Slider
                              value={productPriceRange}
                              onValueChange={setProductPriceRange}
                              max={1000000}
                              step={10000}
                              className="w-full"
                            />
                            <div className="flex items-center gap-2">
                              <Input
                                type="text"
                                value={`Rp ${productPriceRange[0].toLocaleString("id-ID")}`}
                                readOnly
                                className="text-xs"
                              />
                              <span>-</span>
                              <Input
                                type="text"
                                value={`Rp ${productPriceRange[1].toLocaleString("id-ID")}`}
                                readOnly
                                className="text-xs"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Reset Filters */}
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            setProductCategory(null);
                            setProductPriceRange([0, 1000000]);
                            setProductSortBy("terbaru");
                          }}
                        >
                          Reset Filter
                        </Button>
                      </div>
                    </SheetContent>
                  </Sheet>

                  {/* Sort */}
                  <Select value={productSortBy} onValueChange={setProductSortBy}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Urutkan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="terbaru">Terbaru</SelectItem>
                      <SelectItem value="terpopuler">Terpopuler</SelectItem>
                      <SelectItem value="termurah">Harga Terendah</SelectItem>
                      <SelectItem value="termahal">Harga Tertinggi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Active Filters */}
                {productCategory && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary" className="gap-1">
                      {categories.find((c) => c.id === productCategory)?.label}
                      <button onClick={() => setProductCategory(null)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  </div>
                )}

                {/* Results Count */}
                <p className="text-sm text-muted-foreground mb-4">
                  Menampilkan {filteredProducts.length} dari {userProducts.length} produk
                </p>

                {filteredProducts.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">Tidak ada produk ditemukan</p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => {
                          setProductCategory(null);
                          setProductPriceRange([0, 1000000]);
                        }}
                      >
                        Reset Filter
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {filteredProducts.map((product) => (
                      <Card
                        key={product.id}
                        className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => onNavigate("product", product.id)}
                      >
                        <div className="aspect-square bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <Package className="h-16 w-16 text-muted-foreground/30" />
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-medium line-clamp-2 mb-2">{product.title}</h3>
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-bold text-primary-600">
                              {formatPrice(product.price)}
                            </p>
                            {product.condition === "baru" ? (
                              <Badge className="bg-primary-500 text-xs">Baru</Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">Bekas</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {product.rating}
                            </div>
                            <span>•</span>
                            <span>{product.soldCount || 0} terjual</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Services Tab */}
              <TabsContent value="services" className="mt-4">
                {/* Filter Toolbar */}
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  {/* Mobile Filter */}
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="lg:hidden">
                        <SlidersHorizontal className="h-4 w-4 mr-2" />
                        Filter
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80 overflow-y-auto">
                      <SheetHeader>
                        <SheetTitle>Filter Jasa</SheetTitle>
                        <SheetDescription>
                          Filter jasa sesuai kebutuhanmu
                        </SheetDescription>
                      </SheetHeader>
                      <div className="mt-6 space-y-6">
                        {/* Categories */}
                        <div>
                          <h3 className="font-semibold mb-3">Kategori Jasa</h3>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            <button
                              onClick={() => setServiceCategory(null)}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                serviceCategory === null
                                  ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                                  : "hover:bg-slate-100 dark:hover:bg-slate-800"
                              }`}
                            >
                              Semua Kategori
                            </button>
                            {serviceCategories.map((category) => (
                              <button
                                key={category.id}
                                onClick={() => setServiceCategory(category.id)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                  serviceCategory === category.id
                                    ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                                    : "hover:bg-slate-100 dark:hover:bg-slate-800"
                                }`}
                              >
                                {category.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Price Range */}
                        <div>
                          <h3 className="font-semibold mb-3">Rentang Harga</h3>
                          <div className="space-y-4">
                            <Slider
                              value={servicePriceRange}
                              onValueChange={setServicePriceRange}
                              max={1000000}
                              step={10000}
                              className="w-full"
                            />
                            <div className="flex items-center gap-2">
                              <Input
                                type="text"
                                value={`Rp ${servicePriceRange[0].toLocaleString("id-ID")}`}
                                readOnly
                                className="text-xs"
                              />
                              <span>-</span>
                              <Input
                                type="text"
                                value={`Rp ${servicePriceRange[1].toLocaleString("id-ID")}`}
                                readOnly
                                className="text-xs"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Reset Filters */}
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            setServiceCategory(null);
                            setServicePriceRange([0, 1000000]);
                            setServiceSortBy("terbaru");
                          }}
                        >
                          Reset Filter
                        </Button>
                      </div>
                    </SheetContent>
                  </Sheet>

                  {/* Sort */}
                  <Select value={serviceSortBy} onValueChange={setServiceSortBy}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Urutkan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="terbaru">Terbaru</SelectItem>
                      <SelectItem value="terpopuler">Terpopuler</SelectItem>
                      <SelectItem value="termurah">Harga Terendah</SelectItem>
                      <SelectItem value="termahal">Harga Tertinggi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Active Filters */}
                {serviceCategory && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary" className="gap-1">
                      {serviceCategories.find((c) => c.id === serviceCategory)?.label}
                      <button onClick={() => setServiceCategory(null)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  </div>
                )}

                {/* Results Count */}
                <p className="text-sm text-muted-foreground mb-4">
                  Menampilkan {filteredServices.length} dari {userServices.length} jasa
                </p>

                {filteredServices.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">Tidak ada jasa ditemukan</p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => {
                          setServiceCategory(null);
                          setServicePriceRange([0, 1000000]);
                        }}
                      >
                        Reset Filter
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {filteredServices.map((service) => {
                      const price = 'price' in service ? service.price : 0;
                      const priceMin: number = 'priceMin' in service ? (service.priceMin ?? price) : price;
                      const priceMax: number = 'priceMax' in service ? (service.priceMax ?? price) : price;
                      const rating = 'rating' in service ? service.rating : 0;
                      const soldCount = 'soldCount' in service ? (service.soldCount || 0) : ('orderCount' in service ? service.orderCount : 0);

                      return (
                        <Card
                          key={service.id}
                          className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => onNavigate("service", service.id)}
                        >
                          <div className="aspect-video bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 flex items-center justify-center">
                            <Briefcase className="h-16 w-16 text-primary-600/30" />
                          </div>
                          <CardContent className="p-4">
                            <Badge variant="outline" className="mb-2 text-xs">{service.category}</Badge>
                            <h3 className="font-medium line-clamp-2 mb-2">{service.title}</h3>
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-bold text-primary-600 text-sm">
                                {priceMin === priceMax || !priceMax
                                  ? formatPrice(priceMin)
                                  : `${formatPrice(priceMin)} - ${formatPrice(priceMax)}`
                                }
                              </p>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                {rating}
                              </div>
                              <span>•</span>
                              <span>{soldCount} pesanan</span>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews" className="mt-4">
                <Card>
                  <CardContent className="p-6">
                    {/* Rating Summary */}
                    <div className="flex items-center gap-6 mb-6 pb-6 border-b">
                      <div className="text-center">
                        <p className="text-4xl font-bold">{avgRating.toFixed(1)}</p>
                        {renderStars(avgRating)}
                        <p className="text-sm text-muted-foreground mt-1">
                          {totalReviews} ulasan
                        </p>
                      </div>
                      <div className="flex-1 space-y-1">
                        {[5, 4, 3, 2, 1].map((star) => {
                          const percentage = star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 7 : star === 2 ? 2 : 1;
                          return (
                            <div key={star} className="flex items-center gap-2">
                              <span className="text-sm w-4">{star}</span>
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-yellow-400 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground w-8">{percentage}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Reviews List */}
                    <div className="space-y-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="border-b pb-4 last:border-0">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-slate-100 text-slate-600">
                                R{i}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium text-sm">Reviewer {i}</p>
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`h-3 w-3 ${
                                        star <= 5 - (i % 2)
                                          ? "fill-yellow-400 text-yellow-400"
                                          : "text-slate-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {i % 2 === 0
                                  ? "Barang sesuai deskripsi, pengiriman cepat. Recommended seller!"
                                  : "Seller ramah dan fast response. Kualitas barang bagus, sesuai foto."}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {i} hari yang lalu •{" "}
                                <span className="text-primary-600">Produk {i}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* About Tab */}
              <TabsContent value="about" className="mt-4">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Tentang {user.name}</h3>
                    <p className="text-muted-foreground mb-6">
                      {user.bio || `Mahasiswa dari ${user.faculty}. Aktif menjual berbagai barang dan jasa kampus. 
                      Selalu berusaha memberikan pelayanan terbaik untuk pembeli.`}
                    </p>

                    <Separator className="my-4" />

                    <h4 className="font-medium mb-3">Kebijakan Toko</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-600 mt-2" />
                        <p>Fast response untuk setiap pertanyaan pembeli</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-600 mt-2" />
                        <p>Barang dijamin sesuai deskripsi dan foto</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-600 mt-2" />
                        <p>Menerima pengembalian jika barang tidak sesuai</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-600 mt-2" />
                        <p>Pengiriman fleksibel sesuai kesepakatan</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
