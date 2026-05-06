import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, Check } from "lucide-react";

interface ForgotPasswordResetStepProps {
  newPassword: string;
  confirmPassword: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
  passwordError: string;
  isResettingPassword: boolean;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onToggleShowPassword: () => void;
  onToggleShowConfirmPassword: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ForgotPasswordResetStep({
  newPassword,
  confirmPassword,
  showPassword,
  showConfirmPassword,
  passwordError,
  isResettingPassword,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onToggleShowPassword,
  onToggleShowConfirmPassword,
  onSubmit,
}: ForgotPasswordResetStepProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="newPassword">Password Baru</Label>
        <div className="relative">
          <Input
            id="newPassword"
            type={showPassword ? "text" : "password"}
            placeholder="Minimal 8 karakter"
            className={`pr-10 ${passwordError && newPassword ? "border-destructive focus-visible:ring-destructive" : ""}`}
            value={newPassword}
            onChange={(e) => onNewPasswordChange(e.target.value)}
            disabled={isResettingPassword}
          />
          <button
            type="button"
            onClick={onToggleShowPassword}
            title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {newPassword && (
          <div className="mt-3 space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Password harus memenuhi syarat:</p>
            <div className="grid grid-cols-2 gap-2">
              <div className={`flex items-center gap-2 text-xs transition-colors ${newPassword.length >= 8 ? "text-primary-600" : "text-muted-foreground"}`}>
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${newPassword.length >= 8 ? "bg-primary-100" : "bg-slate-100"}`}>
                  {newPassword.length >= 8 ? <Check className="h-3 w-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
                </div>
                Minimal 8 karakter
              </div>
              <div className={`flex items-center gap-2 text-xs transition-colors ${/[0-9]/.test(newPassword) ? "text-primary-600" : "text-muted-foreground"}`}>
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${/[0-9]/.test(newPassword) ? "bg-primary-100" : "bg-slate-100"}`}>
                  {/[0-9]/.test(newPassword) ? <Check className="h-3 w-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
                </div>
                1 Angka
              </div>
              <div className={`flex items-center gap-2 text-xs transition-colors ${/[a-z]/.test(newPassword) ? "text-primary-600" : "text-muted-foreground"}`}>
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${/[a-z]/.test(newPassword) ? "bg-primary-100" : "bg-slate-100"}`}>
                  {/[a-z]/.test(newPassword) ? <Check className="h-3 w-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
                </div>
                1 Huruf kecil
              </div>
              <div className={`flex items-center gap-2 text-xs transition-colors ${/[A-Z]/.test(newPassword) ? "text-primary-600" : "text-muted-foreground"}`}>
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${/[A-Z]/.test(newPassword) ? "bg-primary-100" : "bg-slate-100"}`}>
                  {/[A-Z]/.test(newPassword) ? <Check className="h-3 w-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
                </div>
                1 Huruf besar
              </div>
            </div>
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
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
            disabled={isResettingPassword}
          />
          <button
            type="button"
            onClick={onToggleShowConfirmPassword}
            title={showConfirmPassword ? "Sembunyikan konfirmasi password" : "Tampilkan konfirmasi password"}
            aria-label={showConfirmPassword ? "Sembunyikan konfirmasi password" : "Tampilkan konfirmasi password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {confirmPassword && newPassword && confirmPassword !== newPassword && (
          <p className="text-sm text-destructive">Password tidak cocok</p>
        )}
      </div>

      {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}

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
  );
}
