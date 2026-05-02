<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * API Resource untuk WalletTransaction
 */
class WalletTransactionResource extends JsonResource
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
            
            // User reference
            'userId' => $this->user->uuid,
            
            // Type
            'type' => $this->type->value ?? $this->type,
            'typeLabel' => $this->type?->label() ?? $this->type,
            'typeIcon' => $this->type?->icon() ?? '',
            'typeColor' => $this->type?->color() ?? 'gray',
            
            // Amount (convert from cent to Rupiah)
            'amount' => (int) $this->amount,
            'balanceBefore' => (int) $this->balance_before,
            'balanceAfter' => (int) $this->balance_after,
            
            // Description
            'description' => $this->description,
            
            // Reference
            'referenceId' => $this->related_order_id ?? $this->related_withdrawal_id,
            
            // Status
            'status' => $this->status->value ?? $this->status,
            
            // Timestamp
            'createdAt' => $this->created_at->toISOString(),
        ];
    }
}
