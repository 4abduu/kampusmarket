<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * API Resource untuk Message
 */
class MessageResource extends JsonResource
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
            
            // Chat reference
            'chatId' => $this->chat->uuid,
            
            // Sender
            'senderId' => $this->sender->uuid,
            
            // Content
            'content' => $this->content,
            'type' => $this->type->value ?? $this->type,
            
            // Offer (if type = 'offer')
            'offerPrice' => $this->offer_price ? (int) ($this->offer_price / 100) : null,
            'offerStatus' => $this->offer_status?->value ?? $this->offer_status,
            
            // File
            'fileUrl' => $this->file_url,
            
            // Read status
            'isRead' => $this->is_read,
            'readAt' => $this->read_at?->toISOString(),
            
            // Timestamp
            'createdAt' => $this->created_at->toISOString(),
        ];
    }
}
