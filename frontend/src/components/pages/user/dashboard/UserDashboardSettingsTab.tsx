import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, Edit, Lock, MapPin, Plus, Save, Trash2, User } from "lucide-react"
import type { Address as AddressType } from "@/lib/mock-data"

type ProfileForm = {
  name: string
  email: string
  phone: string
  bio: string
  faculty: string
}

type CurrentUser = {
  name: string
  email: string
  phone?: string
  faculty: string | null
}

type Props = {
  currentUser: CurrentUser
  profileForm: ProfileForm
  setProfileForm: (form: ProfileForm) => void
  handleSaveProfile: () => void
  setShowPasswordDialog: (open: boolean) => void
  handleAddAddress: () => void
  addresses: AddressType[]
  handleEditAddress: (address: AddressType) => void
  setAddressToDelete: (id: string | null) => void
  setShowDeleteAddressDialog: (open: boolean) => void
  getFacultyName: (faculty: string | null) => string
}

export default function UserDashboardSettingsTab({
  currentUser,
  profileForm,
  setProfileForm,
  handleSaveProfile,
  setShowPasswordDialog,
  handleAddAddress,
  addresses,
  handleEditAddress,
  setAddressToDelete,
  setShowDeleteAddressDialog,
  getFacultyName,
}: Props) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />Profil Saya</CardTitle>
          <CardDescription>Kelola informasi profil kamu</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary-100 text-primary-700 text-xl">
                {currentUser.name.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{currentUser.name}</p>
              <p className="text-sm text-muted-foreground">{currentUser.email}</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Lengkap</label>
              <input type="text" defaultValue={currentUser.name} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <div className="relative">
                <input type="email" defaultValue={currentUser.email} disabled className="w-full border rounded-lg px-3 py-2 pr-10 bg-slate-50 text-slate-600 cursor-not-allowed" />
                <div className="absolute right-3 top-1/2 -translate-y-1/2"><Lock className="h-4 w-4 text-slate-400" /></div>
              </div>
              <p className="text-xs text-amber-600 flex items-center gap-1"><AlertCircle className="h-3 w-3" />Email tidak dapat diubah setelah pendaftaran</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nomor HP</label>
              <input type="tel" defaultValue={currentUser.phone} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Fakultas</label>
              <div className="relative">
                <input type="text" value={getFacultyName(currentUser.faculty)} disabled className="w-full border rounded-lg px-3 py-2 pr-10 bg-slate-50 text-slate-600 cursor-not-allowed" />
                <div className="absolute right-3 top-1/2 -translate-y-1/2"><Lock className="h-4 w-4 text-slate-400" /></div>
              </div>
              <p className="text-xs text-amber-600 flex items-center gap-1"><AlertCircle className="h-3 w-3" />Fakultas tidak dapat diubah setelah pendaftaran</p>
            </div>
          </div>
          <div>
            <Label>Bio</Label>
            <Textarea value={profileForm.bio} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} placeholder="Ceritakan tentang dirimu..." rows={3} />
          </div>
          <Button className="bg-primary-600 hover:bg-primary-700" onClick={handleSaveProfile}><Save className="h-4 w-4 mr-2" />Simpan Perubahan</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" />Keamanan</CardTitle>
          <CardDescription>Ubah password dan pengaturan keamanan</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => setShowPasswordDialog(true)}><Lock className="h-4 w-4 mr-2" />Ubah Password</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" />Alamat</CardTitle>
            <CardDescription>Kelola alamat pengiriman</CardDescription>
          </div>
          <Button size="sm" className="bg-primary-600 hover:bg-primary-700" onClick={handleAddAddress}><Plus className="h-4 w-4 mr-1" />Tambah</Button>
        </CardHeader>
        <CardContent>
          {addresses.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Belum ada alamat tersimpan</p>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <div key={addr.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{addr.label}</span>
                        {addr.isPrimary && <Badge className="bg-primary-100 text-primary-700 text-xs">Utama</Badge>}
                      </div>
                      <p className="text-sm font-medium">{addr.recipient}</p>
                      {addr.phone && <p className="text-sm text-muted-foreground">{addr.phone}</p>}
                      <p className="text-sm text-muted-foreground">{addr.address}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEditAddress(addr)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-red-500" onClick={() => { setAddressToDelete(addr.id); setShowDeleteAddressDialog(true); }}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
