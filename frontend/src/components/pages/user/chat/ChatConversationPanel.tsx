import { Button } from "@/components/ui/button"
import { Card, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
} from "lucide-react"
import type { Chat } from "@/lib/mock-data"
import { EMOJIS, type ChatMessage } from "@/components/pages/user/chat/chat.types"
import ChatMessageItem from "@/components/pages/user/chat/ChatMessageItem"

interface Props {
  selectedChat: Chat | null
  showChatList: boolean
  isSellerView: boolean
  messages: ChatMessage[]
  newMessage: string
  setNewMessage: (value: string) => void
  showEmojiPicker: boolean
  setShowEmojiPicker: (value: boolean) => void
  attachedImage: string | null
  fileInputRef: React.RefObject<HTMLInputElement | null>
  messagesEndRef: React.RefObject<HTMLDivElement | null>
  onNavigate: (page: string, productId?: string) => void
  onOpenProfile: (chat: Chat) => void
  setShowNegoModal: (open: boolean) => void
  setShowOfferModal: (open: boolean) => void
  onBackToList: () => void
  onHandleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveImage: () => void
  onAddEmoji: (emoji: string) => void
  onSendMessage: () => void
  onKeyPress: (e: React.KeyboardEvent) => void
  onAcceptOffer: (message: ChatMessage) => void
  onOpenPaymentDialog: (message: ChatMessage) => void
  formatPrice: (price: number) => string
}

export default function ChatConversationPanel({
  selectedChat,
  showChatList,
  isSellerView,
  messages,
  newMessage,
  setNewMessage,
  showEmojiPicker,
  setShowEmojiPicker,
  attachedImage,
  fileInputRef,
  messagesEndRef,
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
  onOpenPaymentDialog,
  formatPrice,
}: Props) {
  return (
    <Card
      className={`
        lg:col-span-2 flex flex-col overflow-hidden transition-all duration-300 border-slate-200/80 dark:border-slate-800/80 shadow-sm rounded-2xl bg-white/95 dark:bg-slate-900/90 backdrop-blur
        ${!showChatList || selectedChat ? "flex" : "hidden lg:flex"}
      `}
    >
      {selectedChat ? (
        <>
          <CardHeader className="border-b border-slate-200/80 dark:border-slate-800 p-3 sm:p-4 bg-white/70 dark:bg-slate-900/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8" onClick={onBackToList}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <button
                  type="button"
                  onClick={() => onOpenProfile(selectedChat)}
                  className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  aria-label="Lihat profil"
                >
                  <Avatar className="h-9 w-9 sm:h-10 sm:w-10">
                    <AvatarFallback className="bg-primary-100 text-primary-700 text-xs sm:text-sm">
                      {selectedChat.seller.name.split(" ").map((name) => name[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenProfile(selectedChat)}
                  className="min-w-0 text-left rounded-md px-1 -mx-1 py-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  aria-label="Buka profil penjual"
                >
                  <p className="font-medium text-sm sm:text-base truncate">{selectedChat.seller.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full shrink-0 animate-pulse" />
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                      {isSellerView ? "Pembeli" : "Penjual"} online
                    </span>
                  </p>
                </button>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 sm:h-9 sm:w-9 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                    aria-label="Menu chat"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem onClick={() => onOpenProfile(selectedChat)}>
                    <User className="h-4 w-4" />
                    Lihat Profil
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.10),_transparent_55%)] dark:bg-[radial-gradient(circle_at_top,_rgba(51,65,85,0.35),_transparent_55%)]">
            <div className="space-y-3 sm:space-y-4">
              {messages.map((message) => (
                <ChatMessageItem
                  key={message.id}
                  message={message}
                  isSellerView={isSellerView}
                  formatPrice={formatPrice}
                  onNavigate={onNavigate}
                  onAcceptOffer={onAcceptOffer}
                  onOpenPaymentDialog={onOpenPaymentDialog}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

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
                title="Emoji"
              >
                <Smile className={`h-4 w-4 ${showEmojiPicker ? "text-primary-600" : "text-slate-500"}`} />
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
                disabled={!newMessage.trim() && !attachedImage}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-2 mt-3 overflow-x-auto pb-1 -mx-1 px-1">
              {!isSellerView && (
                <Button variant="outline" size="sm" className="text-xs sm:text-sm whitespace-nowrap" onClick={() => setShowNegoModal(true)}>
                  <Handshake className="h-3 w-3 mr-1" />
                  Ajukan Nego
                </Button>
              )}

              {isSellerView && (
                <Button variant="outline" size="sm" className="text-xs sm:text-sm whitespace-nowrap" onClick={() => setShowOfferModal(true)}>
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
  )
}
