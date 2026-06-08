import { Button } from '@/components/ui/button';
import { CheckCheck, ChevronRight, Handshake, Package, Receipt, AlertTriangle, Clock3 } from 'lucide-react';
import type { ApiMessage, ApiChatDetail, ApiChatProduct } from '@/components/pages/user/chat/chat.types';

interface Props {
  message: ApiMessage;
  currentUserId: string;
  chat: ApiChatDetail;
  chatProduct?: ApiChatProduct | null;
  formatPrice: (price: number) => string;
  onNavigate: (page: string, productId?: string) => void;
  onAcceptOffer: (message: ApiMessage) => void;
  onRejectOffer: (message: ApiMessage) => void;
  onOpenPaymentDialog: (message: ApiMessage) => void;
  onReportMessage: (message: ApiMessage) => void;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

export default function ChatMessageItem({
  message, currentUserId, chat, chatProduct, formatPrice,
  onNavigate, onAcceptOffer, onRejectOffer, onOpenPaymentDialog, onReportMessage
}: Props) {
  const product = message.product || chatProduct || chat.product;
  let sellerId = chat.seller?.id;
  if (product) {
    if ('sellerId' in product && product.sellerId) {
      sellerId = product.sellerId;
    } else if ('seller' in product && (product as any).seller?.id) {
      sellerId = (product as any).seller.id;
    }
  }

  const normalizedSellerId = sellerId ? String(sellerId) : undefined;
  const normalizedSenderId = String(message.senderId);
  const normalizedCurrentUserId = String(currentUserId);
  
  const isMe = normalizedSenderId === normalizedCurrentUserId;
  const isSeller = normalizedSellerId === normalizedCurrentUserId;
  
  const senderIsSeller = normalizedSenderId === normalizedSellerId;
  const buyerId = (chat.buyer?.id && String(chat.buyer.id) === normalizedSellerId) 
    ? chat.seller?.id 
    : chat.buyer?.id;
  const normalizedBuyerId = buyerId ? String(buyerId) : undefined;
  const senderIsBuyer = normalizedSenderId === normalizedBuyerId;

  const canRespondToOffer = !isMe
    && message.offerStatus === 'pending'
    && ((isSeller && senderIsBuyer) || (!isSeller && senderIsSeller));

  if (message.type === 'system') {
    if (message.product) {
      return (
        <div className="flex justify-center my-3 w-full">
          <div className="max-w-[85%] sm:max-w-md w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-800/80 px-4 py-2 border-b border-slate-100 dark:border-slate-700">
              <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5" />
                {message.content}
              </p>
            </div>
            <div 
              className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              onClick={() => onNavigate('product', message.product!.id)}
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center shrink-0 border border-slate-200/50 dark:border-slate-600/50 overflow-hidden">
                {message.product.image ? (
                  <img src={message.product.image} alt={message.product.title} className="w-full h-full object-cover" />
                ) : (
                  <Package className="h-6 w-6 text-slate-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-slate-900 dark:text-slate-100">{message.product.title}</p>
                <p className="text-sm font-bold text-primary-600 dark:text-primary-400 mt-0.5">{formatPrice(message.product.price)}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-400 shrink-0" />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex justify-center my-1">
        <div className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs text-muted-foreground max-w-xs text-center">
          {message.content}
        </div>
      </div>
    );
  }

  // product sudah dideklarasikan di atas untuk penentuan peran dinamis

  return (
    <div className={`flex group ${isMe ? 'justify-end' : 'justify-start'} items-center gap-2`}>
      {!isMe && (
        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 text-red-500 shrink-0 transition-opacity" onClick={() => onReportMessage(message)} title="Laporkan Pesan">
          <AlertTriangle className="h-3 w-3" />
        </Button>
      )}
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
                <span className="font-medium">
                  {senderIsBuyer ? 'Pembeli mengajukan nego' : senderIsSeller ? 'Penjual mengajukan penawaran' : 'Penawaran'}
                </span>
              </div>

              <div
                className="flex items-center gap-2 mb-2 pb-2 border-b border-white/20 cursor-pointer"
                onClick={() => onNavigate('product', product.id)}
              >
                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-600 rounded-lg flex items-center justify-center shrink-0">
                  {'images' in product && product.images?.[0] || 'image' in product && product.image
                    ? <img src={'images' in product ? product.images[0] : (product as any).image} alt={product.title} className="w-full h-full object-cover rounded-lg" />
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

              {/* Teks Status Penawaran yang Dinamis sesuai POV */}
              {message.offerStatus === 'accepted' && (
                <p className={`text-xs mt-1 font-medium ${isMe ? 'text-white/90' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  Penawaran diterima
                </p>
              )}
              {message.offerStatus === 'rejected' && (
                <p className={`text-xs mt-1 font-medium ${isMe ? 'text-red-200' : 'text-red-500'}`}>
                  Penawaran ditolak
                </p>
              )}
              {message.offerStatus === 'pending' && (
                <p className="text-xs opacity-70 mt-1">
                  {senderIsSeller ? 'Menunggu konfirmasi pembeli' : 'Menunggu respons penjual'}
                </p>
              )}
            </div>

            {/* Tombol seller: terima/tolak */}
            {canRespondToOffer && (
              <div className="flex gap-2">
                <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => onAcceptOffer(message)}>
                  Terima
                </Button>
                <Button size="sm" variant="outline" className="flex-1 border-red-300 text-red-600 hover:bg-red-50" onClick={() => onRejectOffer(message)}>
                  Tolak
                </Button>
              </div>
            )}

            {/* Tombol Bayar */}
            {!isSeller && message.offerStatus === 'accepted' && (
              <Button
                size="sm"
                className="w-full bg-white/10 text-white hover:bg-primary-700"
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
          {isMe && !message._pending && (
            <span title={message.isRead ? 'Sudah dibaca' : 'Terkirim'} className="inline-flex">
              {message.isRead
                ? <CheckCheck className="h-3 w-3 text-blue-400" />
                : <CheckCheck className="h-3 w-3 opacity-50" />
              }
            </span>
          )}
          {isMe && message._pending && (
            <span title="Mengirim..." className="inline-flex">
              <Clock3 size={12} className="opacity-50" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
