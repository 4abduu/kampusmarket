import { API_BASE_URL } from "@/lib/config";
import type { Category } from "@/lib/mock-data";

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

const request = async <T>(
  url: string,
  init?: RequestInit
): Promise<T> => {
  const response = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init?.headers || {}),
    },
    ...init,
  });

  const payload = await response.json() as ApiEnvelope<T>;

  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.message || "Request failed");
  }

  return (payload?.data as T) ?? ({} as T);
};

export const categoriesApi = {
  /**
   * Get all categories.
   */
  async getCategories(params?: { type?: "barang" | "jasa" }): Promise<Category[]> {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append("type", params.type);
    const url = `${API_BASE_URL}/categories${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
    return request<Category[]>(url);
  },

  /**
   * Get categories with product count.
   */
  async getCategoriesWithCount(params?: {
    type?: "barang" | "jasa";
  }): Promise<Array<Category & { productCount: number }>> {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append("type", params.type);
    const url = `${API_BASE_URL}/categories/with-products${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
    return request<Array<Category & { productCount: number }>>(url);
  },

  /**
   * Get category by type.
   */
  async getCategoriesByType(
    type: "barang" | "jasa"
  ): Promise<Category[]> {
    return request<Category[]>(`${API_BASE_URL}/categories/type/${type}`);
  },

  /**
   * Get single category by slug.
   */
  async getCategory(slug: string): Promise<Category> {
    return request<Category>(`${API_BASE_URL}/categories/${slug}`);
  },
};

// Export standalone functions for convenience
export const getCategories = (params?: any) => categoriesApi.getCategories(params);
export const getCategoriesWithCount = (params?: any) => categoriesApi.getCategoriesWithCount(params);
export const getCategoriesByType = (type: "barang" | "jasa") => categoriesApi.getCategoriesByType(type);
export const getCategory = (slug: string) => categoriesApi.getCategory(slug);
