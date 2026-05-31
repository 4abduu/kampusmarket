"use client";

import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, Package } from "lucide-react";
import {
  categories,
  mockUsers,
  serviceCategories,
  type User,
} from "@/lib/mock-data";
import { userApi } from "@/lib/api/users";
import { getProductsBySeller } from "@/lib/api/products";
import ProfileProductsTab from "@/components/pages/user/profile/ProfileProductsTab";
import ProfileReviewsTab from "@/components/pages/user/profile/ProfileReviewsTab";
import ProfileServicesTab from "@/components/pages/user/profile/ProfileServicesTab";
import ProfileSidebar from "@/components/pages/user/profile/ProfileSidebar";
import ProductDetailReportDialog from "@/components/pages/guest/product-detail/ProductDetailReportDialog";
import ProductDetailLoginDialog from "@/components/pages/guest/product-detail/ProductDetailLoginDialog";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/lib/api/client";
import { ProfilePageSkeleton } from "@/components/skeleton";

type ActiveTab = "products" | "services" | "reviews";
type ProductSortBy = "terbaru" | "terpopuler" | "termurah" | "termahal";
type ServiceSortBy = "terbaru" | "terpopuler" | "termurah" | "termahal";

interface ProfilePageProps {
  onNavigate: (
    page: string,
    data?: string | { userId?: string; productId?: string },
  ) => void;
  userId?: string;
  isLoggedIn: boolean;
}

const REPORT_ACCOUNT_REASONS = [
  { id: "fake_account", label: "Akun Palsu / Identitas Palsu" },
  { id: "scammer", label: "Indikasi Penipuan" },
  { id: "harassment", label: "Pelecehan / Kata-kata tidak sopan" },
  { id: "spam", label: "Spam / Mengganggu" },
  { id: "selling_illegal_items", label: "Menjual barang/jasa terlarang" },
  { id: "other", label: "Lainnya" },
];

