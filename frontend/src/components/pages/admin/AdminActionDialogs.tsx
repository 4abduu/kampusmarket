import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  Ban,
  Calendar,
  CalendarDays,
  CheckCircle2,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  Shield,
  Tag,
  Trash2,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";

import type { CancelRequest, Category, Product, Report, User, Withdrawal } from "@/lib/mock-data";

type CancelReasonItem = {
  value: string;
  label: string;
};

type CategoryFormState = {
  name: string;
  type: "barang" | "jasa";
  description: string;
  sortOrder: number;
  isActive: boolean;
};

type Props = {
  showUserDetail: boolean;
  setShowUserDetail: (open: boolean) => void;
  selectedUser: User | null;

  showBanDialog: boolean;
  setShowBanDialog: (open: boolean) => void;
  showUnbanDialog: boolean;
  setShowUnbanDialog: (open: boolean) => void;
  userToAction: User | null;
  confirmBanUser: () => void;
  confirmUnbanUser: () => void;

  showProductDetail: boolean;
  setShowProductDetail: (open: boolean) => void;
  selectedProduct: Product | null;
  showDeleteProductDialog: boolean;
  setShowDeleteProductDialog: (open: boolean) => void;
  productToDelete: Product | null;
  confirmDeleteProduct: () => void;

  showWarningDialog: boolean;
  setShowWarningDialog: (open: boolean) => void;
  showBanReportDialog: boolean;
  setShowBanReportDialog: (open: boolean) => void;
  selectedReport: Report | null;
  confirmSendWarning: () => void;
  confirmBanFromReport: () => void;

  showApproveDialog: boolean;
  setShowApproveDialog: (open: boolean) => void;
  showRejectDialog: boolean;
  setShowRejectDialog: (open: boolean) => void;
  showCompleteDialog: boolean;
  setShowCompleteDialog: (open: boolean) => void;
  showFailDialog: boolean;
  setShowFailDialog: (open: boolean) => void;
  selectedWithdrawal: Withdrawal | null;
  confirmApproveWithdrawal: () => void;
  confirmRejectWithdrawal: () => void;
  confirmCompleteWithdrawal: () => void;
  confirmFailWithdrawal: () => void;
  rejectionReason: string;
  setRejectionReason: (value: string) => void;
  failureReason: string;
  setFailureReason: (value: string) => void;

  showCategoryDialog: boolean;
  setShowCategoryDialog: (open: boolean) => void;
  selectedCategory: Category | null;
  categoryForm: CategoryFormState;
  setCategoryForm: (value: CategoryFormState) => void;
  handleSaveCategory: () => void;
  showDeleteCategoryDialog: boolean;
  setShowDeleteCategoryDialog: (open: boolean) => void;
  categoryToDelete: Category | null;
  confirmDeleteCategory: () => void;

  showCancelApproveDialog: boolean;
  setShowCancelApproveDialog: (open: boolean) => void;
  showCancelRejectDialog: boolean;
  setShowCancelRejectDialog: (open: boolean) => void;
  selectedCancelRequest: CancelRequest | null;
  cancelApproveNotes: string;
  setCancelApproveNotes: (value: string) => void;
  cancelRejectReasonInput: string;
  setCancelRejectReasonInput: (value: string) => void;
  confirmApproveCancelRequest: () => void;
  confirmRejectCancelRequest: () => void;

  formatPrice: (price: number) => string;
  formatProductPrice: (product: Product) => string;
  getFacultyName: (id: string | null) => string;
  getInitials: (value?: string | null) => string;
  cancelReasons: CancelReasonItem[];
};

