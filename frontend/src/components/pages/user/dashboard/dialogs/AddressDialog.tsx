import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Check, Loader2 } from "lucide-react"
import type { Address as AddressType } from "@/lib/mock-data"

export type AddressForm = {
  label: string
  recipient: string
  phone: string
  address: string
  notes: string
  isPrimary: boolean
}

interface Props {
  showAddressDialog: boolean
  setShowAddressDialog: (open: boolean) => void
  editingAddress: AddressType | null
  addressForm: AddressForm
  setAddressForm: (form: AddressForm) => void
  handleSaveAddress: () => void
  isSavingAddress?: boolean
}

export function AddressDialog({
  showAddressDialog,
  setShowAddressDialog,
  editingAddress,
  addressForm,
  setAddressForm,
  handleSaveAddress,
  isSavingAddress = false
}: Props) {
  return (
    <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingAddress ? "Edit Alamat" : "Tambah Alamat"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Label Alamat <span className="text-red-500">*</span></Label>
            <Input placeholder="Rumah, Kos, Kantor..." value={addressForm.label} onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Nama Penerima <span className="text-red-500">*</span></Label>
              <Input value={addressForm.recipient} onChange={(e) => setAddressForm({ ...addressForm, recipient: e.target.value })} />
            </div>
            <div>
              <Label>No. HP <span className="text-red-500">*</span></Label>
              <Input value={addressForm.phone} onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value.replace(/\D/g, "") })} />
            </div>
          </div>
          <div>
            <Label>Alamat Lengkap <span className="text-red-500">*</span></Label>
            <Textarea value={addressForm.address} onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })} rows={2} />
          </div>
          <div>
            <Label>Catatan (opsional)</Label>
            <Input value={addressForm.notes} onChange={(e) => setAddressForm({ ...addressForm, notes: e.target.value })} placeholder="Patokan, warna rumah, dll" />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary-600" />
              <span className="font-medium">Jadikan Alamat Utama</span>
            </div>
            <Switch checked={addressForm.isPrimary} onCheckedChange={(checked) => setAddressForm({ ...addressForm, isPrimary: checked })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowAddressDialog(false)} disabled={isSavingAddress}>Batal</Button>
          <Button className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed" onClick={handleSaveAddress} disabled={isSavingAddress || !addressForm.label || !addressForm.recipient || !addressForm.phone || !addressForm.address}>
            {isSavingAddress ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            {isSavingAddress ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
