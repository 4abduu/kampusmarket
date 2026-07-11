"use client";

import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { productsApi } from "@/lib/api/products";
import { categoriesApi } from "@/lib/api/categories";
import LandingCategoriesSection from "@/components/pages/guest/landing/LandingCategoriesSection";
import LandingCtaSection from "@/components/pages/guest/landing/LandingCtaSection";
import LandingFeaturesSection from "@/components/pages/guest/landing/LandingFeaturesSection";
import LandingHeroSection from "@/components/pages/guest/landing/LandingHeroSection";
import LandingHowItWorksSection from "@/components/pages/guest/landing/LandingHowItWorksSection";
import LandingProductsSection from "@/components/pages/guest/landing/LandingProductsSection";
import LandingSellerBanner from "@/components/pages/guest/landing/LandingSellerBanner";
import LandingServicesSection from "@/components/pages/guest/landing/LandingServicesSection";
import { CategorySectionSkeleton } from "@/components/skeleton";
import GlobalErrorOverlay from "@/components/shared/GlobalErrorOverlay";
import ProductDetailLoginDialog from "@/components/pages/guest/product-detail/ProductDetailLoginDialog";
import type {
  LandingCategoryType,
  LandingPageProps,
} from "@/components/pages/guest/landing/landing.types";

export default function LandingPage({
  onNavigate,
  isLoggedIn = false,
  isCustomerOnly = false,
  onStartSelling,
}: LandingPageProps) {
  const location = useLocation();
  const [categoryType, setCategoryType] =
    useState<LandingCategoryType>("barang");
  const [showSellerBanner, setShowSellerBanner] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [barangCategories, setBarangCategories] = useState<
    Array<{ id: string; label: string }>
  >([]);
  const [jasaCategories, setJasaCategories] = useState<
    Array<{ id: string; label: string }>
  >([]);
  const [barangProducts, setBarangProducts] = useState<any>([]);
  const [jasaProducts, setJasaProducts] = useState<any>([]);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [heroLoading, setHeroLoading] = useState<boolean>(true);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);

  const handleAction = (action: () => void) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    action();
  };

  useEffect(() => {
    if (location.hash === "#how-it-works") {
      setTimeout(() => {
        const el = document.getElementById("how-it-works");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  }, [location.hash]);

  useEffect(() => {
    if (hasFetchedRef.current) {
      return;
    }
    hasFetchedRef.current = true;

    const fetchData = async () => {
      try {
        setFetchError(null);
        setCategoriesLoading(true);

        const [
          barangCatsResponse,
          jasaCatsResponse,
          featuredResponse,
          barangResponse,
          jasaResponse,
        ] = await Promise.all([
          categoriesApi.getCategoriesByType("barang"),
          categoriesApi.getCategoriesByType("jasa"),
          productsApi.getProducts({ per_page: 3 }),
          productsApi.getProducts({ type: "barang", per_page: 8 }),
          productsApi.getProducts({ type: "jasa", per_page: 3 }),
        ]);

        if (barangCatsResponse?.length) {
          setBarangCategories(
            barangCatsResponse.map((cat: any) => ({
              id: cat.slug,
              label: cat.name,
              slug: cat.slug,
            })),
          );
        }
        if (jasaCatsResponse?.length) {
          setJasaCategories(
            jasaCatsResponse
              .filter((cat: any) => cat.slug !== "les-privat")
              .map((cat: any) => ({
                id: cat.slug,
                label: cat.name,
                slug: cat.slug,
              })),
          );
        }
        setCategoriesLoading(false);
        setFeaturedProducts(featuredResponse?.data ?? featuredResponse ?? []);
        setBarangProducts(barangResponse?.data ?? barangResponse ?? []);
        setJasaProducts(jasaResponse?.data ?? jasaResponse ?? []);
      } catch (error) {
        console.error("[LandingPage] Error fetching data:", error);
        setFetchError("Gagal memuat beberapa data. Silakan muat ulang.");
        setCategoriesLoading(false);
      } finally {
        setHeroLoading(false);
      }
    };

    fetchData();
  }, []);

  const currentCategories =
    categoryType === "barang" ? barangCategories : jasaCategories;

  return (
    <>
      <ProductDetailLoginDialog
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
        onNavigate={onNavigate}
      />
      <div className="flex flex-col">
        <GlobalErrorOverlay 
          error={fetchError} 
          onRetry={() => window.location.reload()} 
        />

        <LandingSellerBanner
          open={showSellerBanner}
          isLoggedIn={isLoggedIn}
          isCustomerOnly={isCustomerOnly}
          onClose={() => setShowSellerBanner(false)}
          onStartSelling={onStartSelling}
        />

        <LandingHeroSection
          featuredProducts={featuredProducts}
          onNavigate={onNavigate}
          isLoading={heroLoading}
          onAction={handleAction}
          hasError={!!fetchError}
        />
        <LandingFeaturesSection />

        {categoriesLoading ? (
          <CategorySectionSkeleton />
        ) : (
          <LandingCategoriesSection
            categoryType={categoryType}
            onCategoryTypeChange={setCategoryType}
            currentCategories={currentCategories}
            onNavigate={onNavigate}
            hasError={!!fetchError}
          />
        )}

        <LandingProductsSection
          products={barangProducts as any}
          onNavigate={onNavigate}
          hasError={!!fetchError}
        />
        <LandingServicesSection
          services={jasaProducts as any}
          onNavigate={onNavigate}
          hasError={!!fetchError}
        />
        <LandingHowItWorksSection />
        <LandingCtaSection isLoggedIn={isLoggedIn} onNavigate={onNavigate} />
      </div>
    </>
  );
}
