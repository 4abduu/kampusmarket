import type { Product, User } from "@/lib/mock-data";

export interface SearchResultsPayload {
  products: Product[];
  services: Product[];
  users: User[];
  userProducts: Product[];
}

export type SearchViewMode = "grid" | "list";

export type SearchTab = "all" | "products" | "services" | "users";

export type SearchNavigateFn = (
  page: string,
  data?: string | { category?: string; searchQuery?: string },
) => void;
