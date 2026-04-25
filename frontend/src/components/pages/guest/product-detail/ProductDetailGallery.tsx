import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductImage from "@/components/common/ProductImage";

interface ProductDetailGalleryProps {
  images: string[];
  condition?: string;
  price: number;
  originalPrice?: number;
  selectedImage: number;
  setSelectedImage: (value: number) => void;
}

export default function ProductDetailGallery({
  images,
  condition,
  price,
  originalPrice,
  selectedImage,
  setSelectedImage,
}: ProductDetailGalleryProps) {
  const currentImage = images?.[selectedImage];

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="relative bg-slate-100 dark:bg-slate-800 h-96 flex items-center justify-center overflow-hidden">
          <ProductImage
            src={currentImage}
            alt={`Gambar produk ${selectedImage + 1}`}
            className="w-full h-full"
            imageClassName="w-full h-full object-cover"
            showError={true}
          />

          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                onClick={() => setSelectedImage(Math.max(0, selectedImage - 1))}
                disabled={selectedImage === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                onClick={() =>
                  setSelectedImage(
                    Math.min(images.length - 1, selectedImage + 1),
                  )
                }
                disabled={selectedImage === images.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Badges */}
          {condition === "baru" ? (
            <Badge className="absolute top-4 left-4 bg-primary-500">Baru</Badge>
          ) : (
            <Badge className="absolute top-4 left-4" variant="secondary">
              Bekas
            </Badge>
          )}

          {originalPrice && (
            <Badge className="absolute top-4 right-4 bg-red-500">
              -{Math.round((1 - price / originalPrice) * 100)}%
            </Badge>
          )}
        </div>
      </Card>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              aria-label={`Pilih gambar ${index + 1}`}
              title={`Pilih gambar ${index + 1}`}
              className={`shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden transition-colors ${
                selectedImage === index
                  ? "border-primary-600"
                  : "border-transparent hover:border-slate-300"
              }`}
            >
              <ProductImage
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full bg-slate-100 dark:bg-slate-800"
                imageClassName="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
