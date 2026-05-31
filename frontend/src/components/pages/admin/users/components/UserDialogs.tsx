import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Users, Ban, UserCheck, Mail, Phone, Shield, Calendar, Loader2 } from "lucide-react";
import type { User } from "@/lib/mock-data";

interface UserDialogsProps {
  showUserDetail: boolean;
  setShowUserDetail: (open: boolean) => void;
  selectedUser: User | null;
  userDetailLoading: boolean;
  userDetailError: string | null;

  showBanDialog: boolean;
  setShowBanDialog: (open: boolean) => void;
  showUnbanDialog: boolean;
  setShowUnbanDialog: (open: boolean) => void;
  userToAction: User | null;
  banReason: string;
  setBanReason: (reason: string) => void;
  unbanReason: string;
  setUnbanReason: (reason: string) => void;
  confirmBanUser: () => void;
  confirmUnbanUser: () => void;

  getFacultyName: (id: string | null) => string;
  getInitials: (value?: string | null) => string;
}

export default function UserDialogs({
  showUserDetail,
  setShowUserDetail,
  selectedUser,
  userDetailLoading,
  userDetailError,
  showBanDialog,
  setShowBanDialog,
  showUnbanDialog,
  setShowUnbanDialog,
  userToAction,
  banReason,
  setBanReason,
  unbanReason,
  setUnbanReason,
  confirmBanUser,
  confirmUnbanUser,
  getFacultyName,
  getInitials,
}: UserDialogsProps) {
  return (
    <>
      {/* 1. Detail User Dialog */}
      <Dialog open={showUserDetail} onOpenChange={setShowUserDetail}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Detail User
              </span>
              {userDetailLoading && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              {userDetailError && (
                <p className="text-sm text-red-600">{userDetailError}</p>
              )}
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  {selectedUser.avatar && (
                    <AvatarImage
                      src={selectedUser.avatar}
                      alt={selectedUser.name}
                      className="object-cover"
                    />
                  )}
                  <AvatarFallback
                    className={`text-lg ${
                      selectedUser.isBanned
                        ? "bg-red-100 text-red-700"
                        : "bg-primary-100 text-primary-700"
                    }`}
                  >
                    {getInitials(selectedUser.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-lg">{selectedUser.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {selectedUser.isBanned ? (
                      <Badge variant="destructive">Diblokir</Badge>
                    ) : selectedUser.isVerified ? (
                      <Badge variant="default" className="bg-primary-500">Aktif</Badge>
                    ) : (
                      <Badge
                        variant="default"
                        className="bg-secondary text-white hover:bg-secondary/90 border-transparent"
                      >
                        Belum Verifikasi
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedUser.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedUser.phone || "-"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span>{getFacultyName(selectedUser.faculty)}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Bergabung: {selectedUser.joinedAt}</span>
                </div>
              </div>
              {selectedUser.isBanned && selectedUser.banReason && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                    Alasan Pemblokiran:
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {selectedUser.banReason}
                  </p>
                </div>
              )}
              {selectedUser.isWarned && selectedUser.warningReason && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                    Peringatan:
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    {selectedUser.warningReason}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserDetail(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2. Ban User Dialog */}
      <Dialog open={showBanDialog} onOpenChange={(open) => { setShowBanDialog(open); if (!open) setBanReason(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Ban className="h-5 w-5" />
              Blokir User
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin memblokir user ini? User tidak akan bisa login atau melakukan transaksi.
            </DialogDescription>
          </DialogHeader>
          {userToAction && (
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                <p className="font-medium">{userToAction.name}</p>
                <p className="text-sm text-muted-foreground">{userToAction.email}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Alasan Blokir</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {[
                    "Melakukan penipuan terhadap pembeli/penjual",
                    "Spam atau penyalahgunaan platform",
                    "Konten tidak pantas atau melanggar aturan",
                    "Melanggar aturan platform KampusMarket",
                  ].map((tpl) => (
                    <button
                      key={tpl}
                      type="button"
                      onClick={() => setBanReason(tpl)}
                      className="text-xs px-2 py-1 rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      {tpl}
                    </button>
                  ))}
                </div>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Tulis alasan blokir atau pilih template di atas..."
                  className="w-full min-h-[80px] px-3 py-2 text-sm border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-muted-foreground">
                  Alasan ini akan ditampilkan ke user saat akun diblokir
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setShowBanDialog(false); setBanReason(""); }}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={confirmBanUser}
              disabled={!banReason.trim()}
            >
              <Ban className="h-4 w-4 mr-2" />
              Blokir User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 3. Unban User Dialog */}
      <Dialog open={showUnbanDialog} onOpenChange={setShowUnbanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary-600">
              <UserCheck className="h-5 w-5" />
              Buka Blokir User
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin membuka blokir user ini? User akan bisa login dan bertransaksi kembali.
            </DialogDescription>
          </DialogHeader>
          {userToAction && (
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                <p className="font-medium">{userToAction.name}</p>
                <p className="text-sm text-muted-foreground">{userToAction.email}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Catatan Pembukaan Blokir (Opsional)</label>
                <textarea
                  value={unbanReason}
                  onChange={(e) => setUnbanReason(e.target.value)}
                  placeholder="Contoh: Verifikasi identitas berhasil, kasus sudah diselesaikan, dll"
                  className="w-full min-h-[80px] px-3 py-2 text-sm border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-muted-foreground">
                  Catatan akan dikirim ke user saat akun dibuka blokir
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowUnbanDialog(false);
                setUnbanReason("");
              }}
            >
              Batal
            </Button>
            <Button
              className="bg-primary-600 hover:bg-primary-700 text-white"
              onClick={confirmUnbanUser}
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Buka Blokir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
