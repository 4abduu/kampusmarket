<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Enums\UserRole;
use Illuminate\Validation\Rule;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'avatar',
        'faculty_id',
        'major',
        'role',
        'is_verified',
        'is_banned',
        'is_warned',
        'warning_count',
        'ban_reason',
        'wallet_balance',
        'google_id',
        'rating',
        'review_count',
        'joined_at',
        'last_seen', // [BARU] Waktu terakhir user aktif
        'wallet_pin',
        'has_overdue_debt',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'wallet_pin',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_verified' => 'boolean',
        'is_banned' => 'boolean',
        'is_warned' => 'boolean',
        'warning_count' => 'integer',
        'wallet_balance' => 'integer',
        'rating' => 'decimal:2',
        'review_count' => 'integer',
        'joined_at' => 'datetime',
        'last_seen' => 'datetime',
        'has_overdue_debt' => 'boolean',
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

    /**
     * Get the avatar URL.
     */
    public function getAvatarAttribute($value)
    {
        if (!$value) {
            return null;
        }

        if (filter_var($value, FILTER_VALIDATE_URL)) {
            return $value;
        }

        // Clean leading slash
        $cleanPath = ltrim($value, '/');

        // Check if it already starts with 'storage/'
        if (str_starts_with($cleanPath, 'storage/')) {
            return asset($cleanPath);
        }

        return asset('storage/' . $cleanPath);
    }

    protected static function booted(): void
    {
        static::saving(function (self $user) {
            if (($user->role?->value ?? $user->role) === UserRole::ADMIN->value) {
                $user->faculty_id = null;
            }
        });
    }

    /**
     * Build validation rules for faculty_id that keep the admin account
     * detached from any faculty record.
     */
    public static function facultyIdRules(?string $role = null, bool $required = false): array
    {
        $rules = [
            $required ? 'required' : 'nullable',
            'string',
            Rule::exists('faculties', 'code')
                ->where(fn ($query) => $query->where('is_active', true)->where('code', '!=', 'admin')),
        ];

        if ($role === UserRole::ADMIN->value) {
            $rules[0] = 'nullable';
        }

        return $rules;
    }

    public static function normalizeFacultyIdForRole(?string $role, ?string $facultyCode): ?string
    {
        return $role === UserRole::ADMIN->value ? null : $facultyCode;
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
        return $this->hasOne(Address::class)->where('is_primary', true);
    }

    public function getAvatarUrlAttribute()
    {
        if ($this->avatar) {
            return asset('storage/avatars/' . $this->avatar);
        }

        return 'https://ui-avatars.com/api/?name=' . urlencode($this->name) . '&color=7F9CF5&background=EBF4FF';
    }

    public function products()
    {
        return $this->hasMany(Product::class, 'seller_id');
    }

    public function orders()
    {
        return $this->hasMany(Order::class, 'buyer_id');
    }

    public function codInvoices()
    {
        return $this->hasMany(CodInvoice::class, 'user_id');
    }

    public function sellerOrders()
    {
        return $this->hasMany(Order::class, 'seller_id');
    }

    public function carts()
    {
        return $this->hasMany(Cart::class);
    }

    public function favorites()
    {
        return $this->belongsToMany(Product::class, 'favorites', 'user_id', 'product_id')->withTimestamps();
    }

    public function messages()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function unreadMessagesCount()
    {
        return $this->messages()->where('is_read', false)->where('sender_id', '!=', $this->id)->count();
    }

    public function unreadNotificationsCount()
    {
        return $this->notifications()->whereNull('read_at')->count();
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class, 'reviewee_id');
    }

    public function recalculateRating(): void
    {
        $avg = $this->reviews()->avg('rating');
        $count = $this->reviews()->count();

        $this->update([
            'rating' => $avg ? round($avg, 1) : 0,
            'review_count' => $count,
        ]);
    }

    public function withdrawals()
    {
        return $this->hasMany(Withdrawal::class);
    }

    public function walletTransactions()
    {
        return $this->hasMany(WalletTransaction::class);
    }

    public function isBanned(): bool
    {
        return $this->is_banned;
    }

    public function isSuspended(): bool
    {
        return $this->warning_count >= 3;
    }

    public function canSell(): bool
    {
        return !$this->isBanned() && !$this->isSuspended() && !$this->has_overdue_debt;
    }
}
