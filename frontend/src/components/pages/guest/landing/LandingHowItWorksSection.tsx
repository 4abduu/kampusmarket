import { Users, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { buyerSteps, sellerSteps } from "@/components/pages/guest/landing/landing.constants";

export default function LandingHowItWorksSection() {
  return (
    <section id="how-it-works" className="py-16 bg-slate-50 dark:bg-slate-800/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 md:mb-4">Cara Kerja</h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">Mudah dan cepat untuk mulai berjualan atau belanja</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 md:gap-8 max-w-5xl mx-auto">
          <Card className="p-4 md:p-6 border-primary-200 dark:border-primary-800">
            <h3 className="text-lg md:text-xl font-bold mb-4 md:mb-6 flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary-600 text-white flex items-center justify-center shrink-0">
                <Users className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              Untuk Pembeli
            </h3>
            <div className="space-y-4">
              {buyerSteps.map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 flex items-center justify-center font-bold shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 md:p-6 border-secondary-200 dark:border-secondary-800">
            <h3 className="text-lg md:text-xl font-bold mb-4 md:mb-6 flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-secondary-600 text-white flex items-center justify-center shrink-0">
                <Wallet className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              Untuk Penjual
            </h3>
            <div className="space-y-4">
              {sellerSteps.map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-400 flex items-center justify-center font-bold shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
