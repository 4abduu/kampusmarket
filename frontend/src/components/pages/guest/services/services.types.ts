export interface ServiceCategoryOption {
  id: string;
  label: string;
}

export interface ServicesFilterSidebarProps {
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  priceRange: number[];
  setPriceRange: (range: number[]) => void;
  onResetFilters: () => void;
  categories: ServiceCategoryOption[];
}
