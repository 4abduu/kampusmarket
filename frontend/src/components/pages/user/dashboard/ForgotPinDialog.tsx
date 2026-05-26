"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AlertCircle, Loader2, ShieldCheck, Lock, Mail, Key } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";
import { usePinMasking } from "@/hooks/usePinMasking";

interface ForgotPinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

type Step = "email" | "otp" | "new-pin" | "success";

const OTP_EXPIRATION_SECONDS = 10 * 60;

function formatCountdownValue(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function ForgotPinDialog({
  open,
  onOpenChange,
  onSuccess,
}: ForgotPinDialogProps) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPin, setNewPin] = useState(["", "", "", "", "", ""]);
  const [confirmPin, setConfirmPin] = useState(["", "", "", "", "", ""]);

  const newPinMask = usePinMasking(500);
  const confirmPinMask = usePinMasking(500);

  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResettingPin, setIsResettingPin] = useState(false);

  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(OTP_EXPIRATION_SECONDS);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Initialize email from user profile
  useEffect(() => {
    if (!open) return;

    const fetchEmail = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          credentials: "include",
          headers: { Accept: "application/json" },
        });
        const data = await response.json();
        if (data.data?.email) {
          setEmail(data.data.email);
        } else if (data.email) {
          setEmail(data.email);
        }
      } catch (err) {
        console.error("Failed to fetch user email:", err);
      }
    };

    fetchEmail();
  }, [open]);

  // Timers for OTP expiry (10m) and resend cooldown
  useEffect(() => {
    if (step !== "otp") return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });

      setResendCooldown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step]);

  // PIN change handlers
  const handleNewPinChange = (index: number, value: string) => {
    const val = value.replace(/\D/g, "");
    const arr = [...newPin];
    arr[index] = val;
    setNewPin(arr);
    setError("");

    if (val) {
      if (index < 5) {
        newPinMask.hideDigit(index);
        document.getElementById(`new-pin-${index + 1}`)?.focus();
      } else {
        newPinMask.showDigit(index);
      }
    } else {
      newPinMask.hideDigit(index);
    }
  };

  const handleConfirmPinChange = (index: number, value: string) => {
    const val = value.replace(/\D/g, "");
    const arr = [...confirmPin];
    arr[index] = val;
    setConfirmPin(arr);
    setError("");

    if (val) {
      if (index < 5) {
        confirmPinMask.hideDigit(index);
        document.getElementById(`confirm-pin-${index + 1}`)?.focus();
      } else {
        confirmPinMask.showDigit(index);
      }
    } else {
      confirmPinMask.hideDigit(index);
    }
  };

  const handleNewPinKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      newPinMask.hideDigit(index);
      if (!newPin[index] && index > 0) {
        document.getElementById(`new-pin-${index - 1}`)?.focus();
      }
    }
  };

  const handleConfirmPinKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      confirmPinMask.hideDigit(index);
      if (!confirmPin[index] && index > 0) {
        document.getElementById(`confirm-pin-${index - 1}`)?.focus();
      }
    }
  };

  const handleSendOtp = async () => {
    setError("");
    setIsSendingOtp(true);

    try {
      const response = await fetch(`${API_BASE_URL}/wallet/forgot-pin`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Gagal mengirim kode OTP");
        return;
      }

      if (data.data?.email) {
        setEmail(data.data.email);
      }

      setStep("otp");
      setCountdown(OTP_EXPIRATION_SECONDS);
      setResendCooldown(60);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    setError("");
    setOtp(["", "", "", "", "", ""]);
    setIsSendingOtp(true);

    try {
      const response = await fetch(`${API_BASE_URL}/wallet/forgot-pin`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429 && data.data?.resendCooldownSeconds) {
          setResendCooldown(data.data.resendCooldownSeconds);
          setCanResend(false);
        }
        setError(data.message || "Gagal mengirim kode OTP");
        return;
      }

      if (data.data?.email) {
        setEmail(data.data.email);
      }

      if (data.data?.resendCooldownSeconds) {
        setResendCooldown(data.data.resendCooldownSeconds);
      } else {
        setResendCooldown(60);
      }

      setCountdown(OTP_EXPIRATION_SECONDS);
      setCanResend(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Auto-submit when OTP complete
  useEffect(() => {
    if (step !== "otp") return;
    if (!otp.every(d => d !== "")) return;
    if (isVerifyingOtp) return;
    if (error) return; // Prevent looping if OTP is wrong

    const timer = setTimeout(() => {
      handleVerifyOtp();
    }, 300);
    return () => clearTimeout(timer);
  }, [step, otp, isVerifyingOtp, error]);

  const handleVerifyOtp = async () => {
    const otpStr = otp.join("");
    if (otpStr.length !== 6) {
      setError("Kode OTP harus 6 digit");
      return;
    }

    setError("");
    setIsVerifyingOtp(true);

    try {
      const response = await fetch(`${API_BASE_URL}/wallet/verify-otp`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ otp: otpStr }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Kode OTP tidak valid");
        return;
      }

      setStep("new-pin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const newPinStr = newPin.join("");
    const confirmPinStr = confirmPin.join("");
    const otpStr = otp.join("");

    if (newPinStr.length !== 6) {
      setError("PIN baru harus 6 digit");
      return;
    }

    if (confirmPinStr.length !== 6) {
      setError("Konfirmasi PIN harus 6 digit");
      return;
    }

    if (newPinStr !== confirmPinStr) {
      setError("Konfirmasi PIN tidak cocok");
      return;
    }

    setIsResettingPin(true);

    try {
      const response = await fetch(`${API_BASE_URL}/wallet/reset-pin`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          otp: otpStr,
          pin: newPinStr,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Gagal mereset PIN");
        return;
      }

      window.dispatchEvent(new CustomEvent("wallet-pin-updated"));
      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsResettingPin(false);
    }
  };

  const handleClose = () => {
    if (step === "success") {
      onSuccess();
    }
    onOpenChange(false);
    setStep("email");
    setOtp(["", "", "", "", "", ""]);
    setNewPin(["", "", "", "", "", ""]);
    setConfirmPin(["", "", "", "", "", ""]);
    setError("");
    setCountdown(OTP_EXPIRATION_SECONDS);
    newPinMask.hideAll();
    confirmPinMask.hideAll();
  };

  const formatCountdown = useCallback((seconds: number) => formatCountdownValue(seconds), []);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-2">
            {step === "email" && (
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-secondary-600">
                <Mail className="h-7 w-7 text-white" />
              </div>
            )}
            {step === "otp" && (
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
                <Key className="h-7 w-7 text-white" />
              </div>
            )}
            {step === "new-pin" && (
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-secondary-600">
                <Lock className="h-7 w-7 text-white" />
              </div>
            )}
          </div>
          <DialogTitle className="text-2xl text-center">
            {step === "email" && "Reset PIN Wallet"}
            {step === "otp" && "Verifikasi OTP"}
            {step === "new-pin" && "Buat PIN Baru"}
            {step === "success" && "Berhasil!"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {step === "email" && "Kami akan mengirim kode OTP ke email terdaftar Anda"}
            {step === "otp" && `Kode OTP telah dikirim ke email ${email}`}
            {step === "new-pin" && "Atur PIN Wallet baru Anda untuk melanjutkan transaksi"}
            {step === "success" && "PIN Wallet Anda berhasil direset"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 text-sm">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Email Step */}
          {step === "email" && (
            <div className="space-y-4">
              <div className="space-y-1">
                <Label>Email Terdaftar</Label>
                <Input
                  value={email || "Memuat email..."}
                  readOnly
                  className="bg-slate-50 dark:bg-slate-800 text-muted-foreground cursor-not-allowed"
                />
              </div>
              <Button
                onClick={handleSendOtp}
                disabled={isSendingOtp || !email}
                className="w-full bg-primary-600 hover:bg-primary-700"
              >
                {isSendingOtp ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mengirim OTP...
                  </>
                ) : (
                  "Kirim Kode OTP"
                )}
              </Button>
            </div>
          )}

          {/* OTP Step */}
          {step === "otp" && (
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              <div className="space-y-3">
                <Label className="text-center block">Masukkan Kode OTP (6 digit)</Label>
                <div className="flex justify-center gap-2">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      id={`forgot-otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "")
                        const newArray = [...otp]
                        newArray[index] = val
                        setOtp(newArray)
                        setError("")
                        if (val && index < 5) {
                          document.getElementById(`forgot-otp-${index + 1}`)?.focus()
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace" && !otp[index] && index > 0) {
                          document.getElementById(`forgot-otp-${index - 1}`)?.focus()
                        }
                      }}
                      className="w-10 h-12 text-center text-lg font-bold"
                      disabled={isVerifyingOtp}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
              </div>

              {/* Countdown & Resend */}
              <div className="text-center text-sm space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                {countdown > 0 ? (
                  <p className="text-muted-foreground text-xs">
                    Kode OTP berlaku selama: <span className="font-semibold text-slate-800 dark:text-slate-200">{formatCountdown(countdown)}</span>
                  </p>
                ) : (
                  <p className="text-red-500 text-xs font-semibold">
                    Kode OTP telah kedaluwarsa. Silakan kirim ulang kode baru.
                  </p>
                )}

                <div>
                  {!canResend ? (
                    <span className="text-muted-foreground text-xs">
                      Kirim ulang dalam {resendCooldown} detik
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isSendingOtp}
                      className="text-primary-600 hover:text-primary-700 hover:underline font-semibold text-xs disabled:opacity-50"
                    >
                      {isSendingOtp ? (
                        <>
                          <Loader2 className="inline h-3 w-3 animate-spin mr-1" />
                          Mengirim...
                        </>
                      ) : (
                        "Kirim Ulang Kode OTP"
                      )}
                    </button>
                  )}
                </div>
              </div>
            </form>
          )}

          {/* New PIN Step */}
          {step === "new-pin" && (
            <form onSubmit={handleResetPin} className="space-y-6">
              {/* Warning Box */}
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Ingat PIN Baru Anda dengan baik!</p>
                  <p className="text-xs mt-1">Gunakan kombinasi angka yang mudah Anda ingat namun sulit ditebak orang lain.</p>
                </div>
              </div>

              {/* New PIN */}
              <div className="space-y-2">
                <Label className="text-center block">PIN Baru (6 digit angka)</Label>
                <div className="flex justify-center gap-2">
                  {newPin.map((digit, index) => (
                    <Input
                      key={index}
                      id={`new-pin-${index}`}
                      type={newPinMask.isVisible(index) ? "text" : "password"}
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleNewPinChange(index, e.target.value)}
                      onKeyDown={(e) => handleNewPinKeyDown(index, e)}
                      onFocus={() => { if (newPin[index]) newPinMask.showDigit(index) }}
                      onBlur={() => newPinMask.hideDigit(index)}
                      className="w-10 h-12 text-center text-lg font-bold"
                      disabled={isResettingPin}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
              </div>

              {/* Confirm PIN */}
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
                      onKeyDown={(e) => handleConfirmPinKeyDown(index, e)}
                      onFocus={() => { if (confirmPin[index]) confirmPinMask.showDigit(index) }}
                      onBlur={() => confirmPinMask.hideDigit(index)}
                      className="w-10 h-12 text-center text-lg font-bold"
                      disabled={isResettingPin}
                    />
                  ))}
                </div>
              </div>

              {/* Info Box */}
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg space-y-2">
                <p className="text-sm font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <ShieldCheck className="h-4 w-4 text-primary-600" />
                  Keamanan PIN Dompet
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-6 list-disc">
                  <li>Jangan bagikan PIN baru Anda kepada siapa pun demi keamanan</li>
                  <li>PIN diperlukan saat menarik dana dan melakukan pembayaran</li>
                </ul>
              </div>

              <Button
                type="submit"
                disabled={isResettingPin || newPin.some(d => d === "") || confirmPin.some(d => d === "")}
                className="w-full bg-primary-600 hover:bg-primary-700 font-medium"
              >
                {isResettingPin ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mereset PIN...
                  </>
                ) : (
                  "Simpan PIN Baru"
                )}
              </Button>
            </form>
          )}

          {/* Success Step */}
          {step === "success" && (
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-950/30 flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                PIN Wallet Anda berhasil direset. Silakan gunakan PIN baru untuk transaksi selanjutnya.
              </p>
              <Button
                onClick={handleClose}
                className="w-full bg-primary-600 hover:bg-primary-700"
              >
                Tutup
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