export default function AdminActionDialogs({
  showUserDetail,
  setShowUserDetail,
  selectedUser,
  showBanDialog,
  setShowBanDialog,
  showUnbanDialog,
  setShowUnbanDialog,
  userToAction,
  confirmBanUser,
  confirmUnbanUser,
  showProductDetail,
  setShowProductDetail,
  selectedProduct,
  showDeleteProductDialog,
  setShowDeleteProductDialog,
  productToDelete,
  confirmDeleteProduct,
  showWarningDialog,
  setShowWarningDialog,
  showBanReportDialog,
  setShowBanReportDialog,
  selectedReport,
  confirmSendWarning,
  confirmBanFromReport,
  showApproveDialog,
  setShowApproveDialog,
  showRejectDialog,
  setShowRejectDialog,
  showCompleteDialog,
  setShowCompleteDialog,
  showFailDialog,
  setShowFailDialog,
  selectedWithdrawal,
  confirmApproveWithdrawal,
  confirmRejectWithdrawal,
  confirmCompleteWithdrawal,
  confirmFailWithdrawal,
  rejectionReason,
  setRejectionReason,
  failureReason,
  setFailureReason,
  showCategoryDialog,
  setShowCategoryDialog,
  selectedCategory,
  categoryForm,
  setCategoryForm,
  handleSaveCategory,
  showDeleteCategoryDialog,
  setShowDeleteCategoryDialog,
  categoryToDelete,
  confirmDeleteCategory,
  showCancelApproveDialog,
  setShowCancelApproveDialog,
  showCancelRejectDialog,
  setShowCancelRejectDialog,
  selectedCancelRequest,
  cancelApproveNotes,
  setCancelApproveNotes,
  cancelRejectReasonInput,
  setCancelRejectReasonInput,
  confirmApproveCancelRequest,
  confirmRejectCancelRequest,
  formatPrice,
  formatProductPrice,
  getFacultyName,
  getInitials,
  cancelReasons,
}: Props) {
  return (
    <>
      <Dialog open={showUserDetail} onOpenChange={setShowUserDetail}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Detail User
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className={`text-lg ${selectedUser.isBanned ? "bg-red-100 text-red-700" : "bg-primary-100 text-primary-700"}`}>
                    {getInitials(selectedUser.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-lg">{selectedUser.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {selectedUser.isBanned ? <Badge variant="destructive">Diblokir</Badge> : selectedUser.isVerified ? <Badge variant="default">Aktif</Badge> : <Badge variant="secondary">Belum Verifikasi</Badge>}
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm"><Mail className="h-4 w-4 text-muted-foreground" /><span>{selectedUser.email}</span></div>
                <div className="flex items-center gap-3 text-sm"><Phone className="h-4 w-4 text-muted-foreground" /><span>{selectedUser.phone || "-"}</span></div>
                <div className="flex items-center gap-3 text-sm"><Shield className="h-4 w-4 text-muted-foreground" /><span>{getFacultyName(selectedUser.faculty)}</span></div>
                <div className="flex items-center gap-3 text-sm"><Calendar className="h-4 w-4 text-muted-foreground" /><span>Bergabung: {selectedUser.joinedAt}</span></div>
              </div>
              {selectedUser.isBanned && selectedUser.banReason && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">Alasan Pemblokiran:</p>
                  <p className="text-sm text-red-700 dark:text-red-300">{selectedUser.banReason}</p>
                </div>
              )}
              {selectedUser.isWarned && selectedUser.warningReason && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">Peringatan:</p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">{selectedUser.warningReason}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setShowUserDetail(false)}>Tutup</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600"><Ban className="h-5 w-5" />Blokir User</DialogTitle>
            <DialogDescription>Apakah Anda yakin ingin memblokir user ini? User tidak akan bisa login atau melakukan transaksi.</DialogDescription>
          </DialogHeader>
          {userToAction && <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3"><p className="font-medium">{userToAction.name}</p><p className="text-sm text-muted-foreground">{userToAction.email}</p></div>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBanDialog(false)}>Batal</Button>
            <Button variant="destructive" onClick={confirmBanUser}><Ban className="h-4 w-4 mr-2" />Blokir User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showUnbanDialog} onOpenChange={setShowUnbanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary-600"><UserCheck className="h-5 w-5" />Buka Blokir User</DialogTitle>
            <DialogDescription>Apakah Anda yakin ingin membuka blokir user ini? User akan bisa login dan bertransaksi kembali.</DialogDescription>
          </DialogHeader>
          {userToAction && <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3"><p className="font-medium">{userToAction.name}</p><p className="text-sm text-muted-foreground">{userToAction.email}</p></div>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUnbanDialog(false)}>Batal</Button>
            <Button className="bg-primary-600 hover:bg-primary-700" onClick={confirmUnbanUser}><UserCheck className="h-4 w-4 mr-2" />Buka Blokir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showProductDetail} onOpenChange={setShowProductDetail}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">{selectedProduct?.type === "jasa" ? <><CalendarDays className="h-5 w-5" />Detail Jasa</> : <><Package className="h-5 w-5" />Detail Produk</>}</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">{selectedProduct.type === "jasa" ? <CalendarDays className="h-12 w-12 text-muted-foreground/30" /> : <Package className="h-12 w-12 text-muted-foreground/30" />}</div>
              <div><p className="font-bold text-lg">{selectedProduct.title}</p><p className="text-sm text-muted-foreground mt-1">{selectedProduct.description}</p></div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3"><p className="text-muted-foreground">Harga</p><p className="font-bold text-primary-600">{formatProductPrice(selectedProduct)}</p></div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3"><p className="text-muted-foreground">{selectedProduct.type === "jasa" ? "Tipe" : "Kondisi"}</p><p className="font-medium">{selectedProduct.type === "jasa" ? "Jasa" : selectedProduct.condition === "baru" ? "Baru" : "Bekas"}</p></div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3"><p className="text-muted-foreground">Kategori</p><p className="font-medium">{selectedProduct.category}</p></div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3"><p className="text-muted-foreground">{selectedProduct.type === "jasa" ? "Dipesan" : "Terjual"}</p><p className="font-medium">{selectedProduct.soldCount} item</p></div>
              </div>
              {selectedProduct.type === "jasa" && selectedProduct.durationMin && selectedProduct.durationUnit && <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3"><p className="text-sm text-muted-foreground">Estimasi Durasi</p><p className="font-medium text-purple-700 dark:text-purple-300">{selectedProduct.durationMin === selectedProduct.durationMax ? `${selectedProduct.durationMin} ${selectedProduct.durationUnit}` : `${selectedProduct.durationMin} - ${selectedProduct.durationMax} ${selectedProduct.durationUnit}`}</p></div>}
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3"><p className="text-sm text-muted-foreground">{selectedProduct.type === "jasa" ? "Penyedia Jasa" : "Penjual"}</p><div className="flex items-center gap-2 mt-1"><Avatar className="h-6 w-6"><AvatarFallback className="bg-primary-100 text-primary-700 text-xs">{getInitials(selectedProduct.seller?.name)}</AvatarFallback></Avatar><span className="font-medium text-sm">{selectedProduct.seller?.name || "-"}</span></div></div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4" /><span>{selectedProduct.location}</span></div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setShowProductDetail(false)}>Tutup</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteProductDialog} onOpenChange={setShowDeleteProductDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600"><Trash2 className="h-5 w-5" />Hapus Produk</DialogTitle>
            <DialogDescription>Apakah Anda yakin ingin menghapus produk ini secara permanen? Tindakan ini tidak dapat dibatalkan.</DialogDescription>
          </DialogHeader>
          {productToDelete && <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 flex items-center gap-3"><div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center">{productToDelete.type === "jasa" ? <CalendarDays className="h-6 w-6 text-muted-foreground/30" /> : <Package className="h-6 w-6 text-muted-foreground/30" />}</div><div><p className="font-medium">{productToDelete.title}</p><p className="text-sm text-muted-foreground">{formatProductPrice(productToDelete)}</p></div></div>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteProductDialog(false)}>Batal</Button>
            <Button variant="destructive" onClick={confirmDeleteProduct}><Trash2 className="h-4 w-4 mr-2" />Hapus Produk</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-amber-600"><MessageCircle className="h-5 w-5" />Kirim Warning</DialogTitle><DialogDescription>Warning akan dikirim ke user yang dilaporkan. User akan menerima notifikasi tentang pelanggaran mereka.</DialogDescription></DialogHeader>
          {selectedReport && <div className="space-y-3"><div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3"><p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">Alasan Laporan:</p><p className="text-sm text-amber-700 dark:text-amber-300">{selectedReport.reason}</p></div><div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3"><p className="text-sm text-muted-foreground">User yang dilaporkan:</p><p className="font-medium">{selectedReport.reportedUser.name}</p><p className="text-sm text-muted-foreground">{selectedReport.reportedUser.email}</p></div></div>}
          <DialogFooter><Button variant="outline" onClick={() => setShowWarningDialog(false)}>Batal</Button><Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={confirmSendWarning}><MessageCircle className="h-4 w-4 mr-2" />Kirim Warning</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showBanReportDialog} onOpenChange={setShowBanReportDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-red-600"><Ban className="h-5 w-5" />Blokir User</DialogTitle><DialogDescription>User akan diblokir permanen dan tidak bisa login atau bertransaksi lagi.</DialogDescription></DialogHeader>
          {selectedReport && <div className="space-y-3"><div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3"><p className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">Alasan Laporan:</p><p className="text-sm text-red-700 dark:text-red-300">{selectedReport.reason}</p></div><div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3"><p className="text-sm text-muted-foreground">User yang akan diblokir:</p><p className="font-medium">{selectedReport.reportedUser.name}</p><p className="text-sm text-muted-foreground">{selectedReport.reportedUser.email}</p></div></div>}
          <DialogFooter><Button variant="outline" onClick={() => setShowBanReportDialog(false)}>Batal</Button><Button variant="destructive" onClick={confirmBanFromReport}><Ban className="h-4 w-4 mr-2" />Blokir User</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-primary-600"><CheckCircle2 className="h-5 w-5" />Setujui Penarikan</DialogTitle><DialogDescription>Dana akan ditransfer ke rekening user dalam 1x24 jam kerja.</DialogDescription></DialogHeader>
          {selectedWithdrawal && <div className="space-y-3"><div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-3"><p className="text-sm text-muted-foreground">Jumlah Penarikan:</p><p className="font-bold text-xl text-primary-600">{formatPrice(selectedWithdrawal.amount)}</p></div><div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 space-y-2"><div className="flex items-center gap-2"><Avatar className="h-6 w-6"><AvatarFallback className="bg-primary-100 text-primary-700 text-xs">{getInitials(selectedWithdrawal.user?.name)}</AvatarFallback></Avatar><span className="font-medium">{selectedWithdrawal.user?.name || "-"}</span></div><p className="text-sm text-muted-foreground">{selectedWithdrawal.bankName} - {selectedWithdrawal.accountNumber}</p><p className="text-sm text-muted-foreground">a.n {selectedWithdrawal.accountName}</p></div></div>}
          <DialogFooter><Button variant="outline" onClick={() => setShowApproveDialog(false)}>Batal</Button><Button className="bg-primary-600 hover:bg-primary-700" onClick={confirmApproveWithdrawal}><CheckCircle2 className="h-4 w-4 mr-2" />Setujui</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-red-600"><XCircle className="h-5 w-5" />Tolak Penarikan</DialogTitle><DialogDescription>Dana akan dikembalikan ke saldo user. User akan menerima notifikasi.</DialogDescription></DialogHeader>
          {selectedWithdrawal && <div className="space-y-3"><div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3"><p className="text-sm text-muted-foreground">Jumlah Penarikan:</p><p className="font-bold text-xl text-red-600">{formatPrice(selectedWithdrawal.amount)}</p></div><div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 space-y-2"><div className="flex items-center gap-2"><Avatar className="h-6 w-6"><AvatarFallback className="bg-primary-100 text-primary-700 text-xs">{getInitials(selectedWithdrawal.user?.name)}</AvatarFallback></Avatar><span className="font-medium">{selectedWithdrawal.user?.name || "-"}</span></div><p className="text-sm text-muted-foreground">{selectedWithdrawal.bankName} - {selectedWithdrawal.accountNumber}</p></div><div className="space-y-2"><label className="text-sm font-medium">Alasan Penolakan <span className="text-red-500">*</span></label><textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Contoh: Nomor rekening tidak sesuai dengan nama pemilik akun..." className="w-full min-h-[80px] px-3 py-2 text-sm border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-500" /><p className="text-xs text-muted-foreground">Alasan ini akan ditampilkan ke user.</p></div></div>}
          <DialogFooter><Button variant="outline" onClick={() => setShowRejectDialog(false)}>Batal</Button><Button variant="destructive" onClick={confirmRejectWithdrawal} disabled={!rejectionReason.trim()}><XCircle className="h-4 w-4 mr-2" />Tolak</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-primary-600"><CheckCircle2 className="h-5 w-5" />Selesaikan Penarikan</DialogTitle><DialogDescription>Konfirmasi bahwa dana telah berhasil ditransfer ke rekening user.</DialogDescription></DialogHeader>
          {selectedWithdrawal && <div className="space-y-3"><div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-3"><p className="text-sm text-muted-foreground">Jumlah Penarikan:</p><p className="font-bold text-xl text-primary-600">{formatPrice(selectedWithdrawal.amount)}</p></div><div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 space-y-2"><div className="flex items-center gap-2"><Avatar className="h-6 w-6"><AvatarFallback className="bg-primary-100 text-primary-700 text-xs">{getInitials(selectedWithdrawal.user?.name)}</AvatarFallback></Avatar><span className="font-medium">{selectedWithdrawal.user?.name || "-"}</span></div><p className="text-sm text-muted-foreground">{selectedWithdrawal.bankName} - {selectedWithdrawal.accountNumber}</p><p className="text-sm text-muted-foreground">a.n {selectedWithdrawal.accountName}</p></div></div>}
          <DialogFooter><Button variant="outline" onClick={() => setShowCompleteDialog(false)}>Batal</Button><Button className="bg-primary-600 hover:bg-primary-700" onClick={confirmCompleteWithdrawal}><CheckCircle2 className="h-4 w-4 mr-2" />Selesaikan</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showFailDialog} onOpenChange={setShowFailDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-red-600"><XCircle className="h-5 w-5" />Penarikan Gagal</DialogTitle><DialogDescription>Dana akan dikembalikan ke saldo user. User akan menerima notifikasi.</DialogDescription></DialogHeader>
          {selectedWithdrawal && <div className="space-y-3"><div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3"><p className="text-sm text-muted-foreground">Jumlah Penarikan:</p><p className="font-bold text-xl text-red-600">{formatPrice(selectedWithdrawal.amount)}</p></div><div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 space-y-2"><div className="flex items-center gap-2"><Avatar className="h-6 w-6"><AvatarFallback className="bg-primary-100 text-primary-700 text-xs">{getInitials(selectedWithdrawal.user?.name)}</AvatarFallback></Avatar><span className="font-medium">{selectedWithdrawal.user?.name || "-"}</span></div><p className="text-sm text-muted-foreground">{selectedWithdrawal.bankName} - {selectedWithdrawal.accountNumber}</p></div><div className="space-y-2"><label className="text-sm font-medium">Alasan Kegagalan <span className="text-red-500">*</span></label><textarea value={failureReason} onChange={(e) => setFailureReason(e.target.value)} placeholder="Contoh: Transfer gagal karena rekening tujuan tidak aktif..." className="w-full min-h-[80px] px-3 py-2 text-sm border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-500" /><p className="text-xs text-muted-foreground">Alasan ini akan ditampilkan ke user.</p></div></div>}
          <DialogFooter><Button variant="outline" onClick={() => setShowFailDialog(false)}>Batal</Button><Button variant="destructive" onClick={confirmFailWithdrawal} disabled={!failureReason.trim()}><XCircle className="h-4 w-4 mr-2" />Tandai Gagal</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2"><Tag className="h-5 w-5" />{selectedCategory ? "Edit Kategori" : "Tambah Kategori Baru"}</DialogTitle>
            <DialogDescription>{selectedCategory ? "Perbarui informasi kategori" : "Isi informasi untuk kategori baru"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 overflow-y-auto flex-1 min-h-0 pr-2">
            <div className="space-y-2"><label className="text-sm font-medium">Nama Kategori <span className="text-red-500">*</span></label><Input value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} placeholder="Contoh: Elektronik" /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Tipe</label><Select value={categoryForm.type} onValueChange={(value: "barang" | "jasa") => setCategoryForm({ ...categoryForm, type: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="barang">Barang</SelectItem><SelectItem value="jasa">Jasa</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><div className="flex items-center gap-2"><label className="text-sm font-medium">Deskripsi</label><span className="text-xs text-muted-foreground">(Opsional)</span></div><textarea value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} placeholder="Contoh: Kategori untuk barang-barang elektronik seperti HP, laptop, kamera, dll" className="w-full min-h-[80px] px-3 py-2 text-sm border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500" /><p className="text-xs text-muted-foreground flex items-start gap-1"><AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />Deskripsi akan ditampilkan sebagai tooltip saat user hover di kategori, membantu user memahami isi kategori.</p></div>
            <div className="space-y-2"><label className="text-sm font-medium">Urutan Tampil</label><Input type="number" value={categoryForm.sortOrder} onChange={(e) => setCategoryForm({ ...categoryForm, sortOrder: parseInt(e.target.value) || 0 })} min={1} className="w-24" /><p className="text-xs text-muted-foreground">Semakin kecil angka, semakin awal kategori ditampilkan</p></div>
            <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50 dark:bg-slate-800/50"><div><label className="text-sm font-medium">Status Aktif</label><p className="text-xs text-muted-foreground">Kategori nonaktif tidak akan ditampilkan ke user</p></div><Switch checked={categoryForm.isActive} onCheckedChange={(checked) => setCategoryForm({ ...categoryForm, isActive: checked })} /></div>
          </div>
          <DialogFooter className="flex-shrink-0 border-t pt-4"><Button variant="outline" onClick={() => setShowCategoryDialog(false)}>Batal</Button><Button onClick={handleSaveCategory} disabled={!categoryForm.name.trim()}>{selectedCategory ? "Simpan Perubahan" : "Tambah Kategori"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteCategoryDialog} onOpenChange={setShowDeleteCategoryDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-red-600"><Trash2 className="h-5 w-5" />Hapus Kategori</DialogTitle><DialogDescription>Apakah Anda yakin ingin menghapus kategori "{categoryToDelete?.name}"?</DialogDescription></DialogHeader>
          <div className="py-4"><div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"><div className="flex items-start gap-3"><AlertCircle className="h-5 w-5 text-red-600 mt-0.5" /><div><p className="font-medium text-red-700 dark:text-red-300">Perhatian!</p><p className="text-sm text-red-600 dark:text-red-400 mt-1">Tindakan ini tidak dapat dibatalkan.</p></div></div></div></div>
          <DialogFooter><Button variant="outline" onClick={() => setShowDeleteCategoryDialog(false)}>Batal</Button><Button variant="destructive" onClick={confirmDeleteCategory}><Trash2 className="h-4 w-4 mr-2" />Hapus</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCancelApproveDialog} onOpenChange={setShowCancelApproveDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-primary-600"><CheckCircle2 className="h-5 w-5" />Setujui Pembatalan</DialogTitle><DialogDescription>Refund akan dikembalikan ke dompet pembeli secara otomatis.</DialogDescription></DialogHeader>
          {selectedCancelRequest && <div className="space-y-3"><div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-3"><div className="flex justify-between items-center"><div><p className="text-sm text-muted-foreground">No. Permintaan</p><p className="font-medium">{selectedCancelRequest.requestNumber}</p></div><Badge variant="outline" className="text-amber-600 border-amber-300">Pending</Badge></div></div><div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 space-y-2"><div className="flex justify-between"><span className="text-sm text-muted-foreground">Pemohon</span><span className="font-medium">{selectedCancelRequest.requester.name}</span></div><div className="flex justify-between"><span className="text-sm text-muted-foreground">Order ID</span><span className="font-mono text-sm">{selectedCancelRequest.orderId}</span></div><div className="flex justify-between"><span className="text-sm text-muted-foreground">Alasan</span><span className="text-sm">{cancelReasons.find((r) => r.value === selectedCancelRequest.reason)?.label || selectedCancelRequest.reason}</span></div></div><div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3"><p className="text-sm text-muted-foreground">Jumlah Refund</p><p className="text-2xl font-bold text-blue-600">{formatPrice(selectedCancelRequest.refundAmount)}</p><p className="text-xs text-muted-foreground mt-1">Akan dikembalikan ke dompet pembeli</p></div><div className="space-y-2"><Label htmlFor="cancelApproveNotes">Catatan Admin (Opsional)</Label><Textarea id="cancelApproveNotes" placeholder="Tambahkan catatan untuk pembeli..." value={cancelApproveNotes} onChange={(e) => setCancelApproveNotes(e.target.value)} rows={3} /></div></div>}
          <DialogFooter><Button variant="outline" onClick={() => setShowCancelApproveDialog(false)}>Batal</Button><Button className="bg-primary-600 hover:bg-primary-700" onClick={confirmApproveCancelRequest}><CheckCircle2 className="h-4 w-4 mr-2" />Setujui & Refund</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCancelRejectDialog} onOpenChange={setShowCancelRejectDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-red-600"><XCircle className="h-5 w-5" />Tolak Pembatalan</DialogTitle><DialogDescription>Berikan alasan penolakan kepada pembeli.</DialogDescription></DialogHeader>
          {selectedCancelRequest && <div className="space-y-3"><div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 space-y-2"><div className="flex justify-between"><span className="text-sm text-muted-foreground">No. Permintaan</span><span className="font-mono text-sm">{selectedCancelRequest.requestNumber}</span></div><div className="flex justify-between"><span className="text-sm text-muted-foreground">Pemohon</span><span className="font-medium">{selectedCancelRequest.requester.name}</span></div><div className="flex justify-between"><span className="text-sm text-muted-foreground">Jumlah Refund</span><span className="font-medium">{formatPrice(selectedCancelRequest.refundAmount)}</span></div></div><div className="space-y-2"><Label htmlFor="cancelRejectReason">Alasan Penolakan *</Label><Textarea id="cancelRejectReason" placeholder="Jelaskan alasan penolakan permintaan pembatalan ini..." value={cancelRejectReasonInput} onChange={(e) => setCancelRejectReasonInput(e.target.value)} rows={3} /></div><div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3"><div className="flex items-start gap-2"><AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" /><p className="text-sm text-amber-700 dark:text-amber-300">Pembeli akan menerima notifikasi penolakan dengan alasan yang Anda berikan.</p></div></div></div>}
          <DialogFooter><Button variant="outline" onClick={() => setShowCancelRejectDialog(false)}>Batal</Button><Button variant="destructive" onClick={confirmRejectCancelRequest} disabled={!cancelRejectReasonInput.trim()}><XCircle className="h-4 w-4 mr-2" />Tolak Permintaan</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
