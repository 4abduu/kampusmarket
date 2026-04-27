import { API_BASE_URL } from "@/lib/config";
import type { Product } from "@/lib/mock-data";

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  meta?: unknown;
};

interface ProductsListResponse {
  data: Product[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

const CACHE_TTL_MS = 30_000;
const responseCache = new Map<string, { timestamp: number; data: unknown }>();
const inflightRequests = new Map<string, Promise<unknown>>();

const parseJson = async <T>(response: Response): Promise<T> => {
  const payload = (await response.json()) as T;
  return payload;
};

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

  const payload = await parseJson<ApiEnvelope<T>>(response);

  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.message || "Request failed");
  }

  // For ProductsListResponse, backend returns: {success, data: [...array...], meta: {...}}
  // We need to return: {data: [...array...], meta: {...}}
  // So if we detect meta in payload, return {data: payload.data, meta: payload.meta}
  if (payload?.meta) {
    const result = {
      data: payload.data,
      meta: payload.meta,
    } as unknown as T;

    if (cacheKey) {
      responseCache.set(cacheKey, { timestamp: Date.now(), data: result });
    }

    return result;
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

export const productsApi = {
  /**
   * Get all products (public).
   */
  async getProducts(params?: {
    type?: "barang" | "jasa";
    category?: string;
    search?: string;
    page?: number;
    per_page?: number;
    condition?: string;
    price_min?: number;
    price_max?: number;
    sort_by?: string; // e.g. 'price', 'rating', 'created_at'
    sort_order?: 'asc' | 'desc';
    location?: string;
  }): Promise<ProductsListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append("type", params.type);
    if (params?.category) queryParams.append("category", params.category);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.per_page) queryParams.append("per_page", params.per_page.toString());
    if (params?.condition) queryParams.append("condition", params.condition);
    if (typeof params?.price_min !== "undefined") queryParams.append("price_min", params.price_min.toString());
    if (typeof params?.price_max !== "undefined") queryParams.append("price_max", params.price_max.toString());
    if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params?.sort_order) queryParams.append("sort_order", params.sort_order);
    if (params?.location) queryParams.append("location", params.location);

    const url = `${API_BASE_URL}/products${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
    return request<ProductsListResponse>(url, undefined, { cacheKey: `products:${queryParams.toString() || "all"}` });
  },

  /**
   * Get product by slug or ID.
   */
  async getProduct(id: string): Promise<Product> {
    return request<Product>(`${API_BASE_URL}/products/${id}`, undefined, { cacheKey: `product:${id}` });
  },

  /**
   * Search products.
   */
  async searchProducts(query: string, page?: number): Promise<ProductsListResponse> {
    const params = new URLSearchParams({ q: query });
    if (page) params.append("page", page.toString());
    return request<ProductsListResponse>(
      `${API_BASE_URL}/products/search?${params.toString()}`
    );
  },

  /**
   * Get products by category.
   */
  async getProductsByCategory(
    category: string,
    page?: number
  ): Promise<ProductsListResponse> {
    const params = new URLSearchParams();
    if (page) params.append("page", page.toString());
    const url = `${API_BASE_URL}/products/category/${category}${params.toString() ? "?" + params.toString() : ""}`;
    return request<ProductsListResponse>(url);
  },

  /**
   * Get products by seller.
   */
  async getProductsBySeller(
    sellerId: string,
    page?: number
  ): Promise<ProductsListResponse> {
    const params = new URLSearchParams();
    if (page) params.append("page", page.toString());
    const url = `${API_BASE_URL}/products/seller/${sellerId}${params.toString() ? "?" + params.toString() : ""}`;
    return request<ProductsListResponse>(url);
  },

  /**
   * Get my products (authenticated).
   */
  async getMyProducts(params?: {
    status?: string;
    page?: number;
    per_page?: number;
  }): Promise<ProductsListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append("status", params.status);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.per_page) queryParams.append("per_page", params.per_page.toString());

    const url = `${API_BASE_URL}/my/products${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
    return request<ProductsListResponse>(url);
  },

  /**
   * Create a new product (authenticated).
   */
  async createProduct(data: Partial<Product> & { images?: string[] }): Promise<Product> {
    return request<Product>(`${API_BASE_URL}/products`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Update product (authenticated).
   */
  async updateProduct(id: string, data: Partial<Product> & { images?: string[] }): Promise<Product> {
    return request<Product>(`${API_BASE_URL}/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete product (authenticated).
   */
  async deleteProduct(id: string): Promise<{ message: string }> {
    return request<{ message: string }>(`${API_BASE_URL}/products/${id}`, {
      method: "DELETE",
    });
  },

  /**
   * Update product status (authenticated).
   */
  async updateProductStatus(
    id: string,
    status: "draft" | "active" | "sold_out" | "archived"
  ): Promise<Product> {
    return request<Product>(`${API_BASE_URL}/products/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  },
};

// Export standalone functions for convenience
export const getProducts = (params?: any) => productsApi.getProducts(params);
export const getProductDetail = (id: string) => productsApi.getProduct(id);
export const createProduct = (data: Partial<Product>) => productsApi.createProduct(data);
export const updateProduct = (id: string, data: Partial<Product>) => productsApi.updateProduct(id, data);
export const deleteProduct = (id: string) => productsApi.deleteProduct(id);
export const searchProducts = (query: string, page?: number) => productsApi.searchProducts(query, page);
export const getProductsByCategory = (category: string, page?: number) => productsApi.getProductsByCategory(category, page);
export const getProductsBySeller = (sellerId: string, page?: number) => productsApi.getProductsBySeller(sellerId, page);
export const getMyProducts = (params?: any) => productsApi.getMyProducts(params);

export const uploadProductImages = (files: File[]) => import('@/lib/api/images').then(m => m.uploadImages(files));
