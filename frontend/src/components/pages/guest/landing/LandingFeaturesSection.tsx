import { Card } from "@/components/ui/card";
import { landingFeatures } from "@/components/pages/guest/landing/landing.constants";

export default function LandingFeaturesSection() {
  return (
    <section className="py-16 bg-slate-50 dark:bg-slate-800/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 md:mb-4">Kenapa Pilih KampusMarket?</h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto px-4">
            Fitur-fitur unggulan yang memudahkan transaksi jual beli di lingkungan kampus
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {landingFeatures.map((feature) => (
            <Card key={feature.title} className="text-center p-4 sm:p-6 hover:shadow-md transition-shadow flex flex-col items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-3 sm:mb-4">
                <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-sm sm:text-base mb-1.5 sm:mb-2 leading-tight">{feature.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">{feature.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
