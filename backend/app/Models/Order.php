<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\ProductType;
use App\Enums\ShippingType;

class Order extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid',
        'order_number',
        'product_id',
        'product_title',
        'product_type',
        'buyer_id',
        'seller_id',
        'quantity',
        'base_price',
        'nego_price',
        'final_price',
        'shipping_fee',
        'admin_fee_percent',
        'admin_fee_deducted',
        'total_price',
        'net_income',
        'selected_shipping_option_id',
        'shipping_type',
        'shipping_method',
        'shipping_address',
        'shipping_notes',
        'selected_address_id',
        'tracking_number',
        'service_date',
        'service_time',
        'service_deadline',
        'service_notes',
        'offered_price',
        'price_offer_notes',
        'payment_method',
        'payment_status',
        'paid_at',
        'status',
        'cancelled_by_id',
        'cancel_reason',
        'cancelled_at',
        'completed_at',
        'notes',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'base_price' => 'integer',
        'nego_price' => 'integer',
        'final_price' => 'integer',
        'shipping_fee' => 'integer',
        'admin_fee_percent' => 'decimal:2',
        'admin_fee_deducted' => 'integer',
        'total_price' => 'integer',
        'net_income' => 'integer',
        'offered_price' => 'integer',
        'paid_at' => 'datetime',
        'service_date' => 'date',
        'service_time' => 'datetime',
        'service_deadline' => 'datetime',
        'cancelled_at' => 'datetime',
        'completed_at' => 'datetime',
        'status' => OrderStatus::class,
        'payment_status' => PaymentStatus::class,
        'product_type' => ProductType::class,
        'shipping_type' => ShippingType::class,
    ];

    /**
     * Get the product for the order.
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the buyer.
     */
    public function buyer()
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    /**
     * Get the seller.
     */
    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    /**
     * Get the selected address.
     */
    public function selectedAddress()
    {
        return $this->belongsTo(Address::class, 'selected_address_id');
    }

    /**
     * Get the selected shipping option.
     */
    public function selectedShippingOption()
    {
        return $this->belongsTo(ShippingOption::class, 'selected_shipping_option_id');
    }

    /**
     * Get the user who cancelled.
     */
    public function cancelledBy()
    {
        return $this->belongsTo(User::class, 'cancelled_by_id');
    }

    /**
     * Get the history for the order.
     */
    public function history()
    {
        return $this->hasMany(OrderHistory::class);
    }

    /**
     * Get the reviews for the order.
     */
    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    /**
     * Get the cancel requests for the order.
     */
    public function cancelRequests()
    {
        return $this->hasMany(CancelRequest::class);
    }

    // Scopes

    public function scopeByBuyer($query, $buyerId)
    {
        return $query->where('buyer_id', $buyerId);
    }

    public function scopeBySeller($query, $sellerId)
    {
        return $query->where('seller_id', $sellerId);
    }

    public function scopeByStatus($query, OrderStatus $status)
    {
        return $query->where('status', $status);
    }

    public function scopePending($query)
    {
        return $query->where('status', OrderStatus::PENDING);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', OrderStatus::COMPLETED);
    }

    public function scopeCancelled($query)
    {
        return $query->where('status', OrderStatus::CANCELLED);
    }

    // Helper Methods

    /**
     * Generate order number.
     */
    public static function generateOrderNumber(): string
    {
        $date = now()->format('Ymd');
        $random = str_pad(random_int(0, 9999), 4, '0', STR_PAD_LEFT);
        return "KM-{$date}-{$random}";
    }

    /**
     * Check if order can be cancelled.
     */
    public function canBeCancelled(): bool
    {
        return in_array($this->status, [
            OrderStatus::PENDING,
            OrderStatus::WAITING_PRICE,
            OrderStatus::WAITING_CONFIRMATION,
            OrderStatus::WAITING_SHIPPING_FEE,
            OrderStatus::WAITING_PAYMENT,
        ]);
    }

    /**
     * Check if order is completed.
     */
    public function isCompleted(): bool
    {
        return $this->status === OrderStatus::COMPLETED;
    }

    /**
     * Check if order is cancelled.
     */
    public function isCancelled(): bool
    {
        return $this->status === OrderStatus::CANCELLED;
    }

    /**
     * Check if order is for barang.
     */
    public function isBarang(): bool
    {
        return $this->product_type === ProductType::BARANG;
    }

    /**
     * Check if order is for jasa.
     */
    public function isJasa(): bool
    {
        return $this->product_type === ProductType::JASA;
    }

    /**
     * Update status and add history.
     */
    public function updateStatus(OrderStatus $newStatus, ?string $notes = null, ?int $actorId = null): void
    {
        $oldStatus = $this->status;
        $this->status = $newStatus;
        $this->save();

        // Add to history
        $this->history()->create([
            'status' => $newStatus->value,
            'notes' => $notes ?? "Status changed from {$oldStatus->value} to {$newStatus->value}",
            'actor_id' => $actorId,
        ]);
    }

    /**
     * Mark as paid.
     */
    public function markAsPaid(): void
    {
        $this->payment_status = PaymentStatus::PAID;
        $this->paid_at = now();
        $this->save();
    }

    /**
     * Mark as completed.
     */
    public function markAsCompleted(): void
    {
        $this->status = OrderStatus::COMPLETED;
        $this->completed_at = now();
        $this->save();

        // Add to history
        $this->history()->create([
            'status' => OrderStatus::COMPLETED->value,
            'notes' => 'Order completed',
        ]);
    }

    /**
     * Cancel the order.
     */
    public function cancel(string $reason, ?int $cancelledById = null): void
    {
        $this->status = OrderStatus::CANCELLED;
        $this->cancel_reason = $reason;
        $this->cancelled_at = now();
        $this->cancelled_by_id = $cancelledById;
        $this->save();

        // Add to history
        $this->history()->create([
            'status' => OrderStatus::CANCELLED->value,
            'notes' => "Cancelled: {$reason}",
            'actor_id' => $cancelledById,
        ]);
    }

    /**
     * Calculate admin fee.
     */
    public function calculateAdminFee(): int
    {
        return (int) round($this->final_price * ($this->admin_fee_percent / 100));
    }

    /**
     * Get price in Rupiah.
     */
    public function getTotalPriceInRupiah(): float
    {
        return $this->total_price / 100;
    }

    /**
     * Get formatted total price.
     */
    public function getFormattedTotalPrice(): string
    {
        return 'Rp ' . number_format($this->getTotalPriceInRupiah(), 0, ',', '.');
    }
}
