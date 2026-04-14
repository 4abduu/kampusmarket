<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * API Resource untuk OrderHistory
 */
class OrderHistoryResource extends JsonResource
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
            'orderId' => $this->order->uuid,
            'status' => $this->status,
            'notes' => $this->notes,
            'actorId' => $this->actor?->uuid,
            'actorName' => $this->actor?->name,
            'createdAt' => $this->created_at->toISOString(),
        ];
    }
}
