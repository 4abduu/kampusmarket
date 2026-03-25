<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * API Resource untuk User
 * 
 * Mengubah data dari database yang ternormalisasi menjadi format JSON
 * yang sesuai dengan Frontend (camelCase, nested objects).
 * 
 * NORMALISASI YANG DITERAPKAN:
 * - faculty_id → faculty: { id, name, icon, color }
 * - wallet_balance (cent) → walletBalance (Rupiah)
 */
class UserResource extends JsonResource
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
            
            // Basic info
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone ?? '',
            'avatar' => $this->avatar ?? '',
            'bio' => $this->bio,
            'location' => $this->location,
            
            // Faculty (3NF - dari foreign key ke object)
            'faculty' => $this->when($this->faculty, function () {
                return $this->faculty ? $this->faculty->code : null;
            }),
            'facultyDetails' => $this->when($this->faculty, function () {
                return $this->faculty ? [
                    'id' => $this->faculty->code,
                    'name' => $this->faculty->name,
                    'icon' => $this->faculty->icon,
                    'color' => $this->faculty->color,
                ] : null;
            }),
            
            // Verification
            'isVerified' => $this->is_verified,
            'isBanned' => $this->is_banned,
            'banReason' => $this->when($this->is_banned, $this->ban_reason),
            'isWarned' => $this->is_warned,
            'warningReason' => $this->when($this->is_warned, $this->warning_reason),
            
            // Role
            'role' => $this->role->value ?? 'user',
            
            // Stats
            'rating' => (float) $this->rating,
            'reviewCount' => $this->review_count,
            
            // Wallet (convert from cent to Rupiah)
            'walletBalance' => (int) ($this->wallet_balance / 100),
            
            // Flags
            'isCustomerOnly' => $this->is_customer_only,
            
            // Timestamps
            'joinedAt' => $this->joined_at?->format('Y-m-d') ?? $this->created_at->format('Y-m-d'),
            'createdAt' => $this->created_at->format('F Y'),
        ];
    }

    /**
     * Get minimal user data (for nested responses).
     */
    public function toMinimalArray(): array
    {
        return [
            'id' => $this->uuid,
            'name' => $this->name,
            'avatar' => $this->avatar ?? '',
            'faculty' => $this->faculty?->code,
            'rating' => (float) $this->rating,
            'reviewCount' => $this->review_count,
            'isVerified' => $this->is_verified,
        ];
    }

    /**
     * Get seller profile data.
     */
    public function toSellerArray(): array
    {
        return [
            'id' => $this->uuid,
            'name' => $this->name,
            'avatar' => $this->avatar ?? '',
            'faculty' => $this->faculty?->code,
            'rating' => (float) $this->rating,
            'reviewCount' => $this->review_count,
            'isVerified' => $this->is_verified,
            'location' => $this->location,
            'joinedAt' => $this->joined_at?->format('Y-m-d') ?? $this->created_at->format('Y-m-d'),
            'bio' => $this->bio,
        ];
    }
}
