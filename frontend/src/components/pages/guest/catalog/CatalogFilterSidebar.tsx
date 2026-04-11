import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { CatalogFilterSidebarProps } from "@/components/pages/guest/catalog/catalog.types";

export default function CatalogFilterSidebar({
  selectedCategory,
  setSelectedCategory,
  selectedConditions,
  handleConditionChange,
  priceRange,
  setPriceRange,
  onResetFilters,
  categories,
}: CatalogFilterSidebarProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Kategori</h3>
        <div className="space-y-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              selectedCategory === null
                ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                : "hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            Semua Kategori
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                selectedCategory === category.id
                  ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Kondisi</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="baru"
              checked={selectedConditions.includes("baru")}
              onCheckedChange={(checked) => handleConditionChange("baru", checked as boolean)}
            />
            <Label htmlFor="baru" className="text-sm font-normal cursor-pointer">
              Baru
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="bekas"
              checked={selectedConditions.includes("bekas")}
              onCheckedChange={(checked) => handleConditionChange("bekas", checked as boolean)}
            />
            <Label htmlFor="bekas" className="text-sm font-normal cursor-pointer">
              Bekas
            </Label>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Rentang Harga</h3>
        <div className="space-y-4">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={1000000}
            step={10000}
            className="w-full"
          />
          <div className="flex items-center gap-2">
            <Input type="text" value={`Rp ${priceRange[0].toLocaleString("id-ID")}`} readOnly className="text-xs" />
            <span>-</span>
            <Input type="text" value={`Rp ${priceRange[1].toLocaleString("id-ID")}`} readOnly className="text-xs" />
          </div>
        </div>
      </div>

      <Button variant="outline" className="w-full" onClick={onResetFilters}>
        Reset Filter
      </Button>
    </div>
  );
}
