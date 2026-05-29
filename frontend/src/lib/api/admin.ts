import { API_BASE_URL } from "@/lib/config";

export interface AdminAddress {
  id: string;
  label: string;
  recipient_name: string;
  phone: string;
  address: string;
  note?: string;
  is_primary: boolean;
}

export interface AdminAddressUser {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  addresses: AdminAddress[];
}

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

const request = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init?.headers || {}),
    },
    ...init,
  });

  const payload = (await response.json()) as ApiEnvelope<T>;

  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.message || "Request failed");
  }

  // Return with meta if available, otherwise just data
  if (payload?.meta) {
    return {
      data: payload?.data,
      meta: payload?.meta,
    } as T;
  }

  return (payload?.data as T) ?? ({} as T);
};

// ============================================================
// ADMIN DASHBOARD
// ============================================================
export const adminDashboardApi = {
  async getStats() {
    return request(`${API_BASE_URL}/admin/dashboard/stats`, {
      method: "GET",
    });
  },

  async getRevenueStats() {
    return request(`${API_BASE_URL}/admin/dashboard/revenue`, {
      method: "GET",
    });
  },

  async getActivitySummary() {
    return request(`${API_BASE_URL}/admin/dashboard/activity`, {
      method: "GET",
    });
  },

  async getPlatformRevenue() {
    return request<any>(`${API_BASE_URL}/admin/dashboard/platform-revenue`, {
      method: "GET",
    });
  },
};

// ============================================================
// ADMIN PRODUCTS
// ============================================================
export const adminProductsApi = {
  async getProducts(params?: {
    type?: "barang" | "jasa";
    category_id?: string;
    status?: string;
    seller_id?: string;
    condition?: string;
    price_min?: number;
    price_max?: number;
    search?: string;
    seller_name?: string;
    sort_by?: string;
    sort_order?: "asc" | "desc";
    per_page?: number;
    page?: number;
  }): Promise<PaginatedResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append("type", params.type);
    if (params?.category_id) queryParams.append("category_id", params.category_id);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.seller_id) queryParams.append("seller_id", params.seller_id);
    if (params?.condition) queryParams.append("condition", params.condition);
    if (typeof params?.price_min !== "undefined") queryParams.append("price_min", params.price_min.toString());
    if (typeof params?.price_max !== "undefined") queryParams.append("price_max", params.price_max.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.seller_name) queryParams.append("seller_name", params.seller_name);
    if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params?.sort_order) queryParams.append("sort_order", params.sort_order);
    if (params?.per_page) queryParams.append("per_page", params.per_page.toString());
    if (params?.page) queryParams.append("page", params.page.toString());

    const url = `${API_BASE_URL}/admin/products${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
    return request<PaginatedResponse<any>>(url);
  },

  async getProduct(id: string) {
    return request(`${API_BASE_URL}/admin/products/${id}`, {
      method: "GET",
    });
  },

  async deleteProduct(id: string, options?: { delete_reason?: string }) {
    return request(`${API_BASE_URL}/admin/products/${id}`, {
      method: "DELETE",
      body: options ? JSON.stringify(options) : undefined,
    });
  },

  async getTrashedProducts(params?: {
    search?: string;
    sort_by?: string;
    sort_order?: "asc" | "desc";
    per_page?: number;
    page?: number;
  }): Promise<PaginatedResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append("search", params.search);
    if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params?.sort_order) queryParams.append("sort_order", params.sort_order);
    if (params?.per_page) queryParams.append("per_page", params.per_page.toString());
    if (params?.page) queryParams.append("page", params.page.toString());

    const url = `${API_BASE_URL}/admin/products/trashed${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
    return request<PaginatedResponse<any>>(url);
  },

  async restoreProduct(id: string) {
    return request(`${API_BASE_URL}/admin/products/${id}/restore`, {
      method: "POST",
    });
  },

  async forceDeleteProduct(id: string) {
    return request(`${API_BASE_URL}/admin/products/${id}/force`, {
      method: "DELETE",
    });
  },
};

