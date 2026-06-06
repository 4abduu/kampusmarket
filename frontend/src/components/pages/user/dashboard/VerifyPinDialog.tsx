import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { useState, useEffect } from "react"
import { Loader2, Lock, AlertCircle, ShieldCheck } from "lucide-react"
import ForgotPinDialog from "./ForgotPinDialog"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (pin: string) => void
  isLoading?: boolean
  error?: string
  description?: string
}

export default function VerifyPinDialog({ open, onOpenChange, onSuccess, isLoading, error, description }: Props) {
  const [pin, setPin] = useState("")
  const [internalError, setInternalError] = useState("")
  const [showForgotPin, setShowForgotPin] = useState(false)

  useEffect(() => {
    if (!open) {
      setPin("")
      setInternalError("")
      setShowForgotPin(false)
    }
  }, [open])

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>
    if (pin.length === 6) {
      // Auto-submit when all filled
      timeout = setTimeout(() => onSuccess(pin), 300)
    }
    return () => {
      if (timeout) clearTimeout(timeout)
    }
  }, [pin, onSuccess])

  const handleSubmit = () => {
    if (pin.length !== 6) {
      setInternalError("PIN harus 6 digit")
      return
    }
    onSuccess(pin)
  }

  const displayError = error || internalError

  const handleForgotPinSuccess = () => {
    setShowForgotPin(false)
    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open && !showForgotPin} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-secondary-600">
                <Lock className="h-7 w-7 text-white" />
              </div>
            </div>
            <DialogTitle className="text-2xl text-center">Masukkan PIN</DialogTitle>
            <DialogDescription className="text-center">
              {description || "Masukkan 6 digit PIN Dompet untuk verifikasi"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Error Message */}
            {displayError && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{displayError}</span>
              </div>
            )}

            {/* PIN Input */}
            <div className="space-y-2 flex flex-col items-center">
              <Label className="text-center block">PIN Dompet (6 digit angka)</Label>
              <InputOTP 
                maxLength={6} 
                value={pin} 
                onChange={(val) => {
                  setPin(val)
                  setInternalError("")
                }} 
                disabled={isLoading}
                autoFocus
              >
                <InputOTPGroup className="gap-2">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <InputOTPSlot 
                      key={index} 
                      index={index} 
                      isPassword
                      className="w-10 h-12 text-lg font-bold rounded-md border" 
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>

            {/* Info Box */}
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg space-y-2">
              <p className="text-sm font-medium flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary-600" />
                Keamanan PIN
              </p>
              <ul className="text-xs text-muted-foreground space-y-1 ml-6 list-disc">
                <li>PIN hanya untuk verifikasi, tidak akan disimpan</li>
                <li>Masukkan PIN Anda dengan aman</li>
                <li>Jangan bagikan PIN kepada siapapun</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button 
              className="w-full bg-primary-600 hover:bg-primary-700" 
              onClick={handleSubmit}
              disabled={pin.length < 6 || isLoading}
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Verifikasi
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading} className="flex-1">
                Batal
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setShowForgotPin(true)}
                className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Lupa PIN?
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ForgotPinDialog 
        open={showForgotPin}
        onOpenChange={setShowForgotPin}
        onSuccess={handleForgotPinSuccess}
      />
    </>
  )
}
