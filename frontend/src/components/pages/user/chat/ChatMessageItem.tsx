import { Button } from '@/components/ui/button';
import { Check, CheckCheck, ChevronRight, Handshake, Package, Receipt } from 'lucide-react';
import type { ApiMessage, ApiChatDetail } from '@/components/pages/user/chat/chat.types';

interface Props {
  message: ApiMessage;
  currentUserId: string;
  chat: ApiChatDetail;
  formatPrice: (price: number) => string;
  onNavigate: (page: string, productId?: string) => void;
  onAcceptOffer: (message: ApiMessage) => void;
  onRejectOffer: (message: ApiMessage) => void;
  onOpenPaymentDialog: (message: ApiMessage) => void;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

export default function ChatMessageItem({
  message, currentUserId, chat, formatPrice,
  onNavigate, onAcceptOffer, onRejectOffer, onOpenPaymentDialog,
}: Props) {
  const isMe = message.senderId === currentUserId;
  const isSeller = chat.seller?.id === currentUserId;
  // FIX #4 & #5: tentukan siapa yang kirim pesan ini
  const senderIsSeller = message.senderId === chat.seller?.id;
  const senderIsBuyer = message.senderId === chat.buyer?.id;

  if (message.type === 'system') {
    return (
      <div className="flex justify-center my-1">
        <div className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs text-muted-foreground max-w-xs text-center">
          {message.content}
        </div>
      </div>
    );
  }

  const product = chat.product;

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div className={[
        'max-w-[85%] sm:max-w-[75%] shadow-sm px-3 sm:px-4 py-2',
        isMe
          ? 'bg-primary-600 text-white rounded-2xl rounded-br-md'
          : 'bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 rounded-2xl rounded-bl-md',
      ].join(' ')}>

        {/* OFFER */}
        {message.type === 'offer' && product && (
          <div className="space-y-2">
            <div className={`rounded-xl p-3 ${isMe ? 'bg-white/10' : 'bg-amber-50 dark:bg-amber-900/30'}`}>
              <div className="flex items-center gap-2 mb-2 text-xs">
                <Handshake className="h-4 w-4" />
                {/* FIX #4: Label yang akurat berdasarkan siapa pengirimnya */}
                <span className="font-medium">
                  {senderIsBuyer ? 'Pembeli mengajukan nego' : senderIsSeller ? 'Penjual mengajukan penawaran' : 'Penawaran'}
                </span>
              </div>

              <div
                className="flex items-center gap-2 mb-2 pb-2 border-b border-white/20 cursor-pointer"
                onClick={() => onNavigate('product', product.id)}
              >
                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-600 rounded-lg flex items-center justify-center shrink-0">
                  {product.images?.[0]
                    ? <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover rounded-lg" />
                    : <Package className="h-4 w-4 text-muted-foreground/50" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs truncate">{product.title}</p>
                  <p className={`text-xs line-through ${isMe ? 'text-white/60' : 'text-muted-foreground'}`}>
                    {formatPrice(product.price)}
                  </p>
                </div>
                <ChevronRight className={`h-4 w-4 shrink-0 ${isMe ? 'text-white/70' : 'text-muted-foreground'}`} />
              </div>

              <p className="font-bold text-base sm:text-lg">{formatPrice(message.offerPrice ?? 0)}</p>

              {/* FIX #4: Status label yang tepat */}
              {message.offerStatus === 'accepted' && (
                <p className="text-xs mt-1 text-emerald-600 dark:text-emerald-400 font-medium">✅ Penawaran diterima</p>
              )}
              {message.offerStatus === 'rejected' && (
                <p className="text-xs mt-1 text-red-500 font-medium">❌ Penawaran ditolak</p>
              )}
              {message.offerStatus === 'pending' && (
                // FIX #4: kalau penjual yang kirim → "menunggu konfirmasi pembeli", bukan "menunggu respons penjual"
                <p className="text-xs opacity-70 mt-1">
                  {senderIsSeller ? 'Menunggu konfirmasi pembeli' : 'Menunggu respons penjual'}
                </p>
              )}
            </div>

            {/* Tombol seller: terima/tolak — hanya jika buyer yang kirim nego, dan seller belum reply */}
            {isSeller && senderIsBuyer && message.offerStatus === 'pending' && (
              <div className="flex gap-2">
                <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => onAcceptOffer(message)}>
                  Terima
                </Button>
                <Button size="sm" variant="outline" className="flex-1 border-red-300 text-red-600 hover:bg-red-50" onClick={() => onRejectOffer(message)}>
                  Tolak
                </Button>
              </div>
            )}

            {/* FIX #6: Tombol Bayar — buyer, offer accepted, langsung ke checkout */}
            {!isSeller && message.offerStatus === 'accepted' && (
              <Button
                size="sm"
                className="w-full bg-primary-600 text-white hover:bg-primary-700"
                onClick={() => onOpenPaymentDialog(message)}
              >
                <Receipt className="h-3 w-3 mr-1" />
                Bayar Sekarang
              </Button>
            )}
          </div>
        )}

        {/* TEXT */}
        {message.type === 'text' && message.content && (
          <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">{message.content}</p>
        )}

        {/* IMAGE */}
        {message.type === 'image' && message.imageUrls.length > 0 && (
          <div className="space-y-1">
            {message.imageUrls.map((url, i) => (
              <img key={i} src={url} alt={`Gambar ${i + 1}`} className="rounded-lg max-h-56 w-auto cursor-pointer" onClick={() => window.open(url, '_blank')} />
            ))}
            {message.content && <p className="text-xs mt-1 whitespace-pre-wrap break-words">{message.content}</p>}
          </div>
        )}

        {/* FILE */}
        {message.type === 'file' && message.fileUrl && (
          <a href={message.fileUrl} target="_blank" rel="noreferrer" className={`flex items-center gap-2 text-xs underline ${isMe ? 'text-white' : 'text-primary-600'}`}>
            <Package className="h-3 w-3" />Unduh file
          </a>
        )}

        {/* Timestamp + read */}
        <div className="flex items-center justify-end gap-1 mt-1">
          <span className="text-[10px] sm:text-xs opacity-70">{formatTime(message.createdAt)}</span>
          {isMe && (
            <span title={message.isRead ? 'Sudah dibaca' : 'Terkirim'} className="inline-flex">
              {message.isRead
                ? <CheckCheck className="h-3 w-3 text-blue-400" />
                : <Check className="h-3 w-3 opacity-50" />
              }
            </span>
          )}
          {message._pending && <span className="text-[10px] opacity-50">⏳</span>}
        </div>
      </div>
    </div>
  );
}
