import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";

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
          <div className="space-y-1">
            <div className="flex gap-1">
              {["uppercase", "lowercase", "number", "length"].map((criteria) => {
                const isValid =
                  (criteria === "uppercase" && /[A-Z]/.test(newPassword)) ||
                  (criteria === "lowercase" && /[a-z]/.test(newPassword)) ||
                  (criteria === "number" && /[0-9]/.test(newPassword)) ||
                  (criteria === "length" && newPassword.length >= 8);

                return (
                  <div key={criteria} className={`h-1 flex-1 rounded-full transition-colors ${isValid ? "bg-primary-500" : "bg-muted"}`} />
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">Gunakan 8+ karakter dengan huruf besar, huruf kecil, dan angka</p>
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
