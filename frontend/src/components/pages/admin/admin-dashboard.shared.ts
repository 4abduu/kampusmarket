export interface Faculty {
  id: string;
  code: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
}

export type FacultyApiItem = {
  id?: string;
  code?: string;
  name?: string;
  sortOrder?: number;
  sort_order?: number;
  isActive?: boolean;
  is_active?: boolean;
};

export const seedFaculties: Faculty[] = [
  { id: "vokasi", code: "vokasi", name: "Fakultas Vokasi", sortOrder: 1, isActive: true },
  { id: "feb", code: "feb", name: "Fakultas Ekonomi dan Bisnis (FEB)", sortOrder: 2, isActive: true },
  { id: "filkom", code: "filkom", name: "Fakultas Ilmu Komputer (FILKOM)", sortOrder: 3, isActive: true },
  { id: "ft", code: "ft", name: "Fakultas Teknik (FT)", sortOrder: 4, isActive: true },
  { id: "fmipa", code: "fmipa", name: "Fakultas Matematika dan Ilmu Pengetahuan Alam (FMIPA)", sortOrder: 5, isActive: true },
  { id: "fisip", code: "fisip", name: "Fakultas Ilmu Sosial dan Ilmu Politik (FISIP)", sortOrder: 6, isActive: true },
  { id: "fh", code: "fh", name: "Fakultas Hukum (FH)", sortOrder: 7, isActive: true },
  { id: "fk", code: "fk", name: "Fakultas Kedokteran (FK)", sortOrder: 8, isActive: true },
  { id: "fkh", code: "fkh", name: "Fakultas Kedokteran Hewan (FKH)", sortOrder: 9, isActive: true },
  { id: "fapet", code: "fapet", name: "Fakultas Peternakan (FAPET)", sortOrder: 10, isActive: true },
  { id: "fp", code: "fp", name: "Fakultas Pertanian (FP)", sortOrder: 11, isActive: true },
  { id: "fpi", code: "fpi", name: "Fakultas Perikanan dan Ilmu Kelautan (FPIK)", sortOrder: 12, isActive: true },
  { id: "fib", code: "fib", name: "Fakultas Ilmu Budaya (FIB)", sortOrder: 13, isActive: true },
  { id: "psdku", code: "psdku", name: "PSDKU", sortOrder: 14, isActive: true },
  { id: "alumni", code: "alumni", name: "Alumni", sortOrder: 15, isActive: true },
  { id: "masyarakat", code: "masyarakat", name: "Masyarakat Umum", sortOrder: 16, isActive: true },
  { id: "lainnya", code: "lainnya", name: "Lainnya", sortOrder: 17, isActive: true },
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
