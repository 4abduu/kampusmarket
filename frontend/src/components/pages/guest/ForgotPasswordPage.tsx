"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Package } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { mockOtps, type PasswordResetOtp } from "@/lib/mock-data";
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
  const [canResend, setCanResend] = useState(false);
  const [currentOtpData, setCurrentOtpData] = useState<PasswordResetOtp | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;

    if (step === "otp" && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
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
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const newOtp: PasswordResetOtp = {
      id: `otp-${Date.now()}`,
      email,
      otp: "123456",
      expiresAt: new Date(Date.now() + OTP_EXPIRATION_SECONDS * 1000).toISOString(),
      isUsed: false,
      createdAt: new Date().toISOString(),
    };

    setCurrentOtpData(newOtp);
    setCountdown(OTP_EXPIRATION_SECONDS);
    setCanResend(false);
    setOtpSent(true);
    setIsSendingOtp(false);
    setStep("otp");
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    setOtpError("");
    setOtp("");
    setIsSendingOtp(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const newOtp: PasswordResetOtp = {
      id: `otp-${Date.now()}`,
      email,
      otp: "123456",
      expiresAt: new Date(Date.now() + OTP_EXPIRATION_SECONDS * 1000).toISOString(),
      isUsed: false,
      createdAt: new Date().toISOString(),
    };

    setCurrentOtpData(newOtp);
    setCountdown(OTP_EXPIRATION_SECONDS);
    setCanResend(false);
    setIsSendingOtp(false);
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError("");

    if (otp.length !== 6) {
      setOtpError("Kode OTP harus 6 digit");
      return;
    }

    setIsVerifyingOtp(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const validOtp =
      mockOtps.find((o) => o.email === email && o.otp === otp && !o.isUsed) ||
      (currentOtpData && currentOtpData.otp === otp && !currentOtpData.isUsed);

    if (!validOtp && otp !== "123456") {
      setOtpError("Kode OTP tidak valid atau sudah kadaluarsa");
      setIsVerifyingOtp(false);
      return;
    }

    if (countdown === 0) {
      setOtpError("Kode OTP sudah kadaluarsa. Silakan minta kode baru.");
      setIsVerifyingOtp(false);
      return;
    }

    setIsVerifyingOtp(false);
    setStep("reset");
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
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsResettingPassword(false);
    setStep("success");
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
