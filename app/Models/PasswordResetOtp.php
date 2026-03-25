<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PasswordResetOtp extends Model
{
    use HasFactory;

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
