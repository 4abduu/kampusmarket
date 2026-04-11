export interface CatalogCategoryOption {
  id: string;
  label: string;
}

export interface CatalogFilterSidebarProps {
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  selectedConditions: string[];
  handleConditionChange: (condition: string, checked: boolean) => void;
  priceRange: number[];
  setPriceRange: (range: number[]) => void;
  onResetFilters: () => void;
  categories: CatalogCategoryOption[];
}
