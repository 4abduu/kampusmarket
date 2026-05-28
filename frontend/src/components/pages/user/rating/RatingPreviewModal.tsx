import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Briefcase, CheckCircle2, Edit3, Eye } from "lucide-react";
import type { Order } from "@/lib/api/orders";
import ProductImage from "@/components/common/ProductImage";
import RatingStarPicker from "@/components/pages/user/rating/RatingStarPicker";

interface RatingPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  selectedOrder: Order | null;
  rating: number;
  comment: string;
  images: string[];
  formatPrice: (price: number) => string;
  isLoading?: boolean;
}

export default function RatingPreviewModal({
  isOpen,
  onClose,
  onSubmit,
  selectedOrder,
  rating,
  comment,
  images,
  formatPrice,
  isLoading = false,
}: RatingPreviewModalProps) {
  if (!isOpen || !selectedOrder) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4 overflow-hidden">
      <Card className="w-full max-w-lg flex flex-col relative z-[9999] max-h-[90vh] shadow-2xl bg-white dark:bg-slate-950 p-0 gap-0 overflow-hidden">
        <CardHeader className="border-b shrink-0 p-6">
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Preview Ulasan
          </CardTitle>
          <CardDescription>Periksa ulasan kamu sebelum mengirim</CardDescription>
        </CardHeader>
        
        <div className="overflow-y-auto flex-1 min-h-0">
          <CardContent className="p-6 space-y-6">
            <div className="flex gap-4">
              <div className={`w-16 h-16 rounded-lg flex items-center justify-center shrink-0 overflow-hidden ${selectedOrder.productType === "jasa" ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-slate-100 dark:bg-slate-800"}`}>
                {selectedOrder.productType === "jasa" ? (
                  <Briefcase className="h-8 w-8 text-emerald-600/70" />
                ) : (
                  <ProductImage
                    src={selectedOrder.product?.images?.[0]}
                    alt={selectedOrder.productTitle}
                    className="w-full h-full"
                    imageClassName="w-full h-full object-cover"
                  />
                )}
              </div>
              <div>
                <p className="font-medium">{selectedOrder.productTitle}</p>
                <p className="text-sm text-muted-foreground">{formatPrice(selectedOrder.finalPrice)}</p>
                <p className="text-sm text-muted-foreground">dari {selectedOrder.seller.name}</p>
              </div>
            </div>

            <Separator />

            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Rating</p>
              <div className="flex justify-center">
                <RatingStarPicker value={rating} size="lg" readOnly />
              </div>
              <p className="font-medium mt-2">{rating}/5</p>
            </div>

            <Separator />

            {comment && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Ulasan</p>
                  <p className="text-sm bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">{comment}</p>
                </div>
                <Separator />
              </>
            )}

            {images.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Foto ({images.length})</p>
                <div className="grid grid-cols-3 gap-2">
                  {images.map((img, index) => (
                    <div
                      key={index}
                      className="aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800"
                    >
                      <img src={img} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </div>
        
        <div className="border-t p-4 flex gap-3 shrink-0 bg-white dark:bg-slate-950">
          <Button variant="outline" className="flex-1 cursor-pointer" onClick={onClose}>
            <Edit3 className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button className="flex-1 bg-primary-600 hover:bg-primary-700 cursor-pointer" onClick={onSubmit} disabled={isLoading}>
            {isLoading ? (
              <>Mengirim...</>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Kirim Ulasan
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
