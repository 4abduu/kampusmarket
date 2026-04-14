import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Check, Copy } from "lucide-react";

interface DetailShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shareUrl: string;
  isCopied: boolean;
  onCopy: () => void;
  title: string;
  description: string;
  inputAriaLabel: string;
}

export default function DetailShareDialog({
  open,
  onOpenChange,
  shareUrl,
  isCopied,
  onCopy,
  title,
  description,
  inputAriaLabel,
}: DetailShareDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-0 bg-slate-100 dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="pt-2 text-base text-slate-600 dark:text-slate-300">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl bg-slate-200/70 p-3 dark:bg-slate-800">
          <div className="flex items-center gap-2">
            <Input
              value={shareUrl}
              readOnly
              className="h-10 border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900"
              aria-label={inputAriaLabel}
            />
            <Button className="h-10 min-w-24 bg-emerald-600 text-white hover:bg-emerald-700" onClick={onCopy}>
              {isCopied ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Tersalin
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  Salin
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
