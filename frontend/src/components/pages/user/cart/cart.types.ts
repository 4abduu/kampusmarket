import type { Product } from "@/lib/mock-data";

export interface CartPageProps {
  onNavigate: (page: string) => void;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartHeaderProps {
  itemCount: number;
  onNavigate: (page: string) => void;
}

export interface CartSelectAllCardProps {
  itemCount: number;
  selectedCount: number;
  onSelectAll: (checked: boolean) => void;
}
