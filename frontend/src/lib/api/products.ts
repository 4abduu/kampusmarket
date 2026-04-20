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

const parseJson = async <T>(response: Response): Promise<T> => {
  const payload = (await response.json()) as T;
  return payload;
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

  const payload = await parseJson<ApiEnvelope<T>>(response);

  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.message || "Request failed");
  }

  return (payload?.data as T) ?? ({} as T);
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
  }): Promise<ProductsListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append("type", params.type);
    if (params?.category) queryParams.append("category", params.category);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.per_page) queryParams.append("per_page", params.per_page.toString());

    const url = `${API_BASE_URL}/products${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
    return request<ProductsListResponse>(url);
  },

  /**
   * Get product by slug or ID.
   */
  async getProduct(id: string): Promise<Product> {
    return request<Product>(`${API_BASE_URL}/products/${id}`);
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
  async createProduct(data: Partial<Product>): Promise<Product> {
    return request<Product>(`${API_BASE_URL}/products`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Update product (authenticated).
   */
  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
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
