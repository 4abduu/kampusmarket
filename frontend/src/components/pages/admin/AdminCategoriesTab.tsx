import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";

interface Props {
  filteredCategories: any[];
  categorySearchTerm: string;
  setCategorySearchTerm: (value: string) => void;
  categoryTypeFilter: string;
  setCategoryTypeFilter: (value: any) => void;
  handleAddCategory: () => void;
  handleEditCategory: (category: any) => void;
  handleDeleteCategory: (category: any) => void;
}

export default function AdminCategoriesTab({
  filteredCategories,
  categorySearchTerm,
  setCategorySearchTerm,
  categoryTypeFilter,
  setCategoryTypeFilter,
  handleAddCategory,
  handleEditCategory,
  handleDeleteCategory,
}: Props) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Manajemen Kategori</CardTitle>
              <CardDescription>Kelola kategori untuk barang dan jasa</CardDescription>
            </div>
            <Button onClick={handleAddCategory} className="gap-2"><Plus className="h-4 w-4" />Tambah Kategori</Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Cari kategori..." value={categorySearchTerm} onChange={(e) => setCategorySearchTerm(e.target.value)} className="pl-9" />
            </div>
            <Select value={categoryTypeFilter} onValueChange={(value) => setCategoryTypeFilter(value)}>
              <SelectTrigger className="w-[120px]"><SelectValue placeholder="Tipe" /></SelectTrigger>
              <SelectContent><SelectItem value="all">Semua</SelectItem><SelectItem value="barang">Barang</SelectItem><SelectItem value="jasa">Jasa</SelectItem></SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>Nama Kategori</TableHead><TableHead>Tipe</TableHead><TableHead>Deskripsi</TableHead><TableHead>Urutan</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
          <TableBody>
            {filteredCategories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell><Badge variant={category.type === "jasa" ? "secondary" : "outline"} className={category.type === "jasa" ? "bg-purple-50 text-purple-700 border-purple-200" : ""}>{category.type === "jasa" ? "Jasa" : "Barang"}</Badge></TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{category.description || "-"}</TableCell>
                <TableCell className="text-sm">{category.sortOrder}</TableCell>
                <TableCell><Badge variant={category.isActive ? "default" : "secondary"} className={category.isActive ? "bg-primary-500" : ""}>{category.isActive ? "Aktif" : "Nonaktif"}</Badge></TableCell>
                <TableCell className="text-right"><div className="flex items-center justify-end gap-1"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditCategory(category)}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDeleteCategory(category)}><Trash2 className="h-4 w-4" /></Button></div></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
