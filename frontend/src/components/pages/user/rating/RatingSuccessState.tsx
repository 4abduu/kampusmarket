import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

interface RatingSuccessStateProps {
  onNavigate: (page: string) => void;
}

export default function RatingSuccessState({ onNavigate }: RatingSuccessStateProps) {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="p-8">
          <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-10 w-10 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Terima Kasih!</h2>
          <p className="text-muted-foreground mb-6">
            Rating dan ulasan kamu sangat membantu penjual dan pembeli lainnya.
          </p>
          <div className="space-y-3">
            <Button className="w-full bg-primary-600 hover:bg-primary-700" onClick={() => onNavigate("dashboard")}>
              Kembali ke Dashboard
            </Button>
            <Button variant="outline" className="w-full" onClick={() => onNavigate("catalog")}>
              Belanja Lagi
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
