import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AddProductFormData, ProductType } from "@/components/pages/user/add-product/types";

interface CategoryOption {
  id: string;
  label: string;
}

interface AddProductBasicInfoSectionProps {
  productType: ProductType;
  formData: AddProductFormData;
  setFormData: (value: AddProductFormData) => void;
  currentCategories: CategoryOption[];
}

export default function AddProductBasicInfoSection({
  productType,
  formData,
  setFormData,
  currentCategories,
}: AddProductBasicInfoSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Informasi Dasar</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Judul {productType === "barang" ? "Produk" : "Jasa"}</Label>
          <Input
            id="title"
            placeholder={
              productType === "barang"
                ? "Contoh: Kalkulator Scientific Casio FX-991EX"
                : "Contoh: Jasa Desain Grafis untuk Logo"
            }
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Deskripsi</Label>
          <Textarea
            id="description"
            placeholder={
              productType === "barang"
                ? "Jelaskan kondisi, fitur, atau detail lainnya..."
                : "Jelaskan layanan yang ditawarkan, pengalaman, portofolio, dll..."
            }
            rows={5}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Kategori</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {currentCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {productType === "barang" && (
            <div className="space-y-2">
              <Label htmlFor="condition">Kondisi</Label>
              <Select
                value={formData.condition}
                onValueChange={(value: "bekas" | "baru") => setFormData({ ...formData, condition: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baru">Baru</SelectItem>
                  <SelectItem value="bekas">Bekas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
