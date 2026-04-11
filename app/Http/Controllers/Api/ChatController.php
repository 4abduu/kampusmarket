<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Chat;
use App\Models\Message;
use App\Models\Product;
use App\Http\Resources\ChatResource;
use App\Http\Resources\MessageResource;
use App\Http\Requests\SendMessageRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Helpers\NumberGenerator;
use Illuminate\Support\Facades\DB;

class ChatController extends Controller
{
    /**
     * Display a listing of chats for current user.
     */
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $chats = Chat::with(['product.images', 'buyer', 'seller'])
            ->where('buyer_id', $userId)
            ->orWhere('seller_id', $userId)
            ->where('is_active', true)
            ->latest('last_message_at')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $chats->map(function ($chat) use ($userId) {
                return (new ChatResource($chat))->toListArray($userId);
            }),
        ]);
    }

    /**
     * Start or get existing chat.
     */
    public function start(Request $request): JsonResponse
    {
        $request->validate([
            'productId' => 'required|exists:products,uuid',
        ]);

        $user = $request->user();
        $product = Product::where('uuid', $request->productId)->firstOrFail();

        // Cannot chat with yourself
        if ($product->seller_id === $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak dapat mengobrol dengan diri sendiri',
            ], 400);
        }

        // Find or create chat
        $chat = Chat::firstOrCreate(
            [
                'product_id' => $product->id,
                'buyer_id' => $user->id,
                'seller_id' => $product->seller_id,
            ],
            [
                'uuid' => NumberGenerator::uuid(),
                'is_active' => true,
            ]
        );

        return response()->json([
            'success' => true,
            'data' => new ChatResource($chat->load(['product.images', 'buyer', 'seller'])),
        ]);
    }

    /**
     * Display the specified chat with messages.
     */
    public function show(string $id, Request $request): JsonResponse
    {
        $chat = Chat::with(['product.images', 'buyer', 'seller', 'messages.sender'])
            ->where('uuid', $id)
            ->firstOrFail();

        $userId = $request->user()->id;

        // Check access
        if ($chat->buyer_id !== $userId && $chat->seller_id !== $userId) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke chat ini',
            ], 403);
        }

        // Mark as read
        $chat->markAsReadFor($userId);

        return response()->json([
            'success' => true,
            'data' => new ChatResource($chat),
        ]);
    }

    /**
     * Get messages for a chat.
     */
    public function messages(string $id, Request $request): JsonResponse
    {
        $chat = Chat::where('uuid', $id)->firstOrFail();

        $userId = $request->user()->id;

        // Check access
        if ($chat->buyer_id !== $userId && $chat->seller_id !== $userId) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke chat ini',
            ], 403);
        }

        $messages = $chat->messages()
            ->with(['sender', 'chat', 'attachments'])
            ->latest()
            ->paginate(50);

        // Mark messages as read
        $chat->messages()
            ->where('sender_id', '!=', $userId)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        $chat->markAsReadFor($userId);

        return response()->json([
            'success' => true,
            'data' => MessageResource::collection($messages->reverse()->values()),
        ]);
    }

    /**
     * Get attachments for a specific message in a chat.
     */
    public function attachments(string $chatId, string $messageId, Request $request): JsonResponse
    {
        $chat = Chat::where('uuid', $chatId)->firstOrFail();

        $userId = $request->user()->id;

        if ($chat->buyer_id !== $userId && $chat->seller_id !== $userId) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke chat ini',
            ], 403);
        }

        $message = $chat->messages()
            ->where('uuid', $messageId)
            ->with('attachments')
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $message->attachments->map(function ($attachment) {
                return [
                    'id' => $attachment->id,
                    'type' => $attachment->type,
                    'url' => $attachment->url,
                    'sortOrder' => $attachment->sort_order,
                ];
            })->values(),
        ]);
    }

    /**
     * Send a message.
     */
    public function sendMessage(string $id, SendMessageRequest $request): JsonResponse
    {
        $chat = Chat::where('uuid', $id)->firstOrFail();

        $userId = $request->user()->id;

        // Check access
        if ($chat->buyer_id !== $userId && $chat->seller_id !== $userId) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke chat ini',
            ], 403);
        }

        $message = DB::transaction(function () use ($request, $chat, $userId) {
            $message = Message::create([
                'uuid' => NumberGenerator::uuid(),
                'chat_id' => $chat->id,
                'sender_id' => $userId,
                'content' => $request->content,
                'type' => $request->type,
                'offer_price' => $request->offer_price,
            ]);

            if (in_array($request->type, ['image', 'file'], true)) {
                $attachmentType = $request->type;
                $maxItems = $attachmentType === 'image' ? 5 : 1;

                $attachmentRows = collect($request->input('attachment_urls', []))
                    ->take($maxItems)
                    ->values()
                    ->map(fn ($url, $index) => [
                        'type' => $attachmentType,
                        'url' => $url,
                        'sort_order' => $index + 1,
                    ])
                    ->all();

                if (!empty($attachmentRows)) {
                    $message->attachments()->createMany($attachmentRows);
                }
            }

            // Keep chat summary in sync with latest message.
            $chat->update([
                'last_message' => $request->type === 'text' ? $request->content : '[' . $request->type . ']',
                'last_message_at' => now(),
            ]);

            // Increment unread for other user
            $chat->incrementUnreadFor($userId);

            return $message;
        });

        return response()->json([
            'success' => true,
            'message' => 'Pesan terkirim',
            'data' => new MessageResource($message->load(['sender', 'chat', 'attachments'])),
        ]);
    }

    /**
     * Mark chat as read.
     */
    public function markAsRead(string $id, Request $request): JsonResponse
    {
        $chat = Chat::where('uuid', $id)->firstOrFail();

        $userId = $request->user()->id;

        if ($chat->buyer_id !== $userId && $chat->seller_id !== $userId) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke chat ini',
            ], 403);
        }

        $chat->markAsReadFor($userId);

        return response()->json([
            'success' => true,
            'message' => 'Chat ditandai sudah dibaca',
        ]);
    }

    /**
     * Get unread count.
     */
    public function unreadCount(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $count = Chat::where('buyer_id', $userId)
            ->sum('buyer_unread');

        $count += Chat::where('seller_id', $userId)
            ->sum('seller_unread');

        return response()->json([
            'success' => true,
            'data' => ['unreadCount' => $count],
        ]);
    }

    /**
     * Accept offer (for nego price).
     */
    public function acceptOffer(string $chatId, string $messageId, Request $request): JsonResponse
    {
        $chat = Chat::where('uuid', $chatId)->firstOrFail();
        $message = Message::where('uuid', $messageId)->firstOrFail();

        $userId = $request->user()->id;

        // Only seller can accept offer
        if ($chat->seller_id !== $userId) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya penjual yang dapat menerima penawaran',
            ], 403);
        }

        if ($message->type->value !== 'offer' || $message->offer_status->value !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Penawaran tidak valid',
            ], 400);
        }

        $message->acceptOffer();

        // Create system message
        Message::create([
            'uuid' => NumberGenerator::uuid(),
            'chat_id' => $chat->id,
            'sender_id' => $userId,
            'content' => 'Penawaran diterima! Silakan lanjutkan ke pembayaran.',
            'type' => 'system',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Penawaran diterima',
            'data' => new MessageResource($message->fresh()),
        ]);
    }

    /**
     * Reject offer.
     */
    public function rejectOffer(string $chatId, string $messageId, Request $request): JsonResponse
    {
        $chat = Chat::where('uuid', $chatId)->firstOrFail();
        $message = Message::where('uuid', $messageId)->firstOrFail();

        $userId = $request->user()->id;

        // Only seller can reject offer
        if ($chat->seller_id !== $userId) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya penjual yang dapat menolak penawaran',
            ], 403);
        }

        if ($message->type->value !== 'offer' || $message->offer_status->value !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Penawaran tidak valid',
            ], 400);
        }

        $message->rejectOffer();

        Message::create([
            'uuid' => NumberGenerator::uuid(),
            'chat_id' => $chat->id,
            'sender_id' => $userId,
            'content' => 'Penawaran ditolak.',
            'type' => 'system',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Penawaran ditolak',
            'data' => new MessageResource($message->fresh()),
        ]);
    }
}
