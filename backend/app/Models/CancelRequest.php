<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Enums\CancelRequestStatus;
use App\Enums\CancelReason;

class CancelRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'request_number',
        'order_id',
        'requester_id',
        'reason',
        'description',
        'status',
        'admin_notes',
        'rejection_reason',
        'refund_amount',
        'refund_processed',
        'reviewed_at',
        'refunded_at',
    ];

    protected $casts = [
        'refund_amount' => 'integer',
        'refund_processed' => 'boolean',
        'reviewed_at' => 'datetime',
        'refunded_at' => 'datetime',
        'status' => CancelRequestStatus::class,
        'reason' => CancelReason::class,
    ];

    /**
     * Get the order for the cancel request.
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the requester (user).
     */
    public function requester()
    {
        return $this->belongsTo(User::class, 'requester_id');
    }

    /**
     * Get the evidences for the cancel request.
     */
    // public function evidences()
    // {
    //     return $this->hasMany(CancelRequestEvidence::class);
    // }

    /**
     * Get evidence URLs as array.
     */
    // public function getEvidenceUrls(): array
    // {
    //     return $this->evidences->pluck('url')->toArray();
    // }

    /**
     * Generate request number.
     */
    public static function generateRequestNumber(): string
    {
        $date = now()->format('Ymd');
        $random = str_pad(random_int(0, 9999), 4, '0', STR_PAD_LEFT);
        return "CR-{$date}-{$random}";
    }

    /**
     * Approve the request.
     */
    public function approve(int $refundAmount, ?string $adminNotes = null): void
    {
        $this->status = CancelRequestStatus::APPROVED;
        $this->refund_amount = $refundAmount;
        $this->admin_notes = $adminNotes;
        $this->reviewed_at = now();
        $this->save();
    }

    /**
     * Reject the request.
     */
    public function reject(string $rejectionReason, ?string $adminNotes = null): void
    {
        $this->status = CancelRequestStatus::REJECTED;
        $this->rejection_reason = $rejectionReason;
        $this->admin_notes = $adminNotes;
        $this->reviewed_at = now();
        $this->save();
    }

    /**
     * Mark refund as processed.
     */
    public function markRefundProcessed(): void
    {
        $this->refund_processed = true;
        $this->refunded_at = now();
        $this->save();
    }

    /**
     * Check if can be processed.
     */
    public function canBeProcessed(): bool
    {
        return $this->status === CancelRequestStatus::PENDING;
    }
}
