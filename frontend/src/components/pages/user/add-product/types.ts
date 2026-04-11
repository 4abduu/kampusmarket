export type ProductType = "barang" | "jasa";

export type PricingType = "tetap" | "mulai_dari" | "rentang";

export type DurationUnit = "jam" | "hari" | "minggu" | "bulan";

export type AvailabilityStatus = "available" | "busy" | "full";

export interface AddProductFormData {
  title: string;
  description: string;
  category: string;
  condition: "bekas" | "baru";
  price: string;
  priceMin: string;
  priceMax: string;
  originalPrice: string;
  stock: string;
  weight: string;
  canNego: boolean;
  location: string;
  durationMin: string;
  durationMax: string;
}

export interface AddProductShippingOptions {
  isCod: boolean;
  isPickup: boolean;
  isDelivery: boolean;
  deliveryFeeMin: number;
  deliveryFeeMax: number;
  isOnline: boolean;
  isOnsite: boolean;
  isHomeService: boolean;
}

export interface AddProductPayload {
  title: string;
  description: string;
  category_id: string;
  type: "barang" | "jasa";
  price_type: "fixed" | "starting" | "range";
  price: number;
  price_min?: number;
  price_max?: number;
  original_price?: number;
  condition?: "baru" | "bekas";
  stock: number;
  weight?: number;
  can_nego: boolean;
  location: string;
  duration_min?: number;
  duration_max?: number;
  duration_unit?: "jam" | "hari" | "minggu" | "bulan";
  duration_is_plus?: boolean;
  availability_status?: "available" | "busy" | "full";
  is_cod: boolean;
  is_pickup: boolean;
  is_delivery: boolean;
  delivery_fee_min?: number;
  delivery_fee_max?: number;
  is_online: boolean;
  is_onsite: boolean;
  is_home_service: boolean;
}
