<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Enums\UserRole;

class User extends Authenticatable
{
    use HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'uuid',
        'name',
        'email',
        'password',
        'google_id',
        'phone',
        'avatar',
        'bio',
        'location',
        'faculty_id',
        'email_verified_at',
        'is_verified',
        'role',
        'is_banned',
        'ban_reason',
        'is_warned',
        'warning_reason',
        'is_customer_only',
        'rating',
        'review_count',
        'wallet_balance',
        'joined_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'google_id',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_verified' => 'boolean',
        'is_banned' => 'boolean',
        'is_warned' => 'boolean',
        'is_customer_only' => 'boolean',
        'wallet_balance' => 'integer',
        'rating' => 'decimal:2',
        'review_count' => 'integer',
        'joined_at' => 'datetime',
        'role' => UserRole::class,
    ];

    /**
     * Get the faculty that owns the user.
     */
    public function faculty()
    {
        return $this->belongsTo(Faculty::class);
    }

    /**
     * Get the addresses for the user.
     */
    public function addresses()
    {
        return $this->hasMany(Address::class);
    }

    /**
     * Get the primary address for the user.
     */
    public function primaryAddress()
    {
        return $this->addresses()->where('is_primary', true)->first();
    }

    /**
     * Get the products for the user (as seller).
     */
    public function products()
    {
        return $this->hasMany(Product::class, 'seller_id');
    }

    /**
     * Get the orders as buyer.
     */
    public function ordersAsBuyer()
    {
        return $this->hasMany(Order::class, 'buyer_id');
    }

    /**
     * Get the orders as seller.
     */
    public function ordersAsSeller()
    {
        return $this->hasMany(Order::class, 'seller_id');
    }

    /**
     * Get the chats as buyer.
     */
    public function chatsAsBuyer()
    {
        return $this->hasMany(Chat::class, 'buyer_id');
    }

    /**
     * Get the chats as seller.
     */
    public function chatsAsSeller()
    {
        return $this->hasMany(Chat::class, 'seller_id');
    }

    /**
     * Get all chats (buyer + seller).
     */
    public function allChats()
    {
        return Chat::where('buyer_id', $this->id)
            ->orWhere('seller_id', $this->id);
    }

    /**
     * Get the messages sent by the user.
     */
    public function messages()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    /**
     * Get the withdrawals for the user.
     */
    public function withdrawals()
    {
        return $this->hasMany(Withdrawal::class);
    }

    /**
     * Get the wallet transactions for the user.
     */
    public function walletTransactions()
    {
        return $this->hasMany(WalletTransaction::class);
    }

    /**
     * Get the reports made by the user.
     */
    public function reportsBy()
    {
        return $this->hasMany(Report::class, 'reporter_id');
    }

    /**
     * Get the reports against the user.
     */
    public function reportsAgainst()
    {
        return $this->hasMany(Report::class, 'reported_user_id');
    }

    /**
     * Get the notifications for the user.
     */
    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    /**
     * Get the reviews given by the user.
     */
    public function reviewsGiven()
    {
        return $this->hasMany(Review::class, 'reviewer_id');
    }

    /**
     * Get the reviews received by the user.
     */
    public function reviewsReceived()
    {
        return $this->hasMany(Review::class, 'reviewee_id');
    }

    /**
     * Get the cart items for the user.
     */
    public function cartItems()
    {
        return $this->hasMany(Cart::class);
    }

    /**
     * Get the favorites for the user.
     */
    public function favorites()
    {
        return $this->hasMany(Favorite::class);
    }

    /**
     * Get the cancel requests for the user.
     */
    public function cancelRequests()
    {
        return $this->hasMany(CancelRequest::class, 'requester_id');
    }

    /**
     * Get the order history actions.
     */
    public function orderHistory()
    {
        return $this->hasMany(OrderHistory::class, 'actor_id');
    }

    // Helper Methods

    public function isAdmin(): bool
    {
        return $this->role === UserRole::ADMIN;
    }

    public function isBanned(): bool
    {
        return $this->is_banned;
    }

    public function isWarned(): bool
    {
        return $this->is_warned;
    }

    public function isVerifiedUser(): bool
    {
        return $this->is_verified;
    }

    public function isCustomerOnly(): bool
    {
        return $this->is_customer_only;
    }

    public function canSell(): bool
    {
        return !$this->is_customer_only && !$this->is_banned;
    }

    /**
     * Get wallet balance in Rupiah (from cent).
     */
    public function getWalletBalanceInRupiah(): float
    {
        return $this->wallet_balance / 100;
    }

    /**
     * Update wallet balance.
     */
    public function updateWalletBalance(int $amountInCent): void
    {
        $this->wallet_balance = max(0, $this->wallet_balance + $amountInCent);
        $this->save();
    }

    /**
     * Recalculate rating from reviews.
     */
    public function recalculateRating(): void
    {
        $this->rating = $this->reviewsReceived()->avg('rating') ?? 0;
        $this->review_count = $this->reviewsReceived()->count();
        $this->save();
    }
}
