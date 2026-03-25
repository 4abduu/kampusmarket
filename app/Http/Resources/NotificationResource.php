<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * API Resource untuk Notification
 */
class NotificationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->uuid,
            'userId' => $this->user->uuid,
            'type' => $this->type->value ?? $this->type,
            'title' => $this->title,
            'message' => $this->message,
            'link' => $this->link,
            'data' => $this->data,
            'isRead' => $this->is_read,
            'readAt' => $this->read_at?->toISOString(),
            'createdAt' => $this->created_at->toISOString(),
        ];
    }
}
