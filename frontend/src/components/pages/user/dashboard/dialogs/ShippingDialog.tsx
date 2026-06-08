import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Truck } from "lucide-react"
import { mockAddresses, mockOrders } from "@/lib/mock-data"

interface Props {
  showShippingDialog: boolean
  setShowShippingDialog: (open: boolean) => void
  shippingFee: string
  setShippingFee: (fee: string) => void
  handleSetShippingFee: () => void
}

export function ShippingDialog({
  showShippingDialog,
  setShowShippingDialog,
  shippingFee,
  setShippingFee,
  handleSetShippingFee
}: Props) {
  return (
    <Dialog open={showShippingDialog} onOpenChange={setShowShippingDialog}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Truck className="h-5 w-5 text-amber-600" />Input Ongkos Kirim</DialogTitle>
          <DialogDescription>Masukkan ongkos kirim untuk pesanan ini</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 rounded-lg border bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-10 w-10"><AvatarFallback className="bg-primary-100 text-primary-700">{mockOrders[0]?.buyer?.name?.split(" ").map((n: string) => n[0]).join("") || "B"}</AvatarFallback></Avatar>
              <div><p className="font-medium">{mockOrders[0]?.buyer?.name || "Nama Pembeli"}</p><p className="text-sm text-muted-foreground">Pembeli</p></div>
            </div>
            <div className="flex items-start gap-2 text-sm"><MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" /><div><p className="font-medium">Alamat Pengiriman:</p><p className="text-muted-foreground">{mockOrders[0]?.shippingAddress || mockAddresses[0]?.address || "Jl. Kampus No. 123, Limau Manis, Kec. Pauh, Kota Padang, Sumatera Barat 25176"}</p></div></div>
          </div>
          <div>
            <Label htmlFor="shipping-fee">Ongkos Kirim (Rp) *</Label>
            <Input id="shipping-fee" type="number" value={shippingFee} onChange={(e) => setShippingFee(e.target.value)} placeholder="Contoh: 15000" className="mt-1" />
            <p className="text-xs text-muted-foreground mt-1">Masukkan ongkir berdasarkan jarak ke alamat pembeli</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowShippingDialog(false)}>Batal</Button>
          <Button className="bg-primary-600 hover:bg-primary-700" onClick={handleSetShippingFee} disabled={!shippingFee}>Kirim ke Pembeli</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
