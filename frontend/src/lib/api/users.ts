import type { User } from "@/lib/mock-data";

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

const parseJson = async <T>(response: Response): Promise<T> => {
  const payload = (await response.json()) as T;
  return payload;
};

/**
 * Central API request function for user endpoints.
 * Automatically includes credentials (cookies) in all requests.
 * Token is automatically injected from cookies by the backend middleware.
 */
const request = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, {
    credentials: "include", // Important: send cookies with request
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init?.headers || {}),
    },
    ...init,
  });

  const payload = await parseJson<ApiEnvelope<T>>(response);

  if (!response.ok || payload?.success === false) {
    // Only log error if not 401 (unauthorized)
    if (response.status !== 401) {
      // eslint-disable-next-line no-console
      console.error(`[API] ${url} failed:`, payload?.message || response.statusText);
    }
    throw new Error(payload?.message || "Request failed");
  }

  return (payload?.data as T) ?? ({} as T);
};

export const userApi = {
  /**
   * Get current authenticated user.
   * Called on App mount to restore session from cookie.
   */
  async me(): Promise<User | null> {
    try {
      const user = await request<User>("/api/auth/me");
      return user || null;
    } catch (error) {
      // Not authenticated
      return null;
    }
  },

  /**
   * Login with email and password.
   */
  async login(
    email: string,
    password: string
  ): Promise<{ user: User; token: string; tokenType: string }> {
    return request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  /**
   * Register new user.
   */
  async register(
    name: string,
    email: string,
    password: string,
    phone: string,
    facultyId?: string
  ): Promise<{ user: User; token: string; tokenType: string }> {
    return request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        password,
        phone,
        facultyId,
      }),
    });
  },

  /**
   * Logout user and clear auth tokens/cookies.
   */
  async logout(): Promise<{ message: string }> {
    return request("/api/auth/logout", {
      method: "POST",
    });
  },

  /**
   * Complete Google OAuth by selecting faculty.
   */
  async completeGoogleFacultySelection(
    facultyId: string
  ): Promise<{ data: User }> {
    return request("/api/auth/google/complete-faculty", {
      method: "POST",
      body: JSON.stringify({ facultyId }),
    });
  },

  /**
   * Get user profile.
   */
  async getProfile(): Promise<User> {
    return request("/api/users/profile");
  },

  /**
   * Update user profile.
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    return request("/api/users/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * Update user address.
   */
  async updateAddress(addressData: Record<string, unknown>): Promise<unknown> {
    return request("/api/users/addresses", {
      method: "PUT",
      body: JSON.stringify(addressData),
    });
  },

  /**
   * Get public user profile by ID.
   */
  async getPublicProfile(userId: string): Promise<User> {
    return request(`/api/users/${userId}`);
  },
};