// ============================================================
// ADMIN ORDERS
// ============================================================
export const adminOrdersApi = {
  async getOrders(params?: {
    status?: string;
    payment_status?: string;
    type?: "barang" | "jasa";
    category_id?: string;
    search?: string;
    sort_by?: string;
    sort_order?: "asc" | "desc";
    per_page?: number;
    page?: number;
  }): Promise<PaginatedResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append("status", params.status);
    if (params?.payment_status) queryParams.append("payment_status", params.payment_status);
    if (params?.type) queryParams.append("type", params.type);
    if (params?.category_id) queryParams.append("category_id", params.category_id);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params?.sort_order) queryParams.append("sort_order", params.sort_order);
    if (params?.per_page) queryParams.append("per_page", params.per_page.toString());
    if (params?.page) queryParams.append("page", params.page.toString());

    const url = `${API_BASE_URL}/admin/orders${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
    return request<PaginatedResponse<any>>(url);
  },

  async getOrder(id: string) {
    return request(`${API_BASE_URL}/orders/${id}`, {
      method: "GET",
    });
  },
};

// ============================================================
// ADMIN CATEGORIES
// ============================================================
export const adminCategoriesApi = {
  async getCategories(params?: {
    type?: "barang" | "jasa";
    is_active?: boolean;
    search?: string;
    sort_by?: string;
    sort_order?: "asc" | "desc";
    per_page?: number;
    page?: number;
  }): Promise<PaginatedResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append("type", params.type);
    if (typeof params?.is_active !== "undefined") queryParams.append("is_active", params.is_active.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params?.sort_order) queryParams.append("sort_order", params.sort_order);
    if (params?.per_page) queryParams.append("per_page", params.per_page.toString());
    if (params?.page) queryParams.append("page", params.page.toString());

    const url = `${API_BASE_URL}/admin/categories${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
    return request<PaginatedResponse<any>>(url);
  },

  async createCategory(data: {
    name: string;
    type: "barang" | "jasa";
    sort_order?: number;
    is_active?: boolean;
  }): Promise<any> {
    return request<any>(`${API_BASE_URL}/admin/categories`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getCategory(id: string): Promise<any> {
    return request<any>(`${API_BASE_URL}/admin/categories/${id}`, {
      method: "GET",
    });
  },

  async updateCategory(
    id: string,
    data: {
      name: string;
      type: "barang" | "jasa";
      sort_order?: number;
      is_active?: boolean;
    }
  ): Promise<any> {
    return request<any>(`${API_BASE_URL}/admin/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async updateCategoryStatus(id: string, is_active: boolean) {
    return request(`${API_BASE_URL}/admin/categories/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ is_active }),
    });
  },

  async deleteCategory(id: string) {
    return request(`${API_BASE_URL}/admin/categories/${id}`, {
      method: "DELETE",
    });
  },

  async getCategoryStats() {
    return request(`${API_BASE_URL}/admin/categories/stats`, {
      method: "GET",
    });
  },
};

