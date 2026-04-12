import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Chat } from "@/lib/mock-data"

interface Props {
  chats: Chat[]
  selectedChat: Chat | null
  showChatList: boolean
  isSellerView: boolean
  onSelectChat: (chat: Chat) => void
}

export default function ChatListPanel({
  chats,
  selectedChat,
  showChatList,
  isSellerView,
  onSelectChat,
}: Props) {
  return (
    <Card
      className={`
        lg:col-span-1 overflow-hidden transition-all duration-300 border-slate-200/80 dark:border-slate-800/80 shadow-sm rounded-2xl bg-white/90 dark:bg-slate-900/85 backdrop-blur
        ${showChatList ? "block" : "hidden lg:block"}
      `}
    >
      <CardHeader className="border-b p-4">
        <CardTitle className="text-lg">{isSellerView ? "Pesan Pembeli" : "Pesan Penjual"}</CardTitle>
      </CardHeader>
      <ScrollArea className="h-[calc(100%-70px)]">
        <div className="divide-y">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat)}
              className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-slate-100/70 dark:hover:bg-slate-800 transition-colors ${
                selectedChat?.id === chat.id
                  ? "bg-primary-50 dark:bg-primary-900/20 ring-1 ring-primary-200 dark:ring-primary-800"
                  : ""
              }`}
            >
              <Avatar className="h-11 w-11 sm:h-12 sm:w-12 shrink-0">
                <AvatarFallback className="bg-primary-100 text-primary-700 text-sm sm:text-base">
                  {chat.seller.name.split(" ").map((name) => name[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium truncate text-sm sm:text-base">{chat.seller.name}</p>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(chat.lastMessageAt).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground truncate mt-0.5">{chat.lastMessage}</p>
              </div>
              {(isSellerView ? chat.sellerUnread : chat.buyerUnread) > 0 && (
                <Badge className="bg-primary-600 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {isSellerView ? chat.sellerUnread : chat.buyerUnread}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  )
}
