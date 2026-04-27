/**
 * lib/api/chat.ts [BARU]
 *
 * Semua fungsi API untuk fitur Chat & Nego.
 * Memanggil endpoint Laravel yang sudah ada di routes/api.php.
 */

import apiClient from './client';
import type { ApiChat, ApiMessage, ApiChatDetail } from '@/components/pages/user/chat/chat.types';

// ── Types untuk request ────────────────────────────────────────────────────

export interface StartChatPayload {
  productId: string; // UUID produk
}

export interface SendMessagePayload {
  content?: string;
  type: 'text' | 'offer' | 'image' | 'file';
  offerPrice?: number;    // dalam Rupiah (direct IDR, bukan cent)
  imageUrls?: string[];
  fileUrl?: string;
}

// ── API Functions ──────────────────────────────────────────────────────────

/**
 * GET /chats — list semua chat aktif user
 */
export async function fetchChats(): Promise<ApiChat[]> {
  const res = await apiClient.get<unknown, { success: boolean; data: ApiChat[] }>('/chats');
  return res.data;
}

/**
 * POST /chats — start atau ambil chat yang sudah ada
 */
export async function startChat(payload: StartChatPayload): Promise<ApiChatDetail> {
  const res = await apiClient.post<unknown, { success: boolean; data: ApiChatDetail }>('/chats', payload);
  return res.data;
}

/**
 * GET /chats/{uuid} — detail chat + messages
 */
export async function fetchChatDetail(uuid: string): Promise<ApiChatDetail> {
  const res = await apiClient.get<unknown, { success: boolean; data: ApiChatDetail }>(`/chats/${uuid}`);
  return res.data;
}

/**
 * GET /chats/{uuid}/messages — pesan dengan pagination
 */
export async function fetchMessages(
  chatUuid: string,
  page = 1
): Promise<{ data: ApiMessage[]; meta: { currentPage: number; lastPage: number; total: number } }> {
  const res = await apiClient.get<
    unknown,
    { success: boolean; data: ApiMessage[]; meta: { currentPage: number; lastPage: number; total: number } }
  >(`/chats/${chatUuid}/messages`, { params: { page } });
  return { data: res.data, meta: res.meta };
}

/**
 * POST /chats/{uuid}/messages — kirim pesan
 */
export async function sendMessage(chatUuid: string, payload: SendMessagePayload): Promise<ApiMessage> {
  const res = await apiClient.post<unknown, { success: boolean; data: ApiMessage }>(
    `/chats/${chatUuid}/messages`,
    payload
  );
  return res.data;
}

/**
 * POST /chats/{uuid}/read — tandai chat sebagai terbaca
 */
export async function markChatRead(chatUuid: string): Promise<void> {
  await apiClient.post(`/chats/${chatUuid}/read`);
}

/**
 * GET /chats/unread-count
 */
export async function fetchUnreadCount(): Promise<number> {
  const res = await apiClient.get<unknown, { success: boolean; data: { unreadCount: number } }>(
    '/chats/unread-count'
  );
  return res.data.unreadCount;
}

/**
 * POST /chats/{chatUuid}/messages/{messageUuid}/accept-offer — penjual terima nego
 */
export async function acceptOffer(chatUuid: string, messageUuid: string): Promise<ApiMessage> {
  const res = await apiClient.post<unknown, { success: boolean; data: ApiMessage }>(
    `/chats/${chatUuid}/messages/${messageUuid}/accept-offer`
  );
  return res.data;
}

/**
 * POST /chats/{chatUuid}/messages/{messageUuid}/reject-offer — penjual tolak nego
 */
export async function rejectOffer(chatUuid: string, messageUuid: string): Promise<ApiMessage> {
  const res = await apiClient.post<unknown, { success: boolean; data: ApiMessage }>(
    `/chats/${chatUuid}/messages/${messageUuid}/reject-offer`
  );
  return res.data;
}
