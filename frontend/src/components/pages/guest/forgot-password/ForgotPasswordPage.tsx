"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Package } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import ForgotPasswordEmailStep from "@/components/pages/guest/forgot-password/ForgotPasswordEmailStep";
import ForgotPasswordOtpStep from "@/components/pages/guest/forgot-password/ForgotPasswordOtpStep";
import ForgotPasswordProgress from "@/components/pages/guest/forgot-password/ForgotPasswordProgress";
import ForgotPasswordResetStep from "@/components/pages/guest/forgot-password/ForgotPasswordResetStep";
import ForgotPasswordSuccessStep from "@/components/pages/guest/forgot-password/ForgotPasswordSuccessStep";
import type { Step } from "@/components/pages/guest/forgot-password/forgotPassword.types";
import {
  OTP_EXPIRATION_SECONDS,
  formatCountdownValue,
  getStepNumber,
  getStepTitle,
  validateEmailFormat,
  validatePasswordStrength,
} from "@/components/pages/guest/forgot-password/forgotPassword.utils";
import { API_BASE_URL } from "@/lib/config";

interface ForgotPasswordPageProps {
  onNavigate: (page: string) => void;
  email?: string;
  source?: "register" | "settings";
}

const FORGOT_PASSWORD_OTP_TTL_SECONDS = OTP_EXPIRATION_SECONDS;

function getForgotPasswordOtpStorageKey(email: string) {
  return `forgot-password-otp:${email.trim().toLowerCase()}`;
}

