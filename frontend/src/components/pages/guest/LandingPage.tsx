"use client";

import { useMemo, useState } from "react";
import { categories, mockProducts, mockServices, serviceCategories } from "@/lib/mock-data";
import LandingCategoriesSection from "@/components/pages/guest/landing/LandingCategoriesSection";
import LandingCtaSection from "@/components/pages/guest/landing/LandingCtaSection";
import LandingFeaturesSection from "@/components/pages/guest/landing/LandingFeaturesSection";
import LandingHeroSection from "@/components/pages/guest/landing/LandingHeroSection";
import LandingHowItWorksSection from "@/components/pages/guest/landing/LandingHowItWorksSection";
import LandingProductsSection from "@/components/pages/guest/landing/LandingProductsSection";
import LandingSellerBanner from "@/components/pages/guest/landing/LandingSellerBanner";
import LandingServicesSection from "@/components/pages/guest/landing/LandingServicesSection";
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

  const featuredProducts = useMemo(() => mockProducts.slice(0, 3), []);
  const currentCategories = categoryType === "barang" ? categories : serviceCategories;

  const handleCategoryClick = (categoryId: string) => {
    const targetPage = categoryType === "barang" ? "catalog" : "services";
    onNavigate(targetPage, { category: categoryId });
  };

  return (
    <div className="flex flex-col">
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

      <LandingProductsSection products={mockProducts} onNavigate={onNavigate} />
      <LandingServicesSection services={mockServices} onNavigate={onNavigate} />
      <LandingHowItWorksSection />
      <LandingCtaSection isLoggedIn={isLoggedIn} onNavigate={onNavigate} />
    </div>
  );
}
