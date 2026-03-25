<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Enums\WalletTransactionType;
use App\Enums\TransactionStatus;

class WalletTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'user_id',
        'type',
        'amount',
        'balance_before',
        'balance_after',
        'description',
        'related_order_id',
        'related_withdrawal_id',
        'status',
    ];

    protected $casts = [
        'amount' => 'integer',
        'balance_before' => 'integer',
        'balance_after' => 'integer',
        'type' => WalletTransactionType::class,
        'status' => TransactionStatus::class,
    ];

    /**
     * Get the user that owns the transaction.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the related order.
     */
    public function relatedOrder()
    {
        return $this->belongsTo(Order::class, 'related_order_id');
    }

    /**
     * Get the related withdrawal.
     */
    public function relatedWithdrawal()
    {
        return $this->belongsTo(Withdrawal::class, 'related_withdrawal_id');
    }

    /**
     * Scope by type.
     */
    public function scopeByType($query, WalletTransactionType $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Check if income.
     */
    public function isIncome(): bool
    {
        return $this->type->isIncome();
    }

    /**
     * Get amount in Rupiah.
     */
    public function getAmountInRupiah(): float
    {
        return $this->amount / 100;
    }

    /**
     * Get formatted amount with sign.
     */
    public function getFormattedAmount(): string
    {
        $sign = $this->isIncome() ? '+' : '-';
        return $sign . 'Rp ' . number_format(abs($this->getAmountInRupiah()), 0, ',', '.');
    }

    /**
     * Create a transaction.
     */
    public static function createTransaction(
        int $userId,
        WalletTransactionType $type,
        int $amountInCent,
        int $balanceBefore,
        int $balanceAfter,
        ?string $description = null,
        ?int $relatedOrderId = null,
        ?int $relatedWithdrawalId = null
    ): self {
        return static::create([
            'user_id' => $userId,
            'type' => $type,
            'amount' => $amountInCent,
            'balance_before' => $balanceBefore,
            'balance_after' => $balanceAfter,
            'description' => $description,
            'related_order_id' => $relatedOrderId,
            'related_withdrawal_id' => $relatedWithdrawalId,
            'status' => TransactionStatus::COMPLETED,
        ]);
    }

    /**
     * Convert to frontend format.
     */
    public function toFrontendFormat(): array
    {
        return [
            'id' => $this->uuid,
            'userId' => $this->user->uuid,
            'type' => $this->type->value,
            'amount' => (int) ($this->amount / 100), // Convert to Rupiah
            'balanceAfter' => (int) ($this->balance_after / 100),
            'description' => $this->description,
            'referenceId' => $this->related_order_id ?? $this->related_withdrawal_id,
            'status' => $this->status->value,
            'createdAt' => $this->created_at->toISOString(),
        ];
    }
}
