<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * API Resource untuk CancelRequest
 * 
 * NORMALISASI YANG DITERAPKAN:
 * - evidence: dari tabel cancel_request_evidences → array of strings
 */
class CancelRequestResource extends JsonResource
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
            'requestNumber' => $this->request_number,
            
            // Order
            'orderId' => $this->order->uuid,
            'order' => new OrderResource($this->whenLoaded('order')),
            
            // Requester
            'requester' => new UserResource($this->whenLoaded('requester')),
            
            // Reason
            'reason' => $this->reason->value ?? $this->reason,
            'description' => $this->description,
            
            // Evidence (1NF - dari tabel terpisah ke array)
            // 'evidence' => $this->getEvidenceUrls(),
            
            // Status
            'status' => $this->status->value ?? $this->status,
            'adminNotes' => $this->admin_notes,
            'rejectionReason' => $this->rejection_reason,
            
            // Refund
            'refundAmount' => (int) ($this->refund_amount / 100),
            'refundProcessed' => $this->refund_processed,
            
            // Timestamps
            'createdAt' => $this->created_at->toISOString(),
            'reviewedAt' => $this->reviewed_at?->toISOString(),
            'refundedAt' => $this->refunded_at?->toISOString(),
        ];
    }

    /**
     * Get evidence URLs as array.
     */
    // protected function getEvidenceUrls(): array
    // {
    //     if ($this->relationLoaded('evidences')) {
    //         return $this->evidences->pluck('url')->toArray();
    //     }
    //     return [];
    // }
}
