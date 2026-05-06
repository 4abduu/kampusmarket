"use client";

import { useCallback, useEffect, useState } from "react";
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
}

export default function ForgotPasswordPage({ onNavigate }: ForgotPasswordPageProps) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
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

  useEffect(() => {
    let expiryTimer: ReturnType<typeof setInterval> | undefined;
    let resendTimer: ReturnType<typeof setInterval> | undefined;

    if (step === "otp" && countdown > 0) {
      expiryTimer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    if (step === "otp" && resendCooldown > 0) {
      resendTimer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (expiryTimer) clearInterval(expiryTimer);
      if (resendTimer) clearInterval(resendTimer);
    };
  }, [step, countdown, resendCooldown]);

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
        setEmailError(data.message || "Gagal mengirim kode OTP");
        setIsSendingOtp(false);
        return;
      }

      setCountdown(OTP_EXPIRATION_SECONDS);
      setResendCooldown(60); // 60 seconds resend cooldown
      setCanResend(false);
      setOtpSent(true);
      setStep("otp");
    } catch (error) {
      setEmailError(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

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
        setOtpError(data.message || "Gagal mengirim ulang kode OTP");
        return;
      }

      setCountdown(OTP_EXPIRATION_SECONDS);
      setResendCooldown(60); // 60 seconds resend cooldown
      setCanResend(false);
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

          {step === "success" && <ForgotPasswordSuccessStep email={email} onNavigate={onNavigate} />}
        </CardContent>

        {step !== "success" && (
          <CardFooter className="flex justify-center">
            <button
              type="button"
              onClick={() => onNavigate("login")}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Login
            </button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
