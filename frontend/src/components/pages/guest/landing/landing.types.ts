export interface LandingNavigateData {
  category?: string;
}

export interface LandingPageProps {
  onNavigate: (page: string, data?: string | LandingNavigateData) => void;
  isLoggedIn?: boolean;
  isCustomerOnly?: boolean;
  onStartSelling?: () => void;
}

export type LandingCategoryType = "barang" | "jasa";
