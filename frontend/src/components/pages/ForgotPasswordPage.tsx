"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Package, Mail, ArrowLeft, CheckCircle2, Loader2, Eye, EyeOff, ShieldCheck, KeyRound } from "lucide-react";
import { mockOtps, type PasswordResetOtp } from "@/lib/mock-data";

interface ForgotPasswordPageProps {
  onNavigate: (page: string) => void;
}

type Step = "email" | "otp" | "reset" | "success";

// OTP expiration time in seconds (10 minutes)
const OTP_EXPIRATION_SECONDS = 10 * 60;

export default function ForgotPasswordPage({ onNavigate }: ForgotPasswordPageProps) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Loading states
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  
  // Error states
  const [emailError, setEmailError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  
  // Success states
  const [otpSent, setOtpSent] = useState(false);
  
  // Countdown timer
  const [countdown, setCountdown] = useState(OTP_EXPIRATION_SECONDS);
  const [canResend, setCanResend] = useState(false);
  
  // Current OTP data for validation
  const [currentOtpData, setCurrentOtpData] = useState<PasswordResetOtp | null>(null);

  // Countdown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
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

  // Format countdown to MM:SS
  const formatCountdown = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  // Validate email format
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate password
  const validatePassword = (password: string): string => {
    if (password.length < 8) {
      return "Password minimal 8 karakter";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password harus mengandung huruf besar";
    }
    if (!/[a-z]/.test(password)) {
      return "Password harus mengandung huruf kecil";
    }
    if (!/[0-9]/.test(password)) {
      return "Password harus mengandung angka";
    }
    return "";
  };

  // Step 1: Send OTP
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    
    if (!email.trim()) {
      setEmailError("Email harus diisi");
      return;
    }
    
    if (!validateEmail(email)) {
      setEmailError("Format email tidak valid");
      return;
    }
    
    setIsSendingOtp(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Generate new OTP
    const newOtp: PasswordResetOtp = {
      id: `otp-${Date.now()}`,
      email: email,
      otp: "123456", // In real app, this would be random
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

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return;
    
    setOtpError("");
    setOtp("");
    setIsSendingOtp(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Generate new OTP
    const newOtp: PasswordResetOtp = {
      id: `otp-${Date.now()}`,
      email: email,
      otp: "123456", // In real app, this would be random
      expiresAt: new Date(Date.now() + OTP_EXPIRATION_SECONDS * 1000).toISOString(),
      isUsed: false,
      createdAt: new Date().toISOString(),
    };
    
    setCurrentOtpData(newOtp);
    setCountdown(OTP_EXPIRATION_SECONDS);
    setCanResend(false);
    setIsSendingOtp(false);
  };

  // Step 2: Verify OTP
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError("");
    
    if (otp.length !== 6) {
      setOtpError("Kode OTP harus 6 digit");
      return;
    }
    
    setIsVerifyingOtp(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Check if OTP is valid
    // In real app, this would be an API call
    const validOtp = mockOtps.find(
      (o) => o.email === email && o.otp === otp && !o.isUsed
    ) || (currentOtpData && currentOtpData.otp === otp && !currentOtpData.isUsed);
    
    if (!validOtp && otp !== "123456") {
      setOtpError("Kode OTP tidak valid atau sudah kadaluarsa");
      setIsVerifyingOtp(false);
      return;
    }
    
    // Check if expired
    if (countdown === 0) {
      setOtpError("Kode OTP sudah kadaluarsa. Silakan minta kode baru.");
      setIsVerifyingOtp(false);
      return;
    }
    
    setIsVerifyingOtp(false);
    setStep("reset");
  };

  // Step 3: Reset Password
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    
    const pwdError = validatePassword(newPassword);
    if (pwdError) {
      setPasswordError(pwdError);
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError("Konfirmasi password tidak cocok");
      return;
    }
    
    setIsResettingPassword(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setIsResettingPassword(false);
    setStep("success");
  };

  // Progress indicator
  const getStepNumber = () => {
    switch (step) {
      case "email": return 1;
      case "otp": return 2;
      case "reset": return 3;
      case "success": return 3;
      default: return 1;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case "email": return "Masukkan Email";
      case "otp": return "Verifikasi OTP";
      case "reset": return "Password Baru";
      case "success": return "Berhasil";
      default: return "";
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-secondary-600">
              <Package className="h-7 w-7 text-white" />
            </div>
          </div>
          
          {/* Progress Indicator */}
          {step !== "success" && (
            <div className="flex items-center justify-center gap-2 mb-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                      s < getStepNumber()
                        ? "bg-primary-600 text-white"
                        : s === getStepNumber()
                        ? "bg-primary-600 text-white ring-4 ring-primary-600/20"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {s < getStepNumber() ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      s
                    )}
                  </div>
                  {s < 3 && (
                    <div
                      className={`w-8 h-0.5 ${
                        s < getStepNumber() ? "bg-primary-600" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
          
          <CardTitle className="text-2xl">{getStepTitle()}</CardTitle>
          
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
          
          {step === "reset" && (
            <CardDescription>
              Buat password baru untuk akun kamu
            </CardDescription>
          )}
          
          {step === "success" && (
            <CardDescription>
              Password kamu berhasil direset. Sekarang kamu bisa login dengan password baru.
            </CardDescription>
          )}
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Step 1: Email Input */}
          {step === "email" && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    className={`pl-10 ${emailError ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError("");
                    }}
                    disabled={isSendingOtp}
                  />
                </div>
                {emailError && (
                  <p className="text-sm text-destructive">{emailError}</p>
                )}
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-primary-600 hover:bg-primary-700"
                disabled={isSendingOtp || !email.trim()}
              >
                {isSendingOtp ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mengirim OTP...
                  </>
                ) : (
                  <>
                    <KeyRound className="mr-2 h-4 w-4" />
                    Kirim Kode OTP
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Step 2: OTP Input */}
          {step === "otp" && (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              {/* OTP Success Message */}
              {otpSent && !otpError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-400 text-sm">
                  <ShieldCheck className="h-4 w-4 flex-shrink-0" />
                  <span>Kode OTP berhasil dikirim ke email kamu</span>
                </div>
              )}
              
              <div className="space-y-2">
                <Label>Kode OTP (6 digit)</Label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={(value) => {
                      setOtp(value);
                      setOtpError("");
                    }}
                    disabled={isVerifyingOtp || isSendingOtp}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                {otpError && (
                  <p className="text-sm text-destructive text-center">{otpError}</p>
                )}
              </div>
              
              {/* Countdown Timer */}
              <div className="text-center space-y-2">
                <div className={`text-sm ${countdown === 0 ? "text-destructive" : "text-muted-foreground"}`}>
                  {countdown > 0 ? (
                    <>Kode kadaluarsa dalam <strong>{formatCountdown(countdown)}</strong></>
                  ) : (
                    <strong>Kode sudah kadaluarsa</strong>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Tidak menerima kode?{" "}
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isSendingOtp}
                      className="text-primary-600 hover:text-primary-700 hover:underline font-medium disabled:opacity-50"
                    >
                      {isSendingOtp ? (
                        <>
                          <Loader2 className="inline h-3 w-3 animate-spin mr-1" />
                          Mengirim...
                        </>
                      ) : (
                        "Kirim ulang kode"
                      )}
                    </button>
                  ) : (
                    <span className="text-muted-foreground/50">
                      Kirim ulang dalam {formatCountdown(countdown)}
                    </span>
                  )}
                </p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-primary-600 hover:bg-primary-700"
                disabled={isVerifyingOtp || otp.length !== 6}
              >
                {isVerifyingOtp ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memverifikasi...
                  </>
                ) : (
                  "Verifikasi OTP"
                )}
              </Button>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === "reset" && (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Password Baru</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimal 8 karakter"
                    className={`pr-10 ${passwordError && newPassword ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setPasswordError("");
                    }}
                    disabled={isResettingPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                
                {/* Password strength indicator */}
                {newPassword && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {["uppercase", "lowercase", "number", "length"].map((criteria) => {
                        const isValid = 
                          (criteria === "uppercase" && /[A-Z]/.test(newPassword)) ||
                          (criteria === "lowercase" && /[a-z]/.test(newPassword)) ||
                          (criteria === "number" && /[0-9]/.test(newPassword)) ||
                          (criteria === "length" && newPassword.length >= 8);
                        
                        return (
                          <div
                            key={criteria}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              isValid ? "bg-primary-500" : "bg-muted"
                            }`}
                          />
                        );
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Gunakan 8+ karakter dengan huruf besar, huruf kecil, dan angka
                    </p>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Ulangi password baru"
                    className={`pr-10 ${passwordError && confirmPassword ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setPasswordError("");
                    }}
                    disabled={isResettingPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {confirmPassword && newPassword && confirmPassword !== newPassword && (
                  <p className="text-sm text-destructive">Password tidak cocok</p>
                )}
              </div>
              
              {passwordError && (
                <p className="text-sm text-destructive">{passwordError}</p>
              )}
              
              <Button 
                type="submit" 
                className="w-full bg-primary-600 hover:bg-primary-700"
                disabled={isResettingPassword || !newPassword || !confirmPassword}
              >
                {isResettingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Password Baru"
                )}
              </Button>
            </form>
          )}

          {/* Step 4: Success */}
          {step === "success" && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-primary-600 dark:text-primary-400" />
                </div>
              </div>
              
              <p className="text-muted-foreground">
                Password akun <strong className="text-foreground">{email}</strong> berhasil diubah.
              </p>
              
              <Button
                onClick={() => onNavigate("login")}
                className="w-full bg-primary-600 hover:bg-primary-700"
              >
                Kembali ke Login
              </Button>
            </div>
          )}
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
