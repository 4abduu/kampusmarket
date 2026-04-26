/**
 * ChatConversationPanel.tsx [REVISI v2 — fix build error]
 * Fix: hapus import useRef yang tidak terpakai (TS6133)
 */
import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ArrowLeft,
  Image as ImageIcon,
  MessageCircle,
  MoreVertical,
  Receipt,
  Send,
  Smile,
  X,
  Handshake,
  User,
  ShieldAlert,
  Package,
} from 'lucide-react';
import { EMOJIS, type ApiChatDetail, type ApiMessage } from '@/components/pages/user/chat/chat.types';
import ChatMessageItem from '@/components/pages/user/chat/ChatMessageItem';

interface Props {
  chat: ApiChatDetail | null;
  currentUserId: string;
  showChatList: boolean;
  messages: ApiMessage[];
  isLoading: boolean;
  isSending: boolean;
  newMessage: string;
  setNewMessage: (v: string) => void;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (v: boolean) => void;
  attachedImage: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  showContextCard: boolean;
  onNavigate: (page: string, productId?: string) => void;
  onOpenProfile: () => void;
  setShowNegoModal: (v: boolean) => void;
  setShowOfferModal: (v: boolean) => void;
  onBackToList: () => void;
  onHandleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  onAddEmoji: (emoji: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onAcceptOffer: (message: ApiMessage) => void;
  onRejectOffer: (message: ApiMessage) => void;
  onOpenPaymentDialog: (message: ApiMessage) => void;
  formatPrice: (price: number) => string;
}

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

export default function ChatConversationPanel({
  chat,
  currentUserId,
  showChatList,
  messages,
  isLoading,
  isSending,
  newMessage,
  setNewMessage,
  showEmojiPicker,
  setShowEmojiPicker,
  attachedImage,
  fileInputRef,
  messagesEndRef,
  showContextCard,
  onNavigate,
  onOpenProfile,
  setShowNegoModal,
  setShowOfferModal,
  onBackToList,
  onHandleImageUpload,
  onRemoveImage,
  onAddEmoji,
  onSendMessage,
  onKeyPress,
  onAcceptOffer,
  onRejectOffer,
  onOpenPaymentDialog,
  formatPrice,
}: Props) {
  const isSeller = chat ? chat.seller?.id === currentUserId : false;
  const otherUser = chat ? (isSeller ? chat.buyer : chat.seller) : null;

  return (
    <Card
      className={`
        lg:col-span-2 flex flex-col overflow-hidden transition-all duration-300
        border-slate-200/80 dark:border-slate-800/80 shadow-sm rounded-2xl
        bg-white/95 dark:bg-slate-900/90 backdrop-blur
        ${!showChatList || chat ? 'flex' : 'hidden lg:flex'}
      `}
    >
      {chat ? (
        <>
          {/* ── Header ── */}
          <CardHeader className="border-b border-slate-200/80 dark:border-slate-800 p-3 sm:p-4 bg-white/70 dark:bg-slate-900/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8" onClick={onBackToList}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>

                <button
                  type="button"
                  onClick={onOpenProfile}
                  className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                >
                  <div className="relative">
                    <Avatar className="h-9 w-9 sm:h-10 sm:w-10">
                      {otherUser?.avatar ? (
                        <img src={otherUser.avatar} alt={otherUser.name} className="h-full w-full object-cover rounded-full" />
                      ) : (
                        <AvatarFallback className="bg-primary-100 text-primary-700 text-xs sm:text-sm">
                          {otherUser ? getInitials(otherUser.name) : '?'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    {otherUser?.isOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                    )}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={onOpenProfile}
                  className="min-w-0 text-left rounded-md px-1 -mx-1 py-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-none"
                >
                  <p className="font-medium text-sm sm:text-base truncate">{otherUser?.name ?? '—'}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    {otherUser?.isOnline ? (
                      <>
                        <span className="w-2 h-2 bg-emerald-500 rounded-full shrink-0 animate-pulse" />
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                          {isSeller ? 'Pembeli' : 'Penjual'} online
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 bg-slate-300 rounded-full shrink-0" />
                        <span className="text-muted-foreground/70">Offline</span>
                      </>
                    )}
                  </p>
                </button>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem onClick={onOpenProfile}>
                    <User className="h-4 w-4" />
                    Lihat Profil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => chat.product && onNavigate('product', chat.product.id)}>
                    <Package className="h-4 w-4" />
                    Lihat Produk
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          {/* ── Warning box ── */}
          <div className="px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200/60 dark:border-amber-800/40">
            <div className="flex items-start gap-2">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
                Jangan bagikan data pribadi (nomor rekening, password, KTP) di chat. Transaksi di luar platform tidak dijamin keamanannya.
              </p>
            </div>
          </div>

          {/* ── Messages area ── */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.10),_transparent_55%)] dark:bg-[radial-gradient(circle_at_top,_rgba(51,65,85,0.35),_transparent_55%)]">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'} animate-pulse`}>
                    <div className={`h-8 rounded-2xl ${i % 2 === 0 ? 'bg-primary-100 dark:bg-primary-900/30 w-40' : 'bg-slate-100 dark:bg-slate-800 w-52'}`} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {/* Context card "Sedang Ditanyakan" — tampil saat chat baru dibuka dari produk */}
                {showContextCard && chat.product && (
                  <div className="flex justify-center mb-4">
                    <div
                      className="flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-shadow max-w-xs w-full"
                      onClick={() => chat.product && onNavigate('product', chat.product.id)}
                    >
                      <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center shrink-0">
                        {chat.product.images?.[0] ? (
                          <img src={chat.product.images[0]} alt={chat.product.title} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <Package className="h-4 w-4 text-muted-foreground/50" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-muted-foreground">Sedang ditanyakan</p>
                        <p className="text-xs font-medium truncate">{chat.product.title}</p>
                        <p className="text-xs text-primary-600 font-semibold">{formatPrice(chat.product.price)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {messages.length === 0 && !showContextCard && (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">Belum ada pesan. Mulai chat sekarang!</p>
                  </div>
                )}

                {messages.map((msg) => (
                  <ChatMessageItem
                    key={msg.id}
                    message={msg}
                    currentUserId={currentUserId}
                    chat={chat}
                    formatPrice={formatPrice}
                    onNavigate={onNavigate}
                    onAcceptOffer={onAcceptOffer}
                    onRejectOffer={onRejectOffer}
                    onOpenPaymentDialog={onOpenPaymentDialog}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* ── Image preview ── */}
          {attachedImage && (
            <div className="px-4 py-2 border-t bg-slate-50 dark:bg-slate-800/50">
              <div className="relative inline-block">
                <img src={attachedImage} alt="Preview" className="h-20 w-20 object-cover rounded-lg border" />
                <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-5 w-5 rounded-full" onClick={onRemoveImage}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {/* ── Emoji picker ── */}
          {showEmojiPicker && (
            <div className="px-4 py-2 border-t bg-white dark:bg-slate-800">
              <div className="flex flex-wrap gap-1">
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => onAddEmoji(emoji)}
                    className="h-8 w-8 flex items-center justify-center text-lg hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Input area ── */}
          <div className="border-t border-slate-200/80 dark:border-slate-800 p-3 sm:p-4 bg-white/80 dark:bg-slate-900/70 backdrop-blur">
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                title="Unggah gambar"
                aria-label="Unggah gambar"
                onChange={onHandleImageUpload}
                className="hidden"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:h-9 sm:w-9 shrink-0"
                onClick={() => fileInputRef.current?.click()}
                title="Kirim gambar"
              >
                <ImageIcon className="h-4 w-4 text-slate-500" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:h-9 sm:w-9 shrink-0"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Smile className={`h-4 w-4 ${showEmojiPicker ? 'text-primary-600' : 'text-slate-500'}`} />
              </Button>
              <Input
                placeholder="Ketik pesan..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={onKeyPress}
                className="flex-1 text-sm border-slate-300 dark:border-slate-700 focus-visible:ring-primary-500"
              />
              <Button
                className="bg-primary-600 hover:bg-primary-700 h-8 w-8 sm:h-9 sm:w-9 shrink-0"
                size="icon"
                onClick={onSendMessage}
                disabled={(!newMessage.trim() && !attachedImage) || isSending}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {/* Tombol aksi nego */}
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1 -mx-1 px-1">
              {!isSeller && chat.product?.canNego && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs sm:text-sm whitespace-nowrap"
                  onClick={() => setShowNegoModal(true)}
                >
                  <Handshake className="h-3 w-3 mr-1" />
                  Ajukan Nego
                </Button>
              )}
              {isSeller && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs sm:text-sm whitespace-nowrap"
                  onClick={() => setShowOfferModal(true)}
                >
                  <Receipt className="h-3 w-3 mr-1" />
                  Buat Penawaran
                </Button>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <MessageCircle className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground text-sm sm:text-base">Pilih chat untuk mulai percakapan</p>
          </div>
        </div>
      )}
    </Card>
  );
}
