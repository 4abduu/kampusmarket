import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import type { ServicesFilterSidebarProps } from "@/components/pages/guest/services/services.types";
import CategorySection from "@/components/shared/CategorySection";

export default function ServicesFilterSidebar({
  selectedCategory,
  setSelectedCategory,
  priceRange,
  setPriceRange,
  onResetFilters,
  categories,
  maxPrice,
}: ServicesFilterSidebarProps) {
  const [tempPrice, setTempPrice] = useState(priceRange);

  useEffect(() => {
    setTempPrice(priceRange);
  }, [priceRange]);

  return (
    <div className="space-y-6">
      <CategorySection
        categories={categories}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />

      <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
        <h3 className="font-semibold text-sm tracking-tight mb-4 text-slate-900 dark:text-slate-100">Rentang Harga</h3>
        <div className="space-y-6">
          <Slider
            value={tempPrice}
            onValueChange={setTempPrice}
            onValueCommit={(val) => setPriceRange(val)}
            max={maxPrice || 5000000}
            step={10000}
            className="w-full"
          />
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1">
              <p className="text-[10px] text-slate-500 mb-1 font-medium uppercase tracking-wider">Minimum</p>
              <Input
                type="text"
                value={`Rp ${tempPrice[0].toLocaleString("id-ID")}`}
                readOnly
                className="h-9 text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 font-medium"
              />
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-slate-500 mb-1 font-medium uppercase tracking-wider">Maksimum</p>
              <Input
                type="text"
                value={`Rp ${tempPrice[1].toLocaleString("id-ID")}`}
                readOnly
                className="h-9 text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 font-medium"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <Button 
          variant="outline" 
          className="w-full h-11 rounded-xl border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold" 
          onClick={onResetFilters}
        >
          Reset Filter
        </Button>
      </div>
    </div>
  );
}
