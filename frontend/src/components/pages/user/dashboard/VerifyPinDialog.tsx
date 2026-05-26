import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { Loader2, Lock, AlertCircle, ShieldCheck } from "lucide-react"
import ForgotPinDialog from "./ForgotPinDialog"
import { usePinMasking } from "@/hooks/usePinMasking"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (pin: string) => void
  isLoading?: boolean
  error?: string
  description?: string
}

export default function VerifyPinDialog({ open, onOpenChange, onSuccess, isLoading, error, description }: Props) {
  const [pin, setPin] = useState(["", "", "", "", "", ""])
  const [internalError, setInternalError] = useState("")
  const [showForgotPin, setShowForgotPin] = useState(false)
  const pinMask = usePinMasking(500)

  useEffect(() => {
    if (!open) {
      setPin(["", "", "", "", "", ""])
      setInternalError("")
      setShowForgotPin(false)
      pinMask.hideAll()
    }
  }, [open])

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) return
    const digit = value.replace(/\D/g, "")
    const newPin = [...pin]
    newPin[index] = digit
    setPin(newPin)
    setInternalError("")

    if (digit) {
      // Show the digit as plaintext first
      pinMask.showDigit(index)
      if (index < 5) {
        // Brief delay so user sees the digit, then move focus (blur will mask it)
        setTimeout(() => {
          document.getElementById(`verify-pin-${index + 1}`)?.focus()
        }, 150)
      }
    } else {
      pinMask.hideDigit(index)
    }

    // Auto-submit when all filled
    if (newPin.every(d => d !== "")) {
      const pinStr = newPin.join("")
      setTimeout(() => onSuccess(pinStr), 300)
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      pinMask.hideDigit(index)
      if (!pin[index] && index > 0) {
        document.getElementById(`verify-pin-${index - 1}`)?.focus()
      }
    }
  }

  const handleFocus = (index: number) => {
    // Show digit as text only if there's a digit and it's the active box
    if (pin[index]) {
      pinMask.showDigit(index)
    }
  }

  const handleBlur = (index: number) => {
    pinMask.hideDigit(index)
  }

  const handleSubmit = () => {
    const pinStr = pin.join("")
    if (pinStr.length !== 6) {
      setInternalError("PIN harus 6 digit")
      return
    }
    onSuccess(pinStr)
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
            <div className="space-y-2">
              <Label className="text-center block">PIN Dompet (6 digit angka)</Label>
              <div className="flex justify-center gap-2">
                {pin.map((digit, index) => (
                  <Input
                    key={index}
                    id={`verify-pin-${index}`}
                    type={pinMask.isVisible(index) ? "text" : "password"}
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onFocus={() => handleFocus(index)}
                    onBlur={() => handleBlur(index)}
                    className="w-10 h-12 text-center text-lg font-bold"
                    disabled={isLoading}
                    autoFocus={index === 0}
                  />
                ))}
              </div>
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
              disabled={pin.some(d => d === "") || isLoading}
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
