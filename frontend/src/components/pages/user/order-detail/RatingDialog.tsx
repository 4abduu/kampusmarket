"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Star, AlertCircle } from "lucide-react"

export type RatingValue = 1 | 2 | 3 | 4 | 5

interface RatingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (rating: RatingValue, comment: string) => Promise<void>
  productTitle: string
  sellerName: string
  isService?: boolean
  isLoading?: boolean
}

export default function RatingDialog({
  open,
  onOpenChange,
  onSubmit,
  productTitle,
  sellerName,
  isService = false,
  isLoading = false,
}: RatingDialogProps) {
  const [rating, setRating] = useState<RatingValue>(5)
  const [hoverRating, setHoverRating] = useState<RatingValue | null>(null)
  const [comment, setComment] = useState("")

  const handleSubmit = async () => {
    try {
      await onSubmit(rating, comment)
      // Reset form
      setRating(5)
      setComment("")
      onOpenChange(false)
    } catch (error: any) {
      console.error("Failed to submit rating:", error?.message || "Unknown error")
    }
  }

  const displayRating = hoverRating || rating

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Berikan Rating & Ulasan</DialogTitle>
          <DialogDescription>
            Bagikan pengalaman Anda dengan {isService ? "penyedia jasa" : "penjual"} {sellerName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Product Info */}
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900">
            <p className="text-sm text-muted-foreground mb-1">
              {isService ? "Layanan" : "Produk"}
            </p>
            <p className="font-medium line-clamp-2">{productTitle}</p>
          </div>

          {/* Star Rating */}
          <div className="space-y-3">
            <Label>Rating</Label>
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {(Array.from({ length: 5 }) as number[]).map((_, i) => {
                  const starValue = (i + 1) as RatingValue
                  const isFilled = starValue <= displayRating
                  return (
                    <button
                      key={i}
                      type="button"
                      onMouseEnter={() => setHoverRating(starValue)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => setRating(starValue)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          isFilled
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300 dark:text-slate-600"
                        }`}
                      />
                    </button>
                  )
                })}
              </div>
              <span className="text-lg font-semibold">
                {displayRating}/5
              </span>
            </div>

            {/* Rating descriptions */}
            <div className="text-sm text-muted-foreground">
              {displayRating === 5 && "Sangat memuaskan! 😊"}
              {displayRating === 4 && "Baik, tapi ada yang bisa diperbaiki"}
              {displayRating === 3 && "Cukup, sesuai harapan"}
              {displayRating === 2 && "Kurang memuaskan"}
              {displayRating === 1 && "Sangat mengecewakan 😞"}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-3">
            <Label htmlFor="comment">Ulasan (Opsional)</Label>
            <Textarea
              id="comment"
              placeholder={`Ceritakan pengalaman Anda dengan ${isService ? "layanan" : "produk"} ini...${
                isService
                  ? "\n\nContoh: Penyedia sangat responsif, hasil memuaskan, tepat waktu, dll"
                  : "\n\nContoh: Barang sesuai deskripsi, pengiriman cepat, packaging aman, dll"
              }`}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={500}
              className="resize-none"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Deskripsi pengalaman Anda membantu pembeli lain</span>
              <span>{comment.length}/500</span>
            </div>
          </div>

          {/* Info */}
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              Rating Anda membantu {isService ? "penyedia jasa" : "penjual"} meningkatkan kualitas layanan
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-primary-600 hover:bg-primary-700"
          >
            {isLoading ? "Mengirim..." : "Kirim Rating"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
