import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface ForgotPasswordSuccessStepProps {
  email: string;
  onNavigate: (page: string) => void;
  source?: "register" | "settings";
}

export default function ForgotPasswordSuccessStep({ email, onNavigate, source = "register" }: ForgotPasswordSuccessStepProps) {
  const successMessage =
    source === "settings"
      ? `Password akun ${email} berhasil diubah. Kembali ke dashboard untuk melanjutkan.`
      : `Password akun ${email} berhasil diubah. Silakan login lagi dengan password baru.`;
  const actionLabel = source === "settings" ? "Kembali ke Dashboard" : "Kembali ke Login";
  const nextPage = source === "settings" ? "dashboard" : "login";

  return (
    <div className="text-center space-y-4">
      <div className="flex justify-center">
        <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-primary-600 dark:text-primary-400" />
        </div>
      </div>

      <p className="text-muted-foreground">{successMessage}</p>

      <Button onClick={() => onNavigate(nextPage)} className="w-full bg-primary-600 hover:bg-primary-700">
        {actionLabel}
      </Button>
    </div>
  );
}
