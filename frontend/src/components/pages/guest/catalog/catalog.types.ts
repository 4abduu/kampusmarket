export interface CatalogCategoryOption {
  id: string;
  label: string;
}

export interface CatalogFilterSidebarProps {
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  selectedConditions: string[];
  handleConditionChange: (condition: string, checked: boolean) => void;
  // `tempPrice` is used while the user is dragging the slider.
  // `priceRange` is the committed value used for API fetches.
  tempPrice: number[];
  setTempPrice: (range: number[]) => void;
  priceRange: number[];
  setPriceRange: (range: number[]) => void;
  onResetFilters: () => void;
  categories: CatalogCategoryOption[];
}
