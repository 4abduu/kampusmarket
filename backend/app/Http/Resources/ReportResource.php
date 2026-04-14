<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * API Resource untuk Report
 * 
 * NORMALISASI YANG DITERAPKAN:
 * - evidence: dari tabel report_evidences → array of strings
 */
class ReportResource extends JsonResource
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
            'reportNumber' => $this->report_number,
            
            // Users
            'reporter' => new UserResource($this->whenLoaded('reporter')),
            'reportedUser' => new UserResource($this->whenLoaded('reportedUser')),
            
            // Product (optional)
            'productId' => $this->product?->uuid,
            
            // Report details
            'reason' => $this->reason,
            'description' => $this->description,
            
            // Evidence (1NF - dari tabel terpisah ke array)
            // 'evidence' => $this->getEvidenceUrls(),
            
            // Status
            'status' => $this->status->value ?? $this->status,
            'priority' => $this->priority->value ?? $this->priority,
            
            // Admin notes
            'adminNotes' => $this->admin_notes,
            'resolution' => $this->resolution,
            
            // Timestamps
            'createdAt' => $this->created_at->toISOString(),
            'resolvedAt' => $this->resolved_at?->toISOString(),
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
