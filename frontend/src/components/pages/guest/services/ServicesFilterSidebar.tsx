import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import type { ServicesFilterSidebarProps } from "@/components/pages/guest/services/services.types";

export default function ServicesFilterSidebar({
  selectedCategory,
  setSelectedCategory,
  priceRange,
  setPriceRange,
  onResetFilters,
  categories,
}: ServicesFilterSidebarProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Kategori Jasa</h3>
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
