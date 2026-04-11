import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Flag } from "lucide-react";

interface ReportReason {
  id: string;
  label: string;
}

interface ProductDetailReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportReason: string;
  setReportReason: (value: string) => void;
  reportDescription: string;
  setReportDescription: (value: string) => void;
  reportOtherReason: string;
  setReportOtherReason: (value: string) => void;
  reportReasons: ReportReason[];
  onSubmit: () => void;
}

export default function ProductDetailReportDialog({
  open,
  onOpenChange,
  reportReason,
  setReportReason,
  reportDescription,
  setReportDescription,
  reportOtherReason,
  setReportOtherReason,
  reportReasons,
  onSubmit,
}: ProductDetailReportDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-red-600" />
            Laporkan Produk
          </DialogTitle>
          <DialogDescription>Membantu kami untuk menjaga komunitas yang aman dan terpercaya</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-3">
            <Label className="font-medium">Pilih Alasan Laporan</Label>
            <RadioGroup value={reportReason} onValueChange={setReportReason}>
              <div className="space-y-2">
                {reportReasons.map((reason) => (
                  <div key={reason.id} className="flex items-center space-x-2 p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800">
                    <RadioGroupItem value={reason.id} id={reason.id} />
                    <Label htmlFor={reason.id} className="cursor-pointer flex-1 font-normal">{reason.label}</Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {reportReason === "other" && (
            <div className="space-y-2">
              <Label htmlFor="otherReason" className="font-medium text-sm">Jelaskan Alasan Lainnya</Label>
              <Input
                id="otherReason"
                placeholder="Masukkan alasan laporan Anda..."
                value={reportOtherReason}
                onChange={(e) => setReportOtherReason(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="reportDesc" className="font-medium">Deskripsi (*Wajib)</Label>
            <Textarea
              id="reportDesc"
              placeholder="Jelaskan secara detail mengapa Anda ingin melaporkan produk ini..."
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              rows={5}
            />
            <p className="text-xs text-muted-foreground">
              Semakin detail informasi yang Anda berikan, semakin cepat kami bisa menyelesaikan laporan Anda.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button className="bg-red-600 hover:bg-red-700" onClick={onSubmit}>
            <Flag className="h-4 w-4 mr-2" />
            Kirim Laporan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
