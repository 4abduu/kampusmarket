'use client';

import { useCallback, useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { useAppToast } from "@/hooks/use-app-toast";

import ChatListPanel from '@/components/pages/user/chat/ChatListPanel';
import ChatConversationPanel from '@/components/pages/user/chat/ChatConversationPanel';
import ChatActionModals, { type SellerProduct } from '@/components/pages/user/chat/ChatActionModals';
import PageLoadingOverlay from '@/components/shared/PageLoadingOverlay';

import type { ApiChat, ApiChatDetail, ApiMessage, ApiChatProduct } from '@/components/pages/user/chat/chat.types';
import type { User } from '@/lib/mock-data';
import {
  fetchChats,
  startChat,
  fetchChatDetail,
  fetchMessages,
  sendMessage,
  markChatRead,
  acceptOffer,
  rejectOffer,
  startChatWithSeller,
  type StartChatPayload,
} from '@/lib/api/chat';
import { uploadImage } from '@/lib/api/images';
import { getEcho } from '@/lib/echo';
import apiClient from '@/lib/api/client';
import { useChatStore } from '@/lib/chat-store';

// ── Types ──────────────────────────────────────────────────────────────────

interface ChatPageProps {
  onNavigate: (page: string, data?: string | Record<string, unknown>) => void;
  initialContextId?: string;
  initialSellerId?: string;
  initialChatAction?: 'chat' | 'nego';
  initialBuyerId?: string;
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

export default function ChatPage({ onNavigate, initialContextId, initialSellerId, initialChatAction, initialBuyerId, currentUser }: ChatPageProps) {
  // currentUser dari props (App.tsx → AppRoutes → ChatPageWrapper → sini)
  // BUKAN dari localStorage — auth pakai HttpOnly cookie, user tidak disimpan di localStorage
  const currentUserId = currentUser?.id ?? '';

  const { success, error: toastError } = useAppToast();

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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [showNegoModal, setShowNegoModal] = useState(false);
  const [negoPrice, setNegoPrice] = useState('');
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const [sellerProducts, setSellerProducts] = useState<SellerProduct[]>([]);
  const [selectedOfferProduct, setSelectedOfferProduct] = useState<SellerProduct | null>(null);
  const [typingChatIds, setTypingChatIds] = useState<Set<string>>(new Set());
  const typingTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReportMessage, setSelectedReportMessage] = useState<ApiMessage | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');

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
        .listenForWhisper('typing', (e: { isTyping: boolean; chatId: string; senderId: string }) => {
          if (e.isTyping && e.senderId !== currentUserId) {
            setTypingChatIds(prev => {
              const next = new Set(prev);
              next.add(e.chatId);
              return next;
            });
            const existingTimeout = typingTimeoutsRef.current.get(e.chatId);
            if (existingTimeout) clearTimeout(existingTimeout);
            
            const newTimeout = setTimeout(() => {
              setTypingChatIds(prev => {
                const next = new Set(prev);
                next.delete(e.chatId);
                return next;
              });
              typingTimeoutsRef.current.delete(e.chatId);
            }, 3000);
            
            typingTimeoutsRef.current.set(e.chatId, newTimeout);
          }
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
    // [REVISI] Update isOnline di chats list secara realtime.
    // Jangan return early jika size 0 agar status bisa berubah jadi offline.
    setChats(prev => prev.map(c => ({
      ...c,
      otherUser: {
        ...c.otherUser,
        isOnline: onlineUserIds.has(c.otherUser.id),
      },
    })));
  }, [onlineUserIds]);

  // ── Open chat ──────────────────────────────────────────────────────────────

  const openChat = useCallback(async (chatUuid: string) => {
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
    setChatDetail(null);

    try {
      const detail = await fetchChatDetail(chatUuid);
      setChatDetail(detail);
      
      // Fetch messages page 1
      const messagesRes = await fetchMessages(chatUuid, 1);
      
      // The API returns paginated data (latest first). We need to reverse them for the chat UI if it expects oldest first.
      // Or maybe the API returns oldest first? Let's assume it returns oldest first since it's a chat. 
      // Actually, standard pagination usually returns latest first, but the previous `messages` eager load used `oldest()`.
      // Wait, let's check what `fetchMessages` returns from the backend.
      setMessages(messagesRes.data ?? []);
      
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
          const isVisible = document.visibilityState === 'visible';
          const isFromMe = incoming.senderId === currentUserId;
          // Only force isRead to true if the message is from someone else and the window is active
          const shouldMarkAsRead = !isFromMe && isVisible;
          
          setMessages(prev => {
            const existingIdx = prev.findIndex(m => m.id === incoming.id);
            if (existingIdx !== -1) {
              const next = [...prev];
              next[existingIdx] = { ...incoming, isRead: prev[existingIdx].isRead || shouldMarkAsRead || incoming.isRead };
              return next;
            }
            
            // Deduplicate optimistic messages
            const pendingIdx = prev.findIndex(m => m._pending && m.senderId === incoming.senderId && m.type === incoming.type);
            if (pendingIdx !== -1) {
              const next = [...prev];
              next[pendingIdx] = { ...incoming, isRead: prev[pendingIdx].isRead || shouldMarkAsRead || incoming.isRead };
              return next;
            }

            return [...prev, { ...incoming, isRead: shouldMarkAsRead || incoming.isRead }];
          });

          setChats(prevChats => prevChats.map(c =>
            c.id === chatUuid
              ? { ...c, lastMessage: incoming.content || '[lampiran]', lastMessageAt: incoming.createdAt }
              : c
          ));

          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
          
          if (isVisible && !isFromMe) {
            markChatRead(chatUuid).catch(() => null);
            // Update unread count global
            useChatStore.getState().decrementUnreadCount();
          }
        });

        // [REVISI] Listen status read dari room chat yang sama
        channel.listen('.MessagesRead', (event: { chatId: string, readerId: string, readAt: string }) => {
          if (event.readerId !== currentUserId) {
            // Jika orang lain yang baca, tandai semua pesan saya sebagai read
            setMessages(prev => prev.map(m => 
              m.senderId === currentUserId ? { ...m, isRead: true, readAt: event.readAt } : m
            ));
          }
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
      toastError('Gagal memuat chat', '');
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
        setShowChatList(false);
        setChatLoading(true);
        
        const payload: StartChatPayload = { productId: initialContextId };
        if (initialBuyerId) {
          payload.buyerId = initialBuyerId;
        }
        const chat = await startChat(payload);
        setChats(prev => {          if (prev.some(c => c.id === chat.id)) return prev;
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
        await openChat(chat.id);
        if (initialChatAction === 'nego' && chat.product?.canNego) setShowNegoModal(true);
      } catch (err: any) {
        setChatLoading(false);
        setShowChatList(true);
        console.error('[Chat] startChat error', err);
        const errMsg: string = err?.response?.data?.message || err?.message || '';
        if (errMsg.toLowerCase().includes('diri sendiri') || err?.response?.status === 400) {
          toastError(errMsg || 'Tidak dapat membuka chat ini', 'Kamu tidak dapat chat dengan produk milikmu sendiri.');
        } else {
          toastError('Gagal membuka chat dengan penjual', '');
        }
      }
    })();
  }, [initialContextId, initialChatAction, currentUserId, openChat]);

  // ── Trigger dari halaman profil seller (sellerId tanpa productId) ──────────
  useEffect(() => {
    if (!initialSellerId || !currentUserId || initialContextId) return;
    const key = `seller:${initialSellerId}`;
    if (lastContextRef.current === key) return;
    lastContextRef.current = key;

    void (async () => {
      try {
        setShowChatList(false);
        setChatLoading(true);
        const chat = await startChatWithSeller(initialSellerId);
        setChats(prev => {
          if (prev.some(c => c.id === chat.id)) return prev;
          const item: ApiChat = {
            id: chat.id,
            product: chat.product ? {
              id: chat.product.id ?? '',
              title: chat.product.title ?? '',
              slug: chat.product.slug ?? '',
              price: chat.product.price ?? 0,
              image: chat.product.images?.[0] ?? '',
              type: (chat.product.type ?? 'barang') as 'barang' | 'jasa',
              canNego: chat.product.canNego ?? false,
              sellerId: chat.seller?.id ?? '',
            } : null,
            otherUser: chat.seller ?? { id: '', name: '', avatar: '', faculty: null, rating: 0, reviewCount: 0, isVerified: false, isOnline: false, lastSeen: null },
            lastMessage: chat.lastMessage,
            lastMessageAt: chat.lastMessageAt,
            unreadCount: 0,
            isActive: true,
          };
          return [item, ...prev];
        });
        await openChat(chat.id);
      } catch (err: any) {
        setChatLoading(false);
        setShowChatList(true);
        console.error('[Chat] startChatWithSeller error', err);
        toastError('Gagal membuka chat dengan penjual', '');
      }
    })();
  }, [initialSellerId, currentUserId, initialContextId, openChat]);

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
    await openChat(chat.id);
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

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (presenceChannelRef.current && activeChatId) {
      presenceChannelRef.current.whisper('typing', { isTyping: true, chatId: activeChatId, senderId: currentUserId });
    }
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi Tipe File (MIME type & Ekstensi)
    const validMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const validExtensions = ['jpg', 'jpeg', 'png', 'webp'];

    if (!validMimeTypes.includes(file.type) && (!fileExtension || !validExtensions.includes(fileExtension))) {
      toastError('Format gambar tidak valid', 'Format gambar harus JPG, JPEG, PNG, atau WEBP');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validasi Ukuran File (Maksimal 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toastError('Gambar terlalu besar', 'Ukuran gambar maksimal 2 MB');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAttachedImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async () => {
    if (!chatDetail || (!newMessage.trim() && !attachedImage) || isSending) return;
    const content = newMessage.trim();
    setIsSending(true);
    
    const fileToUpload = imageFile;
    
    setNewMessage('');
    setAttachedImage(null);
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    const tempId = `temp-${Date.now()}`;
    const optimistic: ApiMessage = {
      id: tempId, chatId: chatDetail.id, senderId: currentUserId, content,
      type: fileToUpload ? 'image' : 'text', offerPrice: null, offerStatus: null,
      imageUrls: attachedImage ? [attachedImage] : [], fileUrls: [], fileUrl: null,
      isRead: false, readAt: null, createdAt: new Date().toISOString(), _pending: true,
    };
    setMessages(prev => [...prev, optimistic]);

    try {
      let uploadedUrls: string[] = [];
      if (fileToUpload) {
        const uploadResult = await uploadImage(fileToUpload, 'messages');
        let relativePath = uploadResult.url;
        if (relativePath.startsWith('/storage/')) {
          relativePath = relativePath.substring(9);
        } else if (relativePath.startsWith('storage/')) {
          relativePath = relativePath.substring(8);
        }
        uploadedUrls = [relativePath];
      }

      const sent = await sendMessage(chatDetail.id, {
        content: content || undefined,
        type: fileToUpload ? 'image' : 'text',
        imageUrls: fileToUpload ? uploadedUrls : undefined,
      });
      setMessages(prev => prev.map(m => m.id === tempId ? { ...sent, isRead: m.isRead || sent.isRead } : m));
      setChats(prev => prev.map(c => c.id === chatDetail.id ? { ...c, lastMessage: content || '[gambar]', lastMessageAt: sent.createdAt } : c));
    } catch (error) {
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setNewMessage(content);
      if (fileToUpload) {
        setImageFile(fileToUpload);
        const reader = new FileReader();
        reader.onloadend = () => setAttachedImage(reader.result as string);
        reader.readAsDataURL(fileToUpload);
      }
      toastError('Gagal mengirim pesan', '');
      console.error('Send message failed:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleSendMessage(); }
  };

  const handleSubmitNego = async () => {
    if (!chatProduct || !negoPrice || isSending) return;
    const price = parseInt(negoPrice.replace(/\D/g, ''), 10);
    if (!price || price <= 0) return;
    setIsSending(true);
    
    const tempId = `temp-${Date.now()}`;
    const optimistic: ApiMessage = {
      id: tempId, chatId: chatDetail!.id, senderId: currentUserId,
      content: 'Halo, saya ingin menawar harga untuk produk ini.',
      type: 'offer', offerPrice: price, offerStatus: null,
      imageUrls: [], fileUrls: [], fileUrl: null,
      isRead: false, readAt: null, createdAt: new Date().toISOString(), _pending: true,
    };
    setMessages(prev => [...prev, optimistic]);
    try {
      const msg = await sendMessage(chatDetail!.id, {
        content: 'Halo, saya ingin menawar harga untuk produk ini.',
        type: 'offer', offerPrice: price, productId: activeProduct?.id,
      });
      setMessages(prev => prev.map(m => m.id === tempId ? { ...msg, isRead: m.isRead || msg.isRead } : m));
      setChats(prev => prev.map(c => c.id === chatDetail!.id ? { ...c, lastMessage: '\u{1F4B0} Penawaran harga', lastMessageAt: msg.createdAt } : c));
      setNegoPrice('');
      success('Penawaran terkirim!', '');
      setShowNegoModal(false);
    } catch {
      setMessages(prev => prev.filter(m => m.id !== tempId));
      toastError('Gagal mengirim penawaran', ''); setShowNegoModal(true);
    }
    finally { setIsSending(false); }
  };

  const handleSubmitOffer = async () => {
    if (!chatDetail || !selectedOfferProduct || !offerPrice || isSending) return;
    const price = parseInt(offerPrice.replace(/\D/g, ''), 10);
    if (!price || price <= 0) return;
    setIsSending(true);

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
        type: 'offer', offerPrice: price, productId: selectedOfferProduct.id,
      });
      setMessages(prev => prev.map(m => m.id === tempId ? { ...msg, isRead: m.isRead || msg.isRead } : m));
      setOfferPrice(''); setSelectedOfferProduct(null);
      success('Penawaran terkirim!', '');
      setShowOfferModal(false);
    } catch {
      setMessages(prev => prev.filter(m => m.id !== tempId));
      toastError('Gagal mengirim penawaran', ''); setShowOfferModal(true);
    }
    finally { setIsSending(false); }
  };

  const handleAcceptOffer = async (message: ApiMessage) => {
    if (!chatDetail || isSending) return;
    setIsSending(true);
    try {
      const updated = await acceptOffer(chatDetail.id, message.id);
      setMessages(prev => prev.map(m => m.id === message.id ? updated : m));
      success('Penawaran diterima!', '');
    } catch { toastError('Gagal menerima penawaran', ''); }
    finally { setIsSending(false); }
  };

  const handleRejectOffer = async (message: ApiMessage) => {
    if (!chatDetail || isSending) return;
    setIsSending(true);
    try {
      const updated = await rejectOffer(chatDetail.id, message.id);
      setMessages(prev => prev.map(m => m.id === message.id ? updated : m));
      success('Penawaran ditolak', '');
    } catch { toastError('Gagal menolak penawaran', ''); }
    finally { setIsSending(false); }
  };

  // FIX #6: Bayar Sekarang → langsung checkout, tanpa dialog pilih metode
  const handleBayarSekarang = (message: ApiMessage) => {
    const product = chatProduct;
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

  const handleReportMessage = (message: ApiMessage) => {
    setSelectedReportMessage(message);
    setReportReason('Spam');
    setReportDescription('');
    setShowReportModal(true);
  };

  const handleSubmitReport = async () => {
    if (!chatDetail || !selectedReportMessage || isSending) return;
    setIsSending(true);
    try {
      await apiClient.post('/reports', {
        reason: reportReason,
        description: reportDescription,
        reportedUserId: selectedReportMessage.senderId,
        messageId: selectedReportMessage.id,
        type: 'chat',
      });
      success('Pesan berhasil dilaporkan', '');
      setShowReportModal(false);
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Gagal melaporkan pesan';
      toastError('Gagal melaporkan', msg);
    } finally {
      setIsSending(false);
    }
  };

  const isSellerGlobal = chatDetail ? chatDetail.seller?.id === currentUserId : false;

  const lastProductMessage = [...messages].reverse().find(m => m.type === 'system' && m.product);
  const activeProduct = lastProductMessage?.product;

  const chatProduct: ApiChatProduct | null = activeProduct
    ? {
        id: activeProduct.id,
        title: activeProduct.title,
        slug: activeProduct.slug,
        price: activeProduct.price,
        image: activeProduct.image ?? '',
        type: (activeProduct.type ?? 'barang') as 'barang' | 'jasa',
        canNego: activeProduct.canNego ?? false,
        sellerId: activeProduct.sellerId ?? chatDetail?.seller?.id ?? '',
      }
    : null;

  const isSeller = chatProduct ? chatProduct.sellerId === currentUserId : isSellerGlobal;

  const otherUser = chatDetail
    ? (isSellerGlobal ? chatDetail.buyer : chatDetail.seller)
    : null;

  // [REVISI] Terapkan status online realtime dari presence channel ke otherUser
  const otherUserWithOnline = otherUser
    ? { ...otherUser, isOnline: onlineUserIds.has(otherUser.id) || otherUser.isOnline }
    : null;

  return (
    <>
      {chatLoading && !chatDetail && <PageLoadingOverlay message="Membuka chat..." />}
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-120px)]">
          <ChatListPanel
            chats={chats}
          selectedChatId={activeChatId}
          showChatList={showChatList}
          isSellerView={isSeller}
          isLoading={chatsLoading}
          typingChatIds={typingChatIds}
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
          showEmojiPicker={showEmojiPicker}
          newMessage={newMessage}
          attachedImage={attachedImage}
          fileInputRef={fileInputRef}
          messagesEndRef={messagesEndRef}
          onNavigate={onNavigate}
          onBack={handleBackToList}
          onSend={handleSendMessage}
          onKeyPress={handleKeyPress}
          onMessageChange={handleMessageChange}
          onImageUpload={handleImageUpload}
          onToggleEmoji={() => setShowEmojiPicker(p => !p)}
          onEmojiSelect={emoji => { setNewMessage(p => p + emoji); setShowEmojiPicker(false); }}
          onRemoveImage={() => { setAttachedImage(null); setImageFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
          onAcceptOffer={handleAcceptOffer}
          onRejectOffer={handleRejectOffer}
          onBayarSekarang={handleBayarSekarang}
          onOpenNego={() => setShowNegoModal(true)}
          onOpenOffer={handleOpenOfferModal}
          formatPrice={formatPrice}
          onReportMessage={handleReportMessage}
          isOtherUserTyping={activeChatId ? typingChatIds.has(activeChatId) : false}
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

      {/* Modal Report Message */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-semibold text-lg flex items-center gap-2 text-red-600">
                Laporkan Pesan
              </h3>
              <button onClick={() => setShowReportModal(false)} className="text-muted-foreground hover:text-foreground">
                <span className="sr-only">Tutup</span>
                &times;
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm text-muted-foreground italic border-l-4 border-slate-300">
                "{selectedReportMessage?.content}"
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Alasan Laporan</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                >
                  <option value="Spam">Spam</option>
                  <option value="Penipuan">Penipuan</option>
                  <option value="Kata-kata Kasar">Kata-kata Kasar</option>
                  <option value="Pelecehan">Pelecehan</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Detail Tambahan</label>
                <textarea 
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground"
                  placeholder="Ceritakan detail lebih lanjut..."
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                />
              </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
              <button 
                className="px-4 py-2 text-sm border rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => setShowReportModal(false)}
              >
                Batal
              </button>
              <button 
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                onClick={handleSubmitReport}
                disabled={isSending}
              >
                {isSending ? 'Mengirim...' : 'Kirim Laporan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
