import { API_BASE_URL } from "@/lib/config";
import type { Category } from "@/lib/mock-data";

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

const CACHE_TTL_MS = 60_000;
const responseCache = new Map<string, { timestamp: number; data: unknown }>();
const inflightRequests = new Map<string, Promise<unknown>>();

const request = async <T>(
  url: string,
  init?: RequestInit,
  options?: { cacheKey?: string; cacheTtlMs?: number }
): Promise<T> => {
  const method = init?.method?.toUpperCase() || "GET";
  const cacheKey = method === "GET" ? options?.cacheKey : undefined;
  const cacheTtlMs = options?.cacheTtlMs ?? CACHE_TTL_MS;

  if (cacheKey) {
    const cached = responseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cacheTtlMs) {
      return cached.data as T;
    }

    const inflight = inflightRequests.get(cacheKey);
    if (inflight) {
      return (await inflight) as T;
    }
  }

  const run = async () => {
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

  const result = (payload?.data as T) ?? ({} as T);
  if (cacheKey) {
    responseCache.set(cacheKey, { timestamp: Date.now(), data: result });
  }

  return result;
  };

  if (!cacheKey) {
    return run();
  }

  const promise = run().finally(() => {
    inflightRequests.delete(cacheKey);
  });
  inflightRequests.set(cacheKey, promise as Promise<unknown>);
  return promise;
};

export const categoriesApi = {
  /**
   * Get all categories.
   */
  async getCategories(params?: { type?: "barang" | "jasa" }): Promise<Category[]> {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append("type", params.type);
    const url = `${API_BASE_URL}/categories${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
    return request<Category[]>(url, undefined, { cacheKey: `categories:${queryParams.toString() || "all"}` });
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
    return request<Array<Category & { productCount: number }>>(url, undefined, { cacheKey: `categories-with-count:${queryParams.toString() || "all"}` });
  },

  /**
   * Get category by type.
   */
  async getCategoriesByType(
    type: "barang" | "jasa"
  ): Promise<Category[]> {
    return request<Category[]>(`${API_BASE_URL}/categories/type/${type}`, undefined, { cacheKey: `categories-type:${type}` });
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
