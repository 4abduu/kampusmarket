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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, Tag, Trash2 } from "lucide-react";
import type { Category } from "@/lib/mock-data";

type CategoryFormState = {
  name: string;
  type: "barang" | "jasa";
  description: string;
  sortOrder: number;
  isActive: boolean;
};

interface CategoryDialogsProps {
  showCategoryDialog: boolean;
  setShowCategoryDialog: (open: boolean) => void;
  selectedCategory: Category | null;
  categoryForm: CategoryFormState;
  setCategoryForm: (value: CategoryFormState) => void;
  handleSaveCategory: () => void;
  categories: Category[];
  showDeleteCategoryDialog: boolean;
  setShowDeleteCategoryDialog: (open: boolean) => void;
  categoryToDelete: Category | null;
  confirmDeleteCategory: () => void;
}

export default function CategoryDialogs({
  showCategoryDialog,
  setShowCategoryDialog,
  selectedCategory,
  categoryForm,
  setCategoryForm,
  handleSaveCategory,
  categories,
  showDeleteCategoryDialog,
  setShowDeleteCategoryDialog,
  categoryToDelete,
  confirmDeleteCategory,
}: CategoryDialogsProps) {
  return (
    <>
      {/* 1. Tambah/Edit Kategori Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              {selectedCategory ? "Edit Kategori" : "Tambah Kategori Baru"}
            </DialogTitle>
            <DialogDescription>
              {selectedCategory ? "Perbarui informasi kategori" : "Isi informasi untuk kategori baru"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 overflow-y-auto flex-1 min-h-0 pr-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Nama Kategori <span className="text-red-500">*</span>
              </label>
              <Input
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="Contoh: Elektronik"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipe</label>
              <Select
                value={categoryForm.type}
                onValueChange={(value: "barang" | "jasa") => {
                  const categoriesOfType = categories.filter((c) => c.type === value);
                  const nextSortOrder =
                    categoriesOfType.length > 0
                      ? Math.max(...categoriesOfType.map((c) => c.sortOrder)) + 1
                      : 1;
                  setCategoryForm({ ...categoryForm, type: value, sortOrder: nextSortOrder });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="barang">Barang</SelectItem>
                  <SelectItem value="jasa">Jasa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Deskripsi</label>
                <span className="text-xs text-muted-foreground">(Opsional)</span>
              </div>
              <textarea
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                placeholder="Contoh: Kategori untuk barang-barang elektronik seperti HP, laptop, kamera, dll"
                className="w-full min-h-[80px] px-3 py-2 text-sm border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-xs text-muted-foreground flex items-start gap-1">
                <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                Deskripsi akan ditampilkan sebagai tooltip saat user hover di kategori.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Urutan Tampil</label>
              <Input
                type="number"
                value={categoryForm.sortOrder}
                onChange={(e) =>
                  setCategoryForm({ ...categoryForm, sortOrder: parseInt(e.target.value) || 0 })
                }
                min={1}
                className="w-24"
              />
              <p className="text-xs text-muted-foreground">
                Semakin kecil angka, semakin awal kategori ditampilkan
              </p>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div>
                <label className="text-sm font-medium">Status Aktif</label>
                <p className="text-xs text-muted-foreground">
                  Kategori nonaktif tidak akan ditampilkan ke user
                </p>
              </div>
              <Switch
                checked={categoryForm.isActive}
                onCheckedChange={(checked) => setCategoryForm({ ...categoryForm, isActive: checked })}
              />
            </div>
          </div>
          <DialogFooter className="flex-shrink-0 border-t pt-4">
            <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleSaveCategory} disabled={!categoryForm.name.trim()}>
              {selectedCategory ? "Simpan Perubahan" : "Tambah Kategori"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2. Hapus Kategori Dialog */}
      <Dialog open={showDeleteCategoryDialog} onOpenChange={setShowDeleteCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Hapus Kategori
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus kategori "{categoryToDelete?.name}"?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-700 dark:text-red-300">Perhatian!</p>
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    Tindakan ini tidak dapat dibatalkan.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteCategoryDialog(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={confirmDeleteCategory}>
              <Trash2 className="h-4 w-4 mr-2" />
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
