import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

interface ProfileReviewsTabProps {
  avgRating: number;
  totalReviews: number;
}

function renderStars(rating: number) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= Math.floor(rating)
              ? "fill-yellow-400 text-yellow-400"
              : star - 0.5 <= rating
              ? "fill-yellow-400/50 text-yellow-400"
              : "text-slate-300"
          }`}
        />
      ))}
      <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function ProfileReviewsTab({ avgRating, totalReviews }: ProfileReviewsTabProps) {
  if (totalReviews === 0) {
    return (
      <Card>
        <CardContent className="p-10 text-center">
          <Star className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">Belum ada rating atau ulasan untuk user ini</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-6 mb-6 pb-6 border-b">
          <div className="text-center">
            <p className="text-4xl font-bold">{avgRating.toFixed(1)}</p>
            {renderStars(avgRating)}
            <p className="text-sm text-muted-foreground mt-1">{totalReviews} ulasan</p>
          </div>
          <div className="flex-1 space-y-1">
            {[5, 4, 3, 2, 1].map((star) => {
              const percentage = star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 7 : star === 2 ? 2 : 1;
              const widthClass =
                percentage === 70
                  ? "w-[70%]"
                  : percentage === 20
                  ? "w-[20%]"
                  : percentage === 7
                  ? "w-[7%]"
                  : percentage === 2
                  ? "w-[2%]"
                  : "w-[1%]";
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-sm w-4">{star}</span>
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full bg-yellow-400 rounded-full ${widthClass}`} />
                  </div>
                  <span className="text-xs text-muted-foreground w-8">{percentage}%</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="border-b pb-4 last:border-0">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-slate-100 text-slate-600">R{i}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm">Reviewer {i}</p>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3 w-3 ${
                            star <= 5 - (i % 2) ? "fill-yellow-400 text-yellow-400" : "text-slate-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {i % 2 === 0
                      ? "Barang sesuai deskripsi, pengiriman cepat. Recommended seller!"
                      : "Seller ramah dan fast response. Kualitas barang bagus, sesuai foto."}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {i} hari yang lalu • <span className="text-primary-600">Produk {i}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
