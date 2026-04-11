import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProductDetailLoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (page: string, productId?: string) => void;
}

export default function ProductDetailLoginDialog({
  open,
  onOpenChange,
  onNavigate,
}: ProductDetailLoginDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Login Diperlukan</DialogTitle>
          <DialogDescription>
            Kamu harus login terlebih dahulu untuk melakukan tindakan ini.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={() => onNavigate("login")} className="bg-primary-600 hover:bg-primary-700">
            Login
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
