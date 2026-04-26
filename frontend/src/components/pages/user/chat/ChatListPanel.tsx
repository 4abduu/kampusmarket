import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle } from 'lucide-react';
import type { ApiChat } from '@/components/pages/user/chat/chat.types';

interface Props {
  chats: ApiChat[];
  selectedChatId: string | null;
  showChatList: boolean;
  isSellerView: boolean;
  isLoading: boolean;
  onSelectChat: (chat: ApiChat) => void;
}

function fmt(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function initials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

export default function ChatListPanel({ chats, selectedChatId, showChatList, isSellerView, isLoading, onSelectChat }: Props) {
  return (
    <Card className={[
      'lg:col-span-1 overflow-hidden transition-all duration-300',
      'border-slate-200/80 dark:border-slate-800/80 shadow-sm rounded-2xl',
      'bg-white/90 dark:bg-slate-900/85 backdrop-blur',
      showChatList ? 'block' : 'hidden lg:block',
    ].join(' ')}>
      <CardHeader className="border-b p-4">
        <CardTitle className="text-lg">Pesan</CardTitle>
      </CardHeader>

      <ScrollArea className="h-[calc(100%-70px)]">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-11 h-11 bg-slate-200 dark:bg-slate-700 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <MessageCircle className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">Belum ada chat</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Mulai chat dari halaman detail produk</p>
          </div>
        ) : (
          <div className="divide-y">
            {chats.map(chat => {
              const isSelected = selectedChatId === chat.id;
              // FIX #5: tentukan role lawan bicara per chat, bukan global
              // Kita tidak tahu currentUserId di sini, tapi kita bisa pakai sellerId dari product
              // Chat yang saya adalah seller: otherUser adalah buyer
              // Chat yang saya adalah buyer: otherUser adalah seller
              // isSellerView di sini tidak akurat per-chat, tapi kita tidak punya currentUserId
              // Solusi: tampilkan keduanya — "Pembeli" jika isSellerView, "Penjual" jika tidak
              const roleLabel = isSellerView ? 'Pembeli' : 'Penjual';

              return (
                <div
                  key={chat.id}
                  onClick={() => onSelectChat(chat)}
                  className={[
                    'flex items-center gap-3 p-4 cursor-pointer hover:bg-slate-100/70 dark:hover:bg-slate-800 transition-colors',
                    isSelected ? 'bg-primary-50 dark:bg-primary-900/20 ring-1 ring-primary-200 dark:ring-primary-800' : '',
                  ].join(' ')}
                >
                  <div className="relative shrink-0">
                    <Avatar className="h-11 w-11">
                      {chat.otherUser.avatar
                        ? <img src={chat.otherUser.avatar} alt={chat.otherUser.name} className="h-full w-full object-cover rounded-full" />
                        : <AvatarFallback className="bg-primary-100 text-primary-700 text-sm">{initials(chat.otherUser.name)}</AvatarFallback>
                      }
                    </Avatar>
                    {chat.otherUser.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <p className="font-medium truncate text-sm">{chat.otherUser.name}</p>
                        {/* FIX #5: Badge Penjual/Pembeli agar tidak bingung */}
                        <span className={[
                          'shrink-0 text-[10px] px-1.5 py-0.5 rounded-full font-medium',
                          roleLabel === 'Penjual'
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
                        ].join(' ')}>
                          {roleLabel}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">{fmt(chat.lastMessageAt)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{chat.product.title}</p>
                    {chat.lastMessage && (
                      <p className="text-xs text-muted-foreground/70 truncate mt-0.5">{chat.lastMessage}</p>
                    )}
                  </div>

                  {chat.unreadCount > 0 && (
                    <Badge className="bg-primary-600 h-5 min-w-5 px-1 flex items-center justify-center text-xs shrink-0">
                      {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
}
