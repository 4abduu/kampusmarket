<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Resource: ChatResource [REVISI]
 * Perubahan:
 * - toArray() sekarang expose messages
 * - toListArray() expose otherUser.isOnline
 * - tambah canNego di product card
 */
class ChatResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'        => $this->uuid,
            'productId' => $this->product->uuid,
            'product'   => new ProductResource($this->whenLoaded('product')),
            'seller'    => new UserResource($this->whenLoaded('seller')),
            'buyer'     => new UserResource($this->whenLoaded('buyer')),
            'orderId'   => $this->order?->uuid,

            'lastMessage'   => $this->last_message,
            'lastMessageAt' => $this->last_message_at?->toISOString(),

            'buyerUnread'  => $this->buyer_unread,
            'sellerUnread' => $this->seller_unread,
            'isActive'     => $this->is_active,

            // Messages disertakan hanya ketika di-load (show endpoint)
            'messages' => MessageResource::collection($this->whenLoaded('messages')),
        ];
    }

    /**
     * Format ringkas untuk daftar chat (GET /chats)
     */
    public function toListArray(int $currentUserId): array
    {
        $otherUser   = $this->getOtherParticipant($currentUserId);
        $unreadCount = $this->getUnreadCountFor($currentUserId);

        return [
            'id'      => $this->uuid,
            'product' => $this->getProductCardWithNego(),

            'otherUser'     => (new UserResource($otherUser))->toMinimalArray(),
            'lastMessage'   => $this->last_message,
            'lastMessageAt' => $this->last_message_at?->toISOString(),
            'unreadCount'   => $unreadCount,
            'isActive'      => $this->is_active,
        ];
    }

    /**
     * Card produk dengan field canNego agar frontend bisa tampilkan tombol nego.
     */
    private function getProductCardWithNego(): array
    {
        $product      = $this->product;
        $primaryImage = $product->images?->first()?->url ?? '';

        return [
            'id'        => $product->uuid,
            'title'     => $product->title,
            'slug'      => $product->slug,
            'price'     => (int) ($product->price / 100),
            'image'     => $primaryImage,
            'type'      => $product->type->value ?? 'barang',
            'canNego'   => (bool) $product->can_nego,  // [BARU]
            'sellerId'  => $product->seller->uuid,
        ];
    }
}
