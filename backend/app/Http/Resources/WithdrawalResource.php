<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * API Resource untuk Withdrawal
 */
class WithdrawalResource extends JsonResource
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
            'withdrawalNumber' => $this->withdrawal_number,
            
            // User
            'user' => new UserResource($this->whenLoaded('user')),
            
            // Amount (convert from cent to Rupiah)
            'amount' => (int) ($this->amount / 100),
            'totalDeduction' => (int) ($this->total_deduction / 100),
            
            // Account info
            'accountType' => $this->account_type->value ?? $this->account_type,
            'bankName' => $this->bank_name,
            'accountNumber' => $this->account_number,
            'accountName' => $this->account_name,
            
            // Status
            'status' => $this->status->value ?? $this->status,
            'rejectionReason' => $this->rejection_reason,
            'failureReason' => $this->failure_reason,
            
            // Timestamps
            'createdAt' => $this->created_at->toISOString(),
            'processedAt' => $this->processed_at?->toISOString(),
        ];
    }

    /**
     * Get minimal withdrawal data.
     */
    public function toMinimalArray(): array
    {
        return [
            'id' => $this->uuid,
            'withdrawalNumber' => $this->withdrawal_number,
            'amount' => (int) ($this->amount / 100),
            'status' => $this->status->value ?? $this->status,
            'createdAt' => $this->created_at->format('Y-m-d'),
        ];
    }
}
