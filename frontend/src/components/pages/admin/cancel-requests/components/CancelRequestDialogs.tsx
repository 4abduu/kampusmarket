import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import type { CancelRequest } from "@/lib/mock-data";

interface CancelReasonItem {
  value: string;
  label: string;
}

interface CancelRequestDialogsProps {
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
  formatPrice: (value: number) => string;
  cancelReasons: CancelReasonItem[];
}

export default function CancelRequestDialogs({
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
  cancelReasons,
}: CancelRequestDialogsProps) {
  return (
    <>
      {/* 1. Setujui Pembatalan Dialog */}
      <Dialog open={showCancelApproveDialog} onOpenChange={setShowCancelApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary-600">
              <CheckCircle2 className="h-5 w-5" />
              Setujui Pembatalan
            </DialogTitle>
            <DialogDescription>
              Refund akan dikembalikan ke dompet pembeli secara otomatis.
            </DialogDescription>
          </DialogHeader>
          {selectedCancelRequest && (
            <div className="space-y-3">
              <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">No. Permintaan</p>
                    <p className="font-medium">{selectedCancelRequest.requestNumber}</p>
                  </div>
                  <Badge variant="outline" className="text-amber-600 border-amber-300">
                    Pending
                  </Badge>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Pemohon</span>
                  <span className="font-medium">{selectedCancelRequest.requester.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Order ID</span>
                  <span className="font-mono text-sm">{selectedCancelRequest.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Alasan</span>
                  <span className="text-sm">
                    {cancelReasons.find((r) => r.value === selectedCancelRequest.reason)?.label ||
                      selectedCancelRequest.reason}
                  </span>
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-sm text-muted-foreground">Jumlah Refund</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatPrice(selectedCancelRequest.refundAmount)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Akan dikembalikan ke dompet pembeli
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cancelApproveNotes">Catatan Admin (Opsional)</Label>
                <Textarea
                  id="cancelApproveNotes"
                  placeholder="Tambahkan catatan untuk pembeli..."
                  value={cancelApproveNotes}
                  onChange={(e) => setCancelApproveNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCancelApproveDialog(false);
                setCancelApproveNotes("");
              }}
            >
              Batal
            </Button>
            <Button
              className="bg-primary-600 hover:bg-primary-700 text-white"
              onClick={confirmApproveCancelRequest}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Setujui & Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2. Tolak Pembatalan Dialog */}
      <Dialog open={showCancelRejectDialog} onOpenChange={setShowCancelRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              Tolak Pembatalan
            </DialogTitle>
            <DialogDescription>Berikan alasan penolakan kepada pembeli.</DialogDescription>
          </DialogHeader>
          {selectedCancelRequest && (
            <div className="space-y-3">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">No. Permintaan</span>
                  <span className="font-mono text-sm">{selectedCancelRequest.requestNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Pemohon</span>
                  <span className="font-medium">{selectedCancelRequest.requester.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Jumlah Refund</span>
                  <span className="font-medium">
                    {formatPrice(selectedCancelRequest.refundAmount)}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cancelRejectReason">Alasan Penolakan *</Label>
                <Textarea
                  id="cancelRejectReason"
                  placeholder="Jelaskan alasan penolakan permintaan pembatalan ini..."
                  value={cancelRejectReasonInput}
                  onChange={(e) => setCancelRejectReasonInput(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Pembeli akan menerima notifikasi penolakan dengan alasan yang Anda berikan.
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCancelRejectDialog(false);
                setCancelRejectReasonInput("");
              }}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={confirmRejectCancelRequest}
              disabled={!cancelRejectReasonInput.trim()}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Tolak Permintaan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
