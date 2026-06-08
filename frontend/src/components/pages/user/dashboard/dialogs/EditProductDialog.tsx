import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, Check, Clock3, DollarSign, Home, MapPin, Monitor, TriangleAlert, Info, XCircle } from "lucide-react"
import AddProductImagesSection from "@/components/pages/user/add-product/AddProductImagesSection"
import type { Product } from "@/lib/mock-data"

interface Props {
  showEditProductDialog: boolean
  setShowEditProductDialog: (open: boolean) => void
  editingProduct: Product | null
  setEditingProduct: (product: Product | null) => void
  handleSaveProduct: () => void
  categories: Array<{ id: string; label: string }>
  serviceCategories: Array<{ id: string; label: string }>
}

export function EditProductDialog({
  showEditProductDialog,
  setShowEditProductDialog,
  editingProduct,
  setEditingProduct,
  handleSaveProduct,
  categories,
  serviceCategories,
}: Props) {
  return (
    <Dialog open={showEditProductDialog} onOpenChange={setShowEditProductDialog}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingProduct?.type === "jasa" ? "Edit Jasa" : "Edit Produk"}</DialogTitle>
          <DialogDescription>Perbarui informasi {editingProduct?.type === "jasa" ? "jasa" : "produk"} kamu</DialogDescription>
        </DialogHeader>
        {editingProduct && (
          <div className="space-y-4">
            {/* Foto Produk - Ditampilkan di Atas */}
            <div>
              <AddProductImagesSection
                productType={editingProduct.type as "barang" | "jasa"}
                images={
                  Array.isArray(editingProduct.images)
                    ? editingProduct.images.map((img: any) =>
                        typeof img === "string" ? img : img?.url ?? ""
                      ).filter(Boolean)
                    : []
                }
                setImages={(urls) => setEditingProduct({ ...editingProduct, images: urls as any })}
              />
            </div>

            <div>
              <Label>Judul <span className="text-red-500">*</span></Label>
              <Input 
                value={editingProduct.title} 
                onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })} 
                placeholder="Masukkan judul produk/jasa"
              />
            </div>

            <div>
              <Label>Lokasi <span className="text-red-500">*</span></Label>
              <Input 
                value={editingProduct.location} 
                onChange={(e) => setEditingProduct({ ...editingProduct, location: e.target.value })} 
                placeholder="Contoh: Jakarta Pusat, Bandung"
              />
            </div>
            {editingProduct.type === "jasa" ? (
              <>
                {/* Tipe Harga untuk Jasa */}
                <div>
                  <Label>Tipe Harga <span className="text-red-500">*</span></Label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {[
                      { value: "fixed", label: "Tetap", desc: "Satu harga pasti" },
                      { value: "starting", label: "Mulai Dari", desc: "Harga minimum" },
                      { value: "range", label: "Rentang", desc: "Min - Max" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setEditingProduct({ ...editingProduct, priceType: opt.value as any })}
                        className={`p-2 rounded-lg border-2 text-left text-xs transition-all ${
                          (editingProduct.priceType || "range") === opt.value
                            ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                            : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <span className="font-medium">{opt.label}</span>
                        <p className="text-muted-foreground mt-0.5">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Harga fields berdasarkan tipe */}
                <div className="grid grid-cols-2 gap-4">
                  {(editingProduct.priceType || "range") === "fixed" && (
                    <div className="col-span-2">
                      <Label>Harga Jasa (Rp) <span className="text-red-500">*</span></Label>
                      <Input 
                        type="text" 
                        inputMode="numeric"
                        value={editingProduct.price ? new Intl.NumberFormat("id-ID").format(editingProduct.price) : ""} 
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          setEditingProduct({ ...editingProduct, price: parseInt(val, 10) || 0 });
                        }} 
                        placeholder="100.000" 
                      />
                    </div>
                  )}
                  {(editingProduct.priceType || "range") === "starting" && (
                    <div className="col-span-2">
                      <Label>Harga Mulai Dari (Rp) <span className="text-red-500">*</span></Label>
                      <Input 
                        type="text" 
                        inputMode="numeric"
                        value={editingProduct.priceMin ? new Intl.NumberFormat("id-ID").format(editingProduct.priceMin) : ""} 
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          setEditingProduct({ ...editingProduct, priceMin: parseInt(val, 10) || 0 });
                        }} 
                        placeholder="50.000" 
                      />
                    </div>
                  )}
                  {(editingProduct.priceType || "range") === "range" && (
                    <>
                      <div>
                        <Label>Harga Min (Rp) <span className="text-red-500">*</span></Label>
                        <Input 
                          type="text" 
                          inputMode="numeric"
                          value={editingProduct.priceMin ? new Intl.NumberFormat("id-ID").format(editingProduct.priceMin) : ""} 
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            setEditingProduct({ ...editingProduct, priceMin: parseInt(val, 10) || 0 });
                          }} 
                          placeholder="50.000" 
                        />
                      </div>
                      <div>
                        <Label>Harga Max (Rp) <span className="text-red-500">*</span></Label>
                        <Input 
                          type="text" 
                          inputMode="numeric"
                          value={editingProduct.priceMax ? new Intl.NumberFormat("id-ID").format(editingProduct.priceMax) : ""} 
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            setEditingProduct({ ...editingProduct, priceMax: parseInt(val, 10) || 0 });
                          }} 
                          placeholder="150.000" 
                        />
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Harga (Rp) <span className="text-red-500">*</span></Label>
                  <Input 
                    type="text" 
                    inputMode="numeric"
                    value={editingProduct.price ? new Intl.NumberFormat("id-ID").format(editingProduct.price) : ""} 
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setEditingProduct({ ...editingProduct, price: parseInt(val, 10) || 0 });
                    }} 
                    placeholder="0" 
                  />
                </div>
                <div>
                  <Label>Stok <span className="text-red-500">*</span></Label>
                  <Input 
                    type="number" 
                    value={editingProduct.stock} 
                    onChange={(e) => {
                      const newStock = parseInt(e.target.value) || 0;
                      let newStatus = editingProduct.status;
                      
                      // Auto-correct status based on new stock
                      if (newStock === 0 && editingProduct.status === 'active') {
                        newStatus = 'sold_out';
                      } else if (newStock > 0 && editingProduct.status === 'sold_out') {
                        newStatus = 'active';
                      }
                      
                      setEditingProduct({ ...editingProduct, stock: newStock, status: newStatus })
                    }} 
                    placeholder="0" 
                  />
                  {editingProduct.stock === 0 && (
                    <p className="text-xs text-amber-600 mt-1">Stok 0 → Status akan "Terjual"</p>
                  )}
                </div>
              </div>
            )}
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
              <Label>Deskripsi <span className="text-red-500">*</span></Label>
              <Textarea value={editingProduct.description} onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })} rows={3} />
            </div>
            <div>
              <Label>Kategori <span className="text-red-500">*</span></Label>
              <Select value={editingProduct.categoryId || (editingProduct.type === "jasa" ? serviceCategories : categories).find(c => c.label === editingProduct.category)?.id || ""} onValueChange={(v) => {
                const cat = (editingProduct.type === "jasa" ? serviceCategories : categories).find(c => c.id === v);
                setEditingProduct({ ...editingProduct, category: cat?.label || v, categoryId: v });
              }}>
                <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                <SelectContent>
                  {(editingProduct.type === "jasa" ? serviceCategories : categories).map(c => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {editingProduct.type === "barang" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Kondisi <span className="text-red-500">*</span></Label>
                  <Select value={editingProduct.condition || "bekas"} onValueChange={(v: "baru" | "bekas") => setEditingProduct({ ...editingProduct, condition: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baru">Baru</SelectItem>
                      <SelectItem value="bekas">Bekas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Berat (gram)</Label>
                  <Input type="number" value={editingProduct.weight || ""} onChange={(e) => setEditingProduct({ ...editingProduct, weight: parseInt(e.target.value) || undefined })} placeholder="500" />
                </div>
              </div>
            )}
            <div>
              <Label>Status Produk <span className="text-red-500">*</span></Label>
              {editingProduct.type === "barang" && editingProduct.stock === 0 && editingProduct.status !== "sold_out" && (
                <div className="mb-2 p-2 rounded bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
                  <p className="text-xs text-amber-700 dark:text-amber-400"><TriangleAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" /> Stok = 0, status harus "Terjual". Auto-disetting...</p>
                </div>
              )}
              <Select 
                value={editingProduct.status || "active"} 
                onValueChange={(v: "draft" | "active" | "sold_out" | "archived") => {
                  if (editingProduct.type === "barang") {
                    if (v === "sold_out" && editingProduct.stock > 0) return;
                    if (v === "active" && editingProduct.stock === 0) return;
                  }
                  setEditingProduct({ ...editingProduct, status: v });
                }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft - Belum dipublikasikan</SelectItem>
                  {editingProduct.type === "barang" ? (
                    <>
                      {editingProduct.stock > 0 && <SelectItem value="active">Aktif - Sedang dijual</SelectItem>}
                      {editingProduct.stock === 0 ? <SelectItem value="sold_out">Terjual - Stok habis (Otomatis)</SelectItem> : <SelectItem value="sold_out" disabled>Terjual - Hanya jika stok = 0</SelectItem>}
                    </>
                  ) : (
                    <>
                      <SelectItem value="active">Aktif - Sedang dijual</SelectItem>
                      <SelectItem value="sold_out">Terjual</SelectItem>
                    </>
                  )}
                  <SelectItem value="archived">Arsip - Tidak dijual</SelectItem>
                </SelectContent>
              </Select>
              {editingProduct.type === "barang" && editingProduct.stock === 0 && <p className="text-xs text-amber-600 mt-1 flex items-center gap-1"><Info className="h-3 w-3" /> Status otomatis "Terjual" karena stok = 0</p>}
              {editingProduct.type === "barang" && editingProduct.stock > 0 && editingProduct.status === "sold_out" && <p className="text-xs text-red-600 mt-1 flex items-center gap-1"><XCircle className="h-3 w-3" /> Tidak bisa "Terjual" saat stok {'>'}0. Kurangi stok ke 0 dulu.</p>}
            </div>

            {editingProduct.type === "barang" && (
              <div className="flex items-center justify-between p-3 rounded-lg border bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Bisa Nego</span>
                </div>
                <Switch checked={editingProduct.canNego} onCheckedChange={(checked) => setEditingProduct({ ...editingProduct, canNego: checked })} />
              </div>
            )}

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
        {editingProduct && (() => {
          const errors: string[] = []
          if (!editingProduct.title?.trim()) errors.push("Judul harus diisi")
          if (!editingProduct.description?.trim()) errors.push("Deskripsi harus diisi")
          if (!editingProduct.location?.trim()) errors.push("Lokasi harus diisi")
          if (editingProduct.type === "barang") {
            if ((editingProduct.price || 0) <= 0) errors.push("Harga harus lebih dari 0")
            if ((editingProduct.stock || 0) < 0) errors.push("Stok tidak boleh negatif")
            const hasShipping = editingProduct.isCod || editingProduct.isPickup || editingProduct.isDelivery || (editingProduct.shippingOptions?.length ?? 0) > 0
            if (!hasShipping) errors.push("Minimal pilih satu metode pengiriman")
          } else if (editingProduct.type === "jasa") {
            if (editingProduct.priceType === "fixed" && (editingProduct.price || 0) <= 0) {
              errors.push("Harga harus lebih dari 0")
            } else if ((editingProduct.priceType === "starting" || editingProduct.priceType === "range") && (editingProduct.priceMin || 0) <= 0) {
              errors.push("Harga minimum harus lebih dari 0")
            }
            const hasService = editingProduct.isOnline || editingProduct.isOnsite || editingProduct.isHomeService || (editingProduct.shippingOptions?.length ?? 0) > 0
            if (!hasService) errors.push("Minimal pilih satu metode pelayanan")
          }
          
          return errors.length > 0 ? (
            <div className="p-3 rounded-lg border bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
              <div className="flex gap-2 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  {errors.map((err, i) => <div key={i}>• {err}</div>)}
                </div>
              </div>
            </div>
          ) : null
        })()}
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowEditProductDialog(false)}>Batal</Button>
          <Button 
            className="bg-primary-600 hover:bg-primary-700" 
            onClick={handleSaveProduct}
            disabled={!editingProduct || editingProduct.title?.trim() === "" || editingProduct.description?.trim() === "" || editingProduct.location?.trim() === "" || (editingProduct.images?.length ?? 0) === 0}
          >
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
