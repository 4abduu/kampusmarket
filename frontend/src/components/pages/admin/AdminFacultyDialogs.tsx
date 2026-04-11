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
import { GraduationCap, Trash2 } from "lucide-react";

import type { Faculty } from "./admin-dashboard.shared";

type FacultyFormState = {
  name: string;
  code: string;
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
  facultyAccentClass,
  getInitials,
}: AdminFacultyDialogsProps) {
  return (
    <>
      <Dialog open={showFacultyDialog} onOpenChange={setShowFacultyDialog}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              {selectedFaculty ? "Edit Fakultas" : "Tambah Fakultas Baru"}
            </DialogTitle>
            <DialogDescription>
              {selectedFaculty
                ? "Perbarui data fakultas sesuai struktur backend Faculty"
                : "Isi data fakultas baru untuk dipakai di profil dan pendaftaran user"}
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
                placeholder="Contoh: Fakultas Teknik"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Kode Fakultas <span className="text-red-500">*</span>
                </label>
                <Input
                  value={facultyForm.code}
                  onChange={(e) => setFacultyForm({ ...facultyForm, code: e.target.value })}
                  placeholder="Contoh: ft"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Urutan Tampil</label>
                <Input
                  type="number"
                  min="0"
                  value={facultyForm.sortOrder}
                  onChange={(e) =>
                    setFacultyForm({ ...facultyForm, sortOrder: Number(e.target.value) })
                  }
                />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Status Aktif</p>
                <p className="text-xs text-muted-foreground">
                  Fakultas aktif akan tampil di dropdown pendaftaran
                </p>
              </div>
              <Switch
                checked={facultyForm.isActive}
                onCheckedChange={(checked) =>
                  setFacultyForm({ ...facultyForm, isActive: checked })
                }
              />
            </div>
          </div>
          <DialogFooter className="flex-shrink-0">
            <Button variant="outline" onClick={() => setShowFacultyDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleSaveFaculty}>
              {selectedFaculty ? "Simpan Perubahan" : "Tambah Fakultas"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteFacultyDialog} onOpenChange={setShowDeleteFacultyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />Hapus Fakultas
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus fakultas ini? Tindakan ini akan menghapus data dari daftar admin.
            </DialogDescription>
          </DialogHeader>
          {facultyToDelete && (
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 flex items-center gap-3">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center text-white ${facultyAccentClass}`}
              >
                <span className="text-lg leading-none">{getInitials(facultyToDelete.name)}</span>
              </div>
              <div>
                <p className="font-medium">{facultyToDelete.name}</p>
                <p className="text-sm text-muted-foreground uppercase">{facultyToDelete.code}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteFacultyDialog(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={confirmDeleteFaculty}>
              <Trash2 className="h-4 w-4 mr-2" />Hapus Fakultas
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
