import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface ForgotPasswordSuccessStepProps {
  email: string;
  onNavigate: (page: string) => void;
}

export default function ForgotPasswordSuccessStep({ email, onNavigate }: ForgotPasswordSuccessStepProps) {
  return (
    <div className="text-center space-y-4">
      <div className="flex justify-center">
        <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-primary-600 dark:text-primary-400" />
        </div>
      </div>

      <p className="text-muted-foreground">
        Password akun <strong className="text-foreground">{email}</strong> berhasil diubah.
      </p>

      <Button onClick={() => onNavigate("login")} className="w-full bg-primary-600 hover:bg-primary-700">
        Kembali ke Login
      </Button>
    </div>
  );
}