export default function ProfilePage({ onNavigate, userId, isLoggedIn }: ProfilePageProps) {
  const { toast } = useToast();
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [userProducts, setUserProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Report states
  const [showReportModal, setShowReportModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportOtherReason, setReportOtherReason] = useState("");

  const handleReportSubmit = async () => {
    if (!reportReason || !reportDescription) {
      toast({
        title: "Laporan belum lengkap",
        description: "Pilih alasan dan masukkan deskripsi laporan",
        variant: "destructive",
      });
      return;
    }

    const finalReason =
      reportReason === "other"
        ? reportOtherReason
        : REPORT_ACCOUNT_REASONS.find((r) => r.id === reportReason)?.label;

    if (!finalReason) {
      toast({
        title: "Laporan belum lengkap",
        description: "Alasan laporan tidak boleh kosong",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiClient.post("/reports", {
        reportedUserId: profileUser?.id || authUser?.id || mockUsers[0]?.id,
        reason: finalReason,
        description: reportDescription,
        type: "account",
      });

      toast({
        title: "Laporan berhasil dikirim",
        description: "Laporan akun sudah masuk ke admin untuk ditinjau",
      });
      setShowReportModal(false);
      setReportReason("");
      setReportDescription("");
      setReportOtherReason("");
    } catch (error: any) {
      toast({
        title: "Gagal mengirim laporan",
        description: error?.response?.data?.message || error?.message || "Terjadi kesalahan",
        variant: "destructive",
      });
    }
  };


  useEffect(() => {
    setLoading(true);
    setIsLoadingProducts(true);
    if (userId) {
      const loadPublicProfile = async () => {
        try {
          const user = await userApi.getPublicProfile(userId);
          setProfileUser(user);
          setAuthUser(null);

          try {
            const productsResponse = await getProductsBySeller(userId);
            setUserProducts(productsResponse?.data || []);
          } catch (err) {
            console.error("[ProfilePage] Failed to fetch seller products:", err);
            setUserProducts([]);
          }
        } catch (err) {
          console.error("[ProfilePage] Failed to fetch public profile:", err);
          setProfileUser(null);
          setUserProducts([]);
        } finally {
          setLoading(false);
          setIsLoadingProducts(false);
        }
      };
      void loadPublicProfile();
    } else {
      const loadAuthUser = async () => {
        try {
          const user = await userApi.me();
          if (user) {
            setAuthUser(user);
            setProfileUser(null);
          }
        } catch (err) {
          console.error("[ProfilePage] Failed to fetch auth user:", err);
          setAuthUser(null);
        } finally {
          setLoading(false);
          setIsLoadingProducts(false);
        }
      };
      void loadAuthUser();
    }
  }, [userId]);

  const user = profileUser || authUser || (mockUsers && mockUsers.length > 0 ? mockUsers[0] : null);
  const isOwnProfile = !userId && !!authUser;

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

  const barangProducts = useMemo(() => {
    return userProducts.filter((p) => p.type === "barang");
  }, [userProducts]);

  const jasaProducts = useMemo(() => {
    return userProducts.filter((p) => p.type === "jasa");
  }, [userProducts]);

  const userServices = useMemo(() => {
    return [...jasaProducts] as any[];
  }, [jasaProducts]);

  const totalSold = barangProducts.reduce(
    (acc, p) => acc + (p.soldCount || 0),
    0,
  );
  const avgRating = user?.rating ?? 0;
  const totalReviews = user?.reviewCount || 0;
  const memberSince = user?.createdAt || "September 2024";

  const filteredProducts = useMemo(() => {
    const filtered = [...barangProducts]
      .filter((p) => {
        if (!productCategory) return true;
        const catId = p.categoryId || p.category?.toLowerCase();
        return (
          catId === productCategory ||
          p.category?.toLowerCase() === productCategory.toLowerCase()
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
            new Date(b.createdAt || "").getTime() -
            new Date(a.createdAt || "").getTime(),
        );
        break;
      case "terpopuler":
        filtered.sort(
          (a, b) =>
            (b.soldCount || 0) -
            (a.soldCount || 0),
        );
        break;
      case "termurah":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "termahal":
        filtered.sort((a, b) => b.price - a.price);
        break;
    }

    return filtered;
  }, [barangProducts, productCategory, productPriceRange, productSortBy]);

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

  if (loading || !user) {
    return <ProfilePageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900/50 pb-20">
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
            isOwnProfile={isOwnProfile}
            totalSold={totalSold}
            avgRating={avgRating}
            totalReviews={totalReviews}
            memberSince={memberSince}
            userBio={user.bio}
            isLoadingProducts={isLoadingProducts}
            hasProducts={userProducts.length > 0}
            onOpenReport={() => {
              if (!isLoggedIn) {
                setShowLoginModal(true);
              } else {
                setShowReportModal(true);
              }
            }}
            onNavigate={(page, data) => {
              if (
                page === "chat" &&
                typeof data === "object" &&
                data !== null &&
                "userId" in data
              ) {
                // Cari produk aktif penjual
                const firstActive = userProducts.find((p) => p.stock > 0) ?? userProducts[0];

                if (!firstActive) {
                  // Penjual tidak punya produk — jangan navigasi
                  return;
                }

                // Disable tombol saat products masih loading
                onNavigate("chat", {
                  productId: firstActive.uuid || firstActive.id,
                });
                return;
              }
              onNavigate(page, data);
            }}
          />

          <div className="lg:col-span-2 space-y-4">
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="w-full">
                <TabsTrigger value="products" className="flex-1">
                  <Package className="h-4 w-4 mr-1" />
                  Produk ({barangProducts.length})
                </TabsTrigger>
                <TabsTrigger value="services" className="flex-1">
                  <Briefcase className="h-4 w-4 mr-1" />
                  Jasa ({jasaProducts.length})
                </TabsTrigger>
                <TabsTrigger value="reviews" className="flex-1">
                  Ulasan ({totalReviews})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="products" className="mt-4">
                {loading && !barangProducts.length ? (
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <ProfileProductsTab
                    categories={categories}
                    filteredProducts={filteredProducts}
                    totalProducts={barangProducts.length}
                    productCategory={productCategory}
                    setProductCategory={setProductCategory}
                    productPriceRange={productPriceRange}
                    setProductPriceRange={setProductPriceRange}
                    productSortBy={productSortBy}
                    setProductSortBy={setProductSortBy}
                    onNavigate={onNavigate}
                    formatPrice={formatPrice}
                  />
                )}
              </TabsContent>

              <TabsContent value="services" className="mt-4">
                {loading && !jasaProducts.length ? (
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <ProfileServicesTab
                    serviceCategories={serviceCategories}
                    filteredServices={filteredServices}
                    totalServices={jasaProducts.length}
                    serviceCategory={serviceCategory}
                    setServiceCategory={setServiceCategory}
                    servicePriceRange={servicePriceRange}
                    setServicePriceRange={setServicePriceRange}
                    serviceSortBy={serviceSortBy}
                    setServiceSortBy={setServiceSortBy}
                    onNavigate={onNavigate}
                    formatPrice={formatPrice}
                  />
                )}
              </TabsContent>

              <TabsContent value="reviews" className="mt-4">
                <ProfileReviewsTab
                  avgRating={avgRating}
                  totalReviews={totalReviews}
                  userId={user.id}
                  onNavigate={onNavigate}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <ProductDetailLoginDialog
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
        onNavigate={onNavigate}
      />

      <ProductDetailReportDialog
        open={showReportModal}
        onOpenChange={setShowReportModal}
        reportReason={reportReason}
        setReportReason={setReportReason}
        reportDescription={reportDescription}
        setReportDescription={setReportDescription}
        reportOtherReason={reportOtherReason}
        setReportOtherReason={setReportOtherReason}
        reportReasons={REPORT_ACCOUNT_REASONS}
        onSubmit={handleReportSubmit}
        title="Laporkan Akun"
        description="Laporkan perilaku mencurigakan atau pelanggaran oleh pengguna ini"
        placeholder="Jelaskan alasan Anda ingin melaporkan akun ini..."
      />
    </div>
  );
}
