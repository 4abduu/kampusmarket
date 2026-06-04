import { Loader2 } from "lucide-react";

/**
 * Full-page loading overlay with centered spinner.
 * Used as Suspense fallback and during page transitions.
 */
export default function PageLoadingOverlay({ message }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm transition-all duration-300">
      <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-primary/20" />
          <Loader2 className="absolute inset-0 h-12 w-12 animate-spin text-primary" />
        </div>
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          {message || "Memuat halaman..."}
        </p>
      </div>
    </div>
  );
}
