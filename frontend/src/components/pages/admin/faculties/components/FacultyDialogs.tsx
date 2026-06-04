import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Trash2, AlertCircle, Users, Building } from "lucide-react";

import type { Faculty as BaseFaculty } from "../../admin-dashboard.shared";

type Faculty = BaseFaculty & {
  description?: string;
  studentCount?: number;
  createdAt?: string;
};

type FacultyFormState = {
  name: string;
  code: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
};

type AdminFacultyDialogsProps = {
  showFacultyDialog: boolean;
  setShowFacultyDialog: (open: boolean) => void;
  selectedFaculty: Faculty | null;
  facultyForm: FacultyFormState;
  setFacultyForm: (value: FacultyFormState) => void;
  handleSaveFaculty: () => void;
  showDeleteFacultyDialog: boolean;
  setShowDeleteFacultyDialog: (open: boolean) => void;
  facultyToDelete: Faculty | null;
  confirmDeleteFaculty: () => void;
  facultyAccentClass: string;
  getInitials: (value?: string | null) => string;
};

export default function AdminFacultyDialogs({
  showFacultyDialog,
  setShowFacultyDialog,
  selectedFaculty,
  facultyForm,
  setFacultyForm,
  handleSaveFaculty,
  showDeleteFacultyDialog,
  setShowDeleteFacultyDialog,
  facultyToDelete,
  confirmDeleteFaculty,
}: AdminFacultyDialogsProps) {
  return (
    <>
      <Dialog open={showFacultyDialog} onOpenChange={setShowFacultyDialog}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-indigo-600" />
              {selectedFaculty ? "Edit Fakultas" : "Tambah Fakultas Baru"}
            </DialogTitle>
            <DialogDescription>
              {selectedFaculty
                ? "Perbarui informasi fakultas yang ada"
                : "Isi informasi untuk menambahkan fakultas baru ke dalam sistem seleksi"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 overflow-y-auto flex-1 min-h-0 pr-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Nama Fakultas <span className="text-red-500">*</span>
              </label>
              <Input
                value={facultyForm.name}
                onChange={(e) => setFacultyForm({ ...facultyForm, name: e.target.value })}
                placeholder="Contoh: Fakultas Teknik (FT)"
              />
              <p className="text-xs text-muted-foreground">
                Nama lengkap fakultas yang akan tampil di halaman seleksi
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Kode Fakultas <span className="text-red-500">*</span>
              </label>
              <Input
                value={facultyForm.code}
                onChange={(e) => setFacultyForm({ ...facultyForm, code: e.target.value.toUpperCase() })}
                placeholder="Contoh: FT"
                maxLength={10}
                className="uppercase"
              />
              <p className="text-xs text-muted-foreground">
                Singkatan/kode unik untuk identifikasi fakultas (maks 10 karakter)
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Deskripsi</label>
                <span className="text-xs text-muted-foreground">(Opsional)</span>
              </div>
              <textarea
                value={facultyForm.description || ""}
                onChange={(e) => setFacultyForm({ ...facultyForm, description: e.target.value })}
                placeholder="Contoh: Fakultas untuk studi teknik sipil, mesin, elektro, dan arsitektur"
                className="w-full min-h-[80px] px-3 py-2 text-sm border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-muted-foreground flex items-start gap-1">
                <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                Deskripsi singkat tentang program studi atau fokus fakultas ini
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Urutan Tampil</label>
              <Input
                type="number"
                min={1}
                value={facultyForm.sortOrder}
                onChange={(e) =>
                  setFacultyForm({ ...facultyForm, sortOrder: parseInt(e.target.value) || 0 })
                }
                className="w-24"
              />
              <p className="text-xs text-muted-foreground">
                Semakin kecil angka, semakin awal fakultas ditampilkan di dropdown seleksi
              </p>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div>
                <label className="text-sm font-medium">Status Aktif</label>
                <p className="text-xs text-muted-foreground">
                  Fakultas nonaktif tidak akan muncul di halaman seleksi user
                </p>
              </div>
              <Switch
                checked={facultyForm.isActive}
                onCheckedChange={(checked) => setFacultyForm({ ...facultyForm, isActive: checked })}
              />
            </div>

            {!selectedFaculty && (
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-indigo-600 mt-0.5 shrink-0" />
                  <div className="text-xs text-indigo-700 dark:text-indigo-300 space-y-1">
                    <p className="font-medium">Informasi Penting:</p>
                    <ul className="list-disc list-inside space-y-0.5 text-indigo-600 dark:text-indigo-400">
                      <li>Fakultas yang ditambahkan akan langsung tersedia di halaman seleksi</li>
                      <li>User yang sudah memilih fakultas tidak bisa mengubahnya</li>
                      <li>Pastikan nama dan kode fakultas sudah benar sebelum menyimpan</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="flex-shrink-0 border-t pt-4">
            <Button variant="outline" onClick={() => setShowFacultyDialog(false)}>
              Batal
            </Button>
            <Button
              onClick={handleSaveFaculty}
              disabled={!facultyForm.name.trim() || !facultyForm.code.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {selectedFaculty ? "Simpan Perubahan" : "Tambah Fakultas"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteFacultyDialog} onOpenChange={setShowDeleteFacultyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Hapus Fakultas
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus fakultas "{facultyToDelete?.name}"?
            </DialogDescription>
          </DialogHeader>
          {facultyToDelete && (
            <div className="py-4 space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <Building className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium">{facultyToDelete.name}</p>
                  <Badge variant="secondary" className="mt-1 bg-indigo-50 text-indigo-700 border-indigo-200">
                    {facultyToDelete.code}
                  </Badge>
                </div>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-red-700 dark:text-red-300 mb-2">Bahaya - Tindakan Ini Berisiko Tinggi!</p>
                    <ul className="text-sm text-red-600 dark:text-red-400 space-y-1.5">
                      <li className="flex items-start gap-1.5">
                        <span className="text-red-500 mt-1">•</span>
                        <span>User yang sudah terdaftar dengan fakultas ini <strong>tidak akan terpengaruh</strong> secara langsung, tapi data mereka akan merujuk ke fakultas yang sudah dihapus.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-red-500 mt-1">•</span>
                        <span>Fakultas ini <strong>tidak akan lagi muncul</strong> sebagai opsi di halaman seleksi registrasi user baru.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-red-500 mt-1">•</span>
                        <span>Statistik dan laporan yang berkaitan dengan fakultas ini mungkin <strong>tidak akurat</strong>.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-red-500 mt-1">•</span>
                        <span><strong>Tindakan ini tidak dapat dibatalkan!</strong></span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {(facultyToDelete.studentCount ?? 0) > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-amber-600" />
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      Saat ini ada <strong>{(facultyToDelete.studentCount ?? 0).toLocaleString()}</strong> mahasiswa/user terdaftar di fakultas ini.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteFacultyDialog(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={confirmDeleteFaculty}>
              <Trash2 className="h-4 w-4 mr-2" />
              Hapus Fakultas
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
