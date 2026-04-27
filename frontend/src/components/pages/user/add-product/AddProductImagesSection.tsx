import { useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, GripVertical, ImageIcon, Loader2, Plus, Star, X } from 'lucide-react';
import { uploadImage, validateImageFile } from '@/lib/api/images';

interface AddProductImagesSectionProps {
  productType: 'barang' | 'jasa';
  images: string[];          // array URL yang sudah diupload
  setImages: (value: string[]) => void;
}

const MAX_IMAGES = 5;

export default function AddProductImagesSection({
  productType,
  images,
  setImages,
}: AddProductImagesSectionProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    // Reset input agar bisa upload file yang sama lagi
    if (inputRef.current) inputRef.current.value = '';

    // Validasi setiap file
    const newErrors: string[] = [];
    const validFiles: File[] = [];

    for (const file of files) {
      const err = validateImageFile(file);
      if (err) {
        newErrors.push(`${file.name}: ${err}`);
      } else if (images.length + validFiles.length >= MAX_IMAGES) {
        newErrors.push(`Maksimal ${MAX_IMAGES} gambar`);
        break;
      } else {
        validFiles.push(file);
      }
    }

    setErrors(newErrors);
    if (!validFiles.length) return;

    setUploading(true);
    setUploadProgress(0);

    const uploaded: string[] = [];
    for (let i = 0; i < validFiles.length; i++) {
      try {
        const result = await uploadImage(validFiles[i]);
        uploaded.push(result.url);
        setUploadProgress(Math.round(((i + 1) / validFiles.length) * 100));
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Gagal upload';
        setErrors(prev => [...prev, `${validFiles[i].name}: ${msg}`]);
      }
    }

    setImages([...images, ...uploaded]);
    setUploading(false);
    setUploadProgress(0);
  };

  const handleRemove = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    const reordered = [...images];
    const [picked] = reordered.splice(index, 1);
    reordered.unshift(picked);
    setImages(reordered);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Foto {productType === 'barang' ? 'Produk' : 'Portofolio'}
        </CardTitle>
        <CardDescription>
          Upload hingga {MAX_IMAGES} foto · Maks 2MB per foto · JPEG, PNG, WebP, GIF
          <br />
          Foto pertama jadi foto utama. Klik bintang untuk jadikan foto utama.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Grid gambar */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {images.map((url, index) => (
            <div
              key={url + index}
              className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 group border-2 border-transparent hover:border-primary-500 transition-all"
            >
              {/* Gambar — object-cover supaya tidak gepeng meski rasio beda */}
              <img
                src={url}
                alt={`Foto ${index + 1}`}
                className="w-full h-full object-cover"
                draggable={false}
              />

              {/* Overlay aksi — muncul saat hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                {/* Jadikan utama */}
                {index !== 0 && (
                  <button
                    type="button"
                    title="Jadikan foto utama"
                    onClick={() => handleSetPrimary(index)}
                    className="w-7 h-7 rounded-full bg-yellow-400 hover:bg-yellow-300 flex items-center justify-center transition-colors"
                  >
                    <Star className="h-3.5 w-3.5 text-yellow-900" />
                  </button>
                )}
                {/* Hapus */}
                <button
                  type="button"
                  title="Hapus foto"
                  onClick={() => handleRemove(index)}
                  className="w-7 h-7 rounded-full bg-red-500 hover:bg-red-400 flex items-center justify-center transition-colors"
                >
                  <X className="h-3.5 w-3.5 text-white" />
                </button>
              </div>

              {/* Badge utama */}
              {index === 0 && (
                <Badge className="absolute bottom-1 left-1 text-[10px] py-0 px-1.5 bg-primary-600">
                  Utama
                </Badge>
              )}

              {/* Nomor urut */}
              <span className="absolute top-1 left-1 w-5 h-5 rounded-full bg-black/50 text-white text-[10px] flex items-center justify-center font-medium">
                {index + 1}
              </span>
            </div>
          ))}

          {/* Tombol tambah — hanya tampil jika belum penuh */}
          {images.length < MAX_IMAGES && (
            <label
              className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer
                ${uploading
                  ? 'border-slate-300 dark:border-slate-700 cursor-not-allowed opacity-60'
                  : 'border-slate-300 dark:border-slate-700 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                }`}
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-1">
                  <Loader2 className="h-6 w-6 text-primary-600 animate-spin" />
                  <span className="text-xs text-muted-foreground">{uploadProgress}%</span>
                </div>
              ) : (
                <>
                  <Plus className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground mt-1">Tambah</span>
                  <span className="text-[10px] text-muted-foreground/60">
                    {images.length}/{MAX_IMAGES}
                  </span>
                </>
              )}
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                multiple
                className="hidden"
                onChange={handleFileSelect}
                disabled={uploading}
                aria-label="Upload foto produk"
              />
            </label>
          )}
        </div>

        {/* Progress bar saat upload */}
        {uploading && (
          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-600 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}

        {/* Error messages */}
        {errors.length > 0 && (
          <div className="space-y-1">
            {errors.map((err, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span>{err}</span>
              </div>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs h-6 px-2"
              onClick={() => setErrors([])}
            >
              Tutup
            </Button>
          </div>
        )}

        {/* Info tambahan */}
        {images.length === 0 && !uploading && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-800/40">
            <ImageIcon className="h-4 w-4 text-amber-600 shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Produk dengan foto terjual lebih cepat. Upload minimal 1 foto.
            </p>
          </div>
        )}

        {/* Info cara mengatur urutan */}
        {images.length > 1 && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <GripVertical className="h-3 w-3" />
            Hover foto lalu klik ⭐ untuk jadikan foto utama
          </p>
        )}
      </CardContent>
    </Card>
  );
}
