'use client';

import { useCallback, useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { toast } from 'sonner';

import ChatListPanel from '@/components/pages/user/chat/ChatListPanel';
import ChatConversationPanel from '@/components/pages/user/chat/ChatConversationPanel';
import ChatActionModals, { type SellerProduct } from '@/components/pages/user/chat/ChatActionModals';

import type { ApiChat, ApiChatDetail, ApiMessage, ApiChatProduct } from '@/components/pages/user/chat/chat.types';
import type { User } from '@/lib/mock-data';
import {
  fetchChats,
  startChat,
  fetchChatDetail,
  sendMessage,
  markChatRead,
  acceptOffer,
  rejectOffer,
} from '@/lib/api/chat';
import { getEcho } from '@/lib/echo';
import apiClient from '@/lib/api/client';

// ── Types ──────────────────────────────────────────────────────────────────

interface ChatPageProps {
  onNavigate: (page: string, data?: string | Record<string, unknown>) => void;
  initialContextId?: string;
  initialChatAction?: 'chat' | 'nego';
  currentUser?: User | null; // dari App.tsx via AppRoutes — BUKAN localStorage
}

// ── Helpers ─────────────────────────────────────────────────────────────────

const formatPrice = (price: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

const formatPriceInput = (value: string) => {
  const num = value.replace(/\D/g, '');
  if (num === '') return '';
  return parseInt(num, 10).toLocaleString('id-ID');
};

// ── Component ──────────────────────────────────────────────────────────────

export default function ChatPage({ onNavigate, initialContextId, initialChatAction, currentUser }: ChatPageProps) {
  // currentUser dari props (App.tsx → AppRoutes → ChatPageWrapper → sini)
  // BUKAN dari localStorage — auth pakai HttpOnly cookie, user tidak disimpan di localStorage
  const currentUserId = currentUser?.id ?? '';

  const [chats, setChats] = useState<ApiChat[]>([]);
  const [chatsLoading, setChatsLoading] = useState(true);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatDetail, setChatDetail] = useState<ApiChatDetail | null>(null);
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [showChatList, setShowChatList] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [showContextCard, setShowContextCard] = useState(false);
  const [showNegoModal, setShowNegoModal] = useState(false);
  const [negoPrice, setNegoPrice] = useState('');
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const [sellerProducts, setSellerProducts] = useState<SellerProduct[]>([]);
  const [selectedOfferProduct, setSelectedOfferProduct] = useState<SellerProduct | null>(null);

  // [REVISI] Set userId yang sedang online dari presence channel
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastContextRef = useRef<string | null>(null);
  const echoChannelRef = useRef<ReturnType<ReturnType<typeof getEcho>['private']> | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // [REVISI] Ref untuk channel users.{id} — notifikasi pesan dari semua chat
  const userChannelRef = useRef<ReturnType<ReturnType<typeof getEcho>['private']> | null>(null);
  // [REVISI] Ref untuk presence channel — status online/offline realtime
  const presenceChannelRef = useRef<ReturnType<ReturnType<typeof getEcho>['join']> | null>(null);

  // ── Load list chat ─────────────────────────────────────────────────────────

  const loadChats = useCallback(async () => {
    try {
      setChatsLoading(true);
      const data = await fetchChats();
      setChats(data);
    } catch {
      // silent
    } finally {
      setChatsLoading(false);
    }
  }, []);

  // [REVISI] Reset semua state chat saat user berganti (logout/login ulang).
  // Ini yang menyebabkan riwayat chat hilang — state lama tidak dibersihkan
  // saat currentUserId berubah dari ada ke '' (logout) atau sebaliknya (login).
  useEffect(() => {
    if (!currentUserId) {
      // User logout — bersihkan semua state chat
      setChats([]);
      setActiveChatId(null);
      setChatDetail(null);
      setMessages([]);
      setChatsLoading(false);
      setOnlineUserIds(new Set());
      lastContextRef.current = null;

      // Bersihkan semua koneksi realtime
      if (echoChannelRef.current) {
        echoChannelRef.current.stopListening('.MessageSent');
        echoChannelRef.current = null;
      }
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      // [REVISI] Lepas user channel dan presence channel
      if (userChannelRef.current) {
        userChannelRef.current.stopListening('.NewMessageNotification');
        userChannelRef.current = null;
      }
      if (presenceChannelRef.current) {
        presenceChannelRef.current = null;
      }
    } else {
      // User login — muat ulang chat dari server
      // [REVISI] Pastikan chats selalu dimuat ulang saat user login atau currentUserId berubah
      void loadChats();
    }
  }, [currentUserId, loadChats]);

  // ── [REVISI] Subscribe ke private channel users.{id} ──────────────────────
  // Menerima NewMessageNotification dari semua chat milik user ini,
  // termasuk chat yang tidak sedang dibuka. Ini yang membuat list chat
  // dan unread count update realtime tanpa refresh.
  useEffect(() => {
    if (!currentUserId) return;

    let channelOk = false;
    try {
      const echo = getEcho();
      const channel = echo.private(`users.${currentUserId}`);

      channel.listen('.NewMessageNotification', (event: {
        message: ApiMessage;
        chatId: string;
        chatInfo: { lastMessage: string | null; lastMessageAt: string | null };
      }) => {
        const { message: incoming, chatId, chatInfo } = event;

        // Update list chat: naikkan unreadCount dan update lastMessage
        // kecuali kalau chat tersebut sedang aktif dibuka (sudah terbaca)
        setChats(prev => prev.map(c => {
          if (c.id !== chatId) return c;
          const isActiveChat = c.id === activeChatIdRef.current;
          return {
            ...c,
            lastMessage: chatInfo.lastMessage ?? c.lastMessage,
            lastMessageAt: chatInfo.lastMessageAt ?? c.lastMessageAt,
            unreadCount: isActiveChat ? 0 : c.unreadCount + 1,
          };
        }));

        // Kalau chat ini sedang dibuka tapi Echo chat.{uuid} tidak aktif
        // (misal fallback polling sedang jalan), tambah pesan ke messages juga
        if (chatId === activeChatIdRef.current && !echoChannelRef.current) {
          setMessages(prev => {
            const existingIdx = prev.findIndex(m => m.id === incoming.id);
            if (existingIdx !== -1) {
              // Update jika offer status berubah
              const existing = prev[existingIdx];
              if (existing.offerStatus !== incoming.offerStatus) {
                const next = [...prev];
                next[existingIdx] = incoming;
                return next;
              }
              return prev;
            }
            return [...prev, incoming];
          });
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
        }
      });

      userChannelRef.current = channel;
      channelOk = true;
    } catch {
      console.info('[Chat] Reverb users channel tidak aktif — online status dari REST saja');
    }

    return () => {
      if (channelOk && userChannelRef.current) {
        userChannelRef.current.stopListening('.NewMessageNotification');
        userChannelRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

  // ── [REVISI] Subscribe ke presence channel "online" ───────────────────────
  // Untuk status online/offline realtime semua user.
  // Saat user join/leave, set onlineUserIds diupdate sehingga dot hijau
  // di ChatListPanel langsung berubah tanpa refresh.
  useEffect(() => {
    if (!currentUserId) return;

    let joined = false;
    try {
      const echo = getEcho();
      const presence = echo.join('online');

      presence
        .here((users: { id: string; name: string }[]) => {
          // Initial list: semua yang sedang online saat ini
          setOnlineUserIds(new Set(users.map(u => u.id)));
        })
        .joining((user: { id: string; name: string }) => {
          // Ada user baru online
          setOnlineUserIds(prev => new Set([...prev, user.id]));
        })
        .leaving((user: { id: string; name: string }) => {
          // Ada user yang offline
          setOnlineUserIds(prev => {
            const next = new Set(prev);
            next.delete(user.id);
            return next;
          });
        })
        .error((err: unknown) => {
          console.info('[Chat] Presence channel error:', err);
        });

      presenceChannelRef.current = presence;
      joined = true;
    } catch {
      console.info('[Chat] Reverb presence channel tidak aktif');
    }

    return () => {
      if (joined) {
        try {
          getEcho().leave('online');
        } catch { /* silent */ }
        presenceChannelRef.current = null;
      }
    };
  }, [currentUserId]);

  // Ref untuk activeChatId agar bisa diakses dari dalam closure listener
  // tanpa perlu re-subscribe setiap kali activeChatId berubah
  const activeChatIdRef = useRef<string | null>(null);
  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  // ── [REVISI] Terapkan onlineUserIds ke chats list ─────────────────────────
  // Setiap kali onlineUserIds berubah (dari presence channel), update
  // isOnline di setiap chat.otherUser di list panel secara realtime.
  useEffect(() => {
    if (onlineUserIds.size === 0) return;
    setChats(prev => prev.map(c => ({
      ...c,
      otherUser: {
        ...c.otherUser,
        isOnline: onlineUserIds.has(c.otherUser.id),
      },
    })));
  }, [onlineUserIds]);

  // ── Open chat ──────────────────────────────────────────────────────────────

  const openChat = useCallback(async (chatUuid: string, showCtxCard = false) => {
    if (activeChatId === chatUuid) return;

    // Bersihkan koneksi lama
    if (echoChannelRef.current) {
      echoChannelRef.current.stopListening('.MessageSent');
      echoChannelRef.current = null;
    }
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }

    setActiveChatId(chatUuid);
    setShowChatList(false);
    setChatLoading(true);
    setMessages([]);
    setShowContextCard(showCtxCard);
    setChatDetail(null);

    try {
      const detail = await fetchChatDetail(chatUuid);
      setChatDetail(detail);
      setMessages(detail.messages ?? []);
      setChats(prev => prev.map(c => c.id === chatUuid ? { ...c, unreadCount: 0 } : c));

      // [REVISI] Terapkan status online dari presence channel ke chatDetail juga
      if (detail.seller) {
        detail.seller.isOnline = onlineUserIds.has(detail.seller.id) || detail.seller.isOnline;
      }
      if (detail.buyer) {
        detail.buyer.isOnline = onlineUserIds.has(detail.buyer.id) || detail.buyer.isOnline;
      }

      // Coba Reverb dulu — kalau gagal, fallback ke polling 5 detik
      let realtimeOk = false;
      try {
        const echo = getEcho();
        const channel = echo.private(`chat.${chatUuid}`);
        channel.listen('.MessageSent', (event: { message: ApiMessage }) => {
          const incoming = event.message;
          setMessages(prev => {
            // Cek apakah message dengan ID ini sudah ada
            const existingIdx = prev.findIndex(m => m.id === incoming.id);
            if (existingIdx !== -1) {
              // Jika sudah ada tapi offer status berubah (misal: pending → accepted/rejected),
              // update message tersebut agar UI langsung berubah tanpa refresh
              const existing = prev[existingIdx];
              if (existing.offerStatus !== incoming.offerStatus) {
                const next = [...prev];
                next[existingIdx] = incoming;
                return next;
              }
              // ID sama dan status sama — skip (dedup normal)
              return prev;
            }
            // Race condition guard: jika pengirim adalah diri sendiri dan ada pesan pending
            // yang belum di-replace (tempId), replace sekarang daripada menambah duplikat
            const pendingIdx = prev.findIndex(m => m._pending && m.senderId === incoming.senderId && m.type === incoming.type);
            if (pendingIdx !== -1) {
              const next = [...prev];
              next[pendingIdx] = incoming;
              return next;
            }
            return [...prev, incoming];
          });
          setChats(prevChats => prevChats.map(c =>
            c.id === chatUuid
              ? { ...c, lastMessage: incoming.content || '[lampiran]', lastMessageAt: incoming.createdAt }
              : c
          ));
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
          if (document.visibilityState === 'visible') markChatRead(chatUuid).catch(() => null);
        });
        echoChannelRef.current = channel;
        realtimeOk = true;
      } catch {
        console.info('[Chat] Reverb tidak aktif — pakai polling 5 detik');
      }

      // Polling fallback jika Reverb tidak tersedia
      if (!realtimeOk) {
        let lastCount = detail.messages?.length ?? 0;
        const id = setInterval(async () => {
          try {
            const fresh = await fetchChatDetail(chatUuid);
            const newMsgs = fresh.messages ?? [];
            if (newMsgs.length > lastCount) {
              lastCount = newMsgs.length;
              setMessages(newMsgs);
              setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
            }
          } catch { /* silent */ }
        }, 5000);
        pollingRef.current = id;
      }
    } catch (err) {
      console.error('[Chat] openChat error', err);
      toast.error('Gagal memuat chat');
    } finally {
      setChatLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChatId, onlineUserIds]);

  // ── Trigger dari detail produk ─────────────────────────────────────────────

  useEffect(() => {
    if (!initialContextId || !currentUserId) return;
    const key = `${initialContextId}:${initialChatAction ?? 'chat'}`;
    if (lastContextRef.current === key) return;
    lastContextRef.current = key;

    void (async () => {
      try {
        const chat = await startChat({ productId: initialContextId });
        setChats(prev => {
          if (prev.some(c => c.id === chat.id)) return prev;
          const item: ApiChat = {
            id: chat.id,
            product: {
              id: chat.product?.id ?? '',
              title: chat.product?.title ?? '',
              slug: chat.product?.slug ?? '',
              price: chat.product?.price ?? 0,
              image: chat.product?.images?.[0] ?? '',
              type: (chat.product?.type ?? 'barang') as 'barang' | 'jasa',
              canNego: chat.product?.canNego ?? false,
              sellerId: chat.seller?.id ?? '',
            },
            otherUser: chat.seller ?? { id: '', name: '', avatar: '', faculty: null, rating: 0, reviewCount: 0, isVerified: false, isOnline: false, lastSeen: null },
            lastMessage: chat.lastMessage,
            lastMessageAt: chat.lastMessageAt,
            unreadCount: 0,
            isActive: true,
          };
          return [item, ...prev];
        });
        const isNew = (chat.messages?.length ?? 0) === 0;
        await openChat(chat.id, isNew);
        if (initialChatAction === 'nego' && chat.product?.canNego) setShowNegoModal(true);
      } catch (err) {
        console.error('[Chat] startChat error', err);
        toast.error('Gagal membuka chat dengan penjual');
      }
    })();
  }, [initialContextId, initialChatAction, currentUserId, openChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    return () => {
      if (echoChannelRef.current) echoChannelRef.current.stopListening('.MessageSent');
      if (pollingRef.current) clearInterval(pollingRef.current);
      // [REVISI] Cleanup user channel dan presence channel saat unmount
      if (userChannelRef.current) userChannelRef.current.stopListening('.NewMessageNotification');
      try { getEcho().leave('online'); } catch { /* silent */ }
    };
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleSelectChat = useCallback(async (chat: ApiChat) => {
    await openChat(chat.id, false);
    void markChatRead(chat.id).catch(() => null);
  }, [openChat]);

  const handleBackToList = () => {
    setShowChatList(true);
    setActiveChatId(null);
    setChatDetail(null);
    setMessages([]);
    if (echoChannelRef.current) { echoChannelRef.current.stopListening('.MessageSent'); echoChannelRef.current = null; }
    if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setAttachedImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async () => {
    if (!chatDetail || (!newMessage.trim() && !attachedImage) || isSending) return;
    const content = newMessage.trim();
    setIsSending(true);
    setNewMessage('');
    setAttachedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setShowContextCard(false);

    const tempId = `temp-${Date.now()}`;
    const optimistic: ApiMessage = {
      id: tempId, chatId: chatDetail.id, senderId: currentUserId, content,
      type: attachedImage ? 'image' : 'text', offerPrice: null, offerStatus: null,
      imageUrls: attachedImage ? [attachedImage] : [], fileUrls: [], fileUrl: null,
      isRead: false, readAt: null, createdAt: new Date().toISOString(), _pending: true,
    };
    setMessages(prev => [...prev, optimistic]);

    try {
      const sent = await sendMessage(chatDetail.id, {
        content, type: attachedImage ? 'image' : 'text',
        imageUrls: attachedImage ? [attachedImage] : undefined,
      });
      setMessages(prev => prev.map(m => m.id === tempId ? sent : m));
      setChats(prev => prev.map(c => c.id === chatDetail.id ? { ...c, lastMessage: content || '[gambar]', lastMessageAt: sent.createdAt } : c));
    } catch {
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setNewMessage(content);
      toast.error('Gagal mengirim pesan');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleSendMessage(); }
  };

  const handleSubmitNego = async () => {
    if (!chatDetail?.product || !negoPrice || isSending) return;
    const price = parseInt(negoPrice.replace(/\D/g, ''), 10);
    if (!price || price <= 0) return;
    setIsSending(true); setShowNegoModal(false); setShowContextCard(false);
    // Optimistic dengan tempId agar Echo dedup bisa bekerja (replace tempId -> real ID)
    const tempId = `temp-${Date.now()}`;
    const optimistic: ApiMessage = {
      id: tempId, chatId: chatDetail.id, senderId: currentUserId,
      content: 'Halo, saya ingin menawar harga untuk produk ini.',
      type: 'offer', offerPrice: price, offerStatus: null,
      imageUrls: [], fileUrls: [], fileUrl: null,
      isRead: false, readAt: null, createdAt: new Date().toISOString(), _pending: true,
    };
    setMessages(prev => [...prev, optimistic]);
    try {
      const msg = await sendMessage(chatDetail.id, {
        content: 'Halo, saya ingin menawar harga untuk produk ini.',
        type: 'offer', offerPrice: price,
      });
      // Replace tempId dengan real ID — Echo dedup akan nangkap jika event datang kemudian
      setMessages(prev => prev.map(m => m.id === tempId ? msg : m));
      setChats(prev => prev.map(c => c.id === chatDetail.id ? { ...c, lastMessage: '\u{1F4B0} Penawaran harga', lastMessageAt: msg.createdAt } : c));
      setNegoPrice('');
      toast.success('Penawaran terkirim!');
    } catch {
      setMessages(prev => prev.filter(m => m.id !== tempId));
      toast.error('Gagal mengirim penawaran'); setShowNegoModal(true);
    }
    finally { setIsSending(false); }
  };

  const handleSubmitOffer = async () => {
    if (!chatDetail || !selectedOfferProduct || !offerPrice || isSending) return;
    const price = parseInt(offerPrice.replace(/\D/g, ''), 10);
    if (!price || price <= 0) return;
    setIsSending(true); setShowOfferModal(false);
    // Optimistic dengan tempId agar Echo dedup bisa bekerja
    const tempId = `temp-${Date.now()}`;
    const optimistic: ApiMessage = {
      id: tempId, chatId: chatDetail.id, senderId: currentUserId,
      content: `Penawaran khusus untuk ${selectedOfferProduct.title}`,
      type: 'offer', offerPrice: price, offerStatus: null,
      imageUrls: [], fileUrls: [], fileUrl: null,
      isRead: false, readAt: null, createdAt: new Date().toISOString(), _pending: true,
    };
    setMessages(prev => [...prev, optimistic]);
    try {
      const msg = await sendMessage(chatDetail.id, {
        content: `Penawaran khusus untuk ${selectedOfferProduct.title}`,
        type: 'offer', offerPrice: price,
      });
      // Replace tempId dengan real ID — Echo dedup akan nangkap jika event datang kemudian
      setMessages(prev => prev.map(m => m.id === tempId ? msg : m));
      setOfferPrice(''); setSelectedOfferProduct(null);
      toast.success('Penawaran terkirim!');
    } catch {
      setMessages(prev => prev.filter(m => m.id !== tempId));
      toast.error('Gagal mengirim penawaran'); setShowOfferModal(true);
    }
    finally { setIsSending(false); }
  };

  const handleAcceptOffer = async (message: ApiMessage) => {
    if (!chatDetail || isSending) return;
    setIsSending(true);
    try {
      const updated = await acceptOffer(chatDetail.id, message.id);
      setMessages(prev => prev.map(m => m.id === message.id ? updated : m));
      toast.success('Penawaran diterima!');
    } catch { toast.error('Gagal menerima penawaran'); }
    finally { setIsSending(false); }
  };

  const handleRejectOffer = async (message: ApiMessage) => {
    if (!chatDetail || isSending) return;
    setIsSending(true);
    try {
      const updated = await rejectOffer(chatDetail.id, message.id);
      setMessages(prev => prev.map(m => m.id === message.id ? updated : m));
      toast.success('Penawaran ditolak');
    } catch { toast.error('Gagal menolak penawaran'); }
    finally { setIsSending(false); }
  };

  // FIX #6: Bayar Sekarang → langsung checkout, tanpa dialog pilih metode
  const handleBayarSekarang = (message: ApiMessage) => {
    const product = chatDetail?.product;
    if (!product) return;
    onNavigate('checkout', {
      productId: product.id,
      negoPrice: message.offerPrice ?? product.price,
    });
  };

  const handleOpenOfferModal = async () => {
    setShowOfferModal(true);
    if (sellerProducts.length > 0 || !chatDetail?.seller) return;
    try {
      // Fetch semua produk (barang + jasa) dari seller — tanpa type filter
      // Backend akan return both barang dan jasa
      const res = await apiClient.get<
        unknown,
        { success: boolean; data: { id: string; title: string; price: number; image?: string; canNego: boolean; stock: number; type?: string }[] }
      >(`/users/${chatDetail.seller.id}/products`);
      const products = res.data.map(p => ({ ...p, stock: p.stock ?? 0 }));
      setSellerProducts(products);
      // FIX #2: default ke produk pertama yang ada stok dan canNego
      const first = products.find(p => p.stock > 0 && p.canNego) ?? products.find(p => p.stock > 0);
      if (first) setSelectedOfferProduct(first);
    } catch { /* silent */ }
  };

  const isSeller = chatDetail ? chatDetail.seller?.id === currentUserId : false;

  const chatProduct: ApiChatProduct | null = chatDetail?.product
    ? {
        id: chatDetail.product.id,
        title: chatDetail.product.title,
        slug: chatDetail.product.slug,
        price: chatDetail.product.price,
        image: chatDetail.product.images?.[0] ?? '',
        type: (chatDetail.product.type ?? 'barang') as 'barang' | 'jasa',
        canNego: chatDetail.product.canNego ?? false,
        sellerId: chatDetail.product.seller?.id ?? chatDetail.seller?.id ?? '',
      }
    : null;

  const otherUser = chatDetail
    ? (isSeller ? chatDetail.buyer : chatDetail.seller)
    : null;

  // [REVISI] Terapkan status online realtime dari presence channel ke otherUser
  const otherUserWithOnline = otherUser
    ? { ...otherUser, isOnline: onlineUserIds.has(otherUser.id) || otherUser.isOnline }
    : null;

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-120px)]">
        <ChatListPanel
          chats={chats}
          selectedChatId={activeChatId}
          showChatList={showChatList}
          isSellerView={isSeller}
          isLoading={chatsLoading}
          onSelectChat={handleSelectChat}
        />

        <ChatConversationPanel
          chatDetail={chatDetail}
          messages={messages}
          currentUserId={currentUserId}
          otherUser={otherUserWithOnline}
          chatProduct={chatProduct}
          isSeller={isSeller}
          isLoading={chatLoading}
          isSending={isSending}
          showChatList={showChatList}
          showContextCard={showContextCard}
          showEmojiPicker={showEmojiPicker}
          newMessage={newMessage}
          attachedImage={attachedImage}
          fileInputRef={fileInputRef}
          messagesEndRef={messagesEndRef}
          onNavigate={onNavigate}
          onBack={handleBackToList}
          onSend={handleSendMessage}
          onKeyPress={handleKeyPress}
          onMessageChange={e => setNewMessage(e.target.value)}
          onImageUpload={handleImageUpload}
          onToggleEmoji={() => setShowEmojiPicker(p => !p)}
          onEmojiSelect={emoji => { setNewMessage(p => p + emoji); setShowEmojiPicker(false); }}
          onRemoveImage={() => { setAttachedImage(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
          onToggleContextCard={() => setShowContextCard(p => !p)}
          onAcceptOffer={handleAcceptOffer}
          onRejectOffer={handleRejectOffer}
          onBayarSekarang={handleBayarSekarang}
          onOpenNego={() => setShowNegoModal(true)}
          onOpenOffer={handleOpenOfferModal}
          formatPrice={formatPrice}
        />
      </div>

      <ChatActionModals
        showNegoModal={showNegoModal}
        showOfferModal={showOfferModal}
        negoPrice={negoPrice}
        offerPrice={offerPrice}
        sellerProducts={sellerProducts}
        selectedOfferProduct={selectedOfferProduct}
        chatProduct={chatProduct}
        isSending={isSending}
        onCloseNego={() => setShowNegoModal(false)}
        onCloseOffer={() => setShowOfferModal(false)}
        onNegoPriceChange={e => setNegoPrice(formatPriceInput(e.target.value))}
        onOfferPriceChange={e => setOfferPrice(formatPriceInput(e.target.value))}
        onSelectOfferProduct={setSelectedOfferProduct}
        onSubmitNego={handleSubmitNego}
        onSubmitOffer={handleSubmitOffer}
        isSeller={isSeller}
        onNavigateToDashboard={() => onNavigate('dashboard')}
        formatPrice={formatPrice}
      />
    </div>
  );
}
