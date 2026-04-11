import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Image as ImageIcon, Plus, X } from "lucide-react";

interface AddProductImagesSectionProps {
  productType: "barang" | "jasa";
  images: string[];
  setImages: (value: string[]) => void;
}

export default function AddProductImagesSection({ productType, images, setImages }: AddProductImagesSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Foto {productType === "barang" ? "Produk" : "Portofolio"}</CardTitle>
        <CardDescription>Upload hingga 5 foto. Foto pertama akan menjadi foto utama.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
          {images.map((_, index) => (
            <div
              key={index}
              className="aspect-square rounded-lg bg-slate-100 dark:bg-slate-800 relative group overflow-hidden"
            >
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
              </div>
              <button
                type="button"
                onClick={() => setImages(images.filter((__, i) => i !== index))}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                aria-label="Hapus gambar"
              >
                <X className="h-4 w-4" />
              </button>
              {index === 0 && <Badge className="absolute bottom-1 left-1 text-xs">Utama</Badge>}
            </div>
          ))}
          {images.length < 5 && (
            <label className="aspect-square rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
              <Plus className="h-6 w-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground mt-1">Upload</span>
              <input type="file" accept="image/*" className="hidden" />
            </label>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
