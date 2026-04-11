import { X } from "lucide-react";

interface RatingImagePreviewProps {
  images: string[];
  onRemove: (index: number) => void;
}

export default function RatingImagePreview({ images, onRemove }: RatingImagePreviewProps) {
  if (images.length === 0) return null;

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
      {images.map((img, index) => (
        <div
          key={index}
          className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 group"
        >
          <img src={img} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onRemove(index)}
            title={`Hapus gambar ${index + 1}`}
            aria-label={`Hapus gambar ${index + 1}`}
            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
