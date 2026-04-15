import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { mockAddresses, mockOrders, type Address as AddressType, type Product } from "@/lib/mock-data"
import { BANK_OPTIONS, EWALLET_OPTIONS } from "@/components/pages/user/dashboard/constants"
import { AlertCircle, Building, Check, CheckCircle2, Clock3, DollarSign, Eye, EyeOff, Home, MapPin, Monitor, Plus, Smartphone, Truck } from "lucide-react"
import PaymentMethodDialog from "@/components/pages/user/shared/PaymentMethodDialog"

type PasswordValidations = {
  minLength: boolean
  hasNumber: boolean
  hasLowercase: boolean
  hasUppercase: boolean
}

type WithdrawForm = {
  type: "bank" | "ewallet"
  bankType: string
  customBankName: string
  accountNumber: string
  accountName: string
  ewalletType: string
  customEwalletName: string
  amount: string
}

type ServicePriceForm = {
  price: string
  notes: string
}

type AddressForm = {
  label: string
  recipient: string
  phone: string
  address: string
  notes: string
  isPrimary: boolean
}

type PasswordForm = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

type Props = {
  showEditProductDialog: boolean
  setShowEditProductDialog: (open: boolean) => void
  editingProduct: Product | null
  setEditingProduct: (product: Product | null) => void
  handleSaveProduct: () => void
  categories: Array<{ id: string; label: string }>
  serviceCategories: Array<{ id: string; label: string }>

  showDeleteProductDialog: boolean
  setShowDeleteProductDialog: (open: boolean) => void
  userProducts: Product[]
  productToDelete: string | null
  handleDeleteProduct: () => void

  showAddressDialog: boolean
  setShowAddressDialog: (open: boolean) => void
  editingAddress: AddressType | null
  addressForm: AddressForm
  setAddressForm: (form: AddressForm) => void
  handleSaveAddress: () => void

  showDeleteAddressDialog: boolean
  setShowDeleteAddressDialog: (open: boolean) => void
  handleDeleteAddress: () => void

  showPasswordDialog: boolean
  setShowPasswordDialog: (open: boolean) => void
  showCurrentPassword: boolean
  setShowCurrentPassword: (v: boolean) => void
  showNewPassword: boolean
  setShowNewPassword: (v: boolean) => void
  showConfirmPassword: boolean
  setShowConfirmPassword: (v: boolean) => void
  passwordForm: PasswordForm
  setPasswordForm: (form: PasswordForm) => void
  passwordValidations: PasswordValidations
  isPasswordValid: boolean
  passwordError: string
  handleChangePassword: () => void

  showTopUpDialog: boolean
  setShowTopUpDialog: (open: boolean) => void
  quickAmounts: number[]
  topUpAmount: string
  setTopUpAmount: (amount: string) => void
  formatPrice: (price: number) => string
  handleTopUp: () => void

  showWithdrawDialog: boolean
  setShowWithdrawDialog: (open: boolean) => void
  withdrawForm: WithdrawForm
  setWithdrawForm: (form: WithdrawForm) => void
  currentWalletBalance: number
  isBankLainnya: boolean
  isEwalletLainnya: boolean
  statsWalletBalance: number
  handleWithdraw: () => void

  showShippingDialog: boolean
  setShowShippingDialog: (open: boolean) => void
  shippingFee: string
  setShippingFee: (fee: string) => void

  showServicePriceDialog: boolean
  setShowServicePriceDialog: (open: boolean) => void
  selectedServiceOrder: string | null
  servicePriceForm: ServicePriceForm
  setServicePriceForm: (form: ServicePriceForm) => void
  handleSubmitServicePrice: () => void

  showOrderConfirmDialog: boolean
  setShowOrderConfirmDialog: (open: boolean) => void

  showPaymentDialog: boolean
  setShowPaymentDialog: (open: boolean) => void
  paymentRequest: { orderId: string; orderTitle: string; totalPayment: number } | null
  handlePayWithWallet: () => void
  handlePayWithMidtrans: () => void

  showProductSuccess: boolean
  productSuccessMessage: string
  showProfileSuccess: boolean
  showPasswordSuccess: boolean
  showTopUpSuccess: boolean
  showWithdrawSuccess: boolean
}

