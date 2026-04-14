<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * API Resource untuk Address
 */
class AddressResource extends JsonResource
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
            'label' => $this->label,
            'recipient' => $this->recipient,
            'phone' => $this->phone ?? $this->user->phone,
            'address' => $this->address,
            'notes' => $this->notes,
            'isPrimary' => $this->is_primary,
            'createdAt' => $this->created_at->format('Y-m-d'),
        ];
    }
}
