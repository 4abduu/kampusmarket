<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * API Resource untuk Chat
 */
class ChatResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            // Primary identifier
            'id' => $this->uuid,
            
            // Product reference
            'productId' => $this->product->uuid,
            'product' => new ProductResource($this->whenLoaded('product')),
            
            // Users
            'seller' => new UserResource($this->whenLoaded('seller')),
            'buyer' => new UserResource($this->whenLoaded('buyer')),
            
            // Order reference
            'orderId' => $this->order?->uuid,
            
            // Last message
            'lastMessage' => $this->last_message,
            'lastMessageAt' => $this->last_message_at?->toISOString(),
            
            // Unread counts
            'buyerUnread' => $this->buyer_unread,
            'sellerUnread' => $this->seller_unread,
            
            // Status
            'isActive' => $this->is_active,
        ];
    }

    /**
     * Get chat data for listing.
     */
    public function toListArray(int $currentUserId): array
    {
        $otherUser = $this->getOtherParticipant($currentUserId);
        $unreadCount = $this->getUnreadCountFor($currentUserId);

        return [
            'id' => $this->uuid,
            'product' => (new ProductResource($this->product))->toCardArray(),
            'otherUser' => (new UserResource($otherUser))->toMinimalArray(),
            'lastMessage' => $this->last_message,
            'lastMessageAt' => $this->last_message_at?->toISOString(),
            'unreadCount' => $unreadCount,
            'isActive' => $this->is_active,
        ];
    }
}
