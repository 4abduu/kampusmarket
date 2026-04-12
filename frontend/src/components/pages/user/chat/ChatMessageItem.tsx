import { Button } from "@/components/ui/button"
import { CheckCheck, ChevronRight, Handshake, Package, Receipt } from "lucide-react"
import type { ChatMessage } from "@/components/pages/user/chat/chat.types"

interface Props {
  message: ChatMessage
  isSellerView: boolean
  formatPrice: (price: number) => string
  onNavigate: (page: string, productId?: string) => void
  onAcceptOffer: (message: ChatMessage) => void
}

export default function ChatMessageItem({
  message,
  isSellerView,
  formatPrice,
  onNavigate,
  onAcceptOffer,
}: Props) {
  return (
    <div className={`flex ${message.isMe ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] sm:max-w-[75%] shadow-sm ${
          message.isMe
            ? "bg-primary-600 text-white rounded-2xl rounded-br-md"
            : "bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 rounded-2xl rounded-bl-md"
        } px-3 sm:px-4 py-2`}
      >
        {message.type === "product" && message.product && (
          <div
            className={`mb-2 rounded-xl overflow-hidden cursor-pointer ${
              message.isMe ? "bg-white/10" : "bg-slate-50 dark:bg-slate-700"
            }`}
            onClick={() => onNavigate("product", message.product!.id)}
          >
            <div className="flex items-center gap-2 p-2">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-200 dark:bg-slate-600 rounded-lg flex items-center justify-center shrink-0">
                <Package className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground/50" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-xs sm:text-sm truncate">{message.product.title}</p>
                <p className={`font-bold text-xs sm:text-sm ${message.isMe ? "text-white" : "text-primary-600"}`}>
                  {formatPrice(message.product.price)}
                </p>
              </div>
              <ChevronRight className={`h-4 w-4 shrink-0 ${message.isMe ? "text-white/70" : "text-muted-foreground"}`} />
            </div>
          </div>
        )}

        {message.type === "nego" && message.product && (
          <div className={`rounded-xl p-3 ${message.isMe ? "bg-white/10" : "bg-amber-50 dark:bg-amber-900/30"}`}>
            <div className="flex items-center gap-2 mb-2 text-xs">
              <Handshake className="h-4 w-4" />
              <span className="font-medium">Ajukan Nego</span>
            </div>
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/20">
              <div className="w-10 h-10 bg-slate-200 dark:bg-slate-600 rounded-lg flex items-center justify-center shrink-0">
                <Package className="h-4 w-4 text-muted-foreground/50" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs truncate">{message.product.title}</p>
                <p className={`text-xs line-through ${message.isMe ? "text-white/60" : "text-muted-foreground"}`}>
                  {formatPrice(message.product.price)}
                </p>
              </div>
            </div>
            <p className="font-bold text-base sm:text-lg">{formatPrice(message.offerPrice || 0)}</p>
            <p className="text-xs opacity-70 mt-1">Harga penawaran</p>
          </div>
        )}

        {message.type === "offer" && message.product && (
          <div className="space-y-2">
            <div className={`rounded-xl p-3 ${message.isMe ? "bg-white/10" : "bg-primary-50 dark:bg-primary-900/30"}`}>
              <div className="flex items-center gap-2 mb-2 text-xs">
                <Receipt className="h-4 w-4" />
                <span className="font-medium">Penawaran Khusus</span>
              </div>
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/20">
                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-600 rounded-lg flex items-center justify-center shrink-0">
                  <Package className="h-4 w-4 text-muted-foreground/50" />
                </div>
                <p className="text-xs truncate">{message.product.title}</p>
              </div>
              <p className="font-bold text-base sm:text-lg">{formatPrice(message.offerPrice || 0)}</p>
              <p className="text-xs opacity-70 mt-1">Klik bayar untuk terima</p>
            </div>
            {!isSellerView && !message.isMe && (
              <div className="flex gap-2">
                <Button size="sm" className="flex-1 bg-primary-600 text-white hover:bg-primary-700" onClick={() => onAcceptOffer(message)}>
                  Terima
                </Button>
                <Button size="sm" variant="outline" className="flex-1" onClick={() => onNavigate("checkout")}>
                  Bayar Sekarang
                </Button>
              </div>
            )}
          </div>
        )}

        {message.type === "text" && message.content && (
          <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">{message.content}</p>
        )}

        {message.type === "image" && message.imageUrl && (
          <img src={message.imageUrl} alt="Gambar chat" className="rounded-lg max-h-56" />
        )}

        <div className="flex items-center justify-end gap-1 mt-1">
          <span className="text-[10px] sm:text-xs opacity-70">{message.time}</span>
          {message.isMe && <CheckCheck className="h-3 w-3 opacity-70" />}
        </div>
      </div>
    </div>
  )
}
