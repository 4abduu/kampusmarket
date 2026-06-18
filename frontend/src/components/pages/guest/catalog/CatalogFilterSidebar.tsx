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
  maxPrice,
}: CatalogFilterSidebarProps) {
  return (
    <div className="space-y-6">
      <CategorySection
        categories={categories}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />

      <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
        <h3 className="font-semibold text-sm tracking-tight mb-4 text-slate-900 dark:text-slate-100">Kondisi</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="baru"
              checked={selectedConditions.includes("baru")}
              onCheckedChange={(checked) =>
                handleConditionChange("baru", checked as boolean)
              }
              className="rounded-[4px] border-slate-300 data-[state=checked]:bg-primary-600 data-[state=checked]:border-primary-600"
            />
            <Label
              htmlFor="baru"
              className="text-sm font-medium leading-none cursor-pointer"
            >
              Baru
            </Label>
          </div>
          <div className="flex items-center space-x-3">
            <Checkbox
              id="bekas"
              checked={selectedConditions.includes("bekas")}
              onCheckedChange={(checked) =>
                handleConditionChange("bekas", checked as boolean)
              }
              className="rounded-[4px] border-slate-300 data-[state=checked]:bg-primary-600 data-[state=checked]:border-primary-600"
            />
            <Label
              htmlFor="bekas"
              className="text-sm font-medium leading-none cursor-pointer"
            >
              Bekas
            </Label>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
        <h3 className="font-semibold text-sm tracking-tight mb-4 text-slate-900 dark:text-slate-100">Rentang Harga</h3>
        <div className="space-y-6">
          <Slider
            value={tempPrice}
            onValueChange={setTempPrice}
            onValueCommit={(val: number[]) => {
              setPriceRange(val);
            }}
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
          onClick={() => {
            onResetFilters();
          }}
        >
          Reset Filter
        </Button>
      </div>
    </div>
  );
}