export default function ForgotPasswordPage({
  onNavigate,
  email: prefilledEmail = "",
  source = "register",
}: ForgotPasswordPageProps) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState(prefilledEmail);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(OTP_EXPIRATION_SECONDS);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const hasAutoSentRef = useRef(false);

  useEffect(() => {
    if (prefilledEmail) {
      setEmail(prefilledEmail);
    }
  }, [prefilledEmail]);

  useEffect(() => {
    if (!prefilledEmail || hasAutoSentRef.current) return;

    const storageKey = getForgotPasswordOtpStorageKey(prefilledEmail);
    const existingSentAt = Number(window.sessionStorage.getItem(storageKey) || 0);
    const now = Date.now();
    const elapsedSeconds = existingSentAt ? Math.floor((now - existingSentAt) / 1000) : Number.POSITIVE_INFINITY;

    if (existingSentAt && elapsedSeconds < FORGOT_PASSWORD_OTP_TTL_SECONDS) {
      hasAutoSentRef.current = true;
      setStep("otp");
      setEmail(prefilledEmail);
      setOtpSent(true);
      setCountdown(FORGOT_PASSWORD_OTP_TTL_SECONDS - elapsedSeconds);
      setResendCooldown(FORGOT_PASSWORD_OTP_TTL_SECONDS - elapsedSeconds);
      setCanResend(false);
      return;
    }

    hasAutoSentRef.current = true;
    void handleEmailSubmit({ preventDefault: () => {} } as React.FormEvent);
  }, [prefilledEmail]);

  useEffect(() => {
    let expiryTimer: ReturnType<typeof setInterval> | undefined;

    if (step === "otp" && countdown > 0) {
      expiryTimer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setResendCooldown(0);
            return 0;
          }
          setResendCooldown(prev - 1);
          return prev - 1;
        });
      }, 1000);
    }

    if (step === "otp" && countdown === 0) {
      setCanResend(true);
    }

    return () => {
      if (expiryTimer) clearInterval(expiryTimer);
    };
  }, [step, countdown]);

  const formatCountdown = useCallback((seconds: number) => formatCountdownValue(seconds), []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");

    if (!email.trim()) {
      setEmailError("Email harus diisi");
      return;
    }

    if (!validateEmailFormat(email)) {
      setEmailError("Format email tidak valid");
      return;
    }

    setIsSendingOtp(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429 && data.data?.resendCooldownSeconds) {
          setResendCooldown(data.data.resendCooldownSeconds);
          setCanResend(false);
          setEmailError(data.message || "Terlalu banyak percobaan");
        } else {
          setEmailError(data.message || "Gagal mengirim kode OTP");
        }
        setIsSendingOtp(false);
        return;
      }

      setCountdown(OTP_EXPIRATION_SECONDS);
      if (data.data?.resendCooldownSeconds) {
        setResendCooldown(data.data.resendCooldownSeconds);
      } else {
        setResendCooldown(60);
      }
      setCanResend(false);
      setOtpSent(true);
      setStep("otp");
      window.sessionStorage.setItem(getForgotPasswordOtpStorageKey(email), String(Date.now()));
    } catch (error) {
      setEmailError(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend || countdown > 0) return;

    setOtpError("");
    setOtp("");
    setIsSendingOtp(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429 && data.data?.resendCooldownSeconds) {
          setResendCooldown(data.data.resendCooldownSeconds);
          setCanResend(false);
          setOtpError(data.message || "Terlalu banyak percobaan");
        } else {
          setOtpError(data.message || "Gagal mengirim ulang kode OTP");
        }
        return;
      }

      setCountdown(OTP_EXPIRATION_SECONDS);
      if (data.data?.resendCooldownSeconds) {
        setResendCooldown(data.data.resendCooldownSeconds);
      } else {
        setResendCooldown(60);
      }
      setCanResend(false);
      window.sessionStorage.setItem(getForgotPasswordOtpStorageKey(email), String(Date.now()));
    } catch (error) {
      setOtpError(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError("");

    if (otp.length !== 6) {
      setOtpError("Kode OTP harus 6 digit");
      return;
    }

    if (!email || !email.trim()) {
      setOtpError("Email tidak ditemukan. Silakan mulai dari awal.");
      return;
    }

    if (countdown === 0) {
      setOtpError("Kode OTP sudah kadaluarsa. Silakan minta kode baru.");
      return;
    }

    setIsVerifyingOtp(true);

    try {
      console.log("[OTP Verify] Sending:", { email, otp }); // Debug log
      
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();
      console.log("[OTP Verify] Response:", response.status, data); // Debug log

      if (!response.ok) {
        setOtpError(data.message || "Kode OTP tidak valid");
        return;
      }

      setStep("reset");
    } catch (error) {
      console.error("[OTP Verify] Error:", error); // Debug log
      setOtpError(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  useEffect(() => {
    if (step !== "otp") return;
    if (otp.length !== 6) return;
    if (isVerifyingOtp || otpError) return;

    void handleOtpSubmit({ preventDefault: () => {} } as React.FormEvent);
  }, [step, otp, isVerifyingOtp, otpError]);

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    const pwdError = validatePasswordStrength(newPassword);
    if (pwdError) {
      setPasswordError(pwdError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Konfirmasi password tidak cocok");
      return;
    }

    setIsResettingPassword(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, otp, password: newPassword, password_confirmation: confirmPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setPasswordError(data.message || "Gagal mereset password");
        return;
      }

      setStep("success");
      window.sessionStorage.removeItem(getForgotPasswordOtpStorageKey(email));
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-secondary-600">
              <Package className="h-7 w-7 text-white" />
            </div>
          </div>

          {step !== "success" && <ForgotPasswordProgress stepNumber={getStepNumber(step)} />}

          <CardTitle className="text-2xl">{getStepTitle(step)}</CardTitle>

          {step === "email" && (
            <CardDescription>
              Masukkan email kamu dan kami akan mengirimkan kode OTP untuk reset password
            </CardDescription>
          )}
          {step === "otp" && (
            <CardDescription>
              Kode OTP telah dikirim ke <strong className="text-foreground">{email}</strong>
            </CardDescription>
          )}
          {step === "reset" && <CardDescription>Buat password baru untuk akun kamu</CardDescription>}
          {step === "success" && (
            <CardDescription>
              Password kamu berhasil direset. Sekarang kamu bisa login dengan password baru.
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {step === "email" && (
            <ForgotPasswordEmailStep
              email={email}
              emailError={emailError}
              isSendingOtp={isSendingOtp}
              onEmailChange={(value) => {
                setEmail(value);
                setEmailError("");
              }}
              onSubmit={handleEmailSubmit}
            />
          )}

          {step === "otp" && (
            <ForgotPasswordOtpStep
              otp={otp}
              otpError={otpError}
              otpSent={otpSent}
              countdown={countdown}
              resendCooldown={resendCooldown}
              canResend={canResend}
              isSendingOtp={isSendingOtp}
              isVerifyingOtp={isVerifyingOtp}
              formatCountdown={formatCountdown}
              onOtpChange={(value) => {
                setOtp(value);
                setOtpError("");
              }}
              onResendOtp={handleResendOtp}
              onSubmit={handleOtpSubmit}
            />
          )}

          {step === "reset" && (
            <ForgotPasswordResetStep
              newPassword={newPassword}
              confirmPassword={confirmPassword}
              showPassword={showPassword}
              showConfirmPassword={showConfirmPassword}
              passwordError={passwordError}
              isResettingPassword={isResettingPassword}
              onNewPasswordChange={(value) => {
                setNewPassword(value);
                setPasswordError("");
              }}
              onConfirmPasswordChange={(value) => {
                setConfirmPassword(value);
                setPasswordError("");
              }}
              onToggleShowPassword={() => setShowPassword((prev) => !prev)}
              onToggleShowConfirmPassword={() => setShowConfirmPassword((prev) => !prev)}
              onSubmit={handleResetSubmit}
            />
          )}

          {step === "success" && <ForgotPasswordSuccessStep email={email} onNavigate={onNavigate} source={source} />}
        </CardContent>

        {step !== "success" && (
          <CardFooter className="flex justify-center">
            <button
              type="button"
              onClick={() => onNavigate(source === "settings" ? "dashboard" : "login")}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {source === "settings" ? "Kembali ke Dashboard" : "Kembali ke Login"}
            </button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
