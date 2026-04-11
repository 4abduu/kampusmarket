import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, X, Pencil, Trash2, XCircle, CheckCircle2, GraduationCap } from "lucide-react";
import type { Faculty } from "./admin-dashboard.shared";

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
  stats,
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
  facultyAccentClass,
  getInitials,
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
            <div><CardTitle>Manajemen Fakultas</CardTitle><CardDescription>Kelola referensi fakultas yang dipakai di profil user dan formulir pendaftaran</CardDescription></div>
            <Button onClick={handleAddFaculty} className="gap-2"><Plus className="h-4 w-4" />Tambah Fakultas</Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-slate-200 dark:border-slate-800"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total Fakultas</p><p className="text-2xl font-bold">{stats.totalFaculties}</p></CardContent></Card>
            <Card className="border-emerald-200 dark:border-emerald-800"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Fakultas Aktif</p><p className="text-2xl font-bold">{stats.activeFaculties}</p></CardContent></Card>
            <Card className="border-cyan-200 dark:border-cyan-800"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Tampil di Pendaftaran</p><p className="text-2xl font-bold">{stats.activeFaculties}</p></CardContent></Card>
            <Card className="border-amber-200 dark:border-amber-800"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Nonaktif</p><p className="text-2xl font-bold">{stats.totalFaculties - stats.activeFaculties}</p></CardContent></Card>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px] max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input type="search" placeholder="Cari nama atau kode fakultas..." value={facultySearchTerm} onChange={(e) => { setFacultySearchTerm(e.target.value); setFacultyPage(1); }} className="pl-9" /></div>
            <Select value={facultyStatusFilter} onValueChange={(value) => { setFacultyStatusFilter(value as "all" | "active" | "inactive"); setFacultyPage(1); }}><SelectTrigger className="w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">Semua Status</SelectItem><SelectItem value="active">Aktif</SelectItem><SelectItem value="inactive">Nonaktif</SelectItem></SelectContent></Select>
            {(facultySearchTerm || facultyStatusFilter !== "all") && <Button variant="ghost" size="sm" onClick={() => { setFacultySearchTerm(""); setFacultyStatusFilter("all"); setFacultyPage(1); }} className="text-xs text-muted-foreground"><X className="h-3 w-3 mr-1" />Reset</Button>}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredFaculties.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground"><GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-30" /><p>Tidak ada fakultas ditemukan dengan filter tersebut</p></div>
        ) : (
          <>
            <Table>
              <TableHeader><TableRow><TableHead>Fakultas</TableHead><TableHead>Kode</TableHead><TableHead>Urutan</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
              <TableBody>
                {paginatedFaculties.map((faculty) => (
                  <TableRow key={faculty.id}>
                    <TableCell><div className="flex items-center gap-3"><div className={`h-10 w-10 rounded-full flex items-center justify-center text-white ${facultyAccentClass}`}><span className="text-lg leading-none">{getInitials(faculty.name)}</span></div><div><p className="font-medium text-sm">{faculty.name}</p><p className="text-xs text-muted-foreground">ID: {faculty.id}</p></div></div></TableCell>
                    <TableCell className="text-sm uppercase font-medium">{faculty.code}</TableCell>
                    <TableCell className="text-sm">{faculty.sortOrder}</TableCell>
                    <TableCell><Badge variant={faculty.isActive ? "default" : "secondary"} className={faculty.isActive ? "bg-primary-500" : ""}>{faculty.isActive ? "Aktif" : "Nonaktif"}</Badge></TableCell>
                    <TableCell className="text-right"><div className="flex items-center justify-end gap-1"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditFaculty(faculty)}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggleFacultyActive(faculty)}>{faculty.isActive ? <XCircle className="h-4 w-4 text-amber-600" /> : <CheckCircle2 className="h-4 w-4 text-primary-600" />}</Button><Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDeleteFaculty(faculty)}><Trash2 className="h-4 w-4" /></Button></div></TableCell>
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
