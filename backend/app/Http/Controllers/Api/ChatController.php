<?php

namespace App\Http\Controllers\Api;

use App\Events\MessageSent;
use App\Events\MessagesRead;
use App\Events\NewMessageNotification;
use App\Http\Controllers\Controller;
use App\Models\Chat;
use App\Models\Message;
use App\Models\Product;
use App\Http\Resources\ChatResource;
use App\Http\Resources\MessageResource;
use App\Http\Requests\SendMessageRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

/**
 * Controller: ChatController [REVISI]
 * Perubahan:
 * - sendMessage sekarang fire event MessageSent untuk broadcast Reverb
 * - sendMessage support tipe 'offer' dengan offer_product_id (untuk nego)
 * - acceptOffer / rejectOffer juga broadcast notifikasi
 * - index / messages sertakan data isOnline dari otherUser
 * [REVISI] Tambah broadcast NewMessageNotification ke channel users.{receiverId}
 *   agar penerima mendapat update realtime meski tidak sedang membuka chat tersebut.
 */
class ChatController extends Controller
{
    /**
     * GET /chats
     * List semua chat aktif milik user yang login (sebagai buyer atau seller).
     */
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $chats = Chat::with(['product.images', 'product.seller', 'buyer', 'seller'])
            ->where(function ($q) use ($userId) {
                $q->where('buyer_id', $userId)->orWhere('seller_id', $userId);
            })
            ->where('is_active', true)
            ->latest('last_message_at')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $chats->map(fn ($chat) => (new ChatResource($chat))->toListArray($userId)),
        ]);
    }

    /**
     * POST /chats
     * Start atau ambil chat yang sudah ada berdasarkan productId (UUID).
     * Dipakai dari halaman detail produk/jasa saat klik "Chat" atau "Ajukan Nego".
     */
    public function start(Request $request): JsonResponse
    {
        $request->validate([
            'productId' => 'required|exists:products,uuid',
            'buyerId'   => 'nullable|exists:users,uuid',
        ]);

        $user    = $request->user();
        $product = Product::where('uuid', $request->productId)
            ->with(['seller', 'images'])
            ->firstOrFail();

        if ($product->seller_id === $user->id) {
            if (!$request->buyerId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak dapat mengobrol dengan diri sendiri',
                ], 400);
            }
            $buyer = \App\Models\User::where('uuid', $request->buyerId)->firstOrFail();
            $buyerId = $buyer->id;
            $sellerId = $user->id;
        } else {
            $buyerId = $user->id;
            $sellerId = $product->seller_id;
        }

        $chat = Chat::firstOrCreate(
            [
                'product_id' => $product->id,
                'buyer_id'   => $buyerId,
                'seller_id'  => $sellerId,
            ],
            [
                'is_active' => true,
            ]
        );

        return response()->json([
            'success' => true,
            'data'    => new ChatResource($chat->load(['product.images', 'product.seller', 'buyer', 'seller'])),
        ]);
    }

    /**
     * GET /chats/{uuid}
     * Detail chat lengkap + messages.
     */
    public function show(string $id, Request $request): JsonResponse
    {
        $chat = Chat::with([
            'product.images',
            'product.seller',
            'buyer',
            'seller',
            'messages' => fn ($q) => $q->with(['sender', 'attachments'])->oldest(),
        ])->where('uuid', $id)->firstOrFail();

        $userId = $request->user()->id;

        if ($chat->buyer_id !== $userId && $chat->seller_id !== $userId) {
            return response()->json(['success' => false, 'message' => 'Akses ditolak'], 403);
        }

        $readAt = now();

        // Tandai pesan sebagai terbaca
        $chat->messages()
            ->where('sender_id', '!=', $userId)
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => $readAt]);

        $chat->markAsReadFor($userId);

        $chat->load([
            'product.images',
            'product.seller',
            'buyer',
            'seller',
            'messages' => fn ($q) => $q->with(['sender', 'attachments'])->oldest(),
        ]);

        $chat->setRelation('messages', $chat->messages->map(function (Message $message) use ($userId) {
            if ($message->sender_id !== $userId) {
                $message->is_read = true;
                $message->read_at = now();
            }

            return $message;
        }));

        broadcast(new MessagesRead($chat->uuid, $request->user()->uuid, $readAt->toISOString()));

        return response()->json([
            'success' => true,
            'data'    => new ChatResource($chat),
        ]);
    }

    /**
     * GET /chats/{uuid}/messages
     * Ambil pesan dengan pagination.
     */
    public function messages(string $id, Request $request): JsonResponse
    {
        $chat   = Chat::where('uuid', $id)->firstOrFail();
        $userId = $request->user()->id;

        if ($chat->buyer_id !== $userId && $chat->seller_id !== $userId) {
            return response()->json(['success' => false, 'message' => 'Akses ditolak'], 403);
        }

        $messages = $chat->messages()
            ->with(['sender', 'chat', 'attachments'])
            ->oldest()
            ->paginate(100);

        $readAt = now();

        // Mark as read
        $chat->messages()
            ->where('sender_id', '!=', $userId)
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => $readAt]);

        $chat->markAsReadFor($userId);

        $items = collect($messages->items())->map(function (Message $message) use ($userId) {
            if ($message->sender_id !== $userId) {
                $message->is_read = true;
                $message->read_at = now();
            }

            return $message;
        });

        broadcast(new MessagesRead($chat->uuid, $request->user()->uuid, $readAt->toISOString()));

        return response()->json([
            'success' => true,
            'data'    => MessageResource::collection($items),
            'meta'    => [
                'currentPage' => $messages->currentPage(),
                'lastPage'    => $messages->lastPage(),
                'total'       => $messages->total(),
            ],
        ]);
    }

    /**
     * POST /chats/{uuid}/messages
     * Kirim pesan (text / offer / image / file).
     * [REVISI] Setelah simpan, fire event MessageSent untuk broadcast Reverb.
     * [REVISI] Tambah broadcast NewMessageNotification ke channel users.{receiverId}
     *   agar penerima update list chat secara realtime tanpa refresh.
     */
    public function sendMessage(string $id, SendMessageRequest $request): JsonResponse
    {
        $chat   = Chat::where('uuid', $id)->firstOrFail();
        $userId = $request->user()->id;

        if ($chat->buyer_id !== $userId && $chat->seller_id !== $userId) {
            return response()->json(['success' => false, 'message' => 'Akses ditolak'], 403);
        }

        $message = DB::transaction(function () use ($request, $chat, $userId) {
            $msgData = [
                'chat_id'      => $chat->id,
                'sender_id'    => $userId,
                'content'      => $request->content ?? '',
                'type'         => $request->type,
                'offer_price'  => $request->offer_price,
                'offer_status' => $request->type === 'offer' ? 'pending' : null,
            ];

            $message = Message::create($msgData);

            // Simpan attachment (image / file)
            if (in_array($request->type, ['image', 'file'], true)) {
                $urls = collect($request->input('attachment_urls', []))
                    ->take($request->type === 'image' ? 5 : 1)
                    ->values()
                    ->map(fn ($url, $i) => [
                        'type'       => $request->type,
                        'url'        => $url,
                        'sort_order' => $i + 1,
                    ])
                    ->all();

                if (!empty($urls)) {
                    $message->attachments()->createMany($urls);
                }
            }

            // Update summary chat
            $preview = match ($request->type) {
                'offer' => '💰 Penawaran harga',
                'image' => '📷 Gambar',
                'file'  => '📎 File',
                default => mb_strimwidth($request->content ?? '', 0, 80, '…'),
            };

            $chat->update([
                'last_message'    => $preview,
                'last_message_at' => now(),
            ]);

            $chat->incrementUnreadFor($userId);

            return $message;
        });

        $message->loadMissing(['sender', 'chat', 'attachments']);

        // Broadcast ke private channel chat — untuk penerima yang sedang membuka chat ini
        broadcast(new MessageSent($message));

        // [REVISI] Broadcast ke private channel user penerima — untuk update list chat
        // dan notifikasi realtime meski penerima tidak sedang membuka chat ini.
        $chat->loadMissing(['buyer', 'seller']);
        $receiverUuid = $chat->buyer_id === $userId
            ? $chat->seller?->uuid
            : $chat->buyer?->uuid;

        if ($receiverUuid) {
            broadcast(new NewMessageNotification($message, $receiverUuid));
        }

        return response()->json([
            'success' => true,
            'message' => 'Pesan terkirim',
            'data'    => new MessageResource($message),
        ]);
    }

    /**
     * POST /chats/{uuid}/read
     */
    public function markAsRead(string $id, Request $request): JsonResponse
    {
        $chat   = Chat::where('uuid', $id)->firstOrFail();
        $userId = $request->user()->id;

        if ($chat->buyer_id !== $userId && $chat->seller_id !== $userId) {
            return response()->json(['success' => false, 'message' => 'Akses ditolak'], 403);
        }

        $chat->messages()
            ->where('sender_id', '!=', $userId)
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => now()]);

        $chat->markAsReadFor($userId);

        $readAt = now()->toISOString();
        $chat->loadMissing(['messages' => fn ($q) => $q->with(['sender', 'attachments'])->oldest()]);
        $chat->setRelation('messages', $chat->messages->map(function (Message $message) use ($userId, $readAt) {
            if ($message->sender_id !== $userId) {
                $message->is_read = true;
                $message->read_at = now();
                $message->setAttribute('read_at', now());
            }

            return $message;
        }));

        broadcast(new MessagesRead($chat->uuid, $request->user()->uuid, $readAt));

        return response()->json(['success' => true, 'message' => 'Chat ditandai sudah dibaca']);
    }

    /**
     * GET /chats/unread-count
     */
    public function unreadCount(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $count  = Chat::where('buyer_id', $userId)->sum('buyer_unread');
        $count += Chat::where('seller_id', $userId)->sum('seller_unread');

        return response()->json([
            'success' => true,
            'data'    => ['unreadCount' => (int) $count],
        ]);
    }

    /**
     * GET /chats/{uuid}/messages/{messageUuid}/attachments
     */
    public function attachments(string $chatId, string $messageId, Request $request): JsonResponse
    {
        $chat   = Chat::where('uuid', $chatId)->firstOrFail();
        $userId = $request->user()->id;

        if ($chat->buyer_id !== $userId && $chat->seller_id !== $userId) {
            return response()->json(['success' => false, 'message' => 'Akses ditolak'], 403);
        }

        $message = $chat->messages()->where('uuid', $messageId)->with('attachments')->firstOrFail();

        return response()->json([
            'success' => true,
            'data'    => $message->attachments->map(fn ($a) => [
                'id'        => $a->id,
                'type'      => $a->type,
                'url'       => $a->url,
                'sortOrder' => $a->sort_order,
            ])->values(),
        ]);
    }

    /**
     * POST /chats/{chatUuid}/messages/{messageUuid}/accept-offer
     * [REVISI] Setelah accept, broadcast system message + notifikasi ke buyer.
     */
    public function acceptOffer(string $chatId, string $messageId, Request $request): JsonResponse
    {
        $chat    = Chat::where('uuid', $chatId)->firstOrFail();
        $message = Message::where('uuid', $messageId)->firstOrFail();
        $userId  = $request->user()->id;

        $expectedResponderId = $message->sender_id === $chat->buyer_id
            ? $chat->seller_id
            : $chat->buyer_id;

        if ($expectedResponderId !== $userId) {
            return response()->json(['success' => false, 'message' => 'Hanya penerima penawaran yang dapat menerima penawaran'], 403);
        }

        if ($message->type->value !== 'offer' || $message->offer_status->value !== 'pending') {
            return response()->json(['success' => false, 'message' => 'Penawaran tidak valid'], 400);
        }

        DB::transaction(function () use ($chat, $message, $userId) {
            $message->acceptOffer();

            // [FIX] Broadcast the updated offer message first so frontend can update UI immediately
            $message->loadMissing(['sender', 'chat', 'attachments']);
            broadcast(new MessageSent($message));

            $sysMsg = Message::create([
                'chat_id'   => $chat->id,
                'sender_id' => $userId,
                'content'   => '✅ Penawaran diterima! Silakan lanjutkan ke pembayaran.',
                'type'      => 'system',
            ]);

            $sysMsg->loadMissing(['sender', 'chat', 'attachments']);
            broadcast(new MessageSent($sysMsg));

            $chat->loadMissing(['buyer', 'seller']);
            $receiverUuid = $userId === $chat->buyer_id
                ? $chat->seller?->uuid
                : $chat->buyer?->uuid;

            // [REVISI] Broadcast ke lawan bicara agar list chatnya update realtime
            if ($receiverUuid) {
                broadcast(new NewMessageNotification($sysMsg, $receiverUuid));
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Penawaran diterima',
            'data'    => new MessageResource($message->fresh()),
        ]);
    }

    /**
     * POST /chats/{chatUuid}/messages/{messageUuid}/reject-offer
     */
    public function rejectOffer(string $chatId, string $messageId, Request $request): JsonResponse
    {
        $chat    = Chat::where('uuid', $chatId)->firstOrFail();
        $message = Message::where('uuid', $messageId)->firstOrFail();
        $userId  = $request->user()->id;

        $expectedResponderId = $message->sender_id === $chat->buyer_id
            ? $chat->seller_id
            : $chat->buyer_id;

        if ($expectedResponderId !== $userId) {
            return response()->json(['success' => false, 'message' => 'Hanya penerima penawaran yang dapat menolak penawaran'], 403);
        }

        if ($message->type->value !== 'offer' || $message->offer_status->value !== 'pending') {
            return response()->json(['success' => false, 'message' => 'Penawaran tidak valid'], 400);
        }

        DB::transaction(function () use ($chat, $message, $userId) {
            $message->rejectOffer();

            $sysMsg = Message::create([
                'chat_id'   => $chat->id,
                'sender_id' => $userId,
                'content'   => '❌ Penawaran ditolak.',
                'type'      => 'system',
            ]);

            $sysMsg->loadMissing(['sender', 'chat', 'attachments']);
            broadcast(new MessageSent($sysMsg));

            $chat->loadMissing(['buyer', 'seller']);
            $receiverUuid = $userId === $chat->buyer_id
                ? $chat->seller?->uuid
                : $chat->buyer?->uuid;

            // [REVISI] Broadcast ke lawan bicara agar list chatnya update realtime
            if ($receiverUuid) {
                broadcast(new NewMessageNotification($sysMsg, $receiverUuid));
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Penawaran ditolak',
            'data'    => new MessageResource($message->fresh()),
        ]);
    }
}
