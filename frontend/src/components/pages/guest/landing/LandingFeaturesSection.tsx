import { Card } from "@/components/ui/card";
import { landingFeatures } from "@/components/pages/guest/landing/landing.constants";

export default function LandingFeaturesSection() {
  return (
    <section className="py-16 bg-slate-50 dark:bg-slate-800/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Kenapa Pilih KampusMarket?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Fitur-fitur unggulan yang memudahkan transaksi jual beli di lingkungan kampus
          </p>
        </div>

        <div className="flex overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 pb-6 md:pb-0 snap-x snap-mandatory px-4 md:px-0 -mx-4 md:mx-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {landingFeatures.map((feature) => (
            <Card key={feature.title} className="text-center p-6 hover:shadow-md transition-shadow w-[260px] shrink-0 snap-center md:w-auto">
              <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-4">
                <feature.icon className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
