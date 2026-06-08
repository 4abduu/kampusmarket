import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DollarSign, TriangleAlert } from "lucide-react"

export type ServicePriceForm = {
  price: string
  notes: string
}

interface Props {
  showServicePriceDialog: boolean
  setShowServicePriceDialog: (open: boolean) => void
  selectedServiceOrder: any | null
  servicePriceForm: ServicePriceForm
  setServicePriceForm: (form: ServicePriceForm) => void
  handleSubmitServicePrice: () => void
  formatPrice: (price: number) => string
}

export function ServicePriceDialog({
  showServicePriceDialog,
  setShowServicePriceDialog,
  selectedServiceOrder,
  servicePriceForm,
  setServicePriceForm,
  handleSubmitServicePrice,
  formatPrice
}: Props) {
  return (
    <Dialog open={showServicePriceDialog} onOpenChange={setShowServicePriceDialog}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5 text-amber-600" />Input Harga Jasa</DialogTitle>
          <DialogDescription>Masukkan harga untuk layanan ini berdasarkan kebutuhan pembeli</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {selectedServiceOrder?.notes && (
            <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
              <p className="text-xs text-purple-600 font-medium mb-1">Kebutuhan Pembeli:</p>
              <p className="text-sm text-purple-800 dark:text-purple-200 line-clamp-3">{selectedServiceOrder.notes}</p>
            </div>
          )}
          {selectedServiceOrder?.serviceNotes && (
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 font-medium mb-1">Catatan Tambahan:</p>
              <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-3">{selectedServiceOrder.serviceNotes}</p>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="service-price">Harga Jasa (Rp) *</Label>
            <Input id="service-price" type="number" placeholder="Contoh: 350000" value={servicePriceForm.price} onChange={(e) => setServicePriceForm({ ...servicePriceForm, price: e.target.value })} />
            {(() => {
              const inputPrice = parseInt(servicePriceForm.price, 10) || 0;
              const product = selectedServiceOrder?.product;
              if (!product || !inputPrice) return null;

              const max = product.priceMax || product.price;
              const min = product.priceMin || product.price;
              const isRange = product.priceType === 'range';
              const isStarting = product.priceType === 'starting';
              
              if (isRange && max && inputPrice > max) {
                 return <p className="text-xs text-amber-600 mt-1"><TriangleAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" /> Harga yang Anda masukkan lebih tinggi dari batas maksimal rentang harga ({formatPrice(max)}). Pastikan pembeli setuju.</p>
              }
              if ((isRange || isStarting) && min && inputPrice < min) {
                 return <p className="text-xs text-amber-600 mt-1"><TriangleAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" /> Harga yang Anda masukkan lebih rendah dari batas minimal harga ({formatPrice(min)}).</p>
              }
              if (product.priceType === 'fixed' && inputPrice !== product.price) {
                 return <p className="text-xs text-amber-600 mt-1"><TriangleAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" /> Harga yang Anda masukkan berbeda dari harga tetap yang tertera pada produk ({formatPrice(product.price)}).</p>
              }
              return null;
            })()}
          </div>
          <div className="space-y-2"><Label htmlFor="service-notes">Catatan (Opsional)</Label><Textarea id="service-notes" placeholder="Contoh: Harga sudah termasuk revisi 2x" value={servicePriceForm.notes} onChange={(e) => setServicePriceForm({ ...servicePriceForm, notes: e.target.value })} rows={2} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowServicePriceDialog(false)}>Batal</Button>
          <Button className="bg-primary-600 hover:bg-primary-700" onClick={handleSubmitServicePrice} disabled={!servicePriceForm.price}>Kirim Penawaran</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
