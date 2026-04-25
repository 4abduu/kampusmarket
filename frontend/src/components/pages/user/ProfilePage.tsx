"use client";

import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, Package } from "lucide-react";
import {
  categories,
  mockProducts,
  mockServices,
  mockUsers,
  serviceCategories,
  type User,
} from "@/lib/mock-data";
import { userApi } from "@/lib/api/users";
import ProfileProductsTab from "@/components/pages/user/profile/ProfileProductsTab";
import ProfileReviewsTab from "@/components/pages/user/profile/ProfileReviewsTab";
import ProfileServicesTab from "@/components/pages/user/profile/ProfileServicesTab";
import ProfileSidebar from "@/components/pages/user/profile/ProfileSidebar";

interface ProfilePageProps {
  onNavigate: (
    page: string,
    data?: string | { userId?: string; productId?: string },
  ) => void;
  userId?: string;
}

type ProductSortBy = "terbaru" | "terpopuler" | "termurah" | "termahal";
type ServiceSortBy = "terbaru" | "terpopuler" | "termurah" | "termahal";
type ActiveTab = "products" | "services" | "reviews";

type ProductItem = (typeof mockProducts)[number];
type ServiceItem = (typeof mockServices)[number];
type UserServiceItem = ProductItem | ServiceItem;

export default function ProfilePage({ onNavigate, userId }: ProfilePageProps) {
  const [authUser, setAuthUser] = useState<User | null>(null);

  useEffect(() => {
    if (userId) return;

    const loadAuthUser = async () => {
      const user = await userApi.me();
      setAuthUser(user);
    };

    void loadAuthUser();
  }, [userId]);

  const user =
    (userId ? mockUsers.find((u) => u.id === userId) : authUser) ||
    mockUsers[0];

  const [activeTab, setActiveTab] = useState<ActiveTab>("products");
  const [productCategory, setProductCategory] = useState<string | null>(null);
  const [productPriceRange, setProductPriceRange] = useState<number[]>([
    0, 20000000,
  ]);
  const [productSortBy, setProductSortBy] = useState<ProductSortBy>("terbaru");

  const [serviceCategory, setServiceCategory] = useState<string | null>(null);
  const [servicePriceRange, setServicePriceRange] = useState<number[]>([
    0, 20000000,
  ]);
  const [serviceSortBy, setServiceSortBy] = useState<ServiceSortBy>("terbaru");

  const userProducts = useMemo(() => {
    return mockProducts.filter(
      (p) => p.sellerId === user.id && p.type === "barang",
    );
  }, [user.id]);

  const userServices = useMemo(() => {
    const productsAsServices = mockProducts.filter(
      (p) => p.sellerId === user.id && p.type === "jasa",
    );
    const services = mockServices.filter((s) => s.provider.id === user.id);
    return [...productsAsServices, ...services] as UserServiceItem[];
  }, [user.id]);

  const totalSold = userProducts.reduce(
    (acc, p) => acc + (p.soldCount || 0),
    0,
  );
  const avgRating = user.rating ?? 0;
  const totalReviews = user.reviewCount ?? 0;
  const memberSince = user.createdAt || "September 2024";

  const filteredProducts = useMemo(() => {
    const filtered = [...userProducts]
      .filter((p) => {
        if (!productCategory) return true;
        const catId = p.categoryId || p.category.toLowerCase();
        return (
          catId === productCategory ||
          p.category.toLowerCase() === productCategory.toLowerCase()
        );
      })
      .filter(
        (p) =>
          p.price >= productPriceRange[0] && p.price <= productPriceRange[1],
      );

    switch (productSortBy) {
      case "terbaru":
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
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

  const filteredServices = useMemo(() => {
    const filtered = [...userServices]
      .filter((service) => {
        if (!serviceCategory) return true;
        const catId = service.categoryId || service.category.toLowerCase();
        return (
          catId === serviceCategory ||
          service.category.toLowerCase() === serviceCategory.toLowerCase()
        );
      })
      .filter((service) => {
        const minPrice =
          "priceMin" in service
            ? (service.priceMin ?? 0)
            : (service.price ?? 0);
        return (
          minPrice >= servicePriceRange[0] && minPrice <= servicePriceRange[1]
        );
      });

    switch (serviceSortBy) {
      case "terbaru":
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        break;
      case "terpopuler":
        filtered.sort((a, b) => {
          const aCount =
            "soldCount" in a
              ? a.soldCount || 0
              : "orderCount" in a
                ? a.orderCount
                : 0;
          const bCount =
            "soldCount" in b
              ? b.soldCount || 0
              : "orderCount" in b
                ? b.orderCount
                : 0;
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

  const handleTabChange = (value: string) => {
    const tab = value as ActiveTab;
    setActiveTab(tab);

    if (tab === "products") {
      setProductCategory(null);
      setProductPriceRange([0, 20000000]);
      setProductSortBy("terbaru");
      return;
    }

    if (tab === "services") {
      setServiceCategory(null);
      setServicePriceRange([0, 20000000]);
      setServiceSortBy("terbaru");
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4 py-8">
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
          <ProfileSidebar
            user={user}
            totalSold={totalSold}
            avgRating={avgRating}
            totalReviews={totalReviews}
            memberSince={memberSince}
            userBio={user.bio}
            onNavigate={onNavigate}
          />

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
              </TabsList>

              <TabsContent value="products" className="mt-4">
                <ProfileProductsTab
                  categories={categories}
                  filteredProducts={filteredProducts}
                  totalProducts={userProducts.length}
                  productCategory={productCategory}
                  setProductCategory={setProductCategory}
                  productPriceRange={productPriceRange}
                  setProductPriceRange={setProductPriceRange}
                  productSortBy={productSortBy}
                  setProductSortBy={setProductSortBy}
                  onNavigate={onNavigate}
                  formatPrice={formatPrice}
                />
              </TabsContent>

              <TabsContent value="services" className="mt-4">
                <ProfileServicesTab
                  serviceCategories={serviceCategories}
                  filteredServices={filteredServices}
                  totalServices={userServices.length}
                  serviceCategory={serviceCategory}
                  setServiceCategory={setServiceCategory}
                  servicePriceRange={servicePriceRange}
                  setServicePriceRange={setServicePriceRange}
                  serviceSortBy={serviceSortBy}
                  setServiceSortBy={setServiceSortBy}
                  onNavigate={onNavigate}
                  formatPrice={formatPrice}
                />
              </TabsContent>

              <TabsContent value="reviews" className="mt-4">
                <ProfileReviewsTab
                  avgRating={avgRating}
                  totalReviews={totalReviews}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
