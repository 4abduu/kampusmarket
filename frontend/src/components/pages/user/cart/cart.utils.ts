import type { Product } from "@/lib/mock-data";

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};

export const buildCartProducts = (products: Product[], ids: string[]) => {
  return ids
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is Product => Boolean(product));
};

export const computeSubtotal = (
  selectedIds: string[],
  items: Array<{ product: Product; quantity: number }>,
) => {
  return items
    .filter((item) => selectedIds.includes(item.product.id))
    .reduce((sum, item) => sum + item.product.price * item.quantity, 0);
};
