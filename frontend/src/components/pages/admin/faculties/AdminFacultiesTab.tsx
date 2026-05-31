import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, X, Pencil, Trash2, GraduationCap } from "lucide-react";
import type { Faculty as BaseFaculty } from "../admin-dashboard.shared";
import { formatAdminDate } from "../admin-dashboard.shared";

type Faculty = BaseFaculty & {
  description?: string;
  studentCount?: number;
  createdAt?: string;
};

type FacultyStats = {
  totalFaculties: number;
  activeFaculties: number;
};

interface Props {
  stats: FacultyStats;
  filteredFaculties: Faculty[];
  paginatedFaculties: Faculty[];
  currentPage: number;
  facultySearchTerm: string;
  setFacultySearchTerm: (value: string) => void;
  facultyStatusFilter: string;
  setFacultyStatusFilter: (value: "all" | "active" | "inactive") => void;
  setFacultyPage: (value: number) => void;
  getTotalPages: (value: number) => number;
  renderPagination: (currentPage: number, totalPages: number, setPage: (page: number) => void) => ReactNode;
  facultyAccentClass: string;
  getInitials: (value?: string | null) => string;
  handleAddFaculty: () => void;
  handleEditFaculty: (faculty: Faculty) => void;
  handleToggleFacultyActive: (faculty: Faculty) => void;
  handleDeleteFaculty: (faculty: Faculty) => void;
}

export default function AdminFacultiesTab({
  filteredFaculties,
  paginatedFaculties,
  currentPage,
  facultySearchTerm,
  setFacultySearchTerm,
  facultyStatusFilter,
  setFacultyStatusFilter,
  setFacultyPage,
  getTotalPages,
  renderPagination,
  stats,
  handleAddFaculty,
  handleEditFaculty,
  handleToggleFacultyActive,
  handleDeleteFaculty,
}: Props) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                Manajemen Fakultas
              </CardTitle>
              <CardDescription>Kelola data fakultas untuk seleksi saat registrasi user</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-muted-foreground">
                {filteredFaculties.length} fakultas ({stats.activeFaculties} aktif)
              </div>
              <Button onClick={handleAddFaculty} className="gap-2">
                <Plus className="h-4 w-4" />
                Tambah Fakultas
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari nama atau kode fakultas..."
                value={facultySearchTerm}
                onChange={(e) => { setFacultySearchTerm(e.target.value); setFacultyPage(1); }}
                className="pl-9"
              />
            </div>
            <Select value={facultyStatusFilter} onValueChange={(value) => { setFacultyStatusFilter(value as "all" | "active" | "inactive"); setFacultyPage(1); }}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Nonaktif</SelectItem>
              </SelectContent>
            </Select>
            {(facultyStatusFilter !== "all" || facultySearchTerm) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFacultySearchTerm("");
                  setFacultyStatusFilter("all");
                  setFacultyPage(1);
                }}
                className="text-xs text-muted-foreground"
              >
                <X className="h-3 w-3 mr-1" />
                Reset
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredFaculties.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <GraduationCap className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Tidak ada fakultas ditemukan</p>
            <p className="text-sm mt-1">Coba ubah filter pencarian atau tambahkan fakultas baru</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[25%]">Fakultas</TableHead>
                  <TableHead className="w-[10%]">Kode</TableHead>
                  <TableHead className="w-[25%]">Deskripsi</TableHead>
                  <TableHead className="w-[10%]">Mahasiswa</TableHead>
                  <TableHead className="w-[10%]">Urutan</TableHead>
                  <TableHead className="w-[10%]">Status</TableHead>
                  <TableHead className="w-[10%]">Dibuat</TableHead>
                  <TableHead className="w-[5%] text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedFaculties.map((faculty) => (
                  <TableRow key={faculty.id} className={!faculty.isActive ? "opacity-60" : ""}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium text-sm">{faculty.name}</p>
                          {!faculty.isActive && (
                            <Badge variant="outline" className="text-xs text-slate-500 border-slate-300 mt-0.5">
                              Nonaktif
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono text-xs bg-indigo-50 text-indigo-700 border-indigo-200 uppercase">
                        {faculty.code}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[250px] truncate">
                      {faculty.description || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium">{(faculty.studentCount || 0).toLocaleString()}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{faculty.sortOrder}</TableCell>
                    <TableCell>
                      <button
                        onClick={() => handleToggleFacultyActive(faculty)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer"
                      >
                        <div className={`w-2 h-2 rounded-full ${faculty.isActive ? 'bg-green-500' : 'bg-slate-400'}`} />
                        <span className={faculty.isActive ? 'text-green-700' : 'text-slate-500'}>
                          {faculty.isActive ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </button>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatAdminDate(faculty.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditFaculty(faculty)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteFaculty(faculty)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {renderPagination(currentPage, getTotalPages(filteredFaculties.length), setFacultyPage)}
          </>
        )}
      </CardContent>
    </Card>
  );
}
