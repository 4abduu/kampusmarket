import { mockProducts, type Product } from "@/lib/mock-data"

export const DEMO_SELLER_IDS = ["1", "2", "adit-1", "adit-2"]

export const getInitialSellerProducts = (): Product[] => {
  return mockProducts
    .filter((product) => typeof product.sellerId === "string" && DEMO_SELLER_IDS.includes(product.sellerId))
    .slice(0, 8)
}

export const getInitialSellerProductCount = (): number => {
  return getInitialSellerProducts().length
}
