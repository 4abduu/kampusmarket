import { CheckCircle2 } from "lucide-react";

interface ForgotPasswordProgressProps {
  stepNumber: 1 | 2 | 3;
}

export default function ForgotPasswordProgress({ stepNumber }: ForgotPasswordProgressProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-4">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
              s < stepNumber
                ? "bg-primary-600 text-white"
                : s === stepNumber
                ? "bg-primary-600 text-white ring-4 ring-primary-600/20"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {s < stepNumber ? <CheckCircle2 className="h-4 w-4" /> : s}
          </div>
          {s < 3 && (
            <div className={`w-8 h-0.5 ${s < stepNumber ? "bg-primary-600" : "bg-muted"}`} />
          )}
        </div>
      ))}
    </div>
  );
}
