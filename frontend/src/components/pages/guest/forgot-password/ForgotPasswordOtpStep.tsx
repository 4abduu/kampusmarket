import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck, AlertCircle } from "lucide-react";

interface ForgotPasswordOtpStepProps {
  otp: string;
  otpError: string;
  otpSent: boolean;
  countdown: number;
  resendCooldown: number;
  canResend: boolean;
  isSendingOtp: boolean;
  isVerifyingOtp: boolean;
  formatCountdown: (seconds: number) => string;
  onOtpChange: (value: string) => void;
  onResendOtp: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ForgotPasswordOtpStep({
  otp,
  otpError,
  otpSent,
  countdown,
  resendCooldown,
  canResend,
  isSendingOtp,
  isVerifyingOtp,
  formatCountdown,
  onOtpChange,
  onResendOtp,
  onSubmit,
}: ForgotPasswordOtpStepProps) {
  // Check if error is related to OTP sending (network/server error)
  const isSendError = !!(otpError && (
    otpError.includes("gagal dikirim") || 
    otpError.includes("kesalahan") ||
    otpError.includes("server")
  ));

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {otpSent && !otpError && (
        <>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-400 text-sm">
            <ShieldCheck className="h-4 w-4 flex-shrink-0" />
            <span>Kode OTP berhasil dikirim ke email kamu</span>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Email tidak masuk?</p>
              <p className="text-xs mt-1">Silakan cek folder <strong>Spam</strong> atau <strong>Promosi</strong> di email kamu</p>
            </div>
          </div>
        </>
      )}

      {isSendError && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p>{otpError}</p>
            <button
              type="button"
              onClick={onResendOtp}
              disabled={isSendingOtp}
              className="text-red-600 hover:text-red-700 hover:underline font-medium mt-2 text-xs disabled:opacity-50"
            >
              {isSendingOtp ? (
                <>
                  <Loader2 className="inline h-3 w-3 animate-spin mr-1" />
                  Mengirim...
                </>
              ) : (
                "Coba Lagi"
              )}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label>Kode OTP (6 digit)</Label>
        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={onOtpChange}
            disabled={isVerifyingOtp || isSendingOtp || isSendError}
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
        {otpError && !isSendError && <p className="text-sm text-destructive text-center">{otpError}</p>}
      </div>

      <div className="text-center space-y-2">
        <div className={`text-sm ${countdown === 0 ? "text-destructive" : "text-muted-foreground"}`}>
          {countdown > 0 ? (
            <>
              Kode kadaluarsa dalam <strong>{formatCountdown(countdown)}</strong>
            </>
          ) : (
            <strong>Kode sudah kadaluarsa</strong>
          )}
        </div>

        <p className="text-sm text-muted-foreground">
          Tidak menerima kode?{" "}
          {canResend ? (
            <button
              type="button"
              onClick={onResendOtp}
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
            <span className="text-muted-foreground/50">Kirim ulang dalam {formatCountdown(resendCooldown)}</span>
          )}
        </p>
      </div>

      <Button 
        type="submit" 
        className="w-full bg-primary-600 hover:bg-primary-700" 
        disabled={isVerifyingOtp || otp.length !== 6 || isSendError}
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
  );
}
