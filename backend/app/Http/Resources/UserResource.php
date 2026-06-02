<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Resource: UserResource [REVISI]
 * Perubahan: tambah isOnline di toArray() dan toMinimalArray()
 */
class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'       => $this->uuid,
            'name'     => $this->name,
            'email'    => $this->email,
            'phone'    => $this->phone ?? '',
            'avatar'   => $this->avatar ?? '',
            'bio'      => $this->bio,
            'location' => $this->location,

            'faculty' => $this->faculty?->code,
            'facultyCode' => $this->faculty?->code,
            'facultyName' => $this->faculty?->name,
            'facultyDetails' => $this->faculty ? [
                'id'   => $this->faculty->code,
                'name' => $this->faculty->name,
            ] : null,

            'isVerified'  => $this->is_verified,
            'isBanned'    => $this->is_banned,
            'banReason'   => $this->ban_reason,
            'isWarned'    => $this->is_warned,
            'warningReason' => $this->warning_reason,
            'warningCount'=> $this->warning_count,
            'role'        => $this->role?->value ?? $this->role,

            'rating'      => (float) $this->rating,
            'reviewCount' => $this->review_count,

            'walletBalance' => $this->wallet_balance,
            'joinedAt'      => $this->joined_at?->format('Y-m-d') ?? $this->created_at->format('Y-m-d'),

            // [BARU] Status online berdasarkan last_seen
            'isOnline'  => $this->isOnline(),
            'lastSeen'  => $this->last_seen?->toISOString(),
            'productsCount' => $this->products()->count(),
        ];
    }

    /**
     * Data minimal untuk chat list, product card, dsb.
     */
    public function toMinimalArray(): array
    {
        return [
            'id'          => $this->uuid,
            'name'        => $this->name,
            'avatar'      => $this->avatar ?? '',
            'faculty'     => $this->faculty?->code,
            'rating'      => (float) $this->rating,
            'reviewCount' => $this->review_count,
            'isVerified'  => $this->is_verified,
            // [BARU] isOnline untuk status di header chat
            'isOnline'    => $this->isOnline(),
            'lastSeen'    => $this->last_seen?->toISOString(),
        ];
    }

    public function toSellerArray(): array
    {
        return [
            'id'          => $this->uuid,
            'name'        => $this->name,
            'avatar'      => $this->avatar ?? '',
            'faculty'     => $this->faculty?->code,
            'facultyCode' => $this->faculty?->code,
            'facultyName' => $this->faculty?->name,
            'rating'      => (float) $this->rating,
            'reviewCount' => $this->review_count,
            'isVerified'  => $this->is_verified,
            'location'    => $this->location,
            'joinedAt'    => $this->joined_at?->format('Y-m-d') ?? $this->created_at->format('Y-m-d'),
            'bio'         => $this->bio,
            'isOnline'    => $this->isOnline(),
            'lastSeen'    => $this->last_seen?->toISOString(),
        ];
    }
}
