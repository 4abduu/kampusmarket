import type { Faculty, FacultyApiItem } from "@/components/pages/admin/admin-dashboard.shared";
import { API_BASE_URL } from "@/lib/config";

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

const mapFacultyFromApi = (faculty: FacultyApiItem): Faculty => {
  const rawCode = (faculty.code || faculty.value || faculty.id || faculty.name || "").toString();
  const rawName = faculty.name || faculty.label || rawCode || "Fakultas";
  return {
    id: rawCode || `faculty-${Math.random().toString(36).slice(2, 9)}`,
    code: rawCode,
    name: rawName,
    description: faculty.description || "",
    sortOrder: Number(faculty.sortOrder ?? faculty.sort_order ?? 0),
    isActive: Boolean(faculty.isActive ?? faculty.is_active ?? false),
    studentCount: Number(faculty.studentCount ?? faculty.student_count ?? 0),
  };
};

const extractFacultyArray = (payload: unknown): FacultyApiItem[] => {
  if (Array.isArray(payload)) return payload as FacultyApiItem[];
  if (payload && typeof payload === "object") {
    const maybeData = (payload as { data?: unknown }).data;
    if (Array.isArray(maybeData)) return maybeData as FacultyApiItem[];
  }
  return [];
};

const parseJson = async <T>(response: Response): Promise<T> => {
  const payload = (await response.json()) as T;
  return payload;
};

const request = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
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

export const facultiesApi = {
  /**
   * Fetch active faculties for public dropdown (Register, Settings, etc.)
   */
  async listDropdown(): Promise<Faculty[]> {
    const response = await fetch(`${API_BASE_URL}/faculties/dropdown`, {
      credentials: "include",
    });
    const payload = await response.json();
    const data = extractFacultyArray(payload?.data ?? payload);
    return data.map(mapFacultyFromApi);
  },

  async listAdmin(): Promise<Faculty[]> {
    const data = await request<FacultyApiItem[] | { data?: FacultyApiItem[] }>(`${API_BASE_URL}/admin/faculties`);
    const items = extractFacultyArray(data);
    return items.map(mapFacultyFromApi);
  },

  async create(input: Pick<Faculty, "code" | "name" | "sortOrder" | "isActive" | "description">): Promise<Faculty> {
    const data = await request<FacultyApiItem>(`${API_BASE_URL}/admin/faculties`, {
      method: "POST",
      body: JSON.stringify({
        code: input.code,
        name: input.name,
        description: input.description,
        sort_order: input.sortOrder,
        is_active: input.isActive,
      }),
    });
    return mapFacultyFromApi(data);
  },

  async update(code: string, input: Pick<Faculty, "code" | "name" | "sortOrder" | "isActive" | "description">): Promise<Faculty> {
    const data = await request<FacultyApiItem>(`${API_BASE_URL}/admin/faculties/${encodeURIComponent(code)}`, {
      method: "PUT",
      body: JSON.stringify({
        code: input.code,
        name: input.name,
        description: input.description,
        sort_order: input.sortOrder,
        is_active: input.isActive,
      }),
    });
    return mapFacultyFromApi(data);
  },

  async updateStatus(code: string, isActive: boolean): Promise<Faculty> {
    const data = await request<FacultyApiItem>(`${API_BASE_URL}/admin/faculties/${encodeURIComponent(code)}/status`, {
      method: "PUT",
      body: JSON.stringify({ is_active: isActive }),
    });
    return mapFacultyFromApi(data);
  },

  async remove(code: string): Promise<void> {
    await request<unknown>(`${API_BASE_URL}/admin/faculties/${encodeURIComponent(code)}`, {
      method: "DELETE",
    });
  },
};
