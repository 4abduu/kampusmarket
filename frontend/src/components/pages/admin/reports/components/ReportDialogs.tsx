import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Ban, CheckCircle2, MessageCircle, Package, Briefcase, User as UserIcon, XCircle } from "lucide-react";
import type { Report } from "@/lib/mock-data";

interface ReportDialogsProps {
  showWarningDialog: boolean;
  setShowWarningDialog: (open: boolean) => void;
  showBanReportDialog: boolean;
  setShowBanReportDialog: (open: boolean) => void;
  banReportReason: string;
  setBanReportReason: (r: string) => void;
  selectedReport: Report | null;
  confirmSendWarning: () => void;
  confirmBanFromReport: () => void;
  showResolveReportDialog: boolean;
  setShowResolveReportDialog: (open: boolean) => void;
  showDismissReportDialog: boolean;
  setShowDismissReportDialog: (open: boolean) => void;
  confirmResolveReport: () => void;
  confirmDismissReport: () => void;
}

export default function ReportDialogs({
  showWarningDialog,
  setShowWarningDialog,
  showBanReportDialog,
  setShowBanReportDialog,
  banReportReason,
  setBanReportReason,
  selectedReport,
  confirmSendWarning,
  confirmBanFromReport,
  showResolveReportDialog,
  setShowResolveReportDialog,
  showDismissReportDialog,
  setShowDismissReportDialog,
  confirmResolveReport,
  confirmDismissReport,
}: ReportDialogsProps) {

  const renderReportTypeBadge = (type?: string) => {
    switch (type) {
      case "product":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border border-slate-200 bg-slate-50 text-slate-700 ml-2">
            <Package className="h-3 w-3 mr-1" />
            Barang
          </span>
        );
      case "service":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border border-purple-200 bg-purple-50 text-purple-700 ml-2">
            <Briefcase className="h-3 w-3 mr-1" />
            Jasa
          </span>
        );
      case "account":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border border-emerald-200 bg-emerald-50 text-emerald-700 ml-2">
            <UserIcon className="h-3 w-3 mr-1" />
            Akun
          </span>
        );
      case "chat":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border border-blue-200 bg-blue-50 text-blue-700 ml-2">
            <MessageCircle className="h-3 w-3 mr-1" />
            Chat
          </span>
        );
      default:
        return null;
    }
  };

  const renderReportTargetContext = (report: any) => {
    if (!report) return null;
    switch (report.reportType) {
      case "product":
        return (
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
            <p className="text-sm font-medium mb-1">Produk Dilaporkan:</p>
            <p className="text-sm text-muted-foreground">{report.productTitle || "Produk (Tidak diketahui)"}</p>
          </div>
        );
      case "service":
        return (
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
            <p className="text-sm font-medium mb-1">Layanan Dilaporkan:</p>
            <p className="text-sm text-muted-foreground">{report.productTitle || "Layanan (Tidak diketahui)"}</p>
          </div>
        );
      case "account":
        return (
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
            <p className="text-sm font-medium mb-1">User Dilaporkan:</p>
            <p className="text-sm text-muted-foreground">{report.reportedUser?.name || "User (Tidak diketahui)"}</p>
          </div>
        );
      case "chat":
        return (
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
            <p className="text-sm font-medium mb-1">Pesan yang Dilaporkan:</p>
            {report.chatMessage ? (
              <p className="text-sm text-slate-700 dark:text-slate-300 italic">"{report.chatMessage}"</p>
            ) : (
              <p className="text-sm text-muted-foreground">Percakapan Chat</p>
            )}
            
            {report.chatAttachments && report.chatAttachments.length > 0 && (
              <div className="mt-3 border-t border-slate-200 dark:border-slate-700 pt-3">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                  <MessageCircle className="h-3.5 w-3.5" />
                  Lampiran Gambar Chat:
                </p>
                <div className="flex flex-wrap gap-2">
                  {report.chatAttachments.map((url: string, idx: number) => (
                    <a href={url} target="_blank" rel="noreferrer" key={idx} className="block border border-slate-200 dark:border-slate-700 rounded-md overflow-hidden hover:opacity-90 transition-opacity bg-white dark:bg-slate-900 shadow-sm">
                      <img src={url} alt="Attachment" className="h-20 w-auto object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* 1. Kirim Warning Dialog */}
      <Dialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <MessageCircle className="h-5 w-5" />
              Kirim Warning
            </DialogTitle>
            <DialogDescription>
              Warning akan dikirim ke user yang dilaporkan. User akan menerima notifikasi tentang pelanggaran mereka.
            </DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Tipe Laporan:</p>
                {renderReportTypeBadge(selectedReport.reportType)}
              </div>
              {renderReportTargetContext(selectedReport)}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">Alasan Laporan:</p>
                <p className="text-sm text-amber-700 dark:text-amber-300 font-semibold mb-2">{selectedReport.reason}</p>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1 border-t border-amber-200/50 dark:border-amber-800/50 pt-2 mt-2">Deskripsi Laporan:</p>
                <p className="text-sm text-amber-700 dark:text-amber-300">{selectedReport.description}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                <p className="text-sm text-muted-foreground">User yang dikirim peringatan:</p>
                <p className="font-medium">{selectedReport.reportedUser.name}</p>
                <p className="text-sm text-muted-foreground">{selectedReport.reportedUser.email}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWarningDialog(false)}>
              Batal
            </Button>
            <Button
              className="bg-amber-600 hover:bg-amber-700 text-white"
              onClick={confirmSendWarning}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Kirim Warning
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2. Ban dari Report Dialog */}
      <Dialog open={showBanReportDialog} onOpenChange={(open) => { setShowBanReportDialog(open); if (!open) setBanReportReason(""); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Ban className="h-5 w-5" />
              Blokir User via Laporan
            </DialogTitle>
            <DialogDescription>
              User akan diblokir permanen dan tidak bisa login atau bertransaksi lagi.
            </DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Tipe Laporan:</p>
                {renderReportTypeBadge(selectedReport.reportType)}
              </div>
              {renderReportTargetContext(selectedReport)}
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">Alasan Laporan:</p>
                <p className="text-sm text-red-700 dark:text-red-300 font-semibold mb-2">{selectedReport.reason}</p>
                {selectedReport.description && (
                  <>
                    <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-1 border-t border-red-200/50 dark:border-red-800/50 pt-2 mt-2">Deskripsi Laporan:</p>
                    <p className="text-sm text-red-700 dark:text-red-300">{selectedReport.description}</p>
                  </>
                )}
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                <p className="text-sm text-muted-foreground">User yang akan diblokir:</p>
                <p className="font-medium">{selectedReport.reportedUser.name}</p>
                <p className="text-sm text-muted-foreground">{selectedReport.reportedUser.email}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Alasan Blokir (dikirim ke user)</label>
                <textarea
                  value={banReportReason}
                  onChange={(e) => setBanReportReason(e.target.value)}
                  placeholder="Alasan blokir..."
                  className="w-full min-h-[70px] px-3 py-2 text-sm border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-muted-foreground">Sudah diisi otomatis dari alasan laporan. Anda bisa mengubahnya.</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowBanReportDialog(false); setBanReportReason(""); }}>
              Batal
            </Button>
            <Button variant="destructive" onClick={confirmBanFromReport} disabled={!banReportReason.trim()}>
              <Ban className="h-4 w-4 mr-2" />
              Blokir User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 3. Selesaikan Laporan Dialog */}
      <Dialog open={showResolveReportDialog} onOpenChange={setShowResolveReportDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
              Selesaikan Laporan
            </DialogTitle>
            <DialogDescription>
              Laporan ini akan ditandai sebagai selesai. Pastikan tindakan yang diperlukan sudah dilakukan.
            </DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Tipe Laporan:</p>
                {renderReportTypeBadge(selectedReport.reportType)}
              </div>
              {renderReportTargetContext(selectedReport)}
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200 mb-1">Alasan Laporan:</p>
                <p className="text-sm text-emerald-700 dark:text-emerald-300 font-semibold mb-2">{selectedReport.reason}</p>
                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200 mb-1 border-t border-emerald-200/50 dark:border-emerald-800/50 pt-2 mt-2">Deskripsi Laporan:</p>
                <p className="text-sm text-emerald-700 dark:text-emerald-300">{selectedReport.description}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                <p className="text-sm text-muted-foreground">User yang dilaporkan:</p>
                <p className="font-medium">{selectedReport.reportedUser.name}</p>
                <p className="text-sm text-muted-foreground">{selectedReport.reportedUser.email}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResolveReportDialog(false)}>
              Batal
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={confirmResolveReport}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Selesaikan Laporan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 4. Tolak Laporan Dialog */}
      <Dialog open={showDismissReportDialog} onOpenChange={setShowDismissReportDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600">
              <XCircle className="h-5 w-5" />
              Tolak Laporan
            </DialogTitle>
            <DialogDescription>
              Laporan ini akan ditandai sebagai ditolak dan tidak memerlukan tindakan lebih lanjut. Apakah Anda yakin ingin menolak laporan ini?
            </DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Tipe Laporan:</p>
                {renderReportTypeBadge(selectedReport.reportType)}
              </div>
              {renderReportTargetContext(selectedReport)}
              <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg p-3">
                <p className="text-sm font-medium text-rose-800 dark:text-rose-200 mb-1">Alasan Laporan:</p>
                <p className="text-sm text-rose-700 dark:text-rose-300 font-semibold mb-2">{selectedReport.reason}</p>
                <p className="text-sm font-medium text-rose-800 dark:text-rose-200 mb-1 border-t border-rose-200/50 dark:border-rose-800/50 pt-2 mt-2">Deskripsi Laporan:</p>
                <p className="text-sm text-rose-700 dark:text-rose-300">{selectedReport.description}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                <p className="text-sm text-muted-foreground">User yang dilaporkan:</p>
                <p className="font-medium">{selectedReport.reportedUser.name}</p>
                <p className="text-sm text-muted-foreground">{selectedReport.reportedUser.email}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDismissReportDialog(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={confirmDismissReport}>
              <XCircle className="h-4 w-4 mr-2" />
              Tolak Laporan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
