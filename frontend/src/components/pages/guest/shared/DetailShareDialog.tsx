import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Check, Copy, Share2 } from "lucide-react";

interface DetailShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shareUrl: string;
  isCopied: boolean;
  onCopy: () => void;
  title: string;
  description: string;
  inputAriaLabel: string;
  itemTitle?: string;
}

const WhatsAppIcon = () => (
  <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const TelegramIcon = () => (
  <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.944 0C5.344 0 0 5.344 0 12c0 6.656 5.344 12 11.944 12 6.656 0 12-5.344 12-12 0-6.656-5.344-12-12-12zm5.892 8.358l-1.92 9.052c-.135.631-.513.784-1.036.495l-2.924-2.154-1.41 1.358c-.158.158-.293.293-.604.293l.21-2.98 5.424-4.898c.236-.211-.051-.327-.367-.118l-6.702 4.217-2.888-.902c-.628-.198-.64-.627.13-.928l11.284-4.354c.523-.19.98.122.813.918z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const TwitterIcon = () => (
  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

export default function DetailShareDialog({
  open,
  onOpenChange,
  shareUrl,
  isCopied,
  onCopy,
  title,
  description,
  inputAriaLabel,
  itemTitle,
}: DetailShareDialogProps) {
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent((itemTitle ? `${itemTitle}\n` : "") + shareUrl);

  const shareLinks = {
    whatsapp: `https://api.whatsapp.com/send?text=${encodedText}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(itemTitle || "")}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodeURIComponent(itemTitle || "")}`,
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: itemTitle || "KampusMarket",
          text: itemTitle,
          url: shareUrl,
        });
      } catch (err) {
        console.log("Error sharing natively:", err);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-0 bg-slate-100 dark:bg-slate-900 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
          <DialogDescription className="pt-1 text-sm text-slate-500 dark:text-slate-400">
            {description}
          </DialogDescription>
        </DialogHeader>

        {/* Social Media Grid */}
        <div className="flex flex-wrap items-center justify-center gap-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <a
            href={shareLinks.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 group text-slate-700 dark:text-slate-200 transition-colors hover:text-emerald-500"
            title="Bagikan ke WhatsApp"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md transition-all duration-300 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:shadow-lg">
              <WhatsAppIcon />
            </div>
            <span className="text-xs font-semibold">WhatsApp</span>
          </a>

          <a
            href={shareLinks.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 group text-slate-700 dark:text-slate-200 transition-colors hover:text-sky-500"
            title="Bagikan ke Telegram"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-500 text-white shadow-md transition-all duration-300 group-hover:scale-110 group-hover:bg-sky-600 group-hover:shadow-lg">
              <TelegramIcon />
            </div>
            <span className="text-xs font-semibold">Telegram</span>
          </a>

          <a
            href={shareLinks.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 group text-slate-700 dark:text-slate-200 transition-colors hover:text-blue-600"
            title="Bagikan ke Facebook"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-md transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-700 group-hover:shadow-lg">
              <FacebookIcon />
            </div>
            <span className="text-xs font-semibold">Facebook</span>
          </a>

          <a
            href={shareLinks.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 group text-slate-700 dark:text-slate-200 transition-colors hover:text-slate-900 dark:hover:text-white"
            title="Bagikan ke Twitter/X"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white shadow-md transition-all duration-300 group-hover:scale-110 group-hover:bg-slate-900 group-hover:shadow-lg">
              <TwitterIcon />
            </div>
            <span className="text-xs font-semibold">Twitter/X</span>
          </a>

          {canShare && (
            <button
              onClick={handleNativeShare}
              className="flex flex-col items-center gap-1 group text-slate-700 dark:text-slate-200 transition-colors hover:text-slate-600"
              title="Bagikan via Menu Sistem"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-500 text-white shadow-md transition-all duration-300 group-hover:scale-110 group-hover:bg-slate-600 group-hover:shadow-lg">
                <Share2 className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold">Lainnya</span>
            </button>
          )}
        </div>

        {/* URL Input and Copy Button */}
        <div className="rounded-xl bg-slate-200/50 p-3 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <Input
              value={shareUrl}
              readOnly
              className="h-10 border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900 font-mono text-xs text-slate-600 dark:text-slate-300 focus-visible:ring-0 focus-visible:ring-offset-0"
              aria-label={inputAriaLabel}
            />
            <Button className="h-10 min-w-24 bg-emerald-600 text-white hover:bg-emerald-700 font-medium transition-colors shadow-sm" onClick={onCopy}>
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