// ============================================================
// ADMIN FACULTIES
// ============================================================
export const adminFacultiesApi = {
  async getFaculties(params?: {
    is_active?: boolean;
    search?: string;
    sort_by?: string;
    sort_order?: "asc" | "desc";
    per_page?: number;
    page?: number;
  }): Promise<PaginatedResponse<any>> {
    const queryParams = new URLSearchParams();
    if (typeof params?.is_active !== "undefined") queryParams.append("is_active", params.is_active.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params?.sort_order) queryParams.append("sort_order", params.sort_order);
    if (params?.per_page) queryParams.append("per_page", params.per_page.toString());
    if (params?.page) queryParams.append("page", params.page.toString());

    const url = `${API_BASE_URL}/admin/faculties${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
    return request<PaginatedResponse<any>>(url);
  },

  async createFaculty(data: {
    code: string;
    name: string;
    sort_order?: number;
    is_active?: boolean;
  }) {
    return request(`${API_BASE_URL}/admin/faculties`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getFaculty(code: string) {
    return request(`${API_BASE_URL}/admin/faculties/${encodeURIComponent(code)}`, {
      method: "GET",
    });
  },

  async updateFaculty(
    code: string,
    data: {
      code: string;
      name: string;
      sort_order?: number;
      is_active?: boolean;
    }
  ) {
    return request(`${API_BASE_URL}/admin/faculties/${encodeURIComponent(code)}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async updateFacultyStatus(code: string, is_active: boolean) {
    return request(`${API_BASE_URL}/admin/faculties/${encodeURIComponent(code)}/status`, {
      method: "PUT",
      body: JSON.stringify({ is_active }),
    });
  },

  async deleteFaculty(code: string) {
    return request(`${API_BASE_URL}/admin/faculties/${encodeURIComponent(code)}`, {
      method: "DELETE",
    });
  },

  async getFacultyStats() {
    return request(`${API_BASE_URL}/admin/faculties/stats`, {
      method: "GET",
    });
  },
};

// ============================================================
// ADMIN USERS
// ============================================================
export const adminUsersApi = {
  async getUsers(params?: {
    is_banned?: boolean;
    is_warned?: boolean;
    is_verified?: boolean;
    faculty_id?: string | number;
    faculty_code?: string;
    search?: string;
    sort_by?: string;
    sort_order?: "asc" | "desc";
    per_page?: number;
    page?: number;
  }): Promise<PaginatedResponse<any>> {
    const queryParams = new URLSearchParams();
    if (typeof params?.is_banned !== "undefined") queryParams.append("is_banned", params.is_banned.toString());
    if (typeof params?.is_warned !== "undefined") queryParams.append("is_warned", params.is_warned.toString());
    if (typeof params?.is_verified !== "undefined") queryParams.append("is_verified", params.is_verified.toString());
    if (params?.faculty_id) queryParams.append("faculty_id", params.faculty_id.toString());
    if (params?.faculty_code) queryParams.append("faculty_code", params.faculty_code);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params?.sort_order) queryParams.append("sort_order", params.sort_order);
    if (params?.per_page) queryParams.append("per_page", params.per_page.toString());
    if (params?.page) queryParams.append("page", params.page.toString());

    const url = `${API_BASE_URL}/admin/users${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
    return request<PaginatedResponse<any>>(url);
  },

  async getUser(id: string) {
    return request(`${API_BASE_URL}/admin/users/${id}`, {
      method: "GET",
    });
  },

  async banUser(id: string, options: { ban_reason: string }) {
    return request(`${API_BASE_URL}/admin/users/${id}/ban`, {
      method: "PUT",
      body: JSON.stringify(options),
    });
  },

  async unbanUser(id: string) {
    return request(`${API_BASE_URL}/admin/users/${id}/unban`, {
      method: "PUT",
    });
  },

  async warnUser(id: string, warning_reason: string) {
    return request(`${API_BASE_URL}/admin/users/${id}/warn`, {
      method: "PUT",
      body: JSON.stringify({ warning_reason }),
    });
  },

  async removeWarning(id: string) {
    return request(`${API_BASE_URL}/admin/users/${id}/remove-warning`, {
      method: "PUT",
    });
  },

  async verifyUser(id: string) {
    return request(`${API_BASE_URL}/admin/users/${id}/verify`, {
      method: "PUT",
    });
  },

  async getUserStats() {
    return request(`${API_BASE_URL}/admin/users/stats`, {
      method: "GET",
    });
  },
};

// ============================================================
// ADMIN ADDRESSES
// ============================================================
export const adminAddressesApi = {
  async getAddresses(): Promise<AdminAddressUser[]> {
    return request<AdminAddressUser[]>(`${API_BASE_URL}/admin/addresses`, {
      method: "GET",
    });
  },
};

// ============================================================
// ADMIN REPORTS
// ============================================================
export const adminReportsApi = {
  async getReports(params?: {
    status?: string;
    search?: string;
    sort_by?: string;
    sort_order?: "asc" | "desc";
    per_page?: number;
    page?: number;
  }): Promise<PaginatedResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append("status", params.status);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params?.sort_order) queryParams.append("sort_order", params.sort_order);
    if (params?.per_page) queryParams.append("per_page", params.per_page.toString());
    if (params?.page) queryParams.append("page", params.page.toString());

    const url = `${API_BASE_URL}/admin/reports${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
    return request<PaginatedResponse<any>>(url);
  },

  async reviewReport(id: string) {
    return request(`${API_BASE_URL}/admin/reports/${id}/review`, {
      method: "PUT",
    });
  },

  async resolveReport(id: string, body?: { resolution: string; adminNotes?: string; banUser?: boolean; banReason?: string }) {
    return request(`${API_BASE_URL}/admin/reports/${id}/resolve`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? { resolution: "Diselesaikan oleh admin" }),
    });
  },

  async dismissReport(id: string) {
    return request(`${API_BASE_URL}/admin/reports/${id}/dismiss`, {
      method: "PUT",
    });
  },
};

