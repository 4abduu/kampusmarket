<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Enums\WithdrawalStatus;
use App\Enums\AccountType;

class Withdrawal extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'withdrawal_number',
        'user_id',
        'amount',
        'total_deduction',
        'account_type',
        'bank_name',
        'account_number',
        'account_name',
        'status',
        'rejection_reason',
        'failure_reason',
        'processed_at',
    ];

    protected $casts = [
        'amount' => 'integer',
        'total_deduction' => 'integer',
        'processed_at' => 'datetime',
        'status' => WithdrawalStatus::class,
        'account_type' => AccountType::class,
    ];

    /**
     * Get the user that owns the withdrawal.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Generate withdrawal number.
     */
    public static function generateWithdrawalNumber(): string
    {
        $date = now()->format('Ymd');
        $random = str_pad(random_int(0, 9999), 4, '0', STR_PAD_LEFT);
        return "WD-{$date}-{$random}";
    }

    /**
     * Scope by status.
     */
    public function scopeByStatus($query, WithdrawalStatus $status)
    {
        return $query->where('status', $status);
    }

    public function scopePending($query)
    {
        return $query->where('status', WithdrawalStatus::PENDING);
    }

    /**
     * Check if can be processed.
     */
    public function canBeProcessed(): bool
    {
        return $this->status === WithdrawalStatus::PENDING 
            || $this->status === WithdrawalStatus::APPROVED;
    }

    /**
     * Approve the withdrawal.
     */
    public function approve(): void
    {
        $this->status = WithdrawalStatus::APPROVED;
        $this->save();
    }

    /**
     * Mark as processing.
     */
    public function markAsProcessing(): void
    {
        $this->status = WithdrawalStatus::PROCESSING;
        $this->save();
    }

    /**
     * Mark as completed.
     */
    public function markAsCompleted(): void
    {
        $this->status = WithdrawalStatus::COMPLETED;
        $this->processed_at = now();
        $this->save();
    }

    /**
     * Reject the withdrawal.
     */
    public function reject(string $reason): void
    {
        $this->status = WithdrawalStatus::REJECTED;
        $this->rejection_reason = $reason;
        $this->save();
    }

    /**
     * Get amount in Rupiah.
     */
    public function getAmountInRupiah(): float
    {
        return $this->amount / 100;
    }

    /**
     * Get formatted amount.
     */
    public function getFormattedAmount(): string
    {
        return 'Rp ' . number_format($this->getAmountInRupiah(), 0, ',', '.');
    }

    /**
     * Get net amount (after deduction).
     */
    public function getNetAmountInCent(): int
    {
        return $this->amount - $this->total_deduction;
    }
}
