"use client";

import { useState, useEffect } from "react";
import { categories, mockProducts, mockServices, serviceCategories } from "@/lib/mock-data";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
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
  const [categoryType, setCategoryType] = useState<LandingCategoryType>("barang");
  const [showSellerBanner, setShowSellerBanner] = useState(true);
  const [barangCategories, setBarangCategories] = useState<Array<{ id: string; label: string }>>(categories);
  const [jasaCategories, setJasaCategories] = useState<Array<{ id: string; label: string }>>(serviceCategories);
  const [barangProducts, setBarangProducts] = useState<any>(mockProducts);
  const [jasaProducts, setJasaProducts] = useState<any>(mockServices);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  // Hapus loading state global, skeleton per section saja
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Fetch categories and products from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('[LandingPage] Fetching categories and products...');
        // setIsLoading(true); // dihapus, skeleton per section
        setFetchError(null);

        // Fetch categories
        const barangCatsResponse = await categoriesApi.getCategoriesByType("barang");
        const jasaCatsResponse = await categoriesApi.getCategoriesByType("jasa");
        // Map API categories to UI format
        if (barangCatsResponse?.length) {
          setBarangCategories(barangCatsResponse.map((cat: any) => ({ id: cat.id, label: cat.name })));
        }
        if (jasaCatsResponse?.length) {
          setJasaCategories(jasaCatsResponse.map((cat: any) => ({ id: cat.id, label: cat.name })));
        }

        // Fetch 3 produk terbaru campuran barang & jasa untuk hero section
        const featuredResponse = await productsApi.getProducts({ per_page: 3 });
        if (featuredResponse?.data?.length) {
          setFeaturedProducts(featuredResponse.data);
        } else {
          setFeaturedProducts([]);
        }

        // Fetch produk barang & jasa untuk section bawah
        const barangResponse = await productsApi.getProducts({ type: "barang", per_page: 8 });
        const jasaResponse = await productsApi.getProducts({ type: "jasa", per_page: 3 });
        if (barangResponse?.data?.length) {
          setBarangProducts(barangResponse.data as any);
        }
        if (jasaResponse?.data?.length) {
          setJasaProducts(jasaResponse.data as any);
        }
        console.log('[LandingPage] Data fetch completed');
      } catch (error) {
        console.error("[LandingPage] Error fetching data:", error);
        setFetchError('Gagal memuat beberapa data. Menampilkan katalog default.');
        // Continue with mock data - don't block UI
      } finally {
        // setIsLoading(false); // dihapus, skeleton per section
      }
    };
    
    fetchData();
  }, []);

  const currentCategories = categoryType === "barang" ? barangCategories : jasaCategories;

  const handleCategoryClick = (categoryId: string) => {
    const targetPage = categoryType === "barang" ? "catalog" : "services";
    onNavigate(targetPage, { category: categoryId });
  };

  return (
    <div className="flex flex-col">
      {fetchError && (
        <Alert variant="destructive" className="m-4 mb-0 border-amber-200 bg-amber-50 text-amber-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{fetchError}</AlertDescription>
        </Alert>
      )}
      <LandingSellerBanner
        open={showSellerBanner}
        isLoggedIn={isLoggedIn}
        isCustomerOnly={isCustomerOnly}
        onClose={() => setShowSellerBanner(false)}
        onStartSelling={onStartSelling}
      />

      <LandingHeroSection featuredProducts={featuredProducts} onNavigate={onNavigate} />
      <LandingFeaturesSection />

      <LandingCategoriesSection
        categoryType={categoryType}
        onCategoryTypeChange={setCategoryType}
        currentCategories={currentCategories}
        onCategoryClick={handleCategoryClick}
        onNavigate={onNavigate}
      />

      <LandingProductsSection products={barangProducts as any} onNavigate={onNavigate} />
      <LandingServicesSection services={jasaProducts as any} onNavigate={onNavigate} />
      <LandingHowItWorksSection />
      <LandingCtaSection isLoggedIn={isLoggedIn} onNavigate={onNavigate} />
    </div>
  );
}
