"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"

interface RatingPromptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (rating: number) => void
  productTitle: string
  isService?: boolean
}

export default function RatingPromptDialog({
  open,
  onOpenChange,
  onSubmit,
  productTitle,
  isService = false,
}: RatingPromptDialogProps) {
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState<number | null>(null)

  const displayRating = hoverRating !== null ? hoverRating : rating

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center">Bagaimana Pengalaman Anda?</DialogTitle>
          <DialogDescription className="text-center pt-2">
            Rating untuk {isService ? "layanan" : "produk"} ini
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Product info */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">{isService ? "Penyedia:" : "Produk:"}</p>
            <p className="font-medium line-clamp-2">{productTitle}</p>
          </div>

          {/* Stars */}
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                onMouseEnter={() => setHoverRating(i)}
                onMouseLeave={() => setHoverRating(null)}
                onClick={() => setRating(i)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`h-10 w-10 ${
                    i <= displayRating
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-300 dark:text-slate-600"
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Rating display */}
          <div className="text-center">
            <p className="text-3xl font-bold text-amber-500">{displayRating}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {displayRating === 5 && "Sangat memuaskan!"}
              {displayRating === 4 && "Baik, sangat puas"}
              {displayRating === 3 && "Cukup memuaskan"}
              {displayRating === 2 && "Kurang memuaskan"}
              {displayRating === 1 && "Tidak memuaskan"}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Nanti
          </Button>
          <Button
            className="flex-1 bg-primary-600 hover:bg-primary-700"
            onClick={() => {
              onSubmit(rating)
              onOpenChange(false)
            }}
          >
            Kirim Rating
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
