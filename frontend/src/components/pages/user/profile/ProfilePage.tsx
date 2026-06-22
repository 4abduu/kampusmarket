"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, Package } from "lucide-react";
import {
  categories,
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
import { useAppToast } from "@/hooks/use-app-toast";
import apiClient from "@/lib/api/client";
import { ProfilePageSkeleton, ProfileListSkeleton } from "@/components/skeleton";

type ActiveTab = "products" | "services" | "reviews";
type ProductSortBy = "terbaru" | "terpopuler" | "termurah" | "termahal";
type ServiceSortBy = "terbaru" | "terpopuler" | "termurah" | "termahal";

interface ProfilePageProps {
  onNavigate: (
    page: string,
    data?: string | { userId?: string; productId?: string; sellerId?: string },
  ) => void;
  userId?: string;
  isLoggedIn: boolean;
  currentUser?: User | null;
}

const REPORT_ACCOUNT_REASONS = [
  { id: "fake_account", label: "Akun Palsu / Identitas Palsu" },
  { id: "scammer", label: "Indikasi Penipuan" },
  { id: "harassment", label: "Pelecehan / Kata-kata tidak sopan" },
  { id: "spam", label: "Spam / Mengganggu" },
  { id: "selling_illegal_items", label: "Menjual barang/jasa terlarang" },
  { id: "other", label: "Lainnya" },
];

export default function ProfilePage({ onNavigate, userId, isLoggedIn, currentUser }: ProfilePageProps) {
  const { success, error: toastError } = useAppToast();
  // BUGFIX: Gunakan currentUser dari App.tsx jika ada, agar tidak loading mock data saat menunggu fetch
  const [authUser, setAuthUser] = useState<User | null>(currentUser || null);
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [userProducts, setUserProducts] = useState<any[]>([]);
  const [_isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [loading, setLoading] = useState(false);

  // Report states
  const [showReportModal, setShowReportModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportOtherReason, setReportOtherReason] = useState("");

  const handleReportSubmit = async () => {
    if (!reportReason || !reportDescription) {
      toastError(
        "Laporan belum lengkap",
        "Pilih alasan dan masukkan deskripsi laporan"
      );
      return;
    }

    const finalReason =
      reportReason === "other"
        ? reportOtherReason
        : REPORT_ACCOUNT_REASONS.find((r) => r.id === reportReason)?.label;

    if (!finalReason) {
      toastError(
        "Laporan belum lengkap",
        "Alasan laporan tidak boleh kosong"
      );
      return;
    }

    try {
      await apiClient.post("/reports", {
        reportedUserId: profileUser?.id || authUser?.id,
        reason: finalReason,
        description: reportDescription,
        type: "account",
      });

      success(
        "Laporan berhasil dikirim",
        "Laporan akun sudah masuk ke admin untuk ditinjau"
      );
      setShowReportModal(false);
      setReportReason("");
      setReportDescription("");
      setReportOtherReason("");
    } catch (error: any) {
      toastError(
        "Gagal mengirim laporan",
        error?.response?.data?.message || error?.message || "Terjadi kesalahan"
      );
    }
  };

  // 1. Sinkronisasi authUser jika currentUser dari props berubah
  useEffect(() => {
    if (currentUser) {
      setAuthUser(currentUser);
    } else if (isLoggedIn) {
      // Fallback fetch jika currentUser belum tersedia meski isLoggedIn true
      const fetchMe = async () => {
        try {
          const me = await userApi.me();
          if (me) setAuthUser(me);
        } catch (err) {
          console.error("[ProfilePage] Error fetching auth user info:", err);
        }
      };
      void fetchMe();
    }
  }, [isLoggedIn, currentUser]);

  // 2. Fetching Profil target berdasarkan parameter URL
  useEffect(() => {
    setLoading(true);
    setIsLoadingProducts(true);
    if (userId) {
      const loadPublicProfile = async () => {
        try {
          const user = await userApi.getPublicProfile(userId);
          setProfileUser(user);
          setLoading(false);  // Set loading false as soon as profile is loaded

          // Fetch products async (separate from main loading)
          try {
            const productsResponse = await getProductsBySeller(userId) as any;
            setUserProducts(productsResponse?.products || productsResponse?.data || []);
          } catch (err) {
            console.error("[ProfilePage] Failed to fetch seller products:", err);
            setUserProducts([]);  // Tetap set empty array agar tidak error
          } finally {
            setIsLoadingProducts(false);
          }
        } catch (err) {
          console.error("[ProfilePage] Failed to fetch public profile:", err);
          setProfileUser(null);
          setUserProducts([]);
          setLoading(false);  // Set false even on error agar tidak stuck
          setIsLoadingProducts(false);
        }
      };
      void loadPublicProfile();
    } else {
      // Jika TIDAK ADA userId di parameter, maka ini adalah "Profil Saya"
      setProfileUser(null);
      // Kalau kita punya currentUser, tidak perlu fetch ulang, langsung tampilkan
      if (currentUser) {
        setLoading(false);
        // BUGFIX: Fetch own products juga untuk profil sendiri
        const fetchOwnProducts = async () => {
          try {
            const productsResponse = await getProductsBySeller(currentUser.uuid || currentUser.id) as any;
            setUserProducts(productsResponse?.products || productsResponse?.data || []);
          } catch (err) {
            console.error("[ProfilePage] Failed to fetch own products:", err);
            setUserProducts([]);
          } finally {
            setIsLoadingProducts(false);
          }
        };
        void fetchOwnProducts();
      } else {
        const loadAuthUser = async () => {
          try {
            const user = await userApi.me();
            if (user) {
              setAuthUser(user);
              setLoading(false);  // Set false as soon as we have user

              // BUGFIX: Fetch products setelah dapat authUser
              try {
                const productsResponse = await getProductsBySeller(user.uuid || user.id) as any;
                setUserProducts(productsResponse?.products || productsResponse?.data || []);
              } catch (err) {
                console.error("[ProfilePage] Failed to fetch own products:", err);
                setUserProducts([]);
              } finally {
                setIsLoadingProducts(false);
              }
            } else {
              setLoading(false);
              setIsLoadingProducts(false);
            }
          } catch (err) {
            console.error("[ProfilePage] Failed to fetch auth user:", err);
            setAuthUser(null);
            setUserProducts([]);
            setLoading(false);
            setIsLoadingProducts(false);
          }
        };
        void loadAuthUser();
      }
    }
  }, [userId, currentUser]);

  // BUGFIX: Jika ada userId (melihat profil orang lain), JANGAN fallback ke authUser saat loading,
  // agar tidak muncul data authUser (user C) saat mencoba melihat user X.
  const user = userId ? profileUser : (authUser || null);

  // FIX LOGIKA DI SINI: Bandingkan UUID URL (userId) dengan UUID User Login (authUser.id atau authUser.uuid)
  const isOwnProfile = useMemo(() => {
    if (!authUser || !user) return false;
    if (!userId) return true; // kalau ga ada userId di url, otomatis profil sendiri
    
    const loggedInId = String(authUser.uuid || authUser.id).toLowerCase();
    const targetProfileId = String(userId).toLowerCase();
    
    return loggedInId === targetProfileId;
  }, [userId, authUser, user]);

  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<ActiveTab>("products");

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "reviews") {
      setActiveTab("reviews");
    }
  }, [searchParams]);
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

  const totalSold = userProducts.reduce(
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
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-900/50 pb-20">
      <div className="container mx-auto px-4 py-5 sm:py-8">
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [ms-overflow-style:none]">
          <button
            onClick={() => onNavigate("landing")}
            className="hover:text-primary-600 shrink-0"
          >
            Beranda
          </button>
          <span className="shrink-0">/</span>
          <span className="text-foreground truncate">Profil {user.name}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          <ProfileSidebar
            user={user}
            isOwnProfile={isOwnProfile}
            currentUserId={authUser?.uuid || authUser?.id}
            totalSold={totalSold}
            avgRating={avgRating}
            totalReviews={totalReviews}
            memberSince={memberSince}
            userBio={user.bio}
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
                "sellerId" in data &&
                data.sellerId
              ) {
                onNavigate("chat", { sellerId: data.sellerId as string });
                return;
              }
              onNavigate(page, data);
            }}
          />

          <div className="lg:col-span-2 space-y-4 min-w-0">
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="w-full sm:w-full h-auto sm:h-9 flex sm:inline-flex overflow-x-auto sm:overflow-visible justify-start sm:justify-center [scrollbar-width:none] [ms-overflow-style:none] gap-1 p-1">
                <TabsTrigger value="products" className="flex-none sm:flex-1 whitespace-nowrap px-3">
                  <Package className="h-4 w-4 mr-1" />
                  Produk ({barangProducts.length})
                </TabsTrigger>
                <TabsTrigger value="services" className="flex-none sm:flex-1 whitespace-nowrap px-3">
                  <Briefcase className="h-4 w-4 mr-1" />
                  Jasa ({jasaProducts.length})
                </TabsTrigger>
                <TabsTrigger value="reviews" className="flex-none sm:flex-1 whitespace-nowrap px-3">
                  <Briefcase className="h-4 w-4 mr-1" />
                  Ulasan ({totalReviews})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="products" className="mt-4">
                {loading && !barangProducts.length ? (
                  <ProfileListSkeleton count={4} />
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
                  <ProfileListSkeleton count={4} />
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
