export interface Faculty {
  id: number;
  code: string;
  name: string;
  icon: string | null;
  color: string | null;
}

export interface Seller {
  id: number;
  uuid: string;
  name: string;
  avatar: string | null;
  rating: number;
  review_count: number;
  is_verified: boolean;
  faculty?: Faculty;
}

export interface ProductImage {
  id: number;
  url: string;
  alt: string | null;
  sort_order: number;
  is_primary: boolean;
}

export interface Category {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  icon: string | null;
  type: "barang" | "jasa";
}

export interface Product {
  id: number;
  uuid: string;
  seller_id: number;
  category_id: number | null;
  title: string;
  slug: string;
  description: string;
  price: number;
  original_price: number | null;
  price_min: number | null;
  price_max: number | null;
  price_type: "fixed" | "range" | "starting";
  type: "barang" | "jasa";
  condition: "baru" | "bekas" | null;
  stock: number;
  weight: number | null;
  duration_min: number | null;
  duration_max: number | null;
  duration_unit: "jam" | "hari" | "minggu" | "bulan" | null;
  duration_is_plus: boolean;
  availability_status: "available" | "busy" | "full" | null;
  is_online: boolean;
  is_onsite: boolean;
  is_home_service: boolean;
  can_nego: boolean;
  is_cod: boolean;
  is_pickup: boolean;
  is_delivery: boolean;
  delivery_fee_min: number | null;
  delivery_fee_max: number | null;
  location: string;
  views: number;
  rating: number;
  review_count: number;
  sold_count: number;
  status: "draft" | "active" | "sold_out" | "archived";
  created_at: string;
  images?: ProductImage[];
  seller?: Seller;
  category?: Category;
}

export interface Favorite {
  id: number;
  uuid: string;
  user_id: number;
  product_id: number;
  created_at: string;
  product?: Product;
}

export interface FavoriteStats {
  totalItems: number;
  totalValue: number;
  totalSavings: number;
  avgRating: number;
}
