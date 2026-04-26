/**
 * chat/chat.types.ts [REVISI]
 *
 * Semua tipe untuk fitur Chat yang sinkron dengan response API Laravel.
 * Tidak ada lagi tipe yang bergantung pada mock-data.
 */

// ── Konstanta ──────────────────────────────────────────────────────────────

export const EMOJIS = [
  '😀', '😂', '🥰', '😍', '🙏', '👍', '👌', '❤️', '🔥', '⭐',
  '💰', '📦', '🚀', '✨', '🙌', '😅', '🤔', '😢', '😮', '🎉',
];

// ── API Response Types (sinkron dengan Laravel Resources) ──────────────────

/** Data user minimal — dari UserResource.toMinimalArray() */
export interface ApiUser {
  id: string;         // uuid
  name: string;
  avatar: string;
  faculty: string | null;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  isOnline: boolean;  // [BARU] dari User::isOnline()
  lastSeen: string | null;
}

/** Card produk di list chat — dari ChatResource.getProductCardWithNego() */
export interface ApiChatProduct {
  id: string;         // uuid
  title: string;
  slug: string;
  price: number;      // dalam Rupiah
  image: string;
  type: 'barang' | 'jasa';
  canNego: boolean;   // [BARU]
  sellerId: string;
}

/** Item dalam list chat — dari ChatResource.toListArray() */
export interface ApiChat {
  id: string;           // uuid chat
  product: ApiChatProduct;
  otherUser: ApiUser;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  isActive: boolean;
}

/** Attachment pesan */
export interface ApiAttachment {
  id: number;
  type: 'image' | 'file';
  url: string;
  sortOrder: number;
}

/** Pesan — dari MessageResource */
export interface ApiMessage {
  id: string;          // uuid
  chatId: string;
  senderId: string;    // uuid sender
  content: string;
  type: 'text' | 'offer' | 'image' | 'file' | 'system';
  offerPrice: number | null;
  offerStatus: 'pending' | 'accepted' | 'rejected' | null;
  imageUrls: string[];
  fileUrls: string[];
  fileUrl: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  // Tambahan yang diisi oleh getEcho listener atau lokal optimistic
  _pending?: boolean;
}

/** Detail chat penuh (show endpoint) — dari ChatResource.toArray() */
export interface ApiChatDetail {
  id: string;
  productId: string;
  product: {
    id: string;
    title: string;
    slug: string;
    price: number;
    images: string[];
    type: string;
    canNego: boolean;
    condition?: string;
    seller: ApiUser;
  } | null;
  seller: ApiUser | null;
  buyer: ApiUser | null;
  orderId: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  buyerUnread: number;
  sellerUnread: number;
  isActive: boolean;
  messages: ApiMessage[];
}

// ── UI State Types ─────────────────────────────────────────────────────────

/** State satu chat yang sedang terbuka */
export interface ChatRoomState {
  chatUuid: string;
  messages: ApiMessage[];
  isLoading: boolean;
  isSending: boolean;
}
