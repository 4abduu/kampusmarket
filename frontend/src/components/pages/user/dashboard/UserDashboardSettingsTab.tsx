"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Edit, Lock, MapPin, Plus, Save, Trash2, User, Loader2, Pencil } from "lucide-react";
import type { Address as AddressType } from "@/lib/mock-data";
import { useState, useEffect } from "react";
import { facultiesApi } from "@/lib/api/faculties";
import type { Faculty } from "@/components/pages/admin/admin-dashboard.shared";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ProfilePictureEditDialog from "@/components/pages/user/dashboard/ProfilePictureEditDialog";
import { userApi } from "@/lib/api/users";

type ProfileForm = {
  name: string;
  email: string;
  phone: string;
  bio: string;
  faculty: string;
};

type CurrentUser = {
  name: string;
  email: string;
  phone?: string;
  faculty: string | null;
  avatar?: string;
  isVerified?: boolean;
};

type Props = {
  currentUser: CurrentUser;
  profileForm: ProfileForm;
  setProfileForm: (form: ProfileForm) => void;
  handleSaveProfile: () => Promise<void>;
  setShowPasswordDialog: (open: boolean) => void;
  handleAddAddress: () => void;
  addresses: AddressType[];
  handleEditAddress: (address: AddressType) => void;
  setAddressToDelete: (id: string | null) => void;
  setShowDeleteAddressDialog: (open: boolean) => void;
  getFacultyName: (faculty: string | null) => string;
  isLoadingProfile?: boolean;
  profileError?: string | null;
  isLoadingAddresses?: boolean;
  addressError?: string | null;
  showProfileSuccess?: boolean;
  onNavigate?: (page: string) => void;
  onProfilePictureUpdate?: (newAvatarUrl: string) => void;
};

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
  isLoadingProfile = false,
  profileError = null,
  isLoadingAddresses = false,
  addressError = null,
  showProfileSuccess = false,
  onNavigate, // 🛠️ FIX: Destrukturisasi onNavigate supaya bisa dipakai di dalam komponen
  onProfilePictureUpdate,
}: Props) {
  const [showProfilePictureDialog, setShowProfilePictureDialog] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState(currentUser.avatar || "");
  const [showFacultyConfirmDialog, setShowFacultyConfirmDialog] = useState(false);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [isLoadingFaculties, setIsLoadingFaculties] = useState(true);

  useEffect(() => {
    facultiesApi
      .listDropdown()
      .then(setFaculties)
      .catch(() => setFaculties([]))
      .finally(() => setIsLoadingFaculties(false));
  }, []);

  const onSaveProfileClick = () => {
    if (!profileForm.faculty) {
      return;
    }

    // If the user didn't have a faculty before, confirm the first permanent selection
    if (!currentUser.faculty && profileForm.faculty) {
      setShowFacultyConfirmDialog(true);
    } else {
      handleSaveProfile();
    }
  };

  return (
    <>
      {/* Profil Saya Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />Profil Saya
          </CardTitle>
          <CardDescription>Kelola informasi profil kamu</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-16 w-16">
                {profilePictureUrl && (
                  <AvatarImage src={profilePictureUrl} alt={currentUser.name} />
                )}
                <AvatarFallback className="bg-primary-100 text-primary-700 text-xl">
                  {currentUser.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => setShowProfilePictureDialog(true)}
                className="absolute bottom-0 right-0 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-2 transition-colors shadow-md"
                title="Edit foto profil"
              >
                <Pencil className="h-3 w-3" />
              </button>
            </div>
            <div>
              <p className="font-medium">{currentUser.name}</p>
              <p className="text-sm text-muted-foreground">{currentUser.email}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Nama Lengkap */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Lengkap</label>
              <input 
                type="text" 
                value={profileForm.name} 
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                aria-label="Nama Lengkap"
                className="w-full border rounded-lg px-3 py-2" 
              />
            </div>

            {/* Email dengan Status Verifikasi */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <div className="relative">
                <input 
                  type="email" 
                  value={profileForm.email} 
                  disabled 
                  aria-label="Email"
                  className="w-full border rounded-lg px-3 py-2 pr-10 bg-slate-50 text-slate-600 cursor-not-allowed" 
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
              </div>
              {currentUser.isVerified ? (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Email sudah terverifikasi dan tidak dapat diubah setelah pendaftaran
                </p>
              ) : (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Email belum diverifikasi.{" "}
                  {/* 🛠️ FIX: Mengubah tag <a> menjadi button dengan onNavigate agar siklus render halaman OTP aman */}
                  <button 
                    type="button"
                    onClick={() => onNavigate?.("email-verification")}
                    className="underline font-medium hover:text-red-800 bg-transparent p-0 border-none cursor-pointer text-xs"
                  >
                    Silakan verifikasi email di sini
                  </button>
                </p>
              )}
            </div>

            {/* Nomor HP */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Nomor HP</label>
              <input 
                type="tel" 
                value={profileForm.phone} 
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                aria-label="Nomor HP"
                className="w-full border rounded-lg px-3 py-2" 
              />
            </div>

            {/* Fakultas */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Fakultas</Label>
              {currentUser.faculty ? (
                <>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={getFacultyName(currentUser.faculty)} 
                      disabled 
                      aria-label="Fakultas"
                      className="w-full border rounded-lg px-3 py-2 pr-10 bg-slate-50 text-slate-600 cursor-not-allowed" 
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Lock className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Fakultas sudah tersimpan dan bersifat tetap. Jika ada kendala, hubungi admin.
                  </p>
                </>
              ) : (
                <>
                  <select
                    className="w-full border rounded-lg px-3 py-2 bg-white disabled:opacity-60 disabled:cursor-wait text-sm"
                    aria-label="Pilih Fakultas"
                    value={profileForm.faculty}
                    onChange={(e) => setProfileForm({ ...profileForm, faculty: e.target.value })}
                    disabled={isLoadingFaculties}
                  >
                    <option value="">{isLoadingFaculties ? "Memuat fakultas..." : "Pilih fakultas wajib..."}</option>
                    {faculties.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                  <p className="text-xs text-blue-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Fakultas wajib dipilih sebelum menyimpan. Pilihan ini akan tetap.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Bio */}
          <div>
            <Label>Bio</Label>
            <Textarea 
              value={profileForm.bio} 
              onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} 
              placeholder="Ceritakan tentang dirimu..." 
              rows={3} 
            />
          </div>

          {/* Error & Success Messages */}
          {profileError && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4" />
              {profileError}
            </div>
          )}
          {showProfileSuccess && (
            <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm">
              Profil berhasil diperbarui
            </div>
          )}

          {/* Save Button */}
          <Button 
            className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed" 
            onClick={onSaveProfileClick}
            disabled={isLoadingProfile || (!currentUser.faculty && !profileForm.faculty)}
          >
            {isLoadingProfile ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            {isLoadingProfile ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </CardContent>
      </Card>

      {/* Keamanan Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />Keamanan
          </CardTitle>
          <CardDescription>Ubah password dan pengaturan keamanan</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => setShowPasswordDialog(true)}>
            <Lock className="h-4 w-4 mr-2" />Ubah Password
          </Button>
        </CardContent>
      </Card>

      {/* Alamat Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />Alamat
            </CardTitle>
            <CardDescription>Kelola alamat pengiriman</CardDescription>
          </div>
          <Button size="sm" className="bg-primary-600 hover:bg-primary-700" onClick={handleAddAddress}>
            <Plus className="h-4 w-4 mr-1" />Tambah
          </Button>
        </CardHeader>
        <CardContent>
          {addressError && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-sm mb-4">
              <AlertCircle className="h-4 w-4" />
              {addressError}
            </div>
          )}
          {isLoadingAddresses ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-primary-600" />
            </div>
          ) : addresses.length === 0 ? (
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
                      <Button variant="ghost" size="icon" onClick={() => handleEditAddress(addr)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500" 
                        onClick={() => { setAddressToDelete(addr.id); setShowDeleteAddressDialog(true); }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Edit Foto Profil */}
      <ProfilePictureEditDialog
        open={showProfilePictureDialog}
        onOpenChange={setShowProfilePictureDialog}
        currentUser={currentUser}
        onUploadSuccess={async (imageUrl) => {
          try {
            setProfilePictureUrl(imageUrl);
            onProfilePictureUpdate?.(imageUrl);
            await userApi.updateProfile({ avatar: imageUrl });
          } catch (error) {
            console.error("Failed to update avatar:", error);
          }
        }}
      />

      {/* Dialog Konfirmasi Fakultas */}
      <Dialog open={showFacultyConfirmDialog} onOpenChange={setShowFacultyConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Fakultas</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menetapkan fakultas <strong>{getFacultyName(profileForm.faculty)}</strong>?
              <br/><br/>
              Fakultas ini akan disimpan sebagai data tetap akun kamu.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFacultyConfirmDialog(false)}>Batal</Button>
            <Button 
              className="bg-primary-600 hover:bg-primary-700"
              onClick={() => {
                setShowFacultyConfirmDialog(false);
                handleSaveProfile();
              }}
            >
              Ya, Tetapkan Fakultas
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
