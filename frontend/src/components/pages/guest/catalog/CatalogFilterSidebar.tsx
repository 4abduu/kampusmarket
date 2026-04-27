import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { CatalogFilterSidebarProps } from "@/components/pages/guest/catalog/catalog.types";
import CategorySection from "@/components/shared/CategorySection";

export default function CatalogFilterSidebar({
  selectedCategory,
  setSelectedCategory,
  selectedConditions,
  handleConditionChange,
  tempPrice,
  setTempPrice,
  setPriceRange,
  onResetFilters,
  categories,
}: CatalogFilterSidebarProps) {
  return (
    <div className="space-y-6">
      <CategorySection
        categories={categories}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />

      <div>
        <h3 className="font-semibold mb-3">Kondisi</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="baru"
              checked={selectedConditions.includes("baru")}
              onCheckedChange={(checked) =>
                handleConditionChange("baru", checked as boolean)
              }
            />
            <Label
              htmlFor="baru"
              className="text-sm font-normal cursor-pointer"
            >
              Baru
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="bekas"
              checked={selectedConditions.includes("bekas")}
              onCheckedChange={(checked) =>
                handleConditionChange("bekas", checked as boolean)
              }
            />
            <Label
              htmlFor="bekas"
              className="text-sm font-normal cursor-pointer"
            >
              Bekas
            </Label>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Rentang Harga</h3>
        <div className="space-y-4">
          <Slider
            value={tempPrice}
            onValueChange={setTempPrice}
            // Radix `Slider` exposes `onValueCommit` which fires when user releases the thumb
            onValueCommit={(val: number[]) => {
              setPriceRange(val);
            }}
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

      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          onResetFilters();
        }}
      >
        Reset Filter
      </Button>
    </div>
  );
}
