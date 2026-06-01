export interface Faculty {
  id: string;
  code: string;
  name: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  studentCount?: number;
}

export type FacultyApiItem = {
  id?: string;
  code?: string;
  name?: string;
  description?: string;
  sortOrder?: number;
  sort_order?: number;
  isActive?: boolean;
  is_active?: boolean;
  studentCount?: number;
  student_count?: number;
  value?: string;
  label?: string;
};

export const seedFaculties: Faculty[] = [
  { id: "vokasi", code: "vokasi", name: "Fakultas Vokasi", sortOrder: 1, isActive: true, studentCount: 0 },
  { id: "feb", code: "feb", name: "Fakultas Ekonomi dan Bisnis (FEB)", sortOrder: 2, isActive: true, studentCount: 0 },
  { id: "filkom", code: "filkom", name: "Fakultas Ilmu Komputer (FILKOM)", sortOrder: 3, isActive: true, studentCount: 0 },
  { id: "ft", code: "ft", name: "Fakultas Teknik (FT)", sortOrder: 4, isActive: true, studentCount: 0 },
  { id: "fmipa", code: "fmipa", name: "Fakultas Matematika dan Ilmu Pengetahuan Alam (FMIPA)", sortOrder: 5, isActive: true, studentCount: 0 },
  { id: "fisip", code: "fisip", name: "Fakultas Ilmu Sosial dan Ilmu Politik (FISIP)", sortOrder: 6, isActive: true, studentCount: 0 },
  { id: "fh", code: "fh", name: "Fakultas Hukum (FH)", sortOrder: 7, isActive: true, studentCount: 0 },
  { id: "fk", code: "fk", name: "Fakultas Kedokteran (FK)", sortOrder: 8, isActive: true, studentCount: 0 },
  { id: "fkh", code: "fkh", name: "Fakultas Kedokteran Hewan (FKH)", sortOrder: 9, isActive: true, studentCount: 0 },
  { id: "fapet", code: "fapet", name: "Fakultas Peternakan (FAPET)", sortOrder: 10, isActive: true, studentCount: 0 },
  { id: "fp", code: "fp", name: "Fakultas Pertanian (FP)", sortOrder: 11, isActive: true, studentCount: 0 },
  { id: "fpi", code: "fpi", name: "Fakultas Perikanan dan Ilmu Kelautan (FPIK)", sortOrder: 12, isActive: true, studentCount: 0 },
  { id: "fib", code: "fib", name: "Fakultas Ilmu Budaya (FIB)", sortOrder: 13, isActive: true, studentCount: 0 },
  { id: "psdku", code: "psdku", name: "PSDKU", sortOrder: 14, isActive: true, studentCount: 0 },
  { id: "alumni", code: "alumni", name: "Alumni", sortOrder: 15, isActive: true, studentCount: 0 },
  { id: "masyarakat", code: "masyarakat", name: "Masyarakat Umum", sortOrder: 16, isActive: true, studentCount: 0 },
  { id: "lainnya", code: "lainnya", name: "Lainnya", sortOrder: 17, isActive: true, studentCount: 0 },
];

export const getInitials = (name: string | undefined | null): string => {
  if (!name) return "?";
  return name
    .toString()
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";
};

export const formatAdminDate = (
  dateVal: string | Date | undefined | null,
  includeTime: boolean = false
): string => {
  if (!dateVal) return "-";
  try {
    const date = typeof dateVal === "string" ? new Date(dateVal) : dateVal;
    if (isNaN(date.getTime())) return "-";
    
    const dateStr = date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
    
    if (includeTime) {
      const timeStr = date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit"
      });
      return `${dateStr} ${timeStr}`;
    }
    
    return dateStr;
  } catch (e) {
    return "-";
  }
};
