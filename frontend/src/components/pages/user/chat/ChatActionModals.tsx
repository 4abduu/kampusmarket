import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Edit, Handshake, Package, Receipt } from 'lucide-react';
import type { ApiChatProduct } from '@/components/pages/user/chat/chat.types';

export interface SellerProduct {
  id: string;
  title: string;
  price: number;
  image?: string;
  canNego: boolean;
  stock: number; // FIX: tambah field stock
}

interface Props {
  showNegoModal: boolean;
  setShowNegoModal: (v: boolean) => void;
  chatProduct: ApiChatProduct | null;

  showOfferModal: boolean;
  setShowOfferModal: (v: boolean) => void;
  sellerProducts: SellerProduct[];
  selectedOfferProduct: SellerProduct | null;
  setSelectedOfferProduct: (p: SellerProduct) => void;

  negoPrice: string;
  setNegoPrice: (v: string) => void;
  offerPrice: string;
  setOfferPrice: (v: string) => void;

  formatPrice: (price: number) => string;
  formatPriceInput: (v: string) => string;

  handleSubmitNego: () => void;
  handleSubmitOffer: () => void;
  isSubmitting: boolean;

  isSeller: boolean;                  // FIX #4 & #5
  onNavigateToDashboard: () => void;  // FIX #3: tombol edit stok → my-products
}

export default function ChatActionModals({
  showNegoModal, setShowNegoModal, chatProduct,
  showOfferModal, setShowOfferModal, sellerProducts, selectedOfferProduct, setSelectedOfferProduct,
  negoPrice, setNegoPrice, offerPrice, setOfferPrice,
  formatPrice, formatPriceInput,
  handleSubmitNego, handleSubmitOffer, isSubmitting,
  isSeller, onNavigateToDashboard,
}: Props) {
  return (
    <>
      {/* ── Modal Ajukan Nego (Buyer) ── */}
      <Dialog open={showNegoModal} onOpenChange={setShowNegoModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Handshake className="h-5 w-5 text-amber-600" />
              Ajukan Nego
            </DialogTitle>
            <DialogDescription>Ajukan harga penawaran ke penjual</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* FIX #2: Produk langsung terpilih dari konteks chat */}
            {chatProduct?.canNego ? (
              <div className="flex items-center gap-3 p-3 rounded-lg border border-primary-600 bg-primary-50 dark:bg-primary-900/20">
                <div className="w-11 h-11 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center shrink-0">
                  {chatProduct.image
                    ? <img src={chatProduct.image} alt={chatProduct.title} className="w-full h-full object-cover rounded-lg" />
                    : <Package className="h-5 w-5 text-muted-foreground/50" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{chatProduct.title}</p>
                  <p className="text-xs text-primary-600">{formatPrice(chatProduct.price)}</p>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm text-muted-foreground text-center">
                Produk ini tidak tersedia untuk nego.
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">Harga Penawaran Anda</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">Rp</span>
                <Input
                  placeholder="0"
                  value={negoPrice}
                  onChange={e => setNegoPrice(formatPriceInput(e.target.value))}
                  className="pl-10"
                  disabled={!chatProduct?.canNego}
                />
              </div>
              {chatProduct?.canNego && negoPrice && (
                <p className="text-xs text-muted-foreground mt-1">Harga asli: {formatPrice(chatProduct.price)}</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowNegoModal(false)}>Batal</Button>
              <Button
                className="flex-1 bg-primary-600 hover:bg-primary-700"
                onClick={handleSubmitNego}
                disabled={!chatProduct?.canNego || !negoPrice || isSubmitting}
              >
                {isSubmitting ? 'Mengirim...' : 'Kirim Penawaran'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Modal Penawaran Khusus (Seller) ── */}
      <Dialog open={showOfferModal} onOpenChange={setShowOfferModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary-600" />
              {/* FIX #5: Label beda seller vs buyer */}
              {isSeller ? 'Buat Penawaran Khusus' : 'Ajukan Penawaran'}
            </DialogTitle>
            <DialogDescription>
              {isSeller
                ? 'Pilih produk dan tentukan harga khusus untuk pembeli ini.'
                : 'Pilih produk dan ajukan harga tawaran ke penjual.'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div>
              <label className="text-sm font-medium mb-2 block">Pilih Produk</label>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {sellerProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2 text-center">Belum ada produk barang.</p>
                ) : (
                  sellerProducts.map(product => {
                    const outOfStock = product.stock <= 0;
                    const isSelected = selectedOfferProduct?.id === product.id;
                    return (
                      <div
                        key={product.id}
                        onClick={() => !outOfStock && setSelectedOfferProduct(product)}
                        className={[
                          'relative flex items-center gap-3 p-2 rounded-lg border transition-colors',
                          outOfStock
                            ? 'opacity-60 cursor-not-allowed bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                            : isSelected
                              ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 cursor-pointer'
                              : 'hover:border-slate-300 dark:hover:border-slate-600 cursor-pointer',
                        ].join(' ')}
                      >
                        {/* Gambar + overlay stok habis */}
                        <div className="relative w-10 h-10 shrink-0">
                          <div className="w-full h-full bg-slate-100 dark:bg-slate-700 rounded flex items-center justify-center">
                            {product.image
                              ? <img src={product.image} alt={product.title} className="w-full h-full object-cover rounded" />
                              : <Package className="h-5 w-5 text-muted-foreground/50" />
                            }
                          </div>
                          {/* FIX #2 & #3: overlay stok habis */}
                          {outOfStock && (
                            <div className="absolute inset-0 bg-black/55 rounded flex items-center justify-center">
                              <span className="text-[8px] text-white font-bold text-center leading-tight">Stok{'\n'}Habis</span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{product.title}</p>
                          <p className="text-xs text-primary-600">{formatPrice(product.price)}</p>
                          {outOfStock && <p className="text-xs text-red-500 font-medium">Stok habis</p>}
                        </div>

                        {/* FIX #3: Tombol edit stok — hanya seller */}
                        {isSeller && outOfStock && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-primary-600 shrink-0 hover:bg-primary-50"
                            onClick={e => {
                              e.stopPropagation();
                              setShowOfferModal(false);
                              onNavigateToDashboard();
                            }}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Harga Penawaran</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">Rp</span>
                <Input
                  placeholder="0"
                  value={offerPrice}
                  onChange={e => setOfferPrice(formatPriceInput(e.target.value))}
                  className="pl-10"
                />
              </div>
              {selectedOfferProduct && (
                <p className="text-xs text-muted-foreground mt-1">Harga normal: {formatPrice(selectedOfferProduct.price)}</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowOfferModal(false)}>Batal</Button>
              <Button
                className="flex-1 bg-primary-600 hover:bg-primary-700"
                onClick={handleSubmitOffer}
                disabled={!selectedOfferProduct || selectedOfferProduct.stock <= 0 || !offerPrice || isSubmitting}
              >
                {isSubmitting ? 'Mengirim...' : 'Kirim Penawaran'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
