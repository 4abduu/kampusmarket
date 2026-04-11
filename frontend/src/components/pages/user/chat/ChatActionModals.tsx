import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Handshake, Package, Receipt } from "lucide-react"
import type { Product } from "@/lib/mock-data"

interface Props {
  showNegoModal: boolean
  setShowNegoModal: (open: boolean) => void
  showOfferModal: boolean
  setShowOfferModal: (open: boolean) => void
  selectedProduct: Product | null
  setSelectedProduct: (product: Product) => void
  products: Product[]
  negoPrice: string
  setNegoPrice: (value: string) => void
  offerPrice: string
  setOfferPrice: (value: string) => void
  formatPrice: (price: number) => string
  formatPriceInput: (value: string) => string
  handleSubmitNego: () => void
  handleSubmitOffer: () => void
}

export default function ChatActionModals({
  showNegoModal,
  setShowNegoModal,
  showOfferModal,
  setShowOfferModal,
  selectedProduct,
  setSelectedProduct,
  products,
  negoPrice,
  setNegoPrice,
  offerPrice,
  setOfferPrice,
  formatPrice,
  formatPriceInput,
  handleSubmitNego,
  handleSubmitOffer,
}: Props) {
  const topProducts = products.slice(0, 3)

  return (
    <>
      <Dialog open={showNegoModal} onOpenChange={setShowNegoModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Handshake className="h-5 w-5 text-amber-600" />
              Ajukan Nego
            </DialogTitle>
            <DialogDescription>Ajukan penawaran harga ke penjual</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Pilih Produk</label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {topProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-colors ${
                      selectedProduct?.id === product.id
                        ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20"
                        : "hover:border-slate-300"
                    }`}
                  >
                    <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center">
                      <Package className="h-5 w-5 text-muted-foreground/50" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.title}</p>
                      <p className="text-xs text-primary-600">{formatPrice(product.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Harga Penawaran</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Rp</span>
                <Input
                  placeholder="0"
                  value={negoPrice}
                  onChange={(e) => setNegoPrice(formatPriceInput(e.target.value))}
                  className="pl-10"
                />
              </div>
              {selectedProduct && <p className="text-xs text-muted-foreground mt-1">Harga asli: {formatPrice(selectedProduct.price)}</p>}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowNegoModal(false)}>Batal</Button>
              <Button className="flex-1 bg-primary-600 hover:bg-primary-700" onClick={handleSubmitNego} disabled={!selectedProduct || !negoPrice}>
                Kirim Penawaran
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showOfferModal} onOpenChange={setShowOfferModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary-600" />
              Buat Penawaran Khusus
            </DialogTitle>
            <DialogDescription>Buat invoice/penawaran khusus untuk pembeli</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Pilih Produk</label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {topProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-colors ${
                      selectedProduct?.id === product.id
                        ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20"
                        : "hover:border-slate-300"
                    }`}
                  >
                    <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center">
                      <Package className="h-5 w-5 text-muted-foreground/50" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.title}</p>
                      <p className="text-xs text-primary-600">{formatPrice(product.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Harga Penawaran</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Rp</span>
                <Input
                  placeholder="0"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(formatPriceInput(e.target.value))}
                  className="pl-10"
                />
              </div>
              {selectedProduct && <p className="text-xs text-muted-foreground mt-1">Harga normal: {formatPrice(selectedProduct.price)}</p>}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowOfferModal(false)}>Batal</Button>
              <Button className="flex-1 bg-primary-600 hover:bg-primary-700" onClick={handleSubmitOffer} disabled={!selectedProduct || !offerPrice}>
                Kirim Penawaran
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
