import { Button } from "@/components/ui/button"
import { Card, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ArrowLeft,
  Flag,
  Image as ImageIcon,
  MessageCircle,
  MoreVertical,
  Phone,
  Receipt,
  Send,
  Smile,
  X,
  Handshake,
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
  setShowNegoModal: (open: boolean) => void
  setShowOfferModal: (open: boolean) => void
  onBackToList: () => void
  onHandleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveImage: () => void
  onAddEmoji: (emoji: string) => void
  onSendMessage: () => void
  onKeyPress: (e: React.KeyboardEvent) => void
  onAcceptOffer: (message: ChatMessage) => void
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
  setShowNegoModal,
  setShowOfferModal,
  onBackToList,
  onHandleImageUpload,
  onRemoveImage,
  onAddEmoji,
  onSendMessage,
  onKeyPress,
  onAcceptOffer,
  formatPrice,
}: Props) {
  return (
    <Card
      className={`
        lg:col-span-2 flex flex-col overflow-hidden transition-all duration-300
        ${!showChatList || selectedChat ? "flex" : "hidden lg:flex"}
      `}
    >
      {selectedChat ? (
        <>
          <CardHeader className="border-b p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8" onClick={onBackToList}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Avatar className="h-9 w-9 sm:h-10 sm:w-10">
                  <AvatarFallback className="bg-primary-100 text-primary-700 text-xs sm:text-sm">
                    {selectedChat.seller.name.split(" ").map((name) => name[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-medium text-sm sm:text-base truncate">{selectedChat.seller.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="w-2 h-2 bg-primary-500 rounded-full shrink-0" />
                    <span>{isSellerView ? "Pembeli" : "Penjual"} • Online</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <ScrollArea className="flex-1 p-3 sm:p-4">
            <div className="space-y-3 sm:space-y-4">
              {messages.map((message) => (
                <ChatMessageItem
                  key={message.id}
                  message={message}
                  isSellerView={isSellerView}
                  formatPrice={formatPrice}
                  onNavigate={onNavigate}
                  onAcceptOffer={onAcceptOffer}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

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

          <div className="border-t p-3 sm:p-4">
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
                className="flex-1 text-sm"
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
                <>
                  <Button variant="outline" size="sm" className="text-xs sm:text-sm whitespace-nowrap" onClick={() => setShowNegoModal(true)}>
                    <Handshake className="h-3 w-3 mr-1" />
                    Ajukan Nego
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs sm:text-sm whitespace-nowrap ml-auto text-red-500 hover:text-red-600">
                    <Flag className="h-3 w-3 mr-1" />
                    Laporkan
                  </Button>
                </>
              )}

              {isSellerView && (
                <>
                  <Button variant="outline" size="sm" className="text-xs sm:text-sm whitespace-nowrap" onClick={() => setShowOfferModal(true)}>
                    <Receipt className="h-3 w-3 mr-1" />
                    Buat Penawaran
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs sm:text-sm whitespace-nowrap ml-auto text-red-500 hover:text-red-600">
                    <Flag className="h-3 w-3 mr-1" />
                    Laporkan
                  </Button>
                </>
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
