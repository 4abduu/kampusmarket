import { useRef } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Package,
  Wallet,
} from "lucide-react";
import type { LandingCategoryType } from "@/components/pages/guest/landing/landing.types";

interface LandingCategoryPill {
  id: string;
  label: string;
}

interface LandingCategoriesSectionProps {
  categoryType: LandingCategoryType;
  onCategoryTypeChange: (value: LandingCategoryType) => void;
  currentCategories: LandingCategoryPill[];
  onNavigate: (page: string, params?: { category?: string }) => void;
}

export default function LandingCategoriesSection({
  categoryType,
  onCategoryTypeChange,
  currentCategories,
  onNavigate,
}: LandingCategoriesSectionProps) {
  const categoriesScrollRef = useRef<HTMLDivElement>(null);

  const scrollCategories = (direction: "left" | "right") => {
    if (!categoriesScrollRef.current) return;

    categoriesScrollRef.current.scrollBy({
      left: direction === "left" ? -200 : 200,
      behavior: "smooth",
    });
  };

  return (
    <section className="py-8" id="categories-section">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Kategori</h2>
          <div className="inline-flex rounded-full border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800">
            <button
              onClick={() => onCategoryTypeChange("barang")}
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
              onClick={() => onCategoryTypeChange("jasa")}
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

        <div className="relative">
          <button
            onClick={() => scrollCategories("left")}
            title="Scroll kategori ke kiri"
            aria-label="Scroll kategori ke kiri"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            onClick={() => scrollCategories("right")}
            title="Scroll kategori ke kanan"
            aria-label="Scroll kategori ke kanan"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <div
            ref={categoriesScrollRef}
            className="overflow-x-auto py-2 px-10 [scrollbar-width:none] [ms-overflow-style:none]"
          >
            <div className="flex gap-2">
              {currentCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() =>
                    onNavigate(
                      categoryType === "barang" ? "catalog" : "services",
                      { category: category.id },
                    )
                  }
                  className={`flex items-center gap-2 px-4 py-2 rounded-full shrink-0 transition-all group ${
                    categoryType === "barang"
                      ? "bg-white border border-slate-200 hover:border-primary-400 hover:bg-transparent dark:bg-slate-800 dark:border-slate-700"
                      : "bg-white border border-slate-200 hover:border-primary-400 hover:bg-transparent dark:bg-slate-800 dark:border-slate-700"
                  }`}
                >
                  <span
                    className={`text-sm font-medium whitespace-nowrap ${
                      "group-hover:text-primary-700 dark:group-hover:text-primary-400"
                    }`}
                  >
                    {category.label}
                  </span>
                </button>
              ))}
              <button
                onClick={() =>
                  onNavigate(categoryType === "barang" ? "catalog" : "services")
                }
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
  );
}