export default function UserDashboardDialogs({
  showEditProductDialog,
  setShowEditProductDialog,
  editingProduct,
  setEditingProduct,
  handleSaveProduct,
  categories,
  serviceCategories,
  showDeleteProductDialog,
  setShowDeleteProductDialog,
  userProducts,
  productToDelete,
  handleDeleteProduct,
  showAddressDialog,
  setShowAddressDialog,
  editingAddress,
  addressForm,
  setAddressForm,
  handleSaveAddress,
  showDeleteAddressDialog,
  setShowDeleteAddressDialog,
  handleDeleteAddress,
  showPasswordDialog,
  setShowPasswordDialog,
  showCurrentPassword,
  setShowCurrentPassword,
  showNewPassword,
  setShowNewPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  passwordForm,
  setPasswordForm,
  passwordValidations,
  isPasswordValid,
  passwordError,
  handleChangePassword,
  showTopUpDialog,
  setShowTopUpDialog,
  quickAmounts,
  topUpAmount,
  setTopUpAmount,
  formatPrice,
  handleTopUp,
  showWithdrawDialog,
  setShowWithdrawDialog,
  withdrawForm,
  setWithdrawForm,
  currentWalletBalance,
  isBankLainnya,
  isEwalletLainnya,
  statsWalletBalance,
  handleWithdraw,
  showShippingDialog,
  setShowShippingDialog,
  shippingFee,
  setShippingFee,
  showServicePriceDialog,
  setShowServicePriceDialog,
  selectedServiceOrder,
  servicePriceForm,
  setServicePriceForm,
  handleSubmitServicePrice,
  showOrderConfirmDialog,
  setShowOrderConfirmDialog,
  showPaymentDialog,
  setShowPaymentDialog,
  paymentRequest,
  handlePayWithWallet,
  handlePayWithMidtrans,
  showProductSuccess,
  productSuccessMessage,
  showProfileSuccess,
  showPasswordSuccess,
  showTopUpSuccess,
  showWithdrawSuccess,
}: Props) {
  return (
    <>
      <Dialog open={showEditProductDialog} onOpenChange={setShowEditProductDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct?.type === "jasa" ? "Edit Jasa" : "Edit Produk"}</DialogTitle>
            <DialogDescription>Perbarui informasi {editingProduct?.type === "jasa" ? "jasa" : "produk"} kamu</DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <div className="space-y-4">
              <div>
                <Label>Judul</Label>
                <Input value={editingProduct.title} onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {editingProduct.type === "jasa" ? (
                  <>
                    <div>
                      <Label>Harga Min (Rp)</Label>
                      <Input type="number" value={editingProduct.priceMin || ""} onChange={(e) => setEditingProduct({ ...editingProduct, priceMin: parseInt(e.target.value) || 0 })} />
                    </div>
                    <div>
                      <Label>Harga Max (Rp)</Label>
                      <Input type="number" value={editingProduct.priceMax || ""} onChange={(e) => setEditingProduct({ ...editingProduct, priceMax: parseInt(e.target.value) || 0 })} />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Label>Harga (Rp)</Label>
                      <Input type="number" value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: parseInt(e.target.value) || 0 })} />
                    </div>
                    <div>
                      <Label>Stok</Label>
                      <Input type="number" value={editingProduct.stock} onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })} />
                    </div>
                  </>
                )}
              </div>
              {editingProduct.type === "jasa" && (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Durasi Min</Label>
                      <Input type="number" value={editingProduct.durationMin || ""} onChange={(e) => setEditingProduct({ ...editingProduct, durationMin: parseInt(e.target.value) || undefined })} />
                    </div>
                    <div>
                      <Label>Durasi Max</Label>
                      <Input type="number" value={editingProduct.durationMax || ""} onChange={(e) => setEditingProduct({ ...editingProduct, durationMax: parseInt(e.target.value) || undefined })} disabled={editingProduct.durationIsPlus} />
                    </div>
                    <div>
                      <Label>Satuan</Label>
                      <Select value={editingProduct.durationUnit || "hari"} onValueChange={(v) => setEditingProduct({ ...editingProduct, durationUnit: v as "jam" | "hari" | "minggu" | "bulan" })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="jam">Jam</SelectItem>
                          <SelectItem value="hari">Hari</SelectItem>
                          <SelectItem value="minggu">Minggu</SelectItem>
                          <SelectItem value="bulan">Bulan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <Clock3 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Mode "Lebih dari"</span>
                      </div>
                      <p className="text-xs text-muted-foreground ml-6">Contoh: 30 hari+</p>
                    </div>
                    <Switch
                      checked={editingProduct.durationIsPlus || false}
                      onCheckedChange={(checked) => setEditingProduct({ ...editingProduct, durationIsPlus: checked, durationMax: checked ? undefined : editingProduct.durationMax })}
                    />
                  </div>
                  <div>
                    <Label>Status Ketersediaan</Label>
                    <Select value={editingProduct.availabilityStatus || "available"} onValueChange={(v) => setEditingProduct({ ...editingProduct, availabilityStatus: v as "available" | "busy" | "full" })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Tersedia - Siap menerima order</SelectItem>
                        <SelectItem value="busy">Sibuk - Tampil info tapi bisa chat</SelectItem>
                        <SelectItem value="full">Penuh - Tidak bisa order baru</SelectItem>
                      </SelectContent>
                    </Select>
                    {(editingProduct.availabilityStatus === "busy" || editingProduct.availabilityStatus === "full") && (
                      <p className="text-xs text-amber-600 mt-1">
                        {editingProduct.availabilityStatus === "full" ? "Pembeli tidak akan bisa melakukan booking" : "Waktu respon mungkin lebih lambat"}
                      </p>
                    )}
                  </div>
                </>
              )}
              <div>
                <Label>Deskripsi</Label>
                <Textarea value={editingProduct.description} onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })} rows={3} />
              </div>
              <div>
                <Label>Kategori</Label>
                <Select value={editingProduct.category} onValueChange={(v) => setEditingProduct({ ...editingProduct, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(editingProduct.type === "jasa" ? serviceCategories : categories).map(c => <SelectItem key={c.id} value={c.label}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {editingProduct.type === "barang" && (
                <div>
                  <Label>Kondisi</Label>
                  <Select value={editingProduct.condition || "bekas"} onValueChange={(v: "baru" | "bekas") => setEditingProduct({ ...editingProduct, condition: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baru">Baru</SelectItem>
                      <SelectItem value="bekas">Bekas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex items-center justify-between p-3 rounded-lg border bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Bisa Nego</span>
                </div>
                <Switch checked={editingProduct.canNego} onCheckedChange={(checked) => setEditingProduct({ ...editingProduct, canNego: checked })} />
              </div>

              {editingProduct.type === "barang" && (
                <div className="space-y-3">
                  <Label className="text-base">Metode Pengiriman</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${editingProduct.isCod ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" : "border-slate-200 dark:border-slate-700"}`} onClick={() => setEditingProduct({ ...editingProduct, isCod: !editingProduct.isCod })}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">COD</span>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${editingProduct.isCod ? "border-primary-500 bg-primary-500" : "border-slate-300"}`}>{editingProduct.isCod && <Check className="h-3 w-3 text-white" />}</div>
                      </div>
                      <p className="text-xs text-muted-foreground">Bayar saat ketemuan</p>
                    </div>
                    <div className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${editingProduct.isPickup ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" : "border-slate-200 dark:border-slate-700"}`} onClick={() => setEditingProduct({ ...editingProduct, isPickup: !editingProduct.isPickup })}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">Ambil Sendiri</span>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${editingProduct.isPickup ? "border-primary-500 bg-primary-500" : "border-slate-300"}`}>{editingProduct.isPickup && <Check className="h-3 w-3 text-white" />}</div>
                      </div>
                      <p className="text-xs text-muted-foreground">Ambil di lokasi</p>
                    </div>
                    <div className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${editingProduct.isDelivery ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" : "border-slate-200 dark:border-slate-700"}`} onClick={() => setEditingProduct({ ...editingProduct, isDelivery: !editingProduct.isDelivery })}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">Antar</span>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${editingProduct.isDelivery ? "border-primary-500 bg-primary-500" : "border-slate-300"}`}>{editingProduct.isDelivery && <Check className="h-3 w-3 text-white" />}</div>
                      </div>
                      <p className="text-xs text-muted-foreground">Diantar ke alamat</p>
                    </div>
                  </div>
                  {editingProduct.isDelivery && (
                    <div className="grid grid-cols-2 gap-4 p-3 rounded-lg border bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                      <div>
                        <Label className="text-xs">Ongkir Min (Rp)</Label>
                        <Input type="number" value={editingProduct.deliveryFeeMin || ""} onChange={(e) => setEditingProduct({ ...editingProduct, deliveryFeeMin: parseInt(e.target.value) || 0 })} placeholder="5000" className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs">Ongkir Max (Rp)</Label>
                        <Input type="number" value={editingProduct.deliveryFeeMax || ""} onChange={(e) => setEditingProduct({ ...editingProduct, deliveryFeeMax: parseInt(e.target.value) || 0 })} placeholder="20000" className="mt-1" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {editingProduct.type === "jasa" && (
                <div className="space-y-3">
                  <Label className="text-base">Metode Pelayanan</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${editingProduct.isOnline ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" : "border-slate-200 dark:border-slate-700"}`} onClick={() => setEditingProduct({ ...editingProduct, isOnline: !editingProduct.isOnline })}>
                      <div className="flex items-center justify-between mb-2">
                        <Monitor className="h-4 w-4" />
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${editingProduct.isOnline ? "border-primary-500 bg-primary-500" : "border-slate-300"}`}>{editingProduct.isOnline && <Check className="h-3 w-3 text-white" />}</div>
                      </div>
                      <span className="font-medium text-sm">Online</span>
                      <p className="text-xs text-muted-foreground">Via Zoom/Meet</p>
                    </div>
                    <div className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${editingProduct.isOnsite ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" : "border-slate-200 dark:border-slate-700"}`} onClick={() => setEditingProduct({ ...editingProduct, isOnsite: !editingProduct.isOnsite })}>
                      <div className="flex items-center justify-between mb-2">
                        <MapPin className="h-4 w-4" />
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${editingProduct.isOnsite ? "border-primary-500 bg-primary-500" : "border-slate-300"}`}>{editingProduct.isOnsite && <Check className="h-3 w-3 text-white" />}</div>
                      </div>
                      <span className="font-medium text-sm">Onsite</span>
                      <p className="text-xs text-muted-foreground">Datang ke lokasi</p>
                    </div>
                    <div className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${editingProduct.isHomeService ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" : "border-slate-200 dark:border-slate-700"}`} onClick={() => setEditingProduct({ ...editingProduct, isHomeService: !editingProduct.isHomeService })}>
                      <div className="flex items-center justify-between mb-2">
                        <Home className="h-4 w-4" />
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${editingProduct.isHomeService ? "border-primary-500 bg-primary-500" : "border-slate-300"}`}>{editingProduct.isHomeService && <Check className="h-3 w-3 text-white" />}</div>
                      </div>
                      <span className="font-medium text-sm">Home Service</span>
                      <p className="text-xs text-muted-foreground">Ke lokasi customer</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditProductDialog(false)}>Batal</Button>
            <Button className="bg-primary-600 hover:bg-primary-700" onClick={handleSaveProduct}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteProductDialog} onOpenChange={setShowDeleteProductDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus {userProducts.find(p => p.id === productToDelete)?.type === "jasa" ? "Jasa" : "Produk"}?</AlertDialogTitle>
            <AlertDialogDescription>Data akan dihapus permanen dan tidak dapat dikembalikan.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDeleteProduct}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAddress ? "Edit Alamat" : "Tambah Alamat"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Label Alamat</Label>
              <Input placeholder="Rumah, Kos, Kantor..." value={addressForm.label} onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nama Penerima</Label>
                <Input value={addressForm.recipient} onChange={(e) => setAddressForm({ ...addressForm, recipient: e.target.value })} />
              </div>
              <div>
                <Label>No. HP</Label>
                <Input value={addressForm.phone} onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Alamat Lengkap</Label>
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
            <Button variant="outline" onClick={() => setShowAddressDialog(false)}>Batal</Button>
            <Button className="bg-primary-600 hover:bg-primary-700" onClick={handleSaveAddress}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteAddressDialog} onOpenChange={setShowDeleteAddressDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Alamat?</AlertDialogTitle>
            <AlertDialogDescription>Alamat akan dihapus permanen.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDeleteAddress}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ubah Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Password Saat Ini</Label>
              <div className="relative">
                <Input type={showCurrentPassword ? "text" : "password"} value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} placeholder="Masukkan password saat ini" />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>{showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
              </div>
            </div>
            <div>
              <Label>Password Baru</Label>
              <div className="relative">
                <Input type={showNewPassword ? "text" : "password"} value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} placeholder="Masukkan password baru" />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowNewPassword(!showNewPassword)}>{showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
              </div>
              <div className="mt-3 space-y-2">
                <p className="text-xs text-muted-foreground font-medium">Password harus memenuhi syarat:</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className={`flex items-center gap-2 text-xs transition-colors ${passwordValidations.minLength ? "text-primary-600" : "text-muted-foreground"}`}><div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordValidations.minLength ? "bg-primary-100" : "bg-slate-100"}`}>{passwordValidations.minLength ? <Check className="h-3 w-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />}</div>Minimal 8 karakter</div>
                  <div className={`flex items-center gap-2 text-xs transition-colors ${passwordValidations.hasNumber ? "text-primary-600" : "text-muted-foreground"}`}><div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordValidations.hasNumber ? "bg-primary-100" : "bg-slate-100"}`}>{passwordValidations.hasNumber ? <Check className="h-3 w-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />}</div>1 Angka</div>
                  <div className={`flex items-center gap-2 text-xs transition-colors ${passwordValidations.hasLowercase ? "text-primary-600" : "text-muted-foreground"}`}><div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordValidations.hasLowercase ? "bg-primary-100" : "bg-slate-100"}`}>{passwordValidations.hasLowercase ? <Check className="h-3 w-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />}</div>1 Huruf kecil</div>
                  <div className={`flex items-center gap-2 text-xs transition-colors ${passwordValidations.hasUppercase ? "text-primary-600" : "text-muted-foreground"}`}><div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordValidations.hasUppercase ? "bg-primary-100" : "bg-slate-100"}`}>{passwordValidations.hasUppercase ? <Check className="h-3 w-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />}</div>1 Huruf besar</div>
                </div>
              </div>
            </div>
            <div>
              <Label>Konfirmasi Password</Label>
              <div className="relative">
                <Input type={showConfirmPassword ? "text" : "password"} value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} placeholder="Ulangi password baru" />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
              </div>
              {passwordForm.confirmPassword && passwordForm.newPassword && (
                <p className={`text-xs mt-1 ${passwordForm.confirmPassword === passwordForm.newPassword ? "text-primary-600" : "text-red-500"}`}>
                  {passwordForm.confirmPassword === passwordForm.newPassword ? "Password cocok" : "Password tidak cocok"}
                </p>
              )}
            </div>
            {passwordError && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{passwordError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>Batal</Button>
            <Button className="bg-primary-600 hover:bg-primary-700" onClick={handleChangePassword} disabled={!isPasswordValid || passwordForm.newPassword !== passwordForm.confirmPassword}>Ubah Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showTopUpDialog} onOpenChange={setShowTopUpDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Plus className="h-5 w-5 text-primary-600" />Top Up Saldo</DialogTitle>
            <DialogDescription>Pilih nominal top up, pembayaran via Midtrans</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Pilih Nominal</Label>
              <div className="grid grid-cols-3 gap-2">
                {quickAmounts.map((amount) => (
                  <Button key={amount} variant={topUpAmount === amount.toString() ? "default" : "outline"} size="sm" onClick={() => setTopUpAmount(amount.toString())} className={topUpAmount === amount.toString() ? "bg-primary-600 hover:bg-primary-700" : ""}>{formatPrice(amount)}</Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="topUpAmount">Atau masukkan nominal</Label>
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Rp</span><Input id="topUpAmount" type="number" placeholder="Minimal Rp 10.000" value={topUpAmount} onChange={(e) => setTopUpAmount(e.target.value)} className="pl-10" /></div>
              <p className="text-xs text-muted-foreground">Minimal top up Rp 10.000</p>
            </div>
            {topUpAmount && parseInt(topUpAmount) >= 10000 && (
              <div className="p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
                <p className="text-sm text-primary-700 dark:text-primary-300 flex items-start gap-2"><AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /><span>Setelah klik "Top Up Sekarang", Anda akan diarahkan ke halaman pembayaran Midtrans untuk memilih metode pembayaran.</span></p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowTopUpDialog(false); setTopUpAmount("") }}>Batal</Button>
            <Button className="bg-primary-600 hover:bg-primary-700" disabled={!topUpAmount || parseInt(topUpAmount) < 10000} onClick={handleTopUp}>Top Up Sekarang</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tarik Dana</DialogTitle>
            <DialogDescription>Saldo: {formatPrice(currentWalletBalance)}</DialogDescription>
          </DialogHeader>
          <Tabs value={withdrawForm.type} onValueChange={(v) => setWithdrawForm({ ...withdrawForm, type: v as "bank" | "ewallet", bankType: "", ewalletType: "" })} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="bank"><Building className="h-4 w-4 mr-2" />Bank</TabsTrigger>
              <TabsTrigger value="ewallet"><Smartphone className="h-4 w-4 mr-2" />E-Wallet</TabsTrigger>
            </TabsList>
            <TabsContent value="bank" className="space-y-4">
              <div>
                <Label>Pilih Bank</Label>
                <Select value={withdrawForm.bankType} onValueChange={(v) => setWithdrawForm({ ...withdrawForm, bankType: v, customBankName: "" })}>
                  <SelectTrigger><SelectValue placeholder="Pilih bank tujuan" /></SelectTrigger>
                  <SelectContent>{BANK_OPTIONS.map(bank => <SelectItem key={bank.id} value={bank.id}>{bank.logo} {bank.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {isBankLainnya && (
                <div className="animate-in slide-in-from-top-2">
                  <Label>Nama Bank</Label>
                  <Input placeholder="Masukkan nama bank (contoh: Bank Sumut, Bank Nagari, dll)" value={withdrawForm.customBankName} onChange={(e) => setWithdrawForm({ ...withdrawForm, customBankName: e.target.value })} />
                  <p className="text-xs text-muted-foreground mt-1">Masukkan nama bank yang tidak ada di daftar</p>
                </div>
              )}
              <div><Label>Nomor Rekening</Label><Input placeholder="Masukkan nomor rekening" value={withdrawForm.accountNumber} onChange={(e) => setWithdrawForm({ ...withdrawForm, accountNumber: e.target.value })} /></div>
              <div><Label>Nama Pemilik Rekening</Label><Input placeholder="Nama sesuai buku rekening" value={withdrawForm.accountName} onChange={(e) => setWithdrawForm({ ...withdrawForm, accountName: e.target.value })} /></div>
              <div>
                <Label>Jumlah Penarikan</Label>
                <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Rp</span><Input type="number" placeholder="0" className="pl-10" value={withdrawForm.amount} onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })} /></div>
                <div className="flex justify-between text-xs mt-1"><span className="text-muted-foreground">Min: Rp 10.000</span><button className="text-primary-600 hover:underline" onClick={() => setWithdrawForm({ ...withdrawForm, amount: statsWalletBalance.toString() })}>Tarik semua</button></div>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"><div className="flex items-start gap-2"><AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" /><div className="text-xs text-blue-700 dark:text-blue-300"><p className="font-medium">Transfer Bank</p><p className="mt-1">• Proses 1x24 jam kerja</p><p>• Pastikan data rekening benar</p></div></div></div>
            </TabsContent>
            <TabsContent value="ewallet" className="space-y-4">
              <div>
                <Label>Pilih E-Wallet</Label>
                <Select value={withdrawForm.ewalletType} onValueChange={(v) => setWithdrawForm({ ...withdrawForm, ewalletType: v, customEwalletName: "" })}>
                  <SelectTrigger><SelectValue placeholder="Pilih e-wallet" /></SelectTrigger>
                  <SelectContent>{EWALLET_OPTIONS.map(ew => <SelectItem key={ew.id} value={ew.id}>{ew.logo} {ew.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {isEwalletLainnya && (
                <div className="animate-in slide-in-from-top-2">
                  <Label>Nama E-Wallet</Label>
                  <Input placeholder="Masukkan nama e-wallet (contoh: i.saku, Sakuku, dll)" value={withdrawForm.customEwalletName} onChange={(e) => setWithdrawForm({ ...withdrawForm, customEwalletName: e.target.value })} />
                  <p className="text-xs text-muted-foreground mt-1">Masukkan nama e-wallet yang tidak ada di daftar</p>
                </div>
              )}
              <div><Label>Nomor HP</Label><Input placeholder="08xxxxxxxxxx" value={withdrawForm.accountNumber} onChange={(e) => setWithdrawForm({ ...withdrawForm, accountNumber: e.target.value })} /></div>
              <div><Label>Nama Pemilik E-Wallet</Label><Input placeholder="Nama sesuai akun e-wallet" value={withdrawForm.accountName} onChange={(e) => setWithdrawForm({ ...withdrawForm, accountName: e.target.value })} /></div>
              <div>
                <Label>Jumlah Penarikan</Label>
                <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Rp</span><Input type="number" placeholder="0" className="pl-10" value={withdrawForm.amount} onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })} /></div>
                <div className="flex justify-between text-xs mt-1"><span className="text-muted-foreground">Min: Rp 10.000</span><button className="text-primary-600 hover:underline" onClick={() => setWithdrawForm({ ...withdrawForm, amount: statsWalletBalance.toString() })}>Tarik semua</button></div>
              </div>
              <div className="p-3 rounded-lg bg-secondary-50 dark:bg-secondary-900/20 border border-secondary-200 dark:border-secondary-800"><div className="flex items-start gap-2"><AlertCircle className="h-4 w-4 text-secondary-600 mt-0.5 shrink-0" /><div className="text-xs text-secondary-700 dark:text-secondary-300"><p className="font-medium">Transfer E-Wallet</p><p className="mt-1">• Proses instan (5-30 menit)</p><p>• Pastikan nomor HP aktif</p></div></div></div>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWithdrawDialog(false)}>Batal</Button>
            <Button className="bg-primary-600 hover:bg-primary-700" onClick={handleWithdraw} disabled={(withdrawForm.type === "bank" && (!withdrawForm.bankType || !withdrawForm.accountNumber || !withdrawForm.amount || (isBankLainnya && !withdrawForm.customBankName))) || (withdrawForm.type === "ewallet" && (!withdrawForm.ewalletType || !withdrawForm.accountNumber || !withdrawForm.amount || (isEwalletLainnya && !withdrawForm.customEwalletName)))}>Ajukan Penarikan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            <Button className="bg-primary-600 hover:bg-primary-700" onClick={() => { setShowShippingDialog(false); setShippingFee("") }} disabled={!shippingFee}>Kirim ke Pembeli</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showServicePriceDialog} onOpenChange={setShowServicePriceDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5 text-amber-600" />Input Harga Jasa</DialogTitle>
            <DialogDescription>Masukkan harga untuk layanan ini berdasarkan kebutuhan pembeli</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {mockOrders.find(o => o.id === selectedServiceOrder)?.serviceNotes && (
              <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                <p className="text-xs text-purple-600 font-medium mb-1">Kebutuhan Pembeli:</p>
                <p className="text-sm text-purple-800 dark:text-purple-200 line-clamp-3">{mockOrders.find(o => o.id === selectedServiceOrder)?.serviceNotes}</p>
              </div>
            )}
            <div className="space-y-2"><Label htmlFor="service-price">Harga Jasa (Rp) *</Label><Input id="service-price" type="number" placeholder="Contoh: 350000" value={servicePriceForm.price} onChange={(e) => setServicePriceForm({ ...servicePriceForm, price: e.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="service-notes">Catatan (Opsional)</Label><Textarea id="service-notes" placeholder="Contoh: Harga sudah termasuk revisi 2x" value={servicePriceForm.notes} onChange={(e) => setServicePriceForm({ ...servicePriceForm, notes: e.target.value })} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowServicePriceDialog(false)}>Batal</Button>
            <Button className="bg-primary-600 hover:bg-primary-700" onClick={handleSubmitServicePrice} disabled={!servicePriceForm.price}>Kirim Penawaran</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showOrderConfirmDialog} onOpenChange={setShowOrderConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Barang Dikirim?</AlertDialogTitle>
            <AlertDialogDescription>Pastikan barang sudah dikirim ke pembeli.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction className="bg-primary-600 hover:bg-primary-700" onClick={() => setShowOrderConfirmDialog(false)}>Konfirmasi</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PaymentMethodDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        totalPayment={paymentRequest?.totalPayment || 0}
        formatPrice={formatPrice}
        title="Pilih Metode Pembayaran"
        description={paymentRequest ? `Lanjutkan pembayaran untuk ${paymentRequest.orderTitle}.` : "Pilih metode pembayaran yang ingin digunakan."}
        summaryLabel={paymentRequest ? `Pembayaran ${paymentRequest.orderId}` : "Total pembayaran"}
        onPayWithWallet={handlePayWithWallet}
        onPayWithMidtrans={handlePayWithMidtrans}
      />

      {showProductSuccess && (
        <div className="fixed bottom-4 right-4 bg-primary-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-5 w-5" />
          {productSuccessMessage}
        </div>
      )}
      {showProfileSuccess && (
        <div className="fixed bottom-4 right-4 bg-primary-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-5 w-5" />Profil berhasil diperbarui!
        </div>
      )}
      {showPasswordSuccess && (
        <div className="fixed bottom-4 right-4 bg-primary-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-5 w-5" />Password berhasil diubah!
        </div>
      )}
      {showTopUpSuccess && (
        <div className="fixed bottom-4 right-4 bg-primary-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-5 w-5" />Top up berhasil! Saldo akan masuk dalam 1x24 jam.
        </div>
      )}
      {showWithdrawSuccess && (
        <div className="fixed bottom-4 right-4 bg-primary-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-5 w-5" />Penarikan diajukan! Dana akan dikirim dalam 1x24 jam.
        </div>
      )}
    </>
  )
}
