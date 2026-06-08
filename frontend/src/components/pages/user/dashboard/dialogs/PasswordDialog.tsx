import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, Eye, EyeOff, Loader2 } from "lucide-react"
import type { NavigateFn } from "@/app/navigation/types"

export type PasswordForm = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export type PasswordValidations = {
  minLength: boolean
  hasNumber: boolean
  hasLowercase: boolean
  hasUppercase: boolean
}

interface Props {
  showPasswordDialog: boolean
  setShowPasswordDialog: (open: boolean) => void
  showCurrentPassword: boolean
  setShowCurrentPassword: (v: boolean) => void
  showNewPassword: boolean
  setShowNewPassword: (v: boolean) => void
  showConfirmPassword: boolean
  setShowConfirmPassword: (v: boolean) => void
  passwordForm: PasswordForm
  setPasswordForm: (form: PasswordForm) => void
  passwordValidations: PasswordValidations
  isPasswordValid: boolean
  passwordError: string
  handleChangePassword: () => Promise<void>
  isLoadingPassword?: boolean
  onNavigate?: NavigateFn
  currentUserEmail?: string
}

export function PasswordDialog({
  showPasswordDialog,
  setShowPasswordDialog,
  showCurrentPassword,
  setShowCurrentPassword,
  showNewPassword,
  setShowNewPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  passwordForm,
  setPasswordForm,
  passwordValidations,
  isPasswordValid,
  passwordError,
  handleChangePassword,
  isLoadingPassword = false,
  onNavigate,
  currentUserEmail
}: Props) {
  return (
    <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ubah Password</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Password Saat Ini</Label>
            <div className="relative">
              <Input type={showCurrentPassword ? "text" : "password"} value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} placeholder="Masukkan password saat ini" />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>{showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
            </div>
          </div>
          <div>
            <Label>Password Baru</Label>
            <div className="relative">
              <Input type={showNewPassword ? "text" : "password"} value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} placeholder="Masukkan password baru" />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowNewPassword(!showNewPassword)}>{showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
            </div>
            <div className="mt-3 space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Password harus memenuhi syarat:</p>
              <div className="grid grid-cols-2 gap-2">
                <div className={`flex items-center gap-2 text-xs transition-colors ${passwordValidations.minLength ? "text-primary-600" : "text-muted-foreground"}`}><div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordValidations.minLength ? "bg-primary-100" : "bg-slate-100"}`}>{passwordValidations.minLength ? <Check className="h-3 w-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />}</div>Minimal 8 karakter</div>
                <div className={`flex items-center gap-2 text-xs transition-colors ${passwordValidations.hasNumber ? "text-primary-600" : "text-muted-foreground"}`}><div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordValidations.hasNumber ? "bg-primary-100" : "bg-slate-100"}`}>{passwordValidations.hasNumber ? <Check className="h-3 w-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />}</div>1 Angka</div>
                <div className={`flex items-center gap-2 text-xs transition-colors ${passwordValidations.hasLowercase ? "text-primary-600" : "text-muted-foreground"}`}><div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordValidations.hasLowercase ? "bg-primary-100" : "bg-slate-100"}`}>{passwordValidations.hasLowercase ? <Check className="h-3 w-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />}</div>1 Huruf kecil</div>
                <div className={`flex items-center gap-2 text-xs transition-colors ${passwordValidations.hasUppercase ? "text-primary-600" : "text-muted-foreground"}`}><div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordValidations.hasUppercase ? "bg-primary-100" : "bg-slate-100"}`}>{passwordValidations.hasUppercase ? <Check className="h-3 w-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />}</div>1 Huruf besar</div>
              </div>
            </div>
          </div>
          <div>
            <Label>Konfirmasi Password</Label>
            <div className="relative">
              <Input type={showConfirmPassword ? "text" : "password"} value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} placeholder="Ulangi password baru" />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
            </div>
            {passwordForm.confirmPassword && passwordForm.newPassword && (
              <p className={`text-xs mt-1 ${passwordForm.confirmPassword === passwordForm.newPassword ? "text-primary-600" : "text-red-500"}`}>
                {passwordForm.confirmPassword === passwordForm.newPassword ? "Password cocok" : "Password tidak cocok"}
              </p>
            )}
          </div>
          {passwordError && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{passwordError}</p>}
        </div>
        <DialogFooter>
          <div className="mr-auto items-start text-left">
            <span className="text-sm text-muted-foreground">Lupa password? </span>
            <Button
              type="button"
              variant="link"
              className="h-auto p-0 text-sm font-medium text-primary-600"
              onClick={() => {
                setShowPasswordDialog(false)
                if (onNavigate) {
                  onNavigate("forgot-password", currentUserEmail ? { forgotPasswordEmail: currentUserEmail, forgotPasswordSource: "settings" } : { forgotPasswordSource: "settings" })
                }
              }}
            >
              Reset disini
            </Button>
          </div>
          <Button variant="outline" onClick={() => setShowPasswordDialog(false)} disabled={isLoadingPassword}>Batal</Button>
          <Button className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed" onClick={handleChangePassword} disabled={!isPasswordValid || passwordForm.newPassword !== passwordForm.confirmPassword || isLoadingPassword}>
            {isLoadingPassword ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            {isLoadingPassword ? "Mengubah..." : "Ubah Password"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
