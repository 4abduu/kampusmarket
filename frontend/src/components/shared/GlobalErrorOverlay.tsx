"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface GlobalErrorOverlayProps {
  error: string | null;
  onRetry: () => void;
}

export default function GlobalErrorOverlay({ error, onRetry }: GlobalErrorOverlayProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Automatically open the modal when a new error occurs
  useEffect(() => {
    if (error) {
      setIsOpen(true);
    }
  }, [error]);

  if (!error) return null;

  return (
    <>
      {/* The Error Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0">
          <div className="bg-gradient-to-br from-red-50 to-amber-50 dark:from-red-950/40 dark:to-amber-950/40 p-6 flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="absolute inset-0 rounded-full bg-red-200/50 blur-xl dark:bg-red-900/50" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg shadow-red-900/5 dark:bg-slate-900">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
              Koneksi Bermasalah
            </h3>
            
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 max-w-[280px]">
              {error}
            </p>

            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                className="flex-1 bg-white dark:bg-slate-950"
                onClick={() => setIsOpen(false)}
              >
                Tutup
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white gap-2 shadow-md shadow-red-600/20"
                onClick={() => {
                  setIsOpen(false);
                  onRetry();
                }}
              >
                <RefreshCw className="h-4 w-4" />
                Coba Lagi
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* The Floating Action Button (FAB) shown when modal is closed but error persists */}
      {!isOpen && (
        <div className="fixed bottom-20 sm:bottom-8 right-4 sm:right-8 z-50 flex items-center group">
          {/* Tooltip on hover */}
          <div className="absolute right-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="bg-slate-900 text-white text-xs py-1.5 px-3 rounded-lg shadow-lg whitespace-nowrap">
              Lihat pesan error
              {/* Arrow */}
              <div className="absolute top-1/2 -right-1 -translate-y-1/2 border-[5px] border-transparent border-l-slate-900" />
            </div>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-red-500/30 transition-transform hover:scale-110 active:scale-95 animate-bounce"
            aria-label="Tampilkan Error"
          >
            <AlertCircle className="h-6 w-6 sm:h-7 sm:w-7" />
            {/* Ping animation to draw attention */}
            <span className="absolute right-0 top-0 flex h-3.5 w-3.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-300 opacity-75"></span>
              <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-red-400 border-2 border-white dark:border-slate-900"></span>
            </span>
          </button>
        </div>
      )}
    </>
  );
}
