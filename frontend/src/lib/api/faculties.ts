import type { Faculty, FacultyApiItem } from "@/components/pages/admin/admin-dashboard.shared";

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

const mapFacultyFromApi = (faculty: FacultyApiItem): Faculty => {
  const rawCode = (faculty.code || faculty.id || faculty.name || "").toString();

  return {
    id: rawCode || "faculty",
    code: rawCode,
    name: faculty.name || rawCode || "Fakultas",
    sortOrder: Number(faculty.sortOrder ?? faculty.sort_order ?? 0),
    isActive: Boolean(faculty.isActive ?? faculty.is_active ?? true),
  };
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
  async listAdmin(): Promise<Faculty[]> {
    const data = await request<FacultyApiItem[]>("/api/admin/faculties");
    return Array.isArray(data) ? data.map(mapFacultyFromApi) : [];
  },

  async create(input: Pick<Faculty, "code" | "name" | "sortOrder" | "isActive">): Promise<Faculty> {
    const data = await request<FacultyApiItem>("/api/admin/faculties", {
      method: "POST",
      body: JSON.stringify({
        code: input.code,
        name: input.name,
        sort_order: input.sortOrder,
        is_active: input.isActive,
      }),
    });

    return mapFacultyFromApi(data);
  },

  async update(code: string, input: Pick<Faculty, "code" | "name" | "sortOrder" | "isActive">): Promise<Faculty> {
    const data = await request<FacultyApiItem>(`/api/admin/faculties/${encodeURIComponent(code)}`, {
      method: "PUT",
      body: JSON.stringify({
        code: input.code,
        name: input.name,
        sort_order: input.sortOrder,
        is_active: input.isActive,
      }),
    });

    return mapFacultyFromApi(data);
  },

  async updateStatus(code: string, isActive: boolean): Promise<Faculty> {
    const data = await request<FacultyApiItem>(`/api/admin/faculties/${encodeURIComponent(code)}/status`, {
      method: "PUT",
      body: JSON.stringify({ is_active: isActive }),
    });

    return mapFacultyFromApi(data);
  },

  async remove(code: string): Promise<void> {
    await request<unknown>(`/api/admin/faculties/${encodeURIComponent(code)}`, {
      method: "DELETE",
    });
  },
};