// ============================================================
// ADMIN CANCEL REQUESTS
// ============================================================
export const adminCancelRequestsApi = {
  async getCancelRequests(params?: {
    status?: string;
    search?: string;
    sort_by?: string;
    sort_order?: "asc" | "desc";
    per_page?: number;
    page?: number;
  }): Promise<PaginatedResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append("status", params.status);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params?.sort_order) queryParams.append("sort_order", params.sort_order);
    if (params?.per_page) queryParams.append("per_page", params.per_page.toString());
    if (params?.page) queryParams.append("page", params.page.toString());

    const url = `${API_BASE_URL}/admin/cancel-requests${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
    return request<PaginatedResponse<any>>(url);
  },

  async approveCancelRequest(id: string, options?: { adminNotes?: string; refundAmount?: number }) {
    return request(`${API_BASE_URL}/admin/cancel-requests/${id}/approve`, {
      method: "PUT",
      body: options ? JSON.stringify(options) : undefined,
    });
  },

  async rejectCancelRequest(id: string, options: { rejectionReason: string; adminNotes?: string }) {
    return request(`${API_BASE_URL}/admin/cancel-requests/${id}/reject`, {
      method: "PUT",
      body: JSON.stringify(options),
    });
  },
};

// ============================================================
// ADMIN WITHDRAWALS
// ============================================================
export const adminWithdrawalsApi = {
  async getWithdrawals(params?: {
    status?: string;
    search?: string;
    sort_by?: string;
    sort_order?: "asc" | "desc";
    per_page?: number;
    page?: number;
  }): Promise<PaginatedResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append("status", params.status);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params?.sort_order) queryParams.append("sort_order", params.sort_order);
    if (params?.per_page) queryParams.append("per_page", params.per_page.toString());
    if (params?.page) queryParams.append("page", params.page.toString());

    const url = `${API_BASE_URL}/admin/withdrawals${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
    return request<PaginatedResponse<any>>(url);
  },

  async approveWithdrawal(id: string) {
    return request(`${API_BASE_URL}/admin/withdrawals/${id}/approve`, {
      method: "PUT",
    });
  },

  async processWithdrawal(id: string) {
    return request(`${API_BASE_URL}/admin/withdrawals/${id}/process`, {
      method: "PUT",
    });
  },

  async rejectWithdrawal(id: string, options: { rejectionReason: string }) {
    return request(`${API_BASE_URL}/admin/withdrawals/${id}/reject`, {
      method: "PUT",
      body: JSON.stringify(options),
    });
  },

  async failWithdrawal(id: string, options: { failureReason: string }) {
    return request(`${API_BASE_URL}/admin/withdrawals/${id}/fail`, {
      method: "PUT",
      body: JSON.stringify(options),
    });
  },

  async completeWithdrawal(id: string) {
    return request(`${API_BASE_URL}/admin/withdrawals/${id}/complete`, {
      method: "PUT",
    });
  },
};

// ============================================================
// ADMIN TOP UPS
// ============================================================
export interface AdminTopUp {
  id: number;
  uuid: string;
  order_id: string | null;
  user_id: string;
  payment_gateway: string;
  payment_method: string | null;
  transaction_id: string | null;
  gross_amount: number;
  currency: string;
  status: "pending" | "paid" | "failed";
  type: "wallet_topup";
  raw_response?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface AdminTopUpStats {
  total_amount: number;
  successful_amount: number;
  pending_amount: number;
  failed_amount: number;
}

export interface AdminTopUpResponse {
  topups: AdminTopUp[];
  stats: AdminTopUpStats;
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export const adminTopUpsApi = {
  async getTopUps(params?: {
    status?: string;
    search?: string;
    per_page?: number;
    page?: number;
  }): Promise<AdminTopUpResponse> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append("status", params.status);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.per_page) queryParams.append("per_page", params.per_page.toString());
    if (params?.page) queryParams.append("page", params.page.toString());

    const url = `${API_BASE_URL}/admin/topups${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
    return request<AdminTopUpResponse>(url);
  },
};
