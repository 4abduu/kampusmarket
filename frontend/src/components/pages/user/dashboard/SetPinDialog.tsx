"use client";

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
}

export default function SetPinDialog({ open, onOpenChange, onSuccess, isLoading }: Props) {
  const [pin, setPin] = useState(["", "", "", "", "", ""])
  const [confirmPin, setConfirmPin] = useState(["", "", "", "", "", ""])
  const [error, setError] = useState("")
  const [showForgotPin, setShowForgotPin] = useState(false)

  const pinMask = usePinMasking(500)
  const confirmPinMask = usePinMasking(500)

  useEffect(() => {
    if (!open) {
      setPin(["", "", "", "", "", ""])
      setConfirmPin(["", "", "", "", "", ""])
      setError("")
      setShowForgotPin(false)
      pinMask.hideAll()
      confirmPinMask.hideAll()
    }
  }, [open])

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) return
    const digit = value.replace(/\D/g, "")
    const newPin = [...pin]
    newPin[index] = digit
    setPin(newPin)
    setError("")

    if (digit) {
      if (index < 5) {
        pinMask.hideDigit(index)
        document.getElementById(`pin-${index + 1}`)?.focus()
      } else {
        pinMask.showDigit(index)
      }
    } else {
      pinMask.hideDigit(index)
    }
  }

  const handleConfirmPinChange = (index: number, value: string) => {
    if (value.length > 1) return
    const digit = value.replace(/\D/g, "")
    const newConfirmPin = [...confirmPin]
    newConfirmPin[index] = digit
    setConfirmPin(newConfirmPin)
    setError("")

    if (digit) {
      if (index < 5) {
        confirmPinMask.hideDigit(index)
        document.getElementById(`confirm-pin-${index + 1}`)?.focus()
      } else {
        confirmPinMask.showDigit(index)
      }
    } else {
      confirmPinMask.hideDigit(index)
    }

    // Auto-submit when all filled and pins match
    if (
      newConfirmPin.every(d => d !== "") &&
      pin.every(d => d !== "")
    ) {
      const pinStr = pin.join("")
      const confirmStr = newConfirmPin.join("")
      if (pinStr === confirmStr) {
        setTimeout(() => onSuccess(pinStr), 100)
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent, field: "pin" | "confirm") => {
    if (e.key === "Backspace") {
      if (field === "pin") {
        pinMask.hideDigit(index)
        if (!pin[index] && index > 0) {
          document.getElementById(`pin-${index - 1}`)?.focus()
        }
      } else {
        confirmPinMask.hideDigit(index)
        if (!confirmPin[index] && index > 0) {
          document.getElementById(`confirm-pin-${index - 1}`)?.focus()
        }
      }
    }
  }

  const handlePinFocus = (index: number) => {
    if (pin[index]) pinMask.showDigit(index)
  }
  const handlePinBlur = (index: number) => pinMask.hideDigit(index)

  const handleConfirmFocus = (index: number) => {
    if (confirmPin[index]) confirmPinMask.showDigit(index)
  }
  const handleConfirmBlur = (index: number) => confirmPinMask.hideDigit(index)

  const handleSubmit = () => {
    const pinStr = pin.join("")
    const confirmStr = confirmPin.join("")

    if (pinStr.length !== 6) {
      setError("PIN harus 6 digit")
      return
    }
    if (confirmStr.length !== 6) {
      setError("Konfirmasi PIN harus 6 digit")
      return
    }
    if (pinStr !== confirmStr) {
      setError("PIN dan Konfirmasi PIN tidak cocok")
      return
    }

    onSuccess(pinStr)
  }

  const handleForgotPinSuccess = () => {
    setShowForgotPin(false)
    onOpenChange(false)
  }

  const handleOpenChange = (val: boolean) => {
    if (!val) {
      setPin(["", "", "", "", "", ""])
      setConfirmPin(["", "", "", "", "", ""])
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
            <div className="space-y-2">
              <Label className="text-center block">PIN Baru (6 digit angka)</Label>
              <div className="flex justify-center gap-2">
                {pin.map((digit, index) => (
                  <Input
                    key={index}
                    id={`pin-${index}`}
                    type={pinMask.isVisible(index) ? "text" : "password"}
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e, "pin")}
                    onFocus={() => handlePinFocus(index)}
                    onBlur={() => handlePinBlur(index)}
                    className="w-10 h-12 text-center text-lg font-bold"
                    disabled={isLoading}
                    autoFocus={index === 0}
                  />
                ))}
              </div>
            </div>

            {/* Confirm PIN Input */}
            <div className="space-y-2">
              <Label className="text-center block">Konfirmasi PIN (6 digit angka)</Label>
              <div className="flex justify-center gap-2">
                {confirmPin.map((digit, index) => (
                  <Input
                    key={index}
                    id={`confirm-pin-${index}`}
                    type={confirmPinMask.isVisible(index) ? "text" : "password"}
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleConfirmPinChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e, "confirm")}
                    onFocus={() => handleConfirmFocus(index)}
                    onBlur={() => handleConfirmBlur(index)}
                    className="w-10 h-12 text-center text-lg font-bold"
                    disabled={isLoading}
                  />
                ))}
              </div>
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
              disabled={pin.some(d => d === "") || confirmPin.some(d => d === "") || isLoading}
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
