import { useState } from "react";
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
}: ServicesFilterSidebarProps) {
  const [tempPrice, setTempPrice] = useState(priceRange);

  return (
    <div className="space-y-6">
      <CategorySection
        categories={categories}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />

      <div>
        <h3 className="font-semibold mb-3">Rentang Harga</h3>
        <div className="space-y-4">
          <Slider
            value={tempPrice}
            onValueChange={setTempPrice}
            onValueCommit={(val) => setPriceRange(val)}
            max={5000000}
            step={10000}
            className="w-full"
          />
          <div className="flex items-center gap-2">
            <Input
              type="text"
              value={`Rp ${tempPrice[0].toLocaleString("id-ID")}`}
              readOnly
              className="text-xs"
            />
            <span>-</span>
            <Input
              type="text"
              value={`Rp ${tempPrice[1].toLocaleString("id-ID")}`}
              readOnly
              className="text-xs"
            />
          </div>
        </div>
      </div>

      <Button variant="outline" className="w-full" onClick={onResetFilters}>
        Reset Filter
      </Button>
    </div>
  );
}
