import { Badge } from "@/components/ui/badge";
import { Heart, Sparkles } from "lucide-react";
import { centToRupiah } from "@/components/pages/user/favorites/favorites.helpers";
import type { FavoriteStats } from "@/components/pages/user/favorites/favorites.types";

interface FavoritesHeaderProps {
  stats: FavoriteStats;
}

export default function FavoritesHeader({ stats }: FavoritesHeaderProps) {
  const statCards = [
    { label: "Disimpan", value: String(stats.totalItems), cls: "text-slate-900 dark:text-slate-50" },
    { label: "Nilai total", value: centToRupiah(stats.totalValue), cls: "text-slate-900 dark:text-slate-50" },
    { label: "Potensi hemat", value: centToRupiah(stats.totalSavings), cls: "text-emerald-600 dark:text-emerald-400" },
    { label: "Rating rata2", value: stats.avgRating.toFixed(1), cls: "text-slate-900 dark:text-slate-50" },
  ];

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50 via-white to-teal-50/40 p-5 sm:p-6 dark:border-primary-900/40 dark:from-primary-950/20 dark:via-slate-900 dark:to-slate-900">
      <div className="flex flex-wrap items-center gap-2">
        <Badge className="bg-primary-600 text-white hover:bg-primary-700">
          <Heart className="mr-1 h-3 w-3 fill-white" />Koleksi Favorit
        </Badge>
        <Badge variant="outline" className="border-teal-200 text-teal-700 dark:border-teal-800 dark:text-teal-400">
          <Sparkles className="mr-1 h-3 w-3" />Disimpan untuk nanti
        </Badge>
      </div>

      <div className="mt-4 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">
            Favorit yang kamu pantau
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Simpan barang dan jasa yang menarik, bandingkan harga, lalu buka detailnya kapan saja.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {statCards.map((card) => (
            <div key={card.label} className="rounded-xl border border-white/60 bg-white/70 px-3.5 py-2.5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{card.label}</p>
              <p className={`mt-0.5 text-lg font-bold ${card.cls}`}>{card.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
