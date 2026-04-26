<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Enums\UserRole;
use Laravel\Sanctum\HasApiTokens;

/**
 * Model: User [REVISI]
 * Perubahan: tambah last_seen di $fillable + $casts, tambah method isOnline()
 */
class User extends Authenticatable
{
    use HasFactory, Notifiable, SoftDeletes, HasApiTokens;

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
        'rating',
        'review_count',
        'wallet_balance',
        'joined_at',
        'last_seen', // [BARU] untuk status online
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
        'wallet_balance' => 'integer',
        'rating' => 'decimal:2',
        'review_count' => 'integer',
        'joined_at' => 'datetime',
        'last_seen' => 'datetime', // [BARU]
        'role' => UserRole::class,
    ];

    /**
     * [BARU] User dianggap Online jika last_seen < 5 menit yang lalu.
     * Logika: setiap request diupdate oleh UpdateLastSeen middleware.
     */
    public function isOnline(): bool
    {
        if (!$this->last_seen) {
            return false;
        }

        return $this->last_seen->diffInMinutes(now()) < 5;
    }

    // ── Relasi ──────────────────────────────────────────────────────────────

    public function faculty()
    {
        return $this->belongsTo(Faculty::class);
    }

    public function addresses()
    {
        return $this->hasMany(Address::class);
    }

    public function primaryAddress()
    {
        return $this->addresses()->where('is_primary', true)->first();
    }

    public function products()
    {
        return $this->hasMany(Product::class, 'seller_id');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class, 'seller_id');
    }

    public function orders()
    {
        return $this->hasMany(Order::class, 'buyer_id');
    }

    public function sellerOrders()
    {
        return $this->hasMany(Order::class, 'seller_id');
    }

    public function walletTransactions()
    {
        return $this->hasMany(WalletTransaction::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function withdrawals()
    {
        return $this->hasMany(Withdrawal::class);
    }
}
