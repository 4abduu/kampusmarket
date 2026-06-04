"use client"

import { CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

/** Ikon sesuai variant */
function ToastIcon({ variant }: { variant?: string | null }) {
  const base = "h-4 w-4 shrink-0 mt-0.5"
  switch (variant) {
    case "success":
      return <CheckCircle2 className={`${base} text-green-600 dark:text-green-400`} />
    case "destructive":
      return <XCircle className={`${base} text-red-600 dark:text-red-400`} />
    case "warning":
      return <AlertTriangle className={`${base} text-amber-600 dark:text-amber-400`} />
    case "info":
      return <Info className={`${base} text-blue-600 dark:text-blue-400`} />
    default:
      return null
  }
}

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider swipeDirection="right">
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} {...props} variant={(variant as any) || undefined}>
            <ToastIcon variant={variant} />
            <div className="flex-1 min-w-0">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
              {action && <div className="mt-2">{action}</div>}
            </div>
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
