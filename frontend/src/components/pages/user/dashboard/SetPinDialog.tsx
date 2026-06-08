"use client";

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
}

export default function SetPinDialog({ open, onOpenChange, onSuccess, isLoading }: Props) {
  const [pin, setPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [error, setError] = useState("")
  const [showForgotPin, setShowForgotPin] = useState(false)

  useEffect(() => {
    if (!open) {
      setPin("")
      setConfirmPin("")
      setError("")
      setShowForgotPin(false)
    }
  }, [open])

  useEffect(() => {
    // Auto-submit when both are fully filled
    if (pin.length === 6 && confirmPin.length === 6) {
      if (pin === confirmPin) {
        setTimeout(() => onSuccess(pin), 100)
      } else {
        setError("PIN dan Konfirmasi PIN tidak cocok")
      }
    } else {
      setError("")
    }
  }, [pin, confirmPin, onSuccess])

  const handleSubmit = () => {
    if (pin.length !== 6) {
      setError("PIN harus 6 digit")
      return
    }
    if (confirmPin.length !== 6) {
      setError("Konfirmasi PIN harus 6 digit")
      return
    }
    if (pin !== confirmPin) {
      setError("PIN dan Konfirmasi PIN tidak cocok")
      return
    }

    onSuccess(pin)
  }

  const handleForgotPinSuccess = () => {
    setShowForgotPin(false)
    onOpenChange(false)
  }

  const handleOpenChange = (val: boolean) => {
    if (!val) {
      setPin("")
      setConfirmPin("")
      setError("")
    }
    onOpenChange(val)
  }

  return (
    <>
      <Dialog open={open && !showForgotPin} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-secondary-600">
                <Lock className="h-7 w-7 text-white" />
              </div>
            </div>
            <DialogTitle className="text-2xl text-center">Atur PIN Dompet</DialogTitle>
            <DialogDescription className="text-center">
              Buat 6 digit PIN untuk mengamankan semua transaksi Anda
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Warning Box */}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Ingat PIN Anda dengan baik!</p>
                <p className="text-xs mt-1">Kami tidak bisa membantu jika Anda lupa PIN. Pastikan PIN mudah diingat namun sulit ditebak.</p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* PIN Input */}
            <div className="space-y-2 flex flex-col items-center">
              <Label className="text-center block">PIN Baru (6 digit angka)</Label>
              <InputOTP 
                maxLength={6} 
                value={pin} 
                onChange={setPin} 
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

            {/* Confirm PIN Input */}
            <div className="space-y-2 flex flex-col items-center">
              <Label className="text-center block">Konfirmasi PIN (6 digit angka)</Label>
              <InputOTP 
                maxLength={6} 
                value={confirmPin} 
                onChange={setConfirmPin} 
                disabled={isLoading}
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
                Keamanan PIN Dompet
              </p>
              <ul className="text-xs text-muted-foreground space-y-1 ml-6 list-disc">
                <li>PIN digunakan untuk checkout menggunakan saldo dompet</li>
                <li>PIN juga diperlukan untuk menarik dana dari dompet</li>
                <li>Setiap transaksi memerlukan verifikasi PIN Anda</li>
                <li>Jangan bagikan PIN kepada siapapun</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button 
              className="w-full bg-primary-600 hover:bg-primary-700" 
              onClick={handleSubmit}
              disabled={pin.length < 6 || confirmPin.length < 6 || isLoading}
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Simpan PIN
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading} className="flex-1">
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
