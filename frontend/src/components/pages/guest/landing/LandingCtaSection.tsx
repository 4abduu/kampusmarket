import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LandingCtaSectionProps {
  isLoggedIn: boolean;
  onNavigate: (page: string) => void;
}

export default function LandingCtaSection({ isLoggedIn, onNavigate }: LandingCtaSectionProps) {
  if (isLoggedIn) {
    return null;
  }

  return (
    <section className="py-10 sm:py-16 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4">Siap Mulai Berjualan?</h2>
        <p className="text-sm sm:text-base text-primary-100 mb-6 sm:mb-8 max-w-2xl mx-auto">
          Daftar sekarang dan mulai jual barang bekas atau jasa kamu. Gratis tanpa biaya pendaftaran!
        </p>
        <Button
          size="lg"
          variant="secondary"
          className="bg-white text-primary-700 hover:bg-primary-50"
          onClick={() => onNavigate("register")}
        >
          Daftar Gratis
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </section>
  );
}
