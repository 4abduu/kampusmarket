import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, Loader2, Mail } from "lucide-react";

interface ForgotPasswordEmailStepProps {
  email: string;
  emailError: string;
  isSendingOtp: boolean;
  onEmailChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ForgotPasswordEmailStep({
  email,
  emailError,
  isSendingOtp,
  onEmailChange,
  onSubmit,
}: ForgotPasswordEmailStepProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
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
            onChange={(e) => onEmailChange(e.target.value)}
            disabled={isSendingOtp}
          />
        </div>
        {emailError && <p className="text-sm text-destructive">{emailError}</p>}
      </div>

      <Button type="submit" className="w-full bg-primary-600 hover:bg-primary-700" disabled={isSendingOtp || !email.trim()}>
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
  );
}
