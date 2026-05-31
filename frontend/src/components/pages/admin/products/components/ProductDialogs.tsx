import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Package, CalendarDays, MapPin, Trash2 } from "lucide-react";
import ImageGallery from "@/components/common/ImageGallery";
import ImageLightbox from "@/components/common/ImageLightbox";
import type { Product } from "@/lib/mock-data";
import ProductImage from "@/components/common/ProductImage";

interface ProductDialogsProps {
  showProductDetail: boolean;
  setShowProductDetail: (open: boolean) => void;
  selectedProduct: Product | null;
  productDetailLoading: boolean;
  productDetailError: string | null;

  showDeleteProductDialog: boolean;
  setShowDeleteProductDialog: (open: boolean) => void;
  productToDelete: Product | null;
  productDeleteReason: string;
  setProductDeleteReason: (reason: string) => void;
  confirmDeleteProduct: () => void;

  formatProductPrice: (product: Product) => string;
  getInitials: (value?: string | null) => string;
}

export default function ProductDialogs({
  showProductDetail,
  setShowProductDetail,
  selectedProduct,
  productDetailLoading,
  productDetailError,
  showDeleteProductDialog,
  setShowDeleteProductDialog,
  productToDelete,
  productDeleteReason,
  setProductDeleteReason,
  confirmDeleteProduct,
  formatProductPrice,
  getInitials,
}: ProductDialogsProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [selectedProduct]);

  return (
    <>
      {/* 1. Detail Produk Dialog */}
      <Dialog open={showProductDetail} onOpenChange={setShowProductDetail}>
        <DialogContent className="max-w-md w-full max-h-[85vh] overflow-y-auto p-5 md:p-6 transition-all duration-300 ease-in-out scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 scrollbar-track-transparent">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedProduct?.type === "jasa" ? (
                <>
                  <CalendarDays className="h-5 w-5" />
                  Detail Jasa
                </>
              ) : (
                <>
                  <Package className="h-5 w-5" />
                  Detail Produk
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              {productDetailLoading && (
                <p className="text-sm text-muted-foreground">Memuat detail produk...</p>
              )}
              {productDetailError && (
                <p className="text-sm text-red-600">{productDetailError}</p>
              )}
              {selectedProduct.images && selectedProduct.images.length > 0 ? (
                <div className="w-full">
                  <ImageGallery
                    images={selectedProduct.images}
                    imagesDetail={selectedProduct.imagesDetail}
                    selectedImage={selectedImageIndex}
                    setSelectedImage={setSelectedImageIndex}
                    condition={selectedProduct.condition}
                    price={selectedProduct.price}
                    originalPrice={selectedProduct.originalPrice}
                    disableInternalLightbox={true}
                    onImageClick={() => {
                      setShowProductDetail(false);
                      setLightboxOpen(true);
                    }}
                    type={selectedProduct.type}
                  />
                </div>
              ) : (
                <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden w-full">
                  <ProductImage
                    type={selectedProduct.type}
                    className="w-full h-full bg-slate-100 dark:bg-slate-800"
                    imageClassName="w-full h-full object-cover"
                  />
                </div>
              )}
              <div>
                <p className="font-bold text-lg">{selectedProduct.title}</p>
                <p className="text-sm text-muted-foreground mt-1">{selectedProduct.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                  <p className="text-muted-foreground">Harga</p>
                  <p className="font-bold text-primary-600">{formatProductPrice(selectedProduct)}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                  <p className="text-muted-foreground">
                    {selectedProduct.type === "jasa" ? "Tipe" : "Kondisi"}
                  </p>
                  <p className="font-medium">
                    {selectedProduct.type === "jasa"
                      ? "Jasa"
                      : selectedProduct.condition === "baru"
                      ? "Baru"
                      : "Bekas"}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                  <p className="text-muted-foreground">Kategori</p>
                  <p className="font-medium">{selectedProduct.category}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                  <p className="text-muted-foreground">
                    {selectedProduct.type === "jasa" ? "Dipesan" : "Terjual"}
                  </p>
                  <p className="font-medium">{selectedProduct.soldCount} item</p>
                </div>
              </div>
              {selectedProduct.type === "jasa" &&
                selectedProduct.durationMin &&
                selectedProduct.durationUnit && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                    <p className="text-sm text-muted-foreground">Estimasi Durasi</p>
                    <p className="font-medium text-purple-700 dark:text-purple-300">
                      {selectedProduct.durationMin === selectedProduct.durationMax
                        ? `${selectedProduct.durationMin} ${selectedProduct.durationUnit}`
                        : `${selectedProduct.durationMin} - ${selectedProduct.durationMax} ${selectedProduct.durationUnit}`}
                    </p>
                  </div>
                )}
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                <p className="text-sm text-muted-foreground">
                  {selectedProduct.type === "jasa" ? "Penyedia Jasa" : "Penjual"}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Avatar className="h-6 w-6">
                    {selectedProduct.seller?.avatar && (
                      <AvatarImage
                        src={selectedProduct.seller.avatar}
                        alt={selectedProduct.seller.name}
                        className="object-cover"
                      />
                    )}
                    <AvatarFallback className="bg-primary-100 text-primary-700 text-xs">
                      {getInitials(selectedProduct.seller?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-sm">{selectedProduct.seller?.name || "-"}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{selectedProduct.location}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProductDetail(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2. Hapus Produk Dialog */}
      <Dialog open={showDeleteProductDialog} onOpenChange={setShowDeleteProductDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Hapus Produk
            </DialogTitle>
            <DialogDescription>
              Produk akan dihapus dan owner akan menerima notifikasi dengan alasan penghapusan.
            </DialogDescription>
          </DialogHeader>
          {productToDelete && (
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 flex items-center gap-3">
                <div className="w-12 h-12 rounded flex items-center justify-center overflow-hidden shrink-0">
                  <ProductImage
                    src={productToDelete.images?.[0]}
                    alt={productToDelete.title}
                    type={productToDelete.type}
                    className="w-full h-full bg-slate-200 dark:bg-slate-700"
                    imageClassName="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium">{productToDelete.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatProductPrice(productToDelete)}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Alasan Penghapusan</label>
                <textarea
                  value={productDeleteReason}
                  onChange={(e) => setProductDeleteReason(e.target.value)}
                  placeholder="Contoh: Melanggar kebijakan, item tidak sesuai deskripsi, penawaran palsu, dll"
                  className="w-full min-h-[80px] px-3 py-2 text-sm border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-muted-foreground">
                  Alasan ini akan dikirim ke owner produk sebagai notifikasi
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteProductDialog(false);
                setProductDeleteReason("");
              }}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteProduct}
              disabled={!productDeleteReason.trim()}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Hapus Produk
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lightbox */}
      {lightboxOpen && selectedProduct && selectedProduct.images && (
        <ImageLightbox
          src={
            selectedProduct.imagesDetail?.[selectedImageIndex]?.variants?.original ??
            selectedProduct.imagesDetail?.[selectedImageIndex]?.variants?.large ??
            selectedProduct.imagesDetail?.[selectedImageIndex]?.url ??
            selectedProduct.images?.[selectedImageIndex]
          }
          alt={
            selectedProduct.imagesDetail?.[selectedImageIndex]?.alt ??
            `Gambar produk ${selectedImageIndex + 1}`
          }
          onClose={() => {
            setLightboxOpen(false);
            setShowProductDetail(true);
          }}
          onPrev={
            selectedImageIndex > 0
              ? () => setSelectedImageIndex(selectedImageIndex - 1)
              : null
          }
          onNext={
            selectedImageIndex <
            (selectedProduct.imagesDetail?.length ?? selectedProduct.images.length) - 1
              ? () => setSelectedImageIndex(selectedImageIndex + 1)
              : null
          }
          currentIndex={selectedImageIndex}
          totalCount={selectedProduct.imagesDetail?.length ?? selectedProduct.images.length}
        />
      )}
    </>
  );
}
