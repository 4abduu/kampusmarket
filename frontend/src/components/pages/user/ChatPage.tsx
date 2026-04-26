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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastContextRef = useRef<string | null>(null);
  const echoChannelRef = useRef<ReturnType<ReturnType<typeof getEcho>['private']> | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  useEffect(() => {
    if (currentUserId) void loadChats();
    else setChatsLoading(false); // jangan biarkan skeleton forever jika tidak login
  }, [currentUserId, loadChats]);

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

      // Coba Reverb dulu — kalau gagal, fallback ke polling 5 detik
      let realtimeOk = false;
      try {
        const echo = getEcho();
        const channel = echo.private(`chat.${chatUuid}`);
        channel.listen('.MessageSent', (event: { message: ApiMessage }) => {
          const incoming = event.message;
          setMessages(prev => {
            // Dedup: jika ID sudah ada (real atau temp), jangan tambah
            if (prev.some(m => m.id === incoming.id)) return prev;
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
  }, [activeChatId]);

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
    } as Record<string, unknown>);
  };

  const handleOpenOfferModal = async () => {
    setShowOfferModal(true);
    if (sellerProducts.length > 0 || !chatDetail?.seller) return;
    try {
      const res = await apiClient.get<
        unknown,
        { success: boolean; data: { id: string; title: string; price: number; image?: string; canNego: boolean; stock: number }[] }
      >(`/users/${chatDetail.seller.id}/products?type=barang`);
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

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-slate-100 via-slate-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 h-[calc(100vh-140px)] sm:h-[calc(100vh-160px)]">
          <ChatListPanel
            chats={chats}
            selectedChatId={activeChatId}
            showChatList={showChatList}
            isSellerView={isSeller}
            isLoading={chatsLoading}
            onSelectChat={handleSelectChat}
          />

          <ChatConversationPanel
            chat={chatDetail}
            currentUserId={currentUserId}
            showChatList={showChatList}
            messages={messages}
            isLoading={chatLoading}
            isSending={isSending}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            showEmojiPicker={showEmojiPicker}
            setShowEmojiPicker={setShowEmojiPicker}
            attachedImage={attachedImage}
            fileInputRef={fileInputRef}
            messagesEndRef={messagesEndRef}
            showContextCard={showContextCard}
            onNavigate={onNavigate as (page: string, productId?: string) => void}
            onOpenProfile={() => {
              const other = chatDetail ? (isSeller ? chatDetail.buyer : chatDetail.seller) : null;
              if (other) onNavigate('profile', other.id);
            }}
            setShowNegoModal={setShowNegoModal}
            setShowOfferModal={() => void handleOpenOfferModal()}
            onBackToList={handleBackToList}
            onHandleImageUpload={handleImageUpload}
            onRemoveImage={() => { setAttachedImage(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
            onAddEmoji={emoji => { setNewMessage(prev => prev + emoji); setShowEmojiPicker(false); }}
            onSendMessage={() => void handleSendMessage()}
            onKeyPress={handleKeyPress}
            onAcceptOffer={handleAcceptOffer}
            onRejectOffer={handleRejectOffer}
            onOpenPaymentDialog={handleBayarSekarang}
            formatPrice={formatPrice}
          />
        </div>
      </div>

      <ChatActionModals
        showNegoModal={showNegoModal}
        setShowNegoModal={setShowNegoModal}
        chatProduct={chatProduct}
        showOfferModal={showOfferModal}
        setShowOfferModal={setShowOfferModal}
        sellerProducts={sellerProducts}
        selectedOfferProduct={selectedOfferProduct}
        setSelectedOfferProduct={setSelectedOfferProduct}
        negoPrice={negoPrice}
        setNegoPrice={setNegoPrice}
        offerPrice={offerPrice}
        setOfferPrice={setOfferPrice}
        formatPrice={formatPrice}
        formatPriceInput={formatPriceInput}
        handleSubmitNego={() => void handleSubmitNego()}
        handleSubmitOffer={() => void handleSubmitOffer()}
        isSubmitting={isSending}
        isSeller={isSeller}
        onNavigateToDashboard={() => onNavigate('my-products')}
      />
    </div>
  );
}
