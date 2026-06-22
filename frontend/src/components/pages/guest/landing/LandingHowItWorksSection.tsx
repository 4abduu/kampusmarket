import { useState } from "react";
import { Package, Users, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { buyerSteps, sellerSteps } from "@/components/pages/guest/landing/landing.constants";

type Role = "pembeli" | "penjual";

function StepList({
  steps,
  accent,
}: {
  steps: typeof buyerSteps;
  accent: "primary" | "secondary";
}) {
  return (
    <div className="space-y-1">
      {steps.map((item, idx) => (
        <div key={item.step} className="flex gap-4 relative">
          <div className="flex flex-col items-center shrink-0">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 z-10 ${
                accent === "primary"
                  ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400"
                  : "bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-400"
              }`}
            >
              {item.step}
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`w-px flex-1 my-1 ${
                  accent === "primary"
                    ? "bg-primary-200 dark:bg-primary-800"
                    : "bg-secondary-200 dark:bg-secondary-800"
                }`}
              />
            )}
          </div>
          <div className="min-w-0 pb-6 last:pb-0">
            <p className="font-medium">{item.title}</p>
            <p className="text-sm text-muted-foreground">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function LandingHowItWorksSection() {
  const [role, setRole] = useState<Role>("pembeli");
  const mobileSteps = role === "pembeli" ? buyerSteps : sellerSteps;
  const mobileAccent = role === "pembeli" ? "primary" : "secondary";

  return (
    <section id="how-it-works" className="py-10 sm:py-16 bg-slate-50 dark:bg-slate-800/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-3xl font-bold mb-1 sm:mb-2">Cara Kerja</h2>
          <p className="text-xs sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Mudah dan cepat untuk mulai berjualan atau belanja
          </p>
        </div>

        {/* MOBILE — tab toggle, satu kolom. Disembunyikan di md ke atas. */}
        <div className="md:hidden max-w-2xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-full border border-slate-200 dark:border-slate-700 p-1 bg-white dark:bg-slate-900">
              <button
                onClick={() => setRole("pembeli")}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  role === "pembeli"
                    ? "bg-primary-600 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Package className="h-4 w-4" />
                Untuk Pembeli
              </button>
              <button
                onClick={() => setRole("penjual")}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  role === "penjual"
                    ? "bg-gradient-to-r from-secondary-600 to-primary-600 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Wallet className="h-4 w-4" />
                Untuk Penjual
              </button>
            </div>
          </div>

          <StepList steps={mobileSteps} accent={mobileAccent} />
        </div>

        {/* DESKTOP — dua kartu berdampingan, tampil mulai md ke atas. */}
        <div className="hidden md:grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <Card className="min-w-0 overflow-hidden border-primary-200 dark:border-primary-800 p-0">
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 px-6 py-5">
              <h3 className="text-xl font-bold flex items-center gap-3 text-white">
                <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Users className="h-6 w-6" />
                </div>
                Untuk Pembeli
              </h3>
            </div>
            <div className="p-6">
              <StepList steps={buyerSteps} accent="primary" />
            </div>
          </Card>

          <Card className="min-w-0 overflow-hidden border-secondary-200 dark:border-secondary-800 p-0">
            <div className="bg-gradient-to-br from-secondary-600 to-secondary-700 px-6 py-5">
              <h3 className="text-xl font-bold flex items-center gap-3 text-white">
                <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Wallet className="h-6 w-6" />
                </div>
                Untuk Penjual
              </h3>
            </div>
            <div className="p-6">
              <StepList steps={sellerSteps} accent="secondary" />
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
