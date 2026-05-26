<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\HasUuid;


class PasswordResetOtp extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'uuid',
        'email',
        'otp',
        'expires_at',
        'is_used',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'is_used' => 'boolean',
    ];


    /**
     * Check if OTP is valid.
     */
    public function isValid(): bool
    {
        return !$this->is_used && $this->expires_at->isFuture();
    }

    /**
     * Check if OTP is expired.
     */
    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    /**
     * Mark as used.
     */
    public function markAsUsed(): void
    {
        $this->is_used = true;
        $this->save();
    }

    /**
     * Generate OTP.
     */
    public static function generateOtp(): string
    {
        return str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    /**
     * Check if OTP request is allowed based on rate limiting and exponential backoff.
     * Returns array: ['allowed' => bool, 'cooldown' => int, 'message' => string]
     */
    public static function checkRateLimit(string $email, string $type = 'general', int $maxPerDay = 5): array
    {
        $cacheKey = "otp_limit_{$type}_" . md5($email);
        $data = \Illuminate\Support\Facades\Cache::get($cacheKey, ['attempts' => 0, 'last_sent_at' => null]);
        
        $attempts = $data['attempts'];
        $lastSentAt = $data['last_sent_at'] ? \Carbon\Carbon::parse($data['last_sent_at']) : null;
        
        if ($attempts >= $maxPerDay) {
            return [
                'allowed' => false, 
                'cooldown' => 0, 
                'message' => 'Anda telah mencapai batas maksimal permintaan OTP harian. Silakan coba lagi besok.'
            ];
        }
        
        if ($lastSentAt) {
            // Calculate required cooldown: 1, 2, 4, 8, 16 minutes
            $cooldownMinutes = pow(2, $attempts - 1);
            $nextAllowedAt = $lastSentAt->copy()->addMinutes($cooldownMinutes);
            
            if (now()->lessThan($nextAllowedAt)) {
                $remainingSeconds = now()->diffInSeconds($nextAllowedAt);
                return [
                    'allowed' => false, 
                    'cooldown' => $remainingSeconds, 
                    'message' => "Harap tunggu {$remainingSeconds} detik sebelum mengirim ulang OTP."
                ];
            }
        }
        
        return ['allowed' => true, 'cooldown' => 0];
    }

    /**
     * Record OTP sent to update rate limit cache.
     * Returns the NEXT cooldown in seconds.
     */
    public static function recordOtpSent(string $email, string $type = 'general'): int
    {
        $cacheKey = "otp_limit_{$type}_" . md5($email);
        $data = \Illuminate\Support\Facades\Cache::get($cacheKey, ['attempts' => 0, 'last_sent_at' => null]);
        
        $data['attempts'] += 1;
        $data['last_sent_at'] = now()->toDateTimeString();
        
        // Cache until end of day
        \Illuminate\Support\Facades\Cache::put($cacheKey, $data, now()->endOfDay());
        
        // Return the NEXT cooldown in seconds
        return pow(2, $data['attempts'] - 1) * 60; 
    }

    /**
     * Create or get fresh OTP for email.
     */
    public static function createForEmail(string $email, int $validityMinutes = 10): self
    {
        // Invalidate previous OTPs
        static::where('email', $email)->update(['is_used' => true]);

        return static::create([
            'email' => $email,
            'otp' => static::generateOtp(),
            'expires_at' => now()->addMinutes($validityMinutes),
            'is_used' => false,
        ]);
    }

    /**
     * Verify OTP.
     */
    public static function verify(string $email, string $otp): ?self
    {
        $record = static::where('email', $email)
            ->where('otp', $otp)
            ->where('is_used', false)
            ->first();

        if ($record && $record->isValid()) {
            return $record;
        }

        return null;
    }
}
