/**
 * useAppToast — hook wrapper di atas useToast untuk kemudahan pemanggilan.
 *
 * Gunakan ini di seluruh aplikasi:
 *   const { success, error, warning, info } = useAppToast();
 *   success("Produk berhasil ditambahkan ke keranjang");
 *   error("Gagal memuat data", "Pesan detail dari backend");
 */

import * as React from "react"
import { useToast } from "@/hooks/use-toast"

export function useAppToast() {
  const { toast } = useToast()

  const success = React.useCallback((title: string, description?: string) =>
    toast({ variant: "success", title, description }), [toast])

  const error = React.useCallback((title: string, description?: string) =>
    toast({ variant: "destructive", title, description }), [toast])

  const warning = React.useCallback((title: string, description?: string) =>
    toast({ variant: "warning", title, description }), [toast])

  const info = React.useCallback((title: string, description?: string) =>
    toast({ variant: "info", title, description }), [toast])

  return React.useMemo(() => ({ success, error, warning, info, toast }), [success, error, warning, info, toast])
}

/**
 * Versi non-hook (untuk dipakai di luar komponen React, misal di hooks/utils).
 * Import langsung: import { appToast } from "@/hooks/use-app-toast"
 */
import { toast as rawToast } from "@/hooks/use-toast"

export const appToast = {
  success: (title: string, description?: string) =>
    rawToast({ variant: "success", title, description }),

  error: (title: string, description?: string) =>
    rawToast({ variant: "destructive", title, description }),

  warning: (title: string, description?: string) =>
    rawToast({ variant: "warning", title, description }),

  info: (title: string, description?: string) =>
    rawToast({ variant: "info", title, description }),
}