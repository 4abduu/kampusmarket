"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Mail,
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import {
  EMAIL_VERIFICATION_CODE_LENGTH,
  maskEmail,
} from "@/components/pages/guest/email-verification/emailVerification.utils";
import { API_BASE_URL } from "@/lib/config";
import type { NavigateFn } from "@/app/navigation/types";

const EMAIL_VERIFICATION_OTP_TTL_SECONDS = 10 * 60;

function getEmailVerificationOtpStorageKey(email: string, source: string) {
  return `email-verification-otp:${source}:${email.trim().toLowerCase()}`;
}

interface EmailVerificationPageProps {
  onNavigate: NavigateFn;
  email?: string;
  source?: "register" | "settings" | "forgot-password";
  onVerified?: () => void;
}

export default function EmailVerificationPage({
  onNavigate,
  email = "user@email.com",
  source = "register",
  onVerified
}: EmailVerificationPageProps) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState(email);

  useEffect(() => {
    if (!email || email === "user@email.com") return;

    setUserEmail(email);

    const storageKey = getEmailVerificationOtpStorageKey(email, source);
    const lastSentAt = Number(window.sessionStorage.getItem(storageKey) || 0);
    const elapsedSeconds = lastSentAt ? Math.floor((Date.now() - lastSentAt) / 1000) : Number.POSITIVE_INFINITY;

    if (lastSentAt && elapsedSeconds < EMAIL_VERIFICATION_OTP_TTL_SECONDS) {
      setResendCooldown(EMAIL_VERIFICATION_OTP_TTL_SECONDS - elapsedSeconds);
      return;
    }

    void sendVerificationOtp(email);
  }, [email]);

  // Handle input change for OTP
  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only single digit

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError("");

    // Auto-focus next input
    if (value && index < EMAIL_VERIFICATION_CODE_LENGTH - 1) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }

    // Auto-submit when all digits filled
    if (newCode.every(digit => digit !== "") && newCode.join("").length === EMAIL_VERIFICATION_CODE_LENGTH) {
      handleVerify(newCode.join(""));
    }
  };

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Send verification OTP
  const sendVerificationOtp = async (emailToVerify: string = userEmail) => {
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/send-email-verification-otp`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email: emailToVerify }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Gagal mengirim kode verifikasi");
        return;
      }

      window.sessionStorage.setItem(getEmailVerificationOtpStorageKey(emailToVerify, source), String(Date.now()));
      setResendCooldown(EMAIL_VERIFICATION_OTP_TTL_SECONDS);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat mengirim kode");
    }
  };

  // Verify code
  const handleVerify = async (verificationCode?: string) => {
    const codeToVerify = verificationCode || code.join("");
    
    if (codeToVerify.length !== EMAIL_VERIFICATION_CODE_LENGTH) {
      setError("Kode verifikasi harus 6 digit");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-email-with-otp`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ 
          email: userEmail, 
          otp: codeToVerify 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Kode verifikasi salah. Silakan coba lagi.");
        setCode(["", "", "", "", "", ""]);
        document.getElementById("code-0")?.focus();
        setIsVerifying(false);
        return;
      }

      setIsVerified(true);
      setIsVerifying(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat verifikasi");
      setIsVerifying(false);
    }
  };

  // Resend code
  const handleResend = async () => {
    if (resendCooldown > 0) return;

    setIsResending(true);

    await sendVerificationOtp(userEmail);
    
    setIsResending(false);

    // Countdown timer
    const timer = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
      window.sessionStorage.removeItem(getEmailVerificationOtpStorageKey(userEmail, source));

  // Handle continue after verified
  const handleContinue = () => {
    if (onVerified) {
      onVerified();
    } else if (source === "settings") {
      onNavigate("dashboard");
    } else {
      onNavigate("login");
    }
  };

  const continueButtonLabel = source === "settings" ? "Kembali ke Dashboard" : "Lanjut Login";
  const verifiedMessage =
    source === "settings"
      ? "Email kamu sudah aktif. Kembali ke dashboard untuk melanjutkan."
      : "Akun kamu sudah aktif dan siap digunakan. Silakan login untuk melanjutkan.";
  const backButtonLabel = source === "settings" ? "Kembali ke Dashboard" : "Kembali ke Login";

  // Masked email display
  const maskedEmail = maskEmail(userEmail);

  if (isVerified) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 bg-slate-50 dark:bg-slate-900/50">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
                <CheckCircle className="h-8 w-8 text-primary-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">Email Terverifikasi!</h2>
            <p className="text-muted-foreground mb-6">
              {verifiedMessage}
            </p>
            <Button
              className="w-full bg-primary-600 hover:bg-primary-700"
              onClick={handleContinue}
            >
              {continueButtonLabel}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 bg-slate-50 dark:bg-slate-900/50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-secondary-600">
              <Mail className="h-7 w-7 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Verifikasi Email</CardTitle>
          <CardDescription className="text-center">
            Kami telah mengirim kode verifikasi ke
            <br />
            <span className="font-medium text-foreground">{maskedEmail}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Spam Warning */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Email tidak masuk?</p>
              <p className="text-xs mt-1">Silakan cek folder <strong>Spam</strong> atau <strong>Promosi</strong> di email kamu</p>
            </div>
          </div>

          {/* OTP Input */}
          <div className="space-y-2">
            <Label className="text-center block">Masukkan Kode Verifikasi</Label>
            <div className="flex justify-center gap-2">
              {code.map((digit, index) => (
                <Input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value.replace(/\D/g, ""))}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`w-10 h-12 text-center text-lg font-bold ${
                    error ? "border-red-500" : ""
                  }`}
                  disabled={isVerifying}
                  autoFocus={index === 0}
                />
              ))}
            </div>
            {error && (
              <p className="text-sm text-red-500 text-center flex items-center justify-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {error}
              </p>
            )}
          </div>

          {/* Verify Button */}
          <Button
            className="w-full bg-primary-600 hover:bg-primary-700"
            onClick={() => handleVerify()}
            disabled={code.some(d => d === "") || isVerifying}
          >
            {isVerifying ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Memverifikasi...
              </>
            ) : (
              "Verifikasi"
            )}
          </Button>

          {/* Resend Code */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Tidak menerima kode?
            </p>
            <Button
              variant="outline"
              onClick={handleResend}
              disabled={resendCooldown > 0 || isResending}
            >
              {isResending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Mengirim...
                </>
              ) : resendCooldown > 0 ? (
                `Kirim ulang dalam ${resendCooldown}s`
              ) : (
                "Kirim Ulang Kode"
              )}
            </Button>
          </div>

          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg space-y-2">
            <p className="text-sm font-medium flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary-600" />
              Mengapa perlu verifikasi email?
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 ml-6 list-disc">
              <li>Memastikan email yang didaftarkan valid dan aktif</li>
              <li>Email adalah identitas utama akun kamu (tidak bisa diubah)</li>
              <li>Untuk keamanan dan pemulihan akun</li>
              <li>Mencegah registrasi dengan email orang lain</li>
            </ul>
          </div>

          {/* Back to Login */}
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => onNavigate(source === "settings" ? "dashboard" : "login")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {backButtonLabel}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
