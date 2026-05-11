import type { Product } from "@/components/pages/user/favorites/favorites.types";

export const formatIDR = (price: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);

export const getPriceLabel = (product: Product): string => {
  if (product.price_type === "range" && product.price_min && product.price_max) {
    return `${formatIDR(product.price_min)} - ${formatIDR(product.price_max)}`;
  }
  if (product.price_type === "starting" && product.price_min) {
    return `Mulai ${formatIDR(product.price_min)}`;
  }
  return formatIDR(product.price);
};

export const getPrimaryImage = (product: Product): string => {
  if (product.images?.length) {
    const primary = product.images.find((image) => image.is_primary);
    return primary?.url ?? product.images[0].url;
  }
  return "/placeholder-product.png";
};

export const getSavings = (product: Product): number =>
  product.original_price ? Math.max(0, product.original_price - product.price) : 0;

export const getDiscountPercentage = (product: Product): number => {
  if (!product.original_price || product.original_price <= 0) return 0;
  const discount = ((product.original_price - product.price) / product.original_price) * 100;
  return Math.round(discount);
};

export const getInitials = (name: string) =>
  name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export const getDurationLabel = (product: Product): string | null => {
  if (!product.duration_min && !product.duration_max) return null;
  const unit = product.duration_unit ?? "hari";
  if (product.duration_is_plus) return `${product.duration_min}+ ${unit}`;
  if (product.duration_min && product.duration_max) {
    return `${product.duration_min}-${product.duration_max} ${unit}`;
  }
  return `${product.duration_min ?? product.duration_max} ${unit}`;
};

export const availabilityMap = {
  available: {
    label: "Tersedia",
    cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  busy: {
    label: "Sedang Sibuk",
    cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  full: {
    label: "Penuh",
    cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
} as const;
