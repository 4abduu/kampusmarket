import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { MapPin } from "lucide-react"
import type { Address, NewAddressForm } from "@/components/pages/user/checkout/checkout.types"

interface CheckoutAddressDialogsProps {
  showAddressModal: boolean
  setShowAddressModal: (open: boolean) => void
  showSaveAddressDialog: boolean
  setShowSaveAddressDialog: (open: boolean) => void
  editingAddress: Address | null
  newAddress: NewAddressForm
  setNewAddress: (address: NewAddressForm) => void
  handleSaveAddress: () => void
}

export default function CheckoutAddressDialogs({
  showAddressModal,
  setShowAddressModal,
  showSaveAddressDialog,
  setShowSaveAddressDialog,
  editingAddress,
  newAddress,
  setNewAddress,
  handleSaveAddress,
}: CheckoutAddressDialogsProps) {
  return (
    <>
      <Dialog open={showAddressModal} onOpenChange={setShowAddressModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {editingAddress ? "Edit Alamat" : "Tambah Alamat Baru"}
            </DialogTitle>
            <DialogDescription>
              {editingAddress
                ? "Perbarui informasi alamat pengiriman"
                : "Masukkan detail alamat pengiriman baru"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="label">Label Alamat *</Label>
                <Input
                  id="label"
                  placeholder="Contoh: Kos, Rumah, Kampus"
                  value={newAddress.label}
                  onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">No. HP (WhatsApp)</Label>
                <Input
                  id="phone"
                  placeholder="08xxxxxxxxxx"
                  value={newAddress.phone}
                  onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipient">Nama Penerima *</Label>
              <Input
                id="recipient"
                placeholder="Nama lengkap penerima"
                value={newAddress.recipient}
                onChange={(e) => setNewAddress({ ...newAddress, recipient: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Alamat Lengkap *</Label>
              <Textarea
                id="address"
                placeholder="Jl. Nama Jalan No. 123, RT/RW, Kelurahan, Kecamatan, Kota, Kode Pos"
                value={newAddress.address}
                onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Catatan (Opsional)</Label>
              <Input
                id="notes"
                placeholder="Patokan, warna rumah, dll"
                value={newAddress.notes}
                onChange={(e) => setNewAddress({ ...newAddress, notes: e.target.value })}
              />
            </div>

            {!editingAddress && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newAddress.saveToProfile}
                  onChange={(e) => setNewAddress({ ...newAddress, saveToProfile: e.target.checked })}
                  className="rounded border-slate-300"
                />
                <span className="text-sm">Simpan ke daftar alamat saya</span>
              </label>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddressModal(false)}>
              Batal
            </Button>
            <Button
              className="bg-primary-600 hover:bg-primary-700"
              onClick={handleSaveAddress}
              disabled={!newAddress.label || !newAddress.recipient || !newAddress.address}
            >
              {editingAddress ? "Simpan Perubahan" : "Tambah Alamat"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSaveAddressDialog} onOpenChange={setShowSaveAddressDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Simpan Alamat?
            </DialogTitle>
            <DialogDescription>
              Apakah kamu ingin menyimpan alamat ini ke daftar alamat untuk penggunaan selanjutnya?
            </DialogDescription>
          </DialogHeader>

          {newAddress.address && (
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-sm">
              <p className="font-medium">{newAddress.label || "Alamat Baru"}</p>
              <p className="text-muted-foreground">{newAddress.recipient}</p>
              <p className="text-muted-foreground line-clamp-2">{newAddress.address}</p>
            </div>
          )}

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => {
                setShowSaveAddressDialog(false)
              }}
            >
              Tidak, Teruskan Tanpa Menyimpan
            </Button>
            <Button
              className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700"
              onClick={() => {
                handleSaveAddress()
              }}
            >
              Ya, Simpan Alamat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
