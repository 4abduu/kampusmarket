import { Users, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { buyerSteps, sellerSteps } from "@/components/pages/guest/landing/landing.constants";

export default function LandingHowItWorksSection() {
  return (
    <section id="how-it-works" className="py-16 bg-slate-50 dark:bg-slate-800/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Cara Kerja</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Mudah dan cepat untuk mulai berjualan atau belanja</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <Card className="p-6 border-primary-200 dark:border-primary-800">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary-600 text-white flex items-center justify-center">
                <Users className="h-6 w-6" />
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

          <Card className="p-6 border-secondary-200 dark:border-secondary-800">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-secondary-600 text-white flex items-center justify-center">
                <Wallet className="h-6 w-6" />
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
